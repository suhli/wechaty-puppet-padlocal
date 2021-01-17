"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoomMemberToContact = exports.padLocalRoomMemberToWechaty = exports.padLocalRoomToWechaty = exports.padLocalContactToWechaty = exports.padLocalMessageToWechaty = void 0;
const padlocal_pb_1 = require("padlocal-client-ts/dist/proto/padlocal_pb");
const wechaty_puppet_1 = require("wechaty-puppet");
const is_type_1 = require("../utils/is-type");
const message_1 = require("../message-parser/helpers/message");
const message_appmsg_1 = require("../message-parser/helpers/message-appmsg");
const wechaty_1 = require("wechaty");
const PRE = "[SchemaMapper]";
async function padLocalMessageToWechaty(puppet, message) {
    const wechatMessageType = message.type;
    const type = message_1.convertMessageType(wechatMessageType);
    const payloadBase = {
        id: message.id,
        timestamp: message.createtime,
        type,
    };
    /**
     * fromId: is mandatory
     * roomId or toId: is mandatory
     */
    let fromId;
    let roomId;
    let toId;
    let text;
    let mentionIdList = [];
    // enterprise wechat
    if (is_type_1.isRoomId(message.fromusername) || is_type_1.isIMRoomId(message.fromusername)) {
        roomId = message.fromusername;
        const parts = message.content.split(":\n");
        if (parts && parts.length > 1) {
            if (is_type_1.isContactId(parts[0]) || is_type_1.isIMContactId(parts[0])) {
                fromId = parts[0];
            }
        }
    }
    else if (is_type_1.isRoomId(message.tousername) || is_type_1.isIMRoomId(message.tousername)) {
        roomId = message.tousername;
        fromId = message.fromusername;
    }
    else {
        fromId = message.fromusername;
        toId = message.tousername;
    }
    // set text
    if (roomId) {
        const startIndex = message.content.indexOf(":\n");
        text = message.content.slice(startIndex !== -1 ? startIndex + 2 : 0);
    }
    else if (is_type_1.isContactId(message.fromusername)) {
        text = message.content;
    }
    else if (is_type_1.isIMContactId(message.fromusername)) {
        text = message.content;
    }
    // set mention list
    if (roomId) {
        if (message.atList.length === 1 && message.atList[0] === "announcement@all") {
            const roomPayload = await puppet.roomPayload(roomId);
            mentionIdList = roomPayload.memberIdList;
        }
        else {
            mentionIdList = message.atList;
        }
    }
    /**
     * 7. Set text for quote message
     */
    // TODO:
    /*
    if (rawPayload.appMsgType === WechatAppMessageType.QuoteMessage) {
      text = await quotePayloadParser(rawPayload);
    }
     */
    let payload;
    // Two branch is the same code.
    // Only for making TypeScript happy
    if (fromId && toId) {
        payload = {
            ...payloadBase,
            fromId,
            mentionIdList,
            roomId,
            text,
            toId,
        };
    }
    else if (roomId) {
        payload = {
            ...payloadBase,
            fromId,
            mentionIdList,
            roomId,
            text,
            toId,
        };
    }
    else {
        throw new Error("neither toId nor roomId");
    }
    await _adjustMessageByAppMsg(message, payload);
    return payload;
}
exports.padLocalMessageToWechaty = padLocalMessageToWechaty;
function padLocalContactToWechaty(contact) {
    return {
        id: contact.username,
        gender: contact.gender,
        type: is_type_1.isContactOfficialId(contact.username) ? wechaty_puppet_1.ContactType.Official : wechaty_puppet_1.ContactType.Unknown,
        name: contact.nickname,
        avatar: contact.avatar,
        alias: contact.remark,
        weixin: contact.alias,
        city: contact.city,
        friend: !contact.stranger,
        province: contact.province,
        signature: contact.signature,
        phone: [],
    };
}
exports.padLocalContactToWechaty = padLocalContactToWechaty;
function padLocalRoomToWechaty(contact) {
    return {
        adminIdList: [],
        avatar: contact.avatar,
        id: contact.username,
        memberIdList: contact.chatroommemberList.map((member) => member.username),
        ownerId: contact.chatroomownerusername,
        topic: contact.nickname,
    };
}
exports.padLocalRoomToWechaty = padLocalRoomToWechaty;
function padLocalRoomMemberToWechaty(chatRoomMember) {
    return {
        id: chatRoomMember.username,
        roomAlias: chatRoomMember.displayname,
        inviterId: chatRoomMember.inviterusername,
        avatar: chatRoomMember.avatar,
        name: chatRoomMember.nickname,
    };
}
exports.padLocalRoomMemberToWechaty = padLocalRoomMemberToWechaty;
async function _adjustMessageByAppMsg(message, payload) {
    if (payload.type !== wechaty_puppet_1.MessageType.Attachment) {
        return;
    }
    try {
        const appPayload = await message_appmsg_1.appMessageParser(message);
        switch (appPayload.type) {
            case message_appmsg_1.AppMessageType.Text:
                payload.type = wechaty_puppet_1.MessageType.Text;
                payload.text = appPayload.title;
                break;
            case message_appmsg_1.AppMessageType.Url:
                payload.type = wechaty_puppet_1.MessageType.Url;
                break;
            case message_appmsg_1.AppMessageType.Attach:
                payload.type = wechaty_puppet_1.MessageType.Attachment;
                payload.filename = appPayload.title;
                break;
            case message_appmsg_1.AppMessageType.ChatHistory:
                payload.type = wechaty_puppet_1.MessageType.ChatHistory;
                break;
            case message_appmsg_1.AppMessageType.MiniProgram:
            case message_appmsg_1.AppMessageType.MiniProgramApp:
                payload.type = wechaty_puppet_1.MessageType.MiniProgram;
                break;
            case message_appmsg_1.AppMessageType.RedEnvelopes:
                payload.type = wechaty_puppet_1.MessageType.RedEnvelope;
                break;
            case message_appmsg_1.AppMessageType.Transfers:
                payload.type = wechaty_puppet_1.MessageType.Transfer;
                break;
            case message_appmsg_1.AppMessageType.RealtimeShareLocation:
                payload.type = wechaty_puppet_1.MessageType.Location;
                break;
            case message_appmsg_1.AppMessageType.GroupNote:
                payload.type = wechaty_puppet_1.MessageType.GroupNote;
                payload.text = appPayload.title;
                break;
            default:
                payload.type = wechaty_puppet_1.MessageType.Unknown;
                break;
        }
    }
    catch (e) {
        wechaty_1.log.warn(PRE, `Error occurred while parse message attachment: ${JSON.stringify(message)} , ${e.stack}`);
    }
}
function chatRoomMemberToContact(chatRoomMember) {
    return new padlocal_pb_1.Contact()
        .setUsername(chatRoomMember.getUsername())
        .setNickname(chatRoomMember.getNickname())
        .setAvatar(chatRoomMember.getAvatar());
}
exports.chatRoomMemberToContact = chatRoomMemberToContact;
//# sourceMappingURL=index.js.map