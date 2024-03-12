import { Contactable } from './contactable';
import { Client } from '..';
export declare class User extends Contactable {
    readonly uin: number;
    get user_id(): number;
    get avatar(): string;
    protected constructor(c: Client, uin: number);
    /** 返回作为好友的实例 */
    asFriend(): import("./friend").Friend;
    /** 返回作为某群群员的实例 */
    asMember(gid: number): import("./groupMember").GroupMember;
    sendLike(times?: number): Promise<{
        code: any;
        msg: any;
    }>;
}
export declare namespace User {
    interface Info {
        user_id: number;
        uid: string;
        nickname: string;
    }
}
