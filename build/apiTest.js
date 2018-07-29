"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiObject_1 = require("./apiObject");
class ApiTest extends apiObject_1.TableApi {
    assign() {
        this.assignObject("prescribable", "idprescribable");
        let multer = require('multer');
        let upload = multer();
        this.app.get('/prescribable/test', function (request, response) {
            response.statusCode = 200;
            response.send("VIDAL prescribable is running");
        });
    }
}
exports.ApiTest = ApiTest;
//# sourceMappingURL=apiTest.js.map