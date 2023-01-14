import type { ShotMode } from './types';

type LogLevel = 'info' | 'error' | 'warn' | 'debug';

type LogEntry = {
  timestamp: Date;
  level: LogLevel;
  item?: {
    shotMode: ShotMode;
    uniqueItemId: string;
    itemIndex: number;
    totalItems: number;
  };
  source: 'process' | 'browser';
  context: 'general' | 'api' | 'console' | 'network' | 'timeout' | 'config';
  content: unknown[];
};

export type LogMemory = LogEntry[];

export const logMemory: LogMemory = [];

const renderLog = (entry: LogEntry) => {
  if (entry.source === 'browser' && entry.context === 'console') {
    return;
  }

  if (entry.source === 'browser' && entry.context === 'network') {
    return;
  }

  const { log } = console;
  const logPrefix = [];

  if (entry.item) {
    logPrefix.push(`[${entry.item.itemIndex + 1}/${entry.item.totalItems}]`);
  }

  if (!['general', 'api', 'config'].includes(entry.context)) {
    logPrefix.push(`[${entry.context}]`);
  }

  if (entry.level === 'error') {
    logPrefix.push(`❌`);
  }

  log(...logPrefix, ...entry.content);
};

export const log = {
  item: (item: LogEntry['item']) => ({
    process(
      level: LogEntry['level'],
      context: LogEntry['context'],
      ...content: unknown[]
    ) {
      const entry: LogEntry = {
        timestamp: new Date(),
        level,
        item,
        source: 'process',
        context,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
    browser(
      level: LogEntry['level'],
      context: LogEntry['context'],
      ...content: unknown[]
    ) {
      const entry: LogEntry = {
        timestamp: new Date(),
        level,
        item,
        source: 'browser',
        context,
        content,
      };

      logMemory.push(entry);
      renderLog(entry);
    },
  }),
  process(
    level: LogEntry['level'],
    context: LogEntry['context'],
    ...content: unknown[]
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      source: 'process',
      context,
      content,
    };

    logMemory.push(entry);
    renderLog(entry);
  },
  browser(
    level: LogEntry['level'],
    context: LogEntry['context'],
    ...content: unknown[]
  ) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      source: 'browser',
      context,
      content,
    };

    logMemory.push(entry);
    renderLog(entry);
  },
};
