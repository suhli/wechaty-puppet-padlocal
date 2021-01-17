"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessage = exports.registerMessageParser = void 0;
const message_parser_type_1 = require("./message-parser-type");
const brolog_1 = require("brolog");
const PRE = "[MessageParser]";
const MessageParsers = new Map();
function registerMessageParser(category, parser) {
    MessageParsers.set(category, parser);
}
exports.registerMessageParser = registerMessageParser;
async function parseMessage(puppet, message) {
    for (const [category, parser] of MessageParsers.entries()) {
        try {
            const parsedPayload = await parser(puppet, message);
            if (parsedPayload) {
                return {
                    category,
                    payload: parsedPayload,
                };
            }
        }
        catch (e) {
            brolog_1.log.error(PRE, `parse message error: ${e.stack}`);
        }
    }
    // if none special category parsed, return normal as message
    return {
        category: message_parser_type_1.MessageCategory.NormalMessage,
        payload: message,
    };
}
exports.parseMessage = parseMessage;
//# sourceMappingURL=message-parser.js.map