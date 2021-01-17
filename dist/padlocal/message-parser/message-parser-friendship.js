"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wechaty_puppet_1 = require("wechaty-puppet");
const is_type_1 = require("../utils/is-type");
const xml_to_json_1 = require("../utils/xml-to-json");
const WechatMessageType_1 = require("./WechatMessageType");
const FRIENDSHIP_CONFIRM_REGEX_LIST = [
    /^You have added (.+) as your WeChat contact. Start chatting!$/,
    /^你已添加了(.+)，现在可以开始聊天了。$/,
    /I've accepted your friend request. Now let's chat!$/,
    /^(.+) just added you to his\/her contacts list. Send a message to him\/her now!$/,
    /^(.+)刚刚把你添加到通讯录，现在可以开始聊天了。$/,
    /^我通过了你的朋友验证请求，现在我们可以开始聊天了$/,
];
const FRIENDSHIP_VERIFY_REGEX_LIST = [
    /^(.+) has enabled Friend Confirmation/,
    /^(.+)开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。/,
];
const friendshipTypeMap = {
    "1": wechaty_puppet_1.FriendshipSceneType.QQ,
    "2": wechaty_puppet_1.FriendshipSceneType.Email,
    "3": wechaty_puppet_1.FriendshipSceneType.Weixin,
    "12": wechaty_puppet_1.FriendshipSceneType.QQtbd,
    "14": wechaty_puppet_1.FriendshipSceneType.Room,
    "15": wechaty_puppet_1.FriendshipSceneType.Phone,
    "17": wechaty_puppet_1.FriendshipSceneType.Card,
    "18": wechaty_puppet_1.FriendshipSceneType.Location,
    "25": wechaty_puppet_1.FriendshipSceneType.Bottle,
    "29": wechaty_puppet_1.FriendshipSceneType.Shaking,
    "30": wechaty_puppet_1.FriendshipSceneType.QRCode,
};
const isConfirm = (message) => {
    return FRIENDSHIP_CONFIRM_REGEX_LIST.some((regexp) => {
        return !!message.content.match(regexp);
    });
};
const isNeedVerify = (message) => {
    return FRIENDSHIP_VERIFY_REGEX_LIST.some((regexp) => {
        return !!message.content.match(regexp);
    });
};
const isReceive = async (message) => {
    if (message.type !== WechatMessageType_1.WechatMessageType.VerifyMsg && message.type !== WechatMessageType_1.WechatMessageType.VerifyMsgEnterprise) {
        return null;
    }
    try {
        const verifyXml = await xml_to_json_1.xmlToJson(message.content);
        const contactId = verifyXml.msg.$.fromusername;
        if (is_type_1.isContactId(contactId) && verifyXml.msg.$.encryptusername) {
            return verifyXml;
        }
        else if (is_type_1.isIMContactId(contactId)) {
            return verifyXml;
        }
    }
    catch (e) {
        // not receive event
    }
    return null;
};
exports.default = async (_puppet, message) => {
    if (isConfirm(message)) {
        return {
            contactId: message.fromusername,
            id: message.id,
            timestamp: message.createtime,
            type: wechaty_puppet_1.FriendshipType.Confirm,
        };
    }
    else if (isNeedVerify(message)) {
        return {
            contactId: message.fromusername,
            id: message.id,
            timestamp: message.createtime,
            type: wechaty_puppet_1.FriendshipType.Verify,
        };
    }
    else {
        const verifyXml = await isReceive(message);
        if (verifyXml) {
            const friendshipPayload = {
                contactId: verifyXml.msg.$.fromusername,
                hello: verifyXml.msg.$.content,
                id: message.id,
                scene: friendshipTypeMap[verifyXml.msg.$.scene] || wechaty_puppet_1.FriendshipSceneType.Unknown,
                stranger: verifyXml.msg.$.encryptusername,
                ticket: verifyXml.msg.$.ticket,
                timestamp: message.createtime,
                type: wechaty_puppet_1.FriendshipType.Receive,
            };
            if (verifyXml.msg.$.sourceusername || verifyXml.msg.$.sharecardnickname) {
                friendshipPayload.source = {
                    sourceContactId: verifyXml.msg.$.sourceusername,
                    sourceName: verifyXml.msg.$.sourcenickname,
                    shareCardContactId: verifyXml.msg.$.sharecardusername,
                    shareCardName: verifyXml.msg.$.sharecardnickname
                };
            }
            return friendshipPayload;
        }
        return null;
    }
};
//# sourceMappingURL=message-parser-friendship.js.map