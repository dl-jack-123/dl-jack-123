import { isBright } from './roomMode';

const classicSources: Resource[] = [
    {
        name: 'computerSetupModel',
        type: 'gltfModel',
        path: 'models/Computer/computer_setup.glb',
    },
    {
        name: 'computerSetupTexture',
        type: 'texture',
        path: 'models/Computer/baked_computer.jpg',
    },
    {
        name: 'environmentModel',
        type: 'gltfModel',
        path: 'models/World/environment.glb',
    },
    {
        name: 'environmentTexture',
        type: 'texture',
        path: 'models/World/baked_environment.jpg',
    },
    {
        name: 'decorModel',
        type: 'gltfModel',
        path: 'models/Decor/decor.glb',
    },
    {
        name: 'decorTexture',
        type: 'texture',
        path: 'models/Decor/baked_decor_modified.jpg',
    },
    {
        name: 'monitorSmudgeTexture',
        type: 'texture',
        path: 'textures/monitor/layers/compressed/smudges.jpg',
    },
    {
        name: 'monitorShadowTexture',
        type: 'texture',
        path: 'textures/monitor/layers/compressed/shadow-compressed.png',
    },

];

const sharedSources: Resource[] = [
    {
        name: 'mouseDown',
        type: 'audio',
        path: 'audio/mouse/mouse_down.mp3',
    },
    {
        name: 'mouseUp',
        type: 'audio',
        path: 'audio/mouse/mouse_up.mp3',
    },
    {
        name: 'keyboardKeydown1',
        type: 'audio',
        path: 'audio/keyboard/key_1.mp3',
    },
    {
        name: 'keyboardKeydown2',
        type: 'audio',
        path: 'audio/keyboard/key_2.mp3',
    },
    {
        name: 'keyboardKeydown3',
        type: 'audio',
        path: 'audio/keyboard/key_3.mp3',
    },
    {
        name: 'keyboardKeydown4',
        type: 'audio',
        path: 'audio/keyboard/key_4.mp3',
    },
    {
        name: 'keyboardKeydown5',
        type: 'audio',
        path: 'audio/keyboard/key_5.mp3',
    },
    {
        name: 'keyboardKeydown6',
        type: 'audio',
        path: 'audio/keyboard/key_6.mp3',
    },
    {
        name: 'startup',
        type: 'audio',
        path: 'audio/startup/startup.mp3',
    },
    {
        name: 'office',
        type: 'audio',
        path: 'audio/atmosphere/office.mp3',
    },
    {
        name: 'musicSuspense',
        type: 'audio',
        path: 'audio/music/suspense-background.mp3',
    },
    {
        name: 'musicTrailer',
        type: 'audio',
        path: 'audio/music/stylish-trailer-percussion.mp3',
    },
    {
        name: 'musicTravel',
        type: 'audio',
        path: 'audio/music/inspiring-travel-acoustic.mp3',
    },
    {
        name: 'ccType',
        type: 'audio',
        path: 'audio/cc/type.mp3',
    },
];

const room = (name: string, path: string): Resource => ({
    name,
    type: 'gltfModel',
    path: 'models/room/' + path,
});

const brightSources: Resource[] = [
    room('roomChair', 'kenney-furniture-kit/chairDesk.glb'),
    room('roomMonitor', 'kenney-furniture-kit/computerScreen.glb'),
    room('roomKeyboard', 'kenney-furniture-kit/computerKeyboard.glb'),
    room('roomMouse', 'kenney-furniture-kit/computerMouse.glb'),
    room('roomLaptop', 'kenney-furniture-kit/laptop.glb'),
    room('roomBooks', 'kenney-furniture-kit/books.glb'),
    room('roomBox', 'kenney-furniture-kit/cardboardBoxClosed.glb'),
    room('roomFrame', 'kaykit-furniture-bits/pictureframe_small_A.gltf'),
    room('roomPlant', 'polyhaven-potted_plant_04/potted_plant_04_1k.gltf'),
];

// Only the selected room's assets are requested, so loading progress reaches 1 in both modes.
const sources: Resource[] = isBright
    ? [...brightSources, ...sharedSources]
    : [...classicSources, ...sharedSources];

export default sources;