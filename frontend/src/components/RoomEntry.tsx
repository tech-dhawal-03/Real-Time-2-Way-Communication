import { useState } from "react";
import { Video, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RoomEntryProps {
  onJoinRoom: (roomId: string) => void;
}

export const RoomEntry = ({ onJoinRoom }: RoomEntryProps) => {
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;
    
    setIsJoining(true);
    // Simulate joining delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onJoinRoom(roomId.trim());
    setIsJoining(false);
  };

  const generateRandomRoom = () => {
    const randomId = crypto.randomUUID();
    setRoomId(randomId);
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
            Join Video Chat
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Enter a room ID to start your video conversation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Enter room ID (e.g., ABC123)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="text-center text-xl font-bold tracking-widest border-2 border-fuchsia-700/60 focus:border-fuchsia-400 transition-all duration-300 rounded-xl h-14 shadow-md bg-black/80 text-white placeholder:text-gray-400"
                maxLength={10}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              {roomId && (
                <div className="absolute inset-0 pointer-events-none border-2 border-fuchsia-500/40 rounded-xl animate-pulse-glow" />
              )}
            </div>
            
            <button
              onClick={generateRandomRoom}
              className="w-full text-sm text-fuchsia-400 hover:text-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 py-2"
            >
              <Users className="w-4 h-4" />
              Generate random room ID
            </button>
          </div>

          <Button
            variant="premium"
            onClick={handleJoinRoom}
            disabled={!roomId.trim() || isJoining}
            className="w-full text-xl py-8 rounded-2xl group relative overflow-hidden shadow-lg bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-fuchsia-800 text-white hover:from-indigo-700 hover:to-fuchsia-700"
          >
            {isJoining ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Joining...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Join Room
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>

          <div className="text-center text-sm text-gray-400 space-y-2">
            <p className="font-medium">Room IDs are case-insensitive and shared with others to join</p>
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