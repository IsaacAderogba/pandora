export type Constructor = { new (...args: any[]): {} };
export type Nullable<T> = T | null;
export type Any = any;

export type OptionalPick<T, K extends keyof T> = Partial<Pick<T, K>>;
export type RequiredPick<T, K extends keyof T> = Required<OptionalPick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = Partial<T> &
  Required<OptionalPick<T, K>>;
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};