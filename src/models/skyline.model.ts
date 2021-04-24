import { PHYSICS, SPRITE_URLS } from '../constants/game-config.constants';

import { Sprite } from 'pixi.js';

interface Position {
  x: number;
  y: number;
}

export class Skyline {
  private _sprite: any;

  constructor({ x, y }: Position) {
    this._sprite = Sprite.from(SPRITE_URLS.SKYLINE);
    this._sprite.anchor.set(0, 1);
    this._sprite.position.set(x, y);
    this._sprite.scale.set(5);

    this._sprite.type = 'skyline';
  }

  public get sprite() {
    return this._sprite;
  }

  public updatePosition(delta: number) {
    this.sprite.position.x -= PHYSICS.SKYLINE_SPEED * delta;
  }
}
