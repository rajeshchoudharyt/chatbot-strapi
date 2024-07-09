// User registration without username from the client

module.exports = () => {
  const { v4: uuidv4 } = require("uuid");

  return async (ctx, next) => {
    try {
      const { url } = ctx.request;
      if (url === "/api/auth/local/register") {
        const uuid = "user-" + uuidv4();
        ctx.request.body.username = uuid;
      }

      await next();
    } catch (err) {
      console.log(err);
    }
  };
};
