"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = exports.parseImageFileParam = exports.buildImageFileParam = exports.EXT = void 0;
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const probe_image_size_1 = __importDefault(require("probe-image-size"));
const axios_1 = __importDefault(require("axios"));
const common_1 = require("../common");
const TYPE = {
    jpg: 1000,
    png: 1001,
    webp: 1002,
    bmp: 1005,
    gif: 2000,
    face: 4,
};
exports.EXT = {
    3: 'png',
    4: 'face',
    1000: 'jpg',
    1001: 'png',
    1002: 'webp',
    1003: 'jpg',
    1005: 'bmp',
    2000: 'gif',
    2001: 'png',
};
/** 构造图片file */
function buildImageFileParam(md5, size, width, height, type) {
    size = size || 0;
    width = width || 0;
    height = height || 0;
    const ext = exports.EXT[type] || 'jpg';
    return md5 + size + '-' + width + '-' + height + '.' + ext;
}
exports.buildImageFileParam = buildImageFileParam;
/** 从图片的file中解析出图片属性参数 */
function parseImageFileParam(file) {
    let md5, sha1, size, width, height, ext;
    let sp = file.split('-');
    md5 = sp[0].slice(0, 32);
    sha1 = sp[1].slice(0, 40);
    size = Number(sp[0].slice(32)) || 0;
    width = Number(sp[2]) || 0;
    height = parseInt(sp[3]) || 0;
    sp = file.split('.');
    ext = sp[1] || 'jpg';
    return { md5, sha1, size, width, height, ext };
}
exports.parseImageFileParam = parseImageFileParam;
class Image {
    /** @param elem
     * @param cachedir
     @param dm 是否私聊图片 */
    constructor(elem, dm = false, cachedir) {
        this.dm = dm;
        this.cachedir = cachedir;
        /** 最终用于发送的对象 */
        this.proto = {};
        /** 图片属性 */
        this.md5 = (0, crypto_1.randomBytes)(16);
        this.sha1 = (0, crypto_1.randomBytes)(20);
        this.size = 0xffff;
        this.width = 320;
        this.height = 240;
        this.type = 1000;
        const { file, cache, timeout, headers, asface, origin } = elem;
        this.origin = origin;
        this.asface = asface;
        if (file instanceof Buffer) {
            this.task = this.fromProbeSync(file);
        }
        else if (file instanceof stream_1.Readable) {
            this.task = this.fromReadable(file);
        }
        else if (typeof file !== 'string') {
            throw new Error('bad file param: ' + file);
        }
        else if (file.startsWith('base64://')) {
            this.task = this.fromProbeSync(Buffer.from(file.slice(9), 'base64'));
        }
        else if (file.startsWith('http://') || file.startsWith('https://')) {
            this.task = this.fromWeb(file, cache, headers, timeout);
        }
        else {
            this.task = this.fromLocal(file);
        }
    }
    setProperties(dimensions) {
        if (!dimensions)
            throw new Error('bad image file');
        this.width = dimensions.width;
        this.height = dimensions.height;
        this.type = TYPE[dimensions.type] || 1000;
    }
    parseFileParam(file) {
        const { md5, sha1, size, width, height, ext } = parseImageFileParam(file);
        const md5Buf = Buffer.from(md5, 'hex');
        const sha1Buf = Buffer.from(sha1, 'hex');
        if (md5Buf.length !== 16 || sha1Buf.length !== 20)
            throw new Error('bad file param: ' + file);
        this.md5 = md5Buf;
        this.sha1 = sha1Buf;
        size > 0 && (this.size = size);
        this.width = width;
        this.height = height;
        TYPE[ext] & (this.type = TYPE[ext]);
    }
    async fromProbeSync(buf) {
        const dimensions = probe_image_size_1.default.sync(buf);
        this.setProperties(dimensions);
        this.md5 = (0, common_1.md5)(buf);
        this.sha1 = (0, common_1.sha1)(buf);
        this.size = buf.length;
        this.readable = stream_1.Readable.from(buf, { objectMode: false });
    }
    async fromReadable(readable, timeout) {
        let id;
        try {
            readable = readable.pipe(new common_1.DownloadTransform());
            timeout = timeout > 0 ? timeout : 60;
            this.tmpfile = path_1.default.join(common_1.TMP_DIR, (0, common_1.uuid)());
            id = setTimeout(() => {
                readable.destroy();
            }, timeout * 1000);
            const [dimensions, md5, sha1] = await Promise.all([
                (0, probe_image_size_1.default)(readable, true),
                (0, common_1.md5Stream)(readable),
                (0, common_1.sha1Stream)(readable),
                (0, common_1.pipeline)(readable, fs_1.default.createWriteStream(this.tmpfile)),
            ]);
            this.setProperties(dimensions);
            this.md5 = md5;
            this.sha1 = sha1;
            this.size = (await fs_1.default.promises.stat(this.tmpfile)).size;
            this.readable = fs_1.default.createReadStream(this.tmpfile, { highWaterMark: 1024 * 256 });
        }
        catch (e) {
            this.deleteTmpFile();
            throw e;
        }
        finally {
            clearTimeout(id);
        }
    }
    async fromWeb(url, cache, headers, timeout) {
        if (this.cachedir) {
            this.cachefile = path_1.default.join(this.cachedir, (0, common_1.md5)(url).toString('hex'));
            if (cache) {
                try {
                    this.parseFileParam(await fs_1.default.promises.readFile(this.cachefile, 'utf8'));
                    return;
                }
                catch { }
            }
        }
        const readable = (await axios_1.default.get(url, {
            headers,
            responseType: 'stream',
        })).data;
        await this.fromReadable(readable, timeout);
        this.cachefile &&
            fs_1.default.writeFile(this.cachefile, buildImageFileParam(this.md5.toString('hex'), this.size, this.width, this.height, this.type), common_1.NOOP);
    }
    async fromLocal(file) {
        try {
            //收到的图片
            this.parseFileParam(file);
        }
        catch {
            //本地图片
            file.startsWith('file://') && (file = file.slice(7).replace(/%20/g, ' '));
            common_1.IS_WIN && file.startsWith('/') && (file = file.slice(1));
            const stat = await fs_1.default.promises.stat(file);
            if (stat.size <= 0 || stat.size > common_1.MAX_UPLOAD_SIZE)
                throw new Error('bad file size: ' + stat.size);
            const readable = fs_1.default.createReadStream(file);
            const [dimensions, md5, sha1] = await Promise.all([
                // @ts-ignore
                (0, probe_image_size_1.default)(readable, true),
                (0, common_1.md5Stream)(readable),
                (0, common_1.sha1Stream)(readable),
            ]);
            readable.destroy();
            this.setProperties(dimensions);
            this.md5 = md5;
            this.sha1 = sha1;
            this.size = stat.size;
            this.readable = fs_1.default.createReadStream(file, { highWaterMark: 1024 * 256 });
        }
    }
    /** 服务端图片失效时建议调用此函数 */
    deleteCacheFile() {
        this.cachefile && fs_1.default.unlink(this.cachefile, common_1.NOOP);
    }
    /** 图片上传完成后建议调用此函数(文件存在系统临时目录中) */
    deleteTmpFile() {
        this.tmpfile && fs_1.default.unlink(this.tmpfile, common_1.NOOP);
        this.readable?.destroy();
    }
}
exports.Image = Image;
//# sourceMappingURL=image.js.map