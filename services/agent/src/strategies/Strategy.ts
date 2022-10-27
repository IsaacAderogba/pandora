export interface Strategy<T> {
  run: (initial: T, accumulated: T) => T | Promise<T>;
}
