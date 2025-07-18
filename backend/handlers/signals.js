export const handleSignals = (socket,io) =>{
    socket.on('join-room',(roomId)=>{
        socket.join(roomId);
        socket.to(roomId).emit('user-joined',socket.id);
        console.log(`Socket ${socket.id} joined room : ${roomId}`)

    })

    socket.on('offer', ({ offer, to }) => {
        io.to(to).emit('offer', { offer, from: socket.id });
      });
    
      socket.on('answer', ({ answer, to }) => {
        io.to(to).emit('answer', { answer, from: socket.id });
      });
    
      socket.on('ice-candidate', ({ candidate, to }) => {
        io.to(to).emit('ice-candidate', { candidate, from: socket.id });
      });
    
      socket.on('disconnect', () => {
        io.emit('user-disconnected', socket.id);
        console.log(`❌ User disconnected: ${socket.id}`);
      });
    };
