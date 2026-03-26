import 'dotenv/config';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Chroma } from '@langchain/community/vectorstores/chroma';

console.log('Starting ingestion...');

const loader = new DirectoryLoader('./knowledge-base', {
  '.txt': (path) => new TextLoader(path),
});

const docs = await loader.load();
console.log(`Loaded ${docs.length} documents`);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const chunks = await splitter.splitDocuments(docs);
console.log(`Split into ${chunks.length} chunks`);

await Chroma.fromDocuments(chunks, new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: 'embedding-001',
}), {
  collectionName: 'support-docs',
  url: 'http://localhost:8000',
});

console.log('Ingestion complete! ChromaDB is ready.');