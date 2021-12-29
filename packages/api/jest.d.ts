declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidConnection(): R;
    }
  }
}

export {};
