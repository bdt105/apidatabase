import { Connexion } from "bdt105connexion/dist";
import { Toolbox } from "bdt105toolbox/dist";

/** Class representing a field value. */
export class FieldValue {
    public fieldName: string;
    public value: string;
    public comparisonOperator: string;
    public logicOperator: string;
}

/** Basic database class */
export class DatabaseObject {
    protected connexion: Connexion;
    protected toolbox: Toolbox;

    constructor(connexion: Connexion) {
        this.connexion = connexion;
        this.toolbox = new Toolbox();
    }

    /**
     * Queries the database and then calls the callback function sending retrieved data
     * Calls 
     * @param {Function} callback - Callback function to be called when query is done
     * @param {string} sql - Sql query
     * @return {void}
     */
    protected queryOld(callback: Function, sql: string) {
        if (this.connexion) {
            this.connexion.querySql(
                (err: any, rows: any) => callback(err, rows), sql);
        }
    }
    protected query(callback: Function, sql: string) {
        if (this.connexion) {
            this.connexion.queryPool(
                (err: any, rows: any) => callback(err, rows), sql);
        }
    }

    /**
     * Retrieve a sql sentence refering to a 'where' by concataining fields and logic operators
     * Calls 
     * @param {FieldValue[]} fieldValues - Callback function to be called when query is done
     * @param {string} defaultLogicOperator - Logic operator
     * @param {string} defaultComparisonOperator - Comparison operator
     * @return {string} - 'where' sentence
     */
    protected getWhereString(fieldValues: FieldValue[], defaultLogicOperator = "AND", defaultComparisonOperator = "="): string {
        var ret = "";
        if (fieldValues) {
            for (var i = 0; i < fieldValues.length; i++) {
                ret += (ret != "" ? (fieldValues[i].logicOperator ? " " + fieldValues[i].logicOperator + " " : " " + defaultLogicOperator + " ") : "") +
                    fieldValues[i].fieldName + (fieldValues[i].comparisonOperator ? fieldValues[i].comparisonOperator : "=") + "'" + fieldValues[i].value + "'";
            }
        }
        return ret;
    }

    fieldsToString(tableName: string, fields: any[], alias = true) {
        var ret = "";
        for (var i = 0; i < fields.length; i++) {
            ret += (ret == "" ? "" : ", ") + (alias ? tableName + "." : "") + fields[i] + (alias ? " " + tableName + "_" + fields[i] : "");
        }
        return ret;
    }

}

/** Query information class */
export class QueryAttribute {
    public select: string;
    public from: string;
    public orderby: string;
    public groupby: string;
    public where: string;
    public limit: number;
    public offset: number;
    public extra: string;
    public idFieldName: string;
}

/** Class to get a recordset */
export class DatabaseRecordset extends DatabaseObject {
    protected attributes: QueryAttribute;

    /**
     * Creates the object, a connexion to Mysql is needed
     * @param {Connexion} - Connexion to mySql bdt105connexion object
     * @param {QueryAttribute} - Content of the sql query QueryAttribute object
     * @return {void}
     */
    constructor(connexion: Connexion, attributes: QueryAttribute = null) {
        super(connexion);
        this.attributes = attributes;
    }

    /**
     * Retrieves a sql phrase in order to use where, groupby,; orderby limit and offset sql paramaters
     * @return {string} - End of sql sentence
     */
    protected getSqlend() {
        let sqlEnd = (this.attributes.where ? " WHERE " + this.attributes.where : '') +
            (this.attributes.groupby ? " GROUP BY " + this.attributes.groupby : "") +
            (this.attributes.orderby ? " ORDER BY " + this.attributes.orderby : "") +
            (this.attributes.limit ? " LIMIT " + this.attributes.limit : "") +
            (this.attributes.offset ? " OFFSET " + this.attributes.offset : "");
        return sqlEnd;
    }

    /**
     * Retrieves a sql phrase with all paramters
     * @return {string} - Sql sentence
     */
    getSql() {
        return "SELECT " + this.attributes.select + " FROM " + this.attributes.from + (this.attributes.extra ? " " + this.attributes.extra : "") + this.getSqlend();
    }

    protected whereString(fieldValues: FieldValue[]): string {
        var ret = "";
        if (fieldValues) {
            for (var i = 0; i < fieldValues.length; i++) {
                ret += (ret != "" ? (fieldValues[i].logicOperator ? " " + fieldValues[i].logicOperator + " " : " AND ") : "") +
                    fieldValues[i].fieldName + (fieldValues[i].comparisonOperator ? fieldValues[i].comparisonOperator : "=") + "'" + fieldValues[i].value + "'";
            }
        }
        return ret;
    }

    /**
     * Queries the recordset an popultates the result
     * @param {Function} - Callback function to cal when work is done
     * @return {void}
     */
    load(callback: Function) {
        this.query((err: any, rows: any) => callback(err, rows), this.getSql());
    }

    /**
     * Queries the recordset an popultates the result
     * @param {Function} - Callback function to cal when work is done
     * @param {string} - Sql string
     * @return {void}
     */
    sql(callback: Function, sql: string) {
        this.query((err: any, rows: any) => callback(err, rows), sql);
    }
}

/** Class to get a table, allows crud functions */
export class DatabaseTable extends DatabaseRecordset {

