/**
 *  INITIALIZE VECTORSTORE AND RETRIEVER
 */
import { print } from "./util.js";
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
import { RunnableSequence } from "@langchain/core/runnables";

const convertDocsToString = (documents) => {
  return documents.map((document) => {
    return `<doc>\n${document.pageContent}\n</doc>`
  }).join("\n");
};

const documentRetrievalChain = RunnableSequence.from([
    (input) => input.question,
    retriever,
    convertDocsToString
]);

console.log("Document Retrieval Chain Created");

console.log("4. Create Query Retrieval Chain...");
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

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
const model = new ChatOpenAI({modelName: "gpt-3.5-turbo-1106"});

const retrievalChain = RunnableSequence.from([
    {
        context: documentRetrievalChain,
        question: inp => inp.question,
    },
    answerGenerationPrompt,
    model,
    new StringOutputParser(),
]);

console.log("Retrieval chain created.");

// Adding History
console.log("5. Creating Rephrase Chain for Adding History ...");
import { MessagesPlaceholder } from "@langchain/core/prompts";
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

console.log("Rephrase Chain Created.");

console.log("6. Building Chat History ...");

import {HumanMessage, AIMessage} from "@langchain/core/messages";

const originalQuestion = "c";

const originalAnswer = await retrievalChain.invoke({
    question: originalQuestion
});

print(originalAnswer);

const chatHistory = [
    new HumanMessage(originalQuestion),
    new AIMessage(originalAnswer),
];

console.log("Built Chat History.");
print(chatHistory);

const _r = await rephraseQuestionChain.invoke({
    question: "Can you list them in bullet point form?",
    history: chatHistory
});

print(_r);

const documentRetrievalChain_wh = RunnableSequence.from([
    (input) => input.standalone_question,
    retriever,
    convertDocsToString,
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

