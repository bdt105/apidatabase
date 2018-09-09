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
    private verifyGoogleWebToken(callback, token);
    private verifyGoogleAndroidToken(callback, token);
    private verifyGoogleIOsToken(callback, token);
    protected checkToken(token: string): boolean;
    protected checkTokenGoogle(callback: Function, token: string): void;
    private verifyGoogleToken(callback, clientId, token);
}
export declare class RecordsetApi extends BaseApi {
    assignObject(): void;
}
export declare class TableApi extends BaseApi {
    assign(): void;
    protected assignObject(): void;
}
