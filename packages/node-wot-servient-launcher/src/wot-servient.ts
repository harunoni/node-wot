#!/usr/bin/env node
/*
 * The MIT License (MIT)
 * Copyright (c) 2017 the thingweb community
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


"use strict"

// global W3C WoT Scripting API definitions
import _ from "wot-typescript-definitions";
// node-wot implementation of W3C WoT Servient 
import Servient from "node-wot-servient";
import DefaultServient from "./default-servient";
// protocols used
import HttpServer from "node-wot-protocols-http-server";
import HttpClientFactory from "node-wot-protocols-http-client";
// tools
import logger from "node-wot-logger";
import fs = require("fs");
import * as path from "path";

const confFile = "wot.conf.json";
const baseDir = ".";

const readConf = function () : Promise<any> {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(baseDir, confFile), "utf-8", (err, data) => {
            if (err) {
                logger.warn("using defaults due to", err.message);
                reject(err);
            }
            if (data) {
                const config = JSON.parse(data);
                logger.info("using conf file", confFile);
                resolve(config);
            }
        });
    });
}

const runScripts = function(srv : DefaultServient, scripts : Array<string>) : void {
    scripts.forEach((fname) => {
        logger.info("reading script", fname);
        fs.readFile(fname, "utf8", (err, data) => {
            if (err) {
                logger.error("cannot read script", err);
            } else {
                logger.info("running script", data);
                srv.runPriviledgedScript(data);
            }
        });
    });
}

const runAllScripts = function(srv : DefaultServient) : void {
    const scriptDir = path.join(baseDir, srv.config.servient.scriptDir);
    fs.readdir(scriptDir, (err, files) => {
        if (err) {
            logger.warn("autorun of scripts encountered error", err);
            return;
        }

        // unhidden .js files
        let scripts = files.filter( (file) => {
            return (file.substr(0, 1) !== "." && file.slice(-3) === ".js");
        });
        logger.info(`found ${scripts.length} script${scripts.length>1 ? "s" : ""}`);
        
        runScripts(srv, scripts.map(value => path.join(scriptDir, value)));
    });
}

readConf()
    .then((conf) => {
        return new DefaultServient(conf);
    })
    .catch(err => {
        return new DefaultServient();
    })
    .then(servient => {
        servient.start();
        if (process.argv.length>2) {
            logger.info(`loading ${process.argv.length-2} command line script${process.argv.length-2>1 ? "s" : ""}`);
            return runScripts(servient, process.argv.slice(2));
        } else {
            logger.info("loading directory", path.join(baseDir, servient.config.servient.scriptDir));
            return runAllScripts(servient);
        }
    })
    .catch(err => console.error(err));
