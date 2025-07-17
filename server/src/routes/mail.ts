import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { SendMailRequest, SendMailResponse } from "shared";
import { sendMessage } from "../services/mailService.js";
import { validateSession } from "./access.js";

export default async function mailRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.post<{ Body: SendMailRequest; Reply: SendMailResponse }>(
    "/send-mail",
    {
      preHandler: validateSession,
    },
    async (request, reply) => {
      try {
        const { from, to, subject, message } = request.body;

        // Validate required fields
        if (!from || !to || !subject || !message) {
          return reply.code(400).send({
            success: false,
            message: "Missing required fields: from, to, subject, message",
          });
        }

        // Send the message
        const result = await sendMessage({
          from,
          to,
          subject,
          message,
        });

        if (result.success) {
          return reply.code(200).send(result);
        } else {
          return reply.code(500).send(result);
        }
      } catch (error) {
        console.error("Error in send-mail route:", error);
        return reply.code(500).send({
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
        });
      }
    },
  );
}