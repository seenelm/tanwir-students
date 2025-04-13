import React from 'react';


interface Playlist {
  id: string;
  name: string;
  description: string;
}

const playlists: Playlist[] = [
  {
    id: 'PLQ5POsRxrza1NO0_aFr6NE9Wj9zlfur8t',
    name: 'PG: Foundations 24/25',
    description: 'Foundation classes for the 2024-25 academic year',
  },
  {
    id: 'PLQ5POsRxrza15-sldnWjtmWvqEohvY7aD',
    name: 'Extended Studies',
    description: 'Extended studies classes and additional materials',
  },
];

export const Videos: React.FC = () => {
  return (
    <div className="videos-container">
      {playlists.map((playlist) => (
        <div key={playlist.id} className="playlist-section">
          <h2 className="playlist-title">{playlist.name}</h2>
          <p className="playlist-description">{playlist.description}</p>
          <div className="video-wrapper">
            <iframe
              width="100%"
              height="360"
              src={`https://www.youtube.com/embed/videoseries?list=${playlist.id}`}
              title={playlist.name}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      ))}
    </div>
  );
};
