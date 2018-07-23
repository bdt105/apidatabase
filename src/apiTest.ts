import { DatabaseTable, QueryAttribute } from './databaseObject';
import { Connexion } from "bdt105connexion/dist";
import { TableApi, RecordsetApi } from "./apiObject";
import { MyToolbox } from "./myToolbox";

export class ApiTest extends TableApi {

    assign(){
        this.assignObject ("prescribable", "idprescribable");

        let multer = require('multer');
        let upload = multer();

        this.app.get('/prescribable/test', function (request: any, response: any) {
            response.statusCode = 200;
            response.send("VIDAL prescribable is running");
        });
        
    }
    
}   