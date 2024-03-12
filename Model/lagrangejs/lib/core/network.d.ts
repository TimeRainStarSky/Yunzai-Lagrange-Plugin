/// <reference types="node" />
import { Socket } from 'net';
/**
 * @event connect2
 * @event packet
 * @event lost
 */
export default class Network extends Socket {
    host: string;
    port: number;
    autoSearch: boolean;
    connected: boolean;
    private buf;
    constructor();
    join(cb?: () => void): void;
    private resolve;
}
export declare function fetchServerList(): Promise<{
    [ip: string]: number;
}>;
