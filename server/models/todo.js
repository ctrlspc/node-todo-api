var mongoose = require('mongoose');

var Todo = mongoose.model('Todo',{
  text:{
    type:String,
    required:true,
    minLength:1,
    trim:true
  },
  complete: {
    type:Boolean,
    default: false
  },
  completedAt:{
    type:Number,
    default: null
  },
  _creator: {
    required:true,
    type: mongoose.Schema.Types.ObjectId
  }
});


module.exports = {Todo};
