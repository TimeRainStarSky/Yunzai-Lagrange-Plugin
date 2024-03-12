/// <reference types="node" />
type BaseClient = import('./base-client').BaseClient;
export declare function getPacker(c: BaseClient): (tag: number, qrCode?: boolean | undefined, ...args: any[]) => Buffer;
export declare function getRawTlv(c: BaseClient, tag: number, qrCode?: boolean, ...args: any[]): Buffer;
export {};
