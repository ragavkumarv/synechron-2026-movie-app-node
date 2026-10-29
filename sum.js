// arrow function - built sum
// const

console.log(process.argv);

const [, , num1, num2] = process.argv;

// console.log(num1, num2);

const sum = (n1, n2) => Number(n1) + Number(n2);
console.log(sum(num1, num2));
