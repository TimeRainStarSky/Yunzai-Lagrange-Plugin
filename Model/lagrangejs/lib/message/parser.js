"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupImageUrl = exports.Parser = exports.parse = void 0;
const zlib_1 = require("zlib");
const core_1 = require("../core");
const face_1 = require("./face");
const image_1 = require("./image");
/** 解析消息 */
function parse(rich, uin) {
    return new Parser(rich, uin);
}
exports.parse = parse;
/** 消息解析器 */
class Parser {
    constructor(rich, uin) {
        this.uin = uin;
        this.message = [];
        this.brief = '';
        this.content = '';
        this.atme = false;
        this.atall = false;
        this.imagePrefix = '';
        this.exclusive = false;
        if (Array.isArray(rich)) {
            this.parseElems(rich);
        }
        else {
            if (rich[4]) {
                this.parseExclusiveElem(0, rich[4]);
            }
            this.parseElems(Array.isArray(rich[2]) ? rich[2] : [rich[2]]);
        }
    }
    /** 获取下一个节点的文本 */
    getNextText() {
        try {
            const elem = this.it?.next().value[1][1];
            return String(elem[1]);
        }
        catch {
            return '[未知]';
        }
    }
    /** 解析: xml, json, ptt, video, flash, file, shake */
    parseExclusiveElem(type, proto) {
        let elem;
        let brief;
        switch (type) {
            case 12: //xml
            case 51: //json
                const buf = proto[1].toBuffer();
                elem = {
                    type: type === 12 ? 'xml' : 'json',
                    data: String(buf[0] > 0 ? (0, zlib_1.unzipSync)(buf.slice(1)) : buf.slice(1)),
                    id: proto[2],
                };
                brief = elem.type + '消息';
                this.content = elem.data;
                break;
            case 0: //ptt
                elem = {
                    type: 'record',
                    file: 'protobuf://' + proto.toBase64(),
                    url: '',
                    md5: proto[4].toHex(),
                    size: proto[6] || 0,
                    seconds: proto[19] || 0,
                };
                if (proto[20]) {
                    const url = String(proto[20]);
                    elem.url = url.startsWith('http') ? url : 'https://grouptalk.c2c.qq.com' + url;
                }
                brief = '语音';
                this.content = `{ptt:${elem.url}}`;
                break;
            case 19: //video
                elem = {
                    type: 'video',
                    file: 'protobuf://' + proto.toBase64(),
                    name: proto[3]?.toString() || '',
                    fid: String(proto[1]),
                    md5: proto[2].toBase64(),
                    size: proto[6] || 0,
                    seconds: proto[5] || 0,
                };
                brief = '视频';
                this.content = `{video:${elem.fid}}`;
                break;
            case 5: //transElem
                const trans = core_1.pb.decode(proto[2].toBuffer().slice(3))[7][2];
                elem = {
                    type: 'file',
                    name: String(trans[4]),
                    fid: String(trans[2]).replace('/', ''),
                    md5: String(trans[8]),
                    size: trans[3],
                    duration: trans[5],
                };
                brief = '群文件';
                this.content = `{file:${elem.fid}}`;
                break;
            default:
                return;
        }
        this.message = [elem];
        this.brief = '[' + brief + ']';
        this.exclusive = true;
    }
    /** 解析: text, at, face, bface, sface, image, mirai */
    parsePartialElem(type, proto) {
        let elem;
        let brief = '';
        let content = '';
        switch (type) {
            case 1: //text&at
                brief = String(proto[1]);
                const buf = proto[3]?.toBuffer();
                if (buf && buf[1] === 1) {
                    elem = {
                        type: 'at',
                        qq: 0,
                        text: brief,
                    };
                    if (buf[6] === 1) {
                        elem.qq = 'all';
                        this.atall = true;
                    }
                    else {
                        elem.qq = buf.readUInt32BE(7);
                        if (elem.qq === this.uin)
                            this.atme = true;
                    }
                    brief = brief || '@' + elem.qq;
                    content = `{at:${elem.qq}}`;
                }
                else if (proto[12] && !proto[12][1]) {
                    // 频道中的AT
                    elem = {
                        type: 'at',
                        qq: 0,
                        text: brief,
                    };
                    elem.id = proto[12][5] ? String(proto[12][5]) : 'all';
                    brief = brief || '@' + elem.qq;
                    content = `{at:${elem.qq}}`;
                }
                else {
                    if (!brief)
                        return;
                    content = brief;
                    elem = {
                        type: 'text',
                        text: brief,
                    };
                }
                break;
            case 2: //face
                elem = {
                    type: 'face',
                    id: proto[1],
                    text: face_1.facemap[proto[1]] || '表情',
                };
                brief = `[${elem.text}]`;
                content = `{face:${elem.id}}`;
                break;
            case 33: //face(id>255)
                elem = {
                    type: 'face',
                    id: proto[1],
                    text: face_1.facemap[proto[1]],
                };
                if (!elem.text)
                    elem.text = proto[2] ? String(proto[2]) : '/' + elem.id;
                brief = `[${elem.text}]`;
                content = `{face:${elem.id}}`;
                break;
            case 6: //bface
                elem = {
                    type: 'bface',
                    file: proto[4].toHex() + proto[7].toHex() + proto[5],
                    text: brief.replace(/[[\]]/g, ''),
                };
                content = `{bface:${elem.text}}`;
                break;
            case 4:
            case 8:
                elem = this.parseImgElem(proto, 'image');
                brief = elem.asface ? '[动画表情]' : '[图片]';
                content = `{image:${elem.file.slice(0, 32).toUpperCase()}}`;
                break;
            case 34: //sface
                brief = this.getNextText();
                elem = {
                    type: 'sface',
                    id: proto[1],
                    text: brief.replace(/[[\]]/g, ''),
                };
                content = `{sface:${elem.id}}`;
                break;
            case 45:
                elem = {
                    type: 'markdown',
                    content: proto[1]?.toString(),
                };
                brief = content = `{markdown}`;
                break;
            case 46:
                try {
                    const rows = Array.isArray(proto[1][1]) ? proto[1][1] : [proto[1][1]];
                    elem = {
                        type: 'keyboard',
                        appid: Number(proto[1][2]) || 0,
                        rows: rows.map(row => {
                            row = Array.isArray(row[1]) ? row[1] : [row[1]];
                            const buttons = [];
                            for (let val of row) {
                                const button = {
                                    id: '',
                                    render_data: {},
                                    action: {
                                        permission: {},
                                    },
                                };
                                if (val[1])
                                    button.id = val[1]?.toString();
                                if (val[2]) {
                                    button.render_data.label = val[2][1]?.toString();
                                    button.render_data.visited_label = val[2][2]?.toString();
                                    button.render_data.style = Number(val[2][3]) || 0;
                                }
                                if (val[3]) {
                                    button.action.type = Number(val[3][1]) || 0;
                                    button.action.unsupport_tips = val[3][4]?.toString();
                                    button.action.data = val[3][5]?.toString();
                                    button.action.reply = val[3][7] === 1;
                                    button.action.enter = val[3][8] === 1;
                                    if (val[3][2]) {
                                        button.action.permission.type = Number(val[3][2][1]) || 0;
                                        button.action.permission.specify_role_ids = val[3][2][2] || [];
                                        button.action.permission.specify_user_ids = val[3][2][3] || [];
                                    }
                                }
                                buttons.push(button);
                            }
                            return buttons;
                        }),
                    };
                    brief = content = `{keyboard}`;
                }
                catch {
                    return;
                }
                break;
            default:
                const data = {};
                data[type] = proto.toBuffer();
                elem = {
                    type: 'raw',
                    data: 'protobuf://' + Buffer.from(core_1.pb.encode(data)).toString('base64'),
                };
                brief = '原始消息';
                this.content = '[' + brief + ']';
        }
        // 删除回复中多余的AT元素
        if (this.message.length === 2 &&
            elem.type === 'at' &&
            this.message[0]?.type === 'at' &&
            this.message[1]?.type === 'text') {
            if (this.message[0].qq === elem.qq && this.message[1].text === ' ') {
                this.message.splice(0, 2);
                this.brief = '';
            }
        }
        this.brief += brief;
        this.content += content;
        if (!Array.isArray(this.message))
            this.message = [];
        const prev = this.message[this.message.length - 1];
        if (elem.type === 'text' && prev?.type === 'text') {
            prev.text += elem.text;
        }
        else {
            this.message.push(elem);
        }
    }
    parseElems(arr) {
        this.it = arr.entries();
        while (true) {
            const wrapper = this.it.next().value?.[1];
            if (!wrapper)
                break;
            const type = Number(Object.keys(Reflect.getPrototypeOf(wrapper))[0]);
            const proto = wrapper[type];
            if (type === 16) {
                //extraInfo
                this.extra = proto;
            }
            else if (type === 21) {
                //anonGroupMsg
                this.anon = proto;
            }
            else if (type === 45) {
                //sourceMsg
                this.quotation = proto;
            }
            else if (!this.exclusive) {
                switch (type) {
                    case 1: //text
                    case 2: //face
                    case 4: //notOnlineImage
                    case 6: //bface
                    case 8: //customFace
                    case 34: //sface
                        this.parsePartialElem(type, proto);
                        break;
                    case 5: //transElem
                    case 12: //xml
                    case 19: //video
                    case 51: //json
                        this.parseExclusiveElem(type, proto);
                        break;
                    case 53: //commonElem
                        if (proto[1] === 33) {
                            //face(id>255)
                            this.parsePartialElem(33, proto[2]);
                        }
                        else if (proto[1] === 45) {
                            this.parsePartialElem(proto[1], proto[2]);
                        }
                        else if (proto[1] === 46) {
                            this.parsePartialElem(proto[1], proto[2]);
                        }
                        else if (proto[1] === 48) {
                            //image prefix of qqnt
                            this.imagePrefix = 'https://' + proto[2][1][2][3];
                        }
                        else {
                            this.parsePartialElem(type, proto);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    parseImgElem(proto, type) {
        let elem;
        if (proto[34] && proto[34][30] && String(proto[34][30]).includes('&rkey=') && this.imagePrefix) {
            // QQNT群聊图片
            elem = {
                type,
                file: (0, image_1.buildImageFileParam)(proto[13].toHex(), proto[25], proto[22], proto[23], proto[20]),
                url: this.imagePrefix + String(proto[34][30]) + '&spec=0',
            };
            this.imagePrefix = '';
            return elem;
        }
        else if (proto[29] && proto[29][30] && String(proto[29][30]).includes('&rkey=') && this.imagePrefix) {
            // QQNT私聊图片
            elem = {
                type,
                file: (0, image_1.buildImageFileParam)(proto[7].toHex(), proto[2], proto[9], proto[8], proto[5]),
                url: this.imagePrefix + String(proto[29][30]) + '&spec=0',
            };
            this.imagePrefix = '';
            return elem;
        }
        if (proto[7]?.toHex) {
            elem = {
                type,
                file: (0, image_1.buildImageFileParam)(proto[7].toHex(), proto[2], proto[9], proto[8], proto[5]),
                url: '',
            };
            if (proto[29] && proto[29][30]) {
                // construct url
                elem.url = `https://c2cpicdw.qpic.cn${proto[29][30]}&spec=0&rf=naio`;
            }
            else if (proto[15]) {
                elem.url = `https://c2cpicdw.qpic.cn${proto[15]}`;
            }
            else if (proto[10]) {
                elem.url = `https://c2cpicdw.qpic.cn/offpic_new/0/${proto[10]}/0`;
            }
            if (elem.type === 'image') {
                elem.asface = proto[29]?.[1] === 1;
            }
        }
        else {
            //群图
            elem = {
                type,
                file: (0, image_1.buildImageFileParam)(proto[13].toHex(), proto[25], proto[22], proto[23], proto[20]),
                url: proto[16] ? `https://gchat.qpic.cn${proto[16]}` : getGroupImageUrl(proto[13].toHex()),
            };
            if (elem.type === 'image') {
                elem.asface = proto[34]?.[1] === 1;
            }
        }
        return elem;
    }
}
exports.Parser = Parser;
function getGroupImageUrl(md5) {
    return `https://gchat.qpic.cn/gchatpic_new/0/0-0-${md5.toUpperCase()}/0`;
}
exports.getGroupImageUrl = getGroupImageUrl;
//# sourceMappingURL=parser.js.map