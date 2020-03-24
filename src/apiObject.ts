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
            }
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

            let execute = () => {
                let recordset = new DatabaseRecordset(this.connexion, queryAttributes);
                recordset.logToConsole = this.configuration.common.logToConsole;

                if (sql) {
                    recordset.sql(callback, sql);
                } else {
                    recordset.load(callback);
                }
            }

            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
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

            let execute = () => {
                let recordset = new DatabaseRecordset(this.connexion, queryAttributes);
                recordset.logToConsole = this.configuration.common.logToConsole;

                let realSql = sql;
                if (!realSql) {
                    realSql = recordset.getSql();
                }

                realSql += " " +
                    ` AS R INTO OUTFILE '` + this.configuration.mySql.fileDirectory + fileName + `' CHARACTER SET utf8 FIELDS TERMINATED BY '` + fieldTerminatedBy + `' ENCLOSED BY '` + fieldEnclosedBy + `' LINES TERMINATED BY '` + lineTerminatedBy + `'`;

                recordset.sql(callback, realSql);
            }

            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
            }
        });
    }
}

export class TableApi extends BaseApi {

    assign() {
        this.assignObject();
    }

    protected assignObject() {
        console.log("API to table ==> API launched");

        this.app.get('/table', (request: any, response: any) => {
            this.respond(response, 200, 'API table is running');
        });
        let multer = require('multer');
        let upload = multer();

        // Search in table
        this.app.get('/tablesearch/:tableName/:field/:searchTerm', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.params.tableName;
            queryAttributes.select = "*";
            queryAttributes.where = "`" + request.params.field + "`='" + request.params.searchTerm + "'";
            // let token = request.body.token;

            let callback = (err: any, data: any) => {
                if (err) {
                    this.respond(response, 500, err);
                } else {
                    this.respond(response, 200, data);
                }
            }

            // if (this.requiresToken && !this.checkToken(token)) {
            //     this.respond(response, 403, 'Token is absent or invalid');
            //     return;
            // }

            if (!request.params.searchTerm) {
                this.respond(response, 400, "Please define a where to set all records to delete");
                return;
            }

            if (!request.params.field) {
                this.respond(response, 400, "Please define a where to set all records to delete");
                return;
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;

            table.load(callback);
        });

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

            let execute = () => {
                let table = new DatabaseTable(this.connexion, queryAttributes);
                table.logToConsole = this.configuration.common.logToConsole;

                if (request.body.searchTerm) {
                    table.search(callback, searchTerm, " like '%##%'", "OR");
                } else {
                    table.load(callback);
                }
            }

            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
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

            let execute = () => {

                let table = new DatabaseTable(this.connexion, queryAttributes);
                table.logToConsole = this.configuration.common.logToConsole;

                table.save(callback, object);
            }

            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
            }

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

            let execute = () => {
                let table = new DatabaseTable(this.connexion, queryAttributes);
                table.logToConsole = this.configuration.common.logToConsole;

                table.fresh(callback);
            }

            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
            }
        });

        // Gets an empty record
        this.app.post('/table/fields', upload.array(), (request: any, response: any) => {
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

            let execute = () => {
                let table = new DatabaseTable(this.connexion, queryAttributes);
                table.logToConsole = this.configuration.common.logToConsole;

                table.fields(callback);
            }
            if (this.requiresToken) {
                this.connexion.checkToken((data: any, error: any) => {
                    if (error) {
                        this.respond(response, 403, 'Token is absent or invalid');
                    } else {
                        execute();
                    }
                }, token);
            } else {
                execute();
            }

        });

        // Deletes some records
        this.app.delete('/table', upload.array(), (request: any, response: any) => {
            let body = request.body;
            this.deleteRecord(body, response);
        });

        this.app.post('/table/delete', upload.array(), (request: any, response: any) => {
            let body = request.body;
            this.deleteRecord(body, response);
        });
    }

    deleteRecord(body: any, response: any) {
        let token = body.token;
        let where = body.where;
        let queryAttributes = new QueryAttribute();
        queryAttributes.from = body.tableName;
        queryAttributes.select = "*";

        let callback = (err: any, data: any) => {
            if (err) {
                this.respond(response, 500, err);
            } else {
                this.respond(response, 200, data);
            }
        }

        if (!where) {
            this.respond(response, 400, "Please define a where to set all records to delete");
            return;
        }

        let execute = () => {
            let table = new DatabaseTable(this.connexion, queryAttributes);
            table.logToConsole = this.configuration.common.logToConsole;
            table.deleteFromWhere(callback, where);
        }

        if (this.requiresToken) {
            this.connexion.checkToken((data: any, error: any) => {
                if (error) {
                    this.respond(response, 403, 'Token is absent or invalid');
                } else {
                    execute();
                }
            }, token);
        } else {
            execute();
        }
    }
}    