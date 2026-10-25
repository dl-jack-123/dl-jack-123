import AudioManager from './AudioManager';
import * as THREE from 'three';
import UIEventBus from '../UI/EventBus';
import { Vector3 } from 'three';
import {
    MUSIC_OFF,
    isValidMusicChoice,
    loadMusicChoice,
} from './musicTracks';

export class AudioSource {
    manager: AudioManager;

    constructor(manager: AudioManager) {
        this.manager = manager;
    }

    update() {}
}
export class ComputerAudio extends AudioSource {
    lastKey: string;

    constructor(manager: AudioManager) {
        super(manager);

        document.addEventListener('mousedown', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('mouseDown', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        });

        document.addEventListener('mouseup', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('mouseUp', {
                    volume: 0.8,
                    position: new THREE.Vector3(800, -300, 1200),
                });
            }
        });

        document.addEventListener('keyup', (event) => {
            // @ts-ignore
            if (event.inComputer) {
                this.lastKey = '';
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key.includes('_AUTO_')) {
                this.manager.playAudio('ccType', {
                    volume: 0.1,
                    randDetuneScale: 0,
                    pitch: 20,
                });
                return;
            }
            if (this.lastKey === event.key) return;
            this.lastKey = event.key;

            // @ts-ignore
            if (event.inComputer) {
                this.manager.playAudio('keyboardKeydown', {
                    volume: 0.8,
                    position: new THREE.Vector3(-300, -400, 1200),
                });
            }
        });
    }
}

export class AmbienceAudio extends AudioSource {
    poolKey: string;
    musicKey: string | null = null;
    musicChoice: string = loadMusicChoice();
    started = false;

    playMusic(choice: string) {
        this.musicChoice = choice;
        if (this.musicKey) {
            this.manager.stopAudio(this.musicKey);
            this.musicKey = null;
        }
        if (choice === MUSIC_OFF) return;
        // Low volume, loops. Master volume / mute is handled by the audio manager.
        this.musicKey = this.manager.playAudio(choice, {
            volume: 0.3,
            loop: true,
            randDetuneScale: 0,
        });
    }

    constructor(manager: AudioManager) {
        super(manager);
        UIEventBus.on('musicChange', (choice: string) => {
            if (!isValidMusicChoice(choice) || choice === this.musicChoice)
                return;
            // Before the loading screen is done, just remember the choice
            if (!this.started) {
                this.musicChoice = choice;
                return;
            }
            this.playMusic(choice);
        });
        UIEventBus.on('loadingScreenDone', () => {
            this.poolKey = this.manager.playAudio('office', {
                volume: 1,
                loop: true,
                randDetuneScale: 0,
                filter: {
                    type: 'lowpass',
                    frequency: 1000,
                },
            });
            this.started = true;
            this.playMusic(this.musicChoice);
            this.manager.playAudio('startup', {
                volume: 0.4,
                randDetuneScale: 0,
            });
        });
    }

    mapValues(
        input: number,
        input_start: number,
        input_end: number,
        output_start: number,
        output_end: number
    ) {
        return (
            output_start +
            ((output_end - output_start) / (input_end - input_start)) *
                (input - input_start)
        );
    }

    update() {
        const cameraPosition =
            this.manager.application.camera.instance.position;
        const y = cameraPosition.y;
        const x = cameraPosition.x;
        const z = cameraPosition.z;

        // calculate distance to origin
        const distance = Math.sqrt(x * x + y * y + z * z);

        const freq = this.mapValues(distance, 0, 10000, 100, 22000);

        const volume = this.mapValues(distance, 1200, 10000, 0, 0.2);
        const volumeClamped = Math.min(Math.max(volume, 0.05), 0.1);

        this.manager.setAudioFilterFrequency(this.poolKey, freq - 3000);
        this.manager.setAudioVolume(this.poolKey, volumeClamped);
    }
}
