"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupAdminChangeNotice = exports.GroupMemberIncreaseEvent = void 0;
class GroupMemberIncreaseEvent {
    constructor(c, pb) { }
}
exports.GroupMemberIncreaseEvent = GroupMemberIncreaseEvent;
class GroupAdminChangeNotice {
    constructor(c, pb) {
        this.admin = !!pb[4]?.[2];
        this.uid = this.admin ? pb[4][2][1] : pb[4][1][1];
        console.log(pb.toJSON());
    }
}
exports.GroupAdminChangeNotice = GroupAdminChangeNotice;
//# sourceMappingURL=notice.js.map