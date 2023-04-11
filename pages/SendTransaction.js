import { useSendTransaction, usePrepareSendTransaction, useEnsAddress, mainnet, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
const { utils: { toUtf8Bytes } } = ethers;

export function SendTransaction({ latestCommandArgs: { to = '', amount = '', input_data = '' } = {} } = {}) {
  const [value, setValue] = useState(amount);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [isSettledTx, setSettledTx] = useState(null);
  const [currentTrx, setCurrentTrx] = useState(null)
  const [componentSuccess, setComponentSuccess] = useState(null)
  
  const textToHex = (text) => {
    console.log('inside textToHex - sending the following text in input_data --> ', text)
    return ethers.utils.hexlify(toUtf8Bytes(text));
  };

  const config = {
    request: {
      to: to,
      value: ethers.utils.parseEther(value),
      data: textToHex(String(input_data)),
    },
  }
  
  const sendTrx  = useSendTransaction(config);
  console.log("sendTrx:: ", sendTrx.data?.hash)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: sendTrx.data?.hash,
    onSettled(data, error) {
      console.log('Settled:::: ', { data, error })
      if(!error){
        console.log(' transaction settled :: ')
        setComponentSuccess(true)
      }
    },
  });
  
  const triggerSendTransaction = async () => {
    if ( to && amount) {
      let x = await sendTrx.sendTransaction("");
    }
  };  
  // to prevent useEffect from running twice in strict mode
  var isEffect = false
  useEffect(() => {
    // to prevent useEffect from running twice in strict mode
    if (isEffect) { isEffect = false; return;}

    if (to && amount && !componentSuccess ) {
      triggerSendTransaction();
    }

    // to prevent useEffect from running twice in strict mode
    isEffect = true;
  }, [to, amount, componentSuccess ]);

  console.log("-- rendered send transaction componenet --")
  console.log("isSettledTx:: ", isSettledTx)
  console.log("isLoading:: ", isLoading)
  console.log("isSuccess:: ", isSuccess)

  if(isSettledTx){ return <div><p>{sendTrx.data ? sendTrx.data : 'no data'}</p></div> }

  if(isLoading){ return (<div><div>Check Wallet</div></div>)}

  if(componentSuccess ){ 
    return (
    <div>
      <div>Transaction: {JSON.stringify(sendTrx.data)}</div>
        <div>
          Successfully sent {amount} ether to {to}
          <div>
            <a href={`https://etherscan.io/tx/${sendTrx.data?.hash}`}>Etherscan</a>
          </div>
        </div>
    </div>
    )}
    
  return (<div></div>)
}


  // useEffect(() => {
  //   const resolveEnsAddress = async () => {
  //     if (to.includes('.eth')) {
  //       to = { address } = await useEnsAddress({ name: to });
  //       console.log('found address. new "to" value: ', to)
  //       setResolvedAddress(address);
  //     }
  //   };

  //   resolveEnsAddress();
  // }, [to]);

  // Your logic for sending the transaction using the resolved address

  // var config

  // const { config, error } = usePrepareSendTransaction({
  //   request: {
  //     to: 'moxey.eth',
  //     value: parseEther('1'),
  //   },
  // })

        // chainId: 1,
  
      // onSuccess(data) {
      //   console.log('Success', data);
      //   alert('Success', data);
      // },
      // onError(error) {
      //   console.log('Error sending tx: ', error);
      // },
      // onSettled(data, error) {
      //   console.log('Settled tx', { data, error });
      //   setSettledTx({ data, error })
      // },
    // });