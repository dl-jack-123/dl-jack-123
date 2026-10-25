import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import {
    UNITS_PER_METRE,
    MONITOR,
    PROPS,
    computeScreen,
    dimOpacity,
} from './roomLayout';

const DEG = THREE.MathUtils.DEG2RAD;

// Hex literals are taken as linear by three 0.137, so convert from sRGB.
const srgb = (hex: number) => new THREE.Color(hex).convertSRGBToLinear();

const std = (hex: number, roughness = 0.9, extra: any = {}) =>
    new THREE.MeshStandardMaterial({
        color: srgb(hex),
        roughness,
        metalness: 0,
        ...extra,
    });

type ColourMap = {
    [materialName: string]: { color: number; rough?: number; emissive?: number };
};

/**
 * Bright daylight home office. Authored in metres inside one root group
 * scaled by 1000 so one world unit is 1 mm (matches camera and CSS3D scale).
 */
export default class BrightRoom {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    root: THREE.Group;
    chair: THREE.Object3D | undefined;
    sun: THREE.DirectionalLight;
    floor: THREE.Mesh;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.root = new THREE.Group();
        this.root.scale.setScalar(UNITS_PER_METRE);
        this.scene.add(this.root);

        this.buildShell();
        this.buildDesk();
        this.buildProps();
        this.buildLights();

