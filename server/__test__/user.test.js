const request = require("supertest");
const app = require("../app");
const generateToken = require("../helpers/jwt");
const { User, sequelize } = require("../models/index");

let access_token = "";
let idUser = 0;

beforeAll(() => {
  access_token = generateToken({
    id: 1,
    email: "admin@mail.com",
  });
  User.create({
    username: "testing",
    email: "testing@mail.com",
    password: "1234567",
  });
});

afterAll((done) => {
  User.destroy({ where: {} })
    .then(() => {
      sequelize.close();
      done();
    })
    .catch((err) => {
      done(err);
    });
});

// users register
describe("register user, route = /users/register", () => {
  it("201 success register", function (done) {
    let body = {
      username: "admin",
      email: "admin@mail.com",
      password: "12345678",
    };

    request(app)
      .post("/users/register")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("id");
        expect(typeof res.body.id).toEqual("number");
        done();
        idUser = res.body.id
      });
  });

  it("400 failed register - password is empty", function (done) {
    let body = {
      username: "admin",
      email: "admin@mail.com",
      password: "",
    };

    request(app)
      .post("/users/register")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        expect(res.body.error).toEqual("VALIDATION_ERROR");
        expect(typeof res.body.message).toEqual("object");
        expect(Array.isArray(res.body.message)).toEqual(true);
        done();
      });
  });

  it("400 failed register - email is empty", function (done) {
    let body = {
      username: "admin",
      email: "",
      password: "1234567",
    };

    request(app)
      .post("/users/register")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  it("400 failed register - email format is not correct", function (done) {
    let body = {
      username: "admin",
      email: "hacktiv.com",
      password: "1234567",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  it("400 failed register - email and password are empty", function (done) {
    let body = {
      username: "admin",
      email: "",
      password: "",
    };

    request(app)
      .post("/users/register")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  // CONSTRAINT
  it("400 failed register - email not unique", function (done) {
    let body = {
      username: "testing",
      email: "testing@mail.com",
      password: "1234567",
    };

    request(app)
      .post("/users/register")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });
});

// Login User
describe("Login user, route = /login", function () {
  it("200 success login", function (done) {
    let body = {
      email: "admin@mail.com",
      password: "12345678",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("email");
        expect(typeof res.body.id).toEqual("number");
        expect(typeof res.body.email).toEqual("string");
        expect(typeof res.body.username).toEqual("string")
        expect(typeof res.body.pictureUrl).toEqual("string")
        expect(typeof res.body.eloRating).toEqual("number")
        done();
      });
  });

  it("400 failed login - wrong password", function (done) {
    let body = {
      email: "admin@mail.com",
      password: "7654321",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  it("404 failed login - email not found", function (done) {
    let body = {
      email: "hacktiv@mail.com",
      password: "1234567",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  it("400 failed login - email and password are empty", function (done) {
    let body = {
      email: "",
      password: "",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  it("400 failed login - password are empty", function (done) {
    let body = {
      email: "admin@mail.com",
      password: "",
    };

    request(app)
      .post("/users/login")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });
});

//users leader board
describe("leaderboard user, route = /users/leaderboard", function () {
  it("200 success read users data", function (done) {
    request(app)
      .get("/users/leaderboard")
      .set("access_token", access_token)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toEqual(true);
        done();
      });
  }),
  it("401 failed read users - access token not found", function (done) {
    request(app)
      .get("/users/leaderboard")
      // .set('access_token', access_token)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });
});

describe("Google login, route = /users/googleLogin", function () {
  it("201 success register new user via googlelogin", function (done) {
    let body = {
      name: "dewakipas",
      email: "dewakipas@mail.com",
    };

    request(app)
      .post("/users/googlelogin")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(201);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("username");
        expect(typeof res.body.username).toEqual("string");
        expect(res.body).toHaveProperty("email");
        expect(typeof res.body.email).toEqual("string");
        done();
      });
  });

  it("200 success login via googlelogin", function (done) {
    let body = {
      name: "dewakipas",
      email: "dewakipas@mail.com",
    };

    request(app)
      .post("/users/googlelogin")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("username");
        expect(typeof res.body.username).toEqual("string");
        expect(res.body).toHaveProperty("email");
        expect(typeof res.body.email).toEqual("string");
        done();
      });
  });

  it("400 failed login via googlelogin", function (done) {
    let body = {
      name: "dewabujana",
      email: "",
    };

    request(app)
      .post("/users/googlelogin")
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });

  
})

describe("Update eloRating, route = /users/updatescore", function () {
  
  it("200 success update elorating", function (done) {
    
    let body = {
      id: idUser,
      eloRating: 10,
    };

    request(app)
      .put("/users/updatescore")
      .set('access_token', access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(200);
        expect(typeof res.body).toEqual("object");
        done();
      });
  })

  it("401 dont have acces token", function (done) {
    
    let body = {
      id: idUser,
      eloRating: 10,
    };

    request(app)
      .put("/users/updatescore")
      // .set('access_token', access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  })

  it("404 ID not found", function (done) {
    
    let body = {
      id: 50000000,
      eloRating: 10,
    };

    request(app)
      .put("/users/updatescore")
      .set('access_token', access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(404);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  })

})