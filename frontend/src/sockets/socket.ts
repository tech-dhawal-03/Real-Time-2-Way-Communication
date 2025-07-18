import {io,Socket} from 'socket.io-client';

const SOCKET_URI = import.meta.env.VITE_SOCKET_SERVER_URI;
console.log("[Socket] Connecting to:", SOCKET_URI);

export const socket : Socket = io(SOCKET_URI,{
    autoConnect : false,
  
})

socket.on("connect", () => {
    console.log("[Socket] Connected! ID:", socket.id);
});
socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err);
});
socket.on("disconnect", (reason) => {
    console.warn("[Socket] Disconnected:", reason);
});


export default socket;