# Building Blocks

<head>Language Model</head>
<ol>
    <li> Text LLMs: Fn (string) -> string.
    <li> Chat models: list of messages -> single message output.
</ol>

<head> Prompt Template
<ol>
    <li> We can create Prompt Template using <b>ChatPromptTemplate.</b>
    <li> LangChain Expression Langauge (LCEL).
    <li> Output Parser - Convert Response JSON to String.
    <li> Runnable Sequence - Create sequence to be executed.
    <li> Streaming - Get the response few characters at a time.
    <li> Batch - Run model against batch of inputs at a time.
</ol>


# Data Loaders

<head> Loading
<ol>
    <li> Import Loader: GithubRepoLoader.
    <li> Create Loader: new GithubRepoLoader.
    <li> Load the Data: loader.load().
</ol>

<head> Splitting
<ol>
    <li> Import Splitter.
    <li> Create Splitter, provide chunkSize: Split size, chunkOverlap: How split overlap eachother.
    <li> Call splitText(String).
    <li> Call splitDocuments(loadeDocument).
 </ol>

# Vector Stores

<head> Create Vector Embedding 
<ol>
    <li> Import OpenAI Embedding (e.g. OpenAI Embedding)
    <li> Call constructor for Embedding Library
</ol>

<head> Create Vector Store
<ol>
    <li> Import Vector Store Library (e.g. langchain/vectorstores/memory)
    <li> Call constructor with Vector Embedding  
</ol>

<head> Load Data into Vector Store and create retriever
<ol>
    <li> Use Loader (e.g. PDFLoader)
    <li> Split the Document using Spliter
    <li> Call addDocuments on vectoreStore to load Doc Splits
    <li> Call asRetriever() on vectorStore to get vectorRetriever
</ol>

