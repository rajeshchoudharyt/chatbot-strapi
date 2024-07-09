module.exports = {
  routes: [
    {
      method: "POST",
      path: "/message",
      handler: "message.clientMessage",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
