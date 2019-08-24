import express = require('express');

import { Connexion } from "bdt105connexion/dist";
import { Toolbox } from "bdt105toolbox/dist";
import { RecordsetApi, TableApi } from './index';

let app = express();

// For POST-Support
let toolbox = new Toolbox();
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

let conn = new Connexion(configuration.mySql, configuration.authentification);
let fake = (error: any, rows: any) => {
    console.log("Error: ", JSON.stringify(error))
    console.log("Rows: ", JSON.stringify(rows))
}

// let token = conn.createJwt({login: "bdt105", password:"12345"}, {expiresIn: '10y'});
conn.queryPool(
    (error: any, data: any) => fake(error, data), "SHOW DATABASES;"
);

// Contact Header
new TableApi(app, conn, configuration, configuration.authentification.active).assign();
new RecordsetApi(app, conn, configuration, configuration.authentification.active).assignObject();

app.listen(port);
toolbox.log("Listening on port " + port);