        if (new URLSearchParams(window.location.search).has('roomdebug')) {
            this.installDebugHook();
        }
    }

    // ---------- helpers ----------

    box(
        x0: number,
        x1: number,
        y0: number,
        y1: number,
        z0: number,
        z1: number,
        material: THREE.Material,
        cast = true,
        receive = true
    ) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0),
            material
        );
        mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
        mesh.castShadow = cast;
        mesh.receiveShadow = receive;
        this.root.add(mesh);
        return mesh;
    }

    /** Replace unlit/other materials with lit standard ones keyed by material name. */
    toLit(obj: THREE.Object3D, colours: ColourMap) {
        obj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const old = child.material as THREE.Material;
            const spec = colours[old.name];
            if (spec) {
                child.material = std(spec.color, spec.rough ?? 0.7, {
                    emissive: spec.emissive ? srgb(spec.emissive) : 0x000000,
                    emissiveIntensity: spec.emissive ? 0.35 : 1,
                });
            } else {
                const c = (old as any).color as THREE.Color | undefined;
                child.material = new THREE.MeshStandardMaterial({
                    color: c ? c.clone() : srgb(0xcccccc),
                    roughness: 0.8,
                    metalness: 0,
                });
            }
            child.castShadow = true;
            child.receiveShadow = true;
        });
    }

    /** Make textured pool materials (Poly Haven / KayKit) behave in a non-metallic scene. */
    fixPbr(obj: THREE.Object3D, tint?: number) {
        obj.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const m = child.material as THREE.MeshStandardMaterial;
            m.metalness = 0;
            (m as any).metalnessMap = null;
            if (tint !== undefined) m.color = srgb(tint);
            child.castShadow = true;
            child.receiveShadow = true;
        });
    }

    /**
     * Wrap a model so that the bottom-centre of its bounding box sits at `pos`
     * (metres), scaled by `s` and yawed by `yawDeg`.
     */
    place(
        model: THREE.Object3D,
        pos: [number, number, number],
        yawDeg: number,
        s: number,
        parent: THREE.Object3D = this.root
    ) {
        model.scale.multiplyScalar(s);
        model.updateMatrixWorld(true);
        const bb = new THREE.Box3().setFromObject(model);
        const c = bb.getCenter(new THREE.Vector3());
        model.position.set(-c.x, -bb.min.y, -c.z);
        const g = new THREE.Group();
        g.add(model);
        g.position.set(pos[0], pos[1], pos[2]);
        g.rotation.y = yawDeg * DEG;
        parent.add(g);
        return g;
    }

    getModel(name: string): THREE.Object3D | undefined {
        const gltf = this.resources.items.gltfModel[name];
        if (!gltf) {
            console.warn('[BrightRoom] missing model', name);
            return undefined;
        }
        return gltf.scene.clone(true);
    }

    // ---------- shell ----------

    buildShell() {
        const wallBack = std(0xe4e5e6, 1);
        const wallLeft = std(0xdcdee0, 1);
        const frameMat = std(0xf7f4ee, 0.8);

        // Floor
        this.floor = this.box(
            -2.12,
            1.8,
            -0.12,
            0,
            -1.72,
            1.2,
            std(0xcfccc5, 0.9),
            false,
            true
        );
        // Back wall
        this.box(-2.12, 1.8, 0, 2.4, -1.72, -1.6, wallBack, false, true);
        // Left wall around the window hole
        const lx0 = -2.12;
        const lx1 = -2.0;
        this.box(lx0, lx1, 0, 0.95, -1.72, 1.2, wallLeft);
        this.box(lx0, lx1, 2.05, 2.4, -1.72, 1.2, wallLeft);
        this.box(lx0, lx1, 0.95, 2.05, -1.72, -1.25, wallLeft);
        this.box(lx0, lx1, 0.95, 2.05, 0.15, 1.2, wallLeft);
        // Window frame, mullion, sill
        this.box(-2.1, -2.03, 1.0, 2.0, -1.25, -1.2, frameMat);
        this.box(-2.1, -2.03, 1.0, 2.0, 0.1, 0.15, frameMat);
        this.box(-2.1, -2.03, 0.95, 1.0, -1.25, 0.15, frameMat);
        this.box(-2.1, -2.03, 2.0, 2.05, -1.25, 0.15, frameMat);
        this.box(-2.1, -2.03, 1.0, 2.0, -0.57, -0.53, frameMat);
        this.box(-2.0, -1.9, 0.93, 0.95, -1.3, 0.2, frameMat);

        // Sky backdrop seen through the window
        const sky = new THREE.Mesh(
            new THREE.PlaneGeometry(2.3, 1.7),
            new THREE.MeshBasicMaterial({
                color: srgb(0xf4f7fa),
                side: THREE.DoubleSide,
                toneMapped: false,
            })
        );
        sky.position.set(-2.22, 1.35, -0.55);
        sky.rotation.y = 90 * DEG;
        this.root.add(sky);

        // Cream roller blind, half lowered
        const blind = std(0xe8e4da, 1, {
            emissive: srgb(0xfff4e0),
            emissiveIntensity: 0.35,
        });
        this.box(-1.99, -1.97, 1.5, 2.1, -1.3, 0.2, blind, true, false);
        const roller = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 1.56, 24),
            std(0xe4d9c1, 0.8)
        );
        roller.rotation.x = 90 * DEG;
        roller.position.set(-1.955, 2.13, -0.55);
        roller.castShadow = true;
        this.root.add(roller);
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 1.5, 12),
            std(0xd8cdb5, 0.7)
        );
        bar.rotation.x = 90 * DEG;
        bar.position.set(-1.98, 1.49, -0.55);
        bar.castShadow = true;
        this.root.add(bar);

        // Rug (2 mm decal)
        const rug = new THREE.Mesh(
            new THREE.CylinderGeometry(0.95, 0.95, 0.002, 64),
            std(0xb4c0bb, 1, {
                polygonOffset: true,
                polygonOffsetFactor: -1,
                polygonOffsetUnits: -1,
            })
        );
        rug.position.set(0.35, 0.001, -0.65);
        rug.receiveShadow = true;
        this.root.add(rug);
    }

    // ---------- desk and primitive props ----------

    buildDesk() {
        const wood = std(0x4a3325, 0.55);
        const black = std(0x18191b, 0.5);
        this.box(-0.5, 1.1, 0.72, 0.76, -1.55, -0.85, wood);
        for (const x of [-0.38, 0.98]) {
            this.box(x - 0.035, x + 0.035, 0.04, 0.72, -1.235, -1.165, black);
            this.box(x - 0.035, x + 0.035, 0, 0.04, -1.51, -0.89, black);
        }
        this.box(-0.4, 1.0, 0.67, 0.72, -1.225, -1.175, black);

        // Laptop stand: pitched plate with two side wedges
        const silver = std(0xc9ccd0, 0.4);
        const stand = new THREE.Group();
        stand.position.set(0.93, 0.76, -1.2);
        stand.rotation.y = -10 * DEG;
        this.root.add(stand);
        const rise = 0.27 * Math.tan(18 * DEG);
        const pitch = new THREE.Group();
        pitch.position.set(0, 0, 0.135);
        pitch.rotation.x = 18 * DEG;
        stand.add(pitch);
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.01, 0.27),
            silver
        );
        plate.position.set(0, 0.005, -0.135);
        plate.castShadow = plate.receiveShadow = true;
        pitch.add(plate);
        const shape = new THREE.Shape();
        shape.moveTo(0.135, 0);
        shape.lineTo(-0.135, 0);
        shape.lineTo(-0.135, rise);
        shape.closePath();
        for (const x of [-0.135, 0.125]) {
            const wedge = new THREE.Mesh(
                new THREE.ExtrudeGeometry(shape, {
                    depth: 0.01,
                    bevelEnabled: false,
                }),
                silver
            );
            wedge.rotation.y = -90 * DEG;
            wedge.position.set(x + 0.01, 0, 0);
            wedge.castShadow = wedge.receiveShadow = true;
            stand.add(wedge);
        }
        const laptop = this.getModel('roomLaptop');
        if (laptop) {
            this.toLit(laptop, {
                metalDark: { color: 0xb9bcc0, rough: 0.5 },
                metalMedium: { color: 0x9ea2a7, rough: 0.5 },
                metal: { color: 0xdfe8f2, rough: 0.3, emissive: 0xdfe8f2 },
            });
            this.place(laptop, [0, 0.01, -0.135], 0, 1.05, pitch);
        }

        // Mug
        const mugMat = std(0x2f9d98, 0.35, { side: THREE.DoubleSide });
        const mug = new THREE.Group();
        mug.position.copy(PROPS.mug);
        const body = new THREE.Mesh(
            new THREE.LatheGeometry(
                [
                    new THREE.Vector2(0.0001, 0),
                    new THREE.Vector2(0.038, 0),
                    new THREE.Vector2(0.038, 0.095),
                    new THREE.Vector2(0.035, 0.095),
                    new THREE.Vector2(0.035, 0.004),
                    new THREE.Vector2(0.0001, 0.004),
                ],
                24
            ),
            mugMat
        );
        body.castShadow = body.receiveShadow = true;
        mug.add(body);
        const coffee = new THREE.Mesh(
            new THREE.CircleGeometry(0.035, 24),
            std(0x3a281c, 0.4)
        );
        coffee.rotation.x = -90 * DEG;
        coffee.position.y = 0.08;
        mug.add(coffee);
        const handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.018, 0.005, 8, 16),
            mugMat
        );
        handle.position.set(0.052, 0.05, 0);
        handle.castShadow = true;
        mug.add(handle);
        this.root.add(mug);

        // Phone
        const phone = new THREE.Group();
        phone.position.set(0.03, 0.764, -0.97);
        phone.rotation.y = 25 * DEG;
        const phoneBody = new THREE.Mesh(
            new THREE.BoxGeometry(0.072, 0.008, 0.15),
            std(0x24272b, 0.3)
        );
        phoneBody.castShadow = phoneBody.receiveShadow = true;
        phone.add(phoneBody);
        const phoneScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(0.066, 0.142),
            std(0x10151d, 0.15)
        );
        phoneScreen.rotation.x = -90 * DEG;
        phoneScreen.position.y = 0.0045;
        phone.add(phoneScreen);
        this.root.add(phone);
    }

    // ---------- pool GLB props ----------

    buildProps() {
        const top = 0.76;
        const mon = this.getModel('roomMonitor');
        if (mon) {
            mon.traverse((c) => {
                if (
                    c instanceof THREE.Mesh &&
                    (c.material as THREE.Material).name === 'metal'
                ) {
                    c.userData.glass = true;
                }
            });
            this.toLit(mon, { metalDark: { color: 0x2a2c2f, rough: 0.45 } });
            // The glass quad is replaced by the CSS3D iframe + GL occluder.
            let hidden = 0;
            mon.traverse((c) => {
                if (c instanceof THREE.Mesh && c.userData.glass) {
                    c.visible = false;
                    hidden++;
                }
            });
            if (!hidden) console.warn('[BrightRoom] monitor glass not found');
            const g = new THREE.Group();
            g.scale.setScalar(MONITOR.scale);
            g.position.copy(MONITOR.pivot);
            g.rotation.y = MONITOR.yawDeg * DEG;
            mon.position.set(-0.19635, 0, 0.05207);
            g.add(mon);
            this.root.add(g);
        } else {
            // Fallback slab so the iframe still sits in something
            this.box(0.12, 0.72, top, top + 0.45, -1.34, -1.31, std(0x2a2c2f));
        }

        const place = (
            name: string,
            colours: ColourMap,
            pos: [number, number, number],
            yaw: number,
            s: number
        ) => {
            const m = this.getModel(name);
            if (!m) return undefined;
            this.toLit(m, colours);
            return this.place(m, pos, yaw, s);
        };

        this.chair = this.buildMeshChair();
        place(
            'roomKeyboard',
            {
                metalDark: { color: 0xe4e1da },
                metalMedium: { color: 0xc7c4bd },
            },
            [0.42, top, -1.0],
            0,
            1.3
        );
        place(
            'roomMouse',
            { metalDark: { color: 0xe4e1da } },
            [0.7, top, -0.99],
            -10,
            1.4
        );
        place(
            'roomBooks',
            {
                carpetDarker: { color: 0xb85c4a },
                carpetWhite: { color: 0xf3efe6 },
                plant: { color: 0x5f8f74 },
                metal: { color: 0x6f8aa8 },
            },
            [0.04, top, -1.45],
            8,
            1.0
        );
        this.buildBookFile(-0.38, top, -1.42, 4);
        this.buildBookFile(-0.17, top, -1.42, -3);

        const frame = this.getModel('roomFrame');
        if (frame) {
            this.fixPbr(frame, 0xe9dcc6);
            this.place(frame, [0.99, top, -0.92], 20, 0.3);
        }
        const plant = this.getModel('roomPlant');
        if (plant) {
            this.fixPbr(plant);
            this.place(plant, [-0.38, top, -0.97], 0, 1.1);
        }
    }

    // ---------- procedural props ----------

    /** Perforated "mesh" look: white = opaque, black = hole (used as alphaMap). */
    meshAlphaTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000';
        // staggered diamond holes
        for (const [cx, cy] of [
            [16, 16],
            [48, 16],
            [16, 48],
            [48, 48],
            [32, 32],
            [0, 32],
            [64, 32],
            [32, 0],
            [32, 64],
        ]) {
            ctx.beginPath();
            ctx.moveTo(cx, cy - 10);
            ctx.lineTo(cx + 10, cy);
            ctx.lineTo(cx, cy + 10);
            ctx.lineTo(cx - 10, cy);
            ctx.closePath();
            ctx.fill();
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }

    /**
     * Grey mesh-back office chair, built from primitives. Faces -z (towards the
     * desk); the backrest is on the +z side, toward the camera.
     */
    buildMeshChair() {
        const black = std(0x1f2124, 0.5);
        const fabric = std(0x7b8087, 0.95);
        const g = new THREE.Group();
        const add = (m: THREE.Object3D, cast = true) => {
            m.traverse((c) => {
                if (c instanceof THREE.Mesh) {
                    c.castShadow = cast;
                    c.receiveShadow = true;
                }
            });
            g.add(m);
            return m;
        };
        const cyl = (r0: number, r1: number, h: number, y: number, mat: THREE.Material) => {
            const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 20), mat);
            m.position.y = y;
            return m;
        };
        const cube = (
            w: number,
            h: number,
            d: number,
            x: number,
            y: number,
            z: number,
            mat: THREE.Material
        ) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
            m.position.set(x, y, z);
            return m;
        };

        // Five-star base with casters, gas column
        for (let i = 0; i < 5; i++) {
            const arm = new THREE.Group();
            arm.rotation.y = ((i * 72 + 18) * Math.PI) / 180;
            const leg = cube(0.3, 0.032, 0.05, 0.15, 0.075, 0, black);
            arm.add(leg);
            const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), black);
            wheel.position.set(0.3, 0.03, 0);
            arm.add(wheel);
            add(arm);
        }
        add(cyl(0.05, 0.06, 0.05, 0.085, black));
        add(cyl(0.024, 0.024, 0.3, 0.26, black));

        // Seat
        add(cube(0.5, 0.04, 0.48, 0, 0.44, 0, black));
        add(cube(0.5, 0.07, 0.48, 0, 0.495, 0, fabric));

        // Backrest: black frame + perforated mesh panel, slightly reclined
        const back = new THREE.Group();
        back.position.set(0, 0.53, 0.22);
        back.rotation.x = 8 * DEG;
        const bw = 0.46;
        const bh = 0.52;
        const frameT = 0.03;
        back.add(cube(frameT, bh, 0.03, -bw / 2, bh / 2, 0, black));
        back.add(cube(frameT, bh, 0.03, bw / 2, bh / 2, 0, black));
        back.add(cube(bw + frameT, frameT, 0.03, 0, bh, 0, black));
        back.add(cube(bw + frameT, frameT, 0.03, 0, 0, 0, black));
        const alpha = this.meshAlphaTexture();
        alpha.repeat.set(bw / 0.02, bh / 0.02);
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(bw, bh),
            new THREE.MeshStandardMaterial({
                color: srgb(0x6c7178),
                roughness: 0.9,
                metalness: 0,
                alphaMap: alpha,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            })
        );
        panel.position.set(0, bh / 2, 0);
        back.add(panel);
        // Uprights to the seat and headrest
        back.add(cube(0.03, 0.14, 0.03, 0, -0.06, -0.02, black));
        back.add(cube(0.02, 0.1, 0.02, 0, bh + 0.05, 0, black));
        back.add(cube(0.22, 0.09, 0.05, 0, bh + 0.13, 0, fabric));
        add(back);

        // Armrests
        for (const x of [-0.27, 0.27]) {
            add(cube(0.03, 0.2, 0.03, x, 0.58, 0.02, black));
            add(cube(0.06, 0.03, 0.26, x, 0.69, -0.02, black));
        }

        // Same pose as before: in front of the desk, facing it.
        g.position.set(0.42, 0, -0.4);
        this.root.add(g);
        return g;
    }

    /** Magazine file filled with book spines (spines face +z, towards the camera). */
    buildBookFile(x: number, y: number, z: number, yawDeg: number) {
        const holder = new THREE.Group();
        holder.position.set(x, y, z);
        holder.rotation.y = yawDeg * DEG;
        const cream = std(0xe9e6df, 0.85);
        const w = 0.19;
        const d = 0.2;
        const h = 0.16;
        const t = 0.006;
        const mk = (
            sx: number,
            sy: number,
            sz: number,
            px: number,
            py: number,
            pz: number,
            mat: THREE.Material
        ) => {
            const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
            m.position.set(px, py, pz);
            m.castShadow = m.receiveShadow = true;
            holder.add(m);
        };
        mk(w, t, d, 0, t / 2, 0, cream); // floor
        mk(t, h, d, -w / 2, h / 2, 0, cream); // sides
        mk(t, h, d, w / 2, h / 2, 0, cream);
        mk(w, h, t, 0, h / 2, -d / 2, cream); // back
        mk(w, h * 0.55, t, 0, (h * 0.55) / 2, d / 2, cream); // low front
        const palette = [0x6f8aa8, 0xb8715b, 0x7e9a86, 0xd0b46a, 0x4e5663, 0xc9c3b6, 0x8a7aa0];
        const heights = [0.2, 0.23, 0.19, 0.24, 0.21, 0.22, 0.18];
        let px = -w / 2 + 0.018;
        for (let i = 0; i < 7; i++) {
            const bt = 0.02 + (i % 3) * 0.003;
            if (px + bt > w / 2 - 0.008) break;
            mk(bt, heights[i], d - 0.04, px + bt / 2, heights[i] / 2 + t, 0.01, std(palette[i], 0.8));
            px += bt + 0.002;
        }
        this.root.add(holder);
        return holder;
    }

    // ---------- lights ----------

    buildLights() {
        const hemi = new THREE.HemisphereLight(
            srgb(0xfafcff),
            srgb(0xcfd0d0),
            0.95
        );
        this.scene.add(hemi);

        const sun = new THREE.DirectionalLight(srgb(0xfff7ec), 0.85);
        const dir = new THREE.Vector3(0.767, -0.598, -0.23);
        const target = new THREE.Vector3(300, 800, -800);
        sun.position.copy(target).addScaledVector(dir, -9000);
        sun.target.position.copy(target);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        const cam = sun.shadow.camera;
        cam.left = -3600;
        cam.right = 3600;
        cam.top = 3600;
        cam.bottom = -3600;
        cam.near = 4000;
        cam.far = 14000;
        sun.shadow.bias = -0.0002;
        sun.shadow.normalBias = 2;
        this.scene.add(sun);
        this.scene.add(sun.target);
        this.sun = sun;
    }

    // ---------- API ----------

    setChairVisible(v: boolean) {
        if (this.chair && this.chair.visible !== v) this.chair.visible = v;
    }

    installDebugHook() {
        const app = this.application;
        const screen = computeScreen();
        const project = (v: THREE.Vector3) => {
            const p = v.clone().project(app.camera.instance);
            return [p.x, p.y];
        };
        const corners = () => {
            const q = new THREE.Quaternion().setFromEuler(screen.euler);
            return [
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ].map(([sx, sy]) =>
                new THREE.Vector3(
                    (sx * screen.worldSize.w) / 2,
                    (sy * screen.worldSize.h) / 2,
                    0
                )
                    .applyQuaternion(q)
                    .add(screen.position)
            );
        };
        const boxes: { [k: string]: THREE.Box3 } = {
            room: new THREE.Box3(
                new THREE.Vector3(-2120, -120, -1720),
                new THREE.Vector3(1800, 2400, 1200)
            ),
            hero: new THREE.Box3(
                new THREE.Vector3(-2000, 0, -1600),
                new THREE.Vector3(1200, 2400, 200)
            ),
        };
        (window as any).__roomDebug = {
            camera: () => app.camera.instance.position.toArray(),
            projectScreenCorners: () => corners().map(project),
            screenRect: () => {
                const pts = corners().map((c) => {
                    const [x, y] = project(c);
                    return [
                        ((x + 1) / 2) * app.sizes.width,
                        ((1 - y) / 2) * app.sizes.height,
                    ];
                });
                const xs = pts.map((p) => p[0]);
                const ys = pts.map((p) => p[1]);
                return {
                    x: Math.min(...xs),
                    y: Math.min(...ys),
                    w: Math.max(...xs) - Math.min(...xs),
                    h: Math.max(...ys) - Math.min(...ys),
                };
            },
            projectBox: (name: string) => {
                const b = boxes[name];
                const out: number[][] = [];
                for (const x of [b.min.x, b.max.x])
                    for (const y of [b.min.y, b.max.y])
                        for (const z of [b.min.z, b.max.z])
                            out.push(project(new THREE.Vector3(x, y, z)));
                return out;
            },
            dimOpacity: () => {
                const cam = app.camera.instance.position;
                const d = cam.clone().sub(screen.position);
                const dist = d.length();
                const dot = Math.max(0, d.normalize().dot(screen.normal));
                return dimOpacity(dist, dot);
            },
            chairVisible: () => (this.chair ? this.chair.visible : false),
            setSun: (on: boolean) => {
                this.sun.visible = on;
            },
            setFloorVisible: (v: boolean) => {
                this.floor.visible = v;
            },
        };
    }
}
