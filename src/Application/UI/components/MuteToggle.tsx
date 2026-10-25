import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';
// @ts-ignore
import volumeOn from '../../../../static/textures/UI/volume_on.svg';
// @ts-ignore
import volumeOff from '../../../../static/textures/UI/volume_off.svg';
import {
    MUSIC_OFF,
    MUSIC_STORAGE_KEY,
    MUSIC_TRACKS,
    loadMusicChoice,
} from '../../Audio/musicTracks';

interface MuteToggleProps {}

const VOLUME_STORAGE_KEY = 'masterVolume';
const DEFAULT_VOLUME = 1;

const loadVolume = (): number => {
    try {
        const stored = window.localStorage.getItem(VOLUME_STORAGE_KEY);
        if (stored !== null) {
            const value = parseFloat(stored);
            if (!isNaN(value)) return Math.min(1, Math.max(0, value));
        }
    } catch (e) {
        // localStorage may be unavailable (private mode, etc.)
    }
    return DEFAULT_VOLUME;
};

const MuteToggle: React.FC<MuteToggleProps> = ({}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(loadVolume);
    const [music, setMusic] = useState(loadMusicChoice);

    const onMouseDownHandler = useCallback(
        (event) => {
            setIsActive(true);
            event.preventDefault();
            // Unmuting from a zero volume would stay silent, so restore a default
            if (muted && volume === 0) {
                setVolume(0.5);
            }
            setMuted(!muted);
        },
        [muted, volume]
    );

    const onMouseUpHandler = useCallback(() => {
        setIsActive(false);
    }, []);

    const onMusicChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            setMusic(event.target.value);
        },
        []
    );

    const onVolumeChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseFloat(event.target.value);
            setVolume(value);
            // Moving the slider implies the user wants to hear sound
            setMuted(value === 0);
        },
        []
    );

    useEffect(() => {
        UIEventBus.dispatch('muteToggle', muted);
    }, [muted]);

    useEffect(() => {
        UIEventBus.dispatch('volumeChange', volume);
        try {
            window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
        } catch (e) {
            // ignore storage errors
        }
    }, [volume]);

    useEffect(() => {
        UIEventBus.dispatch('musicChange', music);
        try {
            window.localStorage.setItem(MUSIC_STORAGE_KEY, music);
        } catch (e) {
            // ignore storage errors
        }
    }, [music]);

    const silent = muted || volume === 0;

    return (
        <div style={styles.container} id="prevent-click">
            <div
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={styles.iconButton}
                onMouseDown={onMouseDownHandler}
                onMouseUp={onMouseUpHandler}
                className="icon-control-container"
                id="prevent-click"
                role="button"
                aria-label={silent ? 'Unmute' : 'Mute'}
            >
                <motion.img
                    id="prevent-click"
                    src={silent ? volumeOff : volumeOn}
                    style={{ opacity: isActive ? 0.2 : isHovering ? 0.8 : 1 }}
                    width={window.innerWidth < 768 ? 8 : 10}
                    animate={
                        isActive
                            ? 'active'
                            : isHovering
                            ? 'hovering'
                            : 'default'
                    }
                    variants={iconVars}
                />
            </div>
            <select
                id="prevent-click"
                value={music}
                onChange={onMusicChange}
                aria-label="Background music"
                style={styles.select}
            >
                {MUSIC_TRACKS.map((track) => (
                    <option key={track.id} value={track.id}>
                        {track.label}
                    </option>
                ))}
                <option value={MUSIC_OFF}>Music off</option>
            </select>
            <input
                id="prevent-click"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={onVolumeChange}
                aria-label="Volume"
                style={{
                    ...styles.slider,
                    width: window.innerWidth < 768 ? 40 : 60,
                }}
            />
        </div>
    );
};

const iconVars = {
    hovering: {
        // scale: 1.2,
        opacity: 0.8,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
    active: {
        scale: 0.8,
        opacity: 0.5,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        display: 'flex',
        flexDirection: 'row',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
    select: {
        background: 'black',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: 2,
        fontSize: 9,
        margin: '0 6px',
        padding: '0 2px',
        maxWidth: window.innerWidth < 768 ? 70 : 110,
        cursor: 'pointer',
    },
    slider: {
        height: 4,
        margin: 0,
        marginRight: 6,
        cursor: 'pointer',
        accentColor: '#ffffff',
    },
};

export default MuteToggle;
