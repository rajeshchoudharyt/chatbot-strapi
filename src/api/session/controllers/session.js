"use strict";

/**
 * session controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const { v4: uuidv4 } = require("uuid");

module.exports = createCoreController("api::session.session", ({ strapi }) => ({
  // To create a new session
  async create(ctx) {
    try {
      ctx.request.body = {
        data: {
          username: ctx.state.user.username,
          sessionId: uuidv4(),
        },
      };

      const result = await super.create(ctx);
      return result;
      //
    } catch (err) {
      console.log("err", err);
    }
  },

  // To retrieve all sessions by user
  async find(ctx) {
    try {
      console.log("query before", ctx.query);
      ctx.query = { filters: { username: ctx.state.user.username } };

      console.log("query after", ctx.query);
      const result = await super.find(ctx);
      return result;
      //
    } catch (err) {
      console.log("err", err);
    }
  },

  // To retrieve a session
  async findOne(ctx) {
    try {
      const sessionId = ctx.request.params.id;
      const username = ctx.state.user.username;
      ctx.query = { filters: { sessionId, username } };

      const result = await super.find(ctx);
      return result;
      //
    } catch (err) {
      console.log(err);
    }
  },
}));
