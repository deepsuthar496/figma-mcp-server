#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

interface FigmaConfig {
  accessToken: string;
  teamId?: string;
}

class FigmaServer {
  private server: Server;
  private axiosInstance: AxiosInstance;

  constructor(config: FigmaConfig) {
    this.server = new Server(
      {
        name: 'figma-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.figma.com/v1',
      headers: {
        'X-Figma-Token': config.accessToken,
      },
    });

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_file':
            return await this.getFile(request.params.arguments);
          case 'get_file_comments':
            return await this.getFileComments(request.params.arguments);
          case 'post_comment':
            return await this.postComment(request.params.arguments);
          case 'delete_comment':
            return await this.deleteComment(request.params.arguments);
          case 'get_team_projects':
            return await this.getTeamProjects(request.params.arguments);
          case 'get_project_files':
            return await this.getProjectFiles(request.params.arguments);
          case 'get_file_components':
            return await this.getFileComponents(request.params.arguments);
          case 'get_component_styles':
            return await this.getComponentStyles(request.params.arguments);
          case 'get_file_versions':
            return await this.getFileVersions(request.params.arguments);
          case 'create_webhook':
            return await this.createWebhook(request.params.arguments);
          case 'get_webhooks':
            return await this.getWebhooks(request.params.arguments);
          case 'delete_webhook':
            return await this.deleteWebhook(request.params.arguments);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: `Figma API error: ${
                  error.response?.data.message ?? error.message
                }`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_file',
          description: 'Get information about a Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['file_key'],
          },
        },
        {
          name: 'get_file_comments',
          description: 'Get comments from a Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['file_key'],
          },
        },
        {
          name: 'post_comment',
          description: 'Post a comment to a Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
              message: {
                type: 'string',
                description: 'The comment message',
              },
            },
            required: ['file_key', 'message'],
          },
        },
        {
          name: 'delete_comment',
          description: 'Delete a comment from a Figma file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
              comment_id: {
                type: 'string',
                description: 'The comment ID',
              },
            },
            required: ['file_key', 'comment_id'],
          },
        },
        {
          name: 'get_team_projects',
          description: 'Get projects for a team',
          inputSchema: {
            type: 'object',
            properties: {
              team_id: {
                type: 'string',
                description: 'The team ID',
              },
            },
            required: ['team_id'],
          },
        },
        {
          name: 'get_project_files',
          description: 'Get files in a project',
          inputSchema: {
            type: 'object',
            properties: {
              project_id: {
                type: 'string',
                description: 'The project ID',
              },
            },
            required: ['project_id'],
          },
        },
        {
          name: 'get_file_components',
          description: 'Get components in a file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['file_key'],
          },
        },
        {
          name: 'get_component_styles',
          description: 'Get published styles',
          inputSchema: {
            type: 'object',
            properties: {
              team_id: {
                type: 'string',
                description: 'The team ID',
              },
            },
            required: ['team_id'],
          },
        },
        {
          name: 'get_file_versions',
          description: 'Get version history of a file',
          inputSchema: {
            type: 'object',
            properties: {
              file_key: {
                type: 'string',
                description: 'The Figma file key',
              },
            },
            required: ['file_key'],
          },
        },
        {
          name: 'create_webhook',
          description: 'Create a webhook',
          inputSchema: {
            type: 'object',
            properties: {
              team_id: {
                type: 'string',
                description: 'The team ID',
              },
              event_type: {
                type: 'string',
                description: 'The event type to listen for',
              },
              callback_url: {
                type: 'string',
                description: 'The callback URL',
              },
            },
            required: ['team_id', 'event_type', 'callback_url'],
          },
        },
        {
          name: 'get_webhooks',
          description: 'List webhooks',
          inputSchema: {
            type: 'object',
            properties: {
              team_id: {
                type: 'string',
                description: 'The team ID',
              },
            },
            required: ['team_id'],
          },
        },
        {
          name: 'delete_webhook',
          description: 'Delete a webhook',
          inputSchema: {
            type: 'object',
            properties: {
              webhook_id: {
                type: 'string',
                description: 'The webhook ID',
              },
            },
            required: ['webhook_id'],
          },
        },
      ],
    }));
  }

  private async getFile(args: any) {
    const response = await this.axiosInstance.get(`/files/${args.file_key}`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getFileComments(args: any) {
    const response = await this.axiosInstance.get(`/files/${args.file_key}/comments`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async postComment(args: any) {
    const response = await this.axiosInstance.post(`/files/${args.file_key}/comments`, {
      message: args.message,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async deleteComment(args: any) {
    await this.axiosInstance.delete(`/files/${args.file_key}/comments/${args.comment_id}`);
    return {
      content: [
        {
          type: 'text',
          text: 'Comment deleted successfully',
        },
      ],
    };
  }

  private async getTeamProjects(args: any) {
    const response = await this.axiosInstance.get(`/teams/${args.team_id}/projects`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getProjectFiles(args: any) {
    const response = await this.axiosInstance.get(`/projects/${args.project_id}/files`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getFileComponents(args: any) {
    const response = await this.axiosInstance.get(`/files/${args.file_key}/components`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getComponentStyles(args: any) {
    const response = await this.axiosInstance.get(`/teams/${args.team_id}/styles`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getFileVersions(args: any) {
    const response = await this.axiosInstance.get(`/files/${args.file_key}/versions`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async createWebhook(args: any) {
    const response = await this.axiosInstance.post(`/teams/${args.team_id}/webhooks`, {
      event_type: args.event_type,
      callback_url: args.callback_url,
    });
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getWebhooks(args: any) {
    const response = await this.axiosInstance.get(`/teams/${args.team_id}/webhooks`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async deleteWebhook(args: any) {
    await this.axiosInstance.delete(`/webhooks/${args.webhook_id}`);
    return {
      content: [
        {
          type: 'text',
          text: 'Webhook deleted successfully',
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Figma MCP server running on stdio');
  }
}

const ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!ACCESS_TOKEN) {
  throw new Error('FIGMA_ACCESS_TOKEN environment variable is required');
}

const server = new FigmaServer({
  accessToken: ACCESS_TOKEN,
});
server.run().catch(console.error);
