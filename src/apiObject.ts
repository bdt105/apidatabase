import { DatabaseRecordset } from './databaseObject';
import { DatabaseTable, QueryAttribute } from './databaseObject';
import { Connexion } from "bdt105connexion/dist";
import { MyToolbox } from "./myToolbox";
import { isObject } from 'util';

export class BaseApi {
    protected app: any;
    protected connexion: Connexion;
    protected requiresToken: boolean;
    protected configuration: any;

    protected myToolbox: MyToolbox;

    protected moment: any;

    constructor(app: any, connexion: Connexion, configuration: any, requiresToken: boolean = false) {
        this.app = app;
        this.connexion = connexion;
        this.configuration = configuration;
        this.requiresToken = requiresToken;
        this.myToolbox = new MyToolbox();
        this.moment = require('moment');
    }

    protected errorMessage(text: string) {
        return { "status": "ERR", "message": text };
    }

    protected respond(response: any, statusCode: number, data: any = null) {
        response.status(statusCode);
        if (isObject(data)) {
            response.setHeader('content-type', 'application/json');
        } else {
            response.setHeader('content-type', 'test/plain');
        }

        Date.prototype.toJSON = function () {
            return this.toLocaleString();
        }
        let temp = JSON.stringify(data);
        response.send(temp);
    }

    private verifyGoogleWebToken(callback: Function, token: string) {
        this.verifyGoogleToken(callback, this.configuration.authentification.googleWebClientId, token);
    }

    private verifyGoogleAndroidToken(callback: Function, token: string) {
        return this.verifyGoogleToken(callback, this.configuration.authentification.googleAndroidClientId, token);
    }

    private verifyGoogleIOsToken(callback: Function, token: string) {
        return this.verifyGoogleToken(callback, this.configuration.authentification.googleIOsClientId, token);
    }

    protected checkToken(token: string) {
        let authent = this.connexion.checkJwt(token);
        if (authent.decoded) {
            return true;
        } else {
            return false;
        }
    }

    protected checkTokenGoogle(callback: Function, token: string) {
        let authent = this.connexion.checkJwt(token);
        if (!authent.decoded) {
            this.verifyGoogleWebToken(
                (data: any) => {
                    if (data && data.status == "OK") {
                        callback(data)
                    } else {
                        this.verifyGoogleAndroidToken((data: any) => {
                            if (data && data.status == "OK") {
                                callback(data)
                            } else {
                                this.verifyGoogleIOsToken((data: any) => {
                                    if (data && data.status == "OK") {
                                        callback(data)
                                    } else {
                                        callback({ "status": "ERR", "payload": null });
                                    }
                                }, token);

                            }
                        }, token);
                    }
                }, token);
        } else {
            callback({ "status": "OK", "payload": authent });
        }
    }

    private verifyGoogleToken(callback: Function, clientId: string, token: string) {
        let { OAuth2Client } = require('google-auth-library');
        let client = new OAuth2Client(clientId);
        client.verifyIdToken({
            idToken: token,
            audience: clientId
        }).then((value: any) => {
            let payload = value.getPayload();
            callback({ "status": "OK", "payload": payload });
        }).catch((reason: any) => {
            callback({ "status": "ERR", "payload": reason });
        });
    }
}

export class RecordsetApi extends BaseApi {

    assignObject() {

        this.app.get('/', (request: any, response: any) => {
            this.respond(response, 200, 'API database is running');
        });

        this.app.get('/query', (request: any, response: any) => {
            this.respond(response, 200, 'API query is running !!');
        });

        let multer = require('multer');
        let upload = multer();

        // Lists all records of the table
        this.app.post('/query', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
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

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }

            let recordset = new DatabaseRecordset(this.connexion, queryAttributes);
            recordset.logToConsole = this.configuration.common.logToConsole;

            if (sql) {
                recordset.sql(callback, sql);
            } else {
                recordset.load(callback);
            }
        });

        // export records of the query
        this.app.post('/query/csv', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
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

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    let fs = require('fs');
                    fs.renameSync(this.configuration.mySql.fileDirectory + fileName, this.configuration.common.exportDirectory + fileName)
                    data.fileUrl = this.configuration.common.exportUrl + fileName;
                    this.respond(response, 200, data);
                }
            }

            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }

            let recordset = new DatabaseRecordset(this.connexion, queryAttributes);
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

export class TableApi extends BaseApi {

    assign() {
        this.assignObject();
    }

    protected assignObject() {
        this.myToolbox.log("API to table ==> API launched");

        this.app.get('/table', (request: any, response: any) => {
            this.respond(response, 200, 'API table is running');
        });
        let multer = require('multer');
        let upload = multer();

        // Lists all records of the table
        this.app.post('/table', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = !request.body.select ? "*" : request.body.select;
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            queryAttributes.orderby = request.body.orderby;
            let searchTerm = request.body.searchTerm;
            let token = request.body.token;

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;

            if (request.body.searchTerm) {
                table.search(callback, searchTerm, " like '%##%'", "OR");
            } else {
                table.load(callback);
            }

        });

        // Saves an objects
        this.app.put('/table', upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let object = request.body.object;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.orderby = request.body.orderby;
            queryAttributes.select = "*";
            queryAttributes.idFieldName = request.body.idFieldName ? request.body.idFieldName.toString() : null;

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

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
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;

            table.save(callback, object);
        });

        // Gets an empty record
        this.app.post('/table/fresh', upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = "*";

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;

            table.fresh(callback);
        });

        // Deletes some records
        this.app.delete('/table', upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let where = request.body.where;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.body.tableName;
            queryAttributes.select = "*";

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

            if (this.requiresToken && !this.checkToken(token)) {
                this.respond(response, 403, 'Token is absent or invalid');
            }

            if (!where) {
                this.respond(response, 400, "Please define a where to set all records to delete");
                return;
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;

            table.deleteFromWhere(callback, where);
        });
    }
}    