import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const teamId = req.nextUrl.searchParams.get('teamId');
  
  if (!token) {
    return NextResponse.json({ error: 'No API token' }, { status: 401 });
  }

  try {
    let url = 'https://api.vercel.com/v9/projects';
    if (teamId) url += `?teamId=${teamId}`;
    
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    const project = data.projects?.[0];
    
    const domains = project?.domains?.map((d: string) => ({ name: d, verified: true })) || [];
    
    return NextResponse.json({ domains });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { domain, teamId } = await req.json();
  
  if (!token) return NextResponse.json({ error: 'No API token' }, { status: 401 });
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });

  try {
    let projectsUrl = 'https://api.vercel.com/v9/projects';
    if (teamId) projectsUrl += `?teamId=${teamId}`;
    
    const projectsRes = await fetch(projectsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    const projectsData = await projectsRes.json();
    const project = projectsData.projects?.[0];
    
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 404 });
    
    const addUrl = `https://api.vercel.com/v9/projects/${project.id}/domains${teamId ? `?teamId=${teamId}` : ''}`;
    const addRes = await fetch(addUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: domain })
    });
    
    if (addRes.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const { domain, teamId } = await req.json();
  
  if (!token) return NextResponse.json({ error: 'No API token' }, { status: 401 });
  if (!domain) return NextResponse.json({ error: 'Domain required' }, { status: 400 });

  try {
    let projectsUrl = 'https://api.vercel.com/v9/projects';
    if (teamId) projectsUrl += `?teamId=${teamId}`;
    
    const projectsRes = await fetch(projectsUrl, { headers: { 'Authorization': `Bearer ${token}` } });
    const projectsData = await projectsRes.json();
    const project = projectsData.projects?.[0];
    
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 404 });
    
    const deleteUrl = `https://api.vercel.com/v9/projects/${project.id}/domains/${domain}${teamId ? `?teamId=${teamId}` : ''}`;
    const deleteRes = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (deleteRes.ok) return NextResponse.json({ success: true });
    return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove domain' }, { status: 500 });
  }
}
