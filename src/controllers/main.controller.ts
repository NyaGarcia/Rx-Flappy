import * as PIXI from 'pixi.js';

import {
  BOUNDS,
  CANVAS_SIZE,
  MESSAGES,
  PARAMS,
  PHYSICS,
  SPRITE_URLS,
} from '../constants/game-config.constants';
import { delay, filter, first, map, tap } from 'rxjs/operators';

import { GameService } from '../services/game.service';
import { Pipe } from '../models/pipe.model';
import { Player } from '../models/player.model';
import { Skyline } from '../models/skyline.model';

interface GUI {
  canvasContainer: HTMLElement;
  scoreboard: HTMLElement;
  messages: HTMLElement;
}
export class MainController {
  private gui: GUI;
  private app: PIXI.Application;
  private skylineContainer: PIXI.Container;
  private player: Player;
  private bump: any;

  constructor(private view: Document, private gameService: GameService) {
    this.gui = {
      canvasContainer: this.view.getElementById('canvasContainer'),
      scoreboard: this.view.getElementById('scoreboard'),
      messages: this.view.getElementById('messages'),
    };
  }

  public startGame() {
    this.setupPixi();
    this.setupBump();
    this.init();
  }

  private setupPixi() {
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.app = new PIXI.Application({
      width: CANVAS_SIZE.WIDTH,
      height: CANVAS_SIZE.HEIGHT,
      antialias: true,
      transparent: false,
      backgroundColor: 0x1099bb,
    });

    this.gui.canvasContainer.appendChild(this.app.view);

    this.skylineContainer = new PIXI.Container();
    this.app.stage.addChild(this.skylineContainer);

    this.app.ticker.add((delta: number) => this.gameService.onFrameUpdate$.next(delta));
  }

  private setupBump() {
    this.bump = new Bump(PIXI);
  }

  private init() {
    this.setBackground();
    this.renderSkyline();
    this.renderObstacles();
    this.updateScore();
    this.createPlayer();
    this.addCollisions();
    this.addBoundsCheck();
    this.setEasterEgg();
    this.app.stage.setChildIndex(this.skylineContainer, 1);
  }

  private setBackground() {
    const bg = PIXI.Sprite.from(SPRITE_URLS.IMAGE_BACKGROUND);

    bg.anchor.set(0);
    bg.x = 0;
    bg.y = 0;

    this.app.stage.addChild(bg);
  }

  private createPlayer() {
    this.player = new Player();
    this.app.stage.addChild(this.player.sprite);

    this.gameService.onFrameUpdate$.pipe(tap(delta => this.player.setGravity(delta))).subscribe();

    this.gameService.onFlap$
      .pipe(
        tap(() => this.player.flap()),
        delay(PHYSICS.FLAP_DELAY),
        tap(() => this.player.flap()),
      )
      .subscribe();
  }

  private renderSkyline(): void {
    this.createInitialSkyline();

    this.app.stage.setChildIndex(this.skylineContainer, 1);

    this.gameService.skylineUpdate$
      .pipe(
        map(() => this.getLastSkyline()),
        filter(this.isNewSkylineNeeded),
        tap(lastSkyline => this.createSkylinePiece(lastSkyline.position.x + lastSkyline.width)),
      )
      .subscribe();
  }

  private createInitialSkyline() {
    for (let i = 0; i < 3; i++) {
      this.createSkylinePiece(i * 500);
    }
  }

  private isNewSkylineNeeded(lastSkyline: PIXI.DisplayObject) {
    return lastSkyline.position.x <= CANVAS_SIZE.WIDTH;
  }

  private createSkyline(): void {
    const lastSkyline = this.getLastSkyline();

    if (lastSkyline.position.x <= CANVAS_SIZE.WIDTH) {
      this.createSkylinePiece(lastSkyline.position.x + lastSkyline.width);
    }
  }

  private getLastSkyline() {
    const { children } = this.skylineContainer;

    return children[children.length - 1];
  }

  private createSkylinePiece(x: number): void {
    const skyline = new Skyline({
      x,
      y: CANVAS_SIZE.HEIGHT,
    });

    this.skylineContainer.addChild(skyline.sprite);

    this.gameService.onFrameUpdate$.pipe(tap(delta => skyline.updatePosition(delta))).subscribe();
  }

  private renderObstacles() {
    this.gameService.createObstacle$
      .pipe(
        tap(() => this.createPipeSet()),
        tap(() => this.deleteOldPipes()),
      )
      .subscribe();
  }

  private createPipeSet(): void {
    const bottomPipe = new Pipe();
    const topPipe = new Pipe(bottomPipe);

    for (const pipe of [bottomPipe, topPipe]) {
      this.app.stage.addChild(pipe.sprite);

      this.gameService.onFrameUpdate$.pipe(tap(delta => pipe.updatePosition(delta))).subscribe();
    }
  }

  private deleteOldPipes(): void {
    const children = this.app.stage.children;
    children
      .filter(Boolean)
      .filter(({ type }) => type === 'pipe')
      .filter(({ position }) => position.x < 0)
      .forEach(pipe => this.app.stage.removeChild(pipe));
  }

  private updateScore() {
    this.gameService.score$.pipe(tap(score => this.printScore(score))).subscribe();
  }

  private printScore(score: number) {
    this.gui.scoreboard.innerHTML = `${score}`;
  }

  private addCollisions(): void {
    this.gameService.onFrameUpdate$
      .pipe(
        filter(() => this.checkCollisions()),
        tap(() => this.gameOver()),
      )
      .subscribe();
  }

  private checkCollisions() {
    const { children } = this.app.stage;

    return this.hasCollided(children);
  }

  private hasCollided(children: PIXI.DisplayObject[]) {
    return children
      .filter(({ type }) => type === 'pipe')
      .some(pipe => this.bump.hit(this.player.sprite, pipe));
  }

  private addBoundsCheck() {
    this.gameService.onFrameUpdate$
      .pipe(
        filter(() => this.isPlayerOutOfBounds()),
        tap(() => this.gameOver()),
      )
      .subscribe();
  }

  private isPlayerOutOfBounds() {
    const playerHeight = this.player.position.y;
    return playerHeight > BOUNDS.BOTTOM || playerHeight < BOUNDS.TOP;
  }

  private gameOver() {
    this.player.killKiwi();

    this.gameService.stopGame();

    this.renderGameOverMessage();
    this.printScore(0);

    this.restartGame();
  }

  private restartGame() {
    this.gameService.restart$
      .pipe(
        first(),
        tap(() => this.destroy()),
        tap(() => this.startGame()),
      )
      .subscribe();
  }

  private renderGameOverMessage() {
    const gameOverSprite = PIXI.Sprite.from(SPRITE_URLS.GAME_OVER_TEXT);

    gameOverSprite.anchor.set(0.5);
    gameOverSprite.position.set(CANVAS_SIZE.WIDTH / 2, CANVAS_SIZE.HEIGHT / 3);
    gameOverSprite.scale.set(0.6);

    this.app.stage.addChild(gameOverSprite);
  }

  private destroy() {
    this.app.destroy(true, {
      texture: true,
      children: true,
      baseTexture: true,
    });
  }

  private setEasterEgg() {
    this.gameService.easterEgg$
      .pipe(
        tap(() => this.setEasterEggMessage(MESSAGES.EASTER_EGG)),
        delay(PARAMS.EASTER_EGG_DURATION),
        tap(() => this.setEasterEggMessage()),
      )
      .subscribe();
  }

  private setEasterEggMessage(message: string = '') {
    this.gui.messages.innerHTML = message;
  }
}
