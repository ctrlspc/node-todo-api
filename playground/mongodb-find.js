// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();

console.log(obj);



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('There was an error connecting to the database: ', err);
  }

  console.log('Connected to MongoDB server');

  db.collection('Users').find({age:{$lt:5}}).toArray().then ((results) => {
    console.log(`Todos`);

    console.log(JSON.stringify(results, undefined, 2));


  }, (err) => {
    console.log('Unable to fetch todos', err);
  })

  //db.close();
})
