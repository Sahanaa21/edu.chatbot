// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface Chunk {
    text: string;
    embedding?: number[]; // optional — only set when embeddings are available
}

// Retrieve top-k by cosine similarity (when embeddings available)
export function retrieveTopK(queryEmbedding: number[], chunks: Chunk[], k = 4): Chunk[] {
    const scored = chunks
        .filter(c => c.embedding && c.embedding.length > 0)
        .map(chunk => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding!) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map(item => item.chunk);
    return scored;
}

/**
 * Keyword-based BM25-style retrieval — no embedding API calls needed.
 * Works by scoring chunks by term-frequency of query words.
 */
export function retrieveTopKByKeyword(query: string, chunks: Chunk[], k = 5): Chunk[] {
    const queryTerms = query
        .toLowerCase()
        .split(/\W+/)
        .filter(t => t.length > 2);

    if (queryTerms.length === 0) return chunks.slice(0, k);

    // Simple IDF approximation: penalise terms appearing in most chunks
    const docFreq: Record<string, number> = {};
    for (const chunk of chunks) {
        const words = new Set(chunk.text.toLowerCase().split(/\W+/));
        for (const term of queryTerms) {
            if (words.has(term)) docFreq[term] = (docFreq[term] || 0) + 1;
        }
    }

    const N = chunks.length;
    const scored = chunks.map(chunk => {
        const words = chunk.text.toLowerCase().split(/\W+/);
        const wordCount = words.length || 1;
        const termFreq: Record<string, number> = {};
        for (const w of words) termFreq[w] = (termFreq[w] || 0) + 1;

        let score = 0;
        for (const term of queryTerms) {
            const tf = (termFreq[term] || 0) / wordCount;
            const df = docFreq[term] || 0;
            const idf = df > 0 ? Math.log((N + 1) / df) : 0;
            score += tf * idf;
        }
        return { chunk, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map(item => item.chunk);
}

// Split text into overlapping chunks of ~targetWords words
export function chunkText(text: string, targetWords = 200, overlap = 40): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    let i = 0;
    while (i < words.length) {
        const chunk = words.slice(i, i + targetWords).join(" ");
        if (chunk.trim()) chunks.push(chunk);
        i += targetWords - overlap;
    }
    return chunks;
}
