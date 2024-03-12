"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PrivateMessageEvent_c, _TempMessageEvent_c, _GroupMessageEvent_c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMessageEvent = exports.TempMessageEvent = exports.PrivateMessageEvent = void 0;
const message_1 = require("../message/message");
class PrivateMessageEvent extends message_1.PrivateMessage {
    constructor(c, pb) {
        super(pb);
        _PrivateMessageEvent_c.set(this, void 0);
        __classPrivateFieldSet(this, _PrivateMessageEvent_c, c, "f");
    }
    /** 好友对象 */
    get friend() {
        return __classPrivateFieldGet(this, _PrivateMessageEvent_c, "f").pickFriend(this.user_id);
    }
    reply(content, quote) {
        return this.friend.sendMsg(content, quote ? this : undefined);
    }
}
exports.PrivateMessageEvent = PrivateMessageEvent;
_PrivateMessageEvent_c = new WeakMap();
class TempMessageEvent extends message_1.TempMessage {
    constructor(c, pb) {
        super(pb);
        _TempMessageEvent_c.set(this, void 0);
        __classPrivateFieldSet(this, _TempMessageEvent_c, c, "f");
    }
    get group() {
        return __classPrivateFieldGet(this, _TempMessageEvent_c, "f").pickGroup(this.group_id);
    }
    reply(content, quote) {
        return this.group.pickMember(this.user_id).sendMsg(content, quote ? this : undefined);
    }
}
exports.TempMessageEvent = TempMessageEvent;
_TempMessageEvent_c = new WeakMap();
class GroupMessageEvent extends message_1.GroupMessage {
    constructor(c, pb) {
        super(pb);
        _GroupMessageEvent_c.set(this, void 0);
        __classPrivateFieldSet(this, _GroupMessageEvent_c, c, "f");
    }
    /** 群对象 */
    get group() {
        return __classPrivateFieldGet(this, _GroupMessageEvent_c, "f").pickGroup(this.group_id);
    }
    get member() {
        return this.group.pickMember(this.user_id);
    }
    recall() {
        return this.group.recallMsg(this.seq);
    }
    reply(content, quote) {
        return this.group.sendMsg(content, quote ? this : undefined);
    }
}
exports.GroupMessageEvent = GroupMessageEvent;
_GroupMessageEvent_c = new WeakMap();
//# sourceMappingURL=message.js.map