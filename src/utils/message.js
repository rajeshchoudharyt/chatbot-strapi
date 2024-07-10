async function authenticateUser(strapi, socket) {
  let user = await strapi.plugins["users-permissions"].services.jwt.verify(
    socket.handshake.auth.token
  );

  user = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    user.id
  );

  const count = await strapi.entityService.count("api::session.session", {
    filters: {
      sessionId: socket.handshake.query.sessionId,
      isActive: true,
    },
  });

  if (count)
    return {
      username: user.username,
      sessionId: socket.handshake.query.sessionId,
    };

  throw new Error("Invalid session.");
}

async function onMessage(message, callback, socketId, strapi) {
  try {
    message = message ? message.toString() : "";

    if (!message)
      return callback({
        status: { code: 400, ok: false },
        name: "Bad Request",
        messages: ["Invalid message."],
      });

    const { username, sessionId } = strapi.users.filter(
      (user) => user.socketId === socketId
    )[0];

    const data = { username, sessionId, message };
    const userResponse = await createEntryToDatabase(data, "user", strapi);
    const serverResponse = await createEntryToDatabase(data, "server", strapi);

    callback({
      status: { code: 200, ok: true },
      data: [userResponse, serverResponse],
    });
  } catch (err) {
    console.log(err);
  }
}

async function createEntryToDatabase(data, role, strapi) {
  data = { data: { ...data, role } };
  return await strapi.entityService.create(
    "api::conversation.conversation",
    data
  );
}

module.exports = { authenticateUser, onMessage };
