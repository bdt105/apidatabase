"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const databaseObject_1 = require("./databaseObject");
const databaseObject_2 = require("./databaseObject");
const myToolbox_1 = require("./myToolbox");
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
    respond(response, statusCode, data, contentType = 'application/json') {
        response.status(statusCode);
        response.setHeader('content-type', contentType);
        response.send(JSON.stringify(data));
    }
}
exports.BaseApi = BaseApi;
class RecordsetApi extends BaseApi {
    assignObject() {
        this.app.get('/', function (request, response) {
            response.send('API Authentification is running');
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
            let callback = function (err, data) {
                if (err) {
                    response.send(JSON.stringify(err));
                }
                else {
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            };
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    response.send(this.errorMessage("Token is absent or invalid"));
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
    assign(tableName, idFieldName, fields = null) {
        this.assignObject(tableName, idFieldName, fields);
    }
    assignObject(tableName, idFieldName = null, fields = null) {
        this.myToolbox.logg(tableName + " ==> API launched");
        this.app.get('/', function (request, response) {
            response.send('API to ' + tableName + ' is running');
        });
        let multer = require('multer');
        let upload = multer();
        // Lists all records of the table
        this.app.post('/' + tableName + 's', upload.array(), (request, response) => {
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            let token = request.body.token;
            let callback = function (err, data) {
                if (err) {
                    response.send(JSON.stringify(err));
                }
                else {
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            };
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    response.send(this.errorMessage("Token is absent or invalid"));
                    return;
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.load(callback);
        });
        // Saves an objects
        this.app.put('/' + tableName, upload.array(), (request, response) => {
            let token = request.body.token;
            let object = request.body.object;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            queryAttributes.idFieldName = request.body.idFieldName.toString();
            let callback = (err, data) => {
                if (err) {
                    response.send(JSON.stringify(this.errorMessage(err)));
                }
                else {
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            };
            if (!object) {
                response.send(this.errorMessage('Please define a ' + tableName + '"object":{...}'));
                return;
            }
            if (!queryAttributes.idFieldName) {
                response.send(this.errorMessage('Please define an "idFieldName": "xxx" in you request body'));
                return;
            }
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    response.send(this.errorMessage("Token is absent or invalid"));
                    return;
                }
                else {
                    if (object[queryAttributes.idFieldName]) {
                        if (authent.decoded[queryAttributes.idFieldName] != object[queryAttributes.idFieldName]) {
                            response.send(this.errorMessage("You can update only your self (id in obejct identical to id of token)"));
                            return;
                        }
                    }
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.save(callback, object);
        });
        // Gets an empty record
        this.app.post('/' + tableName + '/fresh', upload.array(), (request, response) => {
            let token = request.body.token;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            let callback = (err, data) => {
                if (err) {
                    response.send(JSON.stringify(this.errorMessage(err)));
                }
                else {
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            };
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    response.send(this.errorMessage("Token is absent or invalid"));
                    return;
                }
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.fresh(callback);
        });
        // Deletes some records
        this.app.delete('/' + tableName, upload.array(), (request, response) => {
            let token = request.body.token;
            let where = request.body.where;
            let queryAttributes = new databaseObject_2.QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            let callback = (err, data) => {
                if (err) {
                    response.send(JSON.stringify(this.errorMessage(err)));
                }
                else {
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            };
            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    response.send(this.errorMessage("Token is absent or invalid"));
                    return;
                }
                else {
                    if (authent.decoded.type != 1) {
                        response.send(this.errorMessage("This function is for administrators only"));
                        return;
                    }
                }
            }
            if (!where) {
                response.send(this.errorMessage('Please define a where to set all records to delete'));
                return;
            }
            let table = new databaseObject_2.DatabaseTable(this.connexion, queryAttributes);
            table.deleteFromWhere(callback, where);
        });
    }
}
exports.TableApi = TableApi;
//# sourceMappingURL=apiObject.js.map