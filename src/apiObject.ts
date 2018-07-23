import { DatabaseRecordset } from './databaseObject';
import { DatabaseTable, QueryAttribute } from './databaseObject';
import { Connexion } from "bdt105connexion/dist";
import { MyToolbox } from "./myToolbox";

export class BaseApi {
    protected app: any;
    protected connexion: Connexion;
    protected requiresToken: boolean;

    protected myToolbox: MyToolbox;
    
    constructor(app: any, connexion: Connexion, requiresToken: boolean = false){
        this.app = app;
        this.connexion = connexion;
        this.requiresToken = requiresToken;
        this.myToolbox = new MyToolbox();
    }

    protected errorMessage(text: string){
        return {"status": "ERR", "message": text};
    }  

    protected respond(response: any, statusCode: number, data: any, contentType = 'application/json'){
        response.status(statusCode);
        response.setHeader('content-type', contentType);
        response.send(JSON.stringify(data));
    }    
}

export class RecordsetApi extends BaseApi {

    assignObject(){
        
        this.app.get('/', function (request: any, response: any) {
            response.send('API Authentification is running');
        });
        let multer = require('multer');
        let upload = multer();

        // Lists all records of the table
        this.app.post('/query', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = request.body.from;
            queryAttributes.select = request.body.select;
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            queryAttributes.orderby = request.body.orderby;
            queryAttributes.groupby = request.body.groupby;
            queryAttributes.extra = request.body.extra;
            let token = request.body.token;
            
            let callback = function(err: any, data: any){
                if (err){
                    response.send(JSON.stringify(err));
                }else{
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            }

            if (this.requiresToken){
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded){
                    response.send(this.errorMessage("Token is absent or invalid"))
                    return;
                }
            }

            let recordset = new DatabaseRecordset(this.connexion, queryAttributes);
        
            recordset.load(callback);
        });    
    }
}

export class TableApi extends BaseApi {
    
    assign(tableName: string, idFieldName: string, fields: any = null){
        this.assignObject(tableName, idFieldName, fields);
    }

    protected assignObject(tableName: string, idFieldName: string = null, fields: any = null){
        this.myToolbox.logg(tableName + " ==> API launched");
        
        this.app.get('/', function (request: any, response: any) {
            response.send('API to ' + tableName + ' is running');
        });
        let multer = require('multer');
        let upload = multer();
        
        // Lists all records of the table
        this.app.post('/' + tableName + 's', upload.array(), (request: any, response: any) => {
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            queryAttributes.where = request.body.where;
            queryAttributes.limit = request.body.limit;
            queryAttributes.offset = request.body.offset;
            let token = request.body.token;
            
            let callback = function(err: any, data: any){
                if (err){
                    response.send(JSON.stringify(err));
                }else{
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            }

            if (this.requiresToken){
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded){
                    response.send(this.errorMessage("Token is absent or invalid"))
                    return;
                }
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
        
            table.load(callback);
        });
        
        // Saves an objects
        this.app.put('/' + tableName, upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let object = request.body.object;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            queryAttributes.idFieldName = request.body.idFieldName.toString();
            
            let callback = (err: any, data: any) => {
                if (err){
                    response.send(JSON.stringify(this.errorMessage(err)));
                }else{
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            }

            if (!object){
                response.send(this.errorMessage('Please define a ' + tableName + '"object":{...}'));
                return;
            }
        
            if (!queryAttributes.idFieldName){
                response.send(this.errorMessage('Please define an "idFieldName": "xxx" in you request body'));
                return;
            }
        
            if (this.requiresToken){
                let authent: any = this.connexion.checkJwt(token);
                if (!authent.decoded){
                    response.send(this.errorMessage("Token is absent or invalid"))
                    return;
                }else{
                    if (object[queryAttributes.idFieldName]){ // That's an update
                        if (authent.decoded[queryAttributes.idFieldName] != object[queryAttributes.idFieldName]){
                            response.send(this.errorMessage("You can update only your self (id in obejct identical to id of token)"));
                            return;
                        }
                    }
                }
            }
        
            let table = new DatabaseTable(this.connexion, queryAttributes);
            
            table.save(callback, object);
        });
        
        // Gets an empty record
        this.app.post('/' + tableName + '/fresh', upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            
            let callback = (err: any, data: any) => {
                if (err){
                    response.send(JSON.stringify(this.errorMessage(err)));
                }else{
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            }

            if (this.requiresToken){
                let authent = this.connexion.checkJwt(token);
                if (!authent.decoded){
                    response.send(this.errorMessage("Token is absent or invalid"))
                    return;
                }
            }

            let table = new DatabaseTable(this.connexion, queryAttributes);
            
            table.fresh(callback);
        });
        
        // Deletes some records
        this.app.delete('/' + tableName, upload.array(), (request: any, response: any) => {
            let token = request.body.token;
            let where = request.body.where;
            let queryAttributes = new QueryAttribute();
            queryAttributes.from = tableName;
            queryAttributes.select = "*";
            
            let callback = (err: any, data: any) => {
                if (err){
                    response.send(JSON.stringify(this.errorMessage(err)));
                }else{
                    response.setHeader('content-type', 'application/json');
                    response.send(JSON.stringify(data));
                }
            }

            if (this.requiresToken){
                let authent: any = this.connexion.checkJwt(token);
                if (!authent.decoded){
                    response.send(this.errorMessage("Token is absent or invalid"))
                    return;
                }else{
                    if (authent.decoded.type != 1){
                        response.send(this.errorMessage("This function is for administrators only"));
                        return;
                    }
                }
            }
                
            if (!where){
                response.send(this.errorMessage('Please define a where to set all records to delete'));
                return;
            }
                
            let table = new DatabaseTable(this.connexion, queryAttributes);
            
            table.deleteFromWhere(callback, where);
        });      
    }
}    