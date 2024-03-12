"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGroupMsg = exports.handleTempMsg = exports.handlePrivateMsg = void 0;
const message_1 = require("../events/message");
function handlePrivateMsg(proto) {
    this.statistics.recvMsgCount++;
    const msg = new message_1.PrivateMessageEvent(this, proto);
    if (msg.raw_message) {
        this.logger.info(`recv from: [Private: ${msg.user_id}(${msg.sub_type})] ` + msg);
        this.em('message.private.' + msg.sub_type, msg);
    }
}
exports.handlePrivateMsg = handlePrivateMsg;
function handleTempMsg(proto) {
    this.statistics.recvMsgCount++;
    const msg = new message_1.TempMessageEvent(this, proto);
    if (msg.raw_message) {
        this.logger.info(`recv from: [Temp: ${msg.user_id} of Group(${msg.group_id})] ` + msg);
        this.em('message.private.' + msg.sub_type, msg);
    }
}
exports.handleTempMsg = handleTempMsg;
function handleGroupMsg(proto) {
    this.statistics.recvMsgCount++;
    const msg = new message_1.GroupMessageEvent(this, proto);
    if (msg.raw_message) {
        this.logger.info(`recv from: [Group: ${msg.user_id}(${msg.group_id})] ` + msg);
        this.em('message.group.normal', msg);
    }
}
exports.handleGroupMsg = handleGroupMsg;
//# sourceMappingURL=msgpush.js.map