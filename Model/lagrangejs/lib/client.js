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
exports.createClient = exports.Client = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const log4js = __importStar(require("log4js"));
const pb = __importStar(require("./core/protobuf"));
const core_1 = require("./core");
const constants_1 = require("./core/constants");
const listener_1 = require("./internal/listener");
const friend_1 = require("./entities/friend");
const group_1 = require("./entities/group");
const groupMember_1 = require("./entities/groupMember");
const errors_1 = require("./errors");
class Client extends core_1.BaseClient {
    get cacheDir() {
        const dir = path.resolve(this.directory, '../image');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        return dir;
    }
    constructor(uin, conf) {
        const config = {
            logLevel: 'info',
            platform: core_1.Platform.Linux,
            autoServer: true,
            ignoreSelf: true,
            cacheMember: true,
            reConnInterval: 5,
            dataDirectory: path.join(process.cwd(), 'data'),
            ...conf,
        };
        const dir = createDataDir(config.dataDirectory, uin);
        const deviceFile = path.join(dir, `device-${uin}.json`);
        const tokenFile = path.join(dir, `token-${uin}.json`);
        let regenerate, device, token;
        try {
            device = require(deviceFile);
            regenerate = false;
        }
        catch {
            device = (0, core_1.generateDeviceInfo)(uin);
            regenerate = true;
            fs.writeFileSync(deviceFile, JSON.stringify(device, null, 4));
        }
        try {
            token = require(tokenFile);
        }
        catch {
            token = null;
        }
        super(uin, device, token?.Uid ?? '', config.platform);
        this.friendList = new Map();
        this.groupList = new Map();
        this.memberList = new Map();
        this.pickFriend = friend_1.Friend.from.bind(this);
        this.pickGroup = group_1.Group.from.bind(this);
        this.pickMember = groupMember_1.GroupMember.from.bind(this);
        this.sig.signApiAddr = config.signApiAddr || this.sig.signApiAddr;
        this.logger = log4js.getLogger(`[${this.deviceInfo.deviceName}:${uin}]`);
        this.logger.level = config.logLevel;
        if (regenerate)
            this.logger.mark('创建了新的设备文件：' + deviceFile);
        this.directory = dir;
        this.config = config;
        this.token =
            token ??
                {
                    Uin: uin,
                    Uid: '',
                    PasswordMd5: '',
                    Session: {
                        TempPassword: '',
                    },
                };
        listener_1.bindInternalListeners.call(this);
        this.on('internal.verbose', (verbose, level) => {
            const list = ['fatal', 'mark', 'error', 'warn', 'info', 'trace'];
            this.logger[list[level]](verbose);
        });
        if (!this.config.autoServer)
            this.setRemoteServer('msfwifi.3g.qq.com', 8080);
    }
    /** emit an event */
    em(name = '', data) {
        data = Object.defineProperty(data || {}, 'self_id', {
            value: this.uin,
            writable: true,
            enumerable: true,
            configurable: true,
        });
        while (true) {
            this.emit(name, data);
            const i = name.lastIndexOf('.');
            if (i === -1)
                break;
            name = name.slice(0, i);
        }
    }
    async login(password) {
        if (password && password.length > 0) {
            let md5pass;
            if (typeof password === 'string')
                md5pass = Buffer.from(password, 'hex');
            else
                md5pass = password;
            if (md5pass.length !== 16)
                md5pass = (0, constants_1.md5)(String(password));
            this.token.PasswordMd5 = md5pass.toString('hex');
        }
        if (this.token.Session.TempPassword)
            try {
                const code = await this.tokenLogin(Buffer.from(this.token.Session.TempPassword, 'base64')); // EasyLogin
                if (!code)
                    return code;
            }
            catch (e) {
                /* empty */
            }
        if (this.token.PasswordMd5 && this.token.Uid) {
            // 检测Uid的目的是确保之前登陆过
            return await this.passwordLogin(Buffer.from(this.token.PasswordMd5, 'hex'));
        }
        else {
            return await (this.sig.qrSig.length ? this.qrcodeLogin() : this.fetchQrcode());
        }
        return errors_1.LoginErrorCode.UnusualVerify;
    }
    async fetchClientKey() {
        const response = await this.sendOidbSvcTrpcTcp(0x102a, 1, new Uint8Array(), false);
        const packet = pb.decode(response);
        return packet[4][3].toString();
    }
    async fetchCookies(domains) {
        const proto = pb.encode({ 1: domains });
        const response = await this.sendOidbSvcTrpcTcp(0x102a, 0, proto, false);
        const packet = pb.decode(response);
        const cookies = [];
        for (let cookie of packet[1])
            cookies.push(cookie[2].toString());
        return cookies;
    }
    async fetchHighwayTicket() {
        const body = pb.encode({
            1281: {
                1: this.uin,
                2: 0,
                3: 16,
                4: 1,
                6: 3,
                7: 5,
            },
        });
        const payload = await this.sendUni('HttpConn.0x6ff_501', body);
        const rsp = pb.decode(payload)[1281];
        return rsp[1].toBuffer();
    }
    sendOidbSvcTrpcTcp(cmd, subCmd, buffer, isUid = false, isAfter = false) {
        const command = `OidbSvcTrpcTcp.0x${cmd.toString(16)}_${subCmd}`;
        const result = pb.encode({
            1: cmd,
            2: subCmd,
            4: buffer,
            7: isAfter
                ? {
                    1: 0,
                    2: [],
                    3: this.appInfo.subAppId,
                }
                : null,
            12: isUid,
        });
        return this.sendUni(command, result);
    }
}
exports.Client = Client;
function createDataDir(dir, uin) {
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { mode: 0o755, recursive: true });
    const imgPath = path.join(dir, 'image');
    const uinPath = path.join(dir, String(uin));
    if (!fs.existsSync(imgPath))
        fs.mkdirSync(imgPath);
    if (!fs.existsSync(uinPath))
        fs.mkdirSync(uinPath, { mode: 0o755 });
    return uinPath;
}
function createClient(uin, config) {
    if (isNaN(Number(uin)))
        throw new Error(uin + ' is not an QQ account');
    return new Client(Number(uin), config);
}
exports.createClient = createClient;
//# sourceMappingURL=client.js.map