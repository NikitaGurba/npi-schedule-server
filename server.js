const express = require("express");
const mongoose = require("mongoose");
const MAX_TEXT_LENGTH = 250;
const app = express();
require("dotenv").config();
const request = require("request");
const https = require("https");
const fs = require("fs");
const server = https.createServer(
  {
    key: fs.readFileSync(process.env.KEYS_PATH + "/server.key"),
    cert: fs.readFileSync(process.env.KEYS_PATH + "/server.cert"),
  },
  app
);
const { Server } = require("socket.io");
const Comment = require("./model/Comment");
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("like", async (id, ip) => {
    const comment = (await Comment.find({ _id: id }))[0];
    const likesList = comment.likes;
    const dislikesList = comment.dislikes;
    const likesLength = likesList.length;
    for (var i = 0; i < likesList.length; i++) {
      if (likesList[i] === ip) {
        likesList.splice(i, 1);
        break;
      }
    }
    if (likesLength === likesList.length) {
      likesList.push(ip);
    }
    for (var i = 0; i < dislikesList.length; i++) {
      if (dislikesList[i] === ip) {
        dislikesList.splice(i, 1);
        break;
      }
    }
    let newvalue1 = { $set: { likes: likesList } };
    let newvalue2 = { $set: { dislikes: dislikesList } };
    socket.emit("takeRate", likesList, dislikesList);
    await Comment.updateOne({ _id: id }, newvalue1);
    await Comment.updateOne({ _id: id }, newvalue2);
  });
  socket.on("dislike", async (id, ip) => {
    const comment = (await Comment.find({ _id: id }))[0];
    const likesList = comment.likes;
    const dislikesList = comment.dislikes;
    const dislikesLength = dislikesList.length;
    for (var i = 0; i < dislikesList.length; i++) {
      if (dislikesList[i] === ip) {
        dislikesList.splice(i, 1);
        break;
      }
    }
    if (dislikesLength === dislikesList.length) {
      dislikesList.push(ip);
    }
    for (var i = 0; i < likesList.length; i++) {
      if (likesList[i] === ip) {
        likesList.splice(i, 1);
        break;
      }
    }
    let newvalue1 = { $set: { likes: likesList } };
    let newvalue2 = { $set: { dislikes: dislikesList } };
    socket.emit("takeRate", likesList, dislikesList);
    await Comment.updateOne({ _id: id }, newvalue1);
    await Comment.updateOne({ _id: id }, newvalue2);
  });
  socket.on("getData", async () => {
    const comments = await Comment.find({}).lean();
    socket.emit("takeData", comments);
  });
  socket.on("takeData", async (text, grade, lecturer) => {
    const comment = new Object({
      grade: grade,
      text: text.slice(0, MAX_TEXT_LENGTH),
      lecturer: lecturer.slice(0, MAX_TEXT_LENGTH),
      date: new Date(),
      name: "Anonymous",
      likes: [],
      dislikes: [],
    });

    await Comment.collection.insertOne(comment);
    socket.emit("dataWriteSuccess");
    // let request_json = {
    //   message: `условие: является ли этот отзыв приемлимым, без мата и оскорблений: '${text}', отвечай в json формате: "YES" или "NO"`,
    //   api_key: process.env.CHAD_API_KEY,
    // };
    // request.post(
    //   "https://ask.chadgpt.ru/api/public/gpt-3.5",
    //   { json: request_json },
    //   async function (error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //       console.log(body.response);
    //       if (body.response.indexOf("YES") !== -1) {
    //         const comment = new Object({
    //           grade: grade,
    //           text: text.slice(0, MAX_TEXT_LENGTH),
    //           lecturer: lecturer.slice(0, MAX_TEXT_LENGTH),
    //           date: new Date(),
    //           name: "Anonymous",
    //           likes: [],
    //           dislikes: [],
    //         });

    //         await Comment.collection.insertOne(comment);
    //         socket.emit("dataWriteSuccess");
    //       } else {
    //         socket.emit("dataWriteFail", "Недопустимый отзыв");
    //       }
    //     } else {
    //       socket.emit("dataWriteFail", error);
    //     }
    //   }
    // );
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
