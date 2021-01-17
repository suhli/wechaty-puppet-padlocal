"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const lru_cache_1 = __importDefault(require("lru-cache"));
const brolog_1 = require("brolog");
const flash_store_1 = __importDefault(require("flash-store"));
const PRE = "[CacheManager]";
class CacheManager {
    constructor(userName) {
        this._userName = userName;
    }
    async init() {
        if (this._messageCache) {
            throw new Error("already initialized");
        }
        const baseDir = path_1.default.join(os_1.default.homedir(), path_1.default.sep, ".wechaty", "puppet-padlocal-cache", path_1.default.sep, this._userName, path_1.default.sep);
        const baseDirExist = await fs_extra_1.default.pathExists(baseDir);
        if (!baseDirExist) {
            await fs_extra_1.default.mkdirp(baseDir);
        }
        this._messageCache = new lru_cache_1.default({
            max: 1000,
            // length: function (n) { return n * 2},
            dispose(key, val) {
                brolog_1.log.silly(PRE, "constructor() lruOptions.dispose(%s, %s)", key, JSON.stringify(val));
            },
            maxAge: 1000 * 60 * 60,
        });
        this._messageRevokeCache = new lru_cache_1.default({
            max: 1000,
            // length: function (n) { return n * 2},
            dispose(key, val) {
                brolog_1.log.silly(PRE, "constructor() lruOptions.dispose(%s, %s)", key, JSON.stringify(val));
            },
            maxAge: 1000 * 60 * 60,
        });
        this._contactCache = new flash_store_1.default(path_1.default.join(baseDir, "contact-raw-payload"));
        this._contactSearchCache = new lru_cache_1.default({
            max: 1000,
            // length: function (n) { return n * 2},
            dispose(key, val) {
                brolog_1.log.silly(PRE, "constructor() lruOptions.dispose(%s, %s)", key, JSON.stringify(val));
            },
            maxAge: 1000 * 60 * 60,
        });
        this._roomCache = new flash_store_1.default(path_1.default.join(baseDir, "room-raw-payload"));
        this._roomMemberCache = new flash_store_1.default(path_1.default.join(baseDir, "room-member-raw-payload"));
        this._roomInvitationCache = new flash_store_1.default(path_1.default.join(baseDir, "room-invitation-raw-payload"));
        this._friendshipCache = new flash_store_1.default(path_1.default.join(baseDir, "friendship-raw-payload"));
        const contactTotal = await this._contactCache.size;
        brolog_1.log.verbose(PRE, `initCache() inited ${contactTotal} Contacts,  cachedir="${baseDir}"`);
    }
    async close() {
        brolog_1.log.verbose(PRE, "close()");
        if (this._contactCache &&
            this._roomMemberCache &&
            this._roomCache &&
            this._friendshipCache &&
            this._roomInvitationCache &&
            this._messageCache) {
            brolog_1.log.silly(PRE, "close() closing caches ...");
            await Promise.all([
                this._contactCache.close(),
                this._roomMemberCache.close(),
                this._roomCache.close(),
                this._friendshipCache.close(),
                this._roomInvitationCache.close(),
            ]);
            this._contactCache = undefined;
            this._roomMemberCache = undefined;
            this._roomCache = undefined;
            this._friendshipCache = undefined;
            this._roomInvitationCache = undefined;
            this._messageCache = undefined;
            brolog_1.log.silly(PRE, "close() cache closed.");
        }
        else {
            brolog_1.log.verbose(PRE, "close() cache not exist.");
        }
    }
    /**
     * -------------------------------
     * Message Section
     * --------------------------------
     */
    async getMessage(messageId) {
        return this._messageCache.get(messageId);
    }
    async setMessage(messageId, payload) {
        await this._messageCache.set(messageId, payload);
    }
    async hasMessage(messageId) {
        return this._messageCache.has(messageId);
    }
    async getMessageRevokeInfo(messageId) {
        return this._messageRevokeCache.get(messageId);
    }
    async setMessageRevokeInfo(messageId, messageSendResult) {
        await this._messageRevokeCache.set(messageId, messageSendResult);
    }
    /**
     * -------------------------------
     * Contact Section
     * --------------------------------
     */
    async getContact(contactId) {
        return this._contactCache.get(contactId);
    }
    async setContact(contactId, payload) {
        await this._contactCache.set(contactId, payload);
    }
    async deleteContact(contactId) {
        await this._contactCache.delete(contactId);
    }
    async getContactIds() {
        const result = [];
        for await (const key of this._contactCache.keys()) {
            result.push(key);
        }
        return result;
    }
    async getAllContacts() {
        const result = [];
        for await (const value of this._contactCache.values()) {
            result.push(value);
        }
        return result;
    }
    async hasContact(contactId) {
        return this._contactCache.has(contactId);
    }
    async getContactCount() {
        return this._contactCache.size;
    }
    /**
     * contact search
     */
    async getContactSearch(id) {
        return this._contactSearchCache.get(id);
    }
    async setContactSearch(id, payload) {
        await this._contactSearchCache.set(id, payload);
    }
    async hasContactSearch(id) {
        return this._contactSearchCache.has(id);
    }
    /**
     * -------------------------------
     * Room Section
     * --------------------------------
     */
    async getRoom(roomId) {
        return this._roomCache.get(roomId);
    }
    async setRoom(roomId, payload) {
        await this._roomCache.set(roomId, payload);
    }
    async deleteRoom(roomId) {
        await this._roomCache.delete(roomId);
    }
    async getRoomIds() {
        const result = [];
        for await (const key of this._roomCache.keys()) {
            result.push(key);
        }
        return result;
    }
    async getRoomCount() {
        return this._roomCache.size;
    }
    async hasRoom(roomId) {
        return this._roomCache.has(roomId);
    }
    /**
     * -------------------------------
     * Room Member Section
     * --------------------------------
     */
    async getRoomMember(roomId) {
        return this._roomMemberCache.get(roomId);
    }
    async setRoomMember(roomId, payload) {
        await this._roomMemberCache.set(roomId, payload);
    }
    async deleteRoomMember(roomId) {
        await this._roomMemberCache.delete(roomId);
    }
    /**
     * -------------------------------
     * Room Invitation Section
     * -------------------------------
     */
    async getRoomInvitation(messageId) {
        return this._roomInvitationCache.get(messageId);
    }
    async setRoomInvitation(messageId, payload) {
        await this._roomInvitationCache.set(messageId, payload);
    }
    async deleteRoomInvitation(messageId) {
        await this._roomInvitationCache.delete(messageId);
    }
    /**
     * -------------------------------
     * Friendship Cache Section
     * --------------------------------
     */
    async getFriendshipRawPayload(id) {
        return this._friendshipCache.get(id);
    }
    async setFriendshipRawPayload(id, payload) {
        await this._friendshipCache.set(id, payload);
    }
    getLabelList() {
        return this._labelList;
    }
    setLabelList(labelList) {
        this._labelList = labelList;
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map