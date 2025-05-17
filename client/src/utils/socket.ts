import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const connectSocket = () => {
  const socket = io(SOCKET_URL);

  socket.on("connect", () => {
    console.log("Connected:", socket.id);
  });

  return socket;
};
