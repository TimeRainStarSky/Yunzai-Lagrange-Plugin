"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSign = exports.signWhiteList = void 0;
const axios_1 = __importDefault(require("axios"));
exports.signWhiteList = [
    'trpc.o3.ecdh_access.EcdhAccess.SsoEstablishShareKey',
    'trpc.o3.ecdh_access.EcdhAccess.SsoSecureAccess',
    'trpc.o3.report.Report.SsoReport',
    'MessageSvc.PbSendMsg',
    'wtlogin.trans_emp',
    'wtlogin.login',
    'trpc.login.ecdh.EcdhService.SsoKeyExchange',
    'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLogin',
    'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLogin',
    'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLoginNewDevice',
    'trpc.login.ecdh.EcdhService.SsoNTLoginEasyLoginUnusualDevice',
    'trpc.login.ecdh.EcdhService.SsoNTLoginPasswordLoginUnusualDevice',
    'OidbSvcTrpcTcp.0x11ec_1',
    'OidbSvcTrpcTcp.0x758_1',
    'OidbSvcTrpcTcp.0x7c2_5',
    'OidbSvcTrpcTcp.0x10db_1',
    'OidbSvcTrpcTcp.0x8a1_7',
    'OidbSvcTrpcTcp.0x89a_0',
    'OidbSvcTrpcTcp.0x89a_15',
    'OidbSvcTrpcTcp.0x88d_0',
    'OidbSvcTrpcTcp.0x88d_14',
    'OidbSvcTrpcTcp.0x112a_1',
    'OidbSvcTrpcTcp.0x587_74',
    'OidbSvcTrpcTcp.0x1100_1',
    'OidbSvcTrpcTcp.0x1102_1',
    'OidbSvcTrpcTcp.0x1103_1',
    'OidbSvcTrpcTcp.0x1107_1',
    'OidbSvcTrpcTcp.0x1105_1',
    'OidbSvcTrpcTcp.0xf88_1',
    'OidbSvcTrpcTcp.0xf89_1',
    'OidbSvcTrpcTcp.0xf57_1',
    'OidbSvcTrpcTcp.0xf57_106',
    'OidbSvcTrpcTcp.0xf57_9',
    'OidbSvcTrpcTcp.0xf55_1',
    'OidbSvcTrpcTcp.0xf67_1',
    'OidbSvcTrpcTcp.0xf67_5',
];
async function getSign(cmd, seq, src) {
    if (!exports.signWhiteList.includes(cmd))
        return null;
    const params = {
        cmd: cmd,
        seq: seq,
        src: src.toString('hex'),
    };
    const url = new URL(this.sig.signApiAddr).toString();
    const data = await axios_1.default.post(url, params);
    return data.data['value'];
}
exports.getSign = getSign;
//# sourceMappingURL=sign.js.map
