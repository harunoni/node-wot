const node_wot = require('node-wot')
const CoapServer =  require('node-wot-protocols-coap-server').default
const HttpServer =  require('node-wot-protocols-http-server').default
const fs = require('fs')

const srv =  new node_wot.Servient()
srv.addServer(new CoapServer())
srv.addServer(new HttpServer())
const wot = srv.start()

fs.readFile('../testthing/testthing.js', "utf8", (err, data) => {
    if (err) {
        console.error("error while reading script", err);
    } else {
        //console.log("running script", data);
        srv.runPriviledgedScript(data);
    }
});
