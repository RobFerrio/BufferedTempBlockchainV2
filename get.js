require('dotenv').config();
const Web3 = require('web3');
const fs = require('fs-extra');

const url = process.env.WEB3_PROVIDER_URI
const web3 = new Web3(url);
let accAddr = process.env.SIGNER_LOCAL_ADDRESS;

let abi = JSON.parse(fs.readFileSync('./Contract/SimpleTemp.abi', 'utf8'));
let contractAddr = fs.readFileSync('./Contract/address.txt', 'utf8');
const contract = new web3.eth.Contract(abi, contractAddr);

async function get(){
    let res = await contract.methods.getMeasurements().call({'from': accAddr});
    var i = 0;
    for (let m of res){
        i++;
        console.log(i + " => temp: " + m[0] + " time: " + new Date(m[1] * 1000).toLocaleString())
    }
}

get();