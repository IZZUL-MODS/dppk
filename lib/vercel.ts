// Server-side only!
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_DOMAIN = process.env.VERCEL_DOMAIN || 'vercel.app';

export interface DeployResponse {
  url: string;
  projectId: string;
  deployId: string;
  projectName: string;
}

// Deploy ke Vercel
export async function deployToVercel(
  zipBuffer: Buffer,
  projectName: string
): Promise<DeployResponse> {
  if (!VERCEL_TOKEN) {
    throw new Error("VERCEL_TOKEN is not configured");
  }

  // Bersihkan project name (hanya huruf kecil, angka, dan dash)
  const cleanName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  
  const finalName = cleanName || `project-${Date.now()}`;

  // Buat FormData untuk upload
  const formData = new FormData();
  const blob = new Blob([zipBuffer], { type: "application/zip" });
  formData.append("file", blob, `${finalName}.zip`);
  
  // Project settings
  const projectSettings = {
    name: finalName,
    framework: "nextjs",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    installCommand: "npm install",
  };
  
  formData.append("projectSettings", JSON.stringify(projectSettings));

  // Build URL API
  let apiUrl = "https://api.vercel.com/v13/deployments";
  const params = new URLSearchParams();
  
  if (VERCEL_TEAM_ID) {
    params.append("teamId", VERCEL_TEAM_ID);
  }
  
  if (params.toString()) {
    apiUrl += `?${params.toString()}`;
  }

  // Panggil Vercel API
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VERCEL_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = `Deployment failed: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();
  
  // URL vercel.app
  const deployUrl = `https://${finalName}.${VERCEL_DOMAIN}`;

  return {
    url: deployUrl,
    projectId: result.projectId || result.project_id,
    deployId: result.uid,
    projectName: finalName,
  };
}

// Cek validitas token
export async function checkVercelToken(): Promise<boolean> {
  if (!VERCEL_TOKEN) return false;
  
  try {
    const response = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
      }
