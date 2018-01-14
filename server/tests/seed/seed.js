const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');




const testUserOneID = new ObjectId();
const testUserTwoID = new ObjectId();

const testUsers = [{
  _id: testUserOneID,
  email:'testuser1@example.com',
  password:'1234567890',
  tokens: [{
    access:'auth',
    token:jwt.sign({_id:testUserOneID, access:'auth'}, process.env.JWT_SECRET).toString()
  }]
},{
  _id: testUserTwoID,
  email:'testuser2@example.com',
  password:'1234567890',
}];

const testTodos = [{
  _id: new ObjectId(),
  text:'Test todo 1',
  _creator:testUserOneID
}, {
  _id: new ObjectId(),
  text:'Test todo 2',
  _creator:testUserTwoID
}];

const populateTodos = (done) => {
  Todo.remove({})
  .then(() => {
    return Todo.insertMany(testTodos);
  })
  .then(() => done());
}

const populateUsers = (done) => {
  User.remove({})
  .then( () => {
    var userOne = new User(testUsers[0]).save();
    var userTwo = new User(testUsers[1]).save();

    return Promise.all([userOne, userTwo]);
  })
  .then(() => done());
}

module.exports = {testTodos,testUsers,populateTodos,populateUsers};
