"use strict";

module.exports = {
  clientMessage: async (ctx, next) => {
    try {
      const { sessionId, message } = ctx.request.body;
      console.log("sessionId:", sessionId, "message:", message);

      return { hello: "world" };
    } catch (err) {
      ctx.body = err;
    }
  },
};
