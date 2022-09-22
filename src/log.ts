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

  const itemLog =
    entry.itemIndex && entry.totalItems
      ? `[${entry.itemIndex + 1}/${entry.totalItems}] `
      : '';
  const typeLog = entry.type === 'info' ? '' : `[${entry.type}] `;

  log(`${itemLog}${typeLog}`, ...entry.content);
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
