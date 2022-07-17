<<<<<<< HEAD
const ERC20JSON = require("./ERC20.json");
const ethers = require("ethers");
=======
const Web3 = require('web3');
const { WaitableBatchRequest } = require('./utils');
const ERC20JSON = require('./ERC20.json');
const AccountFactory = require('./account_factory');
const logger = require('./logger');
<<<<<<< HEAD
>>>>>>> c8ce4c8 (feat(benchmarrk): contract support)
=======
const ethers = require('ethers');
>>>>>>> e6a67d2 (fix(benchmark) fix gas (#102))

class Benchmark {
    constructor(info) {
        this.config = info.config;

        this.contract = new ethers.Contract(
            info.contracts["ERC20"],
            ERC20JSON.abi,
        );
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
        this.accounts = [];
        const accountFactory = new AccountFactory()
        for (let i = 0; i < 20; i++) {
            let accounts = await accountFactory.get_accounts(this.config, 10000000, 50);
            for (const account of accounts) {
                this.accounts.push(account)
            }
        }
    }

    async end() {
        this.benchmark_info.transfer_count = this.benchmark_info.success_tx + this.benchmark_info.fail_tx;
    }

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
}

module.exports = Benchmark
