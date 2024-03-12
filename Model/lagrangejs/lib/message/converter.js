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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Converter_long_elems;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Converter = void 0;
const pb = __importStar(require("../core/protobuf"));
const image_1 = require("./image");
const face_1 = require("./face");
const zlib_1 = require("zlib");
const common_1 = require("../common");
const message_1 = require("./message");
const BUF1 = Buffer.from([1]);
class Converter {
    constructor(content, fake) {
        this.content = content;
        this.fake = fake;
        this.is_chain = true;
        this.imgs = [];
        this.elems = [];
        /** 长消息元素，仅内部使用 */
        _Converter_long_elems.set(this, []);
        /** 用于最终发送 */
        this.rich = { 2: this.elems, 4: null };
        /** 长度(字符) */
        this.length = 0;
        /** 预览文字 */
        this.brief = '';
    }
    async convert(contactable) {
        if (typeof this.content === 'string') {
            this._text(this.content);
        }
        else if (Array.isArray(this.content)) {
            await Promise.allSettled(this.content.map(item => this._convert(item, contactable)));
        }
        else {
            await this._convert(this.content, contactable);
        }
        // 处理长消息
        if (__classPrivateFieldGet(this, _Converter_long_elems, "f")?.length) {
            if (this.fake) {
                this.elems.push(...__classPrivateFieldGet(this, _Converter_long_elems, "f"));
            }
            else {
                this.elems.push({
                    37: {
                        6: 1,
                        7: await contactable._uploadLongMsg(__classPrivateFieldGet(this, _Converter_long_elems, "f")),
                    },
                });
            }
        }
        if (!this.elems.length && !this.rich[4]) {
            throw new Error('empty message');
        }
        return this;
    }
    async _convert(elem, contactable) {
        if (typeof elem === 'string') {
            this._text(elem);
        }
        else if (Reflect.has(this, elem.type)) {
            const method = Reflect.get(this, elem.type);
            if (typeof method !== 'function')
                return;
            await method.apply(this, [elem, contactable]);
        }
    }
    _text(text) {
        text = String(text); // force cast into string
        if (!text.length)
            return;
        this.elems.push({
            1: {
                1: text,
            },
        });
        this.length += text.length;
        this.brief += text;
    }
    text(elem) {
        this._text(elem.text);
    }
    /** 引用回复 */
    async quote(source, contactable) {
        const converter = await new Converter(source.message || '').convert(contactable);
        const elems = converter.elems;
        const tmp = this.brief;
        if (!contactable.dm) {
            this.at({ type: 'at', qq: source.user_id }, contactable);
            this.elems.unshift(this.elems.pop());
        }
        this.elems.unshift({
            45: {
                1: [source.seq],
                2: source.user_id,
                3: source.time,
                4: 1,
                5: elems,
                6: 0,
                8: {
                    3: (0, message_1.rand2uuid)(source.rand || 0),
                },
            },
        });
        this.brief = `[回复${this.brief.replace(tmp, '')}]` + tmp;
    }
    at(elem, contactable) {
        let display = '', uid = '';
        const { qq, id, text } = elem;
        if (qq === 'all') {
            display = '全体成员';
        }
        else {
            const info = contactable.gid
                ? contactable.c.memberList.get(contactable.gid)?.get(qq)
                : contactable.c.friendList.get(qq);
            display = text || info?.nickname || String(qq);
            uid = info?.uid || '';
        }
        if (!display.startsWith("@"))
            display = '@' + display;
        const reserve = pb.encode({
            // 不走有的没的的buffer了
            3: qq === 'all' ? 1 : 2,
            4: 0,
            5: 0,
            9: uid,
        });
        this.elems.push({
            1: {
                1: display,
                12: reserve,
            },
        });
        this.brief += display;
    }
    face(elem) {
        let { id, text, qlottie } = elem;
        id = Number(id);
        if (id < 0 || id > 0xffff || isNaN(id)) {
            throw new Error('wrong face id: ' + id);
        }
        if (qlottie) {
            if (face_1.facemap[id]) {
                text = face_1.facemap[id];
            }
            else if (!text) {
                text = '/' + id;
            }
            if (!text.startsWith('/'))
                text = '/' + text;
            this.elems.push([
                {
                    53: {
                        1: 37,
                        2: {
                            1: '1',
                            2: qlottie,
                            3: id,
                            4: 1,
                            5: 1,
                            6: '',
                            7: text,
                            8: '',
                            9: 1,
                        },
                        3: 1,
                    },
                },
                {
                    1: {
                        1: text,
                        12: {
                            1: '[' + text.replace('/', '') + ']请使用最新版手机QQ体验新功能',
                        },
                    },
                },
                {
                    37: {
                        17: 21908,
                        19: {
                            15: 65536,
                            31: 0,
                            41: 0,
                        },
                    },
                },
            ]);
            return;
        }
        if (id <= 0xff) {
            const old = Buffer.allocUnsafe(2);
            old.writeUInt16BE(0x1441 + id);
            this.elems.push({
                2: {
                    1: id,
                    2: old,
                    11: face_1.FACE_OLD_BUF,
                },
            });
        }
        else {
            if (face_1.facemap[id]) {
                text = face_1.facemap[id];
            }
            else if (!text) {
                text = '/' + id;
            }
            this.elems.push({
                53: {
                    1: 33,
                    2: {
                        1: id,
                        2: text,
                        3: text,
                    },
                    3: 1,
                },
            });
        }
        this.brief += '[表情]';
    }
    async forward(elem, contactable) {
        if (elem.m_resid) {
            const forwardList = await contactable.getForwardMsg(elem.m_resid, elem.m_fileName);
            if (!forwardList)
                return;
            return this.json({
                type: 'json',
                data: {
                    app: 'com.tencent.multimsg',
                    config: { autosize: 1, forward: 1, round: 1, type: 'normal', width: 300 },
                    desc: '[聊天记录]',
                    extra: '',
                    meta: {
                        detail: {
                            news: forwardList.slice(0, 4).map(item => {
                                return {
                                    text: `${(0, common_1.escapeXml)(item.nickname)}: ${(0, common_1.escapeXml)(item.raw_message.slice(0, 50))}`,
                                };
                            }),
                            resid: elem.m_resid,
                            source: '群聊的聊天记录',
                            summary: `查看${forwardList.length}条转发消息`,
                            uniseq: (0, common_1.uuid)().toUpperCase(),
                        },
                    },
                    prompt: '[聊天记录]',
                    ver: '0.0.0.5',
                    view: 'contact',
                },
            });
        }
        return this.json(await contactable.makeForwardMsg(elem.message));
    }
    sface(elem) {
        let { id, text } = elem;
        if (!text)
            text = String(id);
        text = `[${text}]`;
        this.elems.push({
            34: {
                1: Number(id),
                2: 1,
            },
        });
        this._text(text);
    }
    bface(elem) {
        let { file, text } = elem;
        if (!text)
            text = '原创表情';
        text = '[' + String(text).slice(0, 5) + ']';
        const o = {
            1: text,
            2: 6,
            3: 1,
            4: Buffer.from(file.slice(0, 32), 'hex'),
            5: parseInt(file.slice(64)),
            6: 3,
            7: Buffer.from(file.slice(32, 64), 'hex'),
            9: 0,
            10: 200,
            11: 200,
        };
        this.elems.push({ 6: o });
        this._text(text);
    }
    async image(elem, contactable) {
        const img = new image_1.Image(elem, contactable.dm, contactable.c.cacheDir);
        await contactable.uploadImages([img]);
        const compat = img.compatElems;
        const msgInfo = img.commonElems;
        this.imgs.push(img);
        this.elems.push(contactable.dm ? { 4: compat } : { 8: compat });
        this.elems.push({
            53: {
                1: 48,
                2: msgInfo,
                3: 10,
            },
        });
        this.brief += '[图片]';
    }
    async reply(elem) { }
    async record(elem) {
        this.brief += '[语音]';
        this.is_chain = false;
    }
    async video(elem) {
        this.brief += '[视频]';
        this.is_chain = false;
    }
    json(elem) {
        this.elems.push({
            51: {
                1: Buffer.concat([
                    BUF1,
                    (0, zlib_1.deflateSync)(typeof elem.data === 'string' ? elem.data : JSON.stringify(elem.data)),
                ]),
            },
        });
        this.brief += '[json消息]';
        this.is_chain = false;
    }
    xml(elem) {
        this.elems.push({
            12: {
                1: Buffer.concat([BUF1, (0, zlib_1.deflateSync)(elem.data)]),
                2: elem.id > 0 ? elem.id : 60,
            },
        });
        this.brief += '[xml消息]';
        this.is_chain = false;
    }
    file(elem) {
        throw new Error('暂不支持发送或转发file元素，请调用文件相关API完成该操作');
    }
    markdown(elem) {
        const { content } = elem;
        __classPrivateFieldGet(this, _Converter_long_elems, "f").push({
            53: {
                1: 45,
                2: {
                    1: content,
                },
                3: 1,
            },
        });
        this.brief += '[markdown消息]';
    }
    keyboard(elem) {
        const { appid, rows } = elem;
        const _content = {
            1: {
                1: rows.map(buttons => {
                    return {
                        1: buttons.map(button => {
                            return {
                                1: button.id,
                                2: {
                                    1: button.render_data.label,
                                    2: button.render_data.visited_label,
                                    3: button.render_data.style,
                                },
                                3: {
                                    1: button.action.type,
                                    2: {
                                        1: button.action.permission.type,
                                        2: button.action.permission.specify_role_ids,
                                        3: button.action.permission.specify_user_ids,
                                    },
                                    4: button.action.unsupport_tips,
                                    5: button.action.data,
                                    7: button.action.reply ? 1 : 0,
                                    8: button.action.enter ? 1 : 0,
                                },
                            };
                        }),
                    };
                }),
                2: appid,
            },
        };
        __classPrivateFieldGet(this, _Converter_long_elems, "f").push({
            53: {
                1: 46,
                2: _content,
                3: 1,
            },
        });
        this.brief += '[keyboard消息]';
    }
    raw(elem) {
        let data = elem.data;
        if (typeof data === 'string' && data.startsWith('protobuf://')) {
            data = Buffer.from(data.replace('protobuf://', ''), 'base64');
            this.elems.push(data);
        }
        else if (typeof data === 'object') {
            if (!Array.isArray(data))
                data = [data];
            this.elems.push(...data);
        }
        this.brief += '[原始消息]';
    }
}
exports.Converter = Converter;
_Converter_long_elems = new WeakMap();
//# sourceMappingURL=converter.js.map