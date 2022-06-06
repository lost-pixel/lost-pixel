type LogMemory = Array<{
  timestamp: Date;
  content: unknown[];
}>;

export const logMemory: LogMemory = [];

export const log = (...content: unknown[]) => {
  logMemory.push({ timestamp: new Date(), content });
  const { log } = console;
  log(...content);
};
