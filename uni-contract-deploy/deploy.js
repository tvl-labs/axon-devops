const Web3 = require('web3')
const ethers = require("ethers");
const fs = require('fs');
const yaml = require('js-yaml');

const WETH9 = require('.././uni-test/artifacts/contracts/Weth.sol/WETH9.json');
const UniswapV2Factory = require('.././uni-test/artifacts/contracts/Factory.sol/UniswapV2Factory.json');
const UniswapV2Router02 = require('.././uni-test/artifacts/contracts/UniswapV2Router02.sol/UniswapV2Router02.json');
const UniswapV2Pair = require('.././uni-test/artifacts/contracts/Factory.sol/IUniswapV2Pair.json');
const Multicall = require('.././uni-test/artifacts/contracts/MultilCall.sol/Multicall.json');
const configdata = fs.readFileSync('config.yml','utf8');
const configsetting = yaml.load(configdata);
console.log(configsetting);
console.log(configsetting.node_address);
console.log(configsetting.hex_private_key);
const endpoint = configsetting.node_address;
const hexPrivateKey = configsetting.hex_private_key;

async function sendTransaction(web3, chainId, account, data, nonce, gasPrice) {
    const tx = {
        type: 2,
        nonce: nonce,
        maxPriorityFeePerGas: 250, // Recommended maxPriorityFeePerGas
        maxFeePerGas: 250, // Recommended maxFeePerGas
        gasLimit: web3.utils.stringToHex("21000"), // basic transaction costs exactly 21000
        chainId: 5, // Ethereum network id
        data: data
    };
    const transaction = await account.signTransaction(tx)
    return web3.eth.sendSignedTransaction(transaction.rawTransaction)
}

(async () => {
    const options = { timeout: 1000 * 30 }
    const web3 = new Web3(new Web3.providers.HttpProvider(endpoint, options))
    const account = web3.eth.accounts.privateKeyToAccount(hexPrivateKey)

    const chainId = await web3.eth.getChainId()
    const gasPrice = await web3.eth.getGasPrice()
    let nonce = await web3.eth.getTransactionCount(account.address) + 1

    let contract_address = {
        WETH: '',
        WETH_TX_HASH: "",
        UniswapV2Factory: '',
        UniswapV2Factory_TX_HASH: '',
        UniswapV2Router02: '',
        UniswapV2Router02_TX_HASH: '',
        Multicall: '',
        Multicall_TX_HASH: '',
        InitCodeHash: '0xfe5c25035eb1580fcbc8496a5d5423870718fac54c9d582b43039dbce6afc72f'

    }


    // deploy Multicall contract
    {
        const contract = new web3.eth.Contract(Multicall.abi)
        const data = contract.deploy({ data: Multicall.bytecode }).encodeABI()
        const receipt = await sendTransaction(web3, chainId, account, data, nonce, gasPrice)
        nonce = nonce + 1
        contract_address.Multicall = receipt.contractAddress
        contract_address.Multicall_TX_HASH = receipt.transactionHash
    }

    // deploy WETH contract
    {
        const contract = new web3.eth.Contract(WETH9.abi)
        const data = contract.deploy({ data: WETH9.bytecode }).encodeABI()
        const receipt = await sendTransaction(web3, chainId, account, data, nonce, gasPrice)
        nonce = nonce + 1
        contract_address.WETH = receipt.contractAddress
        contract_address.WETH_TX_HASH = receipt.transactionHash
    }


    // deploy UniswapV2Factory contract
    {
        const contract = new web3.eth.Contract(UniswapV2Factory.abi)
        const options = { data: UniswapV2Factory.bytecode, arguments: [account.address] }
        const data = contract.deploy(options).encodeABI()
        const receipt = await sendTransaction(web3, chainId, account, data, nonce, gasPrice)
        nonce = nonce + 1
        contract_address.UniswapV2Factory = receipt.contractAddress
        contract_address.UniswapV2Factory_TX_HASH = receipt.transactionHash
    }



    // deploy UniswapV2Router02 contract
    {
        const contract = new web3.eth.Contract(UniswapV2Router02.abi)
        const options = { data: UniswapV2Router02.bytecode, arguments: [contract_address.UniswapV2Factory, contract_address.WETH] }
        const data = contract.deploy(options).encodeABI()
        const receipt = await sendTransaction(web3, chainId, account, data, nonce, gasPrice)
        nonce = nonce + 1
        contract_address.UniswapV2Router02 = receipt.contractAddress
        contract_address.UniswapV2Router02_TX_HASH = receipt.transactionHash
    }

    // let data = UniswapV2Pair.bytecode;
    // if (!data.startsWith('0x')) data = '0x' + data;
    // contract_address.InitCodeHash =  web3.utils.keccak256(data);

    console.log(contract_address);

    let yamlStr = yaml.dump(contract_address);
    fs.writeFileSync('contract_address.yaml', yamlStr, 'utf8');
})()
