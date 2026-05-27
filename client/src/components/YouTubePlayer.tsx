import React, { useEffect, useRef } from "react";

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function YouTubePlayer({ 
  videoId = "oFP4kuIiUQ4", 
  autoplay = true, 
  loop = true, 
  muted = false 
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Cargar la API de YouTube
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    // Esperar a que la API esté lista
    const onYouTubeIframeAPIReady = () => {
      if (containerRef.current && !playerRef.current) {
        playerRef.current = new (window as any).YT.Player(containerRef.current, {
          height: "0",
          width: "0",
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            loop: loop ? 1 : 0,
            start: 40,
            playlist: loop ? videoId : undefined,
          },
          events: {
            onReady: (event: any) => {
              // Reproducir automáticamente
              if (autoplay) {
                event.target.seekTo(40, true);
                event.target.playVideo();
              }
              // Ajustar volumen
              event.target.setVolume(30);
            },
            onStateChange: (event: any) => {
              // Si la música termina y está en loop, reiniciar
              if (event.data === (window as any).YT.PlayerState.ENDED && loop) {
                event.target.playVideo();
              }
            },
          },
        });
      }
    };

    // Registrar la función global para cuando la API esté lista
    (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

    // Si la API ya está cargada, llamar directamente
    if ((window as any).YT && (window as any).YT.Player) {
      onYouTubeIframeAPIReady();
    }

    return () => {
      // Limpiar al desmontar
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {
          console.log("Error al destruir el reproductor de YouTube");
        }
      }
    };
  }, [videoId, autoplay, loop]);

  return (
    <div 
      ref={containerRef} 
      className="fixed bottom-0 right-0 w-0 h-0 pointer-events-none z-0"
      style={{ display: "none" }}
    />
  );
}

// Extender la interfaz de Window para incluir YT
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
