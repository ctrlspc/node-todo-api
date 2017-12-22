// const {SHA256} = require('crypto-js');
// const jwt = require('jsonwebtoken');
// var message = 'I am user number 1';
//
// var hash = SHA256(message).toString();
//
// console.log('message: ', message);
// console.log('hash: ', hash);
//
// var data = {
//   id:10
// }
//
// var token = jwt.sign(data, '123abc');
//
// console.log('signed token:', token);
//
// var decoded = jwt.verify(token, '123abc');
//
// console.log('decoded:', decoded );

var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);

console.log('Salt: ', salt);
console.log('Hash: ', hash);

var bcrypt = require('bcryptjs');
bcrypt.genSalt(10, function(err, salt) {
  console.log('Salt: ', salt);

    bcrypt.hash("B4c0/\/", salt, function(err, hash) {
      console.log('Hash: ', hash);


      bcrypt.compare("B4c0/\/1", hash, function(err, res) {
        if(res) {
          console.log(true);
        } else {
          console.log(false);
        }
      });
    });
});
