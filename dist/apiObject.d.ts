import { Connexion } from "bdt105connexion/dist";
import { MyToolbox } from "./myToolbox";
export declare class BaseApi {
    protected app: any;
    protected connexion: Connexion;
    protected requiresToken: boolean;
    protected myToolbox: MyToolbox;
    constructor(app: any, connexion: Connexion, requiresToken?: boolean);
    protected errorMessage(text: string): {
        "status": string;
        "message": string;
    };
    protected respond(response: any, statusCode: number, data: any, contentType?: string): void;
}
export declare class RecordsetApi extends BaseApi {
    assignObject(): void;
}
export declare class TableApi extends BaseApi {
    assign(tableName: string, idFieldName: string, fields?: any): void;
    protected assignObject(tableName: string, idFieldName?: string, fields?: any): void;
}
