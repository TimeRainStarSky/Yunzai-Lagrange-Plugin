export declare enum Platform {
    Linux = 0,
    MacOS = 1,
    Windows = 2
}
export type AppInfo = typeof linux;
export type DeviceInfo = ReturnType<typeof generateDeviceInfo>;
declare const linux: {
    os: string;
    kernel: string;
    vendorOs: string;
    currentVersion: string;
    buildVersion: number;
    miscBitmap: number;
    ptVersion: string;
    ptOsVersion: number;
    packageName: string;
    wtLoginSdk: string;
    packageSign: string;
    appId: number;
    subAppId: number;
    appIdQrCode: number;
    appClientVersion: number;
    mainSigMap: number;
    subSigMap: number;
    NTLoginType: number;
};
export declare function getAppInfo(p: Platform): AppInfo;
export declare function generateDeviceInfo(uin: string | number): {
    guid: string;
    deviceName: string;
    systemKernel: string;
    kernelVersion: string;
};
export {};
