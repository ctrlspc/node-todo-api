const expect = require('expect');
const request = require('supertest');
const {ObjectId} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {testTodos,testUsers,populateTodos, populateUsers} = require('./seed/seed');


beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('Should create a new todo',(done) => {
    var text = 'test the application';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should not create todo with invalid body data', (done) => {
    //send with empty obj
    //expect a 400
    //expect there to be no Todos

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2);
          done();
        }).catch((e) => done(e));
      });
  });
});


describe('GET /todos', () => {


  it('Should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  })
})

describe('GET /todos/:id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${testTodos[0]._id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testTodos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectId()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  })


})

describe('DELETE /todos/:id', () => {

  it('Should delete a todo doc, returning it', (done) => {

    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should return 404 if the todo was not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectId()}`)
      .expect(404)
      .end(done);
  })

  it('Should return 404 if the id was invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  })
});

describe('PATCH /todos/:id', () => {
  it('Should update a todo where the id exists and return the updated todo',  (done) => {
    var hexId = testTodos[0]._id.toHexString();
    var updatedText = 'This is some updatedText';

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        text:updatedText
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedText);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(updatedText);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should not allow you to update the id or completedAt properties', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        _id:new ObjectId(),
        completedAt:new Date().getTime()
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo._id.toHexString()).toBe(hexId);
          expect(todo.completedAt).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should set completeDate where true is supplied for the completed property', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        complete:true
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.complete).toBe(true);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo.completedAt).toBeA('number');
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should nullify completdAt if you set complete as false', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .send({
        complete:false
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.complete).toBe(false);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo.completedAt).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should return 404 if the todo does not exist',(done) => {
    request(app)
      .patch('/todos/123')
      .expect(404)
      .end(done);
  });

  it('Should return 404 if the id is invalid', (done) => {
    request(app)
      .patch(`/todos/${new ObjectId()}`)
      .expect(404)
      .end(done);
  });
});

describe('POST /user', () => {


  it('Should save the user if succesful', (done) => {
    var testUser = {
      email:'me@home.com',
      password:'averysafepassword'
    };

    request(app)
      .post('/users')
      .send(testUser)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body.user._id).toExist();
        expect(res.body.user.email).toBe(testUser.email);
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUser.email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(testUser.password);
          done();
        }).catch((e) => done(e))
      });
  });

  it('Should return a 400 error if the email is not unique', (done) => {
    var testUser = {
      email:testUsers[0].email,
      password:'averysafepassword'
    };

    request(app)
      .post('/users')
      .send(testUser)
      .expect(400)
      .end(done);
  });

  it('Should return a 400 error if the email is not valid', (done) => {
    var testUser = {
      email:'notvalid',
      password:'averysafepassword'
    };

    request(app)
      .post('/users')
      .send(testUser)
      .expect(400)
      .end(done);
  });
});

describe('GET /users/me', () => {
  it('should return a user if authenticated', (done) => {


    request(app)
      .get('/users/me')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(testUsers[0]._id.toHexString());
        expect(res.body.email).toBe(testUsers[0].email);
      })
      .end(done);
  });

  it('should return a 401 if the user is not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => expect(res.body).toEqual({}))
      .end(done);
  });
});
