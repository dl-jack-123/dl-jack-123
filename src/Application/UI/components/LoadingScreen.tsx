import React, { useCallback, useEffect, useState } from 'react';
import eventBus from '../EventBus';

type LoadingProps = {};

const LoadingScreen: React.FC<LoadingProps> = () => {
    const [progress, setProgress] = useState(0);
    const [overlayOpacity, setLoadingOverlayOpacity] = useState(1);
    const [ready, setReady] = useState(false);
    const [webGLError, setWebGLError] = useState(false);
    const [mobileWarning, setMobileWarning] = useState(window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setMobileWarning(window.innerWidth < 768);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const start = useCallback(() => {
        setLoadingOverlayOpacity(0);
        eventBus.dispatch('loadingScreenDone', {});
        const ui = document.getElementById('ui');
        if (ui) {
            ui.style.pointerEvents = 'none';
        }
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            start();
        } else if (!detectWebGLContext()) {
            setWebGLError(true);
        }
    }, []);

    useEffect(() => {
        eventBus.on('loadedSource', (data) => {
            setProgress(data.progress);
        });
    }, []);

    useEffect(() => {
        if (progress >= 1 && !webGLError) {
            // brief pause so the 100% state is visible
            const t = setTimeout(() => setReady(true), 400);
            return () => clearTimeout(t);
        }
    }, [progress, webGLError]);

    // Enter / Space also start the experience
    useEffect(() => {
        if (!ready) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') start();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ready, start]);

    const detectWebGLContext = () => {
        const canvas = document.createElement('canvas');
        const gl =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl');
        return !!(gl && gl instanceof WebGLRenderingContext);
    };

    return (
        <div
            style={Object.assign({}, styles.overlay, {
                opacity: overlayOpacity,
                cursor: ready ? 'pointer' : 'default',
            })}
            onClick={ready ? start : undefined}
            role={ready ? 'button' : undefined}
            aria-label={ready ? '點擊任意處開始' : undefined}
        >
            {webGLError ? (
                <div style={styles.card}>
                    <p style={styles.text}>
                        找不到 WebGL,請啟用或改用支援 WebGL 的瀏覽器。
                    </p>
                    <p style={styles.sub}>
                        WebGL is required to run this site.
                    </p>
                </div>
            ) : (
                <div style={styles.card}>
                    {ready ? (
                        <p style={styles.text}>點擊任意處開始</p>
                    ) : (
                        <>
                            <p style={styles.text}>
                                載入中 {Math.round(progress * 100)}%
                            </p>
                            <div style={styles.track}>
                                <div
                                    style={Object.assign({}, styles.bar, {
                                        width: `${Math.round(progress * 100)}%`,
                                    })}
                                />
                            </div>
                        </>
                    )}
                    {mobileWarning && (
                        <p style={styles.sub}>建議使用桌機或筆電瀏覽</p>
                    )}
                </div>
            )}
        </div>
    );
};

const FONT =
    '"Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif';

const styles: StyleSheetCSS = {
    overlay: {
        background: 'linear-gradient(#bdb8b0, #e8e5de)',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.4s ease-in-out',
        boxSizing: 'border-box',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
    },
    text: {
        fontFamily: FONT,
        fontSize: 18,
        letterSpacing: 2,
        color: '#2b2b2b',
        margin: 0,
    },
    sub: {
        fontFamily: FONT,
        fontSize: 13,
        color: '#5a5750',
        margin: 0,
    },
    track: {
        width: 220,
        height: 4,
        background: 'rgba(0,0,0,0.12)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        background: '#2b2b2b',
        transition: 'width 0.2s',
    },
};

export default LoadingScreen;
