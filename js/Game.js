var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.game.add.sprite(0, 0, 'sky');

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('grasstiles', 'tiles');

        //this.blockedLayer = this.map.createLayer('objectLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        //this.foregroundLayer = this.map.createLayer('foregroundLayer');

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        // make the world boundaries fit the ones in the tiled map
        this.blockedLayer.resizeWorld();

        this.players = this.game.add.group();

        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.startx = result[0].x;
        this.starty = result[0].y;

        this.level = 1;
        this.createUnicorn();


        //  Finally some stars to collect
        this.smashers = this.game.add.group();

        //  We will enable physics for any star that is created in this group
        this.smashers.enableBody = true;

        this.music = this.game.add.audio('music');
        this.music.loop = true;
//        this.music.play();

        //  The score
        this.scoreText = this.game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        //this.scoreText.fixedToCamera = true;
        this.score = 0;

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;
        this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
        this.smasher = this.game.add.sprite(500, 150, "smasher");
        this.smasherReleased = false;
        this.currentSmasher = null;
        this.removeSmasherTimer = -1;
        this.showDebug = true; 

        for (var i = -20; i <= 110; i+=30) {
            this.game.add.sprite(547, i, "rope");
        }
        this.game.add.sprite(547, 125, "ropeend");
        
    },

    createUnicorn: function() {
        
        var player = this.players.create(this.startx, this.starty, 'unicorns');
         
        player.offset = this.game.rnd.integerInRange(0, 3) * 2;
        player.frame = player.offset;

        //  We need to enable physics on the player
        this.game.physics.arcade.enable(player);
        player.body.bounce.y = 0;
        player.body.gravity.y = 400;
        player.body.velocity.x = this.game.rnd.integerInRange(40, 210) + this.level;
        player.body.velocity.y = 0;
        player.anchor.setTo(0.5);
        player.body.collideWorldBounds = false;

        player.animations.add('right', [0+player.offset, 1+player.offset], 10, true);
        player.animations.play('right');

    },

    unleashSmasher: function() {
            this.smasherReleased = true;
            var smasher = this.smashers.create(500, 150, "smasher");
            smasher.body.gravity.y = 300;
            smasher.frame = 31;
            //  This just gives each star a slightly random bounce value
            smasher.body.bounce.y = Math.random() * 0.2;
            this.currentSmasher = smasher;
            this.smasher.visible = false;

    },

    gameover: function() {
        this.game.add.text(120, 300, '                      GAME OVER\nYou let one of the pesky yellows through!', { fontSize: '32px Arial', fill: '#000' });
        this.game.paused = true;

    },

    update: function() {
        this.timer++;
        if (this.timer % Math.max(1, 100 - this.level) == 0) {
            this.createUnicorn();
        }

        if (this.timer % 100 == 0) {
            this.level++;
        }
        //  Collide the player and the stars with the platforms
        this.game.physics.arcade.collide(this.players, this.blockedLayer);
        this.game.physics.arcade.collide(this.smashers, this.blockedLayer);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.players, this.smashers, this.squash, null, this);

        //  Reset the players velocity (movement)
        

        if (this.rKey.isDown)
        {
            this.state.restart();
        }
        if (this.spaceKey.isDown)
        {   
            if (!this.smasherReleased) {
                this.unleashSmasher();
            }
        }

        this.players.forEach(function(unicorn) {
            if (this.game.rnd.integerInRange(0,40) == 0 && unicorn.body.blocked.down && !unicorn.squashed) {
                unicorn.body.velocity.y = -1 * (this.game.rnd.integerInRange(10,170));
            }

            if(unicorn.x > (this.game.world.width - 62)) {
                if (unicorn.offset == 0) {
                    this.gameover();
                }
                unicorn.kill();

            }

        }, this);
        if (this.currentSmasher != null && this.currentSmasher.alive && !this.currentSmasher.body.blocked.down) {
            
            this.removeSmasherTimer = 100;
        }

        if (this.removeSmasherTimer > 0) {
            this.removeSmasherTimer--;
        }
        else if (this.removeSmasherTimer == 0) {
            this.removeSmasherTimer--;
            this.currentSmasher.kill();
            this.currentSmasher =
            this.smasherReleased = false;
            this.smasher.visible = true;
        }

    },

    squash: function(player, smasher) {
        if (!player.squashed) {
            player.body.velocity.x = 0;
            player.body.velocity.y = 0;
            player.animations.add("squash", [8,9,10,11], 8, false);
            player.animations.play("squash");
            player.squashed = true;
            if (player.offset == 0) {
                this.score += 100;
            }
            else {
                this.score -= 10;
            }
            this.scoreText.text = "Score: " + this.score;
        }


    },
    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },


    render: function() {

        if (this.showDebug) {
        }
    },

};