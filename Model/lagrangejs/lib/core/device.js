"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDeviceInfo = exports.getAppInfo = exports.Platform = void 0;
const constants_1 = require("./constants");
const crypto_1 = require("crypto");
var Platform;
(function (Platform) {
    Platform[Platform["Linux"] = 0] = "Linux";
    Platform[Platform["MacOS"] = 1] = "MacOS";
    Platform[Platform["Windows"] = 2] = "Windows";
})(Platform || (exports.Platform = Platform = {}));
const linux = {
    os: 'Linux',
    kernel: 'Linux',
    vendorOs: 'linux',
    currentVersion: '3.1.2-13107',
    buildVersion: 13107,
    miscBitmap: 32764,
    ptVersion: '2.0.0',
    ptOsVersion: 19,
    packageName: 'com.tencent.qq',
    wtLoginSdk: 'nt.wtlogin.0.0.1',
    packageSign: 'V1_LNX_NQ_3.1.2-13107_RDM_B',
    appId: 1600001615,
    subAppId: 537146866,
    appIdQrCode: 13697054,
    appClientVersion: 13172,
    mainSigMap: 169742560,
    subSigMap: 0,
    NTLoginType: 1,
};
const macOS = {
    os: 'Mac',
    kernel: 'Darwin',
    vendorOs: 'mac',
    currentVersion: '6.9.20-17153',
    buildVersion: 17153,
    ptVersion: '2.0.0',
    miscBitmap: 32764,
    ptOsVersion: 23,
    packageName: 'com.tencent.qq',
    wtLoginSdk: 'nt.wtlogin.0.0.1',
    packageSign: 'V1_MAC_NQ_6.9.20-17153_RDM_B',
    appId: 1600001602,
    subAppId: 537162356,
    appIdQrCode: 537162356,
    appClientVersion: 13172,
    mainSigMap: 169742560,
    subSigMap: 0,
    NTLoginType: 5,
};
const appList = {
    [Platform.Windows]: linux, // TODO: AppInfo for windows
    [Platform.Linux]: linux,
    [Platform.MacOS]: macOS,
};
function getAppInfo(p) {
    return appList[p] || appList[Platform.Linux];
}
exports.getAppInfo = getAppInfo;
function generateDeviceInfo(uin) {
    const guid = (0, constants_1.md5)((0, crypto_1.randomBytes)(32)).toString('hex');
    return {
        guid: guid,
        deviceName: `Lagrange-${Buffer.from((0, constants_1.md5)(guid.toString()).slice(0, 3)).toString('hex').toUpperCase()}`,
        systemKernel: 'Windows 10.0.19042',
        kernelVersion: '10.0.19042.0',
    };
}
exports.generateDeviceInfo = generateDeviceInfo;
//# sourceMappingURL=device.js.map