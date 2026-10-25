export interface ModelCredit {
    // Must match the id in static/models/room/CREDITS.json
    id: string;
    name: string;
    author: string;
    license: 'CC0';
    url: string;
}

export const MODEL_CREDITS: ModelCredit[] = [
    {
        id: 'kenney-furniture-kit',
        name: 'Furniture Kit',
        author: 'Kenney',
        license: 'CC0',
        url: 'https://kenney.nl/assets/furniture-kit',
    },
    {
        id: 'kaykit-furniture-bits',
        name: 'Furniture Bits',
        author: 'Kay Lousberg (KayKit)',
        license: 'CC0',
        url: 'https://kaylousberg.itch.io/furniture-bits',
    },
    {
        id: 'polyhaven-potted_plant_04',
        name: 'Potted Plant 04',
        author: 'James Ray Cock (Poly Haven)',
        license: 'CC0',
        url: 'https://polyhaven.com/a/potted_plant_04',
    },
];

export const modelCreditsLine = (narrow: boolean) =>
    narrow
        ? '3D models (CC0): Kenney, KayKit, Poly Haven. See readme.'
        : '3D models (CC0): ' +
          MODEL_CREDITS.map(
              (c) =>
                  `${c.name} by ${c.author}, ${c.license}, ${c.url.replace(
                      'https://',
                      ''
                  )}`
          ).join('; ');
