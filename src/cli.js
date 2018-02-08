#!/usr/bin/env node

const Api = require("./Api");

let args = process.argv.slice(2);
let token = args[0];
if(!token){
    throw "You must define an app token";
}
let verbose = args[1] == "-v";

let api = new Api({
    token: token,
    verbose: verbose,
    timeout: 10000
});

api.getSpeed().then(s => {
    console.log(`Speed: ${s / 1000000} mo/s`);
});
