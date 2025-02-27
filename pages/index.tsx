import React, { useState, useEffect, useRef } from 'react';
import { Web3Button } from '@web3modal/react'
// import {prompt} from './prompt'
// import { getPrompt } from './api/utils.js'

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi'
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
import { useBalance } from 'wagmi'
import { getNetwork } from '@wagmi/core'
import { FaTwitter, FaDiscord} from 'react-icons/fa'

import { SendTransaction } from './SendTransaction'
import { Header } from './logo'
import BackgroundImage from './backgroundimage';
import '../styles/Home.module.css'
import TypingAnimation from "../components/TypingAnimation";
import useDarkMode  from './useDarkMode';
import { isBooleanObject } from 'util/types';


interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [parsingCommand, setParsingCommand] = useState<boolean>(false);
  const [latestCommand, setLatestCommand] = useState<string>("");
  const [latestCommandArgs, setLatestCommandArgs] = useState<object>({to: "", amount: "", input_data: ""});
  // const [darkMode, setDarkMode] = useState(false)
  const [darkMode, setDarkMode] = useDarkMode();
  const toggleDarkMode = () => {
    setDarkMode((prevDarkMode: any) => !prevDarkMode);
  };
  const [prompt, setPrompt] = useState<string>("")



  const { address, isConnecting, isDisconnected } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address: address
  })
  // var ensName: string = ""
  // if (address && !ensName) {
    const { data: ensName, isError: ensErr, isLoading: ensLoading } = useEnsName({
      address: address,
    })

    type Data = {
      full_prompt: string
    }
    useEffect(() => {
      const fetchPrompt = async () => {
        const response = await fetch('/api/prompt');
        const data: Data = await response.json();
        console.log('data from api, ', data)
        setPrompt(data.full_prompt)

      };
      fetchPrompt();
    }, []);


  const extractCommandAndArgs = (inputString: string) => {
      const startCommandString = '<start_command>';
      const endCommandString = '<end_command>';
    
      // Extract the command JSON string from the input string
      const commandString = inputString.substring(
        inputString.indexOf(startCommandString) + startCommandString.length,
        inputString.indexOf(endCommandString)
      );
    
      // Parse the command JSON string to an object
      const commandObj = JSON.parse(commandString);
    
      // Extract the command name, from_address, and amount from the command object
      const commandName = commandObj.command?.name ?? '';
      const to = commandObj.command?.args?.to ?? '';
      const amount = commandObj.command?.args?.amount ?? '';
      const from = commandObj.command?.args?.from ?? '';
      const input_data = commandObj.command?.args?.input_data ?? '';

    
      return { commandName, to, amount, from, input_data};
    }
    

    const executeCommand = ({ commandName, to, from, amount, input_data }: { commandName: any, to?: any, from?: any, amount?: any, input_data?: any }) => {
      switch (commandName) {
        case "ask_user_a_question":
          // Do something with the fromAddress and amount variables just in case?
          // setLatestCommandArgs({to: to, amount: amount})
          setLatestCommand("ask_user_a_question")
          console.log(`case ask_user_a_question hit. Asking user a question`);
          break

        case "send_transaction":
          // Do something with the fromAddress and amount variables
          setLatestCommandArgs({to: to, amount: amount, input_data: input_data})
          setLatestCommand("send_transaction")
          console.log(`case send_transaction hit. Sending ${amount} from ${from ?? 'blank'}  to ${to} with input_data ${input_data}`);
          break;
    
        // Add more cases for other command names if needed
        default:
          console.log(`Unknown command: ${commandName}`);
          break;
      }
    }
  
  const first_message = messages.length === 0;

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue) return;
    var newMessage : Message;
    if (first_message) { //On 1st message, we prepend prompt
      const { chain, chains } = getNetwork()
      // console.log(chain)
      const user_state = {
        balance: data ? `${data.formatted}${data.symbol}` : undefined,
        address,
        network: chain?.name || 'Unknown',
        ens_name: ensName ?? 'langwallet.eth',
      };

      console.log("user state :: ", user_state)

      const userStateString = JSON.stringify(user_state, null, 2);
     // prompt = prompt ? prompt : "no prompt obtained from api"
      var prompt_userstate_newmessage_firtst_run =   prompt + "User State: \n" + userStateString + '\n' + "User: \n" 
      newMessage = { role: 'user', content: prompt_userstate_newmessage_firtst_run + inputValue };
    }
    else {
      newMessage = { role: 'user', content: inputValue };
    }

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
    setLoading(true);
    let updatedMessages = [...messages, newMessage];

    const non_streaming_handler = async (result?: { message: Message }, error?: Error) => {

      if (error) {
        console.error(error);
        setLoading(false);
      } else if (result) {
        setLoading(false);
    
        const lastMessage = updatedMessages[updatedMessages.length - 1];
    
        if (lastMessage.role === 'user') { // this is the first message from the assistant
          console.log("result.message from assistant: ");
          console.log(result.message);
          result.message.content = result.message.content.replace(/^Output:\s*/, ''); //remove 'Output: ' from the beginning of the message
    
          // executeCommand(result.message)
          setLoading(false);
          updatedMessages = [
            ...updatedMessages,
            {
              role: 'assistant',
              content: result.message.content,
            },
          ];
        } else {
          updatedMessages = updatedMessages.map((message, index) => {
            if (index === updatedMessages.length - 1) {
              return {
                ...message,
                content: message.content + result.message.content,
              };
            }
         return message;
          });
        }
        // Update the state with the new updatedMessages array
        setMessages(updatedMessages);
    
        if (result.message.content.includes('<start_command>')) {
          setParsingCommand(true);
          var cmd_and_args = extractCommandAndArgs(result.message.content);
          executeCommand({ commandName: cmd_and_args.commandName, to: cmd_and_args.to, from: cmd_and_args.from, amount: cmd_and_args.amount, input_data: cmd_and_args.input_data });
          // executeCommand(result.message.content)
        }
        if (parsingCommand) {
          if (result.message.content.includes('<end_command>')) {
            setParsingCommand(false);
            // executeCommand(latestCommand)
          } else {
            setLatestCommand(latestCommand + result.message.content);
          }
          return;
        }
        setMessages(updatedMessages);
      }
    }
  

    if ((window as any)?.ai) {
      try {
        const { chain, chains } = getNetwork()
        console.log(chain)


        const user_state = {
          balance: data ? `${data.formatted}${data.symbol}` : undefined,
          address,
          network: chain?.name || 'Unknown',
          ens_name: ensName ?? 'langwallet.eth',

        };
        const userStateString = JSON.stringify(user_state, null, 2);

      console.log('new msg:', newMessage.content)

       var prompt_userstate_newmessage =  "Latest User State: \n" + userStateString + '\n' + "User: \n" + newMessage.content //removed prompt, only adding it to the first message

       var content_for_ai = { messages: [...messages, { role: 'user', content: prompt_userstate_newmessage} ]}
       console.log('full outbound prompt: ')
       console.dir(content_for_ai)
       let result = await (window as any).ai.getCompletion( content_for_ai //new - TODO fix where the prompt is situated
          // { messages: [{ role: 'user', content: prompt }, ...messages, newMessage] },

          //streamingOptions
        );
        console.log("result: ", result)
        non_streaming_handler(result)

      } catch (e) {
        setLoading(false);
        console.error(e);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // function formatResponseIfNeeded(inputString: string) {
  //   const regex = /"question":\s*"([^"]+)"/;
  //   const match = inputString.match(regex);
  
  //   if (match && match[1]) {
  //     return match[1];
  //   } else {
  //     return inputString
  //   }
  // }

  function formatResponseIfNeeded(inputString: string) {
    //remove prompt from this input string
    inputString = inputString.replace(prompt, '')
    //remove 1st portion of string up  until the part containing 'User: '. only keep what's after user
    // inputString = inputString.replace(/.*User:\s*/, '')
    const userMarker = "User: \n";
    if (inputString.includes(userMarker)) {
      const startIndex = inputString.indexOf(userMarker) + userMarker.length;
      const result = inputString.slice(startIndex).trim();
      inputString = result;
    }
    // const regex = /^.*\n}\n/;
    // inputString = inputString.replace(regex, '');

    const questionRegex = /"question":\s*"([^"]+)"/;
    const sendTransactionRegex = /"name":\s*"send_transaction",\s*"args":\s*\{\s*"to":\s*"([^"]+)",\s*"amount":\s*"([^"]+)"/;
    let match;
  
    match = inputString.match(questionRegex);
    if (match && match[1]) {
      return match[1];
    }
  
    match = inputString.match(sendTransactionRegex);
    if (match && match[1] && match[2]) {
      return `Absolutely! Sending ${match[2]} to ${match[1]}. I'll just need your to confirm this tx in your wallet.`;
    }
  
    return inputString
  }
  
  // const inputString = '<start_command>\n{\n    "command": {\n        "name": "send_transaction",\n        "args":{\n            "to": "langwallet.eth",\n            "amount": "0.0005"\n        }\n    }\n}\n<end_command>';
  // const extractedMessage = extractMessage(inputString);
  // console.log(extractedMessage);
  
  // const inputString = "<start_command> { \"command\": { \"name\": \"ask_user_a_question\", \"args\":{ \"question\": \"Sure! Which network's balance would you like to check?\" } } } <end_command>";
  // const extractedQuestion = extractQuestion(inputString);
  // console.log(extractedQuestion);

  console.log("wallet balance :: ", data)

  return (
       <div className = {darkMode ? "dark" : ""}>
    <div> <BackgroundImage/>


    
    <button 
    onClick={toggleDarkMode }
    className="absolute top-4 left-2 z-10 flex items-center justify-centertransform rounded-xl bg-purple-600 text-white py-1 px-2 backdrop-blur-xl bg-opacity-60">  {darkMode ? '💡' : '🌙'} </button>
    
  <div className="min-h-screen flex items-center justify-center shadow-lg bg-white dark:bg-black dark:text-white">
  

    {/* <h1 className="text-3xl font-bold mb-4" >LangWallet</h1> */}
      <div className="w-full sm:w-3/4 lg:w-1/2 xl:w-1/2 p-6 rounded-lg bg-purple-300 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-10 border border-gray-100"> 
      <h1 className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text text-center py-3 font-bold text-4xl"> <Header img_src="/langwallet.png"></Header>LangWallet</h1>
      {/* <div>
          <Button color="dark">
            Dark mode
          </Button>
        </div>
        <div></div> */}
        <Web3Button />
        <br/>
        <br/>
        
        <div>
        {(latestCommand === "send_transaction" && SendTransaction) ? 
          <SendTransaction latestCommandArgs={latestCommandArgs} /> : null}
        </div>
        
        <div className="overflow-y-auto h-96 mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}>
              <span className={`inline-block p-2 rounded-lg text-left ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-350 text-black dark:text-white'}`}>

                {formatResponseIfNeeded(message.content)}
              </span>
            </div>
          ))}
          {loading && 
          <div key={setMessages.length} className="flex justify-start">
          <div className="bg-white-800 rounded-lg p-4 text-white max-w-sm">
                    <TypingAnimation />
                  </div>
              </div>}
          <div ref={messagesEndRef}></div>
        </div>

        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg p-1 text-sm dark: text-black focus:outline-none focus:border-blue-500"
          />
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-lg back
          ${loading ? 'opacity-50' : ''}"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        
      </div>
      <footer className = "w-full flex justify-center absolute bottom-0">
        <a href="https://twitter.com/langwallet" target="_blank" rel="noopener noreferrer" className="mr-4">
         <FaTwitter className="text-2xl text-blue-500 hover:text-blue-600" />
          </a>
        <a href="https://discord.gg/BMt2ksbaK7" target="_blank" rel="noopener noreferrer">
          <FaDiscord className="text-2xl text-gray-500 hover:text-gray-600" />
        </a>
      </footer>
    </div>
    </div>
  </div>
  );
};

