


export async function getEthUsdLastPrice() {
    const apiUrl = "https://data.binance.com/api/v3/ticker/24hr";
  try {
    // Send GET request to the API endpoint
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Filter the response to get the last price of ETH/USD
    const ethUsd = data.find((symbolData) => symbolData.symbol === "ETHUSDT");
    const lastPrice = Number(ethUsd.lastPrice).toFixed(2);
    console.log(`ETH/USD last price: ${lastPrice}`);
    return lastPrice
  } catch (error) {
    console.error(`Error fetching data: ${error}`);
  }
}



export async function getAverageGasPrice() {
        const apiUrl = "https://ethgasstation.info/api/ethgasAPI.json?";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const averageGasPrice = (Number(data.average) / 10).toFixed(1)// Divide by 10 to move decimal point one place to the left

        console.log(`Average gas price: ${averageGasPrice} gwei`);
        return averageGasPrice
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
    }
}


