import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { getSettings, saveSettings } from '../services/settingsService.js'
import { validateSession } from './access.js'
import { 
  SettingsRequest, 
  SettingsResponse 
} from 'shared'

export default async function settingsRoutes(
  fastify: FastifyInstance, 
  _options: FastifyPluginOptions
) {
  // Get settings endpoint
  fastify.get<{ Reply: SettingsResponse }>('/settings', async (request, reply) => {
    if (!(await validateSession(request, reply))) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    try {
      const settingsRecord = await getSettings()
      
      if (settingsRecord) {
        const settings = JSON.parse(settingsRecord.settings_json)
        return {
          success: true,
          message: 'Settings retrieved successfully',
          settings
        }
      } else {
        // Return default settings if none exist
        return {
          success: true,
          message: 'Default settings returned',
          settings: {
            naisysDataFolderPaths: []
          }
        }
      }
    } catch (error) {
      reply.code(500)
      return {
        success: false,
        message: 'Error retrieving settings'
      }
    }
  })

  // Save settings endpoint
  fastify.post<{ Body: SettingsRequest; Reply: SettingsResponse }>('/settings', async (request, reply) => {
    if (!(await validateSession(request, reply))) {
      return {
        success: false,
        message: 'Unauthorized'
      }
    }

    try {
      const { naisysDataFolderPaths } = request.body
      
      // Validate the input
      if (!Array.isArray(naisysDataFolderPaths)) {
        reply.code(400)
        return {
          success: false,
          message: 'Invalid settings format'
        }
      }

      // Save settings as JSON
      const settingsJson = JSON.stringify({ naisysDataFolderPaths })
      await saveSettings(settingsJson)

      return {
        success: true,
        message: 'Settings saved successfully',
        settings: { naisysDataFolderPaths }
      }
    } catch (error) {
      reply.code(500)
      return {
        success: false,
        message: 'Error saving settings'
      }
    }
  })
}