import http from 'node:http';
import handler from 'serve-handler';

export const launchStaticWebServer = async (basePath: string) => {
  const port = 3001;

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
