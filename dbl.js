// console.log(process.argv);

const [, , num] = process.argv;

const dbl = (n) => n * 2;
console.log(dbl(num));
