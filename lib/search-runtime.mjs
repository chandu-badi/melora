import { AsyncLocalStorage } from 'node:async_hooks';
const environment = new AsyncLocalStorage();
export function withSearchEnvironment(env, fn) { return environment.run({apiKey: env.YOUTUBE_API_KEY}, fn); }
export function searchEnvironment() { return environment.getStore() ?? {}; }
