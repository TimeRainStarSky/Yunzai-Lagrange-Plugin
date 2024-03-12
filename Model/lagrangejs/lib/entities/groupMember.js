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
exports.GroupMember = void 0;
const user_1 = require("./user");
const constants_1 = require("../core/constants");
const pb = __importStar(require("../core/protobuf"));
const errors_1 = require("../errors");
const memberCache = new WeakMap();
class GroupMember extends user_1.User {
    constructor(c, gid, uin) {
        super(c, uin);
        this.gid = gid;
        this.info = c.memberList.get(gid)?.get(uin);
        this.uid = this.info?.uid;
        (0, constants_1.lock)(this, 'uid');
        (0, constants_1.lock)(this, 'gid');
    }
    get isFriend() {
        return !!this.c.friendList.get(this.uin);
    }
    static from(gid, uid, strict = false) {
        const memberInfo = this.memberList.get(gid)?.get(uid);
        if (!memberInfo && strict)
            throw new Error(`Group(${gid}) not exist or Member(${uid}) not found`);
        let member = memberCache.get(memberInfo);
        if (!member) {
            member = new GroupMember(this, gid, uid);
            if (memberInfo)
                memberCache.set(memberInfo, member);
        }
        return member;
    }
    async mute(duration) {
        const body = pb.encode({
            1: this.gid,
            2: 1,
            3: {
                1: this.uid,
                2: duration,
            },
        });
        const packet = await this.c.sendOidbSvcTrpcTcp(0x1253, 1, body);
        const rsp = pb.decode(packet);
        return !rsp[3];
    }
    async kick(rejectAddition) {
        const body = pb.encode({
            1: this.gid,
            3: this.uid,
            4: rejectAddition,
            5: '',
        });
        const packet = await this.c.sendOidbSvcTrpcTcp(0x8a0, 1, body);
        const rsp = pb.decode(packet);
        return !rsp[3];
    }
    async setAdmin(isAdmin) {
        const body = pb.encode({
            1: this.gid,
            2: this.uid,
            3: isAdmin,
        });
        const packet = await this.c.sendOidbSvcTrpcTcp(0x8a0, 1, body);
        const rsp = pb.decode(packet);
        return !rsp[3];
    }
    /**
     * 设为群主
     */
    async setOwner() {
        const body = pb.encode({
            1: this.gid,
            2: this.c.uid,
            3: this.uid,
        });
        const packet = await this.c.sendOidbSvcTrpcTcp(0x89e, 0, body);
        const rsp = pb.decode(packet);
        return !rsp[3];
    }
    async sendMsg(content, source) {
        if (this.isFriend)
            return this.asFriend().sendMsg(content, source); // 是好友，直接走私聊
        const { rich, brief } = await this._preprocess(content, source);
        const seq = this.c.sig.seq + 1;
        const rsp = await this._sendMsg({ 1: rich });
        if (rsp[1] !== 0) {
            this.c.logger.error(`failed to send: [Temp(${this.uin}) of Group(${this.gid})] ${rsp[2]}(${rsp[1]})`);
            (0, errors_1.drop)(rsp[1], rsp[2]);
        }
        this.c.logger.info(`succeed to send: [Temp(${this.uin}) of Group(${this.gid})] ` + brief);
        const time = rsp[3];
        return { seq, time };
    }
    async renameGroupMember(targetName) {
        const body = pb.encode({
            1: this.gid,
            3: {
                1: this.uid,
                8: targetName,
            },
        });
        const packet = await this.c.sendOidbSvcTrpcTcp(0x8fc, 3, body);
        const rsp = pb.decode(packet);
        return !rsp[3];
    }
    addFriend() { }
}
exports.GroupMember = GroupMember;
//# sourceMappingURL=groupMember.js.map