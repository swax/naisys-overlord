import { FastifyInstance, FastifyPluginOptions } from 'fastify'

interface HelloResponse {
  message: string
  timestamp: string
  success: boolean
}

export default async function apiRoutes(
  fastify: FastifyInstance, 
  options: FastifyPluginOptions
) {
  fastify.get<{ Reply: HelloResponse }>('/hello', async (request, reply) => {
    return { 
      message: 'Hello from Fastify with TypeScript!', 
      timestamp: new Date().toISOString(),
      success: true 
    }
  })
}