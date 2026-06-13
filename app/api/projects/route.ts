import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const teamId = req.nextUrl.searchParams.get('teamId');
  
  if (!token) {
    return NextResponse.json({ error: 'No API token' }, { status: 401 });
  }

  try {
    let url = 'https://api.vercel.com/v6/deployments?limit=20';
    if (teamId) url += `&teamId=${teamId}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    const deployments = (data.deployments || []).map((d: any) => ({
      id: d.uid,
      name: d.name,
      url: d.url,
      state: d.readyState || d.state,
      created: d.created
    }));
    
    return NextResponse.json({ deployments });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
