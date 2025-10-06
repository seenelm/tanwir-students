import React from 'react';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  duration?: string;
  url: string;
  uploadDate?: string;
}

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  isActive?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isActive }) => {
  return (
    <div 
      className={`video-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="video-thumbnail">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} />
        ) : (
          <div className="video-placeholder">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        )}
        {video.duration && (
          <span className="video-duration">{video.duration}</span>
        )}
      </div>
      
      <div className="video-info">
        <h4 className="video-title">{video.title}</h4>
        <p className="video-description">{video.description}</p>
        {video.uploadDate && (
          <span className="video-date">{video.uploadDate}</span>
        )}
      </div>
    </div>
  );
};
