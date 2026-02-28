import { google } from "@ai-sdk/google";
import { embed } from "ai";

export async function POST(req: Request) {
    try {
        const { query } = await req.json() as { query: string };
        const { embedding } = await embed({
            model: google.textEmbeddingModel("gemini-embedding-001"),
            value: query,
        });
        return Response.json({ embedding });
    } catch (err) {
        console.error("Embed error:", err);
        return Response.json({ error: "Failed to generate embedding" }, { status: 500 });
    }
}
