type LogEntry = {
  timestamp: Date;
  uniqueItemId?: string;
  itemIndex?: number;
  totalItems?: number;
  source: 'process' | 'browser';
  type: 'info' | 'console' | 'network' | 'timeout' | 'error';
  content: unknown[];
};

type LogMemory = LogEntry[];

export const logMemory: LogMemory = [];

const renderLog = (entry: LogEntry) => {
  const { log } = console;

  const logPrefix = [];

  if (entry.itemIndex !== undefined && entry.totalItems) {
    logPrefix.push(`[${entry.itemIndex + 1}/${entry.totalItems}]`);
  }

  if (entry.type !== 'info') {
    logPrefix.push(`[${entry.type}]`);
  }

  log(...logPrefix, ...entry.content);
};

export const log = {
  item: (
    uniqueItemId: LogEntry['uniqueItemId'],
    itemIndex: LogEntry['itemIndex'],
    totalItems: LogEntry['totalItems'],
  ) => ({
    process(type: LogEntry['type'], ...content: unknown[]) {
      const entry: LogEntry = {
        timestamp: new Date(),
        uniqueItemId,
        itemIndex,
        totalItems,
        source: 'process',
        type,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
    browser(type: LogEntry['type'], ...content: unknown[]) {
      const entry: LogEntry = {
        timestamp: new Date(),
        uniqueItemId,
        itemIndex,
        totalItems,
        source: 'browser',
        type,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
  }),
  process(type: LogEntry['type'], ...content: unknown[]) {
    const entry: LogEntry = {
      timestamp: new Date(),
      source: 'process',
      type,
      content,
    };

    logMemory.push(entry);
    renderLog(entry);
  },
  browser(type: LogEntry['type'], ...content: unknown[]) {
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
