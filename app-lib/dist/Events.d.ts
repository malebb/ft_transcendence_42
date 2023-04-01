declare const EVENTS: {
    CLIENT: {
        CONNECT: string;
        CREATE_ROOM: string;
        SEND_ROOM_MESSAGE: string;
        JOIN_ROOM: string;
    };
    SERVER: {
        ROOMS: string;
        JOINED_ROOM: string;
        ROOM_MESSAGE: string;
    };
};
export default EVENTS;
