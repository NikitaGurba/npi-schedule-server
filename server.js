const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const Comment = require("./model/Comment");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("getData", async () => {
    const comments = await Comment.find({}).lean();
    socket.emit("takeData", comments);
  });
  socket.on("takeData", async (text, grade, lecturer) => {
    const comment = new Object({
      grade: grade,
      text: text,
      lecturer: lecturer,
      date: new Date(),
      name: "Anonymous",
    });

    await Comment.collection.insertOne(comment);
  });
  socket.on("getSpecificData", async (lecturer) => {
    const comments = await Comment.find({}).lean();
    const newArr = [];
    comments.map((item) => {
      if (item.lecturer == lecturer) {
        newArr.push(item);
      }
    });
    socket.emit("takeSpecificData", newArr);
  });
});

async function start() {
  try {
    mongoose.connect(process.env.TOKEN);
    server.listen(3001, () => {
      console.log("listening");
    });
  } catch (e) {
    console.log(e);
  }
}

start();
