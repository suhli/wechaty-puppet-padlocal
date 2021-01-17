"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xmlToJson = void 0;
const xml2js_1 = require("xml2js");
const brolog_1 = require("brolog");
async function xmlToJson(xml) {
    return new Promise((resolve) => {
        xml2js_1.parseString(xml, { explicitArray: false }, (err, result) => {
            if (err && Object.keys(err).length !== 0) {
                brolog_1.log.warn(JSON.stringify(err));
            }
            return resolve(result);
        });
    });
}
exports.xmlToJson = xmlToJson;
//# sourceMappingURL=xml-to-json.js.map