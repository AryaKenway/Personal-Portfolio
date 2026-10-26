/**
 * @file screenTexture.js
 * @description Paints a skill group onto a canvas, as a dark editor window lit
 * up on one of the studio's monitors. The skills are sized to fill the screen,
 * in one or two columns, whichever lets the text be larger.
 */

const MONO = 'ui-monospace, "Cascadia Code", "SF Mono", Consolas, "Liberation Mono", monospace';
const BULLET = '▸ ';
const LINE_HEIGHT = 1.5;
const WIDTH = 1024;

/**
 * @param {{ id: string, skills: string[] }} group
 * @param {number} aspect - Width over height of the screen.
 * @returns {HTMLCanvasElement}
 */
export function paintScreen(group, aspect) {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = Math.round(WIDTH / aspect);
    const context = canvas.getContext('2d');
    const { width, height } = canvas;

    const glow = context.createRadialGradient(width * 0.35, height * 0.3, 0, width * 0.5, height * 0.5, width * 0.75);
    glow.addColorStop(0, '#1d232c');
    glow.addColorStop(1, '#0d1015');
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    // Title bar: window dots and the group's path.
    const bar = Math.max(height * 0.11, 56);
    context.fillStyle = '#181c23';
    context.fillRect(0, 0, width, bar);
    ['#e2685f', '#e0b04f', '#5fae62'].forEach((colour, index) => {
        context.beginPath();
        context.arc(bar * (0.55 + index * 0.42), bar / 2, bar * 0.13, 0, Math.PI * 2);
        context.fillStyle = colour;
        context.fill();
    });
    context.font = `${Math.round(bar * 0.42)}px ${MONO}`;
    context.fillStyle = '#8b93a1';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`~/skills/${group.id}`, width / 2, bar / 2);

    // Skills: the column count and size that fill the body best.
    const pad = width * 0.065;
    const gap = width * 0.05;
    const bodyWidth = width - pad * 2;
    const bodyHeight = height - bar - pad * 1.6;
    context.font = `100px ${MONO}`;
    const widest = Math.max(...group.skills.map((skill) => context.measureText(BULLET + skill).width));
    const layouts = [1, 2].map((columns) => {
        const rows = Math.ceil(group.skills.length / columns);
        const byHeight = bodyHeight / (rows * LINE_HEIGHT);
        const byWidth = (bodyWidth - gap * (columns - 1)) / columns / widest * 100;
        return { columns, rows, size: Math.min(byHeight, byWidth, height * 0.105) };
    });
    const { columns, rows, size } = layouts[1].size > layouts[0].size * 1.15 ? layouts[1] : layouts[0];
    const columnWidth = (bodyWidth - gap * (columns - 1)) / columns;
    const top = bar + (height - bar - rows * size * LINE_HEIGHT) / 2;

    context.textAlign = 'left';
    context.font = `${size}px ${MONO}`;
    const bulletWidth = context.measureText(BULLET).width;
    group.skills.forEach((skill, index) => {
        const column = Math.floor(index / rows);
        const x = pad + column * (columnWidth + gap);
        const y = top + (index % rows + 0.5) * size * LINE_HEIGHT;
        context.fillStyle = '#f08a6c';
        context.fillText(BULLET, x, y);
        context.fillStyle = '#ece6da';
        context.fillText(skill, x + bulletWidth, y);
    });
    return canvas;
}
