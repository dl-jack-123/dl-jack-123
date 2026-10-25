import Application from '../Application';
import Resources from '../Utils/Resources';
import ComputerSetup from './Computer';
import MonitorScreen from './MonitorScreen';
import Environment from './Environment';
import Decor from './Decor';
import CoffeeSteam from './CoffeeSteam';
import Cursor from './Cursor';
import Hitboxes from './Hitboxes';
import AudioManager from '../Audio/AudioManager';
import BrightRoom from './BrightRoom';
import { isBright } from '../roomMode';
import {
    brightMonitorConfig,
    brightSteamOptions,
    classicMonitorConfig,
} from './roomLayout';
import { CameraKey } from '../Camera/Camera';
import { updateFloating } from '../UI/pro/floating';
export default class World {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;

    // Objects in the scene
    brightRoom: BrightRoom;
    environment: Environment;
    decor: Decor;
    computerSetup: ComputerSetup;
    monitorScreen: MonitorScreen;
    coffeeSteam: CoffeeSteam;
    cursor: Cursor;
    audioManager: AudioManager;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            if (isBright) {
                this.brightRoom = new BrightRoom();
                this.monitorScreen = new MonitorScreen(brightMonitorConfig());
                this.coffeeSteam = new CoffeeSteam(brightSteamOptions());
            } else {
                this.environment = new Environment();
                this.decor = new Decor();
                this.computerSetup = new ComputerSetup();
                this.monitorScreen = new MonitorScreen(classicMonitorConfig());
                this.coffeeSteam = new CoffeeSteam();
            }
            this.audioManager = new AudioManager();
            // const hb = new Hitboxes();
            // this.cursor = new Cursor();
        });
    }

    update() {
        if (this.monitorScreen) this.monitorScreen.update();
        if (this.environment) this.environment.update();
        if (this.coffeeSteam) this.coffeeSteam.update();
        if (this.audioManager) this.audioManager.update();
        if (this.brightRoom) {
            // The chair stands between the camera and the screen at the monitor key
            const cam = this.application.camera;
            this.brightRoom.setChairVisible(
                !(
                    cam.currentKeyframe === CameraKey.MONITOR ||
                    cam.targetKeyframe === CameraKey.MONITOR
                )
            );
            // Wall cards only make sense in the idle overview
            updateFloating(
                cam.instance,
                this.application.sizes.width,
                this.application.sizes.height,
                cam.currentKeyframe === CameraKey.IDLE &&
                    (!cam.targetKeyframe || cam.targetKeyframe === CameraKey.IDLE) &&
                    !cam.freeCam
            );
        }
    }
}
