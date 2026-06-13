import { NextRequest, NextResponse } from "next/server";
import { deployToVercel, checkVercelToken } from "@/lib/vercel";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    // 1. Cek token
    const isTokenValid = await checkVercelToken();
    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 2. Parse form data
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    // 3. Validasi file
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // 4. Validasi tipe file
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "File must be a ZIP archive" },
        { status: 400 }
      );
    }

    // 5. Validasi ukuran
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // 6. Validasi project name
    const projectName = formData.get("projectName") as string | null;
    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    if (projectName.length > 100) {
      return NextResponse.json(
        { error: "Project name too long (max 100 characters)" },
        { status: 400 }
      );
    }

    // 7. Baca file
    const buffer = Buffer.from(await file.arrayBuffer());

    // 8. Deploy
    const result = await deployToVercel(buffer, projectName);
    
    // 9. Return hasil
    return NextResponse.json({
      success: true,
      url: result.url,
      projectId: result.projectId,
      deployId: result.deployId,
      projectName: result.projectName,
    });
    
  } catch (error: any) {
    console.error("Deploy error:", error);
    
    let errorMessage = "Deployment failed. Please try again.";
    if (error.message?.includes("rate limit")) {
      errorMessage = "Rate limit exceeded. Please wait a moment.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
    maxBodySize: "50mb",
  },
};
