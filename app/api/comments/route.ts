import { NextRequest, NextResponse } from "next/server";

// Lazy-init: don't crash at build time if env vars aren't set yet
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ comments: [] });

  const supabase = getClient();
  if (!supabase) return NextResponse.json({ comments: [] });

  const { data, error } = await supabase
    .from("comments")
    .select("id, name, body, created_at")
    .eq("slug", slug)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Comments GET error:", error.message);
    return NextResponse.json({ comments: [] });
  }

  const mapped = (data ?? []).map((r: any) => ({ id: r.id, name: r.name, body: r.body, createdAt: r.created_at }));
  return NextResponse.json({ comments: mapped });
}

export async function POST(req: NextRequest) {
  const { slug, name, body } = await req.json();
  if (!slug || !name?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = getClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ slug, name: name.trim().slice(0, 80), body: body.trim().slice(0, 1000) })
    .select("id, name, body, created_at")
    .single();

  if (error) {
    console.error("Comments POST error:", error.message);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  const c = data as any;
  const comment = { id: c.id, name: c.name, body: c.body, createdAt: c.created_at };
  return NextResponse.json({ comment }, { status: 201 });
}
