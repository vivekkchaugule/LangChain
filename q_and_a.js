import { loadAndSplitChunks, initializeVectorstoreWithDocuments } from "./lib/helpers.js";
import { print } from "./util.js";

const splitDocs = await loadAndSplitChunks({
    chunkSize: 1536,
    chunkOverlap: 128
});

const vectorstore = await initializeVectorstoreWithDocuments({
  documents: splitDocs,
});

const retriever = vectorstore.asRetriever();
print(await retriever.invoke("How is the person?"));

// Document Rerieval in Chain

import {RunnableSequence} from "@langchain/core/runnables";

// Simple Mapper (Extracts Page content and binds it together)
const convertDocsToString = (documents) => {
  return documents.map((document) => `<doc>\n${document.pageContent}\n</doc>`).join("\n");
}

// This code uses Vectorstore Retriever, Mapper to Fetch Documents related to input query.
const documentRetrievalChain = RunnableSequence.from([
  (input) => input.question,
  retriever,
  convertDocsToString
]);

// Test: Fetch documents related to given query
const results = await documentRetrievalChain.invoke({
  question: "How many questions are there in the document?"
});

print(results);

// Syntesizing the Response

import { ChatPromptTemplate } from "@langchain/core/prompts";

const TEMPLATE_STRING = `You are an experienced researcher, 
expert at interpreting and answering questions based on provided sources.
Using the provided context, answer the user's question 
to the best of your ability using only the resources provided. 
Be verbose!

<context>

{context}

</context>

Now, answer this question using the above context:

{question}`;

const answerGenerationPrompt = ChatPromptTemplate.fromTemplate(TEMPLATE_STRING);

print(answerGenerationPrompt);

import { RunnableMap } from "@langchain/core/runnables";

const runnableMap = RunnableMap.from({
  context: documentRetrievalChain,
  question: (input) => input.question
});

print(await runnableMap.invoke({
  question: "How many questions are there in the document?"
}));

// Augemented Generation
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-1106"
});

const retrievalChain = RunnableSequence.from([
  {
    context: documentRetrievalChain,
    question: (input) => input.question,
  },
  answerGenerationPrompt,
  model,
  new StringOutputParser(),
]);

const answer = await retrievalChain.invoke({
  question: "How many questions are there in the document?"
});

print(answer);

// Ask followup - But does not work
const followupAnswer = await retrievalChain.invoke({
  question: "Can you list them in bullet point form?"
});

print(followupAnswer);


// 
const docs = await documentRetrievalChain.invoke({
  question: "Can you list them in bullet point form?"
});
print(docs);