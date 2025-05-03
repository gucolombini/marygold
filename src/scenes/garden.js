class Garden extends Phaser.Scene {
    constructor() {
      super({ key: "Garden" });
    }

    preload(){
        // tela de loading já faz isso
    }

    create(){
        this.isPaused = false;
        this.add.image(400, 300, 'background').setDepth(-10);
        this.music = this.sound.add('garden_calm');
        this.music._interval = Phaser.Math.Between(-10, 10)
        this.music.setLoop(true);
        this.music.setVolume(0.5);
        this.music.play();
        console.log(this.music.currentConfig);
        // this.arrowkeys = this.input.keyboard.createCursorKeys();
        this.player = new Player(this, 200, 200);
        // this.tooltip = new Tooltip(this)
        // this.tooltip.show(300,300);

        this.bruh = this.sound.add('bruh');
        this.player.dialogStart('intro')

        this.map = this.make.tilemap({ key: 'map_test' });
        this.tileset = this.map.addTilesetImage('tileset_garden', 'tileset_garden');

        this.map.collision = this.map.createLayer('collision', this.tileset, 0, 0);
        this.map.collision.setDepth(-2);
        this.physics.add.collider(this.player, this.map.collision.setCollisionByExclusion([-1]));

        this.mapElements = [];

        this.mapSpecial = this.map.getObjectLayer('special');

        this.mapSpecial.objects.forEach(obj => {
            if (obj.name === 'puddle') {
              console.log(obj.x, obj.y, obj.properties);
              this.mapElements.push(new Puddle(this, obj.x, obj.y, this.player));
            } else if (obj.name === 'carrot') {
              console.log(obj.x, obj.y, obj.properties);
            } else if (obj.name === 'playerspawn') {
                this.player.setPosition(obj.x, obj.y);
            } 
          });
        this.physics.add.overlap(this.player, this.mapElements, (player, obj) => {
            if (obj.onOverlap) obj.onOverlap();
        });   
    }

    update(time, delta){
        // runEvery(this, 10, delta, 'musicPitcher', () => randomMusicPitch(this.music));
        if (this.isPaused) return;
        this.player.playerLogic();
    }
}

// Função de modulação da música
function randomMusicPitch(music) {
    if (!music._interval) music._interval = Phaser.Math.Between(-10, 10);
    if (music._interval > 0) {
        music.setRate(music.rate*0.99);
        music._interval--;
    } else if (music._interval < 0) {
        music.setRate(music.rate*1.01);
        music._interval++;
    }
    if (music._interval < 0.5 && music._interval > -0.5) {
        music._interval = Phaser.Math.Between(-10, 10);
    };
}

class Tooltip extends Phaser.GameObjects.Image {
    constructor(scene) {
        super(scene, 0, 0, 'tooltip_e');
        this.setVisible(false);
        this.setDepth(2); // Ensure it shows on top
        scene.add.existing(this);

        scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: 1000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });

        scene.tweens.add({
            targets: this,
            size: { from: 0.2, to: 1.6 },
            duration: 3000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });
    }

    show(x, y) {
        this.setPosition(x, y);
        this.setVisible(true);
    }

    hide() {
        this.setVisible(false);
    }
}

class Special extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, player) {
        super(scene, x, y, texture);
        this.scene = scene;
        this.player = player;
  
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }
  
    // Default behavior (can be overridden)
    onOverlap() {}
  }
  
  class Puddle extends Special {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'puddle', player);
        this.setImmovable(true);
        this.scene.physics.add.collider(this.player, this);
        this.setSize(60, 60);
        this.setOrigin(0.5, 0.5);
        this.setDepth(-1);

        createAnimation(this.scene, 'puddleanim', 'puddle', 0, 1, 2, -1);
        this.play('puddleanim');

        this.createSideHitboxes(scene);
    }

    createSideHitboxes(scene) {
        const hitboxW = 1;
        const hitboxH = 10;
        const width = this.body.width;
        const height = this.body.height;
        const offset = 0; // small buffer to place hitboxes just outside puddle edges

        // Top
        this.topSensor = scene.add.rectangle(this.x, this.y - height / 2 - offset, hitboxW, 10);
        // Bottom
        this.bottomSensor = scene.add.rectangle(this.x, this.y + height / 2 + offset, hitboxW, 10);
        // Left
        this.leftSensor = scene.add.rectangle(this.x - width / 2 - offset, this.y, 10, hitboxW);
        // Right
        this.rightSensor = scene.add.rectangle(this.x + width / 2 + offset, this.y, 10, hitboxW);

        // Enable physics
        scene.physics.add.existing(this.topSensor, true);
        scene.physics.add.existing(this.bottomSensor, true);
        scene.physics.add.existing(this.leftSensor, true);
        scene.physics.add.existing(this.rightSensor, true);

        // Set up collisions
        scene.physics.add.overlap(this.player, this.topSensor, () => {if (this.player._dir.down) this.player.jump('down')});
        scene.physics.add.overlap(this.player, this.bottomSensor, () => {if (this.player._dir.up) this.player.jump('up')});
        scene.physics.add.overlap(this.player, this.leftSensor, () => {if (this.player._dir.right) this.player.jump('right')});
        scene.physics.add.overlap(this.player, this.rightSensor, () => {if (this.player._dir.left) this.player.jump('left')});
    }
}
  
class Carrot extends Special {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'tooltipE', player);
    }
  
    onOverlap() {
        this.destroy();
    }
  }
  