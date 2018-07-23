export declare class Rest {
    logFileName: string;
    logToConsole: boolean;
    private toolbox;
    constructor(logFileName?: string, logToConsole?: boolean);
    private statusText;
    call(callback: Function, method: string, url: string, body?: any, contentType?: string, getRaw?: boolean, headers?: any): void;
}
