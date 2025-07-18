import { useState } from "react";
import { RoomEntry } from "@/components/RoomEntry";
import { VideoRoom } from "@/components/VideoRoom";

const Index = () => {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
  };

  if (currentRoom) {
    return (
      <VideoRoom 
        roomId={currentRoom} 
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <RoomEntry onJoinRoom={handleJoinRoom} />
  );
};

export default Index;
