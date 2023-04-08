import { useSendTransaction, usePrepareSendTransaction, useEnsAddress, mainnet, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
const { utils: { toUtf8Bytes } } = ethers;

export function SendTransaction({ latestCommandArgs: { to = '', amount = '', input_data = '' } = {} } = {}) {
  const [value, setValue] = useState(amount);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [isSettledTx, setSettledTx] = useState(null);
  const [currentTrx, setCurrentTrx] = useState(null)
  
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

  const { data: tx_data, isSettled, status, sendTransaction } = useSendTransaction(config);
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: tx_data?.hash,
  });
  
  const triggerSendTransaction = async () => {
    if (sendTransaction && to && amount) {
      let x = await sendTransaction("");
    }
  };  
  // to prevent useEffect from running twice in strict mode
  var isEffect = false
  useEffect(() => {
    // to prevent useEffect from running twice in strict mode
    if (isEffect) { isEffect = false; return;}

    if (to && amount) {
      triggerSendTransaction();
    }

    // to prevent useEffect from running twice in strict mode
    isEffect = true;
  }, [to, amount]);

  console.log("rendered send transaction componenet")
  return (
    <div>
      {isSettledTx && <p>{tx_data ? tx_data : 'no data'}</p>}
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(tx_data)}</div>}
      {isSuccess && (
        <div>
          Successfully sent {amount} ether to {to}
          <div>
            <a href={`https://etherscan.io/tx/${tx_data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
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