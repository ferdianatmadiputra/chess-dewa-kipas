const app = require("../app");
const port = process.env.PORT || 4000;
const http = require("http");
const socketio = require("socket.io");

const { v4: uuidv4 } = require("uuid");
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "https://chess-dewa-kipas.web.app",
    credentials: true,
  },
});

let activeRooms = []; // isi nya array of object { roomid, playerOne, playerTwo }
let queueMatchmaking = [];
let users = {};

let roomId;

io.on("connection", (socket) => {
  socket.on("create-room", function (data) {
    // isinya { roomid: '', playerData }
    console.log(data.roomid, "ini roomid nya create room");
    roomId = data.roomid;
    activeRooms.push({ roomid: data.roomid, playerOne: data.playerData });
    socket.join(data.roomid);
    socket.emit("result", roomId);
  });

  socket.on("join-room", function (data) {
    // isinya { roomid: '', playerData }
    console.log(data.roomid, "ini roomid nya joinroom");
    const selectedRoom = activeRooms.find(
      (datum) => datum.roomid === data.roomid
    );
    if (selectedRoom) {
      selectedRoom.playerTwo = data.playerData;
      roomId = selectedRoom.roomid;
      console.log(selectedRoom);
      socket.join(data.roomid);
      io.to(data.roomid).emit("fullroom", { selectedRoom });
    } else {
      roomId = data.roomid;
      activeRooms.push({ roomid: data.roomid, playerOne: data.playerData });
      socket.join(data.roomid);
    }
  });
  socket.on("matchmaking", function (data) {
    console.log(data, "join matchmaking");
    queueMatchmaking.push({ socket, data });
    console.log(queueMatchmaking, "ini isi queue");
    if (queueMatchmaking.length % 2 === 0) {
      setTimeout(() => {
        let uuid = uuidv4().substring(0, 7);
        queueMatchmaking.sort((a, b) => b.eloRating - a.eloRating);
        const indexPlayer = queueMatchmaking.findIndex(
          (user) => user.data.id === data.id
        );
        socket.join(uuid);
        let indexenemy;
        if (indexPlayer % 2 === 1) {
          indexenemy = indexPlayer - 1;
        } else {
          indexenemy = indexPlayer + 1;
        }
        queueMatchmaking[indexenemy].socket.join(uuid);

        activeRooms.push({
          roomid: uuid,
          playerOne: data,
          playerTwo: queueMatchmaking[indexenemy].data,
        });
        console.log(activeRooms, "ini isi active rooms");
        io.to(uuid).emit("matchStart", {
          roomid: uuid,
          playerOne: data,
          playerTwo: queueMatchmaking[indexenemy].data,
        });
        if (indexPlayer % 2 === 1) {
          queueMatchmaking.splice(indexenemy, 2);
        } else {
          queueMatchmaking.splice(indexPlayer, 2);
        }
        console.log(
          queueMatchmaking,
          "ini isi queuematchmaking stelah masuk room"
        );
      }, 5000);
    }
  });

  socket.on("move", function (data) {
    console.log(data);
    socket.to(data.roomid).emit("enemymove", data); // exclude sender
  });

  socket.on("gameOver", function (data) {
    activeRooms = activeRooms.filter((room) => room.roomid !== data.roomid);
    console.log(data);
    socket.to(data.roomid).emit("youlose");
  });

  socket.on("stalemate", function (data) {
    activeRooms = activeRooms.filter((room) => room.roomid !== data.roomid);
    console.log(data);
    socket.to(data.roomid).emit("onStalemate");
  });

  socket.on("enemyTimeout", function (data) {
    activeRooms = activeRooms.filter((room) => room.roomid !== data.roomid);
    console.log(data);
    socket.to(data.roomid).emit("youwin");
  });

  socket.on("leaveRoom", function (data) {
    activeRooms = activeRooms.filter((room) => room.roomid !== data.roomid);
    console.log(data);
    socket.to(data.roomid).emit("youwin");
  });

  if (!users[socket.id]) {
    users[socket.id] = socket.id;
  }
  socket.emit("yourID", socket.id);
  io.sockets.emit("allUsers", users);

  socket.on("disconnect", () => {
    console.log("player disconnected");
    delete users[socket.id];
  });

  socket.on("callUser", (data) => {
    console.log(data, "calluser triggered");
    socket.to(data.roomid).emit("hey", {
      signal: data.signalData,
      from: data.from,
      callerUsername: data.callerUsername,
    });
  });

  socket.on("acceptCall", (data) => {
    console.log(data, "acceptcall received to server");
    socket.to(data.roomid).emit("callAccepted", data.signal);
  });

  socket.on("sendEmote", (data) => {
    console.log(data, "<<<<<<< CHECK ROOM ID");
    socket.to(data.roomid).emit("enemyEmoji", data);
  });
});

server.listen(port, () => console.log("Running on port: ", port));

module.exports = {
  server: io,
};
