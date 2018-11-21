import { Connexion } from "bdt105connexion/dist";
import { Toolbox } from "bdt105toolbox/dist";
/** Class representing a field value. */
export declare class FieldValue {
    fieldName: string;
    value: string;
    comparisonOperator: string;
    logicOperator: string;
}
/** Basic database class */
export declare class DatabaseObject {
    protected connexion: Connexion;
    protected toolbox: Toolbox;
    logToConsole: boolean;
    constructor(connexion: Connexion);
    /**
     * Queries the database and then calls the callback function sending retrieved data
     * Calls
     * @param {Function} callback - Callback function to be called when query is done
     * @param {string} sql - Sql query
     * @return {void}
     */
    protected queryOld(callback: Function, sql: string): void;
    protected query(callback: Function, sql: string): void;
    /**
     * Retrieve a sql sentence refering to a 'where' by concataining fields and logic operators
     * Calls
     * @param {FieldValue[]} fieldValues - Callback function to be called when query is done
     * @param {string} defaultLogicOperator - Logic operator
     * @param {string} defaultComparisonOperator - Comparison operator
     * @return {string} - 'where' sentence
     */
    protected getWhereString(fieldValues: FieldValue[], defaultLogicOperator?: string, defaultComparisonOperator?: string): string;
    fieldsToString(tableName: string, fields: any[], alias?: boolean): string;
}
/** Query information class */
export declare class QueryAttribute {
    select: string;
    from: string;
    orderby: string;
    groupby: string;
    where: string;
    limit: number;
    offset: number;
    extra: string;
    idFieldName: string;
}
/** Class to get a recordset */
export declare class DatabaseRecordset extends DatabaseObject {
    protected attributes: QueryAttribute;
    /**
     * Creates the object, a connexion to Mysql is needed
     * @param {Connexion} - Connexion to mySql bdt105connexion object
     * @param {QueryAttribute} - Content of the sql query QueryAttribute object
     * @return {void}
     */
    constructor(connexion: Connexion, attributes?: QueryAttribute);
    /**
     * Retrieves a sql phrase in order to use where, groupby,; orderby limit and offset sql paramaters
     * @return {string} - End of sql sentence
     */
    protected getSqlend(): string;
    /**
     * Retrieves a sql phrase with all paramters
     * @return {string} - Sql sentence
     */
    getSql(): string;
    protected whereString(fieldValues: FieldValue[]): string;
    /**
     * Queries the recordset an popultates the result
     * @param {Function} - Callback function to cal when work is done
     * @return {void}
     */
    load(callback: Function): void;
    /**
     * Queries the recordset an popultates the result
     * @param {Function} - Callback function to cal when work is done
     * @param {string} - Sql string
     * @return {void}
     */
    sql(callback: Function, sql: string): void;
}
/** Class to get a table, allows crud functions */
export declare class DatabaseTable extends DatabaseRecordset {
    private callbackSearch(err, rows, formula, operator, q, callback);
    /**
     * Load data from the id
     * @param {Function} - Callback function
     * @param {string} - Id to search for
     * @return {void}
     */
    load(callback: Function): void;
    /**
     * Load data from the id
     * @param {Function} - Callback function
     * @param {string} - Id to search for
     * @return {void}
     */
    loadFromId(callback: Function, id: string): void;
    /**
     * Load data from a where condition
     * @param {Function} - Callback function
     * @param {string} - where condition
     * @return {void}
     */
    loadFromWhere(callback: Function, where: string): void;
    /**
     * Retreives data from a string search in any field of the table
     * @param {Function} callback - Callback function
     * @param {string} q - search term
     * @param {string} prefix - prefix of the condition for each field
     * @param {string} suffix - suffix of the condition for each field
     * @return {void}
     */
    search(callback: Function, q: string, formula: string, operator: string): void;
    private insertString(body);
    /**
     * Inserts a record inside the table
     * @param {Function} callback - Callback function
     * @param {any} body - object to insert, propertie must match table fields
     * @return {void}
     */
    insert(callback: Function, body: any): void;
    /**
     * Deletes a record with a certain field equals a certain value
     * @param {Function} callback - Callback function
     * @param {any} fieldName - Name of the field
     * @param {any} value - Value of the field
     * @return {void}
     */
    deleteFromField(callback: Function, fieldName: string, value: string): void;
    /**
     * Deletes a record with a certain id
     * @param {Function} callback - Callback function
     * @param {string} value - Value of the id
     * @return {void}
     */
    deleteFromId(callback: Function, value: string): void;
    /**
     * Deletes a record with a certain condition
     * @param {Function} callback - Callback function
     * @param {string} where - Condition
     * @return {void}
     */
    deleteFromWhere(callback: Function, where: string): void;
    private updateString(body);
    /**
     * Updates a record
     * @param {Function} callback - Callback function
     * @param {any} body - Object to update
     * @param {string} where - Condition
     * @return {void}
     */
    update(callback: Function, body: any, where: string): void;
    private callbackUnique(callback, body, id, err, rows);
    /**
     * Saves a record. If id is found in the database, then the object is updated if not it is inserted
     * @param {Function} callback - Callback function
     * @param {any} body - Object to update
     * @param {string} id - Id of the record
     * @return {void}
     */
    save(callback: Function, body: any): void;
    private callbackFresh(err, rows, callback);
    /**
     * Retreives an empty record
     * @param {Function} callback - Callback function
     * @return {void}
     */
    fresh(callback: Function): void;
    /**
     * Retreives an empty record
     * @param {Function} callback - Callback function
     * @return {void}
     */
    fields(callback: Function): void;
}
