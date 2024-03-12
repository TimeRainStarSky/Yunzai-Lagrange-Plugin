/// <reference types="node" />
import { Forwardable, Quotable, Sendable } from './elements';
import { Parser } from './parser';
import * as pb from '../core/protobuf';
import { GroupRole } from '../common';
export declare function rand2uuid(rand: number): bigint;
export declare function uuid2rand(uuid: bigint): number;
export declare abstract class Message implements Quotable, Forwardable {
    protected proto: pb.Proto;
    protected readonly parsed: Parser;
    post_type: "message";
    message: Sendable;
    rand: number;
    seq: number;
    time: number;
    user_id: number;
    uid: string;
    font: string;
    raw_message: string;
    source?: Quotable;
    static deserialize(serialized: Buffer): PrivateMessage;
    protected constructor(proto: pb.Proto);
    toString(): string | Record<string, any>;
}
export declare class PrivateMessage extends Message {
    message_type: "private";
    sub_type: "friend" | "group" | "temp" | "self";
    /** 发送方账号 */
    from_id: number;
    /** 接收方账号 */
    to_id: number;
    /** 是否为自动回复 */
    auto_reply: boolean;
    /** 发送方信息 */
    sender: {
        /** 账号 */
        user_id: number;
        /** 昵称 */
        nickname: string;
    };
    constructor(proto: pb.Proto);
}
export declare class TempMessage extends Message {
    message_type: "private";
    sub_type: "friend" | "group" | "temp" | "self";
    group_id: number;
    group_name: string;
    /** 发送方账号 */
    from_id: number;
    /** 接收方账号 */
    to_id: number;
    /** 是否为自动回复 */
    auto_reply: boolean;
    /** 发送方信息 */
    sender: {
        /** 账号 */
        user_id: number;
        /** 昵称 */
        nickname: string;
        /** 群号，当消息来自群聊时有效 */
        group_id: number | undefined;
    };
    constructor(proto: pb.Proto);
}
export declare class GroupMessage extends Message {
    message_type: "group";
    sub_type: "friend" | "group" | "temp" | "self";
    group_id: number;
    group_name: string;
    atme: boolean;
    atall: boolean;
    /** 发送方信息 */
    sender: {
        /** 账号 */
        user_id: number;
        /** 昵称 */
        nickname: string;
        /** subId */
        sub_id: string;
        /** 名片 */
        card: string;
        /** 等级 */
        level: number;
        /** 权限 */
        role: GroupRole;
        /** 头衔 */
        title: string;
    };
    constructor(proto: pb.Proto);
}
/** 一条转发消息 */
export declare class ForwardMessage implements Forwardable {
    protected proto: pb.Proto;
    private parsed;
    /** 账号 */
    user_id: number;
    /** 昵称 */
    nickname: string;
    /** 若转自群聊，则表示群号 */
    group_id?: number;
    /** 发送时间 */
    time: number;
    /** 发送序号 */
    seq: number;
    /** 消息内容 */
    message: Sendable;
    raw_message: string;
    /** 反序列化一条转发消息 */
    static deserialize(serialized: Buffer): ForwardMessage;
    constructor(proto: pb.Proto);
    /** 将转发消息序列化保存 */
    serialize(): Buffer;
    /** 以适合人类阅读的形式输出 */
    toString(): string | Record<string, any>;
    /** @deprecated 转换为CQ码 */
    toCqcode(): string;
}
