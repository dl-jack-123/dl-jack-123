/**
 * Room mood: warm dusk (default) or the original grey daylight.
 * The choice is only persisted when the visitor toggles it themselves.
 */
export type Mood = 'dusk' | 'day';
export const MOOD_KEY = 'dl-mood';

export const getMood = (): Mood => {
    try {
        const stored = window.localStorage.getItem(MOOD_KEY);
        if (stored === 'day' || stored === 'dusk') return stored;
    } catch (e) {
        // storage unavailable
    }
    return 'dusk';
};

export interface MoodSpec {
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    sun: number;
    sunIntensity: number;
    sunDir: [number, number, number];
    wallBack: number;
    wallLeft: number;
    floor: number;
    rug: number;
    blind: number;
    blindEmissive: number;
    blindEmissiveIntensity: number;
    /** visible height of the roller blind in metres (top edge fixed at 2.1) */
    blindHeight: number;
    /** window backdrop: painted dusk scenery or a flat pale sky */
    scenery: boolean;
    skyFlat: number;
    bgTop: string;
    bgBottom: string;
    tint: string;
}

export const MOODS: { [key in Mood]: MoodSpec } = {
    dusk: {
        hemiSky: 0xffe2c2,
        hemiGround: 0x7a5a48,
        hemiIntensity: 0.8,
        sun: 0xff9d52,
        sunIntensity: 1.55,
        sunDir: [0.86, -0.42, -0.26],
        wallBack: 0xefd9bc,
        wallLeft: 0xe7ceac,
        floor: 0xc79d76,
        rug: 0xdccbb2,
        blind: 0xf2dcb8,
        blindEmissive: 0xffc387,
        blindEmissiveIntensity: 0.5,
        blindHeight: 0.28,
        scenery: true,
        skyFlat: 0xf4f7fa,
        bgTop: '#2b2431',
        bgBottom: '#c98550',
        tint: '#fff1de',
    },
    day: {
        hemiSky: 0xfafcff,
        hemiGround: 0xcfd0d0,
        hemiIntensity: 0.95,
        sun: 0xfff7ec,
        sunIntensity: 0.85,
        sunDir: [0.767, -0.598, -0.23],
        wallBack: 0xe4e5e6,
        wallLeft: 0xdcdee0,
        floor: 0xcfccc5,
        rug: 0xb4c0bb,
        blind: 0xe8e4da,
        blindEmissive: 0xfff4e0,
        blindEmissiveIntensity: 0.35,
        blindHeight: 0.6,
        scenery: false,
        skyFlat: 0xf4f7fa,
        bgTop: '#b8b9bb',
        bgBottom: '#e5e6e7',
        tint: '#f1f1ef',
    },
};
