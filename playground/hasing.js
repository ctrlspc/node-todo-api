const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
var message = 'I am user number 1';

var hash = SHA256(message).toString();

console.log('message: ', message);
console.log('hash: ', hash);

var data = {
  id:10
}

var token = jwt.sign(data, '123abc');

console.log('signed token:', token);

var decoded = jwt.verify(token, '123abc');

console.log('decoded:', decoded );
