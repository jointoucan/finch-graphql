import EventEmitter from 'eventemitter3';

export class Observable<T = any> {
  private value: T;
  private emitter: EventEmitter;

  constructor(value: T) {
    this.value = value;
    this.emitter = new EventEmitter();
  }

  /**
   * The subscribe method allows for subscribing to changes in the observable value
   * @param function to be called when the observable changes
   * @returns a function that can be called to unsubscribe
   */
  public subscribe = (fn: () => void) => {
    this.emitter.on('change', fn);
    return () => {
      this.emitter.off('change', fn);
    };
  };

  /**
   * This method allows for the getting of a snapshot of the current value
   */
  public getSnapshot = () => {
    return this.value;
  };

  /**
   * This method allows for the updating of the observable value
   * @param value The new value to update the observable to
   */
  public update(value: T) {
    this.value = value;
    this.emitter.emit('change');
  }
}
