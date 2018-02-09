# fast.com API / CLI tool
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
