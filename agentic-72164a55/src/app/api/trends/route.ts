import Parser from 'rss-parser';

export const revalidate = 3600; // cache for an hour

export async function GET() {
  const parser = new Parser();
  const feed = await parser.parseURL('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en');
  const titles = (feed.items || []).slice(0, 30).map(i => i.title || '').filter(Boolean);

  // Extract concise topics (first phrase before dash or colon)
  const topics = Array.from(new Set(titles.map(t => t.split(' - ')[0].split(':')[0]))).slice(0, 15);

  return Response.json({ topics });
}
