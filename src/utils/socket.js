const { onMessage } = require("./message");

function createSocket(strapi) {
  strapi.sessions = {};
  strapi.users = [];
  const LIMIT = 50;

  let io = startServer();
  middleware(strapi, io, LIMIT);
  connection(strapi, io);

  strapi.io = io;

  setInterval(() => {
    strapi.users = [];
  }, 1000 * 60 * 60 * 24 * 2);
}

function startServer() {
  // @ts-ignore
  const io = require("socket.io")(strapi.server.httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credientials: true,
    },
  });
  return io;
}

function connection(strapi, io) {
  io.on("connection", function (socket) {
    // To handle client messages
    socket.on("message", async (data, callback) => {
      onMessage(data, callback, socket.id, strapi);
    });

    socket.on("disconnect", () => {
      strapi.users = strapi.users.filter(
        (socketUser) => socketUser.socketId != socket.id
      );
    });
  });
}

// Socket middleware - executes on every new connection once
function middleware(strapi, io, LIMIT) {
  io.use(async (socket, next) => {
    try {
      const username = await authenticateUser(strapi, socket);

      if (strapi.users.length <= LIMIT) {
        const found = strapi.users.some((user) => user.username === username);
        if (found) throw new Error("Same session is currently active.");

        strapi.users.push({ username, socketId: socket.id });
        next();
        //
      } else throw new Error("Rate limit exceeded.");
      //
    } catch (err) {
      next(err);
    }
  });
}

async function authenticateUser(strapi, socket) {
  let user = await strapi.plugins["users-permissions"].services.jwt.verify(
    socket.handshake.auth.token
  );

  user = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    user.id
  );

  if (user) return user.username;
  throw new Error("Invalid: User not found.");
}

module.exports = { createSocket };
