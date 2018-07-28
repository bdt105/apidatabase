import { Rest } from './index';

declare function escape(s: string): string;

export class Toolbox {

    formatDate(date: Date, format: string = "MM/DD/YYYY h:mm:ss") {
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
    }

    dateToDbString(date: Date) {
        return date.toISOString().substr(0, 19).replace('T', ' ')
        // return date.getFullYear() + "-" + 
        //     (date.getMonth().toString().length < 2 ? "0" : "") + date.getMonth() + "-" + 
        //     (date.getDay().toString().length < 2 ? "0" : "") + date.getDay() + " " + 
        //     (date.getHours().toString().length < 2 ? "0" : "") + date.getHours() + ":" + 
        //     (date.getMinutes().toString().length < 2 ? "0" : "") + date.getMinutes() + ":" + 
        //     (date.getSeconds().toString().length < 2 ? "0" : "") + date.getSeconds();
    }

    isoDateToDbString(date: string) {
        return date.substring(0, 19).replace("T", " ");
    }

    formatDateToLocal(date: Date, showTime = false) {
        var moment = require('moment');
        if (this.isValidDate(date)) {
            var d = moment(date);
            return d.format('L') + (showTime ? " " + d.format('LTS') : "");
        } else {
            return "";
        }
    }

    CSVtoArray(text: string): string[] {
        var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*(?:;\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^;'"\s\\]*(?:\s+[^;'"\s\\]+)*)\s*)*$/;
        var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^;'"\s\\]*(?:\s+[^;'"\s\\]+)*))\s*(?:;|$)/g;

        // Return NULL if input string is not well formed CSV string.
        if (!re_valid.test(text)) return null;
        var a: string[] = [];                     // Initialize array to receive values.
        if (text) {
        }
        return a;
    };

    arrayToCSV(array: string[], separator = ";"): string {
        var ret = "";
        for (var i = 0; i < array.length; i++) {
            ret += (ret == "" ? "" : separator) + array[i];
        }
        return ret;
    }

    shuffleArray(array: any[]) {
        let counter = array.length;
        let arr = this.cloneObject(array);

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = temp;
        }

        return arr;
    }

