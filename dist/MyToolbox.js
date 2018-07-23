"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("bdt105toolbox/dist");
class MyToolbox extends dist_1.Toolbox {
    constructor() {
        super();
        this.configuration = {};
        this.configuration = this.loadFromJsonFile("./conf/configuration.json");
    }
    logg(text) {
        if (this.configuration) {
            this.log(this.configuration.common.logFile, text, this.configuration.common.logToConsole);
        }
    }
}
exports.MyToolbox = MyToolbox;
//# sourceMappingURL=MyToolbox.js.map