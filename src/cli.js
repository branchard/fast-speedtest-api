#!/usr/bin/env node

const Api = require("./Api");


let args = process.argv.slice(2);

if(args.includes('-h') || args.includes('--help')){
    console.log([
        'fast-speedtest - speed test powered by fast.com',
        'usage: fast-speedtest token [-v, --verbose] [-n, --no-https] [-t, --timeout timeout] [-c, --count url-count] [-b, --buffer buffer-size] [-u, --unit output-unit]'
    ].join('\n'));
    process.exit(0);
}

let token = args[0];
let restArgs = args.slice(1);

function getArgParam(argName, fullArgName){
    for (let arg of [argName, fullArgName]) {
        if(restArgs.includes(arg)){
            return restArgs[restArgs.indexOf(argName) + 1]
        }
    }
    return undefined;
}

if(!token || typeof token !== "string"){
    throw 'You must define an app token';
}

let verbose = restArgs.includes('-v') || restArgs.includes('--verbose');
let https = !restArgs.includes('-n') && !restArgs.includes('--no-https');

let timeout = getArgParam('-t', '--timeout');
let urlCount = getArgParam('-c', '--count');
let bufferSize = getArgParam('-b', '--buffer');
let unitName = getArgParam('-u', '--unit');
if(unitName && !(unitName in Api.UNITS)){
    throw `Unit not valide, must be one of ${Object.keys(Api.UNITS)}`;
}
let unit = Api.UNITS[unitName] || Api.UNITS.Mbps;

let api = new Api({
    token: token,
    verbose: verbose,
    timeout: timeout,
    urlCount: urlCount,
    bufferSize: bufferSize,
    https: https,
    unit: unit
});

api.getSpeed().then(s => {
    console.log(`Speed: ${s} ${unit.name}`);
}).catch(e => {
    console.error(e.message);
});
