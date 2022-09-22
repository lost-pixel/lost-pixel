import { ShotMode } from './types';

type LogEntry = {
  timestamp: Date;
  item?: {
    shotMode: ShotMode;
    uniqueItemId: string;
    itemIndex: number;
    totalItems: number;
  };
  source: 'process' | 'browser';
  type: 'info' | 'console' | 'network' | 'timeout' | 'error';
  content: unknown[];
};

export type LogMemory = LogEntry[];

export const logMemory: LogMemory = [];

const renderLog = (entry: LogEntry) => {
  if (entry.source === 'browser' && entry.type === 'console') {
    return;
  }

  const { log } = console;
  const logPrefix = [];

  if (entry.item) {
    logPrefix.push(`[${entry.item.itemIndex + 1}/${entry.item.totalItems}]`);
  }

  if (entry.type !== 'info') {
    logPrefix.push(`[${entry.type}]`);
  }

  log(...logPrefix, ...entry.content);
};

export const log = {
  item: (item: LogEntry['item']) => ({
    process(type: LogEntry['type'], ...content: unknown[]) {
      const entry: LogEntry = {
        timestamp: new Date(),
        item,
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
        item,
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
