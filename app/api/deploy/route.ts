import { NextRequest, NextResponse } from 'next/server';

// Konfigurasi untuk Next.js 14
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

export async function POST(request: NextRequest) {
  try {
    // Cek token
    if (!VERCEL_TOKEN) {
      return NextResponse.json(
        { error: 'Server configuration: VERCEL_TOKEN missing' },
        { status: 500 }
      );
    }

    // Ambil form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectName = formData.get('projectName') as string;

    // Validasi input
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!projectName || !projectName.trim()) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'File must be ZIP format' },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Bersihkan project name
    const cleanName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const finalName = cleanName || `project-${Date.now()}`;

    // Baca file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Siapkan form data untuk Vercel API
    const vercelFormData = new FormData();
    const blob = new Blob([buffer], { type: 'application/zip' });
    vercelFormData.append('file', blob, `${finalName}.zip`);
    vercelFormData.append('projectSettings', JSON.stringify({
      name: finalName,
      framework: 'nextjs',
    }));

    // Panggil Vercel API
    const vercelResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
      body: vercelFormData,
    });

    if (!vercelResponse.ok) {
      const errorText = await vercelResponse.text();
      console.error('Vercel API error:', vercelResponse.status, errorText);
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
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
        }
