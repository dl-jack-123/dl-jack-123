import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import Time from '../Utils/Time';
import { SteamOptions } from './roomLayout';

// @ts-ignore
import fragmentShader from '../Shaders/coffee/fragment.glsl';
// @ts-ignore
import vertexShader from '../Shaders/coffee/vertex.glsl';

export default class CoffeeSteam {
    model: any;
    application: Application;
    resources: Resources;
    scene: THREE.Scene;
    time: Time;
    options: SteamOptions;

    constructor(options?: SteamOptions) {
        // Defaults reproduce the classic room's steam
        this.options = options || {
            position: new THREE.Vector3(1670, 200, 900),
            size: { w: 280, h: 700 },
            color: '#c9c9c9',
            billboard: false,
        };
        this.application = new Application();
        this.resources = this.application.resources;
        this.scene = this.application.scene;
        this.time = this.application.time;

        this.setModel();
    }

    setModel() {
        this.model = {};

        this.model.color = this.options.color;

        // Material
        this.model.material = new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uTimeFrequency: { value: 0.001 },
                uUvFrequency: { value: new THREE.Vector2(3, 5) },
                uColor: { value: new THREE.Color(this.model.color) },
            },
        });

        this.model.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(this.options.size.w, this.options.size.h),
            this.model.material
        );

        this.model.mesh.position.copy(this.options.position);
        this.model.mesh.renderOrder = 20;

        this.scene.add(this.model.mesh);
    }

    update() {
        this.model.material.uniforms.uTime.value = this.time.elapsed;
        if (this.options.billboard) {
            const cam = this.application.camera.instance.position;
            const mesh = this.model.mesh;
            mesh.rotation.y = Math.atan2(cam.x - mesh.position.x, cam.z - mesh.position.z);
        }
    }
}
