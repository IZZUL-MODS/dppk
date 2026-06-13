import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), ".vercel-token");

function getToken(): string | null {
  // Cek environment variable dulu
  if (process.env.VERCEL_TOKEN) {
    return process.env.VERCEL_TOKEN;
  }
  
  // Cek file token
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return fs.readFileSync(TOKEN_FILE, "utf-8").trim();
    }
  } catch (error) {
    console.error("Failed to read token file:", error);
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const token = getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: "Vercel token not configured. Please add your token in the dashboard." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectName = formData.get("projectName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!projectName || !projectName.trim()) {
      return NextResponse.json({ error: "Project name required" }, { status: 400 });
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json({ error: "File must be ZIP format" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });
    }

    const cleanName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const finalName = cleanName || `project-${Date.now()}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const vercelFormData = new FormData();
    const blob = new Blob([buffer], { type: "application/zip" });
    vercelFormData.append("file", blob, `${finalName}.zip`);
    vercelFormData.append("projectSettings", JSON.stringify({
      name: finalName,
      framework: "nextjs",
    }));

    const vercelResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: vercelFormData,
    });

    if (!vercelResponse.ok) {
      const errorText = await vercelResponse.text();
      console.error("Vercel API error:", vercelResponse.status, errorText);
      return NextResponse.json(
        { error: `Deployment failed: ${vercelResponse.status}` },
        { status: vercelResponse.status }
      );
    }

    const result = await vercelResponse.json();

    return NextResponse.json({
      success: true,
      url: `https://${finalName}.vercel.app`,
      projectId: result.projectId || result.id,
      deployId: result.uid || result.id,
    });

  } catch (error: any) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
