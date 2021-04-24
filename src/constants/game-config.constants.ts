export const CANVAS_SIZE = {
  HEIGHT: 600,
  WIDTH: 1000,
};

export const MESSAGES = {
  EASTER_EGG: 'Wow, so much power!',
};

export const BOUNDS = {
  TOP: -60,
  BOTTOM: CANVAS_SIZE.HEIGHT + 30,
};

export const KEYS = {
  SPACE: 'Space',
  UP: 'ArrowUp',
};

export const SPRITE_URLS = {
  PLAYER: {
    INITIAL: 'assets/sprites/player/sprite_0.png',
    FLAPPING: 'assets/sprites/player/sprite_1.png',
  },
  PIPE: 'assets/sprites/pipe.png',
  IMAGE_BACKGROUND: 'assets/backgrounds/background.jpg',
  SKYLINE: 'assets/backgrounds/skyline.png',
  GAME_OVER_TEXT: 'assets/sprites/gameover.png',
};

export const PHYSICS = {
  PIPE_SPEED: 1.75,
  SKYLINE_SPEED: 0.5,
  PIPE_GENERATION_FIRST_WAIT: 1500,
  PIPE_GENERATION_INTERVAL: 2500,
  SCORE_FIRST_WAIT: 9000,
  GRAVITY: 0.15,
  FLAP_POWER: 5,
  FLAP_DELAY: 150,
};

export const PARAMS = {
  VERTICAL_PIPES_SEPARATION: 1000,
  EASTER_EGG_DURATION: 3000,
  EASTER_EGG_BUFFER_TIME: 1000,
  EASTER_EGG_BUFFER_LENGTH: 6
};
