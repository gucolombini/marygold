class Garden extends Phaser.Scene {
    constructor() {
      super({ key: "Garden" });
    }

    preload(){
        // tela de loading já faz isso
    }

    create(){
        this.music = this.sound.add('garden_calm');
        this.music._interval = Phaser.Math.Between(-10, 10)
        this.music.setLoop(true);
        this.music.setVolume(0.5);
        this.music.play();
        console.log(this.music.currentConfig);
        this.loadLevel(0);
    }

    update(time, delta){
        // runEvery(this, 10, delta, 'musicPitcher', () => randomMusicPitch(this.music));
        if (this.isPaused) return;
        this.player.playerLogic();
    }

    loadLevel(level) {
        let background = 'background'
        if(!this.level) this.level = 0;
        if(level > 7) {
            background = 'background2'
        }
        this.isPaused = true;
        this.carrotGoal = 0;

        if(this.bg) this.bg.destroy();
        if(this.map) this.map.destroy();
        //if(this.mapSpecial) this.mapSpecial.destroy()
        this.bg = this.add.image(400, 300, background).setDepth(-10);
        if(this.player) this.player.destroy();

        if(!this.bruh) this.bruh = this.sound.add('bruh');
        if(!this.fence) this.fence = this.physics.add.staticImage(400, 100, 'fence');
        this.fence.body.setSize(800, 60);
        this.fence.setDepth(-6);
        
        if(this.mapElements) {
            this.mapElements.forEach(obj => {
                obj.destroy();
            })
        }
        this.player = new Player(this, 200, 200);
        this.player.dialogStart('intro'+(level+1))

        this.physics.add.collider(this.player, this.fence);

        //this.cameras.addExisting(this.cameras.main); // Adiciona a câmera principal à cena (o jogo automaticamente acompanhará ela)
        //this.cameras.main.startFollow(this.player);
        //this.cameras.main.setDeadzone(200, 100);

        this.map = this.make.tilemap({ key: 'map_'+level });
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
                this.mapElements.push(new Carrot(this, obj.x, obj.y, this.player));
                this.carrotGoal++;
                console.log(this.carrotGoal);
            } else if (obj.name === 'buriedcarrot') {
                this.mapElements.push(new BuriedCarrot(this, obj.x, obj.y, this.player));
                this.carrotGoal++;
                console.log(this.carrotGoal);
            } else if (obj.name === 'playerspawn') {
                this.player.setPosition(obj.x, obj.y);
                if (obj.x > 400) {
                    this.fence.setFlipX(false);
                } else {
                    this.fence.setFlipX(true);
                }
            } 
          });
        this.physics.add.overlap(this.player, this.mapElements, (player, obj) => {
            if (obj.onOverlap) obj.onOverlap();
        });
        this.isPaused = false;
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
            scale: { from: 1, to: 2},
            duration: 1000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });

        scene.tweens.add({
            targets: this,
            scale: { from: 0.9, to: 1.2 },
            duration: 600,
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
        this.player = player;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
    }
  
    // Default behavior (can be overridden)
    onOverlap() {}
    sideHitboxesCallback(sensor) {}

    createSideHitboxes(scene, hitboxW, hitboxH, offset) {
        const width = this.body.width;
        const height = this.body.height;

        this.topSensor = scene.add.rectangle(this.x, this.y - height / 2 - offset, hitboxW, hitboxH);
        this.bottomSensor = scene.add.rectangle(this.x, this.y + height / 2 + offset, hitboxW, hitboxH);
        this.leftSensor = scene.add.rectangle(this.x - width / 2 - offset, this.y, hitboxH, hitboxW+10);
        this.rightSensor = scene.add.rectangle(this.x + width / 2 + offset, this.y, hitboxH, hitboxW+10);

        scene.physics.add.existing(this.topSensor, true);
        scene.physics.add.existing(this.bottomSensor, true);
        scene.physics.add.existing(this.leftSensor, true);
        scene.physics.add.existing(this.rightSensor, true);

        scene.physics.add.overlap(this.player, this.topSensor, () => {this.sideHitboxesCallback("top")});
        scene.physics.add.overlap(this.player, this.bottomSensor, () => {this.sideHitboxesCallback("bottom")});
        scene.physics.add.overlap(this.player, this.leftSensor, () => {this.sideHitboxesCallback("left")});
        scene.physics.add.overlap(this.player, this.rightSensor, () => {this.sideHitboxesCallback("right")});
    }
  }
  
  class Puddle extends Special {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'puddle', player);
        this.setImmovable(true);
        //this.setOrigin(0.5, 0.5);
        this.scene.physics.add.collider(this.player, this);
        this.setSize(60, 60);
        this.setDepth(-3);

        createAnimation(this.scene, 'puddleanim', 'puddle', 0, 1, 2, -1);
        this.play('puddleanim');

        this.createSideHitboxes(scene, 3, 10, 0);
    }

    sideHitboxesCallback(sensor) {
        switch (sensor) {
            case "top":
                if (this.player._dir.down && Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) this.player.jump('down');
                break;
            case "bottom":
                if (this.player._dir.up && Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) this.player.jump('up');
                break;
            case "left":
                if (this.player._dir.right && Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) this.player.jump('right');
                break;
            case "right":
                if (this.player._dir.left && Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) this.player.jump('left');
                break;
            default:
                break;
        }
    }

    destroy() {
        this.topSensor.destroy();
        this.bottomSensor.destroy();
        this.leftSensor.destroy();
        this.rightSensor.destroy();
        super.destroy();
    }
    
}
  
class Carrot extends Special {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'carrot', player);
        this.active = false;
        createAnimation(this.scene, 'carrotanim', 'carrot', 0, 1, 2, -1);
        this.setSize(16, 16);
        this.setDepth(-2);
        this.scene.time.delayedCall(Phaser.Math.Between(101, 500), () => {if(this.active) this.play('carrotanim');})
        this.scene.time.delayedCall(100, () => { this.active = true; });
    }
  
    onOverlap() {
        if (!this.active) return;
        this.destroy();
        this.player.carrots++
        console.log(this.player.scene.carrotGoal);
        console.log(this.player.carrots);
        if(this.player.carrots >= this.player.scene.carrotGoal) {
            console.log('novo nivel desbloqueado')
            this.player.scene.level++;
            this.player.scene.loadLevel(this.player.scene.level);
        }
    }
}

class BuriedCarrot extends Special {
    constructor(scene, x, y, player) {
        super(scene, x, y, 'carrot', player);
        createAnimation(this.scene, 'buriedcarrotanim', 'buriedcarrot', 0, 1, 2, -1);
        this.play('buriedcarrotanim');
        this.setImmovable(true);
        this.scene.physics.add.collider(this.player, this);
        this.setSize(50, 50);
        this.setDepth(-3);

        this.createSideHitboxes(scene, 3, 10, 0);
    }

    sideHitboxesCallback(sensor){
        if (this.player._isTalking) return;
        switch (sensor) {
            case "top":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("down");
                    this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                    this.destroy();
                };
                break;
            case "bottom":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("up");
                    this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                    this.destroy();
                };
                break;
            case "left":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("right");
                    this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                    this.destroy();
                };
                break;
            case "right":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("left");
                    this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                    this.destroy();
                };
                break;
            default:
                break;
        }
    }

    destroy() {
        this.topSensor.destroy();
        this.bottomSensor.destroy();
        this.leftSensor.destroy();
        this.rightSensor.destroy();
        super.destroy();
    }
}