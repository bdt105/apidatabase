"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseObject_1 = require("./databaseObject");
const databaseObject_2 = require("./databaseObject");
const myToolbox_1 = require("./myToolbox");
const util_1 = require("util");
class BaseApi {
    constructor(app, connexion, requiresToken = false) {
        this.app = app;
        this.connexion = connexion;
        this.requiresToken = requiresToken;
        this.myToolbox = new myToolbox_1.MyToolbox();
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
        response.send(JSON.stringify(data));
    }
}
exports.BaseApi = BaseApi;
class RecordsetApi extends BaseApi {
    assignObject() {
        this.app.get('/recordset', (request, response) => {
            this.respond(response, 200, 'API recordset is running');
        });
        let multer = require('multer');
        let upload = multer();
        // Lists all records of the table
        this.app.post('/query', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
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
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }
            let recordset = new databaseObject_1.DatabaseRecordset(this.connexion, queryAttributes);
            recordset.load(callback);
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
        this.app.post('/table', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = "*";
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            let token = request.body.token;
            let callback = (err, data) => {
                if (err) {
                    this.respond(response, 500, err);
                }
                else {
                    this.respond(response, 200, data);
                }
            };
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.load(callback);
        });
        // Saves an objects
        this.app.put('/table', upload.array(), (request, response) => {
            let token = request.body.token;
            let object = request.body.object;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = request.body.tableName;
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
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
                else {
                    if (object[queryAttributes.idFieldName]) {
                        if (authent.decoded[queryAttributes.idFieldName] != object[queryAttributes.idFieldName]) {
                            this.respond(response, 403, "You can update only your self (id in object identical to id of token)");
                            return;
                        }
                    }
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
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
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.fresh(callback);
        });
        // Deletes some records
        this.app.delete('/table', upload.array(), (request, response) => {
            let token = request.body.token;
            let where = request.body.where;
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
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
                // } else {
                //     if (authent.decoded.type != 1) {
                //         this.respond(response, 403, "This function is for administrators only");
                //         return;
                //     }
                // }
            }
            if (!where) {
                this.respond(response, 400, "Please define a where to set all records to delete");
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.deleteFromWhere(callback, where);
        });
    }
}
exports.TableApi = TableApi;
//# sourceMappingURL=apiObject.js.map