const print = (...args) => console.log(JSON.stringify(args)); 

// Part 1: Loader

// Import Loader
import {GithubRepoLoader} from "langchain/document_loaders/web/github";

// Peer Dependency
import ignore from "ignore";

// Create Loader
const loader = new GithubRepoLoader(
    "https://github.com/langchain-ai/langchainjs", // Github Repo URL
    {recursive: false, ignorePaths: ["*.md", "yarn.lock"]} // Files to Ignore
);

//const docs = await loader.load();

//console.log(docs.slice(0, 3));

// Import Loader
import {PDFLoader} from "langchain/document_loaders/fs/pdf";
// Create Loader
const pdfLoader = new PDFLoader("./data/Verafin-answers.pdf");
// Load the PDF
const rawCS229Docs = await pdfLoader.load();

console.log(rawCS229Docs.slice(0, 5));


// Part 2: Splitting

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkSize: 32,
    chunkOverlap: 0,
});

const code = `function helloWorld() {
    console.log("Hello, World!");
    }
    // Call the function
    helloWorld();`;

print(await splitter.splitText(code));

import { CharacterTextSplitter } from "langchain/text_splitter";

const char_splitter = new CharacterTextSplitter({
    chunkSize: 32,
    chunkOverlap: 0,
    separator: " "
});

print(await char_splitter.splitText(code));

const recursive_char_splitter = RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkOverlap: 32,
    chunkSize: 64
});


print(await recursive_char_splitter.splitText(code));

const recursive_char_splitter2 = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 64,
});

const splitDocs = await recursive_char_splitter2.splitDocuments(rawCS229Docs);

print(splitDocs.slice(0,5));