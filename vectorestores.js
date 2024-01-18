import { print } from "./util.js";
// Vectore Store Ingestion

// STEP - 1  Import and Create Embedding

import { OpenAIEmbeddings } from "@langchain/openai";

const embb = new OpenAIEmbeddings();

//print(await embb.embedQuery("This is some sample text"));


// E.g. Consine similarity -- Different Type of Information

import { similarity } from "ml-distance";

const vector1 = await embb.embedQuery("What are vectors useful for in machine learning?");
const unrelated_vector = await embb.embedQuery("A group of parrots is called a pademonium.");

print(similarity.cosine(vector1, unrelated_vector));

// E.g. Consine similarity -- Related of Information

const simlarVect = await embb.embedQuery("Vectors are representation of information");

print(similarity.cosine(vector1, simlarVect));

// STEP -2 Create VectorStore and Load PDF Document in the store

import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
    RecursiveCharacterTextSplitter
} from "langchain/text_splitter";

const loader = new PDFLoader("./data/Verafin-answers.pdf");

const rawDocs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 128,
    chunkOverlap: 0
});

const splitDocs = await splitter.splitDocuments(rawDocs);

print(splitDocs); // Return Split Document array

import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorStore = new MemoryVectorStore(embb);

print("Loading Documents into VectorStore");
await vectorStore.addDocuments(splitDocs); //Returns nothing

// E.g. Retrieve Docs similar to Query
const retrievedDocs = await vectorStore.similaritySearch("What do you know about this person?", 4);

const pageContents = retrievedDocs.map(doc => doc.pageContent);

// This is Context for the query
print(pageContents);

// STEP 3- Create Retriever 
const retriever = vectorStore.asRetriever();
print(await retriever.invoke("Who is Narendra modi?"));



