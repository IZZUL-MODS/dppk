import { NextRequest, NextResponse } from "next/server";

// Konfigurasi untuk body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Cek token
    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: "Server configuration: VERCEL_TOKEN missing" },
        { status: 500 }
      );
    }

    // Ambil form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectName = formData.get("projectName") as string;

    // Validasi input
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "File must be ZIP format" },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // Bersihkan project name
    const cleanName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const finalName = cleanName || `project-${Date.now()}`;

    // Siapkan form data untuk Vercel API
    const vercelFormData = new FormData();
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([fileBuffer], { type: "application/zip" });
    vercelFormData.append("file", blob, `${finalName}.zip`);

    const projectSettings = {
      name: finalName,
      framework: "nextjs",
    };
    vercelFormData.append("projectSettings", JSON.stringify(projectSettings));

    // Panggil Vercel API
    const vercelResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
      },
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
    const deployUrl = `https://${finalName}.vercel.app`;

    return NextResponse.json({
      success: true,
      url: deployUrl,
      projectId: result.projectId || result.id,
      deployId: result.uid || result.id,
      message: "Deployment successful",
    });

  } catch (error: any) {
    console.error("Deploy error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
        }
