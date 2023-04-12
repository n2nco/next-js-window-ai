const Web3 = require('web3');
const web3 = new Web3('https://alpha-withered-fog.discover.quiknode.pro/3afbaba5ebf87602deacdb381614f6acf82397d0/');
web3.eth.getBlock('latest').then(answer => console.log(answer))
web3.eth.getBlockNumber().then(blockNum => console.log(blockNum))
