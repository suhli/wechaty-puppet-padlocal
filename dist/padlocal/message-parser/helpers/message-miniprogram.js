"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miniProgramMessageParser = void 0;
const xml_to_json_1 = require("../../utils/xml-to-json");
async function miniProgramMessageParser(rawPayload) {
    const content = rawPayload.content.trim();
    let tryXmlText = content;
    if (!/^<msg>.*/.test(content)) {
        tryXmlText = content.replace(/^[^\n]+\n/, "");
    }
    const miniProgramXml = await xml_to_json_1.xmlToJson(tryXmlText);
    const appmsg = miniProgramXml.msg.appmsg;
    const weappinfo = appmsg.weappinfo;
    const appattach = appmsg.appattach;
    return {
        appid: weappinfo.appid,
        username: weappinfo.username,
        title: appmsg.title,
        description: appmsg.sourcedisplayname,
        pagePath: weappinfo.pagepath,
        iconUrl: weappinfo.weappiconurl,
        shareId: weappinfo.shareId,
        thumbUrl: appattach.cdnthumburl,
        thumbKey: appattach.cdnthumbaeskey,
    };
}
exports.miniProgramMessageParser = miniProgramMessageParser;
//# sourceMappingURL=message-miniprogram.js.map