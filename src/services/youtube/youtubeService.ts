import { Video } from '../../components/videos/VideoCard';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export class YouTubeService {
  private static instance: YouTubeService;

  private constructor() {}

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  /**
   * Fetch videos from a YouTube playlist
   */
  async getPlaylistVideos(playlistId: string): Promise<Video[]> {
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key is not configured');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return [];
      }

      // Transform YouTube API response to our Video format
      const videos: Video[] = data.items.map((item: any) => {
        const snippet = item.snippet;
        const videoId = snippet.resourceId.videoId;

        return {
          id: videoId,
          title: snippet.title,
          description: snippet.description || 'No description available',
          thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          uploadDate: new Date(snippet.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          duration: undefined // Duration requires additional API call
        };
      });

      return videos;
    } catch (error) {
      console.error('Error fetching YouTube playlist:', error);
      return [];
    }
  }

  /**
   * Get YouTube video embed URL
   */
  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  }
}