export default App;



    

    // const streamingOptions = {
    //   temperature: 1,
    //   maxTokens: 1000,
    //   onStreamResult: (result?: { message: Message }, error?: Error) => {
    //     if (error) {
    //       console.error(error);
    //       setLoading(false);
    //     } else if (result) {
    //       setLoading(false);
          

    //       const lastMessage = updatedMessages[updatedMessages.length - 1];
    //       if (lastMessage.role === 'user') {
    //         console.log("result.message: ")
    //         console.log(result.message)

    //         // executeCommand(result.message)
    //         setLoading(false);
    //         updatedMessages = [
    //           ...updatedMessages,
    //           {
    //             role: 'assistant',
    //             content: result.message.content,
    //           },
    //         ];
    //       } else {
    //         updatedMessages = updatedMessages.map((message, index) => {
    //           if (index === updatedMessages.length - 1) {
    //             return {
    //               ...message,
    //               content: message.content + result.message.content,
    //             };
    //           }
             
    //           return message;

    //         });
    //       }
    //       if (result.message.content.includes('<start_command>')) {
    //         setParsingCommand(true)
    //         return
            
    //         // executeCommand(result.message.content)
    //       }
    //       if (parsingCommand) {
    //         if (result.message.content.includes('<end_command>')) {
    //           setParsingCommand(false)
    //           executeCommand(latestCommand)
    //         } else {
    //           setLatestCommand(latestCommand + result.message.content)
    //         }
    //         return
    //       }
    //       if (result.message.content.includes('<end_command>')) {
    //         setParsingCommand(false)
    //         executeCommand(latestCommand)
    //         return
    //       }
    //       setMessages(updatedMessages);
          

    //     }
    //   },
    // };