interface CustomProperties {
  width: number;

  type: 'skyline' | 'pipe';
}

declare namespace GlobalMixins {
  interface Sprite extends CustomProperties {}
  interface DisplayObject extends CustomProperties {}
}

declare var Bump: any;
