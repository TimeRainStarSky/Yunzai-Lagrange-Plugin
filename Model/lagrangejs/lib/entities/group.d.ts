import { Contactable } from './contactable';
import { Client } from '..';
import { Quotable, RecordElem, Sendable } from '../message/elements';
import { MessageRet } from '../events/message';
import { GroupMember } from './groupMember';
import { FileSystem } from './fileSystem';
export declare class Group extends Contactable {
    readonly gid: number;
    fileSystem: FileSystem;
    get avatar(): string;
    static as(this: Client, gid: number): Group;
    static from(this: Client, gid: number, strict?: boolean): Group;
    pickMember: (uid: number, strict?: boolean | undefined) => GroupMember;
    fetchMembers: () => Promise<void>;
    get group_id(): number;
    protected constructor(c: Client, gid: number);
    sendMsg(content: Sendable, source?: Quotable): Promise<MessageRet>;
    recallMsg(seq: number): Promise<boolean>;
    rename(targetName: string): Promise<boolean>;
    /**
     * 上传语音
     * @param elem
     */
    uploadRecord(elem: RecordElem): Promise<void>;
    /**
     * 解析语音内容
     */
    downloadRecord(): Promise<void>;
    remark(targetRemark: string): Promise<boolean>;
    mute(isEnable: boolean): Promise<boolean>;
    /**
     * 邀请好友加群 (须添加机器人为好友)
     * @param user_ids
     */
    invite(...user_ids: number[]): Promise<boolean>;
    quit(): Promise<boolean>;
    transfer(user_id: number): Promise<boolean>;
}
export declare namespace Group {
    function fetchMember(this: Client, gid: number): Promise<void>;
}
export declare namespace Group {
    interface Info {
        group_id: number;
        group_name: string;
        member_count: number;
        max_member_count: number;
        owner_id: number;
        admin_flag: boolean;
        last_join_time: number;
        last_sent_time?: number;
        shutup_time_whole: number;
        shutup_time_me: number;
        create_time?: number;
        grade?: number;
        max_admin_count?: number;
        active_member_count?: number;
        update_time: number;
    }
    enum Permission {
        member = 0,
        owner = 1,
        admin = 2
    }
}
