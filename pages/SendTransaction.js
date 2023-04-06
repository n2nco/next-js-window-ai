

import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
import { ethers } from 'ethers';
import { useEffect } from 'react'
 
export function SendTransaction( { latestCommandArgs: { to = '', amount = '' } = {} } = {}) {
  var value = amount 
  // const value = parseFloat(amount);

  let config

  if (to && amount) {
    config = { config } = usePrepareSendTransaction({
      request: { 
        to: to, 
        value: ethers.utils.parseEther(value)
      },
        
      onSuccess(data) {
        console.log('Success', data)
        alert("Success", data)
      },
      onError(error) {
        console.log('Error sending tx: ', error)
      },
      onSettled(data, error) {
        console.log('Settled tx', { data, error })
      },
    })
  }

  const { data, isLoading, isSuccess, sendTransaction } =  useSendTransaction(config)
  


  useEffect(() => {
    if (sendTransaction && to && amount) {
      sendTransaction()
    }
  }, [sendTransaction])

  return (
    <div>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
    </div>
  )
}