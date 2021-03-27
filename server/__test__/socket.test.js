const io = require('socket.io-client')
const { server } = require('../bin/http');

describe('Suite of unit tests', function () {
  //ngejalain servernya
  server.attach(3010)
  // let sender;
  // let receiver;
  let socket;

  beforeEach(function (done) {
    // Setup
    socket = io.connect('http://localhost:3010', {
      'reconnection delay': 0
      , 'reopen delay': 0
      , 'force new connection': true
    });

    socket.on('connect', function () {
      console.log('worked...');
      done();
    });
  });

  afterEach( function (done) {
    // Cleanup
    if (socket.connected) {
      console.log('disconnecting...');
      socket.disconnect();
    } else {
      // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log('no connection to break...');
    }
    done();

  });
  afterAll(function (done) {
    server.detach()
  })

  describe('Chat tests', function() {
    // test('join-room - to battle ground chess', (done) => {
    //   const data1 = {
    //     roomid: 'dewa-kipas-54312',
    //     playerData : {
    //       id: 6,
    //       username: 'username',
    //       email: 'username@mail.com',
    //       pictureUrl: 'picture@mail.com',
    //       eloRating: 10,
    //     }
    //   }

    //   const data2 = {
    //     roomid: 'dewa-kipas-54312',
    //     playerData : {
    //       id: 7,
    //       username: 'enemy',
    //       email: 'enemy@mail.com',
    //       pictureUrl: 'picture@mail.com',
    //       eloRating: 10,
    //     }
    //   }

    //     socket.emit('create-room', data1)
    //     socket.on('create-room', dataRes => {})
    //     socket.emit('join-room', data2)
    //     socket.on('join-rrom', dataRes => {
    //       expect(dataRes).toBeInstanceOf(Object)
    //       expect(dataRes).toHaveProperty('roomid')
    //       expect(dataRes).toHaveProperty('playerOne')
    //       expect(dataRes).toHaveProperty('playerTwo')
    //       done()
    //     })
    //   })
      test('move - to battle ground chess', (done) => {
        const data = {
          roomid: 'dewa-kipas-54312',
          move: 'e2 e4'
        }

        socket.emit('move', data)

        socket.on('enemymove', dataRes => {
          console.log(dataRes, 'ini data ressssssssssssssssssssssssssssssssssssssssssssssss')
          expect(dataRes).toBeInstanceOf(Object)
          expect(dataRes).toHaveProperty('roomid')
          done()
        })
        // try {
        //   const dataRes = await socket.on('enemymove')
        //   console.log(dataRes, 'ini data ressssssssssssssssssssssssssssssssssssssssssssssss')
        //   expect(Array.isArray(dataRes)).toEqual(false)
        //   done()
        // } catch (error) {
        //   console.log(error)
        //   done(error)
        // }
      })

    })
    // test('Sending message to the chat', (done) => {
    //   const data = {
    //     roomName: 'Teknologi Informasi',
    //     sender: 'Budi',
    //     message: 'test message'
    //   }

    //   socket.emit('send-message', data)

    //   socket.on('room-detail', dataRes => {
    //     expect(dataRes).toBeInstanceOf(Object)
    //     expect(dataRes).toHaveProperty('name')
    //     expect(dataRes).toHaveProperty('admin')
    //     expect(dataRes).toHaveProperty('users')
    //     expect(dataRes).toHaveProperty('messages')
    //     expect(dataRes.messages).not.toHaveLength(0);
    //     expect(dataRes.messages).toBeInstanceOf(Array)
    //     expect(dataRes.messages[0]).toBeInstanceOf(Object)
    //     expect(dataRes.messages[0]).toEqual(
    //       expect.objectContaining({
    //         sender: data.sender,
    //         message: data.message
    //       })
    //     )
    //     done()
    //   })
    // })

    // test('Show typing message', (done) => {
    //   let payload = {
    //     room: 'Teknologi Informasi',
    //     name: 'Budi'
    //   }
    //   socket.emit('typing-start', payload)

    //   socket.on('typing-start', data => {
    //     expect(data).toBe(payload.name)
    //     done()
    //   })
    // })

  })