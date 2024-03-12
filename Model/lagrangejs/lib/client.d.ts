/// <reference types="node" />
import { BaseClient, Platform } from './core';
import { EventMap } from './events';
import { Friend } from './entities/friend';
import { Group } from './entities/group';
import { GroupMember } from './entities/groupMember';
import { LoginErrorCode } from './errors';
export interface Client extends BaseClient {
    on<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    on<S extends string | symbol>(event: S & Exclude<S, keyof EventMap>, listener: (this: this, ...args: any[]) => void): this;
    once<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    once<S extends string | symbol>(event: S & Exclude<S, keyof EventMap>, listener: (this: this, ...args: any[]) => void): this;
    prependListener<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    prependListener(event: string | symbol, listener: (this: this, ...args: any[]) => void): this;
    prependOnceListener<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    prependOnceListener(event: string | symbol, listener: (this: this, ...args: any[]) => void): this;
    off<T extends keyof EventMap>(event: T, listener: EventMap<this>[T]): this;
    off<S extends string | symbol>(event: S & Exclude<S, keyof EventMap>, listener: (this: this, ...args: any[]) => void): this;
}
export declare class Client extends BaseClient {
    readonly logger: Logger;
    readonly directory: string;
    readonly config: Required<Config>;
    readonly token: SavedToken;
    readonly friendList: Map<number, Friend.Info>;
    readonly groupList: Map<number, Group.Info>;
    readonly memberList: Map<number, Map<number, GroupMember.Info>>;
    get cacheDir(): string;
    pickFriend: (uid: number, strict?: boolean | undefined) => Friend;
    pickGroup: (gid: number, strict?: boolean | undefined) => Group;
    pickMember: (gid: number, uid: number, strict?: boolean | undefined) => GroupMember;
    constructor(uin: number, conf?: Config);
    /** emit an event */
    em(name?: string, data?: any): void;
    login(password?: string | Buffer): Promise<void | LoginErrorCode>;
    fetchClientKey(): Promise<any>;
    fetchCookies(domains: string[]): Promise<string[]>;
    fetchHighwayTicket(): Promise<any>;
    sendOidbSvcTrpcTcp(cmd: number, subCmd: number, buffer: Uint8Array, isUid?: boolean, isAfter?: boolean): Promise<Buffer>;
}
export interface Logger {
    trace(msg: any, ...args: any[]): any;
    debug(msg: any, ...args: any[]): any;
    info(msg: any, ...args: any[]): any;
    warn(msg: any, ...args: any[]): any;
    error(msg: any, ...args: any[]): any;
    fatal(msg: any, ...args: any[]): any;
    mark(msg: any, ...args: any[]): any;
}
export interface Config {
    /** 日志等级，默认info (打印日志会降低性能，若消息量巨大建议修改此参数) */
    logLevel?: LogLevel;
    /** 1:Linux(Default) 2:MacOs 3:Windows*/
    platform?: Platform;
    /** 群聊和频道中过滤自己的消息(默认true) */
    ignoreSelf?: boolean;
    cacheMember?: boolean;
    /** 数据存储文件夹，需要可写权限，默认主模块下的data文件夹 */
    dataDirectory?: string;
    /**
     * 触发system.offline.network事件后的重新登录间隔秒数，默认5(秒)，不建议设置过低
     * 设置为0则不会自动重连，然后你可以监听此事件自己处理
     */
    reConnInterval?: number;
    /** 自动选择最优服务器(默认true)，关闭后会一直使用`msfwifi.3g.qq.com:8080`进行连接 */
    autoServer?: boolean;
    /** 签名API地址 */
    signApiAddr?: string;
}
export interface SavedToken {
    Uin: number;
    Uid: string;
    PasswordMd5: string;
    Session: {
        TempPassword: string;
    };
}
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'mark' | 'off';
export type Statistics = Client['statistics'];
export declare function createClient(uin: number, config?: Config): Client;
