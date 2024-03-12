import { User } from './user';
import { Client } from '..';
import { Quotable, Sendable } from '../message/elements';
import { MessageRet } from '../events/message';
import { Group } from './group';
export declare class GroupMember extends User {
    readonly gid: number;
    protected constructor(c: Client, gid: number, uin: number);
    get isFriend(): boolean;
    static from(this: Client, gid: number, uid: number, strict?: boolean): GroupMember;
    mute(duration: number): Promise<boolean>;
    kick(rejectAddition: boolean): Promise<boolean>;
    setAdmin(isAdmin?: boolean): Promise<boolean>;
    /**
     * 设为群主
     */
    setOwner(): Promise<boolean>;
    sendMsg(content: Sendable, source?: Quotable): Promise<MessageRet>;
    renameGroupMember(targetName: string): Promise<boolean>;
    addFriend(): void;
}
export declare namespace GroupMember {
    interface Info extends User.Info {
        group_id: number;
        permission: Group.Permission;
        level: number;
        card?: string;
        join_time: number;
        last_sent_time: number;
    }
}
