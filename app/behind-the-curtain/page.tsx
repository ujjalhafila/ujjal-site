import { getBehindSections } from "../../lib/notion";
import { markdownToHtml } from "../../lib/markdown";
import BehindContent from "./BehindContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Behind the Curtain",
  description: "How I process things — the unfiltered version.",
};
export const revalidate = 60;

export default async function BehindTheCurtainPage() {
  let offScreenHtml = "";
  try {
    const sections = await getBehindSections();
    if (sections) {
      const offScreen = sections.find(s => s.section === "photos");
      if (offScreen?.markdown) {
        offScreenHtml = markdownToHtml(offScreen.markdown);
      }
    }
  } catch { /* fallback to placeholders */ }

  return <BehindContent offScreenHtml={offScreenHtml || undefined} />;
}
