import { User, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React from "react";

interface VideoPanelProps {
  isLocal?: boolean;
  isConnected?: boolean;
  userName?: string;
  isMuted?: boolean;
  isVideoOn?: boolean;
  className?: string;
  style?: React.CSSProperties;
  mediaStream?: MediaStream | null;
}

export const VideoPanel = ({ 
  isLocal = false, 
  isConnected = false,
  userName = isLocal ? "You" : "Remote User",
  isMuted = false,
  isVideoOn = true,
  className = "",
  style,
  mediaStream
}: VideoPanelProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && mediaStream && isVideoOn) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, isVideoOn]);

  return (
    <div className={`relative aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl overflow-hidden shadow-premium hover-lift group ${className}`} style={style}>
      {/* Video Feed */}
      <div className="absolute inset-0 bg-gray-950">
        {isVideoOn && mediaStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : isVideoOn ? (
          // fallback if video is on but no stream
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <span className="text-lg">No video stream</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-full bg-gradient-to-br from-muted/30 to-background/50">
            <VideoOff className="w-16 h-16 mb-4 opacity-60" />
            <span className="text-lg font-medium">Camera off</span>
            <span className="text-sm opacity-70">Video is disabled</span>
          </div>
        )}
      </div>

      {/* User Info Overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 animate-fade-in">
        <div className="glass-morphism px-3 py-2 rounded-xl backdrop-blur-md">
          <span className="text-white font-medium text-sm">{userName}</span>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {isMuted ? (
            <div className="w-8 h-8 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover-glow">
              <MicOff className="w-4 h-4 text-destructive-foreground" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-status-online/90 backdrop-blur-sm flex items-center justify-center animate-pulse-glow">
              <Mic className="w-4 h-4 text-white" />
            </div>
          )}
          
          {isVideoOn && (
            <div className="w-8 h-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover-glow">
              <Video className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-4 right-4 animate-fade-in">
        <div className={`w-4 h-4 rounded-full shadow-glow ${isConnected ? 'bg-status-online animate-pulse-glow' : 'bg-status-offline opacity-60'}`} />
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl" />
    </div>
  );
};