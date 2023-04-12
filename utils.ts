import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  SemanticSimilarityExampleSelector,
  PromptTemplate,
  FewShotPromptTemplate,
} from "langchain/prompts";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CharacterTextSplitter } from "langchain/text_splitter"

//file not in use - just for testing

export async function langTest() {
    const loader = new TextLoader( "./examples.txt");
    const docs = await loader.load();
    
    const textSplitter = new CharacterTextSplitter({separator: '==========='})
    const splits = await textSplitter.splitDocuments(docs);
    console.log(splits)
}
// langTest()

console.log("running tests");
export const add = (a: number, b: number): number => a + b;
export const multiply = (a: number, b: number): number => a * b;