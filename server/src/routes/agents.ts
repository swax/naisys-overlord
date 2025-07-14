import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { AgentsResponse } from "shared";
import { getAgents } from "../services/agentService.js";

export default async function agentsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  fastify.get<{ Reply: AgentsResponse }>("/agents", async (_request, reply) => {
    try {
      const agents = await getAgents();

      return {
        success: true,
        message: "Agents retrieved successfully",
        agents,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      reply.code(500);
      return {
        success: false,
        message: `Failed to retrieve agents: ${errorMessage}`,
      };
    }
  });
}
