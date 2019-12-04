#!/usr/bin/env node

const Api = require('./Api');


const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
  console.log([
    'fast-speedtest - speed test powered by fast.com',
    'usage: fast-speedtest token [-v, --verbose] [-r, --raw] [-n, --no-https] [-t, --timeout timeout] [-c, --count url-count] [-b, --buffer buffer-size] [-u, --unit output-unit] [-p, --proxy proxy]',
  ].join('\n'));
  process.exit(0);
}

let token;
let restArgs = args;

if (args[0] && !args[0].startsWith('-')) {
  token = args[0];
  restArgs = args.slice(1);
}

/* eslint-disable require-jsdoc */
function getArgParam(argName, fullArgName) {
  /* eslint-disable no-restricted-syntax */
  for (const arg of [argName, fullArgName]) {
    if (restArgs.includes(arg)) {
      return restArgs[restArgs.indexOf(argName) + 1];
    }
  }
  /* eslint-enable no-restricted-syntax */
  return undefined;
}

/* eslint-enable require-jsdoc */

if (token && typeof token !== 'string') {
  throw new Error('App token must be string');
}

const verbose = restArgs.includes('-v') || restArgs.includes('--verbose');
const https = !restArgs.includes('-n') && !restArgs.includes('--no-https');
const rawOutput = restArgs.includes('-r') || restArgs.includes('--raw');

const timeout = getArgParam('-t', '--timeout');
const urlCount = getArgParam('-c', '--count');
const bufferSize = getArgParam('-b', '--buffer');
const unitName = getArgParam('-u', '--unit');
const proxy = getArgParam('-p', '--proxy');
if (unitName && !(unitName in Api.UNITS)) {
  throw new Error(`Unit not valide, must be one of ${Object.keys(Api.UNITS)}`);
}
const unit = Api.UNITS[unitName] || Api.UNITS.Mbps;

const api = new Api({
  token,
  verbose,
  timeout,
  urlCount,
  bufferSize,
  https,
  unit,
  proxy,
});

api.getSpeed().then((s) => {
  if (rawOutput) {
    console.log(s);
  } else {
    console.log(`Speed: ${Math.round(s * 100) / 100} ${unit.name}`);
  }
}).catch((e) => {
  console.error(e.message);
});
