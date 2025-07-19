import { useState } from "react";
import { Video, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import socket from "@/sockets/socket";
import { useToast } from "@/hooks/use-toast";

interface RoomEntryProps {
  onJoinRoom: (roomId: string) => void;
}

export const RoomEntry = ({ onJoinRoom }: RoomEntryProps) => {
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const { toast } = useToast();

  const validateRoom = async (roomId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      socket.connect();
      socket.emit('validate-room', roomId);
      
      const timeout = setTimeout(() => {
        socket.off('room-validated');
        socket.off('room-not-found');
        toast({
          title: "Validation timeout",
          description: "Could not validate room. Please try again.",
          variant: "destructive"
        });
        resolve(false);
      }, 5000);

      socket.on('room-validated', () => {
        clearTimeout(timeout);
        socket.off('room-validated');
        socket.off('room-not-found');
        socket.disconnect();
        toast({
          title: "Room found!",
          description: "Joining the video call...",
        });
        resolve(true);
      });

      socket.on('room-not-found', () => {
        clearTimeout(timeout);
        socket.off('room-validated');
        socket.off('room-not-found');
        socket.disconnect();
        toast({
          title: "Room not found",
          description: "Please check the room ID or create a new room.",
          variant: "destructive"
        });
        resolve(false);
      });
    });
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim() || isGenerated) return;
    
    setIsValidating(true);
    setValidationError("");
    
    const isValid = await validateRoom(roomId.trim());
    
    if (!isValid) {
      setValidationError("Room not found. Please check the room ID or create a new room.");
      setIsValidating(false);
      return;
    }
    
    setIsJoining(true);
    setIsValidating(false);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onJoinRoom(roomId.trim());
    setIsJoining(false);
  };

  const generateRandomRoom = () => {
    const randomId = crypto.randomUUID();
    setRoomId(randomId);
    setIsGenerated(true);
    setValidationError(""); // Clear any previous errors
    toast({
      title: "Room ID generated",
      description: "Click 'Start New Call' to begin your video call.",
    });
  };

  const startNewCall = async () => {
    if (!roomId.trim()) return;
    
    setIsJoining(true);
    toast({
      title: "Creating new call",
      description: "Setting up your video room...",
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    onJoinRoom(roomId.trim());
    setIsJoining(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
    setIsGenerated(false); // Reset generated flag when user types
    setValidationError(""); // Clear validation errors when user types
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Simplified High-Contrast Dark Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-24 left-24 w-72 h-72 bg-indigo-700/30 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-40 right-40 w-56 h-56 bg-fuchsia-700/30 rounded-full blur-lg animate-float-delayed" />
        {/* Subtle Grid, more visible on dark */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.08) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <Card className="w-full max-w-md bg-gray-900/95 shadow-2xl hover:shadow-3xl animate-slide-up relative z-10 border border-fuchsia-800/40 backdrop-blur-md">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-indigo-900 rounded-3xl flex items-center justify-center shadow-lg animate-scale-in relative">
            <Video className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-600 bg-clip-text text-transparent mb-2">
            Echo Meet
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            {isGenerated ? "Start a new video call" : "Enter a room ID to join existing call"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder={isGenerated ? "Generated Room ID" : "Enter room ID to join"}
                value={roomId}
                onChange={handleInputChange}
                className="text-center text-xl font-bold tracking-widest border-2 border-fuchsia-700/60 focus:border-fuchsia-400 transition-all duration-300 rounded-xl h-14 shadow-md bg-black/80 text-white placeholder:text-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && (isGenerated ? startNewCall() : handleJoinRoom())}
              />
              {roomId && (
                <div className="absolute inset-0 pointer-events-none border-2 border-fuchsia-500/40 rounded-xl animate-pulse-glow" />
              )}
            </div>
            
            {validationError && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                {validationError}
              </div>
            )}
            
            <button
              onClick={generateRandomRoom}
              className="w-full text-sm text-fuchsia-400 hover:text-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 py-2"
            >
              <Users className="w-4 h-4" />
              Generate random room ID
            </button>
          </div>

          {isGenerated ? (
            <Button
              variant="premium"
              onClick={startNewCall}
              disabled={!roomId.trim() || isJoining}
              className="w-full text-xl py-8 rounded-2xl group relative overflow-hidden shadow-lg bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-fuchsia-700"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Call...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Start New Call
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          ) : (
            <Button
              variant="premium"
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || isJoining || isValidating}
              className="w-full text-xl py-8 rounded-2xl group relative overflow-hidden shadow-lg bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-fuchsia-800 text-white hover:from-indigo-700 hover:to-fuchsia-700"
            >
              {isJoining || isValidating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isValidating ? "Validating..." : "Joining..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Join Room
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          )}

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p className="font-medium">
              {isGenerated 
                ? "Share this room ID with others to join your call" 
                : "Room IDs are case-insensitive and shared with others to join"
              }
            </p>
            <div className="flex items-center justify-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span>Secure • Private • Instant</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};