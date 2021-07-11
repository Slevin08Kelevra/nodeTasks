const digitGenerator = require('crypto-secure-random-digit');
 
// Get one random digit
const randomDigit = digitGenerator.randomDigit();
//console.log(randomDigit); // e.g. 4
 
// Get a list with 10 random digits:
const randomDigits = digitGenerator.randomDigits(100);
let joined = randomDigits.join("")
console.log(joined); // e.g. [7, 1, 0, 0, 5, 9, 3, 8, 2, 7]