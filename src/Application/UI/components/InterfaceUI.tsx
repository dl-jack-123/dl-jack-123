import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import InfoOverlay from './InfoOverlay';
import { isBright } from '../../roomMode';
import { modelCreditsLine } from '../../World/roomCredits';

interface InterfaceUIProps {}

const InterfaceUI: React.FC<InterfaceUIProps> = ({}) => {
    const [initLoad, setInitLoad] = useState(true);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const interfaceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        UIEventBus.on('loadingScreenDone', () => {
            setLoading(false);
        });

        // find element by id and set ref
        const element = document.getElementById('ui-interactive');
        if (element) {
            // @ts-ignore
            interfaceRef.current = element;
        }
    }, []);

    const initMouseDownHandler = () => {
        setVisible(true);
        setInitLoad(false);
    };

    useEffect(() => {
        if (!loading && initLoad) {
            document.addEventListener('mousedown', initMouseDownHandler);
            return () => {
                document.removeEventListener('mousedown', initMouseDownHandler);
            };
        }
    }, [loading, initLoad]);

    useEffect(() => {
        UIEventBus.on('enterMonitor', () => {
            setVisible(false);
            setInitLoad(false);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'none';
            }
        });
        UIEventBus.on('leftMonitor', () => {
            setVisible(true);
            if (interfaceRef.current) {
                interfaceRef.current.style.pointerEvents = 'auto';
            }
        });
    }, []);

    return !loading ? (
        <>
            <motion.div
                initial="hide"
                variants={vars}
                animate={visible ? 'visible' : 'hide'}
                style={styles.wrapper}
                className="interface-wrapper"
                id="prevent-click"
            >
                <InfoOverlay visible={visible} />
            </motion.div>
            <div style={isBright ? styles.creditsBright : styles.credits}>
                <p style={styles.creditLine}>
                    Music from Pixabay: &quot;Suspense Background&quot; by
                    nastelbom, &quot;Stylish Trailer Percussion&quot; by
                    audioera, &quot;Inspiring Travel Acoustic&quot; by
                    loka_music
                </p>
                {isBright && (
                    <p style={styles.creditLine}>
                        {modelCreditsLine(window.innerWidth < 480)}
                    </p>
                )}
            </div>
        </>
    ) : (
        <></>
    );
};

const vars = {
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            delay: 0.3,
            ease: 'easeOut',
        },
    },
    hide: {
        x: -32,
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const styles: StyleSheetCSS = {
    wrapper: {
        width: '100%',
        display: 'flex',
        position: 'absolute',
        boxSizing: 'border-box',
    },
    credits: {
        position: 'fixed',
        left: 8,
        bottom: 6,
        right: 8,
        margin: 0,
        fontSize: 9,
        lineHeight: 1.3,
        color: 'rgba(0, 0, 0, 0.55)',
        pointerEvents: 'none',
        userSelect: 'none',
    },
    creditsBright: {
        position: 'fixed',
        left: 8,
        bottom: 6,
        right: 8,
        margin: 0,
        fontSize: 10,
        lineHeight: 1.3,
        color: 'rgba(0, 0, 0, 0.7)',
        pointerEvents: 'none',
        userSelect: 'none',
    },
    creditLine: {
        margin: 0,
        color: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
    },
};

export default InterfaceUI;
