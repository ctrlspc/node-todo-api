const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
var _ = require('lodash');
var bcrypt = require('bcryptjs');
var salt = 'lajsnfadlsjfndaljndvljn';

var UserSchema = new mongoose.Schema({
  email: {
    type:String,
    required:true,
    minLength:1,
    trim:true,
    unique:true,
    validate: {
      validator: validator.isEmail,
      message:'{VALUE} is not a valid email'
    }
  },
  password: {
    type:String,
    require: true,
    minLength: 6
  },
  tokens: [{
    access: {
      type:String,
      require:true
    },
    token: {
      type:String,
      require:true
    }
  }]
}, {usePushEach: true});

UserSchema.pre('save', function (next) {
  var user = this;

  if(user.isModified('password')){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
          user.password = hash;
          next()
        });
    });
  } else {
    next();
  }
});

UserSchema.methods.toJSON = function () {
  var user = this;

  var userObject = user.toObject();

  return _.pick(userObject, ['_id','email']);
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(), access}, salt).toString();

  user.tokens = user.tokens.concat([{access, token}]);
  console.log('token:', token);
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.validatePassword = function (password) {

  var user = this;
  return bcrypt.compareSync(password, this.password);
}

UserSchema.statics.findByToken = function (token) {
  var User = this;
  //verify token
  var decoded;

  try {
    decoded = jwt.verify(token,salt);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    '_id':decoded._id,
    'tokens.access':'auth',
    'tokens.token':token
  });
};

var User = mongoose.model('User', UserSchema);

module.exports = {User};
