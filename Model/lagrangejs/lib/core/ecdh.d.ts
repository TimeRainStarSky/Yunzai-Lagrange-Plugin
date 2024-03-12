/// <reference types="node" />
export default class Ecdh {
    private compress;
    private ecdh;
    publicKey: Buffer;
    shareKey: Buffer;
    constructor(type: 'wtlogin' | 'exchange', compress: boolean);
    exchange(bobPublic: Buffer): Buffer;
}
