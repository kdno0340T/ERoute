import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "data", "destinations.json"), "utf8");
    return new Response(file, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "Destination data is unavailable." }, { status: 500 });
  }
}
