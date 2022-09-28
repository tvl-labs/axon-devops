<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
const ERC20JSON = require("./ERC20.json");
const ethers = require("ethers");
<<<<<<< HEAD
=======
const Web3 = require('web3');
const ERC20JSON = require('./ERC20.json');
const AccountFactory = require('./account_factory');
const logger = require('./logger');
<<<<<<< HEAD
>>>>>>> c8ce4c8 (feat(benchmarrk): contract support)
=======
=======
const ERC20JSON = require('./ERC20.json');
>>>>>>> 736d1ab (feat: Use ethers.js to replace web3.js)
const ethers = require('ethers');
>>>>>>> e6a67d2 (fix(benchmark) fix gas (#102))
=======
const ERC20JSON = require("./ERC20.json");
const ethers = require("ethers");
>>>>>>> 2c00e4a (style: formatted by eslint)
=======
const logger = require("./logger");
>>>>>>> 3d13247 (fix: nonce manager)

class Benchmark {
    constructor(info) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        this.config = info.config;
=======
        let config = info.config
=======
>>>>>>> b6423b1 (feat(benchmark): use chain_id as a configuration)
        let private_key = info.private_key
        this.config = {
                http_endpoint: info.config.http_endpoint,
                private_key : private_key,
                continuous_benchmark: info.config.continuous_benchmark,
                benchmark_time: info.config.benchmark_time,
                batch_size: info.config.batch_size,
                id: info.config.id,
                token: info.config.token,
                chain_id: info.config.chain_id
        }
>>>>>>> 3b2401e (fix(benchmark): fix balance (#103))

<<<<<<< HEAD
        this.contract = new ethers.Contract(
            info.contracts["ERC20"],
            ERC20JSON.abi,
        );
=======
        this.benchmark_info = {
            success_tx: 0,
            fail_tx: 0,
            transfer_count: 0,
            start_block_number: 0,
            end_block_number: 0,
            total_time: 0,
            nonce: 0,
        }

        this.web3 = new Web3(new Web3.providers.HttpProvider(info.config.http_endpoint))
        this.account = this.web3.eth.accounts.privateKeyToAccount(private_key)
        this.web3.eth.defaultAccount = this.account.address

        this.contract = new this.web3.eth.Contract(ERC20JSON.abi, info.contracts["ERC20"]);
>>>>>>> b6423b1 (feat(benchmark): use chain_id as a configuration)
    }

    async gen_tx(account) {
        const rawTx = await this.contract
            .connect(account.signer)
            .populateTransaction
            .transfer("0x5cf83df52a32165a7f392168ac009b168c9e8915", 0, { nonce: account.getNonce() });

        const tx = await account.signer.populateTransaction(rawTx);

        return account.signer.signTransaction(tx);
    }
<<<<<<< HEAD
=======

    async start() {
        this.benchmark_info.total_time = 0
        this.benchmark_info.start_time = performance.now()
        this.benchmark_info.nonce = await this.web3.eth.getTransactionCount(this.account.address)
=======
        this.config = info.config;

        this.contract = new ethers.Contract(
            info.contracts["ERC20"],
            ERC20JSON.abi,
        );
<<<<<<< HEAD

<<<<<<< HEAD
        this.contract = new this.web3.eth.Contract(ERC20JSON.abi, info.contracts["ERC20"]);

>>>>>>> ae36ae0 (feat: uniswap v3)
        this.accounts = [];
=======
        this.accounts = info.accounts;
>>>>>>> 736d1ab (feat: Use ethers.js to replace web3.js)
        this.index = 0;
=======
>>>>>>> e3e07b6 (fix: nonce hell)
    }

    async gen_tx(account) {
        const rawTx = await this.contract
            .connect(account.signer)
            .populateTransaction
            .transfer("0x5cf83df52a32165a7f392168ac009b168c9e8915", 0, { nonce: account.getNonce() });

        const tx = await account.signer.populateTransaction(rawTx);

        return account.signer.signTransaction(tx);
    }
<<<<<<< HEAD

    async send_txs() {
        while (this.config.continuous_benchmark || this.config.benchmark_time > this.benchmark_info.total_time) {
            await this.send_batch_transactions();
            this.benchmark_info.total_time = (performance.now() - this.benchmark_info.start_time)
        }
    }

    async send_batch_transactions() {
        for (const account of this.accounts) {
            let nonce = await this.web3.eth.getTransactionCount(account.address);
            const txs = new WaitableBatchRequest(this.web3);

            for (let i = 0; i < this.config.batch_size; i++) {
                let tx = {
                    "from": this.account.address,
                    "to": this.contract.options.address,
                    "maxPriorityFeePerGas": ethers.utils.parseUnits('2', 'gwei'),
                    "maxFeePerGas": ethers.utils.parseUnits('2', 'gwei'),
                    "gasLimit": 60000,
                    "nonce": nonce,
                    "data": this.contract.methods.transfer('0x5cf83df52a32165a7f392168ac009b168c9e8915', 0).encodeABI(),
                    "chainId": this.config.chain_id
                }

                let signed_tx = await account.signTransaction(tx)
                txs.add(this.web3.eth.sendSignedTransaction.request(signed_tx.rawTransaction, (err, res) => {
                    if (err) {
                        this.benchmark_info.fail_tx += 1
                        if (!err.toString().includes('ReachLimit')) {
                            logger.error("send tx err: ", err)
                        }
                    } else this.benchmark_info.success_tx += 1
                }), signed_tx.transactionHash);

                nonce += 1;
            }

            await txs.execute()
            await txs.waitFinished();
        }
    }

>>>>>>> c8ce4c8 (feat(benchmarrk): contract support)
=======
>>>>>>> ae36ae0 (feat: uniswap v3)
}

module.exports = Benchmark
