import { User } from './user';
import { FileElem, Quotable, Sendable } from '../message/elements';
import { MessageRet } from '../events/message';
import { Client } from '..';
export declare class Friend extends User {
    protected constructor(c: Client, uin: number);
    static from(this: Client, uid: number, strict?: boolean): Friend;
    /**
     * 获取文件信息
     * @param fid 文件id
     * @param hash 文件hash
     */
    getFileInfo(fid: string, hash?: string): Promise<Omit<FileElem, "type"> & Record<"url", string>>;
    /**
     * 获取离线文件下载地址
     * @param fid 文件id
     */
    getFileUrl(fid: string): Promise<string>;
    sendMsg(content: Sendable, source?: Quotable): Promise<MessageRet>;
}
export declare namespace Friend {
    interface Info extends User.Info {
        remark: string;
        class_id: number;
    }
}
