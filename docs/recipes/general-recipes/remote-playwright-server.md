# Remote Playwright Server Support

Lost Pixel now supports connecting to a remote Playwright server, which allows you to run browser instances in a remote environment instead of launching browsers locally.

## Features

- **Remote Connection**: Connect to remote Playwright server via WebSocket
- **Backward Compatibility**: Automatically falls back to local browser launch if remote server is not configured
- **Configurable Timeout**: Support for custom connection timeout settings
- **Multi-browser Support**: Supports Chromium, Firefox, and WebKit remote connections

## Configuration

Add the `playwrightServer` configuration to your `lostpixel.config.ts` file:

```typescript
import type { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: 'http://localhost:6006',
    // if use docker playwright container, use host.docker.internal instead of localhost
    // storybookUrl: 'http://host.docker.internal:6006',
  },
  generateOnly: true,
  
  // Remote Playwright server configuration
  playwrightServer: {
    wsEndpoint: 'ws://localhost:3000/', // Required: WebSocket endpoint
    connectTimeout: 30000, // Optional: Connection timeout (ms), default 30000
  },

};
```

## Parameters

### `playwrightServer.wsEndpoint`
- **Type**: `string`
- **Required**: Yes
- **Description**: WebSocket endpoint URL of the remote Playwright server
- **Examples**: `'ws://localhost:3000/ws'`, `'ws://remote-server:4000/playwright'`

### `playwrightServer.connectTimeout`
- **Type**: `number`
- **Required**: No
- **Default**: `30000`
- **Description**: Connection timeout to the remote server (in milliseconds)

## Use Cases

1. **Docker Containerization**: Run Lost Pixel in one container and Playwright server in another
2. **Distributed Testing**: Run browser instances on dedicated servers
3. **Resource Isolation**: Separate browser processes from the main test process
4. **Performance Optimization**: Run browsers on more powerful remote machines

## Starting Remote Playwright Server

You can use Playwright's built-in functionality to start a remote server:

```bash
# Start Chromium server
npx playwright launch-server chromium --port 3000

# Or with specific options
npx playwright launch-server chromium --port 3000 --host 0.0.0.0
```

This will output a WebSocket URL similar to:
```
Listening on ws://localhost:3000/ws
```

Use this URL as the `wsEndpoint` in your configuration.

## Error Handling

If unable to connect to the remote server, Lost Pixel will:

1. Log error information
2. Throw an exception and stop test execution

Ensure that the remote Playwright server is running and accessible before running Lost Pixel.

## Important Notes

- The remote server must use the same Playwright version as Lost Pixel
- Network latency may affect testing performance
- Ensure the remote server has sufficient resources to run browser instances
- WebSocket connection must be stable to avoid disconnection during testing

## Troubleshooting

### Connection Failure
- Check if the `wsEndpoint` URL is correct
- Confirm that the remote Playwright server is running
- Verify network connection and firewall settings

### Version Mismatch
- Ensure the remote server and Lost Pixel use the same version of Playwright
- Check version information in Lost Pixel logs

### Timeout Issues
- Increase the `connectTimeout` value
- Check network latency
- Verify remote server performance