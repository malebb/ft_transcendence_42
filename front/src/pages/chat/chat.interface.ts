export interface partialMessage {
  username: string;
  message: string;
  time: number;
}

export interface message extends partialMessage {
  roomId: number;
}
