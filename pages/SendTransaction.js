import { useSendTransaction, usePrepareSendTransaction, useEnsAddress, mainnet, useWaitForTransaction } from 'wagmi';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';


export function SendTransaction({ latestCommandArgs: { to = '', amount = '' } = {} } = {}) {
  const [value, setValue] = useState(amount);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [isSettledTx, setSettledTx] = useState(null);

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


  var config
  if (to && amount) {
    config = { config } = usePrepareSendTransaction({
      request: {
        to: to,
        // gasLimit: 21000,
        value: ethers.utils.parseEther(value),
      },
      chainId: mainnet.id,
    })
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
  }

  const { data, isSettled, status, sendTransaction } = useSendTransaction(config);
 
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  const triggerSendTransaction = async () => {
    if (sendTransaction && to && amount) {
      let x  = await sendTransaction();
      console.log(x)
    }
  };

  useEffect(() => {
    triggerSendTransaction();
  }, []);

  return (
    <div>
      {/* <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
        Send Transaction
      </button> */}
       {isSettledTx && <p>{data ? data : "no data"}</p>}
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      {isSuccess && (
        <div>
          Successfully sent {amount} ether to {to}
          <div>
            <a href={`https://etherscan.io/tx/${data?.hash}`}>Etherscan</a>
          </div>
        </div>
      )}
    </div>
  );
}
