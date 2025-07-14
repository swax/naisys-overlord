import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { HelloResponse } from 'shared'
import accessRoutes from './access.js'
import settingsRoutes from './settings.js'
import agentsRoutes from './agents.js'

export default async function apiRoutes(
  fastify: FastifyInstance, 
  _options: FastifyPluginOptions
) {
  fastify.get<{ Reply: HelloResponse }>('/hello', async (_request, _reply) => {
    return { 
      message: 'Hello from Fastify with TypeScript!', 
      timestamp: new Date().toISOString(),
      success: true 
    }
  })

  // Register access routes
  await fastify.register(accessRoutes)
  
  // Register settings routes
  await fastify.register(settingsRoutes)
  
  // Register agents routes
  await fastify.register(agentsRoutes)
}