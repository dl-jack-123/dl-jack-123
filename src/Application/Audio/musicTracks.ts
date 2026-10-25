export const MUSIC_OFF = 'off';

export interface MusicTrack {
    // Must match the resource name in sources.ts
    id: string;
    label: string;
}

// Note: ids must not be substrings of one another (AudioManager matches by substring).
export const MUSIC_TRACKS: MusicTrack[] = [
    { id: 'musicSuspense', label: 'Suspense' },
    { id: 'musicTrailer', label: 'Stylish Trailer' },
    { id: 'musicTravel', label: 'Inspiring Travel' },
];

export const DEFAULT_MUSIC = MUSIC_TRACKS[0].id;
export const MUSIC_STORAGE_KEY = 'musicTrack';

export const isValidMusicChoice = (id: string | null): id is string =>
    id === MUSIC_OFF || MUSIC_TRACKS.some((track) => track.id === id);

export const loadMusicChoice = (): string => {
    try {
        const stored = window.localStorage.getItem(MUSIC_STORAGE_KEY);
        if (isValidMusicChoice(stored)) return stored;
    } catch (e) {
        // localStorage may be unavailable
    }
    return DEFAULT_MUSIC;
};
