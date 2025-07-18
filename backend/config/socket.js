import { Server } from "socket.io";
import { handleSignals } from "../handlers/signals.js";


export const setupSocket = (server) => {
    
    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });
  
    io.on('connection', (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);
      handleSignals(socket);
    });
  };