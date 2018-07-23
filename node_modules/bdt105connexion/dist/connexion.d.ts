export declare class MySqlConfiguration {
    host: string;
    user: string;
    password: string;
    port: number;
    database: string;
    userTableName: string;
    loginFieldName: string;
    passwordFieldName: string;
    emailFieldName: string;
    idFieldName: string;
    constructor(host: string, port: number, user: string, password: string, database: string, userTableName?: string, idFieldName?: string, loginFieldName?: string, passwordFieldName?: string, emailFieldName?: string);
}
export declare class JwtConfiguration {
    secret: string;
    salt: string;
    userRequestEmail: string;
    adminToken: string;
    constructor(secret: string, salt: string, userRequestEmail: string, adminToken: string);
}
export declare class Token {
    token: string;
    status: string;
    decoded: string;
    constructor(token: string, status: string, decoded: string);
}
export declare class Connexion {
    private mySql;
    private sqlConnexion;
    private jsonwebtoken;
    static readonly jwtStatusOk: string;
    static readonly jwtStatusERR: string;
    private toolbox;
    mySqlConfiguration: MySqlConfiguration;
    jwtConfiguration: JwtConfiguration;
    rows: any;
    err: any;
    iss: string;
    permissions: string;
    epirationDate: number;
    constructor(mySqlConfiguration?: MySqlConfiguration, jwtConfiguration?: JwtConfiguration);
    private log(text);
    private connectSql();
    private releaseSql();
    private callbackConnect(err);
    private callbackGetJwt(callback, err, rows, plainPassword);
    private callbackQuerySql(callback, err, rows);
    querySql(callback: Function, sql: string): void;
    getJwt(callback: Function, login: string, plainPassword: string, where?: string): void;
    checkJwt(token: string): Token;
    isTokenValid(token: string): boolean;
    encrypt(plain: string): string;
    compareEncrypt(encrypted: string, plain: string): boolean;
    tryConnectSql(): void;
}
