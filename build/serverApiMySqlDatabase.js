"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const dist_1 = require("bdt105connexion/dist");
const dist_2 = require("bdt105toolbox/dist");
const index_1 = require("./index");
let app = express();
// For POST-Support
let toolbox = new dist_2.Toolbox();
let configuration = toolbox.loadFromJsonFile("configuration.json");
let bodyParser = require('body-parser');
let port = configuration.common.port;
process.on('uncaughtException', function (err) {
    console.error(err);
    console.error("Node NOT Exiting...");
    console.log(err);
    console.log("Node NOT Exiting...");
});
app.use(bodyParser());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Request methods you wish to allow    
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Set to true if you need the website to include cookies in the requests sent, to the API (e.g. in case you use sessions)
    // Pass to next layer of middleware
    next();
});
let conn = new dist_1.Connexion(configuration.mySql, configuration.authentification);
let fake = (error, rows) => {
    console.log("Error: ", JSON.stringify(error));
    console.log("Rows: ", JSON.stringify(rows));
};
// let token = conn.createJwt({login: "bdt105", password:"12345"}, {expiresIn: '10y'});
conn.queryPool((error, data) => fake(error, data), "SHOW DATABASES;");
// Contact Header
new index_1.TableApi(app, conn, configuration, true).assign();
new index_1.RecordsetApi(app, conn, configuration, true).assignObject();
app.listen(port);
toolbox.log("Listening on port " + port);
//# sourceMappingURL=serverApiMySqlDatabase.js.map