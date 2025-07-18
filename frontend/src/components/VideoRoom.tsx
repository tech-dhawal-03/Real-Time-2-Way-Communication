import { useState, useEffect } from "react";
import { VideoPanel } from "./VideoPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Copy,
  Users,
  ArrowLeft
} from "lucide-react";
import socket from "@/sockets/socket";
import { useRef } from "react";
import { iceServers } from "@/lib/iceServers";

interface VideoRoomProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export const VideoRoom = ({ roomId, onLeaveRoom }: VideoRoomProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  // Use refs to persist peer connection and streams
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const isOffererRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    // Connect and join room for signaling
    socket.connect();
    socket.emit("join-room", roomId);

    // 1. Get local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!isMounted) return;
        setLocalStream(stream);
        // 2. Create peer connection
        const pc = new RTCPeerConnection({ iceServers });
        peerConnectionRef.current = pc;
        // 3. Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        // 4. ICE candidate handler
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { roomId, candidate: event.candidate });
          }
        };
        // 5. Remote track handler
        const remoteStreamObj = new MediaStream();
        setRemoteStream(remoteStreamObj);
        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach(track => {
            remoteStreamObj.addTrack(track);
          });
          setRemoteConnected(true);
        };
        // 6. Join logic: ask server if offerer
        socket.emit("ready-for-call", roomId);
      })
      .catch((err) => {
        toast({ title: "Camera/Mic error", description: err.message, variant: "destructive" });
      });

    // 7. Listen for signaling events
    socket.on("init-offer", async () => {
      // You are the offerer
      isOffererRef.current = true;
      const pc = peerConnectionRef.current;
      if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { roomId, offer });
    });

    socket.on("offer", async ({ offer }) => {
      // You are the answerer
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding received ICE candidate", err);
      }
    });

    return () => {
      isMounted = false;
      socket.emit("leave-room", roomId);
      socket.disconnect();
      socket.off("init-offer");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      // Cleanup peer connection and streams
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop()); // Stop camera and mic
      }
      setLocalStream(null);
      setRemoteStream(null);
      setRemoteConnected(false);
    };
  }, [roomId]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID copied",
      description: "Share this ID with others to join",
    });
  };

  const handleLeaveRoom = () => {
    toast({
      title: "Left room",
      description: "You've left the video call",
      variant: "destructive"
    });
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-fuchsia-800/40 bg-gradient-glass backdrop-blur-xl supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="glass" 
              size="icon"
              onClick={handleLeaveRoom}
              className="hover-glow"
            >
              <ArrowLeft className="w-5 h-5 text-fuchsia-400" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-indigo-900 rounded-2xl flex items-center justify-center shadow-glow animate-pulse-glow">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">Video Room</h1>
                <p className="text-sm text-gray-300">Room: <span className="font-mono font-semibold text-fuchsia-400">{roomId}</span></p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={`${isConnected ? "bg-fuchsia-400 shadow-glow" : "bg-gray-700 text-gray-300"} animate-fade-in`}
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-gray-500'} mr-2`} />
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={copyRoomId}
              className="gap-2 hover-glow text-fuchsia-400 border-fuchsia-800/40"
            >
              <Copy className="w-4 h-4" />
              Share Room
            </Button>
          </div>
        </div>
      </header>

      {/* Main Video Area */}
      <main className="container mx-auto px-6 py-12">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-16 w-64 h-64 bg-indigo-700/30 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-fuchsia-700/30 rounded-full blur-2xl animate-float-delayed" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto relative z-10">
          {/* Local Video */}
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-indigo-900 flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Your Video</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-400/50 to-transparent" />
            </div>
            <VideoPanel
              isLocal={true}
              isConnected={isConnected}
              isMuted={isMuted}
              isVideoOn={isVideoOn}
              className="animate-slide-up shadow-premium"
              mediaStream={localStream}
            />
          </div>

          {/* Remote Video */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Remote User</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-fuchsia-400/50 to-transparent" />
            </div>
            <VideoPanel
              isLocal={false}
              isConnected={remoteConnected}
              userName={remoteConnected ? "Guest User" : "Waiting..."}
              isMuted={false}
              isVideoOn={remoteConnected}
              className="animate-slide-up shadow-premium"
              style={{ animationDelay: '0.3s' }}
              mediaStream={remoteStream}
            />
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="mt-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <Card className="bg-gray-900/95 shadow-2xl border-fuchsia-800/40 hover-lift">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-6">
              <Button
                variant={isMuted ? "destructive" : "glass"}
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
                className="w-16 h-16 rounded-2xl shadow-soft hover-glow text-white"
              >
                {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </Button>

              <Button
                variant={isVideoOn ? "glass" : "destructive"}
                size="lg"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className="w-16 h-16 rounded-2xl shadow-soft hover-glow text-white"
              >
                {isVideoOn ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
              </Button>

              <Button
                variant="glass"
                size="lg"
                className="w-16 h-16 rounded-2xl shadow-soft hover-glow text-white"
              >
                <Settings className="w-7 h-7" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                onClick={handleLeaveRoom}
                className="w-16 h-16 rounded-2xl bg-fuchsia-700 hover:bg-fuchsia-800 shadow-premium hover:shadow-glow text-white"
              >
                <PhoneOff className="w-7 h-7" />
              </Button>
            </div>
            
            <div className="text-center mt-6 space-y-2">
              <p className="text-lg font-medium text-gray-200">
                {remoteConnected ? "Video call in progress" : "Waiting for others to join..."}
              </p>
              {!remoteConnected && (
                <div className="flex items-center justify-center gap-2 text-sm text-fuchsia-400">
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                  <span>Share the room ID to invite others</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
    </div>
  );
};