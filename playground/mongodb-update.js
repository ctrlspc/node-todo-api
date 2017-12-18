// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();

console.log(obj);



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err){
    return console.log('There was an error connecting to the database: ', err);
  }

  console.log('Connected to MongoDB server');

  // db.collection('Todos')
  // .findOneAndUpdate(
  //   {
  //     _id:new ObjectID('5a37dc8ccf302160e2f13148')
  //   },{
  //     $set: {
  //       completed:true
  //     }
  //   }, {
  //     returnOriginal:false
  //   }).then((res) => {
  //     console.log(res);
  //   })



  db.collection('Users')
  .findOneAndUpdate({
    _id:new ObjectID('5a37d2a43d5d943c7e85191e')
  },{
    $set: {
      name:'Future Jason'
    },
    $inc: {age:1}
  },{
    returnOriginal:false
  }).then((res) => {
    console.log(res);
  })
  //db.close();
})
