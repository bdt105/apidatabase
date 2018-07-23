"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toolbox_1 = require("./toolbox");
var Rest = /** @class */ (function () {
    function Rest(logFileName, logToConsole) {
        if (logFileName === void 0) { logFileName = null; }
        if (logToConsole === void 0) { logToConsole = false; }
        this.statusText = {
            100: "Continue, Informational",
            101: "Switching Protocols, Informational",
            200: "OK, Successful",
            201: "Created, Successful",
            202: "Accepted, Successful",
            203: "Non-Authoritative Information, Successful",
            204: "No Content, Successful",
            205: "Reset Content, Successful",
            206: "Partial Content, Successful",
            300: "Multiple Choices, Redirection",
            301: "Moved Permanently, Redirection",
            302: "Found, Redirection",
            303: "See Other, Redirection",
            304: "Not Modified, Redirection",
            305: "Use Proxy, Redirection",
            307: "Temporary Redirect, Redirection",
            400: "Bad Request, Client Error",
            401: "Unauthorized, Client Error",
            402: "Payment Required, Client Error",
            403: "Forbidden, Client Error",
            404: "Not Found, Client Error",
            405: "Method Not Allowed, Client Error",
            406: "Not Acceptable, Client Error",
            407: "Proxy Authentication Required, Client Error",
            408: "Request Timeout, Client Error",
            409: "Conflict, Client Error",
            410: "Gone, Client Error",
            411: "Length Required, Client Error",
            412: "Precondition Failed, Client Error",
            413: "Request Entity Too Large, Client Error",
            414: "Request-URI Too Long, Client Error",
            415: "Unsupported Media Type, Client Error",
            416: "Requested Range Not Satisfiable, Client Error",
            417: "Expectation Failed, Client Error",
            500: "Internal Server Error, Server Error",
            501: "Not Implemented, Server Error",
            502: "Bad Gateway, Server Error",
            503: "Service Unavailable, Server Error",
            504: "Gateway Timeout, Server Error",
            505: "HTTP Version Not Supported, Server Error"
        };
        this.logFileName = logFileName;
        this.logToConsole = logToConsole;
        this.toolbox = new toolbox_1.Toolbox();
    }
    Rest.prototype.call = function (callback, method, url, body, contentType, getRaw, headers) {
        var _this = this;
        if (body === void 0) { body = null; }
        if (contentType === void 0) { contentType = "application/json"; }
        if (getRaw === void 0) { getRaw = true; }
        if (headers === void 0) { headers = null; }
        var request = require('request');
        var bod = body;
        if (typeof bod == "string") {
            if (this.toolbox.isJson(bod)) {
                bod = JSON.stringify(bod);
            }
        }
        if (typeof bod == "object") {
            bod = JSON.stringify(bod);
        }
        var options = {
            "method": method,
            "headers": {
                "Content-type": contentType,
                "Accept": "*/*"
            },
            "uri": url,
            "body": bod
        };
        if (headers) {
            options.headers = headers;
        }
        request(options, function (error, response, bbody) {
            var data = {};
            if (getRaw) {
                data.raw = bbody;
            }
            if (error) {
                data.error = error;
            }
            if (response) {
                data.url = response.request.href;
                data.statusCode = response.statusCode;
                data.statusText = _this.statusText[data.statusCode];
            }
            else {
                data.statusCode = "ERR";
            }
            if (bbody && typeof bbody === "string") {
                data.json = _this.toolbox.xml2json(bbody);
            }
            _this.toolbox.log(url + JSON.stringify(data), _this.logFileName, _this.logToConsole);
            if (callback) {
                callback(data, data.error);
            }
        });
    };
    return Rest;
}());
exports.Rest = Rest;
