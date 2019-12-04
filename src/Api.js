const https = require('https');
const http = require('http');
const HttpsProxyAgent = require('https-proxy-agent');
const url = require('url');
const Timer = require('./Timer');
const ApiError = require('./ApiError');

const BASE_URL = 'fast.com';
const DEFAULT_SPEEDTEST_TIMEOUT = 5000; // ms
const DEFAULT_URL_COUNT = 5;
const DEFAULT_BUFFER_SIZE = 8;
const MAX_CHECK_INTERVAL = 200; // ms

class Api {
  /**
   * Create an Api object
   *
   * @param {object} options {[token<string>, verbose<boolean>, timeout<number>,
   * https<boolean>, urlCount<number>, bufferSize<number>, unit<function>]}
   */
  constructor(options = {}) {
    if (!options) {
      throw new Error('You must define options in Api constructor');
    }

    if (options.token && typeof options.token !== 'string') {
      throw new Error('You must define app token');
    }

    if (options.unit && typeof options.unit !== 'function') {
      throw new Error('Invalid unit');
    }

    if (options.proxy) {
      this.proxy = new HttpsProxyAgent(options.proxy);
    }

    this.token = options.token || null;
    this.verbose = options.verbose || false;
    this.timeout = options.timeout || DEFAULT_SPEEDTEST_TIMEOUT;
    this.https = options.https == null ? true : Boolean(options.https);
    this.urlCount = options.urlCount || DEFAULT_URL_COUNT;
    this.bufferSize = options.bufferSize || DEFAULT_BUFFER_SIZE;
    this.unit = options.unit || Api.UNITS.Bps;
  }

  /**
   * Create URL with correct protocol based on options
   *
   * @param {String} url
   * @return {String}  The created url
   */
  createUrl(url = BASE_URL) {
    if (/^https?:\/\//.test(url)) {
      return url;
    }

    if (!/^\/\//.test(url)) {
      url = `//${url}`
    }

    return `http${this.https ? 's' : ''}:${url}`;
  }

  /**
   * Compute average from array of number
   *
   * @static
   * @param {Array} arr array of number or null
   * @return {number} The average
   */
  static average(arr) {
    // remove nulls from list
    const arrWithoutNulls = arr.filter(e => e);
    if (arrWithoutNulls.length === 0) {
      return 0;
    }
    return arrWithoutNulls.reduce((a, b) => a + b) / arrWithoutNulls.length;
  }


  /**
   * Get data from the specified URL
   *
   * @async
   * @param {string} options The http/s get options to download from
   * @return {Promise} The request and response from the URL
   */
  async get(options) {
    return new Promise((resolve, reject) => {
      const request = (this.https ? https : http).get(options, (response) => {
        const ctype = response.headers['content-type'];
        if (['json', 'javascript', 'text'].some(r => ctype.includes(r))) {
          response.setEncoding('utf8');
          let rawData = '';
          response.on('data', (chunk) => {
            rawData += chunk;
          });
          response.on('end', () => {
            response.rawData = rawData;
            if (ctype.includes('json')) {
              response.data = JSON.parse(rawData);
            }
            resolve({
              response,
              request,
            });
          });
        } else {
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


  /**
   * Get videos to download url from Fast api
   *
   * @async
   * @return {Array<string>} List of videos url
   */
  async getTargets() {
    if (!this.token) {
      this.token = await this.getToken();
      if (this.verbose) {
        console.log(`API token: ${this.token}`);
      }
    }
    try {
      const targets = [];
      while (targets.length < this.urlCount) {
        const target = this.createUrl(`api.${BASE_URL}/netflix/speedtest?https=${this.https ? 'true' : 'false'}&token=${this.token}&urlCount=${this.urlCount - targets.length}`);
        const options = url.parse(target);
        if (this.proxy) options.agent = this.proxy;
        /* eslint-disable no-await-in-loop */
        const { response } = await this.get(options);
        /* eslint-enable no-await-in-loop */
        if (response.statusCode !== 200) {
          if (response.statusCode === 403) {
            throw new ApiError({ code: ApiError.CODES.BAD_TOKEN });
          }
          if (response.statusCode === 407) {
            throw new ApiError({ code: ApiError.CODES.PROXY_NOT_AUTHENTICATED });
          }
          console.log(response.statusCode);
          throw new ApiError({ code: ApiError.CODES.UNKNOWN });
        }
        targets.push(...response.data);
      }
      return targets.map(target => target.url);
    } catch (e) {
      if (e.code === 'ENOTFOUND') {
        if (this.https) {
          throw new ApiError({ code: ApiError.CODES.UNREACHABLE_HTTPS_API });
        } else {
          throw new ApiError({ code: ApiError.CODES.UNREACHABLE_HTTP_API });
        }
      } else {
        throw e;
      }
    }
  }

  /**
   * Resolves when timeout or when the first video finished downloading
   *
   * @returns {Promise<number>} Speed in selected unit (Default: Bps)
   */
  async getSpeed() {
    let targets = null;
    try {
      targets = await this.getTargets();
    } catch (e) {
      throw e;
    }

    let bytes = 0;
    const requestList = [];

    const timer = new Timer(this.timeout, () => {
      requestList.forEach(r => r.abort());
    });

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

        if (this.verbose) {
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

  async getToken() {
    const url = this.createUrl();

    let rawData;
    let script;
    let token;
    let m;

    ({ response: { rawData } } = await this.get(url));
    if ((m = /src=[\"'](?<script>[^"']app-.*\.js)[\"']/i.exec(rawData)) !== null) {
      ({ groups: { script } } = m || { groups: { } });
    }
    if (!script) {
      throw new ApiError({ code: ApiError.CODES.NO_TOKEN });
    }

    ({ response: { rawData } } = await this.get(`${url}/${script}`));
    if ((m = /token:\s*[\"'](?<token>[^"']*)[\"']/i.exec(rawData)) !== null) {
      ({ groups: { token } } = m || { groups: { } });
    }
    if (!token) {
      throw new ApiError({ code: ApiError.CODES.NO_TOKEN });
    }

    return token;
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

Api.BASE_URL = BASE_URL;

module.exports = Api;
