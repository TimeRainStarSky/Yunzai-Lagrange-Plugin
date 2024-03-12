"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateTime = exports.randomString = exports.hide = exports.lock = exports.int32ip2str = exports.trace = exports.timestamp = exports.aesGcmDecrypt = exports.aesGcmEncrypt = exports.randomInt = exports.sha256 = exports.sha1 = exports.md5 = exports.pipeline = exports.gzip = exports.unzip = exports.NOOP = exports.BUF16 = exports.BUF4 = exports.BUF0 = exports.hexTemplate = void 0;
const crypto_1 = require("crypto");
const util_1 = require("util");
const zlib = __importStar(require("zlib"));
const stream = __importStar(require("stream"));
exports.hexTemplate = '1234567890abcdef';
/** 一个0长buf */
exports.BUF0 = Buffer.alloc(0);
/** 4个0的buf */
exports.BUF4 = Buffer.alloc(4);
/** 16个0的buf */
exports.BUF16 = Buffer.alloc(16);
/** no operation */
const NOOP = () => { };
exports.NOOP = NOOP;
/** promisified unzip */
exports.unzip = (0, util_1.promisify)(zlib.unzip);
/** promisified gzip */
exports.gzip = (0, util_1.promisify)(zlib.gzip);
/** promisified pipeline */
exports.pipeline = (0, util_1.promisify)(stream.pipeline);
/** md5 hash */
const md5 = (data) => (0, crypto_1.createHash)('md5').update(data).digest();
exports.md5 = md5;
/** sha1 hash */
const sha1 = (data) => (0, crypto_1.createHash)('sha1').update(data).digest();
exports.sha1 = sha1;
/** sha256 hash */
const sha256 = (data) => (0, crypto_1.createHash)('sha256').update(data).digest();
exports.sha256 = sha256;
const randomInt = (min = 0, max = 1) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.randomInt = randomInt;
const aesGcmEncrypt = (data, key) => {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', key, iv);
    const encrypted = cipher.update(data);
    const final = cipher.final();
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, encrypted, final, tag]);
};
exports.aesGcmEncrypt = aesGcmEncrypt;
const aesGcmDecrypt = (data, key) => {
    const iv = data.slice(0, 12);
    const tag = data.slice(-16);
    const cipher = data.slice(12, data.length - 16);
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const plain = decipher.update(cipher);
    const final = decipher.final();
    return Buffer.concat([plain, final]);
};
exports.aesGcmDecrypt = aesGcmDecrypt;
/** unix timestamp (second) */
const timestamp = () => Math.floor(Date.now() / 1000);
exports.timestamp = timestamp;
const trace = () => `00-${(0, exports.randomString)(32, exports.hexTemplate)}-${(0, exports.randomString)(16, exports.hexTemplate)}-01`;
exports.trace = trace;
/** 数字ip转通用ip */
function int32ip2str(ip) {
    if (typeof ip === 'string')
        return ip;
    ip = ip & 0xffffffff;
    return [ip & 0xff, (ip & 0xff00) >> 8, (ip & 0xff0000) >> 16, ((ip & 0xff000000) >> 24) & 0xff].join('.');
}
exports.int32ip2str = int32ip2str;
/** 隐藏并锁定一个属性 */
function lock(obj, prop) {
    Reflect.defineProperty(obj, prop, {
        configurable: false,
        enumerable: false,
        writable: false,
    });
}
exports.lock = lock;
/** 隐藏一个属性 */
function hide(obj, prop) {
    Reflect.defineProperty(obj, prop, {
        configurable: false,
        enumerable: false,
        writable: true,
    });
}
exports.hide = hide;
const randomString = (n, template) => {
    const len = template.length;
    return new Array(n)
        .fill(false)
        .map(() => template.charAt(Math.floor(Math.random() * len)))
        .join('');
};
exports.randomString = randomString;
function formatDateTime(t, format) {
    const year = t.getFullYear();
    const month = t.getMonth() + 1;
    const date = t.getDate();
    const hour = t.getHours();
    const min = t.getMinutes();
    const second = t.getSeconds();
    format = format
        .replace(/[y]+/g, String(year))
        .replace(/[M]+/g, String(month).padStart(2, '0'))
        .replace(/[d]+/g, String(date).padStart(2, '0'))
        .replace(/[h]+/g, String(date).padStart(2, '0'))
        .replace(/[h]+/g, String(hour).padStart(2, '0'))
        .replace(/[m]+/g, String(min).padStart(2, '0'))
        .replace(/[s]+/g, String(second).padStart(2, '0'));
    return format;
}
exports.formatDateTime = formatDateTime;
//# sourceMappingURL=constants.js.map