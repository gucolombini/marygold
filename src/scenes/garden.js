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
        this.music.setSeek(0);
        console.log(this.music.currentConfig);
        this.cameras.main.preRender();
        this.loadLevel(0);
    }

    update(time, delta){
        // runEvery(this, 10, delta, 'musicPitcher', () => randomMusicPitch(this.music));
        if (this.isPaused) return;
        this.skyLogic(delta);
        this.player.playerLogic();
    }

    skyLogic(delta) {
        if (this.level > 7) delta *= (this.level-7)*2;
        if (this.sky) {
            this.sky.setPosition(this.sky.x-delta/100, 0);
            if (this.sky.x < -800) {
                this.sky.setPosition(0, 0);
            }

        }
    }

    transitionLevel(level) {
        if (this.level === 3 && level === 4) level = 'power1';
        else if (this.level === 5 && level === 6) level = 'power2';
        else if (this.level === 7 && level === 8) level = 'power3';

        if (this.level === 'power1') level = 4;
        else if (this.level === 'power2') level = 6;
        else if (this.level === 'power3') level = 8;

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
        this.loadLevel(level, true);
        })
    }

    loadLevel(level, fade) {
        // let background = 'background'
        this.level = level;

        this.isPaused = true;
        this.carrotGoal = 0;
        if (fade && fade === true) this.cameras.main.fadeIn(1000, 0, 0, 0);

        if(level == 0) this.bg = this.add.image(400, 300, "background0");
        else if (this.bg) this.bg.destroy();

        if(this.floor) this.floor.destroy();
        if(this.trees) this.trees.destroy();
        if(!this.sky) this.sky = this.add.image(0, 0, "sky").setDepth(-9).setOrigin(0, 0);
        //if(this.mapSpecial) this.mapSpecial.destroy()

        this.floor = this.add.image(400, 300, "floor").setDepth(-10);
        this.trees = this.add.image(0, 0, "trees").setDepth(-8).setOrigin(0, 0);

        if(this.player) this.player.destroy();
        if(!this.bruh) this.bruh = this.sound.add('bruh');

        if(!this.fence) this.fence = this.physics.add.staticImage(400, 100, 'fence');
        this.fence.body.setSize(800, 60);
        this.fence.setDepth(-6);

        if(this.map) this.map.destroy();
        if(this.mapElements) {
            this.mapElements.forEach(obj => {
                obj.destroy();
            })
        }

        this.player = new Player(this, 200, 200);
        this.player.dialogStart('intro'+(level))

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
            } else if (obj.name === 'power1' || obj.name === 'power2' || obj.name === 'power3') {
                console.log("POWER")
                this.mapElements.push(new Powerup(this, obj.x, obj.y, this.player, parseInt(obj.name.slice(-1))));
                this.carrotGoal++;
                console.log(this.carrotGoal);
            } else if (obj.name === 'playerspawn') {
                this.player.setPosition(obj.x, obj.y);
                this.fence.setVisible(true);
                if (obj.x > 400) {
                    this.fence.setFlipX(false);
                } else {
                    this.fence.setFlipX(true);
                }
                if (obj.y > 200){
                    this.fence.setVisible(false);
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
    constructor(scene, key, dontAnimate) {
        super(scene, 0, 0, 'tooltip_'+key);
        this.setVisible(false);
        this.setDepth(2); // Ensure it shows on top
        scene.add.existing(this);

        if (dontAnimate) return;

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

    show(x, y, key) {
        if(key) this.setTexture('tooltip_'+key)
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
        this.player.activateTooltip("space")
        console.log(this.player._tooltipActiveTime);
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
        new Shine(this.player.scene, this.body.x+15, this.body.y);
        this.destroy();
        this.player.carrots++
        console.log(this.player.scene.carrotGoal);
        console.log(this.player.carrots);
        if(this.player.carrots >= this.player.scene.carrotGoal) {
            console.log('novo nivel desbloqueado')
            this.player.scene.transitionLevel(this.player.scene.level+1);
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
        this.player.activateTooltip("e")
        if (this.player._isTalking || this.player._isWatering) return;
        switch (sensor) {
            case "top":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("down");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        this.destroy();
                    });
                };
                break;
            case "bottom":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("up");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        this.destroy();
                    });
                };
                break;
            case "left":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("right");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        this.destroy();
                    });
                };
                break;
            case "right":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("left");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        this.destroy();
                    });
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

class Powerup extends Special {
    constructor(scene, x, y, player, number) {
        super(scene, x, y, 'powerup', player);
        this.number = number;
        this.preFX.addGlow(0xffffff, 6, 0 );
        this.setSize(25, 25);
        this.setFrame(number-1);
        this.setDepth(-2);
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
            duration: 500,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });
    }
  
    onOverlap() {
        new Shine(this.scene, this.body.x, this.body.y);
        this.player.dialogStart("power"+this.number);
        if (this.number === 3) {
            this.destroy();
            const scene = this.player.scene
            console.log("collect")
            scene.music.stop();
            // scene.isPaused = true;
            this.player.setVelocity(0, 0);
            scene.time.delayedCall(3000, () => {
                glitchLag(scene, 8, 300, function(){
                    scene.music.play();
                    scene.music.setSeek(2);
                    scene.sky.setPosition(0,0);
                }, function(){
                    scene.music.setRate(0.98);
                    scene.music.play();
                    scene.isPaused=false;
                    scene.loadLevel(8);
                })
            })
        } else this.destroy();
    }
}

class Shine extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super (scene, x, y, "shine")
        scene.add.existing(this);
        this.setOrigin(0.5, 0.5);
        this.setDepth(0);
        createAnimation(this.scene, "shineanim", "shine", 0, 3, 10, 0, false);
        this.anims.play("shineanim");
        this.anims.play("shineanim");
        this.on('animationcomplete', () => this.destroy());
    }
}