# Database API #
This package aims to make your life easier when it comes to create an API based on MySql data.

You may be able to access very easily a database object with CRUD functionnalities.

You may also create API object in order to create an api server based on MySql database in a blink.

## Dependencies ##

- bdt105toolbox
- bdt105connexion

## How to use api objects? ##
3 main objects are available.

### TableApi ###
That object allows you to directecly create an api server to query you MySql database.

See full full example here: https://github.com/bdt105/modules/blob/master/databaseapi/src/server.ts

#### Methods ####
Constructor
- ApiTable(app: any, connexion: Connexion, requiresToken: boolean = false)

For connexion object see https://github.com/bdt105/modules/tree/master/connexion.

Creates all post api entry points: 
- assign(tableName: string, idFieldName: string = null, fields: any = null)

For each entry don't forget in your post body the "token" if you've set requiresToken to true. See https://github.com/bdt105/modules/tree/master/connexion for more details.

- POST /tableNames (with "s" at the end of the tble name)
Lists all elements of the table.
In the post use: ```where``` ```limit``` ```offset``` in the post body to select the records
- PUT /tableName
Saves the data only if idFieldName is set. If the record exixts then it's updated if not it is added.
In the post body use: ```object``` in the post body to set the data to save. 
- POST /tableName/fresh
Returns a full empty record of the table.
- DELETE /tableName
Deletes some records, use: ```where``` in the post body to select the records to delete. 

## How to use database objects? ##
3 main objects are exposed here as follows.

### DatabaseObject ###
This is the basic object.
- It allows to ```query``` the database 
- It can create ```where``` strings from an array of fields and values

Only availble for inherited objects

### DatabaseRecordset ###
Inheritates from ```DatabaseObject``` and provides access to any database recordset

~~~
import { DatabaseRecordset } from "bdt105databaseapi/dist"
import { Connexion } from "bdt105connexion/dist";

let mySqlConfiguration = new MySqlConfiguration("localhost", 3306, "admin", "admin_password"); 
// see https://github.com/bdt105/modules/tree/master/connexion

let conn = new Connexion(mySqlConfiguration);

let databaseObject = new DatabaseObject(conn);

let callback = function (err: any, rows: any){
    if (err){
        console.log("Oups error");
    }else{
        console.log("Everything is fine");
    }
}

let queryAttribute = new QueryAttribute();
queryAttribute.select = "*";
queryAttribute.from = "customers";
queryAttribute.where = "customer.email like '%gmail.com%'";

let databaseRecordset1 = new DatabaseRecordset(conn, queryAttribute);
databaseRecordset1.load(callback);

let databaseRecordset2 = new DatabaseRecordset(conn);
databaseRecordset2.sql(callback, "select * from customers where customer.email like '%gmail.com%'");
~~~

QueryAttribute allows to create the query
~~~
class QueryAttribute {
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
~~~

### DatabaseTable ###
Inheritates from ```DatabaseRecordset``` and provides access to crud functions + list of fields (fresh record)
~~~
import { DatabaseTable } from "bdt105databaseapi/dist"
import { Connexion } from "bdt105connexion/dist";

let mySqlConfiguration = new MySqlConfiguration("localhost", 3306, "admin", "admin_password"); 
// see https://github.com/bdt105/modules/tree/master/connexion

let conn = new Connexion(mySqlConfiguration);

let databaseObject = new DatabaseObject(conn);

let callback = function (err: any, rows: any){
    if (err){
        console.log("Oups error");
    }else{
        console.log("Everything is fine");
    }
}

let queryAttribute = new QueryAttribute();
queryAttribute.select = "*";
queryAttribute.from = "customers";
queryAttribute.where = "customer.email like '%gmail.com%'";
queryAttribute.idFieldName = "customerId";

let databaseTable = new DatabaseRecordset(conn, queryAttribute);
databaseTable.loadFromId(callback, 1234);
~~~

#### Methods ####
Load data from the id
- loadFromId(callback: Function, id: string)

Load data from a where condition
- loadFromWhere(callback: Function, where: string)

Retreives data from a string search in any field of the table
- search (callback: Function, q: string, prefix: string, suffix: string)

Inserts a record inside the table
- insert (callback: Function, body: any)

Deletes a record with a certain field equals a certain value
- deleteFromField (callback: Function, fieldName: string, value: string)

Deletes a record with a certain id
- deleteFromId (callback: Function, value: string)

Deletes a record with a certain condition
- deleteFromWhere (callback: Function, where: string)

Updates a record
- update (callback: Function, body: any, where: string)

Saves a record. If id is found in the database, then the object is updated if not it is inserted
- save (callback: Function, body: any)

Retreives an empty record
- fresh (callback: Function)