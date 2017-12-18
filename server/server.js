var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp');



var Todo = mongoose.model('Todo',{
  text:{
    type:String
  },
  complete: {
    type:Boolean
  },
  completedAt:{
    type:Number
  }
});


var newTodo = new Todo({
  text:'Cook Dinner',
  complete:true,
  completedAt: 123
});

newTodo.save().then((doc) => {
  console.log("Saved todo: ", doc);
},
(e) => {
  console.log('Unable to save', e);
});
