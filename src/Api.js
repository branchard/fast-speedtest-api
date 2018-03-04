const https = require('https');
const http = require('http');
const Timer = require('./Timer');
const ApiError = require('./ApiError');

const DEFAULT_SPEEDTEST_TIMEOUT = 5000; // ms
const DEFAULT_URL_COUNT = 5;
const DEFAULT_BUFFER_SIZE = 8;
const MAX_CHECK_INTERVAL = 200; // ms

class Api{
	constructor(options){
		if(!options){
			throw new Error('You must define options in Api contructor');
		}

		if(!options.token){
			throw new Error('You must define app token');
		}

		if(options.unit && typeof options.unit !== 'function'){
			throw new Error('Invalide unit');
		}

		this.token = options.token;
		this.verbose = options.verbose || false;
		this.timeout = options.timeout || DEFAULT_SPEEDTEST_TIMEOUT;
		this.https = options.https == null ? true : Boolean(options.https);
		this.urlCount = options.urlCount || DEFAULT_URL_COUNT;
		this.bufferSize = options.bufferSize || DEFAULT_BUFFER_SIZE;
		this.unit = options.unit || Api.UNITS.Bps;
	}

	static average(arr){
		// remove nulls from list
		const arrWithoutNulls = arr.filter(e => e);
		if(arrWithoutNulls.length == 0){
			return 0;
		}
		return arrWithoutNulls.reduce((a, b) => a + b) / arrWithoutNulls.length;
	}

	async get(url){
		return new Promise((resolve, reject) => {
			const request = (this.https ? https : http).get(url, (response) => {
				if(response.headers['content-type'].includes('json')){
					response.setEncoding('utf8');
					let rawData = '';
					response.on('data', (chunk) => { rawData += chunk; });
					response.on('end', () => {
						const parsedData = JSON.parse(rawData);
						response.data = parsedData;
						resolve({
							response,
							request,
						});
					});
				}else{
					resolve({
						response,
						request,
					});
				}
			}).on('error', (e) => {
				reject(e);
			});
		});
	}

	async getTargets(){
		try{
			const targets = [];
			while(targets.length < this.urlCount){
				/* eslint-disable no-await-in-loop */
				const {response} = await this.get(`http${this.https ? 's' : ''}://api.fast.com/netflix/speedtest?https=${this.https ? 'true' : 'false'}&token=${this.token}&urlCount=${this.urlCount - targets.length}`);
				/* eslint-enable no-await-in-loop */
				if(response.statusCode != 200){
					if(response.statusCode == 403){
						throw new ApiError({code: ApiError.CODES.BAD_TOKEN});
					}
					throw new ApiError({code: ApiError.CODES.UNKNOWN});
				}
				targets.push(...response.data);
			}
			return targets.map(target => target.url);
		}catch(e){
			if(e.code == 'ENOTFOUND'){
				if(this.https){
					throw new ApiError({code: ApiError.CODES.UNREACHABLE_HTTPS_API});
				}else{
					throw new ApiError({code: ApiError.CODES.UNREACHABLE_HTTP_API});
				}
			}else{
				throw e;
			}
		}
	}

	/**
	 * Resolves when timeout or whane the first video finished downloading
	 *
	 * @returns {Promise} Speed in selected unit (Default: Bps)
	 */
	async getSpeed(){
		let targets = null;
		try{
			targets = await this.getTargets();
		}catch(e){
			throw e;
		}

		let bytes = 0;
		const requestList = [];

		const timer = new Timer(() => {
			requestList.forEach(r => r.abort());
		}, this.timeout);

		targets.forEach(async (target) => {
			const {response, request} = await this.get(target);
			requestList.push(request);
			response.on('data', (data) => {
				bytes += data.length;
			});
			response.on('end', () => {
				// when first video is downloaded
				timer.stop(); // stop timer and execute timer callback
			});
		});

		return new Promise((resolve) => {
			let i = 0;
			const recents = new Array(this.bufferSize).fill(null); // list of most recent speeds
			const interval = Math.min(
				this.timeout / this.bufferSize,
				MAX_CHECK_INTERVAL,
			); // ms
			const refreshIntervalId = setInterval(() => {
				i = (i + 1) % recents.length; // loop through recents
				recents[i] = bytes / (interval / 1000); // add most recent bytes/second

				if(this.verbose){
					console.log(`Current speed: ${this.unit(this.constructor.average(recents))} ${this.unit.name}`);
				}

				bytes = 0;// reset bytes count
			}, interval);

			timer.addCallback(() => {
				clearInterval(refreshIntervalId);
				resolve(this.unit(this.constructor.average(recents)));
			});

			timer.start();
		});
	}
}

Api.UNITS = {
	// rawSpeed is Bps
	Bps: rawSpeed => rawSpeed,
	KBps: rawSpeed => rawSpeed / 1000,
	MBps: rawSpeed => rawSpeed / 1000000,
	GBps: rawSpeed => rawSpeed / 1000000000,

	bps: rawSpeed => rawSpeed * 8,
	Kbps: rawSpeed => (rawSpeed * 8) / 1000,
	Mbps: rawSpeed => (rawSpeed * 8) / 1000000,
	Gbps: rawSpeed => (rawSpeed * 8) / 1000000000,
};

module.exports = Api;
