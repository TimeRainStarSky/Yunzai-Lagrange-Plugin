import { Client } from '..';
import { pb } from '../core';
export interface NoticeEvent {
    operator?: number;
}
export declare class GroupMemberIncreaseEvent implements NoticeEvent {
    constructor(c: Client, pb: pb.Proto);
}
export declare class GroupAdminChangeNotice implements NoticeEvent {
    admin: boolean;
    operator?: number;
    user_id?: number;
    uid: string;
    constructor(c: Client, pb: pb.Proto);
}
