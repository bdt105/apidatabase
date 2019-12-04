import { Connexion } from "bdt105connexion/dist";
import { MyToolbox } from "./myToolbox";
export declare class BaseApi {
    protected app: any;
    protected connexion: Connexion;
    protected requiresToken: boolean;
    protected configuration: any;
    protected myToolbox: MyToolbox;
    protected moment: any;
    constructor(app: any, connexion: Connexion, configuration: any, requiresToken?: boolean);
    protected errorMessage(text: string): {
        "status": string;
        "message": string;
    };
    protected respond(response: any, statusCode: number, data?: any): void;
}
export declare class RecordsetApi extends BaseApi {
    assignObject(): void;
}
export declare class TableApi extends BaseApi {
    assign(): void;
    protected assignObject(): void;
    deleteRecord(body: any, response: any): void;
}
