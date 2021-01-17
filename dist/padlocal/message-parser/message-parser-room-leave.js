"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoomLeaveDebouncing = void 0;
const wechaty_puppet_1 = require("wechaty-puppet");
const is_type_1 = require("../utils/is-type");
const get_xml_label_1 = require("../utils/get-xml-label");
const xml_to_json_1 = require("../utils/xml-to-json");
const ROOM_LEAVE_OTHER_REGEX_LIST = [/^(You) removed "(.+)" from the group chat/, /^(你)将"(.+)"移出了群聊/];
const ROOM_LEAVE_BOT_REGEX_LIST = [/^(You) were removed from the group chat by "([^"]+)"/, /^(你)被"([^"]+?)"移出群聊/];
const roomLeaveDebounceMap = new Map();
const DEBOUNCE_TIMEOUT = 2000; // 2 seconds
function debounceKey(roomId, removeeId) {
    return `${roomId}:${removeeId}`;
}
function addDebounce(roomId, removeeId) {
    const key = debounceKey(roomId, removeeId);
    const oldTimeout = roomLeaveDebounceMap.get(key);
    if (oldTimeout) {
        clearTimeout(oldTimeout);
    }
    const timeout = setTimeout(() => {
        roomLeaveDebounceMap.delete(key);
    }, DEBOUNCE_TIMEOUT);
    roomLeaveDebounceMap.set(key, timeout);
}
function isRoomLeaveDebouncing(roomId, removeeId) {
    const key = debounceKey(roomId, removeeId);
    const ret = roomLeaveDebounceMap.get(key) !== undefined;
    return ret;
}
exports.isRoomLeaveDebouncing = isRoomLeaveDebouncing;
exports.default = async (puppet, message) => {
    const roomId = message.fromusername;
    if (!is_type_1.isRoomId(roomId)) {
        return null;
    }
    let content = message.content;
    let linkList;
    const needParseXML = content.includes("移出群聊") || content.includes("You were removed from the group chat by");
    if (!needParseXML) {
        const tryXmlText = content.replace(/^[^\n]+\n/, "");
        const roomXml = await xml_to_json_1.xmlToJson(tryXmlText); // toJson(tryXmlText, { object: true }) as RoomRelatedXmlSchema
        if (!roomXml || !roomXml.sysmsg || !roomXml.sysmsg.sysmsgtemplate) {
            return null;
        }
        content = roomXml.sysmsg.sysmsgtemplate.content_template.template;
        linkList = roomXml.sysmsg.sysmsgtemplate.content_template.link_list.link;
    }
    let matchesForOther = [];
    ROOM_LEAVE_OTHER_REGEX_LIST.some((regex) => !!(matchesForOther = content.match(regex)));
    let matchesForBot = [];
    ROOM_LEAVE_BOT_REGEX_LIST.some((re) => !!(matchesForBot = content.match(re)));
    const matches = matchesForOther || matchesForBot;
    if (!matches) {
        return null;
    }
    let leaverId;
    let removerId;
    if (matchesForOther) {
        removerId = (await puppet.roomMemberSearch(roomId, wechaty_puppet_1.YOU))[0];
        const leaverName = matchesForOther[2];
        leaverId = get_xml_label_1.getUserName([linkList], leaverName);
    }
    else if (matchesForBot) {
        removerId = matchesForBot[2];
        leaverId = (await puppet.roomMemberSearch(roomId, wechaty_puppet_1.YOU))[0];
    }
    else {
        throw new Error("for typescript type checking, will never go here");
    }
    addDebounce(roomId, leaverId);
    return {
        removeeIdList: [leaverId],
        removerId,
        roomId,
        timestamp: message.createtime,
    };
};
//# sourceMappingURL=message-parser-room-leave.js.map