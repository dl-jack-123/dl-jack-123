import { createUI, createVolumeUI, createProUI } from './App';

export default class UI {
    constructor() {
        createUI();
        createVolumeUI();
        createProUI();
    }
}
