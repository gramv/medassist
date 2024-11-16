import 'react'

declare module 'react' {
  interface FormEvent<T = Element> extends SyntheticEvent<T> {
    readonly target: EventTarget & T;
  }

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    readonly target: EventTarget & T;
  }
} 