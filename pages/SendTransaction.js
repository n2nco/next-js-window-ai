import { useSendTransaction, usePrepareSendTransaction, useEnsAddress, mainnet } from 'wagmi';
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



  var config
  if (to && amount) {
    config = { config } = usePrepareSendTransaction({
      request: {
        to: to,
        // gasLimit: 21000,
        value: ethers.utils.parseEther(value),
      },
      chainId: 1,
   

      onSuccess(data) {
        console.log('Success', data);
        alert('Success', data);
      },
      onError(error) {
        console.log('Error sending tx: ', error);
      },
      onSettled(data, error) {
        console.log('Settled tx', { data, error });
        setSettledTx({ data, error })
      },
    });
  }

  const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction(config);

  const triggerSendTransaction = () => {
    if (sendTransaction && to && amount) {
      sendTransaction();
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
       {isSettledTx && <p>{data}</p>}
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
    </div>
  );
}
