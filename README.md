# fast.com API / CLI tool

## Installation
```bash
$ npm install --save fast-speedtest
```

## Command-Line Tool
```bash
$ npm install --global fast-speedtest
$ fast-speedtest <your-app-token> (-v)
```

## Api usage
Example:
```js
const FastSpeedtest = require("fast-speedtest");

let speedtest = new FastSpeedtest({
    token: "your-app-token",
    verbose: false,
    timeout: 10000
});

speedtest.getSpeed().then(s => {
    console.log(`Speed: ${s / 1000000} mo/s`);
});

```
