import type { OpenNextConfig } from 'open-next/types/open-next';

const config: OpenNextConfig = {
  default: {},
  middleware: {},
  // Suppress esbuild warnings for duplicate keys in dependencies
  dangerous: {
    disableTagCache: false,
    disableIncrementalCache: false,
  },
  buildCommand: undefined,
};

export default config;

export type { OpenNextConfig };
