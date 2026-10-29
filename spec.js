const os = require("os");

const printBytesToGB = (bytes) => `${(bytes / 1024 ** 3).toFixed(2)}GB`;

console.log(os.version());
console.log(os.cpus());

// console.log(os.totalmem() / 1024 ** 3);

// console.log(os.freemem() / 1024 ** 3);

console.log(printBytesToGB(os.totalmem()));
console.log(printBytesToGB(os.freemem()));
