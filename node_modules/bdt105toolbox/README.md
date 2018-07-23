# Toolbox - Rest #
This package gives functions to use and reuse anywhere. It offers simplied Rest functionnalitoes as well

## Dependencies ##
- pretty-data
- request
- xml2js
- moment

## How to install? ##
~~~
npm install --save bdt105toolbox
~~~

# Rest #
Rest functions

## How to use? ##
Create an object Toolbox 
~~~
import { Rest } from "bdt105toolbox/dist";

let logFile = "logFile.log";
let logToConsole = true;

let rest = new Rest(logFile, logToconsole);
~~~

logFile and logToConsole are optional. They trace each call.

## Functions ##

### call (callback: Function, method: string, url: string, body: any = null, contentType = "application/json", getRaw = false) ###
Call a http or https url and calls callback function when done. getRaw retreives untransformed result of the call.

# Toolbox #
Series of usefull functions.

## How to use? ##
Create an object Toolbox 
~~~
import { Toolbox } from "bdt105toolbox/dist";

let toolbox = new Toolbox();
~~~

## Functions ##

### dateToDbString(date: Date) ###
Formats a date usable by MySql, format: "yyyy-MM-dd HH:mm:ss"

### isoDateToDbString(date: Date) ###
Transforms an iso date into MySql format: "yyyy-MM-ddTHH:mm:ss" => "yyyy-MM-dd HH:mm:ss"

### CSVtoArray (text: string) : string[] ###
Transforms into an array a csv line. Separator is ";"

### arrayToCSV(array: string[], separator = ";"): string ###
Transforms into a csv string an array.

### levenshtein (a: string, b: string): number ###
Calculate Levenshtein distance between two strings.

### arrayOfObjectsToString (array: any, fieldName: string, value: string, separator: string, prefix: string, suffix: string) ###
Transforms an array of objects into a string. Mainly used to create sql where strings.
~~~
arrayOfObjectsToString([
    {"fieldName": "firstName"}, 
    {"fieldName": "lastName"}, 
    {"fieldName": "email"}], "fieldName", "value", "AND", "like '%", "%'")
~~~
becomes
~~~
firstName like '%value%' AND lastName like '%value%' AND email like '%value%'
~~~

### urlParamsToObject(url: string) ###
Transforms the params of an url into an object.
~~~
http://www.url.com?param1=1&param2=2&param3=3
~~~
becomes
~~~
{"param1": 1, "param2": 2, "param3": 3}
~~~

### urlBase(url: string) ###
Gets the base of an url.
~~~
http://www.url.com?param1=1&param2=2&param3=3
~~~
becomes
~~~
http://www.url.com
~~~

### filterArrayOfObjects(array: any[], keySearch: string, keyValue: string) ###
Retreives the entries of an array of objects matching the filter keySearch == keyValue.

### findIndexArrayOfObjects(array: any[], keySearch: string, keyValue: string) ###
Retreives the index of an array of objects matching the filter keySearch == keyValue. First value found is retreived.

### factorizeMasterSlave(data: any, masterIdFieldName: string, slaveIdFieldName: string, slaveName: string) ###
For an array of flat objects will create a master slave array of objects.
~~~
factorizeMasterSlave(
[
    {"customerId": 1, "customerName": "customerName1", "orderId": 11, "orderDescription": "order11"}, 
    {"customerId": 1, "customerName": "customerName1", "orderId": 12, "orderDescription": "order12"}, 
    {"customerId": 1, "customerName": "customerName1", "orderId": 13, "orderDescription": "order13"},
    {"customerId": 2, "customerName": "customerName2", "orderId": 21, "orderDescription": "order21"}, 
    {"customerId": 2, "customerName": "customerName2", "orderId": 22, "orderDescription": "order22"}, 
    {"customerId": 2, "customerName": "customerName2", "orderId": 23, "orderDescription": "order23"}
], "customerId", "orderId", "orders");
~~~
becomes
~~~
[
    {"customerId": 1, "customerName": "customerName1", 
        "orders": [
            {"orderId": 11, "orderDescription": "order11"}
            {"orderId": 12, "orderDescription": "order12"}
            {"orderId": 13, "orderDescription": "order13"}
        ]
    },
    {"customerId": 2, "customerName": "customerName2", 
        "orders": [
            {"orderId": 21, "orderDescription": "order21"}
            {"orderId": 22, "orderDescription": "order22"}
            {"orderId": 23, "orderDescription": "order23"}
        ]
    }
]
~~~

### updateUrlParameter (url: string, parameter: string, value: string) ###
Updates a parameter within a an url.

### updateUrlParameters (url: string, parameters: any[]) ###
Updates parameters within a an url. Parameters must an array of object of type {"key": "", "value": ""}

### getUrlParams (url: string) ###
Retreives a array of object of type {"key": "", "value": ""} from an url

### deleteEmptyParams(url: string) ###
Deletes empty paramters from an url

### deleteStringList (text: string, separator: string, textToDelete: string) ###
Delete elements in a csv like string.

### pushArray(source: any[], destination: any[]) ###
Concats source into destination.

### removeKeyFromArray (array: any[], key: string) ###
Remove a records from an array according to a key. Array must contain objects with at least a "key" field.

### isValidDate(date: string) ###
Checks if a date is valid.

### dateDbToStringFr(date: string, separator = "-") ###
Transforms a date into french date format ("dd-MM-yyyy HH:mm:ss")

### dateWithoutTime(date: string) ###
Removes time information from a date

### diffDateInDays(date1: Date, date2: Date) ###
Gets the difference in days between two dates

### log (text: string, fileName: string = null, logToConsole: boolean = true) ###
Logs information into a file. All lines are prefixed by timestamp of the append in the log file.

### postElastic (elasticUrl: string, index: string, type: string, data: any, id: string = null, extra: string = null) ###
Adds data into an elasticsearch server

### loadFromJsonFile(fileName: string, encoding: string = null) ###
Retreive an object of the json contained into a file

### uniqueId() ###
Retreives a unique id base on random 16bit from library "crypto"

### beautifyXml (text: string) ###
Retreives beautifull string containg xml. Based on pretty-data library

### beautifyJson (text: string) ###
Retreives beautifull string containg json. Based on pretty-data library

### writeToStorage (key: string, object: any, forever: boolean) ###
Writes to local browser storage. If forever then localStorage is used if not seesionStorage is used

### parseJson(str: string) ###
Retreives an object from a Json string

### readFromStorage (key: string) ###
Gets object from sessionStorage, if not found from localStorage

### removeFromStorage (key: string) ###
REmoves object from sessionStorage and localStorage

### xml2json(xml: string, callback: Function = null) ###
Transforms a xml string into Json object. Based on https://github.com/Leonidas-from-XIV/node-xml2js

### fillDocWithContent(doc: any, content: string) ###
Fills DOM document with string