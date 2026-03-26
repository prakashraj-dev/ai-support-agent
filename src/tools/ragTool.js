import { DynamicTool } from 'langchain/tools';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Chroma } from '@langchain/community/vectorstores/chroma';

let vectorStore = null;

async function getVectorStore() {
  if (!vectorStore) {
    vectorStore = await Chroma.fromExistingCollection(
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'embedding-001',
      }),
      {
        collectionName: 'support-docs',
        url: 'http://localhost:8000',
      }
    );
  }
  return vectorStore;
}

export const ragTool = new DynamicTool({
  name: 'search_knowledge_base',
  description:
    'Use this for general questions about products, return policy, shipping, password reset, business hours, free trial, or any FAQ. Input should be the user question.',
  func: async (query) => {
    try {
      const store = await getVectorStore();
      const results = await store.similaritySearchWithScore(query, 3);

      if (results.length === 0) {
        return 'No relevant information found in the knowledge base.';
      }

      const bestScore = results[0][1];
      if (bestScore < 0.3) {
        return 'I could not find a confident answer. Please contact support@example.com.';
      }

      return results
        .map(
          ([doc, score], i) =>
            `Source ${i + 1} (relevance: ${(score * 100).toFixed(0)}%):\n${doc.pageContent}`
        )
        .join('\n\n');
    } catch (error) {
      console.error('RAG tool error:', error);
      return 'Error searching knowledge base. Please try again.';
    }
  },
});