#!/usr/bin/env node

const Api = require("./Api");


let args = process.argv.slice(2);
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

if(restArgs.includes('-h') || restArgs.includes('--help')){
    console.log("print help");
    process.exit(0);
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
if(!(unitName in Api.UNITS)){
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
