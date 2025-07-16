import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  NaisysDataRequest,
  NaisysDataResponse,
  ReadStatusUpdateRequest,
} from "shared/src/data-types.js";
import { getNaisysData } from "../services/dataService.js";
import { updateLatestReadLogId } from "../services/readService.js";
import { validateSession } from "./access.js";

export default async function dataRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.get<{
    Querystring: NaisysDataRequest;
    Reply: NaisysDataResponse;
  }>("/data", {}, async (request, reply) => {
    try {
      const { after, limit } = request.query;

      const afterId = after ? parseInt(after, 10) : undefined;
      const limitNum = limit ? parseInt(limit, 10) : 10000;

      if (after && isNaN(afterId!)) {
        return reply.status(400).send({
          success: false,
          message: "Invalid 'after' parameter. Must be a number.",
        });
      }

      if (limit && (isNaN(limitNum) || limitNum <= 0 || limitNum > 10000)) {
        return reply.status(400).send({
          success: false,
          message:
            "Invalid 'limit' parameter. Must be a number between 1 and 1000.",
        });
      }

      const data = await getNaisysData(afterId, limitNum);

      return {
        success: true,
        message: "NAISYS data retrieved successfully",
        data,
      };
    } catch (error) {
      console.error("Error in /data route:", error);
      return reply.status(500).send({
        success: false,
        message: "Internal server error while fetching NAISYS data",
      });
    }
  });

  // Update read status endpoint
  fastify.post<{
    Body: ReadStatusUpdateRequest;
  }>(
    "/read-status",
    {
      preHandler: validateSession,
    },
    async (request, reply) => {
      try {
        const { agentName, lastReadLogId } = request.body;

        await updateLatestReadLogId(agentName, lastReadLogId);

        return {
          success: true,
          message: "Read status updated successfully",
        };
      } catch (error) {
        console.error("Error updating read status:", error);
        return reply.status(500).send({
          success: false,
          message: "Internal server error while updating read status",
        });
      }
    },
  );
}
