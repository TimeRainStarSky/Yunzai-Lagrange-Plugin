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
exports.Friend = void 0;
const user_1 = require("./user");
const errors_1 = require("../errors");
const pb = __importStar(require("../core/protobuf"));
const constants_1 = require("../core/constants");
const friendCache = new WeakMap();
class Friend extends user_1.User {
    constructor(c, uin) {
        super(c, uin);
        this.info = c.friendList.get(uin);
        this.uid = this.info?.uid;
        (0, constants_1.lock)(this, 'uid');
        (0, constants_1.hide)(this, '_info');
    }
    static from(uid, strict = false) {
        const friendInfo = this.friendList.get(uid);
        if (!friendInfo && strict)
            throw new Error(`Friend(${uid}) not found`);
        let friend = friendCache.get(friendInfo);
        if (!friend) {
            friend = new Friend(this, uid);
            if (friendInfo)
                friendCache.set(friendInfo, friend);
        }
        return friend;
    }
    /**
     * 获取文件信息
     * @param fid 文件id
     * @param hash 文件hash
     */
    async getFileInfo(fid, hash) {
        const body = pb.encode({
            14: {
                10: this.c.uin,
                20: fid,
                60: hash,
                601: 0,
            },
        });
        const payload = await this.c.sendOidbSvcTrpcTcp(0xe37, 1200, body);
        const rsp = pb.decode(payload)[14];
        if (rsp[10] !== 0)
            (0, errors_1.drop)(errors_1.ErrorCode.OfflineFileNotExists, rsp[20]);
        const obj = rsp[30];
        let url = String(obj[50]);
        if (!url.startsWith('http'))
            url = `http://${obj[20]}:${obj[40]}` + url;
        return {
            name: String(rsp[40][7]),
            fid: String(rsp[40][6]),
            md5: rsp[40][100].toHex(),
            size: rsp[40][3],
            duration: rsp[40][4],
            url,
        };
    }
    /**
     * 获取离线文件下载地址
     * @param fid 文件id
     */
    async getFileUrl(fid) {
        return (await this.getFileInfo(fid)).url;
    }
    async sendMsg(content, source) {
        const { rich, brief } = await this._preprocess(content, source);
        const seq = this.c.sig.seq + 1;
        const rsp = await this._sendMsg({ 1: rich });
        if (rsp[1] !== 0) {
            this.c.logger.error(`failed to send: [Private: ${this.uin}] ${rsp[2]}(${rsp[1]})`);
            (0, errors_1.drop)(rsp[1], rsp[2]);
        }
        this.c.logger.info(`succeed to send: [Private(${this.uin})] ` + brief);
        const time = rsp[3];
        return { seq, time };
    }
}
exports.Friend = Friend;
//# sourceMappingURL=friend.js.map