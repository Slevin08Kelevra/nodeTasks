const moment = require('moment');
const random = require('random');

const strategy = [[9, 9, 2, 4, 2, 3], [1, 6, 3, 9, 5, 7], [8, 7, 8, 3, 5, 9], [9, 9, 9, 9, 9, 6],
[4, 6, 1, 1, 2, 5], [2, 5, 7, 5, 3, 9], [5, 5, 5, 8, 9, 6], [6, 7, 2, 9, 8, 9], [9, 2, 7, 6, 4, 3],
[9, 3, 9, 2, 3, 4], [4, 1, 2, 3, 3, 4], [4, 4, 7, 5, 9, 8], [1, 6, 6, 6, 8, 2], [5, 9, 5, 7, 9, 4],
[1, 5, 9, 8, 5, 8], [8, 5, 4, 2, 8, 2], [9, 7, 7, 1, 9, 8], [4, 7, 7, 4, 6, 5], [4, 7, 8, 8, 6, 1],
[6, 3, 1, 4, 9, 6], [9, 9, 1, 8, 9, 6], [2, 5, 2, 4, 3, 6], [8, 8, 2, 1, 2, 7], [6, 8, 1, 5, 4, 8],
[2, 7, 3, 4, 1, 6], [4, 3, 4, 3, 6, 4], [3, 9, 3, 9, 3, 5], [7, 5, 2, 6, 4, 4], [9, 5, 7, 5, 2, 8],
[9, 3, 9, 8, 6, 3], [6, 4, 5, 7, 6, 8], [4, 2, 9, 4, 8, 5], [4, 8, 8, 3, 6, 9], [4, 7, 3, 1, 9, 8],
[5, 3, 8, 1, 9, 7], [7, 2, 4, 5, 8, 8], [3, 3, 7, 8, 4, 9], [5, 5, 1, 4, 1, 4], [1, 7, 8, 1, 7, 8],
[6, 1, 2, 6, 7, 6], [1, 3, 6, 3, 9, 7], [3, 6, 2, 6, 4, 2], [4, 6, 2, 8, 5, 1], [9, 7, 2, 2, 8, 6],
[7, 1, 7, 9, 1, 8], [6, 3, 1, 5, 8, 8], [9, 3, 7, 4, 1, 9], [1, 1, 8, 2, 3, 7], [1, 7, 2, 7, 5, 8],
[6, 1, 4, 3, 8, 5], [6, 3, 9, 4, 6, 5], [7, 5, 7, 8, 9, 2], [1, 7, 9, 9, 9, 8], [2, 1, 1, 2, 4, 2],
[6, 7, 6, 1, 9, 2], [8, 3, 8, 4, 6, 3], [6, 7, 4, 2, 5, 7], [9, 6, 9, 6, 8, 3], [6, 2, 9, 5, 5, 2],
[9, 1, 2, 6, 1, 5], [7, 5, 6, 7, 6, 9], [7, 2, 4, 2, 9, 7], [4, 4, 5, 4, 6, 8], [9, 5, 8, 5, 3, 4],
[7, 5, 7, 2, 3, 6], [6, 6, 8, 3, 3, 7], [9, 4, 5, 1, 6, 7], [8, 4, 8, 5, 3, 9], [8, 4, 4, 7, 3, 8],
[5, 8, 2, 1, 5, 1], [2, 7, 1, 1, 9, 2], [7, 4, 2, 5, 1, 3], [3, 8, 2, 3, 4, 6], [6, 8, 2, 8, 8, 5],
[4, 8, 1, 9, 2, 4], [2, 4, 8, 8, 2, 4], [3, 2, 8, 1, 4, 3], [9, 2, 8, 2, 9, 5], [5, 1, 5, 5, 9, 6],
[8, 1, 5, 9, 8, 4], [4, 3, 5, 5, 4, 9], [6, 2, 1, 4, 5, 2], [4, 8, 7, 9, 6, 1], [5, 6, 1, 3, 3, 2],
[6, 2, 1, 7, 5, 9], [4, 1, 5, 6, 6, 6], [1, 4, 5, 3, 3, 7], [9, 4, 9, 8, 7, 7], [5, 7, 4, 5, 2, 8],
[4, 7, 1, 4, 7, 1], [5, 5, 4, 3, 9, 9], [7, 3, 4, 5, 7, 7], [9, 4, 5, 8, 4, 8], [7, 4, 8, 8, 7, 1],
[1, 9, 1, 3, 3, 2], [1, 1, 6, 7, 1, 8], [1, 2, 7, 1, 1, 3], [9, 9, 5, 3, 2, 4], [3, 2, 6, 3, 7, 6],
[7, 6, 2, 1, 2, 4]]

const scrambleddNumbers = "7925163804"
const scrambledLetters = "gNQnPFpwRMhsvBWrJySOfxUDjHelCXAGaqtzEkuZKIdcVobLmYiT"
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

const validator = []

validator.generateToken = () => {
    let cardId = Math.floor(Math.random() * 99)
    let basicToken = generateToken(cardId)
    let baseToken = Buffer.from(basicToken).toString('base64')

    let scrambledBaseToken = baseToken.replace(/([a-zA-Z]{1})/g, (letter) => {
        let realPos = letters.indexOf(letter)
        return scrambledLetters.charAt(realPos)
     });
     
     scrambledBaseToken = scrambledBaseToken.replace(/([0-9]{1})/g, (number) => {
        return scrambleddNumbers.charAt(new Number(number))
     });


    return `Bearer ${scrambledBaseToken}`
}

validator.isNotValid = (token) => {

    token = token.replace(/Bearer /g, '')

    let reSorting = token.replace(/([a-zA-Z]{1})/g, (char) => {
        let fakePos = scrambledLetters.indexOf(char)
        return letters.charAt(fakePos)
    });

    token = reSorting.replace(/([0-9]{1})/g, (char) => {
        return scrambleddNumbers.indexOf(new Number(char))
    });

    token = Buffer.from(token, 'base64').toString('utf-8');
    let chars = token.split('')
    let TokenPre = chars[0]
    let TokenPost = chars.slice(-1)

    let cardId = new Number((TokenPre === "H") ? TokenPost : TokenPre + TokenPost)

    let validToken = generateToken(cardId)

    return (validToken === token) ? false : true
}

function generateToken(cardId) {

    let hour = moment().hour()
    let minute = moment().minute()
    let day = new Number(moment().format('D'))
    let month = new Number(moment().format('M'))
    let year = moment().year() - 2000
    let dayOfYear = moment().dayOfYear()


    let card = strategy[cardId]

    let result = (hour + card[0]) * (minute + card[1]) * (day + card[2]) * (month + card[3]) * (year + card[4]) * (dayOfYear + card[5])

    let parcial = result - card[0] - card[2] - card[5]

    let ranString = cardId.toString()
    let pre, post
    if (ranString.length == 1) {
        pre = 'H'
        post = ranString
    } else {
        let splited = ranString.split('')
        pre = splited[0]
        post = splited[1]
    }

    let validToken = pre + parcial.toString().replace(/0/g, 'X') + post
    return validToken

}

module.exports = validator;