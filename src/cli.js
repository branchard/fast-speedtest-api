#!/usr/bin/env node

const Api = require("./Api");

let args = process.argv.slice(2);
let token = args[0];
if(!token || typeof token !== "string"){
    throw "You must define an app token";
}
let verbose = args[1] == "-v";

try{
    let api = new Api({
        token: token,
        verbose: verbose,
        timeout: 10000,
        urlCount: 5,
        bufferSize: 8,
        https: true,
        unit: Api.UNITS.Mbps
    });

    api.getSpeed().then(s => {
        console.log(`Speed: ${s} Mbps`);
    }).catch(e => {
        console.error(e.message);
    });
}catch(e){
    console.error(e.message);
}
