"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyTimes = exports.PenaltyType = exports.Accessibility = void 0;
var Accessibility;
(function (Accessibility) {
    Accessibility["PUBLIC"] = "PUBLIC";
    Accessibility["PRIVATE"] = "PRIVATE";
    Accessibility["PROTECTED"] = "PROTECTED";
})(Accessibility = exports.Accessibility || (exports.Accessibility = {}));
var PenaltyType;
(function (PenaltyType) {
    PenaltyType["BAN"] = "BAN";
    PenaltyType["MUTE"] = "MUTE";
})(PenaltyType = exports.PenaltyType || (exports.PenaltyType = {}));
exports.PenaltyTimes = [1, 15, 60, 360, 1440, 10080];
