import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { SemanticSimilarityExampleSelector, PromptTemplate } from "langchain/prompts";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CharacterTextSplitter } from "langchain/text_splitter"
import { constant_prompt, dynamic_prompt } from "../../utils_prompt.mjs"
import { getEthUsdLastPrice, getAverageGasPrice } from "../../utils_helpers.mjs";
// import { PromptLayerOpenAI } from "langchain/llms/openai";
import dotenv from "dotenv"
dotenv.config()
const openAiApiKey = process.env.OPENAI_API_KEY

export default async function handler(req, res) {

  const rootDirectory = process.cwd();
  let vectorDirectory = `vectorstore`;
  let loadedVectorStore
  // loadedVectorStore = await createVectorStore(vectorDirectory) //for testing

  try {
    loadedVectorStore = await HNSWLib.load(vectorDirectory, new OpenAIEmbeddings({
      openAIApiKey:
        process.env.OPENAI_API_KEY, verbose: true
    }));
    console.log('vectorestore found')

  } catch (e) {
    console.log('error ', e)
    console.log('no vector store found, creating one')
    loadedVectorStore = await createVectorStore(vectorDirectory)
  }

  const result = await loadedVectorStore.similaritySearch("what's my balance?", 2);
  // const template = "Use the follwing information {gas_price} {eth_price}. Use the follwing examples {examples_from_db}"
  // const test_template = "What is a good name for a company that makes {eth_price}  {gas_price} {examples_from_db}";
  const template = dynamic_prompt

  // Create a prompt template that will be used to format the examples.
  const examplePrompt = new PromptTemplate({
    template, //must be named template?
    inputVariables: ["gas_price", "eth_price", "examples_from_db"]

  });
  let eth_price = await getEthUsdLastPrice()
  let gas_price = await getAverageGasPrice()
  let examples_from_db = result[0].pageContent + "===========" + result[1].pageContent

  const formatted_prompt = await examplePrompt.format({ gas_price: gas_price ?? "unknown", eth_price: eth_price ?? "unknown", examples_from_db: examples_from_db ?? "test_examples" })

  const full_prompt = constant_prompt + formatted_prompt
  // console.log(full_prompt)
  // console.log("\n__the remaining user_state would go here__")

  console.log("returning full_prompt from api")
  return res.status(200).json({ full_prompt: full_prompt })

}