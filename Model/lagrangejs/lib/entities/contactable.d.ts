import { Client } from '../client';
import { Forwardable, ImageElem, JsonElem, Quotable, Sendable } from '../message/elements';
import { Converter } from '../message/converter';
import * as pb from '../core/protobuf/index';
import { Image } from '../message/image';
import { ForwardMessage } from '../message/message';
export declare abstract class Contactable {
    readonly c: Client;
    uin?: number;
    uid?: string;
    gid?: number;
    info?: any;
    get target(): number;
    get dm(): boolean;
    protected constructor(c: Client);
    private _getRouting;
    protected _preprocess(content: Sendable, source?: Quotable): Promise<Converter>;
    /**
     * 制作一条合并转发消息以备发送（制作一次可以到处发）
     * 需要注意的是，好友图片和群图片的内部格式不一样，对着群制作的转发消息中的图片，发给好友可能会裂图，反过来也一样
     * 支持4层套娃转发（PC仅显示3层）
     */
    makeForwardMsg(msglist: Forwardable[] | Forwardable): Promise<JsonElem>;
    /** 下载并解析合并转发 */
    getForwardMsg(resid: string, fileName?: string): Promise<ForwardMessage[]>;
    /** 上传一批图片以备发送(无数量限制)，理论上传一次所有群和好友都能发 */
    uploadImages(imgs: Image[] | ImageElem[]): Promise<PromiseRejectedResult[]>;
    private _uploadImage;
    _uploadLongMsg(elems: pb.Encodable | pb.Encodable[]): Promise<string>;
    /** 上传合并转发 */
    private _uploadMultiMsg;
    /** 下载合并转发 */
    private _downloadMultiMsg;
    private _requestUploadGroupImage;
    private _requestUploadPrivateImage;
    private _requestUploadImage;
    /**
     * 发送消息
     * @param proto3 {pb.Encodable}
     * @param file {boolean}
     * @protected
     */
    protected _sendMsg(proto3: pb.Encodable, file?: boolean): Promise<pb.Proto>;
}
