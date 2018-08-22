import { DatabaseRecordset } from './databaseObject';
import { DatabaseTable, QueryAttribute } from './databaseObject';
import { Connexion } from "bdt105connexion/dist";
import { MyToolbox } from "./myToolbox";
import { isObject } from 'util';

export class BaseApi {
    protected app: any;
    protected connexion: Connexion;
    protected requiresToken: boolean;

    protected myToolbox: MyToolbox;

    protected moment: any;

    constructor(app: any, connexion: Connexion, requiresToken: boolean = false) {
        this.app = app;
        this.connexion = connexion;
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
}

export class RecordsetApi extends BaseApi {

    assignObject() {

        this.app.get('/', (request: any, response: any) => {
            this.respond(response, 200, 'API database is running');
        });
        this.app.get('/query', (request: any, response: any) => {
            this.respond(response, 200, 'API query is running');
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

            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }

            let recordset = new DatabaseRecordset(this.connexion, queryAttributes);

            if (sql) {
                recordset.sql(callback, sql);
            } else {
                recordset.load(callback);
            }
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

            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
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

            if (this.requiresToken) {
                let authent: any = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }

            }

            let table = new DatabaseTable(this.connexion, queryAttributes);

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

            if (this.requiresToken) {
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded) {
                    this.respond(response, 403, 'Token is absent or invalid');
                    return;
                }
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);

            table.fresh(callback);
        });

        // Gets an empty record
        // this.app.post('/table/search', upload.array(), (request: any, response: any) => {
        //     let token = request.body.token;
        //     let searchTerm = request.body.searchTerm;
        //     let queryAttributes = new QueryAttribute();
        //     queryAttributes.from = request.body.tableName;
        //     queryAttributes.select = "*";
        //     queryAttributes.limit = request.body.limit;
        //     queryAttributes.offset = request.body.offset;
        //     queryAttributes.orderby = request.body.orderby;

        //     let callback = (err: any, data: any) => {
        //         if (err) {
        //             this.respond(response, 500, err);
        //         } else {
        //             this.respond(response, 200, data);
        //         }
        //     }

        //     if (this.requiresToken) {
        //         let authent = this.connexion.checkJwt(token);
        //         if (!authent.decoded) {
        //             this.respond(response, 403, 'Token is absent or invalid');
        //             return;
        //         }
        //     }

        //     let table = new DatabaseTable(this.connexion, queryAttributes);
        //     if (request.body.searchTerm) {
        //         table.search(callback, searchTerm, " like '%##%'", "OR");
        //     } else {
        //         callback("No search term", null);
        //     }
        // });

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

            if (this.requiresToken) {
                let authent: any = this.connexion.checkJwt(token);
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

            let table = new DatabaseTable(this.connexion, queryAttributes);

            table.deleteFromWhere(callback, where);
        });
    }
}    