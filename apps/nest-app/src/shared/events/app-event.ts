export abstract class AppEvent<T = unknown> {
  constructor(public readonly payload: T) {}
}
