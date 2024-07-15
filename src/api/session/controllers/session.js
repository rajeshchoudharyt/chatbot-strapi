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
      const { sessionName: name } = ctx.request.body;

      ctx.request.body = {
        data: {
          username: ctx.state.user.username,
          sessionId: uuidv4(),
          name,
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
      ctx.query = { filters: { username: ctx.state.user.username } };

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

  // To update a session from active to inactive on terminate
  async update(ctx) {
    try {
      ctx.request.method = "GET";

      const session = await this.findOne(ctx);

      // @ts-ignore
      ctx.request.params.id = session.data[0].id;
      ctx.request.url = "/api/sessions";
      ctx.request.method = "PUT";
      ctx.request.body = { data: { isActive: false } };

      const result = await super.update(ctx);
      return result;
    } catch (err) {
      console.log(err);
    }
  },
}));
