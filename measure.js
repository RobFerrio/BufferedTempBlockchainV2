require('dotenv').config();
const Queue = require('bull')
const SensorHub = require('dockerpi-sensorhub')
const Web3 = require('web3');

const url = process.env.WEB3_PROVIDER_URI
const web3 = new Web3(url);
let accAddr = process.env.SIGNER_LOCAL_ADDRESS;

const measurementsQueue = new Queue('sensorhub-queue');
const hub = new SensorHub();

if(!hub || !hub.read()) throw new Error('Unable to init the hub');

measurementsQueue.process(5, __dirname + '/store.js')     //Funzione process eseguita in un altro processo, 5 consumatori

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function start(){
    var nonce = web3.utils.numberToHex(await web3.eth.getTransactionCount(accAddr));	//Ho deciso che la parallelizzazione è più importante della separazione tra misura e blockchain: se prendessi il count nella store con più consumatori sicuramente ci sarebbero più transazioni con lo stesso nonce
    for (let i=0; i<100; i++){
        const measurements = await hub.read();
        const now = Math.floor(Date.now() / 1000)   //La precisione della data la prendo al secondo anzichè al millisecondo

        console.log("temp: " + measurements.externalTemp + " time: " + new Date(now * 1000).toLocaleString());

        let p = measurementsQueue.add({ temp: measurements.externalTemp, time: now, nonce: nonce })
	nonce++;
        await sleep(1000);
	await p;	//Voglio che le misure nella queue siano in ordine
    }
}

start();
