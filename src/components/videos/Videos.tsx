import React, { useState, useEffect } from 'react';
import { VideoCard, Video } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';
import { YouTubeService } from '../../services/youtube/youtubeService';

interface VideosProps {
  playlistId?: string;
}

export const Videos: React.FC<VideosProps> = ({ playlistId }) => {
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'list' | 'player'>('list');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylistVideos = async () => {
      if (playlistId) {
        setLoading(true);
        setError(null);
        
        try {
          const youtubeService = YouTubeService.getInstance();
          const fetchedVideos = await youtubeService.getPlaylistVideos(playlistId);
          
          if (fetchedVideos.length > 0) {
            setVideoList(fetchedVideos);
          } else {
            setError('No videos found in this playlist.');
          }
        } catch (err) {
          console.error('Error fetching playlist:', err);
          setError('Failed to load videos. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPlaylistVideos();
  }, [playlistId]);

  // Show loading state
  if (loading) {
    return (
      <div className="videos-loading">
        <p>Loading videos...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="videos-error">
        <p className="empty">{error}</p>
      </div>
    );
  }

  // If no videos available, show a message
  if (!videoList || videoList.length === 0) {
    return (
      <p className="empty">No videos available for this course.</p>
    );
  }

  const selectedVideo = videoList[selectedVideoIndex];

  const handleVideoSelect = (index: number) => {
    setSelectedVideoIndex(index);
    setViewMode('player');
  };

  const handleNext = () => {
    if (selectedVideoIndex < videoList.length - 1) {
      setSelectedVideoIndex(selectedVideoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedVideoIndex > 0) {
      setSelectedVideoIndex(selectedVideoIndex - 1);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  return (
    <div className="videos-container">
      {viewMode === 'list' ? (
        <div className="videos-list-view">
          <div className="videos-header">
            <span className="video-count">{videoList.length} videos</span>
          </div>
          
          <div className="videos-grid">
            {videoList.map((video, index) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => handleVideoSelect(index)}
                isActive={selectedVideoIndex === index}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="videos-player-view">
          <button className="back-to-list-btn" onClick={handleBackToList}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Back to Videos
          </button>
          
          <div className="player-and-list">
            <div className="player-section">
              <VideoPlayer
                video={selectedVideo}
                onNext={handleNext}
                onPrevious={handlePrevious}
                hasNext={selectedVideoIndex < videoList.length - 1}
                hasPrevious={selectedVideoIndex > 0}
              />
            </div>
            
            <div className="playlist-sidebar">
              <h4>Playlist</h4>
              <div className="playlist-items">
                {videoList.map((video, index) => (
                  <div
                    key={video.id}
                    className={`playlist-item ${index === selectedVideoIndex ? 'active' : ''}`}
                    onClick={() => setSelectedVideoIndex(index)}
                  >
                    <div className="playlist-item-number">{index + 1}</div>
                    <div className="playlist-item-info">
                      <h5>{video.title}</h5>
                      {video.duration && <span className="playlist-duration">{video.duration}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
