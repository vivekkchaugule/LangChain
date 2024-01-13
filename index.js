import { OpenAI } from "@langchain/openai";

// Define LLM Model
const model = new OpenAI({
    modelName: "gpt-3.5-turbo-instruct", // Defaults to "gpt-3.5-turbo-instruct" if no model provided.
    temperature: 0.9,
    openAIApiKey: process.env.OPEN_API_KEY
});

// Invoke Model
const res = await model.invoke(
    "What would be a good company name a company that makes colorful underwares?"
);

// Print Response
console.log(res);



