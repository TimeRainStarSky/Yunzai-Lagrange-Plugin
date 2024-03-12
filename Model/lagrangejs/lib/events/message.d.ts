import { Sendable } from '../message/elements';
import { GroupMessage, PrivateMessage, TempMessage } from '../message/message';
import { pb } from '../core';
import { Client } from '..';
export interface MessageRet {
    seq: number;
    time: number;
}
export interface MessageEvent {
    /**
     * 快速回复
     * @param content
     * @param quote 引用这条消息(默认false)
     */
    reply(content: Sendable, quote?: boolean): Promise<MessageRet>;
}
export declare class PrivateMessageEvent extends PrivateMessage implements MessageEvent {
    #private;
    constructor(c: Client, pb: pb.Proto);
    /** 好友对象 */
    get friend(): import("../entities/friend").Friend;
    reply(content: Sendable, quote?: boolean): Promise<MessageRet>;
}
export declare class TempMessageEvent extends TempMessage implements MessageEvent {
    #private;
    constructor(c: Client, pb: pb.Proto);
    get group(): import("../entities/group").Group;
    reply(content: Sendable, quote?: boolean): Promise<MessageRet>;
}
export declare class GroupMessageEvent extends GroupMessage implements MessageEvent {
    #private;
    constructor(c: Client, pb: pb.Proto);
    /** 群对象 */
    get group(): import("../entities/group").Group;
    get member(): import("../entities/groupMember").GroupMember;
    recall(): Promise<boolean>;
    reply(content: Sendable, quote?: boolean): Promise<MessageRet>;
}
