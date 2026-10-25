import * as THREE from 'three';

/**
 * Wall-mounted info cards. They are plain DOM nodes that follow fixed points
 * on the back wall; the render loop calls updateFloating() every frame.
 * Anchors are in metres (room space), the room root is scaled to millimetres.
 */
export const FLOAT_ANCHORS: [number, number, number][] = [
    [-1.5, 1.4, -1.585],
    [-0.02, 2.05, -1.585],
    [1.36, 1.55, -1.585],
];

/** Screen pixels per metre along the wall at the 1400x900 reference view. */
const REF_PX_PER_METRE = 130;
/** Direction of the wall's horizontal edge on screen (degrees below horizontal). */
export const WALL_SKEW_DEG = 16;

const els: (HTMLElement | null)[] = [];
export const registerFloating = (i: number, el: HTMLElement | null) => {
    els[i] = el;
};

const a = new THREE.Vector3();
const b = new THREE.Vector3();

export function updateFloating(
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
    visible: boolean
) {
    FLOAT_ANCHORS.forEach((anchor, i) => {
        const el = els[i];
        if (!el) return;
        if (!visible) {
            if (el.dataset.shown !== '0') {
                el.dataset.shown = '0';
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            }
            return;
        }
        a.set(anchor[0], anchor[1], anchor[2]).multiplyScalar(1000).project(camera);
        b.set(anchor[0] + 1, anchor[1], anchor[2]).multiplyScalar(1000).project(camera);
        if (a.z > 1) return;
        const x = ((a.x + 1) / 2) * width;
        const y = ((1 - a.y) / 2) * height;
        const pxPerMetre = Math.abs(((b.x - a.x) / 2) * width);
        const s = Math.min(1.6, Math.max(0.5, pxPerMetre / REF_PX_PER_METRE));
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(
            1
        )}px) translate(-50%, -50%) scale(${s.toFixed(3)}) skewY(${WALL_SKEW_DEG}deg)`;
        if (el.dataset.shown !== '1') {
            el.dataset.shown = '1';
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        }
    });
}
