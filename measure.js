const Queue = require('bull')
const SensorHub = require('dockerpi-sensorhub')

const measurementsQueue = new Queue('measure');
const hub = new SensorHub();

if(!hub || !hub.read()) throw new Error('Unable to init the hub');

measurementsQueue.process('./store.js')     //Funzione process eseguita in un altro processo
measurementsQueue.on('completed', (job, result) => {    //Listener job completati
    console.log(`Job completed with result => ${result}`);
})

for (let i=0; i<100; i++){
    const measurements = await hub.read();
    const now = Math.floor(Date.now() / 1000)   //La precisione della data la prendo al secondo anzichè al millisecondo

    console.log("temp: " + measurements.externalTemp + " time: " + new Date(now * 1000).toISOString().slice(0, 19).replace('T', ' '));

    measurementsQueue.add({ temp: measurements.externalTemp, time: now })
}
