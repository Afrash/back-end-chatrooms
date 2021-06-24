var mongo = require("mongodb");
var MongoClient = require('mongodb').MongoClient;
const express = require('express'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

const uri = "mongodb+srv://admin:admin@cluster0.cdxaj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var roomNumber;


client.connect(err => {

  console.log(err)
  console.log("Connected to MongoDB")

  const collection = client.db("circle").collection("messages");



  io.on('connection', (socket) => {

    console.log('user connected')

    socket.on('join', function (userNickname, chatroom) {
      socket.join(chatroom)

      console.log(roomNumber)

      console.log(userNickname + " : has joined the chat ");

      socket.broadcast.emit('userjoinedthechat', userNickname + " : has joined the chat ");
    });

    socket.on('messagedetection', (messageContent, senderNickname, timeStamp, signature, chatroom) => {

      console.log(roomNumber)
      //log the message in console 

      console.log(senderNickname + " :" + messageContent)
      //create a message object 
      let message = { "room": roomNumber, "message": messageContent, "senderNickname": senderNickname, "timeStamp": timeStamp }
      let sign = { "signature": signature }
      // send the message to the client side  
      // console.log("test")
      saveMessage(chatroom, messageContent, senderNickname, timeStamp, signature);

      io.to(chatroom).emit('message', message, sign);
      //    io.emit('message', message, sign);


    });

    socket.on('new-message', (message, room) => {
      console.log('new-message called', message, room);
      io.to(room).emit('goMessage', message);
    });


    socket.on('disconnect', function () {
      console.log(' user has left ')
      socket.broadcast.emit("userdisconnect", " user has left ")
      // client.close();
      console.log("Client closed")
    });

  });


  async function saveMessage(roomNumber, messageContent, senderNickname, timeStamp, signature) {


    console.log('function saveMessage called.')
    // const collection = client.db("circle").collection("messages");

    let json = {
      room: roomNumber,
      msg: messageContent,
      nickName: senderNickname,
      time: timeStamp,
      sig: signature
    };

    await collection.insertOne(json);
  }


  server.listen(3000, () => {
    var ip = require("ip");
    console.log(ip.address());
    console.log('Node app is running on port 3000');

  });

  // });
});
