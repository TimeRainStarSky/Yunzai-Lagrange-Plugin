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
exports.Group = void 0;
const contactable_1 = require("./contactable");
const constants_1 = require("../core/constants");
const errors_1 = require("../errors");
const pb = __importStar(require("../core/protobuf"));
const groupMember_1 = require("./groupMember");
const fileSystem_1 = require("./fileSystem");
const groupCacheMap = new WeakMap();
class Group extends contactable_1.Contactable {
    get avatar() {
        return `https://p.qlogo.cn/gh/${this.gid}/${this.gid}/0/`;
    }
    static as(gid) {
        return new Group(this, Number(gid));
    }
    static from(gid, strict = false) {
        const groupInfo = this.groupList.get(gid);
        if (!groupInfo && strict)
            throw new Error(`Group(${gid}) not found`);
        let group = groupCacheMap.get(groupInfo);
        if (!group) {
            group = new Group(this, gid);
            if (groupInfo)
                groupCacheMap.set(groupInfo, group);
        }
        return group;
    }
    get group_id() {
        return this.gid;
    }
    constructor(c, gid) {
        super(c);
        this.gid = gid;
        this.pickMember = groupMember_1.GroupMember.from.bind(this.c, this.gid);
        this.fetchMembers = Group.fetchMember.bind(this.c, this.gid);
        this.info = c.groupList.get(gid);
        (0, constants_1.lock)(this, 'gid');
        this.fileSystem = new fileSystem_1.FileSystem(this);
    }
    async sendMsg(content, source) {
        const { rich, brief } = await this._preprocess(content, source);
        const seq = this.c.sig.seq + 1;
        const rsp = await this._sendMsg({ 1: rich });
        if (rsp[1] !== 0) {
            this.c.logger.error(`failed to send: [Group(${this.gid})] ${rsp[2]}(${rsp[1]})`);
            (0, errors_1.drop)(rsp[1], rsp[2]);
        }
        this.c.logger.info(`succeed to send: [Group(${this.gid})] ` + brief);
        const time = rsp[3];
        return { seq, time };
    }
    async recallMsg(seq) {
        const result = await this.c.sendUni('trpc.msg.msg_svc.MsgService.SsoGroupRecallMsg', pb.encode({
            1: 1,
            2: this.gid,
            3: { 1: seq, 3: 0 },
            4: { 1: 0 },
        }));
        const proto = pb.decode(result);
        return !!proto[3];
    }
    async rename(targetName) {
        const body = pb.encode({
            1: this.group_id,
            2: {
                3: targetName,
            },
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0x89a, 15, body);
        const rsp = pb.decode(payload);
        return !rsp[3];
    }
    /**
     * 上传语音
     * @param elem
     */
    async uploadRecord(elem) { }
    /**
     * 解析语音内容
     */
    async downloadRecord() { }
    async remark(targetRemark) {
        const body = pb.encode({
            1: {
                1: this.group_id,
                3: targetRemark,
            },
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0xf16, 1, body);
        const rsp = pb.decode(payload);
        return !rsp[3];
    }
    async mute(isEnable) {
        const body = pb.encode({
            1: this.group_id,
            2: {
                17: isEnable ? 0 : -1,
            },
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0x89a, 0, body);
        const rsp = pb.decode(payload);
        return !rsp[3];
    }
    /**
     * 邀请好友加群 (须添加机器人为好友)
     * @param user_ids
     */
    async invite(...user_ids) {
        const body = pb.encode({
            1: this.gid,
            2: user_ids
                .filter(user_id => this.c.friendList.has(user_id))
                .map(user_id => {
                return {
                    1: this.c.friendList.get(user_id).uid,
                };
            }),
            10: 0,
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0x758, 1, body);
        const rsp = pb.decode(payload);
        return !rsp[3];
    }
    async quit() {
        const body = pb.encode({
            1: this.group_id,
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0x1097, 1, body);
        const rsp = pb.decode(payload);
        const success = !rsp[3];
        if (success)
            this.c.groupList.delete(this.gid);
        return success;
    }
    async transfer(user_id) {
        return this.pickMember(user_id).setOwner();
    }
}
exports.Group = Group;
(function (Group) {
    async function fetchMember(gid) {
        let token = null;
        if (!this.memberList.has(gid))
            this.memberList.set(gid, new Map());
        try {
            while (true) {
                const request = pb.encode({
                    1: gid,
                    2: 5,
                    3: 2,
                    4: {
                        10: true,
                        11: true,
                        12: true,
                        100: true,
                        101: true,
                        107: true,
                    },
                    15: token,
                });
                const response = await this.sendOidbSvcTrpcTcp(0xfe7, 3, request);
                const proto = pb.decode(response);
                const list = this.memberList.get(gid);
                for (const member of proto[4][2]) {
                    const info = {
                        group_id: gid,
                        user_id: member[1][4],
                        uid: member[1][2],
                        permission: member[107],
                        level: member[12]?.[2] || 0,
                        card: member[11]?.[2] || '',
                        nickname: member[10] || '',
                        join_time: member[100],
                        last_sent_time: member[101],
                    };
                    list.set(info.user_id, info);
                }
                if (proto[15]) {
                    token = proto[15];
                }
                else {
                    break;
                }
            }
        }
        catch {
            this.logger.error('加载群员列表超时');
        }
    }
    Group.fetchMember = fetchMember;
})(Group || (exports.Group = Group = {}));
(function (Group) {
    let Permission;
    (function (Permission) {
        Permission[Permission["member"] = 0] = "member";
        Permission[Permission["owner"] = 1] = "owner";
        Permission[Permission["admin"] = 2] = "admin";
    })(Permission = Group.Permission || (Group.Permission = {}));
})(Group || (exports.Group = Group = {}));
//# sourceMappingURL=group.js.map