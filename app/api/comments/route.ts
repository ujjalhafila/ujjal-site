import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ comments: [] });

  const { data, error } = await supabase
    .from("comments")
    .select("id, name, body, created_at")
    .eq("slug", slug)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Comments GET error:", error.message);
    return NextResponse.json({ comments: [] });
  }

  return NextResponse.json({ comments: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { slug, name, body } = await req.json();

  if (!slug || !name?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const clean = {
    slug,
    name: name.trim().slice(0, 80),
    body: body.trim().slice(0, 1000),
  };

  const { data, error } = await supabase
    .from("comments")
    .insert(clean)
    .select("id, name, body, created_at")
    .single();

  if (error) {
    console.error("Comments POST error:", error.message);
    return NextResponse.json({ error: "Failed to save comment" }, { status: 500 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}
