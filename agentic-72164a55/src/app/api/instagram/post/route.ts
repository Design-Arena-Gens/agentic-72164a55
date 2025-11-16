export async function POST(request: Request) {
  const { igUserId, accessToken, videoUrl, caption } = await request.json();
  if (!igUserId || !accessToken || !videoUrl) {
    return new Response(JSON.stringify({ error: 'Missing igUserId/accessToken/videoUrl' }), { status: 400 });
  }

  try {
    // 1) Create media container
    const createRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ media_type: 'REELS', video_url: videoUrl, caption, access_token: accessToken })
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
      return new Response(JSON.stringify({ error: 'IG create failed', details: createJson }), { status: 500 });
    }

    // 2) Publish container
    const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: createJson.id, access_token: accessToken })
    });
    const publishJson = await publishRes.json();
    if (!publishRes.ok) {
      return new Response(JSON.stringify({ error: 'IG publish failed', details: publishJson }), { status: 500 });
    }

    return Response.json({ ok: true, id: publishJson.id });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}
