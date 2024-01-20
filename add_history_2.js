import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

import { RunnablePassthrough, RunnableWithMessageHistory, RunnableSequence } from "@langchain/core/runnables";

import { ChatMessageHistory } from "langchain/stores/message/in_memory";

import { ChatOpenAI } from "@langchain/openai";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { loadAndSplitChunks, initializeVectorstoreWithDocuments } from "./lib/helpers.js";

console.log("1. Loading Documents chunks ...");
const splitDocs = await loadAndSplitChunks({
    chunkSize: 1536,
    chunkOverlap: 128
});

console.log("Finished Loading Documents chunks");

console.log("2. Initializing Vector Store ...");

const vectorstore = await initializeVectorstoreWithDocuments({
  documents: splitDocs,
});

console.log("Vectore Store Initialized");
const retriever = vectorstore.asRetriever();

console.log("3. Creating Document Retrieval Chain ...");
const convertDocsToString = (documents) => {
    return documents.map((document) => {
      return `<doc>\n${document.pageContent}\n</doc>`
    }).join("\n");
};

const documentRetrievalChain = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
]);

console.log("Document Retrieval Chain created.");

const REPHRASE_QUESTION_SYSTEM_TEMPLATE = `Given the following conversation and a follow up question, 
rephrase the follow up question to be a standalone question.`;

const rephraseQuestionChainPrompt = ChatPromptTemplate.fromMessages([
    ["system", REPHRASE_QUESTION_SYSTEM_TEMPLATE],
    new MessagesPlaceholder("history"),
    [
        "human",
        "Rephrase the following question as a standalone question:\n{question}"
    ]
]);

const rephraseQuestionChain = RunnableSequence.from([
    rephraseQuestionChainPrompt,
    new ChatOpenAI({temperature: 0.1, modelName: "gpt-3.5-turbo-1106"}),
    new StringOutputParser(),
]);

const ANSWER_CHAIN_SYSTEM_TEMPLATE = `You are an experienced researcher, 
expert at interpreting and answering questions based on provided sources.
Using the below provided context and chat history, 
answer the user's question to the best of 
your ability 
using only the resources provided. Be verbose!

<context>
{context}
</context>`;

const answerGenerationChainPrompt = ChatPromptTemplate.fromMessages([
  ["system", ANSWER_CHAIN_SYSTEM_TEMPLATE],
  new MessagesPlaceholder("history"),
  [
    "human", 
    "Now, answer this question using the previous context and chat history:\n{standalone_question}"
  ]
]);


const conversationalRetrievalChain = RunnableSequence.from([
    RunnablePassthrough.assign({
        standalone_question: rephraseQuestionChain,
    }),
    RunnablePassthrough.assign({
        context: documentRetrievalChain
    }),
    answerGenerationChainPrompt,
    new ChatOpenAI({ modelName: "gpt-3.5-turbo" }),
    new StringOutputParser(),
]);


const messageHistory = new ChatMessageHistory();

const finalRetrievalChain = new RunnableWithMessageHistory({
    runnable: conversationalRetrievalChain,
    getMessageHistory: (_sessionId) => messageHistory,
    historyMessagesKey: "history",
    inputMessagesKey: "question"
}); 

const originalQuestion = "What questions are asked in this document?";

const originalAnswer = await finalRetrievalChain.invoke({
  question: originalQuestion,
}, {
  configurable: { sessionId: "test" }
});

const finalResult = await finalRetrievalChain.invoke({
  question: "Can you list them in bullet point form?",
}, {
  configurable: { sessionId: "test" }
});

console.log(finalResult);