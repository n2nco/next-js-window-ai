

import { useSendTransaction, usePrepareSendTransaction } from 'wagmi'
 
export function SendTransaction({ to, amount } = latestCommandArgs) {
  var value = amount 
  const { config } = usePrepareSendTransaction({
    request: { to, value: BigNumber.from(value) },
  })
  const { data, isLoading, isSuccess, sendTransaction } =
    useSendTransaction(config)

  useEffect(() => {
    if (sendTransaction) {
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