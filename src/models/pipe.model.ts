import { CANVAS_SIZE, PARAMS, PHYSICS, SPRITE_URLS } from '../constants/game-config.constants';

import { Sprite } from 'pixi.js';

export class Pipe {
  private _sprite: any;

  constructor(parent?: Pipe) {
    this._sprite = Sprite.from(SPRITE_URLS.PIPE);

    const anchor = {
      x: 0.5,
      y: 0.5,
    };

    const pos = {
      x: CANVAS_SIZE.WIDTH + this._sprite.width,
      y: parent
        ? parent.sprite.position.y - PARAMS.VERTICAL_PIPES_SEPARATION
        : this.getRandomHeight(),
    };

    const scale = {
      x: 7,
      y: parent ? -7 : 7,
    };

    this._sprite.anchor.set(anchor.x, anchor.y);
    this._sprite.position.set(pos.x, pos.y);
    this._sprite.scale.set(scale.x, scale.y);

    this._sprite.type = 'pipe';
  }

  public get sprite(): Sprite {
    return this._sprite;
  }

  public updatePosition(delta: number): void {
    this._sprite.position.x -= PHYSICS.PIPE_SPEED * delta;
  }

  private getRandomHeight(): number {
    return Math.floor(Math.random() * 500) + 500;
  }
}
