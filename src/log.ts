type LogEntry = {
  timestamp: Date;
  uniqueItemId?: string;
  source: 'process' | 'browser';
  type: 'info' | 'console' | 'network' | 'timeout' | 'error';
  content: unknown[];
};

type LogMemory = Array<LogEntry>;

export const logMemory: LogMemory = [];

const renderLog = (entry: LogEntry) => {
  const { log } = console;

  log(`[${entry.type}] {${entry.uniqueItemId}} `, ...entry.content);
};

export const log = {
  item: {
    process: (
      uniqueItemId: LogEntry['uniqueItemId'],
      type: LogEntry['type'],
      ...content: unknown[]
    ) => {
      const entry: LogEntry = {
        timestamp: new Date(),
        uniqueItemId,
        source: 'process',
        type,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
    browser: (
      uniqueItemId: LogEntry['uniqueItemId'],
      type: LogEntry['type'],
      ...content: unknown[]
    ) => {
      const entry: LogEntry = {
        timestamp: new Date(),
        uniqueItemId,
        source: 'browser',
        type,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
  },
  process: (type: LogEntry['type'], ...content: unknown[]) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      source: 'process',
      type,
      content,
    };

    logMemory.push(entry);
    renderLog(entry);
  },
  browser: (type: LogEntry['type'], ...content: unknown[]) => {
    const entry: LogEntry = {
      timestamp: new Date(),
      source: 'browser',
      type,
      content,
    };

    logMemory.push(entry);
    renderLog(entry);
  },
};
