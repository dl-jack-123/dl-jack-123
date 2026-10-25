import React, { useCallback, useEffect, useRef, useState } from 'react';
import UIEventBus from '../EventBus';
import MuteToggle from '../components/MuteToggle';
import FreeCamToggle from '../components/FreeCamToggle';
import { MUSIC_OFF, MUSIC_TRACKS, loadMusicChoice } from '../../Audio/musicTracks';
import { Profile, loadProfile } from './profile';
import FloatingCards from './FloatingCards';
import { Mood, MOOD_KEY, getMood } from '../../mood';
import './pro.css';

type SectionId = 'about' | 'projects' | 'stack' | 'engineering' | 'contact';

const SECTIONS: { id: SectionId; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'stack', label: 'Tech Stack' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'contact', label: 'Contact' },
];

const openInMonitor = (app: string) => {
    UIEventBus.dispatch('focusMonitor', {});
    const frame = document.getElementById(
        'computer-screen'
    ) as HTMLIFrameElement | null;
    if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(
            { type: 'dlos-open', app },
            window.location.origin
        );
    }
};

const ExtLink: React.FC<{ href: string }> = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

const SectionBody: React.FC<{ id: SectionId; p: Profile }> = ({ id, p }) => {
    switch (id) {
        case 'about':
            return (
                <>
                    <p className="pro-lead">{p.brand}</p>
                    <p>{p.summary}</p>
                    <p className="pro-quote">{p.tagline}</p>
                    <ul className="pro-tags" aria-label="Key technologies">
                        {p.tags.map((t) => (
                            <li key={t}>{t}</li>
                        ))}
                    </ul>
                </>
            );
        case 'projects':
            return (
                <>
                    <ul className="pro-cards">
                        {p.projects.map((pr) => (
                            <li key={pr.url}>
                                <h3>
                                    <ExtLink href={pr.url}>{pr.title}</ExtLink>
                                </h3>
                                <p>{pr.desc}</p>
                                <p className="pro-muted">{pr.tech}</p>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        className="pro-btn"
                        onClick={() => openInMonitor('projects')}
                    >
                        Open on the monitor
                    </button>
                </>
            );
        case 'stack':
            return (
                <>
                    {Object.keys(p.skills).map((group) => (
                        <div key={group}>
                            <h3 className="pro-h3">{group}</h3>
                            <ul className="pro-tags">
                                {p.skills[group].map((s) => (
                                    <li key={s}>{s}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            );
        case 'engineering':
            return (
                <>
                    <dl className="pro-stats">
                        {p.stats.map((s) => (
                            <div key={s.label}>
                                <dt>{s.label}</dt>
                                <dd>{s.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <p className="pro-muted">
                        Snapshot from my GitHub profile (WakaTime), {p.statsDate}.
                        Not live data.
                    </p>
                    <button
                        type="button"
                        className="pro-btn"
                        onClick={() => openInMonitor('workstation')}
                    >
                        See the workstation demo
                    </button>
                </>
            );
        case 'contact':
            return (
                <>
                    <ul className="pro-links">
                        {p.links.map((l) => (
                            <li key={l.url}>
                                <ExtLink href={l.url}>{l.label} ↗</ExtLink>
                            </li>
                        ))}
                    </ul>
                    <p className="pro-muted">Links open in a new tab.</p>
                </>
            );
    }
};

const ProUI: React.FC = () => {
    const [ready, setReady] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [section, setSection] = useState<SectionId | null>(null);
    const [inMonitor, setInMonitor] = useState(false);
    const [mood, setMood] = useState<Mood>(getMood);
    const theme = mood === 'dusk' ? 'dark' : 'light';
    const [time, setTime] = useState('');
    const [audioOpen, setAudioOpen] = useState(false);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [music, setMusic] = useState(loadMusicChoice);
    const closeRef = useRef<HTMLButtonElement>(null);
    const lastTrigger = useRef<HTMLElement | null>(null);

    useEffect(() => {
        UIEventBus.on('loadingScreenDone', () => setReady(true));
        UIEventBus.on('enterMonitor', () => {
            setInMonitor(true);
            setSection(null); // the drawer would cover the screen
        });
        UIEventBus.on('leftMonitor', () => setInMonitor(false));
        UIEventBus.on('muteToggle', (m: boolean) => setMuted(m));
        UIEventBus.on('volumeChange', (v: number) => setVolume(v));
        UIEventBus.on('musicChange', (m: string) => setMusic(m));
        loadProfile()
            .then(setProfile)
            .catch((e) => console.warn('Profile data unavailable', e));
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const tick = () =>
            setTime(
                new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })
            );
        tick();
        const id = setInterval(tick, 15000);
        return () => clearInterval(id);
    }, []);

    const openSection = useCallback((id: SectionId) => {
        lastTrigger.current = document.activeElement as HTMLElement | null;
        setSection(id);
    }, []);

    const closeSection = useCallback(() => {
        setSection(null);
        if (lastTrigger.current) lastTrigger.current.focus();
    }, []);

    useEffect(() => {
        if (section && closeRef.current) closeRef.current.focus();
    }, [section]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (section) closeSection();
            else if (inMonitor) UIEventBus.dispatch('unfocusMonitor', {});
        };
        const onMsg = (e: MessageEvent) => {
            if (e.origin !== window.location.origin) return;
            if (e.data && e.data.type === 'dlos-escape' && inMonitor) {
                UIEventBus.dispatch('unfocusMonitor', {});
            }
        };
        window.addEventListener('keydown', onKey);
        window.addEventListener('message', onMsg);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('message', onMsg);
        };
    }, [section, inMonitor, closeSection]);

    const toggleMood = () => {
        const next: Mood = mood === 'dusk' ? 'day' : 'dusk';
        setMood(next);
        UIEventBus.dispatch('moodChange', next);
        // Saved only because the visitor explicitly chose it.
        try {
            window.localStorage.setItem(MOOD_KEY, next);
        } catch (e) {
            // storage unavailable
        }
    };
    if (!ready) return null;

    const track = MUSIC_TRACKS.find((t) => t.id === music);
    const audioStatus =
        music === MUSIC_OFF
            ? 'Music off'
            : muted || volume === 0
            ? 'Muted'
            : 'Playing: ' + (track ? track.label : music);

    return (
        <div className="pro-root" data-theme={theme}>
            <header className="pro-top">
                <span className={'pro-logo' + (inMonitor ? ' pro-hidden' : '')}>
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                        <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8 8v8h3a4 4 0 000-8H8z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                    DL.Chiu
                </span>
                <nav
                    className={'pro-nav' + (inMonitor ? ' pro-hidden' : '')}
                    aria-label="Sections"
                >
                    {SECTIONS.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            aria-current={section === s.id ? 'true' : undefined}
                            className={section === s.id ? 'on' : ''}
                            onClick={() => openSection(s.id)}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>
                <div className="pro-toolbar" role="toolbar" aria-label="Page controls">
                    {inMonitor && (
                        <button
                            type="button"
                            className="pro-tool"
                            onClick={() => UIEventBus.dispatch('unfocusMonitor', {})}
                        >
                            ← Back to room
                        </button>
                    )}
                    <span className="pro-clock" aria-label="Local time">
                        {time}
                    </span>
                    <button
                        type="button"
                        className="pro-tool"
                        aria-expanded={audioOpen}
                        aria-controls="pro-audio"
                        onClick={() => setAudioOpen(!audioOpen)}
                    >
                        ♪ {audioStatus}
                    </button>
                    <button
                        type="button"
                        className="pro-tool"
                        aria-label={
                            mood === 'dusk'
                                ? 'Switch to daylight'
                                : 'Switch to dusk'
                        }
                        onClick={toggleMood}
                    >
                        {mood === 'dusk' ? '☾ Dusk' : '☀ Day'}
                    </button>
                    {/* Kept mounted so volume and track state survive collapsing */}
                    <div
                        id="pro-audio"
                        className="pro-audio"
                        hidden={!audioOpen}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <MuteToggle />
                        <FreeCamToggle />
                    </div>
                </div>
            </header>

            {profile && (
                <>
                    <aside
                        className={'pro-panel' + (inMonitor ? ' pro-hidden' : '')}
                        aria-label="Profile"
                    >
                        <p className="pro-eyebrow">Software Engineer</p>
                        <h1>{profile.name}</h1>
                        <p className="pro-role">{profile.role}</p>
                        <p className="pro-brand">{profile.brand}</p>
                        <ul className="pro-tags pro-panel-tags" aria-label="Key technologies">
                            {profile.tags.map((t) => (
                                <li key={t}>{t}</li>
                            ))}
                        </ul>
                        <div className="pro-actions">
                            <button
                                type="button"
                                className="pro-btn primary"
                                onClick={() => openInMonitor('projects')}
                            >
                                Explore Projects
                            </button>
                            <button
                                type="button"
                                className="pro-btn"
                                onClick={() => openSection('stack')}
                            >
                                Technical Stack
                            </button>
                            <button
                                type="button"
                                className="pro-btn"
                                onClick={() => openSection('contact')}
                            >
                                Contact Me
                            </button>
                        </div>
                        <p className="pro-social">
                            {profile.links.map((l) => (
                                <ExtLink key={l.url} href={l.url}>
                                    {l.label}
                                </ExtLink>
                            ))}
                        </p>
                    </aside>

                    <FloatingCards
                        profile={profile}
                        onPipeline={() => openInMonitor('workstation')}
                        onInfra={() => openSection('stack')}
                        onMetrics={() => openSection('engineering')}
                    />

                    {section && (
                        <section
                            className="pro-drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="pro-drawer-title"
                        >
                            <header>
                                <h2 id="pro-drawer-title">
                                    {SECTIONS.find((s) => s.id === section)!.label}
                                </h2>
                                <button
                                    ref={closeRef}
                                    type="button"
                                    className="pro-close"
                                    aria-label="Close"
                                    onClick={closeSection}
                                >
                                    ×
                                </button>
                            </header>
                            <div className="pro-drawer-body">
                                <SectionBody id={section} p={profile} />
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};


export default ProUI;
