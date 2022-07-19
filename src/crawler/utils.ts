import http from 'node:http';
import handler from 'serve-handler';
import { getPort } from 'get-port-please';

export const launchStaticWebServer = async (basePath: string) => {
  const port = await getPort({
    random: true,
  });

  const server = http.createServer(async (request, response) => {
    return handler(request, response, {
      public: basePath.startsWith('file://') ? basePath.slice(7) : basePath,
    });
  });

  server.listen(port);

  return {
    server,
    port,
    url: `http://localhost:${port}`,
  };
};
