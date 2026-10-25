// Default is the bright home office; `?room=classic` selects the original retro room.
export const isBright =
    new URLSearchParams(window.location.search).get('room') !== 'classic';
