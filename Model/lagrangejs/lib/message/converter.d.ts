import * as pb from '../core/protobuf';
import { Image } from './image';
import { Quotable, Sendable } from './elements';
import { Contactable } from '../entities/contactable';
export interface ConverterExt {
    /** 是否是私聊(default:false) */
    dm?: boolean;
    /** 网络图片缓存路径 */
    cachedir?: string;
    /** 群员列表(用于AT时查询card) */
    mlist?: Map<number, {
        card?: string;
        nickname?: string;
    }>;
}
export declare class Converter {
    #private;
    private content;
    private fake?;
    is_chain: boolean;
    imgs: Image[];
    elems: pb.Encodable[];
    /** 用于最终发送 */
    rich: pb.Encodable;
    /** 长度(字符) */
    length: number;
    /** 预览文字 */
    brief: string;
    constructor(content: Sendable, fake?: boolean | undefined);
    convert(contactable: Contactable): Promise<this>;
    private _convert;
    private _text;
    private text;
    /** 引用回复 */
    quote(source: Quotable, contactable: Contactable): Promise<void>;
    private at;
    private face;
    private forward;
    private sface;
    private bface;
    private image;
    private reply;
    private record;
    private video;
    private json;
    private xml;
    private file;
    private markdown;
    private keyboard;
    private raw;
}
