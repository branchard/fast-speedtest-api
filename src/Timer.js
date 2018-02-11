class Timer {
    // delay in ms
    constructor(callback, delay){
        this.callbacks = [callback];
        this.delay = delay;
        this.remaining = delay;
        this.startTime = null;
        this.timerId = null;
		this.started = false;
    }

	addCallback(callback){
		this.callbacks.push(callback);
	}

    start(){
        this.resume();
    }

    resume(){
        this.startTime = new Date();
        clearTimeout(this.timerId);
        this.timerId = setTimeout(this.stop.bind(this), this.remaining);
		this.started = true;
    }

    pause(){
        clearTimeout(this.timerId);
        this.remaining -= new Date() - this.startTime;
    }

    stop(){
        this.clear();
		this.callbacks.forEach(callback => callback());
    }

    clear(){
        clearTimeout(this.timerId);
        this.remaining = this.delay;
		this.started = false;
    }
}

module.exports = Timer;
