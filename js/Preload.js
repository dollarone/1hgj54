var PlatformerGame = PlatformerGame || {};

//loading the game assets
PlatformerGame.Preload = function(){};

PlatformerGame.Preload.prototype = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);

    this.load.setPreloadSprite(this.preloadBar);

    this.game.load.spritesheet('logo-tiles', 'assets/images/logo-tiles.png', 17, 16);
    this.game.load.spritesheet('tiles', 'assets/images/grasstiles.png', 32, 32);
    this.load.tilemap('level1', 'assets/tilemaps/level1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('sky', 'assets/images/sky_new.png');
    this.game.load.image('smasher', 'assets/images/16tons.png');
    this.game.load.image('rope', 'assets/images/rope.png');
    this.game.load.image('ropeend', 'assets/images/ropeend.png');
    this.game.load.spritesheet('unicorns', 'assets/images/unicorns.png', 57, 47);

    this.game.load.audio('music', 'assets/audio/music.ogg');

  },
  create: function() {
    this.state.start('Logo');
  }
};
