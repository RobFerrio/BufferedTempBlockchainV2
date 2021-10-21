require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs-extra');

const url = process.env.WEB3_PROVIDER_URI
const web3 = new Web3(url);
let privateKey = process.env.SIGNER_LOCAL_PRIVATE_KEY;
let accAddr = process.env.SIGNER_LOCAL_ADDRESS;

let abi = JSON.parse(fs.readFileSync('./Contract/SimpleTemp.abi', 'utf8'));
let contractAddr = fs.readFileSync('./Contract/address.txt', 'utf8');
const contract = new web3.eth.Contract(abi, contractAddr);

module.exports = async function (job) {
    let encodedABI = contract.methods.storeMeasurement(job.data.temp, job.data.time).encodeABI();
    let nonce = web3.utils.numberToHex(await web3.eth.getTransactionCount(accAddr));
    let txData = {
        nonce: ""+nonce,
        data: ""+encodedABI,
        from: ""+accAddr,
        to: ""+contract.options.address,
        gas: web3.utils.toHex(300000),
        gasPrice: web3.utils.toHex(0)
    };

    let tx = await web3.eth.accounts.signTransaction(txData, privateKey);
    let result = await web3.eth.sendSignedTransaction(tx.rawTransaction);

    return Promise.resolve(result);
}