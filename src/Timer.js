class Timer {
    // delay in ms
    constructor(callback, delay){
        this.callback = callback;
        this.delay = delay;
        this.remaining = delay;
        this.startTime = null;
        this.timerId = null;
    }

    start(){
        this.resume();
    }

    resume(){
        this.startTime = new Date();
        clearTimeout(this.timerId);
        this.timerId = setTimeout(this.callback, this.remaining);
    }

    pause(){
        clearTimeout(this.timerId);
        this.remaining -= new Date() - this.startTime;
    }

    stop(){
        this.clear();
    }

    clear(){
        clearTimeout(this.timerId);
        this.remaining = this.delay;
    }
}

module.exports.default = Timer;
