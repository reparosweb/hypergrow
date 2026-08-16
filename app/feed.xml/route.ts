import { blogPosts } from "@/lib/blog-posts";
import { SITE_URL, BRAND } from "@/lib/seo";

/* Feed RSS 2.0 do blog — rota estática, gerada no build (sem `dynamic`, sem
 * ler request/cookies/headers). Fonte única dos posts é lib/blog-posts.ts,
 * a mesma que alimenta /blog e /blog/[slug] — um post novo aparece aqui sem
 * precisar tocar neste arquivo. */

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 (o formato que o RSS 2.0 exige para pubDate). */
function rfc822(dateIso: string): string {
  return new Date(`${dateIso}T12:00:00`).toUTCString();
}

export async function GET() {
  const sorted = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  const items = sorted
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${rfc822(post.date)}</pubDate>
      <guid isPermaLink="true">${url}</guid>
    </item>`;
    })
    .join("\n");

  const lastBuildDate = sorted.length > 0 ? rfc822(sorted[0].date) : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(BRAND)}</title>
    <link>${SITE_URL}</link>
    <description>Guias práticos sobre criação de site, e-commerce, tráfego, SEO, IA e automação — pelo blog da ${escapeXml(BRAND)}.</description>
    <language>pt-br</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
