import { Room } from "../models/Room.js";
export const handleSignals = async(socket, io) => {
    socket.on('join-room', async(roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);

        //register roomID in database 
        const existingRoom = await Room.findOne({
            roomId : roomId
        })


        if(!existingRoom) 
        {
            const newRoom = await Room.create({roomId});
            socket.emit('room-created',roomId);
        }

        
        // Notify other users in the room
        socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('validate-room', async (roomId) => {
        try {
            const existingRoom = await Room.findOne({ roomId });
            if (existingRoom) {
                socket.emit('room-validated');
            } else {
                socket.emit('room-not-found');
            }
        } catch (error) {
            console.error('Error validating room:', error);
            socket.emit('room-not-found');
        }
    });

    socket.on('ready-for-call', (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (room && room.size === 1) {
            // First user - they'll be the offerer
            socket.emit('init-offer');
        } else if (room && room.size === 2) {
            // Second user - tell first user to create offer
            socket.to(roomId).emit('init-offer');
        }
    });

    socket.on('offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('offer', { offer });
    });

    socket.on('answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('answer', { answer });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', { candidate });
    });

    socket.on('remote-mute-toggle', ({ roomId, muted }) => {
        socket.to(roomId).emit('remote-mute-toggle', { muted });
    });

    socket.on('remote-video-toggle', ({ roomId, videoOn }) => {
        socket.to(roomId).emit('remote-video-toggle', { videoOn });
    });

    socket.on('end-call', async({ roomId }) => {
        // Notify all users in the room that call is ended by host
        io.to(roomId).emit('call-ended-by-host');
        //delete roomId from database....

        const deletedRoom = await Room.findOneAndDelete({roomId});

        if(deletedRoom)
            {
                console.log(`Call ended by host in room: ${roomId}`);
            }
    });

    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('peer-disconnected');
        console.log(`Socket ${socket.id} left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
    });
};
