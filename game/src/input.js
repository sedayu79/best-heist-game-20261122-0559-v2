// input.js — keyboard and mouse state for the game. WASD or arrows move,
// Shift sneaks, E grabs loot and cracks the safe, Space or a mouse click
// tosses a coin toward the cursor, Enter confirms, R restarts a level.
export function createInput() {
  const keys = new Set();
  const input = {
    keys,
    mouseX: 0,
    mouseY: 0,
    mouseClicked: false,
    coinTossQueued: false,
    confirmPressed: false,
    restartPressed: false,
    interactHeld: false,
    sneakHeld: false,
  };

  function keyName(event) {
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  window.addEventListener('keydown', (event) => {
    const name = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) {
      if (name === 'enter') input.confirmPressed = true;
      if (name === 'r') input.restartPressed = true;
      if (name === ' ') input.coinTossQueued = true;
    }
    keys.add(name);
    keys.add(event.key);
    input.interactHeld = keys.has('e');
    input.sneakHeld = keys.has('Shift');
  });

  window.addEventListener('keyup', (event) => {
    const name = keyName(event);
    keys.delete(name);
    keys.delete(event.key);
    input.interactHeld = keys.has('e');
    input.sneakHeld = keys.has('Shift');
  });

  window.addEventListener('blur', () => {
    keys.clear();
    input.interactHeld = false;
    input.sneakHeld = false;
  });

  return input;
}

// Read the current movement direction from the keys: -1, 0 or 1 per axis.
export function moveDirection(input) {
  let x = 0;
  let y = 0;
  if (input.keys.has('a') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('w') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('s') || input.keys.has('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.hypot(x, y);
    x *= inv;
    y *= inv;
  }
  return { x, y };
}
