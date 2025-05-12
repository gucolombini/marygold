class Garden extends Phaser.Scene {
    constructor() {
      super({ key: "Garden" });
    }

    preload(){
        // tela de loading já faz isso
        this.load.plugin('rexgrayscalepipelineplugin', 'src/plugins/rexgrayscalepipelineplugin.min.js', true);
        this.load.plugin('rextoonifypipelineplugin', 'src/plugins/rextoonifypipelineplugin.min.js', true);
        this.load.plugin('rexhsladjustpipelineplugin', 'src/plugins/rexhsladjustpipelineplugin.min.js', true);
    }

    create(){
        this.music = this.sound.add('garden_calm');
        this.music._interval = Phaser.Math.Between(-10, 10)
        this.music.setLoop(true);
        this.music.setVolume(0.5);
        this.music.play();
        this.music.setSeek(0);
        console.log(this.music.currentConfig);
        this.GrayscalePlugin = this.plugins.get('rexgrayscalepipelineplugin');
        this.ToonifyPlugin = this.plugins.get('rextoonifypipelineplugin');
        this.hslAdjustPlugin = this.plugins.get('rexhsladjustpipelineplugin');
        // this.cameraFilter = GrayscalePlugin.add(this.cameras.main, { intensity: 0.7 });
        // this.cameras.main.setPostPipeline('Gray');
        this.loadLevel(0, true);
    }

    update(time, delta){
        if(this.music.distortion === true) {
            runEvery(this, 50-this.level*3, delta, 'musicPitcher', () => {
                if (this.level == 15) {
                    if(this.music.rate > 0.01) this.music.setRate(this.music.rate*0.98);
                    console.log(this.music.rate);
                } else randomMusicPitch(this.music);
            });
        }
        runEvery(this, 1, delta, 'cameraShake', () => {
            if (this.level > 10) {
                this.camShake((this.level-10)/5);
            }
        });
        if(this.level > 11) {
            this.toonifyFilter.valLevels -= 0.01;
            if(this.toonifyFilter.valLevels<1) this.toonifyFilter.valLevels = Phaser.Math.Between(1, 10);
        }
        
        if (this.isPaused) return;
        this.skyLogic(delta);
        this.player.playerLogic();
        this.enemiesLogic(delta);
    }

    enemiesLogic(delta) {
        if(this.enemies) {
            this.enemies.forEach(obj => {
                if (obj.y+48 <= this.player.body.y+this.player.body.height) obj.setDepth(this.player.depth-1);
                else obj.setDepth(this.player.depth+1);
                obj.enemyLogic(delta);
            })
        }
    }

    skyLogic(delta) {
        if (this.level > 7) delta *= (this.level-7)**2.4;
        if (this.bg.sky) {
            this.bg.sky.setPosition(this.bg.sky.x-delta/100, 0);
            if (this.bg.sky.x < -800) {
                this.bg.sky.setPosition(0, 0);
            }

        }
    }

    camShake(amount) {
        this.cameras.main.setPosition(Phaser.Math.Between(-amount, amount),Phaser.Math.Between(-amount, amount))
    }

    transitionLevel(level) {
        if (this.level === 3 && level === 4) level = 'power1';
        else if (this.level === 5 && level === 6) level = 'power2';
        else if (this.level === 7 && level === 8) level = 'power3';

        if (this.level === 'power1') level = 4;
        else if (this.level === 'power2') level = 6;
        else if (this.level === 'power3') level = 8;

        let cam = this.cameras.main;
        if (this.playerCam) cam = this.playerCam
        cam.fadeOut(1000, 0, 0, 0);
        cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.loadLevel(level, true);
        })
        
    }

    loadLevel(level, fade) {
        this.level = level;

        if(this.playerCam) this.cameras.remove(this.playerCam);

        this.isPaused = true;
        this.carrotGoal = 0;

        if(!this.bg) this.bg = {};
        if(level == 0) this.bg.image = this.add.image(400, 300, "background0");
        else if (this.bg.image) this.bg.image.destroy();

        if(this.bg.floor) this.bg.floor.destroy();
        if(this.bg.trees) this.bg.trees.destroy();
        if(!this.bg.sky) this.bg.sky = this.add.image(0, 0, "sky").setDepth(-9).setOrigin(0, 0);

        this.bg.floor = this.add.image(400, 300, "floor").setDepth(-10);
        this.bg.trees = this.add.image(0, 0, "trees").setDepth(-8).setOrigin(0, 0);
        if(!this.bg.fence) this.bg.fence = this.physics.add.staticImage(400, 100, 'fence');
        this.bg.fence.body.setSize(5000, 60);
        this.bg.fence.setDepth(-6);

        if(this.map) this.map.destroy();
        if(this.mapElements) {
            this.mapElements.forEach(obj => {
                obj.destroy();
            })
        }

        if(this.enemies) {
            this.enemies.forEach(obj => {
                obj.destroy();
            })
        }

        if(!this.bruh) this.bruh = this.sound.add('bruh');

        if(this.player) this.player.destroy();
        this.player = new Player(this, 200, 200);
        this.time.delayedCall(1000, () => {this.player.dialogStart('intro'+(level))})

        this.physics.add.collider(this.player, this.bg.fence);

        //this.cameras.addExisting(this.cameras.main); // Adiciona a câmera principal à cena (o jogo automaticamente acompanhará ela)
        //this.cameras.main.startFollow(this.player);
        //this.cameras.main.setDeadzone(200, 100);

        this.map = this.make.tilemap({ key: 'map_'+level });
        this.tileset = this.map.addTilesetImage('tileset_garden', 'tileset_garden');

        this.map.collision = this.map.createLayer('collision', this.tileset, 0, 0);
        this.map.collision.setDepth(-2);
        this.physics.add.collider(this.player, this.map.collision.setCollisionByExclusion([-1]));

        this.mapElements = [];
        this.enemies = [];

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
            } else if (obj.name === 'wolf') {
                this.enemies.push(new Enemy(this, obj.x, obj.y));
                console.log(this.player.body.center.x, this.player.body.center.y);
            } else if (obj.name === 'playerspawn') {
                this.player.setPosition(obj.x, obj.y);
                this.bg.fence.setVisible(true);
                if (obj.x > 400) {
                    this.bg.fence.setFlipX(false);
                } else {
                    this.bg.fence.setFlipX(true);
                }
                if (obj.y > 200){
                    this.bg.fence.setVisible(false);
                }
            } 
          });
        this.physics.add.overlap(this.player, this.mapElements, (player, obj) => {
            if (obj.onOverlap) obj.onOverlap();
        });
        this.isPaused = false;
        this.playerCam = this.cameras.add(0, 0, 800, 600);
        this.playerCam.ignore([Object.values(this.bg), Object.values(this.ui), this.map.collision, this.mapElements]);
        this.cameras.main.ignore(this.player);
        this.cameras.main.setBounds(0, 0, 800, 600);
        this.playerCam.setBounds(0, 0, 800, 600);
        if (fade && fade === true) {
            this.cameras.main.fadeIn(1, 0, 0, 0);
            this.playerCam.fadeIn(1000, 0, 0, 0);
        };

        this.cameras.main.startFollow(this.player).setZoom(1);
        this.playerCam.startFollow(this.player).setZoom(1);

        if (level > 7) {
            if (level < 11) this.music.distortion = true;
            else {
                this.music.distortion = true
                this.music.setRate(0.2)
                this.music.setVolume(0.7);
            }
            if(!this.cameraFilter) this.cameraFilter = this.GrayscalePlugin.add(this.cameras.main);
            if(!this.toonifyFilter) this.toonifyFilter = this.ToonifyPlugin.add(this.cameras.main);
            if(!this.hslFilter) this.hslFilter = this.hslAdjustPlugin.add(this.cameras.main);

            let intensity;
            if (level == 8) intensity = 0.1;
            else if (level == 9) intensity = 0.25;
            else if (level == 10) intensity = 0.5;
            else {
                intensity = 0.6;
                if (!this.red) this.red = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.3)
                    .setDepth(99)
                    .setBlendMode(Phaser.BlendModes.MULTIPLY);
                this.playerCam.ignore([Object.values(this.bg), Object.values(this.ui), this.map.collision, this.mapElements, this.red]);

                this.hslFilter.satAdjust = 3;
            }
            
            this.cameraFilter.intensity = intensity;
            this.toonifyFilter.edgeThreshold = 1.1;
            this.toonifyFilter.valLevels = 10;
            //this.cameras.main.setPostPipeline('Gray');
            //this.ToonifyPlugin.add(this.cameras.main);
            // this.cameraFilter2 = this.ToonifyPlugin.add()
        } else this.music.distortion = false;
        if(this.enemies) {
            this.enemies.forEach(obj => {
                this.physics.add.collider(obj, this.bg.fence);
                if (level > 10) obj.startChase(this.player.body.center);
                if (level === 15) {
                    obj.acceleration = 0;
                    this.time.delayedCall(4000, () => {
                    obj.acceleration = 200;
                    obj.maxSpeed = 300;
                    })
                }
                this.physics.add.overlap(this.player, obj, () => {obj.onOverlap()});
            })
        }
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
        music._interval = Phaser.Math.Between(-10, 15);
    };
}

function camRefresh(scene) {
    scene.playerCam.ignore([Object.values(scene.bg), Object.values(scene.ui), scene.map.collision, scene.mapElements]);
}

class Tooltip extends Phaser.GameObjects.Image {
    constructor(scene, key, dontAnimate, scale) {
        super(scene, 0, 0, 'tooltip_'+key);
        this.setVisible(false);
        this.setDepth(2); // Ensure it shows on top
        scene.add.existing(this);

        if (!scale) scale = 1;
        this.setScale(scale);

        if (dontAnimate && dontAnimate === true) return;

        scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            // scale: { from: 1, to: 2},
            duration: 1000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });

        scene.tweens.add({
            targets: this,
            scale: { from: 0.9*scale, to: 1.2*scale },
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