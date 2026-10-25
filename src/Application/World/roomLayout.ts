import * as THREE from 'three';

/**
 * Single source of truth for the bright room geometry that other modules
 * (monitor iframe, occluder, dimmer, camera keyframes, steam) depend on.
 * The room is authored in metres and scaled by UNITS_PER_METRE (1 unit = 1 mm).
 */
export const UNITS_PER_METRE = 1000;

const DEG = THREE.MathUtils.DEG2RAD;

// Measured glass quad of kenney computerScreen.glb (model space, metres)
const GLASS = {
    width: 0.37913,
    height: 0.23364,
    centre: new THREE.Vector3(0.19635, 0.17128, -0.05207),
    tiltDeg: 8.0,
};

export const MONITOR = {
    // monitorGroup pivot = vertical axis through the screen centre
    pivot: new THREE.Vector3(0.42, 0.76, -1.3),
    yawDeg: 10,
    scale: 1.5,
};

export const PROPS = {
    mug: new THREE.Vector3(-0.17, 0.76, -1.0), // base centre, metres
};

export type ScreenSpec = {
    position: THREE.Vector3; // mm
    euler: THREE.Euler;
    normal: THREE.Vector3;
    worldSize: { w: number; h: number }; // mm
    cssSize: { w: number; h: number };
};

export function computeScreen(): ScreenSpec {
    const s = MONITOR.scale;
    const position = new THREE.Vector3(
        MONITOR.pivot.x,
        MONITOR.pivot.y + GLASS.centre.y * s,
        MONITOR.pivot.z
    ).multiplyScalar(UNITS_PER_METRE);
    const euler = new THREE.Euler(
        -GLASS.tiltDeg * DEG,
        MONITOR.yawDeg * DEG,
        0,
        'YXZ'
    );
    const normal = new THREE.Vector3(0, 0, 1).applyEuler(euler);
    const w = GLASS.width * s * UNITS_PER_METRE;
    const h = GLASS.height * s * UNITS_PER_METRE;
    const cssW = 1280;
    return {
        position,
        euler,
        normal,
        worldSize: { w, h },
        cssSize: { w: cssW, h: Math.round(cssW / (w / h)) },
    };
}

export type MonitorConfig = {
    position: THREE.Vector3;
    euler: THREE.Euler;
    normal: THREE.Vector3;
    worldSize: { w: number; h: number };
    cssSize: { w: number; h: number };
    iframeSize: { w: number; h: number };
    iframePadding: number;
    containerBg: string;
    innerShadow: boolean;
    enclosureDepth: number;
    bezelColor: number;
    dim: 'classic' | 'bright';
};

export const classicMonitorConfig = (): MonitorConfig => ({
    position: new THREE.Vector3(0, 950, 255),
    euler: new THREE.Euler(-3 * DEG, 0, 0),
    normal: new THREE.Vector3(0, 0, 1),
    worldSize: { w: 1280, h: 1024 },
    cssSize: { w: 1280, h: 1024 },
    iframeSize: { w: 1280 - 32, h: 1024 - 32 },
    iframePadding: 32,
    containerBg: '#1d2e2f',
    innerShadow: true,
    enclosureDepth: 24 * 4,
    bezelColor: 0x48493f,
    dim: 'classic',
});

export const brightMonitorConfig = (): MonitorConfig => {
    const s = computeScreen();
    return {
        position: s.position,
        euler: s.euler,
        normal: s.normal,
        worldSize: s.worldSize,
        cssSize: s.cssSize,
        iframeSize: s.cssSize,
        iframePadding: 0,
        containerBg: '#eee8d8',
        innerShadow: false,
        enclosureDepth: 0,
        bezelColor: 0x2a2c2f,
        dim: 'bright',
    };
};

export type SteamOptions = {
    position: THREE.Vector3;
    size: { w: number; h: number };
    color: string;
    billboard: boolean;
};

export const brightSteamOptions = (): SteamOptions => ({
    position: new THREE.Vector3(
        PROPS.mug.x,
        PROPS.mug.y + 0.095 + 0.1,
        PROPS.mug.z
    ).multiplyScalar(UNITS_PER_METRE),
    size: { w: 90, h: 220 },
    color: '#a8a294',
    billboard: true,
});

// ---------- camera helpers ----------

export const getAspect = (width: number, height: number) =>
    height > 0 ? width / height : 16 / 9;

export const dirFromAngles = (azDeg: number, elDeg: number): THREE.Vector3 =>
    new THREE.Vector3(
        Math.sin(azDeg * DEG) * Math.cos(elDeg * DEG),
        Math.sin(elDeg * DEG),
        Math.cos(azDeg * DEG) * Math.cos(elDeg * DEG)
    );

export const idleDistance = (aspect: number) => Math.max(9000, 7000 / aspect);

// vertical fov 35deg -> tan(fov/2) = 0.3153; 0.6305 = 2 * tan
export const monitorDistance = (aspect: number) => {
    const s = computeScreen();
    const dh = s.worldSize.h / (0.88 * 0.6305);
    const dw = s.worldSize.w / (0.88 * 0.6305 * aspect);
    return Math.max(dh, dw);
};

export const deskDistance = (aspect: number) =>
    Math.max(2600, 1500 / (0.6305 * aspect));

export const dimOpacity = (dist: number, dot: number) => {
    const clamp = (v: number, a: number, b: number) =>
        Math.min(b, Math.max(a, v));
    const far = clamp((dist - 3000) / 9000, 0, 1);
    const ang = clamp(1 - dot, 0, 1);
    return clamp(0.3 * far + 0.45 * ang, 0, 0.38);
};
