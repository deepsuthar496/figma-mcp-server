# Figma MCP Server

A Model Context Protocol (MCP) server that provides integration with Figma's API, allowing you to interact with Figma files, comments, components, and more.

## Features

- **File Operations**
  - Get file information
  - Get file version history
  - Get file components
  
- **Comment Management**
  - List comments in files
  - Add new comments
  - Delete comments
  
- **Project & Team Features**
  - List team projects
  - Get project files
  - Get published styles
  
- **Webhook Management**
  - Create webhooks
  - List existing webhooks
  - Delete webhooks

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Build the server:
```bash
npm run build
```

## Configuration

Configure the server in your MCP settings file with your Figma access token:

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["path/to/figma-server/build/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-access-token-here"
      },
      "disabled": false,
      "alwaysAllow": []
    }
  }
}
```

## Available Tools

### File Operations

#### get_file
Get information about a Figma file
```json
{
  "file_key": "string"
}
```

#### get_file_versions
Get version history of a file
```json
{
  "file_key": "string"
}
```

#### get_file_components
Get components in a file
```json
{
  "file_key": "string"
}
```

### Comment Management

#### get_file_comments
Get comments from a file
```json
{
  "file_key": "string"
}
```

#### post_comment
Post a comment to a file
```json
{
  "file_key": "string",
  "message": "string"
}
```

#### delete_comment
Delete a comment from a file
```json
{
  "file_key": "string",
  "comment_id": "string"
}
```

### Project & Team Operations

#### get_team_projects
Get projects for a team
```json
{
  "team_id": "string"
}
```

#### get_project_files
Get files in a project
```json
{
  "project_id": "string"
}
```

#### get_component_styles
Get published styles
```json
{
  "team_id": "string"
}
```

### Webhook Management

#### create_webhook
Create a webhook
```json
{
  "team_id": "string",
  "event_type": "string",
  "callback_url": "string"
}
```

#### get_webhooks
List webhooks
```json
{
  "team_id": "string"
}
```

#### delete_webhook
Delete a webhook
```json
{
  "webhook_id": "string"
}
```

## Usage Example

```typescript
// Example using the MCP tool to get file information
<use_mcp_tool>
<server_name>figma</server_name>
<tool_name>get_file</tool_name>
<arguments>
{
  "file_key": "your-file-key"
}
</arguments>
</use_mcp_tool>
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
