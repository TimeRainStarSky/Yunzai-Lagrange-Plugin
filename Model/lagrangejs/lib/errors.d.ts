export declare enum LoginErrorCode {
    TokenExpired = 140022015,
    UnusualVerify = 140022011,
    NewDeviceVerify = 140022010,
    CaptchaVerify = 140022008,
    Success = 0
}
export declare enum ErrorCode {
    /** 客户端离线 */
    ClientNotOnline = -1,
    /** 发包超时未收到服务器回应 */
    PacketTimeout = -2,
    /** 用户不存在 */
    UserNotExists = -10,
    /** 群不存在(未加入) */
    GroupNotJoined = -20,
    /** 群员不存在 */
    MemberNotExists = -30,
    /** 发消息时传入的参数不正确 */
    MessageBuilderError = -60,
    /** 群消息被风控发送失败 */
    RiskMessageError = -70,
    /** 群消息有敏感词发送失败 */
    SensitiveWordsError = -80,
    /** 上传图片/文件/视频等数据超时 */
    HighwayTimeout = -110,
    /** 上传图片/文件/视频等数据遇到网络错误 */
    HighwayNetworkError = -120,
    /** 没有上传通道 */
    NoUploadChannel = -130,
    /** 不支持的file类型(没有流) */
    HighwayFileTypeError = -140,
    /** 文件安全校验未通过不存在 */
    UnsafeFile = -150,
    /** 离线(私聊)文件不存在 */
    OfflineFileNotExists = -160,
    /** 群文件不存在(无法转发) */
    GroupFileNotExists = -170,
    /** 获取视频中的图片失败 */
    FFmpegVideoThumbError = -210,
    /** 音频转换失败 */
    FFmpegPttTransError = -220
}
export declare function drop(code: number, message?: string): never;
