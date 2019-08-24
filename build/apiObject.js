"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseObject_1 = require("./databaseObject");
const databaseObject_2 = require("./databaseObject");
const myToolbox_1 = require("./myToolbox");
const util_1 = require("util");
class BaseApi {
    constructor(app, connexion, configuration, requiresToken = false) {
        this.app = app;
        this.connexion = connexion;
        this.configuration = configuration;
        this.requiresToken = requiresToken;
        this.myToolbox = new myToolbox_1.MyToolbox();
        this.moment = require('moment');
    }
    errorMessage(text) {
        return { "status": "ERR", "message": text };
    }
    respond(response, statusCode, data = null) {
        response.status(statusCode);
        if (util_1.isObject(data)) {
            response.setHeader('content-type', 'application/json');
        }
        else {
            response.setHeader('content-type', 'test/plain');
        }
        let datesToString = this.configuration.common.datesToString;
        if (datesToString) {
            Date.prototype.toJSON = function () {
                let d = this.getFullYear() + "-" +
                    ((this.getMonth() + 1).toString().length < 2 ? "0" : "") + (this.getMonth() + 1) + "-" +
                    (this.getDate().toString().length < 2 ? "0" : "") + this.getDate() + " " +
                    (this.getHours().toString().length < 2 ? "0" : "") + this.getHours() + ":" +
                    (this.getMinutes().toString().length < 2 ? "0" : "") + this.getMinutes() + ":" +
                    (this.getSeconds().toString().length < 2 ? "0" : "") + this.getSeconds();
                return d;
            };
        }
        let temp = JSON.stringify(data);
        response.send(temp);
    }
    verifyGoogleWebToken(callback, token) {
        this.verifyGoogleToken(callback, this.configuration.authentification.googleWebClientId, token);
    }
    verifyGoogleAndroidToken(callback, token) {
        return this.verifyGoogleToken(callback, this.configuration.authentification.googleAndroidClientId, token);
    }
    verifyGoogleIOsToken(callback, token) {
        return this.verifyGoogleToken(callback, this.configuration.authentification.googleIOsClientId, token);
    }
    checkToken(token) {
        let authent = this.connexion.checkJwt(token);
        if (authent.decoded) {
            return true;
        }
        else {
            return false;
        }
    }
    checkTokenGoogle(callback, token) {
        let authent = this.connexion.checkJwt(token);
        if (!authent.decoded) {
            this.verifyGoogleWebToken((data) => {
                if (data && data.status == "OK") {
                    callback(data);
                }
                else {
                    this.verifyGoogleAndroidToken((data) => {
                        if (data && data.status == "OK") {
                            callback(data);
                        }
                        else {
                            this.verifyGoogleIOsToken((data) => {
                                if (data && data.status == "OK") {
                                    callback(data);
                                }
                                else {
                                    callback({ "status": "ERR", "payload": null });
                                }
                            }, token);
                        }
                    }, token);
                }
            }, token);
        }
        else {
            callback({ "status": "OK", "payload": authent });
        }
    }
    verifyGoogleToken(callback, clientId, token) {
        let { OAuth2Client } = require('google-auth-library');
        let client = new OAuth2Client(clientId);
        client.verifyIdToken({
            idToken: token,
            audience: clientId
        }).then((value) => {
            let payload = value.getPayload();
            callback({ "status": "OK", "payload": payload });
        }).catch((reason) => {
            callback({ "status": "ERR", "payload": reason });
        });
    }
}
exports.BaseApi = BaseApi;
class RecordsetApi extends BaseApi {
    assignObject() {
        this.app.get('/', (request, response) => {
            this.respond(response, 200, 'API database is running');
        });
        this.app.get('/query', (request, response) => {
            this.respond(response, 200, 'API query is running !!');
        });
        let multer = require('multer');
        let upload = multer();
        // Lists all records of the table
        this.app.post('/query', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            let sql = request.body.sql;
            queryAttributes.from = request.body.from;
            queryAttributes.select = request.body.select;
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            queryAttributes.orderby = request.body.orderby;
            queryAttributes.groupby = request.body.groupby;
            queryAttributes.extra = request.body.extra;
            let token = request.body.token;
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }
            let recordset = new databaseObject_1.DatabaseRecordset(this.connexion, queryAttributes);
            recordset.logToConsole = this.configuration.common.logToConsole;
            if (sql) {
                recordset.sql(callback, sql);
            }
            else {
                recordset.load(callback);
            }
        });
        // export records of the query
        this.app.post('/query/csv', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            let sql = request.body.sql;
            queryAttributes.from = request.body.from;
            queryAttributes.select = request.body.select;
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            queryAttributes.orderby = request.body.orderby;
            queryAttributes.groupby = request.body.groupby;
            queryAttributes.extra = request.body.extra;
            let token = request.body.token;
            let fieldTerminatedBy = request.body.fieldTerminatedBy ? request.body.fieldTerminatedBy : ';';
            let fieldEnclosedBy = request.body.fieldEnclosedBy ? request.body.fieldEnclosedBy : '"';
            let lineTerminatedBy = request.body.lineTerminatedBy ? request.body.lineTerminatedBy : '\n';
            let fileName = this.myToolbox.getUniqueId() + '.csv';
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    let fs = require('fs');
                    fs.renameSync(this.configuration.mySql.fileDirectory + fileName, this.configuration.common.exportDirectory + fileName);
                    data.fileUrl = this.configuration.common.exportUrl + fileName;
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }
            let recordset = new databaseObject_1.DatabaseRecordset(this.connexion, queryAttributes);
            recordset.logToConsole = this.configuration.common.logToConsole;
            let realSql = sql;
            if (!realSql) {
                realSql = recordset.getSql();
            }
            realSql += " " +
                ` AS R INTO OUTFILE '` + this.configuration.mySql.fileDirectory + fileName + `' CHARACTER SET utf8 FIELDS TERMINATED BY '` + fieldTerminatedBy + `' ENCLOSED BY '` + fieldEnclosedBy + `' LINES TERMINATED BY '` + lineTerminatedBy + `'`;
            recordset.sql(callback, realSql);
        });
    }
}
exports.RecordsetApi = RecordsetApi;
class TableApi extends BaseApi {
    assign() {
        this.assignObject();
    }
    assignObject() {
        this.myToolbox.log("API to table ==> API launched");
        this.app.get('/table', (request, response) => {
            this.respond(response, 200, 'API table is running');
        });
        let multer = require('multer');
        let upload = multer();
        // Lists all records of the table
        this.app.get('/tablesearch/:tableName/:searchTerm', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.params.tableName;
            queryAttributes.select = "*";
            let searchTerm = request.params.searchTerm;
            let token = request.body.token;
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
                return;
            }
            if (!searchTerm) {
                this.respond(response, 400, "Please define a where to set all records to delete");
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            if (searchTerm) {
                table.search(callback, searchTerm, "= '##'", "OR");
            }
            else {
                table.load(callback);
            }
        });
        // Lists all records of the table
        this.app.post('/table', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = !request.body.select ? "*" : request.body.select;
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            queryAttributes.orderby = request.body.orderby;
            let searchTerm = request.body.searchTerm;
            let token = request.body.token;
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            if (request.body.searchTerm) {
                table.search(callback, searchTerm, " like '%##%'", "OR");
            }
            else {
                table.load(callback);
            }
        });
        // Saves an objects
        this.app.put('/table', upload.array(), (request, response) => {
            let token = request.body.token;
            let object = request.body.object;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.orderby = request.body.orderby;
            queryAttributes.select = "*";
            queryAttributes.idFieldName = request.body.idFieldName ? request.body.idFieldName.toString() : null;
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (!object) {
                this.respond(response, 400, "Please define a table like object:{...}");
                return;
            }
            if (!queryAttributes.idFieldName) {
                this.respond(response, 400, "Please define an idFieldName in you request body");
                return;
            }
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            table.save(callback, object);
        });
        // Gets an empty record
        this.app.post('/table/fresh', upload.array(), (request, response) => {
            let token = request.body.token;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = "*";
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            table.fresh(callback);
        });
        // Gets an empty record
        this.app.post('/table/fields', upload.array(), (request, response) => {
            let token = request.body.token;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = "*";
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            table.fields(callback);
        });
        // Deletes some records
        this.app.delete('/table', upload.array(), (request, response) => {
            let body = request.body;
            this.deleteRecord(body, response);
        });
        this.app.post('/table/delete', upload.array(), (request, response) => {
            let body = request.body;
            this.deleteRecord(body, response);
        });
    }
    deleteRecord(body, response) {
        let token = body.token;
        let where = body.where;
        let queryAttributes = new databaseObject_2.QueryAttribute();
        queryAttributes.from = body.tableName;
        queryAttributes.select = "*";
        let callback = (err, data) => {
            if (err) {
                this.respond(response, 500, err);
            }
            else {
                this.respond(response, 200, data);
            }
        };
        if (this.requiresToken && !this.checkToken(token)) {
            this.respond(response, 403, 'Token is absent or invalid');
            return;
        }
        if (!where) {
            this.respond(response, 400, "Please define a where to set all records to delete");
            return;
        }
        let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
        table.logToConsole = this.configuration.common.logToConsole;
        table.deleteFromWhere(callback, where);
    }
}
exports.TableApi = TableApi;
//# sourceMappingURL=apiObject.js.map