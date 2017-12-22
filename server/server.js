
require('./config/config');

var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// POST /todos *****************
app.post('/todos', (req,res) => {
  var todo = new Todo({
    text:req.body.text
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// GET /todos **********************
app.get('/todos',(req,res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});


// GET /todos/:id ******************
app.get('/todos/:id', (req, res) => {

  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findById(id).then((todo) => {
    if(todo) {
      return res.send({todo});
    }
    res.status(404).send();
  }).catch((e) => {
    res.status(400).send();
  });

});

// DELETE /todos/:id **************

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo) => {
    if(todo) {
      return res.send({todo});
    }
    return res.status(404).send();
  }).catch((e) => {
    return res.status(400).send();
  });
});

// PATCH /todos/:id ****************

app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;

  var body = _.pick(req.body,['text', 'complete']);

  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  if(_.isBoolean(body.complete) && body.complete){
    body.completedAt = new Date().getTime();
  } else {
    body.complete = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id,{$set:body},{new:true}).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch ((e) => {
    res.status(400).send();
  });

});


//POST /Users ****************
app.post('/users', (req,res) => {
  var body = _.pick(req.body,['email', 'password']);

  var user = new User(body);

  user.save()
    .then(() => {return user.generateAuthToken()})
    .then((token) => {
        res.header('x-auth', token).send({user});
      })
    .catch((e) => {
      console.log(e);
      res.status(400).send();
    });
});
//pick email and password
//create a user and save it
//if its succesful send it back(?)
//otherwise send a 400

//*******************
app.listen(port, () => {
  console.log(`Started on Port ${port}`);
});

module.exports = {app};
