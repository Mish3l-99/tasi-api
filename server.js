require("dotenv").config();

const OriginAllowed = process.env.ORIGIN_ALLOWED;

var express = require("express");
var cors = require("cors");
var app = express();
// This is to enable CORS for one origin
app.use(cors());

var http = require("http").createServer(app);
// http.use(cors({ origin: OriginAllowed }));

var io = require("socket.io")(http, {
  path: "/backend/socket.io",
  cors: {
    origin: OriginAllowed,
    methods: ["GET", "POST"],
  },
});
//

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;

db.on("error", (error) => console.log(error));
db.once("open", () => console.log("db connected!"));

// allow app to accept json in req body
app.use(express.json());

// defining a users route and using it
const usersRoute = require("./routes/users");
app.use("/backend/users", usersRoute);
app.use("/backend/profile", express.static("images/profiles"));

// defining a votings route and using it
const votingsRoute = require("./routes/votings");
app.use("/backend/votings", votingsRoute);

// defining a conversations route and using it
const conversationsRoute = require("./routes/conversations");
app.use("/backend/conversations", conversationsRoute);

// defining a messages route and using it
const messagesRoute = require("./routes/messages");
app.use("/backend/messages", messagesRoute);

// defining an ads route and using it
const adsRoute = require("./routes/ads");
app.use("/backend/ads", adsRoute);

// defining a Posts route and using it
const postsRoute = require("./routes/posts");
app.use("/backend/posts", postsRoute);
app.use("/backend/post", express.static("images/blogPosts"));

// socket stuff
const limit = 12;
const Message = require("./models/message");
const Conversation = require("./models/conversation");

const storeMessage = async (data) => {
  // test env
  const MssgsNum = await Message.find({}).countDocuments();
  if (MssgsNum <= 100) {
    const mssg = new Message(data);
    try {
      await mssg.save();
    } catch (error) {
      console.log(error);
    }
  }
  //   //   production;
  //   try {
  //     await Message.findOneAndReplace({ room: data.room }, data, {
  //       sort: { createdAt: 1 },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
};

const storePMessage = async (data) => {
  // test env
  const convo = await Conversation.findById(data.room);

  //update last message date
  convo.lastMessageDate = new Date().toLocaleDateString();

  const MssgsNum = convo.messages.length;
  if (MssgsNum <= 100) {
    const fullNew = convo.messages.concat(data);
    // console.log(fullNew);
    convo.messages = fullNew;
    try {
      await convo.save();
    } catch (error) {
      console.log(error);
    }
  }
  //   //   production; needs work
};

io.on("connection", (socket) => {
  //   console.log(`User Connected: ${socket.id}`);

  socket.on("join_chat", async (data) => {
    socket.join(data);
  });

  socket.on("join_room", async (data) => {
    socket.join(data);
    let messages;
    try {
      messages = await Message.find().sort({ createdAt: -1 }).limit(limit);
    } catch (error) {
      console.log(error);
    }

    io.to(data).emit("send_stored", messages.reverse());
    // console.log("joined ", data);
  });

  socket.on("join_private", async (data) => {
    socket.join(data);
    let convo;
    try {
      convo = await Conversation.findById(data);
    } catch (error) {
      console.log(error);
    }

    io.to(data).emit("send_private", convo.messages);
    // console.log("joined ", data);
  });

  socket.on("send_message", async (data) => {
    io.to(data.room).emit("receive_message", data);
    if (data.room === "tasi") await storeMessage(data);
  });

  socket.on("send_pMessage", async (data) => {
    io.to(data.room).emit("receive_message", data);
    await storePMessage(data);
  });
});

// // defining a content route and using it
// const contentsRouter = require("./routes/contents");
// app.use("/content", contentsRouter);

http.listen(4000, () => console.log("server started!"));
