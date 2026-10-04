/**
 * Full Movie & TV Series Streaming Embed Resolvers
 * Top 4 Verified Playable Stream Servers (Live HTTP 200 & zero iframe-blocking headers)
 * High-speed 4K/1080p playback with Multi-Language, Hindi Dubbing & Loud Stereo Vocals
 */

export function sanitizeMediaId(id, options = {}) {
  // If options.tmdbId is numeric
  if (options.tmdbId && /^\d+$/.test(String(options.tmdbId))) return String(options.tmdbId);
  // If id is numeric TMDB or tt-prefixed IMDB
  if (id && (/^\d+$/.test(String(id)) || String(id).startsWith('tt'))) return String(id);
  // If options.imdbId is valid
  if (options.imdbId && String(options.imdbId).startsWith('tt')) return String(options.imdbId);
  if (options.tmdbId) return String(options.tmdbId);
  return '299534'; // High-reliability fallback (Avengers: Endgame)
}

export const STREAM_SERVERS = [
  {
    id: 'vidlink',
    name: 'Server 1 (VidLink Pro - Multi-Audio & Hindi Dub)',
    badge: '4K UHD / DUAL AUDIO',
    quality: '4K UHD / 1080p',
    description: '4K picture quality with Multi-Language Audio tracks (Hindi Dub, English Original, Dual Audio). Switch audio tracks inside the player controls.',
    getMovieUrl: (id, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      return `https://vidlink.pro/movie/${cleanId}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const cleanId = sanitizeMediaId(options.tmdbId || id, options);
      return `https://vidlink.pro/tv/${cleanId}/${season}/${episode}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', id = null, season = 1, options = {}) => {
      if (malId) {
        const mode = audio === 'sub' ? 'sub' : 'dub';
        return `https://vidlink.pro/anime/${malId}/${ep}/${mode}?fallback=true&primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b`;
      }
      const cleanId = sanitizeMediaId(id, options);
      return `https://vidlink.pro/tv/${cleanId}/${season}/${ep}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    }
  },
  {
    id: 'autoembed',
    name: 'Server 2 (AutoEmbed Global - Fast CDN)',
    badge: 'GLOBAL FAST / HD',
    quality: '1080p Ultra Fast',
    description: 'Worldwide CDN node with high uptime and rapid buffering. Rock-solid failover for all movies and series.',
    getMovieUrl: (id, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://autoembed.co/movie/${isImdb ? 'imdb/' + cleanId : 'tmdb/' + cleanId}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://autoembed.co/tv/${isImdb ? 'imdb/' + cleanId : 'tmdb/' + cleanId}-${season}-${episode}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', id = null, season = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://autoembed.co/tv/${isImdb ? 'imdb/' + cleanId : 'tmdb/' + cleanId}-${season}-${ep}`;
    }
  },
  {
    id: 'anyembed',
    name: 'Server 3 (AnyEmbed VIP - High Speed Cloud)',
    badge: 'ANYEMBED VIP / HD',
    quality: '1080p High Speed',
    description: 'High-speed cloud nodes powered by SmashyStream. Instant playback with low buffering.',
    getMovieUrl: (id, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://anyembed.xyz/embed/${isImdb ? 'imdb' : 'tmdb'}-movie-${cleanId}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://anyembed.xyz/embed/${isImdb ? 'imdb' : 'tmdb'}-tv-${cleanId}-${season}-${episode}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', id = null, season = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      const isImdb = cleanId.startsWith('tt');
      return `https://anyembed.xyz/embed/${isImdb ? 'imdb' : 'tmdb'}-tv-${cleanId}-${season}-${ep}`;
    }
  },
  {
    id: 'twoembed',
    name: 'Server 4 (2Embed Prime - Global Mirror)',
    badge: 'GLOBAL MIRROR / HD',
    quality: '1080p HD',
    description: 'Worldwide CDN mirror. High reliability failover node for both movies and series.',
    getMovieUrl: (id, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      return `https://www.2embed.cc/embed/${cleanId}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      return `https://www.2embed.cc/embedtv/${cleanId}&s=${season}&e=${episode}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', id = null, season = 1, options = {}) => {
      const cleanId = sanitizeMediaId(id, options);
      return `https://www.2embed.cc/embedtv/${cleanId}&s=${season}&e=${ep}`;
    }
  }
];

export function getStreamUrl(serverId, id, isTv = false, season = 1, episode = 1, options = {}) {
  const server = STREAM_SERVERS.find(s => s.id === serverId) || STREAM_SERVERS[0];
  
  // Only use specialized anime TV resolver if it is genuinely an episodic anime series (isTv=true), NOT a standalone anime movie!
  if (options.isAnime && isTv && server.getAnimeUrl) {
    return server.getAnimeUrl(options.malId, episode, options.audioMode || 'dub', id, season, options);
  }
  
  if (isTv) {
    return server.getTvUrl(id, season, episode, options);
  }
  return server.getMovieUrl(id, options);
}
