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
exports.bindInternalListeners = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pb = __importStar(require("../core/protobuf"));
const pngjs_1 = require("pngjs");
const msgpush_1 = require("./msgpush");
const internal_1 = require("./internal");
const group_1 = require("../entities/group");
const notice_1 = require("../events/notice");
async function msgPushListener(payload) {
    const proto = pb.decode(payload);
    this.logger.trace(`recv: MsgPush type: ${proto[1][2][1]}`);
    switch (proto[1][2][1]) {
        case 82: // group msg
            msgpush_1.handleGroupMsg.call(this, proto[1]);
            break;
        case 529: // private file
        case 208: // private record
        case 166: // friend msg
            msgpush_1.handlePrivateMsg.call(this, proto[1]);
            break;
        case 141:
            msgpush_1.handleTempMsg.call(this, proto[1]);
        case 84: // group request join notice
        case 525: // group request invite notice
            if (proto[1][3]?.[2])
                break;
        case 87: // group invite notice
            if (proto[1][3]?.[2]) {
                break;
            }
        case 44: // group admin change
            if (proto[1][3]?.[2]) {
                const event = new notice_1.GroupAdminChangeNotice(this, proto[1][3][2]);
                this.em('notice.group.admin_change', event);
                break;
            }
        case 33: // group member increase
        case 34: // group member decrease
        case 0x210: // friend request
            if (proto[1][2][2] !== 226)
                break;
        case 0x2dc:
            if (proto[1][2][2] === 17) {
                // group recall
            }
            else if (proto[1][2][2] === 12) {
                // group mute
            }
    }
}
async function kickListener(payload) {
    const proto = pb.decode(payload);
    const msg = proto[4] ? `[${proto[4]}]${proto[3]}` : `[${proto[1]}]${proto[2]}`;
    this.emit(Symbol('EVENT_KICKOFF'), msg);
}
async function syncPushListener(payload) {
    this.emit('internal.infoPush', pb.decode(payload));
}
const events = {
    'trpc.msg.olpush.OlPushService.MsgPush': msgPushListener,
    'trpc.qq_new_tech.status_svc.StatusService.KickNT': kickListener,
    'trpc.msg.register_proxy.RegisterProxy.InfoSyncPush': syncPushListener,
};
/** 事件总线, 在这里捕获奇怪的错误 */
async function eventsListener(cmd, payload, seq) {
    try {
        await Reflect.get(events, cmd)?.call(this, payload, seq);
    }
    catch (e) {
        this.logger.trace(e);
    }
}
function logQrcode(img) {
    const png = pngjs_1.PNG.sync.read(img);
    const color_reset = '\x1b[0m';
    const color_fg_blk = '\x1b[30m';
    const color_bg_blk = '\x1b[40m';
    const color_fg_wht = '\x1b[37m';
    const color_bg_wht = '\x1b[47m';
    for (let i = 36; i < png.height * 4 - 36; i += 24) {
        let line = '';
        for (let j = 36; j < png.width * 4 - 36; j += 12) {
            const r0 = png.data[i * png.width + j];
            const r1 = png.data[i * png.width + j + png.width * 4 * 3];
            const bgcolor = r0 == 255 ? color_bg_wht : color_bg_blk;
            const fgcolor = r1 == 255 ? color_fg_wht : color_fg_blk;
            line += `${fgcolor + bgcolor}\u2584`;
        }
        console.log(line + color_reset);
    }
    console.log(`${color_fg_blk + color_bg_wht}       请使用 手机QQ 扫描二维码        ${color_reset}`);
    console.log(`${color_fg_blk + color_bg_wht}                                       ${color_reset}`);
}
async function onlineListener(token, nickname, gender, age) {
    this.logger.mark(`Welcome, ${nickname} ! 正在加载资源...`);
    await internal_1.loadFriendList.call(this); // 好友列表
    await internal_1.loadGroupList.call(this); // 群列表
    if (this.config.cacheMember) {
        for (const [gid] of this.groupList) {
            await group_1.Group.fetchMember.call(this, gid);
        }
    }
    this.logger.mark(`加载了${this.friendList.size}个好友，${this.groupList.size}个群`);
    this.em('system.online');
}
function qrcodeListener(image) {
    const file = path.join(this.directory, 'qrcode.png');
    fs.writeFile(file, image, () => {
        try {
            logQrcode(image);
        }
        catch { }
        this.logger.mark('二维码图片已保存到：' + file);
        this.em('system.login.qrcode', { image });
    });
}
function sliderListener(url) {
    this.logger.mark('收到滑动验证码，请访问以下地址完成滑动，并从网络响应中取出ticket和randStr输入：' + url);
    this.em('system.login.slider', { url });
}
function tokenUpdatedListener(token) {
    fs.writeFileSync(path.join(this.directory, `token-${this.uin}.json`), token);
}
function kickoffListener(message) {
    this.logger.warn(message);
    this.terminate();
    this.em('system.offline.kickoff', { message });
}
function loginErrorListener(code, message) {
    if (code > 0) {
        this.logger.error(message);
        this.em('system.login.error', { code, message });
    }
}
function bindInternalListeners() {
    this.on('internal.online', onlineListener);
    this.on('internal.kickoff', kickoffListener);
    this.on('internal.token', tokenUpdatedListener);
    this.on('internal.qrcode', qrcodeListener);
    this.on('internal.slider', sliderListener);
    this.on('internal.sso', eventsListener);
    this.on('internal.error.login', loginErrorListener);
}
exports.bindInternalListeners = bindInternalListeners;
//# sourceMappingURL=listener.js.map