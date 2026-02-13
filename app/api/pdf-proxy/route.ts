import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PDF_HOSTS = new Set([
  "fra1.digitaloceanspaces.com",
  "isce-image.fra1.digitaloceanspaces.com",
  "isce-image.fra1.cdn.digitaloceanspaces.com",
]);

export async function GET(req: NextRequest) {
  const encodedUrl = req.nextUrl.searchParams.get("url");
  if (!encodedUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(encodedUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!ALLOWED_PDF_HOSTS.has(targetUrl.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(targetUrl.toString(), { cache: "no-store" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Failed to fetch PDF (${upstream.status})` },
        { status: upstream.status || 502 },
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") || "application/pdf",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 502 });
  }
}
