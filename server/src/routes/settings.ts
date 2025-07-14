import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getSettings, saveSettings } from "../services/settingsService.js";
import { validateSession } from "./access.js";
import { SettingsRequest, SettingsResponse } from "shared";

export default async function settingsRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // Get settings endpoint
  fastify.get<{ Reply: SettingsResponse }>(
    "/settings",
    async (request, reply) => {
      if (!(await validateSession(request, reply))) {
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      try {
        const settings = await getSettings();

        if (settings) {
          return {
            success: true,
            message: "Settings retrieved successfully",
            settings,
          };
        } else {
          // Return default settings if none exist
          return {
            success: true,
            message: "Default settings returned",
            settings: {
              naisysDataFolderPaths: [],
            },
          };
        }
      } catch (error) {
        reply.code(500);
        return {
          success: false,
          message: "Error retrieving settings",
        };
      }
    },
  );

  // Save settings endpoint
  fastify.post<{ Body: SettingsRequest; Reply: SettingsResponse }>(
    "/settings",
    async (request, reply) => {
      if (!(await validateSession(request, reply))) {
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      try {
        const settings = request.body;

        // Validate the input
        if (!Array.isArray(settings.naisysDataFolderPaths)) {
          reply.code(400);
          return {
            success: false,
            message: "Invalid settings format",
          };
        }

        // Save settings as JSON
        await saveSettings(settings);

        return {
          success: true,
          message: "Settings saved successfully",
          settings: request.body,
        };
      } catch (error) {
        reply.code(500);
        return {
          success: false,
          message: "Error saving settings",
        };
      }
    },
  );
}
