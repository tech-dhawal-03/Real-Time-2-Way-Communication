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
    const videoElement = videoRef.current;
    if (!videoElement) return;

    console.log('VideoPanel effect - isLocal:', isLocal, 'mediaStream:', !!mediaStream, 'isVideoOn:', isVideoOn);

    if (mediaStream && isVideoOn) {
      console.log('Setting video stream for', isLocal ? 'local' : 'remote', 'video');
      
      // Clear any existing stream first
      videoElement.srcObject = null;
      
      // Set the new stream
      videoElement.srcObject = mediaStream;
      
      // Ensure video plays when stream is set
      const playVideo = async () => {
        try {
          await videoElement.play();
          console.log('Video playing successfully for', isLocal ? 'local' : 'remote');
        } catch (error) {
          console.error('Error playing video:', error);
        }
      };
      
      // Handle video loading
      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded for', isLocal ? 'local' : 'remote', 'video');
        playVideo();
      };
      
      const handleCanPlay = () => {
        console.log('Video can play for', isLocal ? 'local' : 'remote', 'video');
        playVideo();
      };
      
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('canplay', handleCanPlay);
      
      // Try to play immediately
      playVideo();
      
      return () => {
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.removeEventListener('canplay', handleCanPlay);
      };
    } else {
      console.log('Clearing video stream for', isLocal ? 'local' : 'remote', 'video');
      videoElement.srcObject = null;
    }
  }, [mediaStream, isVideoOn, isLocal]);

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
            onError={(e) => console.error('Video error:', e)}
            onLoadStart={() => console.log('Video load started for', isLocal ? 'local' : 'remote')}
            onLoadedData={() => console.log('Video data loaded for', isLocal ? 'local' : 'remote')}
            style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
          />
        ) : isVideoOn ? (
          // fallback if video is on but no stream
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <User className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-60 mx-auto" />
              <span className="text-base sm:text-lg font-medium">
                {isLocal ? "Camera not available" : "User left the call"}
              </span>
              <span className="text-xs sm:text-sm opacity-70 block mt-2">
                {isLocal ? "Please check camera permissions" : "Waiting for others to join..."}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground h-full bg-gradient-to-br from-muted/30 to-background/50">
            <VideoOff className="w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-60" />
            <span className="text-base sm:text-lg font-medium">Camera off</span>
            <span className="text-xs sm:text-sm opacity-70">Video is disabled</span>
          </div>
        )}
      </div>

      {/* User Info Overlay */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 flex items-center gap-2 sm:gap-3 animate-fade-in">
        <div className="glass-morphism px-2 py-1 sm:px-3 sm:py-2 rounded-xl backdrop-blur-md">
          <span className="text-white font-medium text-xs sm:text-sm">{userName}</span>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-1 sm:gap-2">
          {isMuted ? (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-destructive/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover-glow">
              <MicOff className="w-3 h-3 sm:w-4 sm:h-4 text-destructive-foreground" />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-status-online/90 backdrop-blur-sm flex items-center justify-center animate-pulse-glow">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          )}
          
          {isVideoOn && (
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-soft hover-glow">
              <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 animate-fade-in">
        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-glow ${isConnected ? 'bg-status-online animate-pulse-glow' : 'bg-status-offline opacity-60'}`} />
      </div>

      {/* Disconnected Overlay */}
      {!isLocal && !isConnected && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
          <div className="text-center text-white">
            <User className="w-8 h-8 sm:w-12 sm:h-12 mb-2 opacity-60 mx-auto" />
            <p className="text-xs sm:text-sm font-medium">User disconnected</p>
          </div>
        </div>
      )}

      {/* Camera/Mic Disabled Overlay */}
      {isLocal && !mediaStream && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-3xl">
          <div className="text-center text-white">
            <VideoOff className="w-8 h-8 sm:w-12 sm:h-12 mb-2 opacity-60 mx-auto" />
            <p className="text-xs sm:text-sm font-medium">Camera disabled</p>
            <p className="text-xs opacity-70 mt-1">Permissions have been released</p>
          </div>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-3xl" />
    </div>
  );
};