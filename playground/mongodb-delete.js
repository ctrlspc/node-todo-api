// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();

console.log(obj);



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('There was an error connecting to the database: ', err);
  }

  console.log('Connected to MongoDB server');

  //deleteMany
  // db.collection('Todos').deleteMany({text:'Drink Coffee'}).then((res) => {
  //   console.log(res);
  // })
  //deleteOne
  // db.collection('Todos').deleteOne({text:'Drink Coffee'}).then((res) => {
  //   console.log(res);
  // })
  //findOneAndDelete
  // db.collection('Todos').findOneAndDelete({completed:false}).then((res) => {
  //   console.log(res);
  // })


  //find and delete all that are completed
  // db.collection('Todos').deleteMany({completed:true}).then((res) => {
  //   console.log(res);
  // })
  //delete 5a37cc3438d9373c1396aa8e

  db.collection('Todos').findOneAndDelete({_id:new ObjectID('5a37cc3438d9373c1396aa8e')}).then((res) => {
    console.log(res);
  })
  //db.close();
})
