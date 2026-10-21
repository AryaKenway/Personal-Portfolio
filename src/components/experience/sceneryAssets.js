/**
 * @file sceneryAssets.js
 * @description Asset URLs for the map, imported through Vite so they resolve
 * under the GitHub Pages base path. Other files refer to these by key.
 */

import clouds from '../../assets/experience/lottie/clouds.json?url';
import sparrow from '../../assets/experience/lottie/sparrow.json?url';
import hotAirBalloon from '../../assets/experience/lottie/hot-air-balloon.json?url';
import floor from '../../assets/experience/ninja/floor.png';
import nature from '../../assets/experience/ninja/nature.png';
import house from '../../assets/experience/ninja/house.png';
import element from '../../assets/experience/ninja/element.png';
import floorDetail from '../../assets/experience/ninja/floor-detail.png';
import water from '../../assets/experience/ninja/water.png';
import towers from '../../assets/experience/ninja/towers.png';

export const LOTTIE_ASSETS = Object.freeze({ clouds, sparrow, hotAirBalloon });

/** Character walk sheets (Pipoya), keyed by file name (e.g. 'f02-1'). */
export const CHARACTER_URLS = Object.freeze(Object.fromEntries(
    Object.entries(import.meta.glob('../../assets/experience/pipoya/*.png', { eager: true, import: 'default' }))
        .map(([path, url]) => [path.split('/').pop().replace('.png', ''), url])
));

/** Looping animation sheets, keyed as in lifeConfig.js LOOPS. */
const loopFiles = import.meta.glob('../../assets/experience/ninja/anim/*.png', { eager: true, import: 'default' });
const loopUrl = (file) => loopFiles[`../../assets/experience/ninja/anim/${file}.png`];
export const LOOP_URLS = Object.freeze({
    smoke: loopUrl('smoke'),
    flagRed: loopUrl('flag-red'),
    flagYellow: loopUrl('flag-yellow'),
    flagBlue: loopUrl('flag-blue'),
    ripples: loopUrl('ripples'),
    watermill: loopUrl('watermill')
});

/** Ninja Adventure sprite sheets, keyed as in `spriteAtlas.js`. */
export const SHEET_URLS = Object.freeze({ floor, nature, house, element, floorDetail, water, towers });
