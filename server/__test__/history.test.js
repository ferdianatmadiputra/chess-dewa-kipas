const request = require("supertest");
const app = require("../app");
const UserController = require("../controllers/userController");
const generateToken = require("../helpers/jwt");
const { User, sequelize } = require("../models/index");

let access_token = "";
let id1 = 0;
let id2 = 0;

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

describe("add history route = /histories", function () {
  beforeAll(() => {
    access_token = generateToken({
      id: 3,
      username: "adminaja",
      email: "admin@mail.com",
      pictureUrl: "images.jpg",
      eloRating: 0,
    });
    return User.create({
      username: "player 1",
      email: "player1@mail.com",
      password: "password1",
    })
      .then((user) => {
        id1 = user.id;
        return User.create({
          username: "player 2",
          email: "player2@mail.com",
          password: "password2",
        });
      })
      .then((user2) => {
        id2 = user2.id;
        // done()
      })
      .catch((err) => {
        // done(err);
      });
  });

  it("201 success add history", function (done) {
    let body = {
      playerOne: id1,
      playerTwo: id2,
      status: 1,
    };

    request(app)
      .post("/histories")
      .set("access_token", access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body).toHaveProperty("playerOne");
        expect(res.body).toHaveProperty("playerTwo");
        expect(res.body).toHaveProperty("status");

        expect(typeof res.body).toEqual("object");
        expect(typeof res.body.id).toEqual("number");
        expect(typeof res.body.playerOne).toEqual("number");
        expect(typeof res.body.playerTwo).toEqual("number");
        expect(typeof res.body.status).toEqual("number");
        done();
      });
  });

  it("401 failed add history - without access token", function (done) {
    const body = {
      playerOne: id1,
      playerTwo: id2,
      status: 1,
    };

    request(app)
      .post("/histories")
      // .set('access_token',access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(401);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.error).toEqual("string");
        expect(typeof res.body.message).toEqual("string")
        done();
      });
  });

  it("400 failed add history - empty player", function (done) {
    const body = {
      playerOne: "",
      playerTwo: "",
      status: 1,
    };

    request(app)
      .post("/histories")
      .set("access_token", access_token)
      .send(body)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        expect(res.status).toEqual(400);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        expect(typeof res.body.message).toEqual("object");
        done();
      });
  });

  it("400 failed add history - empty player one", function (done) {
    const body = {
      playerOne: "",
      playerTwo: id2,
      status: 1,
    };

    request(app)
      .post("/histories")
      .set("access_token", access_token)
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

  it("400 failed add history - empty player two", function (done) {
    const body = {
      playerOne: id1,
      playerTwo: "",
      status: 1,
    };

    request(app)
      .post("/histories")
      .set("access_token", access_token)
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

  it("400 failed add history - empty status", function (done) {
    const body = {
      playerOne: id1,
      playerTwo: id2,
      status: "",
    };

    request(app)
      .post("/histories")
      .set("access_token", access_token)
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

describe("read history by id route = /histories/:id", function () {
  beforeAll(() => {
    access_token = generateToken({
      id: 3,
      username: "adminaja",
      email: "admin@mail.com",
      pictureUrl: "images.jpg",
      eloRating: 0,
    });
    return User.create({
      username: "player 1",
      email: "player1@mail.com",
      password: "password1",
    })
      .then((user) => {
        id1 = user.id;
        return User.create({
          username: "player 2",
          email: "player2@mail.com",
          password: "password2",
        });
      })
      .then((user2) => {
        id2 = user2.id;
        // done()
      })
      .catch((err) => {
        // done(err);
      });
  });
  it("200 success read history by id player", function (done) {
    
    request(app)
      .get(`/histories/${id1}`)
      .set("access_token", access_token)
      .send()
      .end((err, res) => {
        if (err) {
          
          done(err);
        }
        
        expect(res.status).toEqual(200);
        expect(Array.isArray(res.body)).toEqual(true);
        done();
      });
  });

  it("400 failed read history - without access token", function (done) {
    const body = {
      playerOne: id1,
      playerTwo: id2,
      status: 1,
    };

    request(app)
      .get(`/histories/${id1}`)
      // .set('access_token',access_token)
      .send()
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

  it("500 failed read history - id not valid", function (done) {

    request(app)
      .get(`/histories/adsaf`)
      .set("access_token", access_token)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        expect(res.status).toEqual(500);
        expect(typeof res.body).toEqual("object");
        expect(res.body).toHaveProperty("error");
        expect(typeof res.body.error).toEqual("string");
        done();
      });
  });
});
