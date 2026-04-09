import { NextRequest, NextResponse } from "next/server";

// In-memory store for comments (resets on cold start — works great on Vercel serverless)
// For persistence, swap this with a Supabase/PlanetScale call using the same interface
const store: Record<string, Array<{ id: string; name: string; body: string; createdAt: string }>> = {};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  return NextResponse.json({ comments: store[slug] || [] });
}

export async function POST(req: NextRequest) {
  const { slug, name, body } = await req.json();
  if (!slug || !name?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const comment = { id: crypto.randomUUID(), name: name.trim().slice(0, 80), body: body.trim().slice(0, 1000), createdAt: new Date().toISOString() };
  if (!store[slug]) store[slug] = [];
  store[slug].push(comment);
  return NextResponse.json({ comment }, { status: 201 });
}
