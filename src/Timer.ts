export class Timer {
  callbacks: any[];
  delay: any;
  remaining: any;
  startTime: Date;
  timerId: any;
  started: boolean;
  /**
   * Create en Timer, a timer that execute callback(s) at the end of the delay
   *
   * @param  {number} delay Delay to the end of the timer in millisecond
   * @param  {function} [callback] The callback to call at the end of the timer
   */
  constructor(delay, callback) {
    // check parameters
    if (delay == null) {
      throw new Error("delay parameter must be defined");
    }

    if (!Number.isInteger(delay)) {
      throw new Error("delay parameter must be an integer");
    }

    if (callback && typeof callback !== "function") {
      throw new Error("callback parameter must be a function");
    }

    // set properties
    this.callbacks = callback ? [callback] : [];
    this.delay = delay;
    this.remaining = delay;
    this.startTime = null;
    this.timerId = null;
    this.started = false;
  }

  /**
   * Add a callback to execute at the end of the timer
   *
   * @param  {function} callback The callback to add
   * @return {undefined}
   */
  addCallback(callback: Function): void {
    this.callbacks.push(callback);
  }

  /**
   * Start the timer
   *
   * @return {undefined}
   */
  start(): void {
    this.resume();
  }

  /**
   * Resume the timer when it's paused
   *
   * @return {undefined}
   */
  resume(): void {
    this.startTime = new Date();
    clearTimeout(this.timerId);
    this.timerId = setTimeout(this.stop.bind(this), this.remaining);
    this.started = true;
  }

  /**
   * Pause the timer (do not reset remaining delay)
   *
   * @return {undefined}
   */
  pause(): void {
    clearTimeout(this.timerId);
    this.remaining -= new Date().getTime() - this.startTime.getTime();
  }

  /**
   * Stop the timer (reset remaining delay) and execute the callback(s)
   *
   * @return {undefined}
   */
  stop(): void {
    if (this.started) {
      this.clear();
      this.callbacks.forEach((callback) => callback());
    }
  }

  /**
   * Stop the timer (reset remaining delay)
   *
   * @return {undefined}
   */
  clear(): void {
    if (this.started) {
      clearTimeout(this.timerId);
      this.remaining = this.delay;
      this.started = false;
    }
  }
}
