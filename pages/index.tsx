import React, { useState, useEffect, useRef } from 'react';
import { Web3Button } from '@web3modal/react'
import {prompt} from './prompt'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
import { useBalance } from 'wagmi'
import { getNetwork } from '@wagmi/core'


import { SendTransaction } from './SendTransaction'





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
  const [latestCommandArgs, setLatestCommandArgs] = useState<object>({to: "", amount: ""});
  
  const { address, isConnecting, isDisconnected } = useAccount()
  const { data, isError, isLoading } = useBalance({
    address: address
  })



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

    
      return { commandName, to, amount, from  };
    }
    

    const executeCommand = ({ commandName, to, from, amount }: { commandName: any, to?: any, from?: any, amount?: any }) => {
    
      switch (commandName) {
        case "ask_user_a_question":
          // Do something with the fromAddress and amount variables just in case?
          // setLatestCommandArgs({to: to, amount: amount})
          setLatestCommand("ask_user_a_question")

        case "send_transaction":
          // Do something with the fromAddress and amount variables
          setLatestCommandArgs({to: to, amount: amount})
          setLatestCommand("send_transaction")


          console.log(`Sending ${amount} from ${from ?? 'blank'}  to ${to}`);
          break;
    
        // Add more cases for other command names if needed
        default:
          console.log(`Unknown command: ${commandName}`);
          break;
      }
    }
    
  


  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue) return;
    const newMessage: Message = { role: 'user', content: inputValue };
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
            console.log("result.message: ")
            console.log(result.message)
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
          if (result.message.content.includes('<start_command>')) {
            setParsingCommand(true)
            var cmd_and_args = extractCommandAndArgs(result.message.content)
            executeCommand({ commandName: cmd_and_args.commandName, to: cmd_and_args.to, from: cmd_and_args.from, amount: cmd_and_args.amount })

            // executeCommand(result.message.content)
          }
          if (parsingCommand) {
            if (result.message.content.includes('<end_command>')) {
              setParsingCommand(false)
              // executeCommand(latestCommand)
            } else {
              setLatestCommand(latestCommand + result.message.content)
            }
            return
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
          network: "mainnet"
        };
        const userStateString = JSON.stringify(user_state, null, 2);

        // console.log("\n" + userStateString + '\n' + newMessage)
      



       console.log('full outbound prompt: ')
       var p =   prompt + "User State: \n" + userStateString + '\n' + "User: \n" + newMessage.content
       
      //  console.log(JSON.stringify(p))
      //  var p_str = JSON.stringify(p)

       let result = await (window as any).ai.getCompletion(
          { messages: [...messages, { role: 'user', content: p} ]}//new - TODO fix where the prompt is situated

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



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full sm:w-3/4 lg:w-1/2 xl:w-1/2 bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Next JS x window.ai x web3</h1>
        <Web3Button />
        <div>
        {latestCommand === "send_transaction" && (
        <SendTransaction latestCommandArgs={latestCommandArgs} />
        )}
         </div>
        
        <div className="overflow-y-auto h-96 mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}>
              <span className={`inline-block p-2 rounded-lg text-left ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                {message.content}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
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