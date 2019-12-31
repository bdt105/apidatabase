"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("bdt105toolbox/dist");
/** Class representing a field value. */
class FieldValue {
}
exports.FieldValue = FieldValue;
/** Basic database class */
class DatabaseObject {
    constructor(connexion) {
        this.logToConsole = false;
        this.connexion = connexion;
        this.toolbox = new dist_1.Toolbox();
    }
    /**
     * Queries the database and then calls the callback function sending retrieved data
     * Calls
     * @param {Function} callback - Callback function to be called when query is done
     * @param {string} sql - Sql query
     * @return {void}
     */
    queryOld(callback, sql) {
        if (this.connexion) {
            if (this.logToConsole) {
                console.log("Start of executing: \n" + sql);
            }
            this.connexion.querySql((err, rows) => {
                console.log("End of executing: \n" + sql);
                callback(err, rows);
            }, sql);
        }
    }
    query(callback, sql) {
        if (this.logToConsole) {
            let time = this.toolbox.dateToDbString(new Date());
            console.log(time + " - Start of executing: \n" + sql + "\n");
        }
        if (this.connexion) {
            this.connexion.queryPool((err, rows) => {
                if (this.logToConsole) {
                    let time = this.toolbox.dateToDbString(new Date());
                    console.log(time + " - End of executing: \n" + sql + "\n");
                }
                callback(err, rows);
            }, sql);
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
    getWhereString(fieldValues, defaultLogicOperator = "AND", defaultComparisonOperator = "=") {
        var ret = "";
        if (fieldValues) {
            for (var i = 0; i < fieldValues.length; i++) {
                ret += (ret != "" ? (fieldValues[i].logicOperator ? " " + fieldValues[i].logicOperator + " " : " " + defaultLogicOperator + " ") : "") +
                    fieldValues[i].fieldName + (fieldValues[i].comparisonOperator ? fieldValues[i].comparisonOperator : "=") + "'" + fieldValues[i].value + "'";
            }
        }
        return ret;
    }
    fieldsToString(tableName, fields, alias = true) {
        var ret = "";
        for (var i = 0; i < fields.length; i++) {
            ret += (ret == "" ? "" : ", ") + (alias ? tableName + "." : "") + fields[i] + (alias ? " " + tableName + "_" + fields[i] : "");
        }
        return ret;
    }
}
exports.DatabaseObject = DatabaseObject;
/** Query information class */
class QueryAttribute {
}
exports.QueryAttribute = QueryAttribute;
/** Class to get a recordset */
class DatabaseRecordset extends DatabaseObject {
    /**
     * Creates the object, a connexion to Mysql is needed
     * @param {Connexion} - Connexion to mySql bdt105connexion object
     * @param {QueryAttribute} - Content of the sql query QueryAttribute object
     * @return {void}
     */
    constructor(connexion, attributes = null) {
        super(connexion);
        this.attributes = attributes;
    }
    /**
     * Retrieves a sql phrase in order to use where, groupby,; orderby limit and offset sql paramaters
     * @return {string} - End of sql sentence
     */
    getSqlend() {
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
    whereString(fieldValues) {
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
    load(callback) {
        this.query((err, rows) => callback(err, rows), this.getSql());
    }
    /**
     * Queries the recordset an popultates the result
     * @param {Function} - Callback function to cal when work is done
     * @param {string} - Sql string
     * @return {void}
     */
    sql(callback, sql) {
        this.query((err, rows) => callback(err, rows), sql);
    }
}
exports.DatabaseRecordset = DatabaseRecordset;
/** Class to get a table, allows crud functions */
class DatabaseTable extends DatabaseRecordset {
    callbackSearch(err, rows, formula, operator, q, callback) {
        if (!err) {
            let searchString = "";
            for (var i = 0; i < rows.length; i++) {
                searchString += (searchString == "" ? "" : " " + operator + " ") + rows[i].Field + formula.replace("##", q);
            }
            if (callback) {
                this.attributes.where = this.attributes.where ? this.attributes.where + " AND (" + searchString + ")" : searchString;
                this.query((err, rows) => callback(err, rows), this.getSql());
            }
        }
        else {
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
    load(callback) {
        this.query((err, rows) => callback(err, rows), this.getSql());
    }
    /**
     * Load data from the id
     * @param {Function} - Callback function
     * @param {string} - Id to search for
     * @return {void}
     */
    loadFromId(callback, id) {
        this.attributes.where = this.attributes.idFieldName + "='" + id + "'";
        this.query((err, rows) => callback(err, rows), this.getSql());
    }
    /**
     * Load data from a where condition
     * @param {Function} - Callback function
     * @param {string} - where condition
     * @return {void}
     */
    loadFromWhere(callback, where) {
        this.attributes.where = where;
        this.query((err, rows) => callback(err, rows), this.getSql());
    }
    /**
     * Retreives data from a string search in any field of the table
     * @param {Function} callback - Callback function
     * @param {string} q - search term
     * @param {string} prefix - prefix of the condition for each field
     * @param {string} suffix - suffix of the condition for each field
     * @return {void}
     */
    search(callback, q, formula, operator) {
        if (q) {
            this.query((err, rows) => this.callbackSearch(err, rows, formula, operator, q, callback), "SHOW FIELDS FROM " + this.attributes.from);
        }
        else {
            this.query((err, rows) => callback(err, rows), this.getSql());
        }
    }
    insertString(body) {
        let values = "";
        let fields = "";
        for (var name in body) {
            fields += (values == "" ? "" : ", ") + name;
            values += (values == "" ? "" : ", ") + (body[name] === null ? "null" : "'" + this.toolbox.addSlashes(body[name]) + "'");
        }
        return "(" + fields + ") " + " VALUES (" + values + ")";
    }
    /**
     * Inserts a record inside the table
     * @param {Function} callback - Callback function
     * @param {any} body - object to insert, propertie must match table fields
     * @return {void}
     */
    insert(callback, body) {
        let sql = "INSERT INTO " + this.attributes.from + this.insertString(body);
        this.query((err, rows) => callback(err, rows), sql);
    }
    /**
     * Deletes a record with a certain field equals a certain value
     * @param {Function} callback - Callback function
     * @param {any} fieldName - Name of the field
     * @param {any} value - Value of the field
     * @return {void}
     */
    deleteFromField(callback, fieldName, value) {
        let where = fieldName + "='" + value + "'";
        this.deleteFromWhere((err, rows) => callback(err, rows), where);
    }
    /**
     * Deletes a record with a certain id
     * @param {Function} callback - Callback function
     * @param {string} value - Value of the id
     * @return {void}
     */
    deleteFromId(callback, value) {
        let where = this.attributes.idFieldName + "='" + value + "'";
        this.deleteFromWhere((err, rows) => callback(err, rows), where);
    }
    /**
     * Deletes a record with a certain condition
     * @param {Function} callback - Callback function
     * @param {string} where - Condition
     * @return {void}
     */
    deleteFromWhere(callback, where) {
        let sql = "DELETE FROM " + this.attributes.from + " WHERE " + where;
        this.query((err, rows) => callback(err, rows), sql);
    }
    updateString(body) {
        let st = "";
        for (var name in body) {
            st += (st == "" ? "" : ", ") + (body[name] === null ? "`" + name + "`=null" : "`" + name + "`='" + this.toolbox.addSlashes(body[name]) + "'");
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
    update(callback, body, where) {
        let sql = "UPDATE " + this.attributes.from + " SET " + this.updateString(body) + " WHERE " + where;
        this.query((err, rows) => callback(err, rows), sql);
    }
    callbackUnique(callback, body, id, err, rows) {
        if (rows && rows.length > 0) {
            let where = this.attributes.idFieldName + "='" + id + "'";
            this.update(callback, body, where);
        }
        else {
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
    save(callback, body) {
        let where = this.attributes.idFieldName + "='" + body[this.attributes.idFieldName] + "'";
        let sql = "SELECT * FROM " + this.attributes.from + " WHERE " + where;
        this.query((err, rows) => this.callbackUnique(callback, body, body[this.attributes.idFieldName], err, rows), sql);
    }
    callbackFresh(err, rows, callback) {
        let body = {};
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
    fresh(callback) {
        let sql = "SHOW FIELDS FROM " + this.attributes.from;
        this.query((err, rows) => this.callbackFresh(err, rows, callback), sql);
    }
    /**
     * Retreives an empty record
     * @param {Function} callback - Callback function
     * @return {void}
     */
    fields(callback) {
        let sql = "SHOW FIELDS FROM " + this.attributes.from;
        this.query((err, rows) => callback(err, rows), sql);
    }
}
exports.DatabaseTable = DatabaseTable;
//# sourceMappingURL=databaseObject.js.map