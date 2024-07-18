async function onMessage(data, callback, socketId, strapi) {
  try {
    if (!data) throw new Error();

    const { username } = strapi.users.filter(
      (user) => user.socketId === socketId
    )[0];

    data = { ...data, username };
    const userResponse = await createEntryToDatabase(data, "user", strapi);
    const serverResponse = await createEntryToDatabase(data, "server", strapi);

    callback({
      ok: true,
      data: [userResponse, serverResponse],
    });
    //
  } catch (err) {
    callback({
      ok: false,
      name: "Bad Request",
      messages: ["Invalid message."],
    });
  }
}

async function createEntryToDatabase(data, role, strapi) {
  data = { data: { ...data, role } };
  data = await strapi.entityService.create(
    "api::conversation.conversation",
    data
  );

  const id = data.id;
  delete data.id;

  return { id, attributes: data };
}

module.exports = { onMessage };
