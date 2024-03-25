/// <reference types="node" />
/// <reference types="node" />
import { Readable } from 'stream';
import { ImageElem } from './elements';
import * as pb from '../core/protobuf';
export declare const EXT: {
    [type: number]: string;
};
/** 构造图片file */
export declare function buildImageFileParam(md5: string, size?: number, width?: number, height?: number, type?: number): string;
/** 从图片的file中解析出图片属性参数 */
export declare function parseImageFileParam(file: string): {
    md5: string;
    sha1: string;
    size: number;
    width: number;
    height: number;
    ext: string;
};
export declare class Image {
    private dm;
    private cachedir?;
    /** 最终用于发送的对象 */
    proto: {
        [tag: number]: any;
    };
    /** 用于上传的文件流 */
    readable?: Readable;
    /** 实例化后必须等待此异步任务完成后才能上传图片 */
    task: Promise<void>;
    /** 图片属性 */
    md5: Buffer;
    sha1: Buffer;
    size: number;
    width: number;
    height: number;
    type: number;
    origin?: boolean;
    private asface?;
    compatElems?: pb.Proto;
    commonElems?: pb.Proto;
    /** 缓存文件路径 */
    private cachefile?;
    /** 临时文件路径 */
    private tmpfile?;
    /** @param elem
     * @param cachedir
     @param dm 是否私聊图片 */
    constructor(elem: ImageElem, dm?: boolean, cachedir?: string | undefined);
    private setProperties;
    private parseFileParam;
    private fromProbeSync;
    private fromReadable;
    private fromWeb;
    private fromLocal;
    /** 服务端图片失效时建议调用此函数 */
    deleteCacheFile(): void;
    /** 图片上传完成后建议调用此函数(文件存在系统临时目录中) */
    deleteTmpFile(): void;
}
