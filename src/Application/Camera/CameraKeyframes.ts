import * as THREE from 'three';
import { CameraKey } from './Camera';
import Time from '../Utils/Time';
import Application from '../Application';
import Mouse from '../Utils/Mouse';
import Sizes from '../Utils/Sizes';
import { isBright } from '../roomMode';
import {
    computeScreen,
    deskDistance,
    dirFromAngles,
    getAspect,
    idleDistance,
    monitorDistance,
} from '../World/roomLayout';

export class CameraKeyframeInstance {
    position: THREE.Vector3;
    focalPoint: THREE.Vector3;

    constructor(keyframe: CameraKeyframe) {
        this.position = keyframe.position;
        this.focalPoint = keyframe.focalPoint;
    }

    update() {}
}

const keys: { [key in CameraKey]: CameraKeyframe } = {
    idle: {
        position: new THREE.Vector3(-20000, 12000, 20000),
        focalPoint: new THREE.Vector3(0, -1000, 0),
    },
    monitor: {
        position: new THREE.Vector3(0, 950, 2000),
        focalPoint: new THREE.Vector3(0, 950, 0),
    },
    desk: {
        position: new THREE.Vector3(0, 1800, 5500),
        focalPoint: new THREE.Vector3(0, 500, 0),
    },
    loading: {
        position: new THREE.Vector3(-35000, 35000, 35000),
        focalPoint: new THREE.Vector3(0, -5000, 0),
    },
    orbitControlsStart: {
        position: new THREE.Vector3(-15000, 10000, 15000),
        focalPoint: new THREE.Vector3(-100, 350, 0),
    },
};

export class MonitorKeyframe extends CameraKeyframeInstance {
    application: Application;
    sizes: Sizes;
    targetPos: THREE.Vector3;
    origin: THREE.Vector3;

    constructor() {
        const keyframe = keys.monitor;
        super(keyframe);
        this.application = new Application();
        this.sizes = this.application.sizes;
        this.origin = new THREE.Vector3().copy(keyframe.position);
        this.targetPos = new THREE.Vector3().copy(keyframe.position);
    }

    update() {
        const aspect = this.sizes.height / this.sizes.width;
        const additionalZoom = this.sizes.width < 768 ? 0 : 600;
        this.targetPos.z = this.origin.z + aspect * 1200 - additionalZoom;
        this.position.copy(this.targetPos);
    }
}

export class LoadingKeyframe extends CameraKeyframeInstance {
    constructor() {
        const keyframe = keys.loading;
        super(keyframe);
    }

    update() {}
}

export class DeskKeyframe extends CameraKeyframeInstance {
    origin: THREE.Vector3;
    application: Application;
    mouse: Mouse;
    sizes: Sizes;
    targetFoc: THREE.Vector3;
    targetPos: THREE.Vector3;

    constructor() {
        const keyframe = keys.desk;
        super(keyframe);
        this.application = new Application();
        this.mouse = this.application.mouse;
        this.sizes = this.application.sizes;
        this.origin = new THREE.Vector3().copy(keyframe.position);
        this.targetFoc = new THREE.Vector3().copy(keyframe.focalPoint);
        this.targetPos = new THREE.Vector3().copy(keyframe.position);
    }

    update() {
        this.targetFoc.x +=
            (this.mouse.x - this.sizes.width / 2 - this.targetFoc.x) * 0.05;
        this.targetFoc.y +=
            (-(this.mouse.y - this.sizes.height) - this.targetFoc.y) * 0.05;

        this.targetPos.x +=
            (this.mouse.x - this.sizes.width / 2 - this.targetPos.x) * 0.025;
        this.targetPos.y +=
            (-(this.mouse.y - this.sizes.height * 2) - this.targetPos.y) *
            0.025;

        const aspect = this.sizes.height / this.sizes.width;
        this.targetPos.z = this.origin.z + aspect * 3000 - 1800;

        this.focalPoint.copy(this.targetFoc);
        this.position.copy(this.targetPos);
    }
}

export class IdleKeyframe extends CameraKeyframeInstance {
    time: Time;
    origin: THREE.Vector3;

    constructor() {
        const keyframe = keys.idle;
        super(keyframe);
        this.origin = new THREE.Vector3().copy(keyframe.position);
        this.time = new Time();
    }

    update() {
        this.position.x =
            Math.sin((this.time.elapsed + 19000) * 0.00008) * this.origin.x;
        this.position.y =
            Math.sin((this.time.elapsed + 1000) * 0.000004) * 4000 +
            this.origin.y -
            3000;
        this.position.z = this.position.z;
    }
}

export class OrbitControlsStart extends CameraKeyframeInstance {
    constructor() {
        const keyframe = keys.orbitControlsStart;
        super(keyframe);
    }

    update() {}
}