    levenshtein(a: string, b: string): number {
        const an = a ? a.length : 0;
        const bn = b ? b.length : 0;
        if (an === 0) {
            return bn;
        }
        if (bn === 0) {
            return an;
        }
        const matrix = new Array<number[]>(bn + 1);
        for (let i = 0; i <= bn; ++i) {
            let row = matrix[i] = new Array<number>(an + 1);
            row[0] = i;
        }
        const firstRow = matrix[0];
        for (let j = 1; j <= an; ++j) {
            firstRow[j] = j;
        }
        for (let i = 1; i <= bn; ++i) {
            for (let j = 1; j <= an; ++j) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1], // substitution
                        matrix[i][j - 1], // insertion
                        matrix[i - 1][j] // deletion
                    ) + 1;
                }
            }
        }
        return matrix[bn][an];
    };

    arrayOfObjectsToString(array: any, fieldName: string, value: string, separator: string, prefix: string, suffix: string) {
        var ret = "";
        if (array) {
            for (var i = 0; i < array.length; i++) {
                ret += (ret === "" ? "" : separator) + array[i][fieldName] + prefix + value + suffix;
            }
        }
        return ret;
    };

    urlParamsToObject(url: string) {
        var params: any = {}
        var arr1 = url.split("?");
        if (arr1.length > 1) {
            var arr2 = arr1[1].split("&");
            for (var i = 0; i < arr2.length; i++) {
                var arr3 = arr2[i].split("=");
                params[arr3[0]] = arr3[1];
            }
        }
        return params;
    }

    urlBase(url: string) {
        var arr1 = url.split("?");
        return arr1[0];
    }

    filterArrayOfObjects(array: any[], keySearch: string, keyValue: any,
        caseSensitive: boolean = false, accentSensitive: boolean = false, exactMatching: boolean = true, include: boolean = false) {
        if (array && Array.isArray(array)) {
            return array.filter((row) => {
                if (typeof keyValue === 'string') {
                    return this.compareString(row[keySearch], keyValue, caseSensitive, accentSensitive, exactMatching, include);
                } else {
                    return row[keySearch] == keyValue;
                }
            });
        } else {
            return array;
        }
    }

    public filterArrayOfObjectsAllFields(array: any[], searchTerm: string,
        caseSensitive: boolean = false, accentSensitive: boolean = false, exactMatching: boolean = true, include: boolean = true) {
        if (array && Array.isArray(array)) {
            return array.filter((row) => {
                searchTerm = searchTerm + "";
                let temp = JSON.stringify(row);
                if (exactMatching) {
                    return temp.indexOf(':"' + searchTerm + '"') >= 0;
                } else {
                    temp = this.prepareStrinForSearch(temp, caseSensitive, accentSensitive);
                    searchTerm = this.prepareStrinForSearch(searchTerm, caseSensitive, accentSensitive);
                    if (include) {
                        return temp.indexOf(searchTerm) >= 0;
                    } else {
                        return temp.indexOf(':"' + searchTerm + '"') >= 0;
                    }
                }
            });
        } else {
            return array;
        }
    }

    findIndexArrayOfObjects(array: any[], keySearch: string, keyValue: string) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][keySearch] == keyValue) {
                return i;
            }
        }
        return -1;
    }

    deleteObjectInList(array: any[], keySearch: string, keyValue: string) {
        let index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 1);
        }
        return index;
    }

    replaceObjectInList(array: any[], keySearch: string, keyValue: string, object: any) {
        let index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 1, object);
        }
        return index;
    }

    insertObjectInList(array: any[], keySearch: string, keyValue: string, object: any) {
        let index = this.findIndexArrayOfObjects(array, keySearch, keyValue);
        if (index > 0) {
            array.splice(index, 0, object);
        }
        return index;
    }

    factorizeMasterSlave(data: any, masterIdFieldName: string, slaveIdFieldName: string, slaveName: string) {
        let rows = [];
        for (var i = 0; i < data.length; i++) {
            let row = data[i];
            let cut = "idprescriptionline";
            let header: any = {};
            let line: any = {};
            let masterId = row[masterIdFieldName];
            let newMasterRow: any = {};
            let newSlaveRow: any = {};
            let slave = false;
            for (var prop in row) {
                if (prop == slaveIdFieldName) {
                    slave = true;
                }
                if (slave) {
                    newSlaveRow[prop] = row[prop];
                } else {
                    newMasterRow[prop] = row[prop];
                }
            }

            let index = this.findIndexArrayOfObjects(rows, masterIdFieldName, row[masterIdFieldName]);
            if (index >= 0) {
                if (!rows[index][slaveName]) {
                    rows[index][slaveName] = [];
                }
                rows[index][slaveName].push(newSlaveRow);
            } else {
                newMasterRow[slaveName] = [];
                newMasterRow[slaveName].push(newSlaveRow);
                rows.push(newMasterRow);
            }
        }
        return rows;
    }

    updateUrlParameter(url: string, parameter: string, value: string) {
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
        } else {
            return url;
        }
    };

    updateUrlParameters(url: string, parameters: any[]) {
        if (url && url.length > 0 && parameters && parameters.length > 0) {
            var tempArray = url.split("?");
            var tempUrl = tempArray[0];
            for (var i = 0; i < parameters.length; i++) {
                var param = parameters[i];
                tempUrl = this.updateUrlParameter(tempUrl, param.key, param.value);
            }
            return tempUrl;
        } else {
            return url;
        }
    };

    getUrlParams(url: string) {
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
        } else {
            return undefined;
        }
    };

    deleteEmptyParams(url: string) {
        var rawUrl = this.urlBase(url);
        var params = this.getUrlParams(url);
        var paramUrl = "";
        if (params && params.length > 0) {
            for (var i = 0; i < params.length; i++) {
                paramUrl += (paramUrl != "" ? "&" : "") + (params[i].value && params[i].value != "" ? params[i].key + "=" + params[i].value : "");
            }
        }
        return rawUrl + "?" + paramUrl;
    }

    getKeyValue(obj: any) {
        var temp: any[] = [];

        if (typeof obj == "object") {
            for (var key of Object.keys(obj)) {
                temp.push({ key: key, value: obj[key] });
            }
        }
        return temp;
    }

    deleteStringList(text: string, separator: string, textToDelete: string) {
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

    pushArray(source: any[], destination: any[]) {
        if (source && destination) {
            for (var i = 0; i < source.length; i++) {
                destination.push(source[i]);
            }
        }
    }

    removeKeyFromArray(array: any[], key: string) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].key == key) {
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    isValidDate(date: any) {
        if (Object.prototype.toString.call(date) === "[object Date]") {
            // it is a date
            if (isNaN(date.getTime())) {
                return false;
            } else {
                return true;
            }
        } else {
            if (typeof date == "string") {
                var timestamp = Date.parse(date)
                return isNaN(timestamp) == false;
            } else {
                return false;
            }
        }
    }

    dateDbToStringFr(date: string, separator = "-") {
        if (date) {
            return date.substr(8, 2) + separator + date.substr(5, 2) + separator + date.substr(0, 4);
        } else {
            return null;
        }
    }

    // 2018-02-02 14:50:35
    dateStringDbToDate(date: string) {
        if (date) {
            return new Date(parseInt(date.substr(0, 4)),
                parseInt(date.substr(5, 2)), parseInt(date.substr(8, 2)), parseInt(date.substr(11, 2)),
                parseInt(date.substr(14, 2)), parseInt(date.substr(17, 2)));
        } else {
            return null;
        }
    }

    dateWithoutTime(date: string) {
        return date.substr(0, 10);
    }

    diffDateInDays(date1: Date, date2: Date) {
        let diffMilliSeconds = date2.getTime() - date1.getTime();
        return diffMilliSeconds / 1000 / 60 / 60 / 24;
    }

    log(text: string, fileName: string = null, logToConsole: boolean = true) {
        var dateTime = this.dateToDbString(new Date());
        let txt = dateTime + " " + text + "\r\n";
        if (fileName) {
            var fs = require('fs');
            fs.appendFile(fileName, txt, (err: any) => {
                if (err) {
                    // Do nothing if can't log
                    // throw err;
                }
            });
        }
        if (logToConsole) {
            console.log(txt);
        }
    }

    postElastic(elasticUrl: string, index: string, type: string, data: any, id: string = null, extra: string = null, headers: any = null) {
        if (elasticUrl && index && type && data) {
            let rest = new Rest();
            let callback = function (data: any, err: any) {
                if (err) {
                    throw new Error("No way to get to Elasticsearch! url: " + elasticUrl + ", index: " + index + ", type: " + type + ", id: " + id + ", data: " + JSON.stringify(data) + ". Err: " + JSON.stringify(err));
                }
            }

            rest.call(
                (data: any, err: any) => callback(data, err),
                (id ? "PUT" : "POST"),
                elasticUrl + "/" + index + "/" + type + "/" + (id ? id : "") + (extra ? extra : ""),
                data, "application/json", true, headers);
        }
    }

    loadFromJsonFile(fileName: string, encoding: string = null) {
        var fs = require('fs');
        if (fs.existsSync(fileName)) {
            var conf = fs.readFileSync(fileName, encoding);
            return JSON.parse(conf);
        } else {
            return null;
        }
    }

    uniqueId() {
        var crypto = require("crypto");
        return crypto.randomBytes(16).toString("hex");
    }

    getUniqueId() {
        return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    }

    beautifyXml(text: string) {
        if (text && text != null) {
            var pd = require('pretty-data').pd;
            return pd.xml(text);
        } else {
            return "";
        }
    };

    beautifyJson(text: string) {
        if (text && text != null) {
            var pd = require('pretty-data').pd;
            return pd.json(text);
        } else {
            return "";
        }
    };

    writeToStorage(key: string, object: any, forever: boolean) {
        var str: string;
        if (typeof object != "string") {
            str = JSON.stringify(object);
        } else {
            str = object;
        }
        if (forever) {
            if (localStorage) {
                localStorage.setItem(key, str);
            }
        } else {
            if (sessionStorage) {
                sessionStorage.setItem(key, str);
            }
        }
    };

    parseJson(str: string) {
        var json: any;
        try {
            json = JSON.parse(str);
        } catch (e) {
            json = str;
        }
        return json;
    }

    isJson(str: string) {
        try {
            var json = JSON.parse(str);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    readFromStorage(key: string, parseJson: boolean = true) {
        if (sessionStorage) {
            var res = sessionStorage.getItem(key);
            if (localStorage && res == null) {
                res = localStorage.getItem(key);
            }
            return (parseJson ? this.parseJson(res) : res);
        } else {
            return null;
        }
    };

    removeFromStorage(key: string) {
        if (localStorage) {
            localStorage.removeItem(key);
        }
        if (sessionStorage) {
            sessionStorage.removeItem(key);
        }
    };

    // https://www.npmjs.com/package/xml2js
    // https://github.com/Leonidas-from-XIV/node-xml2js
    xml2json(xml: string, callback: Function = null) {
        if (xml) {
            var xml2js = require('xml2js');
            var async = callback !== null;
            var parser = new xml2js.Parser({ "mergeAttrs": true, "async": async });
            var ret: any = xml;
            parser.parseString(xml, (err: any, result: any) => {
                ret = result;
                if (callback) {
                    if (err) {
                        callback(xml);
                    } else {
                        callback(result);
                    }
                }
            });
            return ret;
        } else {
            if (callback) {
                callback(null);
            } else {
                return xml;
            }
        }
    }

    fillDocWithContent(doc: any, content: string) {
        if (doc) {
            doc.open();
            doc.write(content);
            doc.close();
        }
    }

    sortArrayOfObjects(arr: any[], sortProperty: string) {
        function compare(a, b) {
            if (a[sortProperty] < b[sortProperty])
                return -1;
            if (a[sortProperty] > b[sortProperty])
                return 1;
            return 0;
        }

        return arr.sort(compare);
    }

    // Retreives a node of an object.
    // If the object is an array with only one element wich is not an array nor an object then it's retreived
    searchElementSpecial(list: any[], key: string, value: string) {
        for (var i = 0; i < list.length; i++) {
            if (Array.isArray(list[i][key]) && list[i][key].length == 1) {
                if (list[i][key][0] == value)
                    return list[i];
            } else {
                if (list[i][key] == value)
                    return list[i];
            }
        }
    }

    sES(list: any[], key: string, value: string) {
        return (this.searchElementSpecial(list, key, value));
    }

    // get value of an object. 
    // If the object is an array with only one element wich is not an array nor an object then it's retreived
    getValueSpecial(object: any, fieldName: string, subFieldName: string = null) {
        if (object) {
            if (object[fieldName]) {
                if (Array.isArray(object[fieldName])) {
                    if (object[fieldName].length == 1) {
                        if (typeof object[fieldName][0] == "string") {
                            return object[fieldName][0];
                        } else {
                            if (subFieldName) {
                                return this.getValueSpecial(object[fieldName][0], subFieldName);
                            } else {
                                return object[fieldName][0]
                            }
                        }
                    } else {
                        return object[fieldName];
                    }
                }
            }
        }
        return null;
    }

    // idem to getValueSpecial
    gVS(object: any, fieldName: string, subFieldName: string = null) {
        return this.getValueSpecial(object, fieldName, subFieldName);
    }

    replaceAll(text: string, search: string, replacement: string) {
        return text.replace(new RegExp(search, 'g'), replacement);
    };

    addMomentToDate(date: Date, unit: string, value: number) {
        var moment = require('moment');
        var dd = moment(date);
        return dd.add(value, unit).toDate();
    }

    cloneObject(object: any) {
        return JSON.parse(JSON.stringify(object));
    }

    translateFromObject(jsonArray: any, text: string, language: string) {
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
    }

    translateFromFile(text: string, language: string, fileName: string = null) {
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
    }

    jsonToCsv(data: any, title: string, showLabel: boolean, download: boolean, separator: string = ";") {
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
        } else {
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
    }

    extractFromArray(array: any, key: string, value: any, keepIfNoKey: boolean) {
        let ret = [];
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == undefined) {
                if (keepIfNoKey) {
                    ret.push(array[i]);
                }
            } else {
                if (array[i][key] == value) {
                    ret.push(array[i]);
                }
            }
        }
        return ret;
    }

    noAccent(text: string) {
        var accent = [
            /[\300-\306]/g, /[\340-\346]/g, // A, a
            /[\310-\313]/g, /[\350-\353]/g, // E, e
            /[\314-\317]/g, /[\354-\357]/g, // I, i
            /[\322-\330]/g, /[\362-\370]/g, // O, o
            /[\331-\334]/g, /[\371-\374]/g, // U, u
            /[\321]/g, /[\361]/g, // N, n
            /[\307]/g, /[\347]/g, // C, c
        ];
        var noaccent = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N', 'n', 'C', 'c'];

        var str: string = text;
        if (str && typeof str == "string") {
            for (var i = 0; i < accent.length; i++) {
                str = str.replace(accent[i], noaccent[i]);
            }
        }

        return str;
    }

    prepareStrinForSearch(text: string, caseSensitive: boolean, accentSensitive: boolean) {
        let t: string = text;
        if (!accentSensitive && typeof t == "string") {
            t = this.noAccent(t);
        }
        if (!caseSensitive && typeof t == "string") {
            t = t.toUpperCase();
        }
        return t;
    }

    compareString(text1: string, text2: string, caseSensitive: boolean, accentSensitive: boolean, exactMatching: boolean, include: boolean): boolean {
        let t1: string = this.prepareStrinForSearch(text1, caseSensitive, accentSensitive);
        let t2: string = this.prepareStrinForSearch(text2, caseSensitive, accentSensitive);
        if (exactMatching) {
            return text1 == text2;
        } else {
            if (include && typeof t1 == "string" && typeof t2 == "string") {
                return t1.indexOf(t2) != -1;
            } else {
                return t1 == t2;
            }
        }
    }

    randomPassword() {
        return Math.random().toString(36).slice(-8);
    }

    getFileNameWithoutExtension(fileName: string) {
        if (fileName) {
            return fileName.substring(0, fileName.lastIndexOf('.'));
        }
        return fileName;

    }

}