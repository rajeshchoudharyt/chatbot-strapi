"use strict";

/**
 * conversation controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::conversation.conversation",
  ({ strapi }) => ({
    async findOne(ctx) {
      try {
        // @ts-ignore
        const sessionId = ctx.request.params.id;
        const username = ctx.state.user.username;

        ctx.query = {
          filters: { sessionId, username },
          sort: "updatedAt",
        };

        const result = await super.find(ctx);
        return result;
        //
      } catch (err) {
        console.log(err);
      }
    },
  })
);
