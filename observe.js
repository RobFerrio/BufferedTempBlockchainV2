const Queue = require('bull')
const measurementsQueue = new Queue('sensorhub-queue');

measurementsQueue.on('global:completed', (job, result) => {
    console.log(`Transaction completed with receipt => ${result}`);
})
measurementsQueue.on('global:progress', (job, progress) => {
    console.log(`Transaction hash => ${progress}`);
})
measurementsQueue.on('global:error', (job, error) => {
    console.log(`Error => ${error}`);
})