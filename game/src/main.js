// main.js — boot the game: wire the canvas, the mouse, and the frame loop,
// then hand control to the Game. No network, no libraries, just the canvas.
import { VIEW_W, VIEW_H } from './config.js';
import { createInput } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const input = createInput();
const game = new Game(canvas, input);

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

canvas.addEventListener('mousemove', (event) => {
  const point = canvasPoint(event);
  input.mouseX = point.x;
  input.mouseY = point.y;
});

canvas.addEventListener('mousedown', (event) => {
  const point = canvasPoint(event);
  input.mouseX = point.x;
  input.mouseY = point.y;
  input.mouseClicked = true;
  game.sound.ensure();
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
