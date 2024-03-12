/// <reference types="node" />
import { BaseClient } from './base-client';
export interface SignResult {
    sign: string;
    extra: string;
    token: string;
}
export declare const signWhiteList: string[];
export declare function getSign(this: BaseClient, cmd: string, seq: number, src: Buffer): Promise<SignResult | null>;
