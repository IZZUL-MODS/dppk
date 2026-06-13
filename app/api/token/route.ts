import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path untuk menyimpan token (sementara, di production pake database)
const TOKEN_FILE = path.join(process.cwd(), ".vercel-token");

export async function GET() {
  try {
    const hasToken = fs.existsSync(TOKEN_FILE);
    return NextResponse.json({ hasToken });
  } catch (error) {
    return NextResponse.json({ hasToken: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Simpan token ke file
    fs.writeFileSync(TOKEN_FILE, token);
    
    // Set environment variable untuk proses saat ini
    process.env.VERCEL_TOKEN = token;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save token" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      fs.unlinkSync(TOKEN_FILE);
    }
    delete process.env.VERCEL_TOKEN;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete token" },
      { status: 500 }
    );
  }
}
