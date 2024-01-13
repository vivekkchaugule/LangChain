import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

// Define ChatModel
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
    openAIApiKey: process.env.OPEN_API_KEY
});

// Part 1: Direct Invocation

const res = await model.invoke([
    new HumanMessage("Who has branches but its not tree?")
]);

console.log(JSON.stringify(res));

// Part 2: Prompt Based Invocation

import {ChatPromptTemplate} from '@langchain/core/prompts';

const prompt = ChatPromptTemplate.fromTemplate(`
    What are four good names for a company that produce {product} ?
`);

const formattedPrompt = await prompt.format({
    product: "Fancy Lamps"
});

console.log(formattedPrompt);

const formattedMessages = await prompt.formatMessages({
    product: "Fancy Lamps"
});

console.log(formattedMessages);

// Part 3: Adding SystemTemplate

import {
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate
} from '@langchain/core/prompts';


const promptFromMessages = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate("You are an {level} at picking company names."),
    HumanMessagePromptTemplate.fromTemplate("What are two good names for a company that makes {prod}")
]);

const formattedPromptFromMessages = await promptFromMessages.formatMessages({
    level: "beginner",
    prod: "shiny diamonds"
});

console.log(formattedPromptFromMessages);

// Part 4: Other ways to do the same

const promptFromMessages_2 = ChatPromptTemplate.fromMessages([
    ["system", "You are an {level} at playing BlackJack!"],
    ["human", "What are three good names for a company that produces {prod}?"]
]);

const promptFromMessages_2_formatted = await promptFromMessages_2.formatMessages({
    level: "expert",
    prod: "Shampoo"
});

console.log(promptFromMessages_2_formatted);


// Part 5: LangChain Expression Language (LCEL)
const chain = prompt.pipe(model);

const result = await chain.invoke({
    product: "colourful socks"
});

console.log(result);


// Part 6: OutPut Parser - Convert response JSON to String 

import {StringOutputParser} from "@langchain/core/output_parsers";

const outputParser = new StringOutputParser();
const nameGenerationChain = prompt.pipe(model).pipe(outputParser);

const stringResult = await nameGenerationChain.invoke({
    product: "Fancy Lipstick"
});

console.log(stringResult);

// Part 7: Runnable Squence - Merge Model, Prompt, OutputParser into one

import {RunnableSequence} from "@langchain/core/runnables";

const runnableSeq = RunnableSequence.from([
    prompt,
    model,
    outputParser
]);

console.log(await runnableSeq.invoke({ product: "Memory Card" }));

// Part 8: Streaming
const stream = await runnableSeq.stream({
    product: "Avocado Cookies"
});

for await(const chunk of stream) {
    console.log(chunk);
}

// Part 9 : Batch

const inputs = [
    {product: "Fancy cookies"},
    {product: "Crispy Donut"}
];

const result_batch = await runnableSeq.batch(inputs);

console.log(result_batch);