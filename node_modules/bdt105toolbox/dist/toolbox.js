"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var Toolbox = /** @class */ (function () {
    function Toolbox() {
    }
    Toolbox.prototype.formatDate = function (date, format) {
        if (format === void 0) { format = "MM/DD/YYYY h:mm:ss"; }
        if (date) {
            var moment = require('moment');
            if (this.isValidDate(date)) {
                var d = moment(date);
                return d.format(format);
            }
        }
        return null;
        // if (date){
        //     var year = date.getFullYear(),
        //         month = date.getMonth() + 1, // months are zero indexed
        //         day = date.getDate(),
        //         hour = date.getHours(),
        //         minute = date.getMinutes(),
        //         second = date.getSeconds(),
        //         hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
        //         minuteFormatted = minute < 10 ? "0" + minute : minute,
        //         morning = hour < 12 ? "am" : "pm";
        //     return month + "/" + day + "/" + year + " " + hourFormatted + ":" + minute + ":" + second;
        // }else{
        //     return "";
        // }
    };
    Toolbox.prototype.dateToDbString = function (date) {
        return date.toISOString().substr(0, 19).replace('T', ' ');
        // return date.getFullYear() + "-" + 
        //     (date.getMonth().toString().length < 2 ? "0" : "") + date.getMonth() + "-" + 
        //     (date.getDay().toString().length < 2 ? "0" : "") + date.getDay() + " " + 
        //     (date.getHours().toString().length < 2 ? "0" : "") + date.getHours() + ":" + 
        //     (date.getMinutes().toString().length < 2 ? "0" : "") + date.getMinutes() + ":" + 
        //     (date.getSeconds().toString().length < 2 ? "0" : "") + date.getSeconds();
    };
    Toolbox.prototype.isoDateToDbString = function (date) {
        return date.substring(0, 19).replace("T", " ");
    };
    Toolbox.prototype.formatDateToLocal = function (date, showTime) {
        if (showTime === void 0) { showTime = false; }
        var moment = require('moment');
        if (this.isValidDate(date)) {
            var d = moment(date);
            return d.format('L') + (showTime ? " " + d.format('LTS') : "");
        }
        else {
            return "";
        }
    };
    Toolbox.prototype.CSVtoArray = function (text) {
        var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*(?:;\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*)*$/;
        var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^;'"\s\\]*(?:\s+[^;'"\s\\]+)*))\s*(?:;|$)/g;
        // Return NULL if input string is not well formed CSV string.
        if (!re_valid.test(text))
            return null;
        var a = []; // Initialize array to receive values.
        if (text) {
        }
        return a;
    };
    ;
    Toolbox.prototype.arrayToCSV = function (array, separator) {
        if (separator === void 0) { separator = ";"; }
        var ret = "";
        for (var i = 0; i < array.length; i++) {
            ret += (ret == "" ? "" : separator) + array[i];
        }
        return ret;
    };
    Toolbox.prototype.shuffleArray = function (array) {
        var counter = array.length;
        var arr = this.cloneObject(array);
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            var index = Math.floor(Math.random() * counter);
            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            var temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }
        return arr;
    };
    Toolbox.prototype.levenshtein = function (a, b) {
        var an = a ? a.length : 0;
        var bn = b ? b.length : 0;
        if (an === 0) {
            return bn;
        }
        if (bn === 0) {
            return an;
        }
        var matrix = new Array(bn + 1);
        for (var i = 0; i <= bn; ++i) {
            var row = matrix[i] = new Array(an + 1);
            row[0] = i;
        }
        var firstRow = matrix[0];
        for (var j = 1; j <= an; ++j) {
            firstRow[j] = j;
        }
        for (var i = 1; i <= bn; ++i) {
            for (var j = 1; j <= an; ++j) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1], // substitution
                    matrix[i][j - 1], // insertion
                    matrix[i - 1][j] // deletion
                    ) + 1;
                }
            }
        }
        return matrix[bn][an];
    };
    ;
    Toolbox.prototype.arrayOfObjectsToString = function (array, fieldName, value, separator, prefix, suffix) {
        var ret = "";
        if (array) {
            for (var i = 0; i < array.length; i++) {
                ret += (ret === "" ? "" : separator) + array[i][fieldName] + prefix + value + suffix;
            }
        }
        return ret;
    };
    ;
    Toolbox.prototype.urlParamsToObject = function (url) {
        var params = {};
        var arr1 = url.split("?");
        if (arr1.length > 1) {
            var arr2 = arr1[1].split("&");
            for (var i = 0; i < arr2.length; i++) {
                var arr3 = arr2[i].split("=");
                params[arr3[0]] = arr3[1];
            }
        }
        return params;
    };
    Toolbox.prototype.urlBase = function (url) {
        var arr1 = url.split("?");
        return arr1[0];
    };
    Toolbox.prototype.filterArrayOfObjects = function (array, keySearch, keyValue) {
        if (array && Array.isArray(array)) {
            return array.filter(function (row) { return row[keySearch] == keyValue; });
        }
        else {
            return array;
        }
    };
    Toolbox.prototype.findIndexArrayOfObjects = function (array, keySearch, keyValue) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][keySearch] == keyValue) {
                return i;
            }
        }
        return -1;
    };
    Toolbox.prototype.deleteObjectInList = function (array, keySearch, keyValue) {
        var index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 1);
        }
        return index;
    };
    Toolbox.prototype.replaceObjectInList = function (array, keySearch, keyValue, object) {
        var index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 1, object);
        }
        return index;
    };
    Toolbox.prototype.insertObjectInList = function (array, keySearch, keyValue, object) {
        var index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 0, object);
        }
        return index;
    };
    Toolbox.prototype.factorizeMasterSlave = function (data, masterIdFieldName, slaveIdFieldName, slaveName) {
        var rows = [];
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var cut = "idprescriptionline";
            var header = {};
            var line = {};
            var masterId = row[masterIdFieldName];
            var newMasterRow = {};
            var newSlaveRow = {};
            var slave = false;
            for (var prop in row) {
                if (prop == slaveIdFieldName) {
                    slave = true;
                }
                if (slave) {
                    newSlaveRow[prop] = row[prop];
                }
                else {
                    newMasterRow[prop] = row[prop];
                }
            }
            var index = this.findIndexArrayOfObjects(rows, masterIdFieldName, row[masterIdFieldName]);
            if (index >= 0) {
                if (!rows[index][slaveName]) {
                    rows[index][slaveName] = [];
                }
                rows[index][slaveName].push(newSlaveRow);
            }
            else {
                newMasterRow[slaveName] = [];
                newMasterRow[slaveName].push(newSlaveRow);
                rows.push(newMasterRow);
            }
        }
        return rows;
    };
    Toolbox.prototype.updateUrlParameter = function (url, parameter, value) {
        if (url && url.length > 0 && parameter && parameter.length > 0) {
            var newAdditionalURL = "";
            var tempArray = url.split("?");
            var baseURL = tempArray[0];
            var additionalURL = tempArray[1];
            var temp = "";
            if (additionalURL) {
                tempArray = additionalURL.split("&");
                for (var i = 0; i < tempArray.length; i++) {
                    if (tempArray[i].split('=')[0] != parameter) {
                        newAdditionalURL += temp + tempArray[i];
                        temp = "&";
                    }
                }
            }
            var rows_txt = temp + "" + parameter + "=" + value;
            return baseURL + "?" + newAdditionalURL + rows_txt;
        }
        else {
            return url;
        }
    };
    ;
    Toolbox.prototype.updateUrlParameters = function (url, parameters) {
        if (url && url.length > 0 && parameters && parameters.length > 0) {
            var tempArray = url.split("?");
            var tempUrl = tempArray[0];
            for (var i = 0; i < parameters.length; i++) {
                var param = parameters[i];
                tempUrl = this.updateUrlParameter(tempUrl, param.key, param.value);
            }
            return tempUrl;
        }
        else {
            return url;
        }
    };
    ;
    Toolbox.prototype.getUrlParams = function (url) {
        if (url && url.length > 0) {
            var tempArray = url.split("?");
            var additionalURL = tempArray[1];
            var ret = [];
            if (additionalURL) {
                var tempArray = additionalURL.split("&");
                for (var i = 0; i < tempArray.length; i++) {
                    var temp = tempArray[i].split("=");
                    var key = temp[0];
                    var value = temp[1];
                    ret.push({ "key": key, "value": value });
                }
            }
            return ret;
        }
        else {
            return undefined;
        }
    };
    ;
    Toolbox.prototype.deleteEmptyParams = function (url) {
        var rawUrl = this.urlBase(url);
        var params = this.getUrlParams(url);
        var paramUrl = "";
        if (params && params.length > 0) {
            for (var i = 0; i < params.length; i++) {
                paramUrl += (paramUrl != "" ? "&" : "") + (params[i].value && params[i].value != "" ? params[i].key + "=" + params[i].value : "");
            }
        }
        return rawUrl + "?" + paramUrl;
    };
    Toolbox.prototype.getKeyValue = function (obj) {
        var temp = [];
        if (typeof obj == "object") {
            for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
                var key = _a[_i];
                temp.push({ key: key, value: obj[key] });
            }
        }
        return temp;
    };
    Toolbox.prototype.deleteStringList = function (text, separator, textToDelete) {
        var ret = "";
        if (textToDelete && textToDelete.length > 0) {
            var arr = text.split(separator);
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] != textToDelete) {
                    ret += (ret == "" ? "" : separator) + arr[i];
                }
            }
        }
        return ret;
    };
    ;
    Toolbox.prototype.pushArray = function (source, destination) {
        if (source && destination) {
            for (var i = 0; i < source.length; i++) {
                destination.push(source[i]);
            }
        }
    };
    Toolbox.prototype.removeKeyFromArray = function (array, key) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].key == key) {
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    ;
    Toolbox.prototype.isValidDate = function (date) {
        if (Object.prototype.toString.call(date) === "[object Date]") {
            // it is a date
            if (isNaN(date.getTime())) {
                return false;
            }
            else {
                return true;
            }
        }
        else {
            if (typeof date == "string") {
                var timestamp = Date.parse(date);
                return isNaN(timestamp) == false;
            }
            else {
                return false;
            }
        }
    };
    Toolbox.prototype.dateDbToStringFr = function (date, separator) {
        if (separator === void 0) { separator = "-"; }
        if (date) {
            return date.substr(8, 2) + separator + date.substr(5, 2) + separator + date.substr(0, 4);
        }
        else {
            return null;
        }
    };
    Toolbox.prototype.dateWithoutTime = function (date) {
        return date.substr(0, 10);
    };
    Toolbox.prototype.diffDateInDays = function (date1, date2) {
        var diffMilliSeconds = date2.getTime() - date1.getTime();
        return diffMilliSeconds / 1000 / 60 / 60 / 24;
    };
    Toolbox.prototype.log = function (text, fileName, logToConsole) {
        if (fileName === void 0) { fileName = null; }
        if (logToConsole === void 0) { logToConsole = true; }
        var dateTime = this.dateToDbString(new Date());
        var txt = dateTime + " " + text + "\r\n";
        if (fileName) {
            var fs = require('fs');
            fs.appendFile(fileName, txt, function (err) {
                if (err) {
                    // Do nothing if can't log
                    // throw err;
                }
            });
        }
        if (logToConsole) {
            console.log(txt);
        }
    };
    Toolbox.prototype.postElastic = function (elasticUrl, index, type, data, id, extra, headers) {
        if (id === void 0) { id = null; }
        if (extra === void 0) { extra = null; }
        if (headers === void 0) { headers = null; }
        if (elasticUrl && index && type && data) {
            var rest = new index_1.Rest();
            var callback_1 = function (data, err) {
                if (err) {
                    throw new Error("No way to get to Elasticsearch! url: " + elasticUrl + ", index: " + index + ", type: " + type + ", id: " + id + ", data: " + JSON.stringify(data) + ". Err: " + JSON.stringify(err));
                }
            };
            rest.call(function (data, err) { return callback_1(data, err); }, (id ? "PUT" : "POST"), elasticUrl + "/" + index + "/" + type + "/" + (id ? id : "") + (extra ? extra : ""), data, "application/json", true, headers);
        }
    };
    Toolbox.prototype.loadFromJsonFile = function (fileName, encoding) {
        if (encoding === void 0) { encoding = null; }
        var fs = require('fs');
        var conf = fs.readFileSync(fileName, encoding);
        return JSON.parse(conf);
    };
    Toolbox.prototype.uniqueId = function () {
        var crypto = require("crypto");
        return crypto.randomBytes(16).toString("hex");
    };
    Toolbox.prototype.getUniqueId = function () {
        return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    };
    Toolbox.prototype.beautifyXml = function (text) {
        if (text && text != null) {
            var pd = require('pretty-data').pd;
            return pd.xml(text);
        }
        else {
            return "";
        }
    };
    ;
    Toolbox.prototype.beautifyJson = function (text) {
        if (text && text != null) {
            var pd = require('pretty-data').pd;
            return pd.json(text);
        }
        else {
            return "";
        }
    };
    ;
    Toolbox.prototype.writeToStorage = function (key, object, forever) {
        var str;
        if (typeof object != "string") {
            str = JSON.stringify(object);
        }
        else {
            str = object;
        }
        if (forever) {
            if (localStorage) {
                localStorage.setItem(key, str);
            }
        }
        else {
            if (sessionStorage) {
                sessionStorage.setItem(key, str);
            }
        }
    };
    ;
    Toolbox.prototype.parseJson = function (str) {
        var json;
        try {
            json = JSON.parse(str);
        }
        catch (e) {
            json = str;
        }
        return json;
    };
    Toolbox.prototype.isJson = function (str) {
        try {
            var json = JSON.parse(str);
            return true;
        }
        catch (e) {
            return false;
        }
    };
    Toolbox.prototype.readFromStorage = function (key, parseJson) {
        if (parseJson === void 0) { parseJson = true; }
        if (sessionStorage) {
            var res = sessionStorage.getItem(key);
            if (localStorage && res == null) {
                res = localStorage.getItem(key);
            }
            return (parseJson ? this.parseJson(res) : res);
        }
        else {
            return null;
        }
    };
    ;
    Toolbox.prototype.removeFromStorage = function (key) {
        if (localStorage) {
            localStorage.removeItem(key);
        }
        if (sessionStorage) {
            sessionStorage.removeItem(key);
        }
    };
    ;
    // https://www.npmjs.com/package/xml2js
    // https://github.com/Leonidas-from-XIV/node-xml2js
    Toolbox.prototype.xml2json = function (xml, callback) {
        if (callback === void 0) { callback = null; }
        if (xml) {
            var xml2js = require('xml2js');
            var async = callback !== null;
            var parser = new xml2js.Parser({ "mergeAttrs": true, "async": async });
            var ret = xml;
            parser.parseString(xml, function (err, result) {
                ret = result;
                if (callback) {
                    if (err) {
                        callback(xml);
                    }
                    else {
                        callback(result);
                    }
                }
            });
            return ret;
        }
        else {
            if (callback) {
                callback(null);
            }
            else {
                return xml;
            }
        }
    };
    Toolbox.prototype.fillDocWithContent = function (doc, content) {
        if (doc) {
            doc.open();
            doc.write(content);
            doc.close();
        }
    };
    Toolbox.prototype.sortArrayOfObjects = function (arr, sortProperty) {
        function compare(a, b) {
            if (a[sortProperty] < b[sortProperty])
                return -1;
            if (a[sortProperty] > b[sortProperty])
                return 1;
            return 0;
        }
        return arr.sort(compare);
    };
    // Retreives a node of an object.
    // If the object is an array with only one element wich is not an array nor an object then it's retreived
    Toolbox.prototype.searchElementSpecial = function (list, key, value) {
        for (var i = 0; i < list.length; i++) {
            if (Array.isArray(list[i][key]) && list[i][key].length == 1) {
                if (list[i][key][0] == value)
                    return list[i];
            }
            else {
                if (list[i][key] == value)
                    return list[i];
            }
        }
    };
    Toolbox.prototype.sES = function (list, key, value) {
        return (this.searchElementSpecial(list, key, value));
    };
    // get value of an object. 
    // If the object is an array with only one element wich is not an array nor an object then it's retreived
    Toolbox.prototype.getValueSpecial = function (object, fieldName, subFieldName) {
        if (subFieldName === void 0) { subFieldName = null; }
        if (object) {
            if (object[fieldName]) {
                if (Array.isArray(object[fieldName])) {
                    if (object[fieldName].length == 1) {
                        if (typeof object[fieldName][0] == "string") {
                            return object[fieldName][0];
                        }
                        else {
                            if (subFieldName) {
                                return this.getValueSpecial(object[fieldName][0], subFieldName);
                            }
                            else {
                                return object[fieldName][0];
                            }
                        }
                    }
                    else {
                        return object[fieldName];
                    }
                }
            }
        }
        return null;
    };
    // idem to getValueSpecial
    Toolbox.prototype.gVS = function (object, fieldName, subFieldName) {
        if (subFieldName === void 0) { subFieldName = null; }
        return this.getValueSpecial(object, fieldName, subFieldName);
    };
    Toolbox.prototype.replaceAll = function (text, search, replacement) {
        return text.replace(new RegExp(search, 'g'), replacement);
    };
    ;
    Toolbox.prototype.addMomentToDate = function (date, unit, value) {
        var moment = require('moment');
        var dd = moment(date);
        return dd.add(value, unit).toDate();
    };
    Toolbox.prototype.cloneObject = function (object) {
        return JSON.parse(JSON.stringify(object));
    };
    Toolbox.prototype.translateFromObject = function (jsonArray, text, language) {
        var rets = this.filterArrayOfObjects(jsonArray, "key", text);
        var ret = text;
        for (var i = 0; i < rets.length; i++) {
            var values = rets[i].values;
            for (var j = 0; j < values.length; j++) {
                if (values[j].language == language) {
                    ret = values[j].value;
                }
            }
        }
        return ret;
    };
    Toolbox.prototype.translateFromFile = function (text, language, fileName) {
        if (fileName === void 0) { fileName = null; }
        var ret = text;
        // var t = [{
        //     "key": "Bonjour",
        //     "values": [
        //         {
        //             "language": "EN",
        //             "value": "Hello"
        //         },
        //         {
        //             "language": "ES",
        //             "value": "Holà"
        //         }
        //     ]
        // }];
        if (fileName) {
            var data = this.loadFromJsonFile(fileName);
            if (data) {
                ret = this.translateFromObject(data, text, language);
            }
        }
        return ret;
    };
    Toolbox.prototype.jsonToCsv = function (data, title, showLabel, download, separator) {
        if (separator === void 0) { separator = ";"; }
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof data != 'object' ? JSON.parse(data) : data;
        var CSV = '';
        //Set Report title in first row or line
        CSV += title + '\r\n\n';
        //This condition will generate the Label/Header
        if (showLabel) {
            var row = "";
            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {
                //Now convert each value to string and comma-seprated
                row += index + separator;
            }
            row = row.slice(0, -1);
            //append Label row with line break
            CSV += row + '\r\n';
        }
        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";
            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '"' + separator;
            }
            row.slice(0, row.length - 1);
            //add a line break after each row
            CSV += row + '\r\n';
        }
        if (CSV == '') {
            alert("Invalid data");
            return;
        }
        if (!download) {
            return CSV;
        }
        else {
            //Generate a file name
            var fileName = "report_";
            //this will remove the blank-spaces from the title and replace it with an underscore
            fileName += title.replace(/ /g, "_");
            //Initialize file format you want csv or xls
            var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
            // Now the little tricky part.
            // you can use either>> window.open(uri);
            // but this will not work in some browsers
            // or you will not get the correct file extension    
            //this trick will generate a temp <a /> tag
            var link = document.createElement("a");
            link.href = uri;
            //set the visibility hidden so it will not effect on your web-layout
            //link.style = "visibility:hidden";
            link.download = fileName + ".csv";
            //this part will append the anchor tag and remove it after automatic click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    Toolbox.prototype.extractFromArray = function (array, key, value, keepIfNoKey) {
        var ret = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == undefined) {
                if (keepIfNoKey) {
                    ret.push(array[i]);
                }
            }
            else {
                if (array[i][key] == value) {
                    ret.push(array[i]);
                }
            }
        }
        return ret;
    };
    Toolbox.prototype.noAccent = function (text) {
        var accent = [
            /[\300-\306]/g, /[\340-\346]/g,
            /[\310-\313]/g, /[\350-\353]/g,
            /[\314-\317]/g, /[\354-\357]/g,
            /[\322-\330]/g, /[\362-\370]/g,
            /[\331-\334]/g, /[\371-\374]/g,
            /[\321]/g, /[\361]/g,
            /[\307]/g, /[\347]/g,
        ];
        var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];
        var str = text;
        for (var i = 0; i < accent.length; i++) {
            str = str.replace(accent[i], noaccent[i]);
        }
        return str;
    };
    Toolbox.prototype.compareString = function (text1, text2, caseSensitive, accentSensitive, exactMatching, include) {
        var t1 = text1;
        var t2 = text2;
        if (!accentSensitive) {
            t1 = this.noAccent(text1);
            t2 = this.noAccent(text2);
        }
        if (!caseSensitive) {
            t1 = this.noAccent(t1).toUpperCase();
            t2 = this.noAccent(t2).toUpperCase();
        }
        if (exactMatching) {
            return text1 == text2;
        }
        else {
            if (!include) {
                return t1 == t2;
            }
            else {
                return t1.indexOf(t2) != -1;
            }
        }
    };
    Toolbox.prototype.randomPassword = function () {
        return Math.random().toString(36).slice(-8);
    };
    return Toolbox;
}());
exports.Toolbox = Toolbox;
