# fast.com API / CLI tool

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
    token: "your-app-token",
    verbose: false,
    timeout: 10000
});

speedtest.getSpeed().then(s => {
    console.log(`Speed: ${s / 1000000} mo/s`);
});

```
