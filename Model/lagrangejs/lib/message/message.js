"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForwardMessage = exports.GroupMessage = exports.TempMessage = exports.PrivateMessage = exports.Message = exports.uuid2rand = exports.rand2uuid = void 0;
const parser_1 = require("./parser");
const pb = __importStar(require("../core/protobuf"));
const constants_1 = require("../core/constants");
const common_1 = require("../common");
function rand2uuid(rand) {
    return (16777216n << 32n) | BigInt(rand);
}
exports.rand2uuid = rand2uuid;
function uuid2rand(uuid) {
    return Number(BigInt(uuid) & 0xffffffffn);
}
exports.uuid2rand = uuid2rand;
class Message {
    static deserialize(serialized) {
        const proto = pb.decode(serialized);
        switch (proto[2]) {
            default:
                return new PrivateMessage(proto);
        }
    }
    constructor(proto) {
        this.proto = proto;
        this.post_type = 'message';
        this.proto = proto;
        const info = proto[1], head = proto[2], body = proto[3];
        this.user_id = info[1];
        this.uid = info[2].toString();
        this.time = head[6];
        this.seq = head[5];
        this.rand = proto[3]?.[1]?.[1]?.[3] || uuid2rand(head[7]);
        this.font = body[1]?.[1]?.[9]?.toString() || 'unknown';
        this.parsed = (0, parser_1.parse)(body[1], head[2]);
        this.message = this.parsed.message;
        this.raw_message = this.parsed.brief;
        if (this.parsed.quotation) {
            const q = this.parsed.quotation;
            this.source = {
                user_id: q[2],
                time: q[3],
                seq: q[1]?.[0] || q[1],
                rand: uuid2rand(q[8]?.[3] || 0),
                message: (0, parser_1.parse)(Array.isArray(q[5]) ? q[5] : [q[5]]).brief,
            };
        }
    }
    toString() {
        return this.parsed.content;
    }
}
exports.Message = Message;
class PrivateMessage extends Message {
    constructor(proto) {
        super(proto);
        this.message_type = 'private';
        this.sub_type = 'friend';
        /** 发送方信息 */
        this.sender = {
            /** 账号 */
            user_id: 0,
            /** 昵称 */
            nickname: '',
        };
        const head = proto[1];
        this.from_id = this.sender.user_id = head[1];
        this.to_id = head[2];
        this.auto_reply = !!(proto[2] && proto[2][4]);
        switch (head[3]) {
            case 529:
                if (head[4] === 4) {
                    const trans = proto[3][2][1];
                    if (trans[1] !== 0)
                        throw new Error('unsupported message (ignore ok)');
                    const elem = {
                        type: 'file',
                        name: String(trans[5]),
                        size: trans[6],
                        md5: trans[4]?.toHex() || '',
                        duration: trans[51] || 0,
                        fid: String(trans[3]),
                    };
                    this.message = [elem];
                    this.raw_message = '[离线文件]';
                    this.parsed.content = `{file:${elem.fid}}`;
                }
                else {
                    this.sub_type = this.from_id === this.to_id ? 'self' : 'friend';
                    this.message =
                        this.raw_message =
                            this.parsed.content =
                                proto[3][2]?.[6]?.[5]?.[1]?.[2]?.toString() || '';
                }
                break;
        }
    }
}
exports.PrivateMessage = PrivateMessage;
class TempMessage extends Message {
    constructor(proto) {
        super(proto);
        this.message_type = 'private';
        this.sub_type = 'temp';
        /** 发送方信息 */
        this.sender = {
            /** 账号 */
            user_id: 0,
            /** 昵称 */
            nickname: '',
            /** 群号，当消息来自群聊时有效 */
            group_id: undefined,
        };
        const head = proto[1];
        this.from_id = this.sender.user_id = head[1];
        this.to_id = head[2];
        this.auto_reply = !!(proto[2] && proto[2][4]);
        this.group_id = head[8][1];
        this.group_name = head[8][7].toString();
        this.sender.nickname = this.parsed.extra?.[1]?.toString() || '';
        this.sender.group_id = head[8]?.[4];
    }
}
exports.TempMessage = TempMessage;
class GroupMessage extends Message {
    constructor(proto) {
        super(proto);
        this.message_type = 'group';
        this.sub_type = 'group';
        /** 发送方信息 */
        this.sender = {
            /** 账号 */
            user_id: 0,
            /** 昵称 */
            nickname: '',
            /** subId */
            sub_id: '',
            /** 名片 */
            card: '',
            /** 等级 */
            level: 0,
            /** 权限 */
            role: 'member',
            /** 头衔 */
            title: '',
        };
        this.group_id = proto[1][8][1];
        this.group_name = proto[1][8][7].toString();
        this.atme = this.parsed.atme;
        this.atall = this.parsed.atall;
        this.sender.user_id = proto[1][1];
        this.sender.sub_id = proto[1][11];
        const ext = this.parsed.extra;
        if (!ext?.[2])
            this.sender.nickname = ext?.[1]?.toString() || '';
        else
            this.sender.nickname = this.sender.card = (0, common_1.parseFunString)(proto[1][8][4].toBuffer());
        if (ext?.[4])
            this.sender.role = ext[4] === 8 ? 'owner' : 'admin';
        this.sender.level = ext?.[3] || 0;
        this.sender.title = ext?.[7]?.toString() || '';
    }
}
exports.GroupMessage = GroupMessage;
/** 一条转发消息 */
class ForwardMessage {
    /** 反序列化一条转发消息 */
    static deserialize(serialized) {
        return new ForwardMessage(pb.decode(serialized));
    }
    constructor(proto) {
        this.proto = proto;
        this.proto = proto;
        const head = proto[1];
        this.time = head[6] || 0;
        this.seq = head[5];
        this.user_id = head[1] || 0;
        this.nickname = head[14]?.toString() || head[9]?.[4]?.toString() || '';
        this.group_id = head[9]?.[1];
        this.parsed = (0, parser_1.parse)(proto[3][1]);
        this.message = this.parsed.message;
        this.raw_message = this.parsed.brief;
        (0, constants_1.lock)(this, 'proto');
        (0, constants_1.lock)(this, 'parsed');
    }
    /** 将转发消息序列化保存 */
    serialize() {
        return this.proto.toBuffer();
    }
    /** 以适合人类阅读的形式输出 */
    toString() {
        return this.parsed.content;
    }
    /** @deprecated 转换为CQ码 */
    toCqcode() {
        return '';
    }
}
exports.ForwardMessage = ForwardMessage;
//# sourceMappingURL=message.js.map