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
exports.User = void 0;
const contactable_1 = require("./contactable");
const constants_1 = require("../core/constants");
const pb = __importStar(require("../core/protobuf"));
class User extends contactable_1.Contactable {
    get user_id() {
        return this.uin;
    }
    get avatar() {
        return `https://q1.qlogo.cn/g?b=qq&nk=${this.uin}&s=640`;
    }
    constructor(c, uin) {
        super(c);
        this.uin = uin;
        (0, constants_1.lock)(this, 'uin');
    }
    /** 返回作为好友的实例 */
    asFriend() {
        return this.c.pickFriend(this.uin);
    }
    /** 返回作为某群群员的实例 */
    asMember(gid) {
        return this.c.pickMember(gid, this.uin);
    }
    async sendLike(times = 1) {
        const request = pb.encode({
            11: this.uid,
            12: 71,
            13: Math.min(times, 10),
        });
        const response = await this.c.sendOidbSvcTrpcTcp(0x7e5, 104, request);
        const packet = pb.decode(response);
        return { code: packet[3], msg: packet[5].toString() };
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map