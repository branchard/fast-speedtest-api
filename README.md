<img src="https://fast.com/assets/new-logo-vert-37861c.svg" alt="fast.com logo" height="120px" />

# fast.com API / CLI tool
[![Build Status](https://travis-ci.org/branchard/fast-speedtest-api.svg?branch=master)](https://travis-ci.org/branchard/fast-speedtest-api)
[![NPM version](https://img.shields.io/npm/v/fast-speedtest-api.svg?colorB=0a7bbb)](https://www.npmjs.com/package/fast-speedtest-api)
[![GitHub license](https://img.shields.io/github/license/branchard/fast-speedtest-api.svg?colorB=0a7bbb)](https://github.com/branchard/fast-speedtest-api/blob/master/LICENSE)

A speed test powered by fast.com  
From scratch, with no dependencies

## Installation
```bash
$ npm install --save fast-speedtest-api
```

## Command-Line Tool
```bash
$ npm install --global fast-speedtest-api
$ fast-speedtest [your-app-token] (-v)
```

## Api usage
Example:
```js
const FastSpeedtest = require("fast-speedtest-api");

let speedtest = new FastSpeedtest({
    token: "your-app-token", // required
    verbose: false, // default: false
    timeout: 10000, // default: 5000
    https: true, // default: true
    urlCount: 5, // default: 5
    bufferSize: 8 // default: 8
});

speedtest.getSpeed().then(s => {
    console.log(`Speed: ${s} bytes/s`);
    console.log(`Speed: ${s / 1000000} megabytes/s`);
});
```

## FAQ
### How to get app token ?
Go on [fast.com](https://fast.com/), open your browser devtools, go on `Network` tab and copy the token on the request url that looks like `https://api.fast.com/netflix/speedtest?https=true&token=<the-token>&urlCount=5`

## TODO
- Better errors handling
- More options in cli
- Better verbose mode
- Add tests
