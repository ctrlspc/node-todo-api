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
      .set('x-auth', testUsers[0].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  })
})

describe('GET /todos/:id', () => {

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${testTodos[0]._id}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(testTodos[0].text);
      })
      .end(done);
  });

  it('should not return a todo for a todo that I did not create', (done) => {
    request(app)
      .get(`/todos/${testTodos[1]._id}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  })

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectId()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  })


})

describe('DELETE /todos/:id', () => {

  it('Should delete a todo doc, returning it', (done) => {

    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should not delete a todo doc, not created by me', (done) => {

    var hexId = testTodos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy();
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should return 404 if the todo was not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectId()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  })

  it('Should return 404 if the id was invalid', (done) => {
    request(app)
      .delete('/todos/123')
      .set('x-auth', testUsers[0].tokens[0].token)
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
      .set('x-auth', testUsers[0].tokens[0].token)
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

  it('Should not allow you to update a todo if you are note the creator', (done) => {
    var hexId = testTodos[1]._id.toHexString();
    var updatedText = 'This is some updatedText';

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
      .send({
        text:updatedText
      })
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo.text).toBe(testTodos[1].text);
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should not allow you to update the id or completedAt properties', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
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
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should set completeDate where true is supplied for the completed property', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
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
          expect(typeof todo.completedAt).toBe('number');
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should nullify completdAt if you set complete as false', (done) => {
    var hexId = testTodos[0]._id.toHexString();

    request(app)
      .patch(`/todos/${hexId}`)
      .set('x-auth', testUsers[0].tokens[0].token)
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
          expect(todo.completedAt).toBeFalsy();
          done();
        }).catch((e) => done(e));
      });
  })

  it('Should return 404 if the todo does not exist',(done) => {
    request(app)
      .patch('/todos/123')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('Should return 404 if the id is invalid', (done) => {
    request(app)
      .patch(`/todos/${new ObjectId()}`)
      .set('x-auth', testUsers[0].tokens[0].token)
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
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body.user._id).toBeTruthy();
        expect(res.body.user.email).toBe(testUser.email);
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUser.email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(testUser.password);
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

describe('POST /users/login', () => {

  it('should set x-auth for valid request', (done) => {
    var testUser = {
      email:testUsers[1].email,
      password:testUsers[1].password
    }; //This user should not have any existing auth tokens

    request(app)
      .post('/users/login')
      .send(testUser)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUser.email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.toObject().tokens[0]).toMatchObject({
            access:'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e))
      });
  });

  it('should return 400 for invalid request', (done) => {
    var testUser = {
      email:testUsers[1].email,
      password:'invalidpassword'
    };

    request(app)
      .post('/users/login')
      .send(testUser)
      .expect(401)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUser.email}).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e))
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should delete the token for an authenticated user', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', testUsers[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUsers[0].email}).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e))

      });
  });


  it('should return 401 for an unauthenticated user', (done) => {
    request(app)
      .delete('/users/me/token')
      .expect(401)
      .end((err,res) => {
        if (err) {
          return done(err);
        }

        User.findOne({email:testUsers[0].email}).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e))

      });
  })
})
