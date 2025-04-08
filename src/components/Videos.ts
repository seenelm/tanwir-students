import '../styles/videos.css';

interface VideoData {
  Id: string;
  Title: string;
  Description?: string;
  ThumbnailUrl?: string;
}

interface PlaylistData {
  Id: string;
  Name: string;
  Description?: string;
  Videos: VideoData[];
}

export class Videos {
  private container: HTMLElement;
  private playlists: PlaylistData[] = [];
  private activePlaylistId: string | null = null;
  private isLoading: boolean = false;
  private error: string | null = null;
  private YOUTUBE_EMBED_BASE_URL = 'https://www.youtube.com/embed/';
  private YOUTUBE_PLAYLIST_BASE_URL = 'https://www.youtube.com/playlist?list=';

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'videos-container';
    this.init();
  }

  private async init(): Promise<void> {
    try {
      this.isLoading = true;
      this.render();
      
      // Initialize with predefined playlists
      this.playlists = [
        {
          Id: 'PLQ5POsRxrza1NO0_aFr6NE9Wj9zlfur8t',
          Name: 'PG: Foundations 24/25',
          Description: 'Foundation classes for the 2024-25 academic year',
          Videos: []
        }
      ];
      
      // Set the first playlist as active by default
      if (this.playlists.length > 0) {
        this.activePlaylistId = this.playlists[0].Id;
        await this.fetchPlaylistVideos(this.activePlaylistId);
      }
      
      this.isLoading = false;
      this.render();
    } catch (error) {
      console.error('Error initializing videos:', error);
      this.error = 'Failed to load videos. Please try again later.';
      this.isLoading = false;
      this.render();
    }
  }

  private async fetchPlaylistVideos(playlistId: string): Promise<void> {
    try {
      // Find the playlist
      const playlistIndex = this.playlists.findIndex(p => p.Id === playlistId);
      if (playlistIndex === -1) return;
      
      // For the foundations playlist, we'll use the embedded playlist approach
      // rather than trying to fetch individual videos
      // This is more reliable and doesn't require API keys
      
      // Set an empty videos array - this will trigger the embedded playlist view
      this.playlists[playlistIndex].Videos = [];
      
      // Note: If you want to display individual video cards in the future,
      // you would need to use the YouTube Data API with a proper API key
      // Example API endpoint: https://www.googleapis.com/youtube/v3/playlistItems
      // with your API key and the playlist ID
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      throw error;
    }
  }

  private createPlaylistSelector(): HTMLElement {
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'playlist-selector';
    
    const heading = document.createElement('h2');
    heading.textContent = 'Video Playlists';
    selectorContainer.appendChild(heading);
    
    const selector = document.createElement('div');
    selector.className = 'playlist-tabs';
    
    this.playlists.forEach(playlist => {
      const tab = document.createElement('button');
      tab.className = `playlist-tab ${playlist.Id === this.activePlaylistId ? 'active' : ''}`;
      tab.textContent = playlist.Name;
      tab.addEventListener('click', () => this.switchPlaylist(playlist.Id));
      selector.appendChild(tab);
    });
    
    selectorContainer.appendChild(selector);
    
    // Add description for active playlist
    const activePlaylist = this.playlists.find(p => p.Id === this.activePlaylistId);
    if (activePlaylist?.Description) {
      const description = document.createElement('p');
      description.className = 'playlist-description';
      description.textContent = activePlaylist.Description;
      selectorContainer.appendChild(description);
    }
    
    return selectorContainer;
  }

  private createVideosList(): HTMLElement {
    const videosContainer = document.createElement('div');
    videosContainer.className = 'videos-list';
    
    const activePlaylist = this.playlists.find(p => p.Id === this.activePlaylistId);
    
    if (!activePlaylist) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No playlist selected.';
      videosContainer.appendChild(emptyMessage);
      return videosContainer;
    }
    
    // Always show the embedded playlist for now
    // This is the most reliable approach without requiring API keys
    const embedContainer = document.createElement('div');
    embedContainer.className = 'playlist-embed-container';
    
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '600';
    iframe.src = `${this.YOUTUBE_EMBED_BASE_URL}videoseries?list=${activePlaylist.Id}`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    embedContainer.appendChild(iframe);
    videosContainer.appendChild(embedContainer);
    
    // Add a link to view the full playlist on YouTube
    const viewOnYouTube = document.createElement('a');
    viewOnYouTube.className = 'view-on-youtube';
    viewOnYouTube.href = `${this.YOUTUBE_PLAYLIST_BASE_URL}${activePlaylist.Id}`;
    viewOnYouTube.target = '_blank';
    viewOnYouTube.textContent = 'View full playlist on YouTube';
    videosContainer.appendChild(viewOnYouTube);
    
    return videosContainer;
  }

  private async switchPlaylist(playlistId: string): Promise<void> {
    if (this.activePlaylistId === playlistId || this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.activePlaylistId = playlistId;
      this.render();
      
      // Check if we need to fetch videos
      const playlist = this.playlists.find(p => p.Id === playlistId);
      if (playlist && playlist.Videos.length === 0) {
        await this.fetchPlaylistVideos(playlistId);
      }
      
      this.isLoading = false;
      this.render();
    } catch (error) {
      console.error('Error switching playlist:', error);
      this.error = 'Failed to load playlist videos. Please try again later.';
      this.isLoading = false;
      this.render();
    }
  }

  private renderLoading(): HTMLElement {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.textContent = 'Loading videos...';
    return loadingElement;
  }

  private renderError(): HTMLElement {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = this.error || 'An unknown error occurred.';
    
    const retryButton = document.createElement('button');
    retryButton.className = 'retry-button';
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', () => this.init());
    
    errorElement.appendChild(retryButton);
    return errorElement;
  }

  private render(): void {
    this.container.innerHTML = '';
    
    if (this.isLoading) {
      this.container.appendChild(this.renderLoading());
      return;
    }
    
    if (this.error) {
      this.container.appendChild(this.renderError());
      return;
    }
    
    // Render playlist selector
    this.container.appendChild(this.createPlaylistSelector());
    
    // Render videos list
    this.container.appendChild(this.createVideosList());
  }

  public getElement(): HTMLElement {
    return this.container;
  }
}