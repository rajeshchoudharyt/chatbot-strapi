const { authenticateUser, onMessage } = require("./message");

function createSocket(strapi) {
  strapi.users = [];
  const LIMIT = 25;

  let io = startServer();
  middleware(strapi, io, LIMIT);
  connection(strapi, io);

  strapi.io = io;
}

function startServer() {
  // @ts-ignore
  const io = require("socket.io")(strapi.server.httpServer, {
    cors: {
      origin: "http://localhost:1337",
      methods: ["GET", "POST"],
      credientials: true,
    },
  });
  return io;
}

function connection(strapi, io) {
  io.on("connection", function (socket) {
    // To handle client messages
    socket.on("message", async ({ message }, callback) =>
      onMessage(message, callback, socket.id, strapi)
    );
    socket.on("disconnect", () => {
      // To handle user on disconnect
      strapi.users = strapi.users.filter(
        (socketUser) => socketUser.socketId != socket.id
      );
    });

    /*
        Sync data regularly on abnormal disconnect,
        in-memory users(strapi.users) and client users(io.fetchSockets())
    */
  });
}

// Socket middleware - executes on every new connection once
function middleware(strapi, io, LIMIT) {
  io.use(async (socket, next) => {
    try {
      const user = await authenticateUser(strapi, socket);

      if (strapi.users.length <= LIMIT) {
        const found = strapi.users.some(
          (socketUser) => socketUser.sessionId === user.sessionId
        );

        if (found) throw new Error("Same session is currently active.");
        strapi.users.push({ ...user, socketId: socket.id });

        next();
        //
      } else throw new Error("Rate limit exceeded.");
      //
    } catch (err) {
      next(err);
    }
  });
}

module.exports = { createSocket };
