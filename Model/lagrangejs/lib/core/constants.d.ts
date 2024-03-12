/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { BinaryLike } from 'crypto';
import * as zlib from 'zlib';
import * as stream from 'stream';
export declare const hexTemplate: string;
/** 一个0长buf */
export declare const BUF0: Buffer;
/** 4个0的buf */
export declare const BUF4: Buffer;
/** 16个0的buf */
export declare const BUF16: Buffer;
/** no operation */
export declare const NOOP: () => void;
/** promisified unzip */
export declare const unzip: typeof zlib.unzip.__promisify__;
/** promisified gzip */
export declare const gzip: typeof zlib.gzip.__promisify__;
/** promisified pipeline */
export declare const pipeline: typeof stream.pipeline.__promisify__;
/** md5 hash */
export declare const md5: (data: BinaryLike) => Buffer;
/** sha1 hash */
export declare const sha1: (data: BinaryLike) => Buffer;
/** sha256 hash */
export declare const sha256: (data: BinaryLike) => Buffer;
export declare const randomInt: (min?: number, max?: number) => number;
export declare const aesGcmEncrypt: (data: BinaryLike, key: BinaryLike) => Buffer;
export declare const aesGcmDecrypt: (data: Buffer, key: BinaryLike) => Buffer;
/** unix timestamp (second) */
export declare const timestamp: () => number;
export declare const trace: () => string;
/** 数字ip转通用ip */
export declare function int32ip2str(ip: number | string): string;
/** 隐藏并锁定一个属性 */
export declare function lock(obj: any, prop: string): void;
/** 隐藏一个属性 */
export declare function hide(obj: any, prop: string): void;
export declare const randomString: (n: number, template: string) => string;
export declare function formatDateTime(t: Date, format: string): string;
