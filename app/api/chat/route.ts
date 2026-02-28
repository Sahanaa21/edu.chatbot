import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { buildSystemPrompt, buildRagPrompt, type StudentProfile } from "@/lib/prompts";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const body = await req.json() as {
            messages: UIMessage[];
            studentProfile: StudentProfile | null;
            ragChunks?: string[];
            imageBase64?: string;
            imageMime?: string;
        };

        const { messages, studentProfile, ragChunks, imageBase64, imageMime } = body;

        const systemPrompt =
            buildSystemPrompt(studentProfile) +
            (ragChunks?.length ? buildRagPrompt(ragChunks) : "");

        // Convert UIMessages to model-compatible messages (must be awaited in v6)
        const modelMessages = await convertToModelMessages(messages);

        // If an image was sent, inject it into the last user message
        if (imageBase64 && imageMime && modelMessages.length > 0) {
            const last = modelMessages[modelMessages.length - 1];
            if (last.role === "user") {
                const textParts = Array.isArray(last.content)
                    ? last.content
                    : [{ type: "text" as const, text: String(last.content) }];
                modelMessages[modelMessages.length - 1] = {
                    ...last,
                    content: [
                        ...textParts,
                        {
                            type: "image" as const,
                            image: `data:${imageMime};base64,${imageBase64}`,
                        },
                    ],
                };
            }
        }

        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: systemPrompt,
            messages: modelMessages,
            temperature: 0.7,
            maxOutputTokens: 4096,
        });

        return result.toUIMessageStreamResponse();
    } catch (err) {
        console.error("Chat route error:", err);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