// ---------------- Bright room keyframes ----------------

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const DEG = THREE.MathUtils.DEG2RAD;

const mk = (x = 0, y = 0, z = 0): CameraKeyframe => ({
    position: new THREE.Vector3(x, y, z),
    focalPoint: new THREE.Vector3(x, y, z),
});

export class BrightIdleKeyframe extends CameraKeyframeInstance {
    application: Application;
    target = new THREE.Vector3(0, 700, -300);

    constructor() {
        super(mk());
        this.application = new Application();
        this.focalPoint.copy(this.target);
        this.update();
    }

    update() {
        const { sizes, time } = this.application;
        const ms = time.elapsed;
        const az = 38 + 5 * Math.sin((2 * Math.PI * (ms + 19000)) / 60000);
        const el = 33 + 1.5 * Math.sin((2 * Math.PI * (ms + 1000)) / 90000);
        const d = idleDistance(getAspect(sizes.width, sizes.height));
        this.position
            .copy(dirFromAngles(az, el))
            .multiplyScalar(d)
            .add(this.target);
        this.focalPoint.copy(this.target);
    }
}

export class BrightDeskKeyframe extends CameraKeyframeInstance {
    application: Application;
    base = new THREE.Vector3(420, 950, -1250);
    targetFoc = new THREE.Vector3();
    targetPos = new THREE.Vector3();

    constructor() {
        super(mk());
        this.application = new Application();
        this.targetFoc.copy(this.base);
        this.targetPos.copy(this.base);
        this.update();
    }

    update() {
        const { sizes, mouse } = this.application;
        // Mouse starts at 0 before the first mousemove: treat as centred
        const nx = mouse.x === 0 ? 0 : clamp(mouse.x / sizes.width - 0.5, -0.5, 0.5);
        const ny = mouse.y === 0 ? 0 : clamp(mouse.y / sizes.height - 0.5, -0.5, 0.5);
        const d = deskDistance(getAspect(sizes.width, sizes.height));
        const basePos = dirFromAngles(14, 22).multiplyScalar(d).add(this.base);

        this.targetFoc.x += (this.base.x + 500 * nx - this.targetFoc.x) * 0.05;
        this.targetFoc.y += (this.base.y - 300 * ny - this.targetFoc.y) * 0.05;
        this.targetFoc.z = this.base.z;
        this.targetPos.x += (basePos.x + 400 * nx - this.targetPos.x) * 0.025;
        this.targetPos.y += (basePos.y - 250 * ny - this.targetPos.y) * 0.025;
        this.targetPos.z = basePos.z;

        this.focalPoint.copy(this.targetFoc);
        this.position.copy(this.targetPos);
    }
}

export class BrightMonitorKeyframe extends CameraKeyframeInstance {
    application: Application;
    screen = computeScreen();

    constructor() {
        super(mk());
        this.application = new Application();
        this.update();
    }

    update() {
        const { sizes } = this.application;
        const d = monitorDistance(getAspect(sizes.width, sizes.height));
        this.position
            .copy(this.screen.normal)
            .multiplyScalar(d)
            .add(this.screen.position);
        this.focalPoint.copy(this.screen.position);
    }
}

const staticKey = (az: number, el: number, d: number, target: THREE.Vector3) => {
    const k = mk();
    k.focalPoint.copy(target);
    k.position.copy(dirFromAngles(az, el)).multiplyScalar(d).add(target);
    return new CameraKeyframeInstance(k);
};

export const createKeyframes = (): { [key in CameraKey]: CameraKeyframeInstance } =>
    isBright
        ? {
              idle: new BrightIdleKeyframe(),
              monitor: new BrightMonitorKeyframe(),
              loading: staticKey(50, 40, 14000, new THREE.Vector3(0, 400, -400)),
              desk: new BrightDeskKeyframe(),
              orbitControlsStart: staticKey(
                  38,
                  33,
                  6000,
                  new THREE.Vector3(0, 800, -700)
              ),
          }
        : {
              idle: new IdleKeyframe(),
              monitor: new MonitorKeyframe(),
              loading: new LoadingKeyframe(),
              desk: new DeskKeyframe(),
              orbitControlsStart: new OrbitControlsStart(),
          };

export const ORBIT_LIMITS = isBright
    ? {
          minDistance: 1500,
          maxDistance: 9000,
          maxPolarAngle: Math.PI / 2,
          minPolarAngle: 0.35,
          minAzimuthAngle: -10 * DEG,
          maxAzimuthAngle: 85 * DEG,
      }
    : {
          minDistance: 4000,
          maxDistance: 29000,
          maxPolarAngle: Math.PI / 2,
          minPolarAngle: 0,
          minAzimuthAngle: -Infinity,
          maxAzimuthAngle: Infinity,
      };
