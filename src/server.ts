import express = require('express');

import { Connexion, MySqlConfiguration } from "bdt105connexion/dist";
import { Toolbox } from "bdt105toolbox/dist";
import { MyToolbox } from "./myToolbox";
import { RecordsetApi, TableApi } from './index';

let app = express();

// For POST-Support
let toolbox = new Toolbox();
let configuration = toolbox.loadFromJsonFile("./conf/configuration.json");

let bodyParser = require('body-parser');
let multer = require('multer');
let upload = multer();
let port = configuration.common.port;

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
conn.tryConnectSql();

// Contact Header
new TableApi(app, conn, false).assign("contactheader", "idcontactheader");

app.listen(port);