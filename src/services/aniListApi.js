/**
 * AniList Public GraphQL Web Extractor
 * Live extraction of real anime transmissions directly from AniList's public API.
 */

const ANILIST_URL = 'https://graphql.anilist.co';

const TRENDING_ANIME_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
      episodes
      seasonYear
      averageScore
      genres
      trailer {
        id
        site
      }
    }
  }
}
`;

const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 15) {
    media(type: ANIME, search: $search, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
      }
      bannerImage
      description
      episodes
      seasonYear
      averageScore
      genres
      trailer {
        id
        site
      }
    }
  }
}
`;

function cleanDescription(desc) {
  if (!desc) return "Classified transmission stream. Live extraction complete.";
  return desc.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
}

export async function fetchLiveTrendingAnime(page = 1, perPage = 12) {
  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: TRENDING_ANIME_QUERY,
        variables: { page, perPage }
      })
    });

    const data = await response.json();
    if (!data?.data?.Page?.media) return [];

    return data.data.Page.media.map((item) => {
      const title = item.title.english || item.title.romaji || item.title.native;
      const rating = item.averageScore ? (item.averageScore / 10).toFixed(1) : '8.5';
      const year = item.seasonYear ? item.seasonYear.toString() : '2025';
      const backdrop = item.bannerImage || item.coverImage.extraLarge;
      const poster = item.coverImage.extraLarge || item.coverImage.large;

      return {
        id: `anilist-${item.id}`,
        tmdbId: item.idMal || item.id, // Fallback ID for stream resolving
        anilistId: item.id,
        title: title.toUpperCase(),
        tagline: item.title.native || 'NEO-TOKYO STREAM FEED',
        year: year,
        rating: rating,
        type: 'Anime',
        isAnime: true,
        duration: item.episodes ? `${item.episodes} Episodes` : 'Ongoing',
        genres: item.genres?.slice(0, 3) || ['Anime', 'Action'],
        synopsis: cleanDescription(item.description),
        backdropUrl: backdrop,
        posterUrl: poster,
        image: poster,
        mood: item.genres?.[0] || 'Adrenaline Rush',
        trailerKey: item.trailer?.site === 'youtube' ? item.trailer.id : null,
        seasons: 1,
        episodes: item.episodes || 12
      };
    });
  } catch (err) {
    console.warn('Failed to extract live anime from AniList:', err);
    return [];
  }
}

export async function searchLiveAnime(query) {
  if (!query || query.trim().length === 0) return [];

  try {
    const response = await fetch(ANILIST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_ANIME_QUERY,
        variables: { search: query }
      })
    });

    const data = await response.json();
    if (!data?.data?.Page?.media) return [];

    return data.data.Page.media.map((item) => {
      const title = item.title.english || item.title.romaji || item.title.native;
      const rating = item.averageScore ? (item.averageScore / 10).toFixed(1) : '8.4';
      const year = item.seasonYear ? item.seasonYear.toString() : '2024';

      return {
        id: `anilist-${item.id}`,
        tmdbId: item.idMal || item.id,
        anilistId: item.id,
        title: title.toUpperCase(),
        year: year,
        rating: rating,
        type: 'Anime',
        isAnime: true,
        duration: item.episodes ? `${item.episodes} Eps` : 'Series',
        genres: item.genres?.slice(0, 3) || ['Anime'],
        synopsis: cleanDescription(item.description),
        image: item.coverImage.extraLarge || item.coverImage.large,
        backdropUrl: item.bannerImage || item.coverImage.extraLarge,
        posterUrl: item.coverImage.extraLarge,
        mood: item.genres?.[0] || 'Cyber Melancholy',
        trailerKey: item.trailer?.site === 'youtube' ? item.trailer.id : null,
        seasons: 1,
        episodes: item.episodes || 12
      };
    });
  } catch (err) {
    console.warn('Search live anime error:', err);
    return [];
  }
}
