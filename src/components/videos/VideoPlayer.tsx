import React from 'react';
import { Video } from './VideoCard';
import { YouTubeService } from '../../services/youtube/youtubeService';

interface VideoPlayerProps {
  video: Video;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious 
}) => {
  const youtubeService = YouTubeService.getInstance();
  const videoId = youtubeService.extractVideoId(video.url) || video.id;
  const embedUrl = youtubeService.getEmbedUrl(videoId);

  return (
    <div className="video-player-container">
      <div className="video-player">
        <iframe
          src={embedUrl}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="video-element"
        ></iframe>
      </div>
      
      <div className="video-details">
        <h2 className="video-player-title">{video.title}</h2>
        <p className="video-player-description">{video.description}</p>
        {video.uploadDate && (
          <span className="video-player-date">Uploaded: {video.uploadDate}</span>
        )}
      </div>
      
      <div className="video-navigation">
        <button 
          className="nav-btn prev-btn" 
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>
        
        <button 
          className="nav-btn next-btn" 
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
};
