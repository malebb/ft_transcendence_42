"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EVENTS = {
    CLIENT: {
        CONNECT: "CONNECT",
        CREATE_ROOM: "CREATE_ROOM",
        SEND_ROOM_MESSAGE: "SEND_ROOM_MESAGE",
        JOIN_ROOM: "JOIN_ROOM",
    },
    SERVER: {
        ROOMS: "ROOMS",
        JOINED_ROOM: 'JOINED_ROOM',
        ROOM_MESSAGE: 'ROOM_MESSAGE',
    },
};
exports.default = EVENTS;
