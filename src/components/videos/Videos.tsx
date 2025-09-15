import React from 'react';

interface VideosProps {
  playlistId?: string;
}

export const Videos: React.FC<VideosProps> = ({ playlistId }) => {
  console.log('Videos component - playlistId:', playlistId);

  // If no playlist ID is provided, show a message
  if (!playlistId) {
    return (
        <p className="empty">No video playlist available for this course.</p>
    );
  }

  return (

      <div className="playlist-section">
        <div className="video-wrapper">
          <iframe
            width="100%"
            height="480"
            src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
            title="Course Videos"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
  );
};
