import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embb = new OpenAIEmbeddings();

import {
    RecursiveCharacterTextSplitter
} from "langchain/text_splitter";

import { print } from "../util.js";

const loader = new PDFLoader("./data/Verafin-answers.pdf");

const rawDocs = await loader.load();

export const loadAndSplitChunks = async (spec) => { 
    const splitter = new RecursiveCharacterTextSplitter(spec); 
    return await splitter.splitDocuments(rawDocs); 
}

export const initializeVectorstoreWithDocuments = async ({documents}) => {
    const vectorStore = new MemoryVectorStore(embb);
    //print("Initializing Documents into VectorStore");
    await vectorStore.addDocuments(documents); //Returns nothing
    return vectorStore;
};

