const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');


var id = '5a393f2b1bfbe6506865af7a';


// if (!ObjectID.isValid(id)) {
//   console.log('ID is not valid');
//   return;
// }
//
// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos: ', todos);
// });
//
// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo: ', todo);
// });
//
// Todo.findById(id).then((todo) => {
//   console.log('Todo: ', todo);
// });
//
// User.findById(userId).then((todo) => {
//   console.log('Todo: ', todo);
// });

User.findById('5a37f2c3382ecec13fcd8ac6').then((user) => {
  if(!user){
    return console.log('No User Found');
  }

  console.log(JSON.stringify(user, null, 2));
},(e) => {
  console.log(e);
});
