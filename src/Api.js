const https = require("https");
const Timer = require("./Timer");

const DEFAULT_SPEEDTEST_TIMEOUT = 5000; // ms

class Api {
    constructor(options){
        if(!options){
            throw "You must define options in Api contructor";
        }

        if(!options.token){
            throw "You must define app token";
        }

        this.token = options.token;
        this.verbose = options.verbose || false;
        this.timeout = options.timeout || DEFAULT_SPEEDTEST_TIMEOUT;
        this.https = options.https || true;
        this.urlCount = options.urlCount || 5;
        this.bufferSize = options.bufferSize || 8;
    }

    static average(arr){
        arr = arr.filter((e) => e > 0);
        return arr.reduce((a, b) => a + b) / arr.length;
    }

    get(url){
        return new Promise(resolve => {
            let request = https.get(url, response => {
                if(response.headers["content-type"].includes('json')){
                    response.setEncoding('utf8');
                    let rawData = '';
                    response.on('data', (chunk) => { rawData += chunk; });
                    response.on('end', () => {
                        try {
                            const parsedData = JSON.parse(rawData);
                            response.data = parsedData;
                            resolve({
                                response: response,
                                request: request
                            });
                        } catch (e) {
                            console.error(e.message);
                        }
                    });
                }else{
                    resolve({
                        response: response,
                        request: request
                    });
                }
            });
        });
    }

    async getTargets() {
        let {response} = await this.get(`http${this.https ? 's' : ''}://api.fast.com/netflix/speedtest?https=${this.https ? 'true' : 'false'}&token=${this.token}&urlCount=${this.urlCount}`);
        return response.data
    }

    /**
     * Resolves when timeout or whane the first video finished downloading
     *
     * @returns {Promise} Speed in bytes per second
     */
    async getSpeed() {
        let targets = (await this.getTargets()).map(target => {
            return target.url;
        });

        let bytes = 0;
        let done = false;
        let requestList = [];

        let timer = new Timer(() => {
            requestList.forEach(r => r.abort());
            done = true
        }, this.timeout);

        targets.forEach(async target => {
            const {response, request} = await this.get(target);
            requestList.push(request);
            response.on('data', data => bytes += data.length);
            response.on('end', () => {
                timer.stop();
                requestList.forEach(r => r.abort());
                done = true;
            });
        });

        timer.start();

        return new Promise(resolve => {
            let i = 0;
            const recents = new Array(this.bufferSize).fill(0); // list of most recent speeds
            const interval = 200; // ms
            let refreshIntervalId = setInterval(() => {
                if (done) {
                    clearInterval(refreshIntervalId);
                    resolve(this.constructor.average(recents));
                } else {
                    i = (i + 1) % recents.length; // loop through recents
                    recents[i] = bytes / (interval / 1000); // add most recent bytes/second

                    if(this.verbose){
                        console.log(`Speed: ${recents[i] / 1000000} megabytes/s`);
                    }

                    bytes = 0;// reset byte count
                }
            }, interval);
        });
    }
}

module.exports = Api;