    private callbackSearch(err: any, rows: any, formula: string, operator: string, q: string, callback: Function) {
        if (!err) {
            let searchString = "";
            for (var i = 0; i < rows.length; i++) {
                searchString += (searchString == "" ? "" : " " + operator + " ") + rows[i].Field + formula.replace("##", q);
            }
            if (callback) {
                this.attributes.where = searchString;
                this.query((err: any, rows: any) => callback(err, rows), this.getSql());
            }
        } else {
            if (callback) {
                callback(err, null);
            }
        }
    }

    /**
     * Load data from the id
     * @param {Function} - Callback function
     * @param {string} - Id to search for
     * @return {void}
     */
    loadFromId(callback: Function, id: string) {
        this.attributes.where = this.attributes.idFieldName + "='" + id + "'";
        this.query((err: any, rows: any) => callback(err, rows), this.getSql());
    }

    /**
     * Load data from a where condition
     * @param {Function} - Callback function
     * @param {string} - where condition
     * @return {void}
     */
    loadFromWhere(callback: Function, where: string) {
        this.attributes.where = where;
        this.query((err: any, rows: any) => callback(err, rows), this.getSql());
    }

    /**
     * Retreives data from a string search in any field of the table
     * @param {Function} callback - Callback function
     * @param {string} q - search term
     * @param {string} prefix - prefix of the condition for each field
     * @param {string} suffix - suffix of the condition for each field
     * @return {void}
     */
    search(callback: Function, q: string, formula: string, operator: string) {
        if (q) {
            this.query((err: any, rows: any) => this.callbackSearch(err, rows, formula, operator, q, callback), "SHOW FIELDS FROM " + this.attributes.from);
        } else {
            this.query((err: any, rows: any) => callback(err, rows), this.getSql());
        }
    }

    private insertString(body: any) {
        let values = "";
        let fields = "";
        for (var name in body) {
            fields += (values == "" ? "" : ", ") + name;
            values += (values == "" ? "" : ", ") + (body[name] === null ? "null" : "'" + body[name] + "'");
        }

        return "(" + fields + ") " + " VALUES (" + values + ")";
    }

    /**
     * Inserts a record inside the table
     * @param {Function} callback - Callback function
     * @param {any} body - object to insert, propertie must match table fields
     * @return {void}
     */
    insert(callback: Function, body: any) {
        let sql = "INSERT INTO " + this.attributes.from + this.insertString(body);
        this.query((err: any, rows: any) => callback(err, rows), sql);
    }

    /**
     * Deletes a record with a certain field equals a certain value
     * @param {Function} callback - Callback function
     * @param {any} fieldName - Name of the field
     * @param {any} value - Value of the field
     * @return {void}
     */
    deleteFromField(callback: Function, fieldName: string, value: string) {
        let where = fieldName + "='" + value + "'";
        this.deleteFromWhere((err: any, rows: any) => callback(err, rows), where);
    }

    /**
     * Deletes a record with a certain id
     * @param {Function} callback - Callback function
     * @param {string} value - Value of the id
     * @return {void}
     */
    deleteFromId(callback: Function, value: string) {
        let where = this.attributes.idFieldName + "='" + value + "'";
        this.deleteFromWhere((err: any, rows: any) => callback(err, rows), where);
    }

    /**
     * Deletes a record with a certain condition
     * @param {Function} callback - Callback function
     * @param {string} where - Condition
     * @return {void}
     */
    deleteFromWhere(callback: Function, where: string) {
        let sql = "DELETE FROM " + this.attributes.from + " WHERE " + where;
        this.query((err: any, rows: any) => callback(err, rows), sql);
    }

    private updateString(body: any) {
        let st = "";
        let update = false;

        for (var name in body) {
            st += (st == "" ? "" : ", ") + (body[name] === null ? name + "=null" : name + "='" + body[name] + "'");
        }

        return st;
    }

    /**
     * Updates a record
     * @param {Function} callback - Callback function
     * @param {any} body - Object to update
     * @param {string} where - Condition
     * @return {void}
     */
    update(callback: Function, body: any, where: string) {
        let sql = "UPDATE " + this.attributes.from + " SET " + this.updateString(body) + " WHERE " + where;
        this.query((err: any, rows: any) => callback(err, rows), sql);
    }

    private callbackUnique(callback: Function, body: any, id: string, err: any, rows: any) {
        if (rows && rows.length > 0) {
            let where = this.attributes.idFieldName + "='" + id + "'";
            this.update(callback, body, where);
        } else {
            this.insert(callback, body);
        }
    }

    /**
     * Saves a record. If id is found in the database, then the object is updated if not it is inserted
     * @param {Function} callback - Callback function
     * @param {any} body - Object to update
     * @param {string} id - Id of the record
     * @return {void}
     */
    save(callback: Function, body: any): void {
        let where = this.attributes.idFieldName + "='" + body[this.attributes.idFieldName] + "'";
        let sql = "SELECT * FROM " + this.attributes.from + " WHERE " + where;
        this.query((err: any, rows: any) => this.callbackUnique(callback, body, body[this.attributes.idFieldName], err, rows), sql);
    }

    private callbackFresh(err: any, rows: any, callback: Function) {
        let body: any = {};
        if (rows) {
            for (var i = 0; i < rows.length; i++) {
                body[rows[i].Field] = "";
            }
        }
        if (callback) {
            let arr = [];
            arr.push(body);
            callback(err, arr);
        }
    }

    /**
     * Retreives an empty record
     * @param {Function} callback - Callback function
     * @return {void}
     */
    fresh(callback: Function) {
        let sql = "SHOW FIELDS FROM " + this.attributes.from;
        this.query((err: any, rows: any) => this.callbackFresh(err, rows, callback), sql);
    }
}