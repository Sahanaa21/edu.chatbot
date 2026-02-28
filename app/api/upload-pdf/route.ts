import { chunkText } from "@/lib/rag";
import { getDocumentProxy, extractText } from "unpdf";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("pdf") as File | null;

        if (!file) {
            return Response.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== "application/pdf") {
            return Response.json({ error: "Only PDF files are supported" }, { status: 400 });
        }

        // Parse PDF text
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const pdf = await getDocumentProxy(buffer);
        const { text: rawText, totalPages } = await extractText(pdf, { mergePages: true });

        if (!rawText || !rawText.trim()) {
            return Response.json(
                { error: "Could not extract text. Make sure the PDF is not a scanned image." },
                { status: 400 }
            );
        }

        // Chunk the text — NO embedding calls (avoids quota issues)
        const textChunks = chunkText(rawText, 200, 40);

        if (textChunks.length === 0) {
            return Response.json({ error: "PDF appears to be empty." }, { status: 400 });
        }

        // Return chunks WITHOUT embeddings — RAG uses keyword search instead
        const chunks = textChunks.map((text) => ({ text }));

        return Response.json({
            chunks,
            fileName: file.name,
            pageCount: totalPages,
            charCount: rawText.length,
            chunkCount: chunks.length,
        });
    } catch (err) {
        console.error("PDF upload error:", err);
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: `Failed to process PDF: ${message}` }, { status: 500 });
    }
}
