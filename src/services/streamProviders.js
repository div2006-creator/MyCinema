/**
 * Full Movie & TV Series Streaming Embed Resolvers
 * Top 4 Verified Playable Stream Servers (Live HTTP 200 & zero iframe-blocking headers)
 * High-speed 4K/1080p playback with Multi-Language, Hindi Dubbing & Loud Stereo Vocals
 */

export const STREAM_SERVERS = [
  {
    id: 'vidlink',
    name: 'Server 1 (VidLink Pro - 4K Ultra Multi-Audio)',
    badge: '4K UHD / DUAL AUDIO',
    quality: '4K UHD / 1080p',
    description: 'Best for 4K picture quality and loud normalized stereo vocals. Supports internal audio track switching.',
    getMovieUrl: (id, options = {}) => {
      const cleanId = id || options.tmdbId || options.imdbId || '299534';
      return `https://vidlink.pro/movie/${cleanId}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      // VidLink TV prefers numeric TMDB ID over tt-imdbId to avoid 500 error
      const cleanId = (typeof id === 'string' && id.startsWith('tt') && options.tmdbId) ? options.tmdbId : id;
      return `https://vidlink.pro/tv/${cleanId}/${season}/${episode}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', tmdbId = null, season = 1, options = {}) => {
      if (malId) {
        // VidLink Anime endpoint: explicit dub (English Dubbed) or sub (Original Japanese)
        const mode = audio === 'sub' ? 'sub' : 'dub';
        return `https://vidlink.pro/anime/${malId}/${ep}/${mode}?fallback=true&primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b`;
      }
      const cleanId = tmdbId || options.tmdbId || id;
      return `https://vidlink.pro/tv/${cleanId}/${season}/${ep}?primaryColor=f59e0b&secondaryColor=fbbf24&iconColor=f59e0b&multi_lang=1`;
    }
  },
  {
    id: 'vidsrc_pm',
    name: 'Server 2 (VidSrc PM - Hindi & Dual Audio HD)',
    badge: 'HINDI DUB / FULL HD',
    quality: '1080p Full HD',
    description: 'Best for instant Hindi Dub & Dual Audio playback. Auto-activates Hindi soundtrack.',
    getMovieUrl: (id, options = {}) => {
      const isImdb = (typeof id === 'string' && id.startsWith('tt')) || (!id && options.imdbId);
      const cleanId = isImdb ? (typeof id === 'string' && id.startsWith('tt') ? id : options.imdbId) : (id || options.tmdbId);
      const lang = options?.audioMode === 'hindi' ? 'hi' : 'en';
      return isImdb 
        ? `https://vidsrc.pm/embed/movie?imdb=${cleanId}&ds_lang=${lang}`
        : `https://vidsrc.pm/embed/movie?tmdb=${cleanId}&ds_lang=${lang}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const isImdb = (typeof id === 'string' && id.startsWith('tt')) || (!id && options.imdbId);
      const cleanId = isImdb ? (typeof id === 'string' && id.startsWith('tt') ? id : options.imdbId) : (id || options.tmdbId);
      const lang = options?.audioMode === 'hindi' ? 'hi' : 'en';
      return isImdb
        ? `https://vidsrc.pm/embed/tv?imdb=${cleanId}&season=${season}&episode=${episode}&ds_lang=${lang}`
        : `https://vidsrc.pm/embed/tv?tmdb=${cleanId}&season=${season}&episode=${episode}&ds_lang=${lang}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', tmdbId = null, season = 1, options = {}) => {
      const cleanId = tmdbId || options.tmdbId || options.imdbId;
      const isImdb = typeof cleanId === 'string' && cleanId.startsWith('tt');
      return isImdb
        ? `https://vidsrc.pm/embed/tv?imdb=${cleanId}&season=${season}&episode=${ep}&ds_lang=en`
        : `https://vidsrc.pm/embed/tv?tmdb=${cleanId}&season=${season}&episode=${ep}&ds_lang=en`;
    }
  },
  {
    id: 'anyembed',
    name: 'Server 3 (AnyEmbed VIP - High Speed Cloud)',
    badge: 'ANYEMBED VIP / HD',
    quality: '1080p High Speed',
    description: 'High-speed cloud nodes powered by SmashyStream. Instant playback with low buffering.',
    getMovieUrl: (id, options = {}) => {
      const isImdb = typeof id === 'string' && id.startsWith('tt');
      const cleanId = id || options.tmdbId || options.imdbId || '299534';
      return `https://anyembed.xyz/embed/${isImdb ? 'imdb' : 'tmdb'}-movie-${cleanId}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const isImdb = typeof id === 'string' && id.startsWith('tt');
      const cleanId = id || options.tmdbId || options.imdbId;
      return `https://anyembed.xyz/embed/${isImdb ? 'imdb' : 'tmdb'}-tv-${cleanId}-${season}-${episode}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', tmdbId = null, season = 1, options = {}) => {
      const cleanId = tmdbId || options.tmdbId || options.imdbId;
      const isImdb = typeof cleanId === 'string' && cleanId.startsWith('tt');
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
      const cleanId = id || options.tmdbId || options.imdbId || '299534';
      return `https://www.2embed.cc/embed/${cleanId}`;
    },
    getTvUrl: (id, season = 1, episode = 1, options = {}) => {
      const cleanId = id || options.tmdbId || options.imdbId;
      return `https://www.2embed.cc/embedtv/${cleanId}&s=${season}&e=${episode}`;
    },
    getAnimeUrl: (malId, ep = 1, audio = 'dub', tmdbId = null, season = 1, options = {}) => {
      const cleanId = tmdbId || options.tmdbId || options.imdbId;
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
