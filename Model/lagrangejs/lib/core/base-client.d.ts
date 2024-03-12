/// <reference types="node" />
/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { AppInfo, DeviceInfo, Platform } from './device';
import { LoginErrorCode } from '../errors';
declare const FN_NEXT_SEQ: unique symbol;
declare const FN_SEND: unique symbol;
declare const HANDLERS: unique symbol;
declare const NET: unique symbol;
declare const ECDH256: unique symbol;
declare const ECDH192: unique symbol;
declare const IS_ONLINE: unique symbol;
declare const LOGIN_LOCK: unique symbol;
declare const HEARTBEAT: unique symbol;
declare const SSO_HEARTBEAT: unique symbol;
export declare class ApiRejection {
    code: number;
    message: string;
    constructor(code: number, message?: string);
}
export declare enum LogLevel {
    Fatal = 0,
    Mark = 1,
    Error = 2,
    Warn = 3,
    Info = 4,
    Debug = 5
}
export declare enum QrcodeResult {
    Confirmed = 0,
    CodeExpired = 17,
    WaitingForScan = 48,
    WaitingForConfirm = 53,
    Canceled = 54
}
export interface BaseClient {
    /** 收到二维码 */
    on(name: 'internal.qrcode', listener: (this: this, qrcode: Buffer) => void): this;
    /** 收到滑动验证码 */
    on(name: 'internal.slider', listener: (this: this, url: string) => void): this;
    /** 登录保护验证 */
    on(name: 'internal.verify', listener: (this: this, url: string, phone: string) => void): this;
    /** token过期(此时已掉线) */
    on(name: 'internal.error.token', listener: (this: this) => void): this;
    /** 网络错误 */
    on(name: 'internal.error.network', listener: (this: this, code: number, message: string) => void): this;
    /** 密码登录相关错误 */
    on(name: 'internal.error.login', listener: (this: this, code: number, message: string) => void): this;
    /** 扫码登录相关错误 */
    on(name: 'internal.error.qrcode', listener: (this: this, code: QrcodeResult, message: string) => void): this;
    /** 登录成功 */
    on(name: 'internal.online', listener: (this: this, token: Buffer, nickname: string, gender: number, age: number) => void): this;
    /** token更新 */
    on(name: 'internal.token', listener: (this: this, token: string) => void): this;
    /** 服务器强制下线 */
    on(name: 'internal.kickoff', listener: (this: this, reason: string) => void): this;
    /** 业务包 */
    on(name: 'internal.sso', listener: (this: this, cmd: string, payload: Buffer, seq: number) => void): this;
    /** 日志信息 */
    on(name: 'internal.verbose', listener: (this: this, verbose: unknown, level: LogLevel) => void): this;
    on(name: string | symbol, listener: (this: this, ...args: any[]) => void): this;
}
export declare class BaseClient extends EventEmitter {
    readonly uin: number;
    private [IS_ONLINE];
    private [ECDH256];
    private [ECDH192];
    private readonly [NET];
    private readonly [HANDLERS];
    private [LOGIN_LOCK];
    private [HEARTBEAT];
    private [SSO_HEARTBEAT];
    readonly platform: Platform;
    readonly appInfo: AppInfo;
    readonly deviceInfo: DeviceInfo;
    readonly sig: {
        password: Buffer;
        seq: number;
        tgtgt: Buffer;
        tgt: Buffer;
        d2: Buffer;
        d2Key: Buffer;
        qrSig: Buffer;
        signApiAddr: string;
        exchangeKey: Buffer;
        keySig: Buffer;
        cookies: string;
        captchaUrl: string;
        aid: string;
        ticket: string;
        randStr: string;
        unusualSig: Buffer;
        tempPwd: Buffer;
    };
    protected interval: number;
    protected ssoInterval: number;
    protected readonly statistics: {
        start_time: number;
        lockTimes: number;
        recvPacketCount: number;
        sendPacketCount: number;
        lostPacketCount: number;
        recvMsgCount: number;
        sentMsgCount: number;
        msgCountPerMin: number;
        remoteIp: string;
        remotePort: number;
    };
    uid?: string;
    constructor(uin: number, device: DeviceInfo, uid?: string, p?: Platform);
    setRemoteServer(host?: string, port?: number): void;
    isOnline(): boolean;
    logout(keepalive?: boolean): Promise<void>;
    fetchQrcode(): Promise<void>;
    queryQrcodeResult(): Promise<{
        retcode: number;
        uin: undefined;
        t106: undefined;
        t16a: undefined;
        t318: undefined;
        tgtgt: undefined;
    } | {
        retcode: number;
        uin: undefined;
        t106: Buffer | undefined;
        t16a: Buffer | undefined;
        tgtgt: Buffer | undefined;
        t318?: undefined;
    }>;
    qrcodeLogin(): Promise<void>;
    keyExchange(): Promise<void>;
    tokenLogin(token: Buffer): Promise<LoginErrorCode>;
    passwordLogin(md5: Buffer): Promise<LoginErrorCode>;
    submitCaptcha(ticket: string, randStr: string): Promise<LoginErrorCode>;
    terminate(): void;
    private [FN_NEXT_SEQ];
    private [FN_SEND];
    writeUni(cmd: string, body: Uint8Array, seq?: number): Promise<void>;
    /** 发送一个业务包并等待返回 */
    sendUni(cmd: string, body: Uint8Array, timeout?: number): Promise<Buffer>;
}
export {};
