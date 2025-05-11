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
        this.player.activateTooltip("space");
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
                        camRefresh(this.player.scene);
                        this.destroy();
                    });
                };
                break;
            case "bottom":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("up");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        camRefresh(this.player.scene);
                        this.destroy();
                    });
                };
                break;
            case "left":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("right");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        camRefresh(this.player.scene);
                        this.destroy();
                    });
                };
                break;
            case "right":
                if (Phaser.Input.Keyboard.JustDown(this.player.scene.Ekey)) {
                    this.player.water("left");
                    this.player.scene.time.delayedCall(700, () => {
                        this.player.scene.mapElements.push(new Carrot(this.player.scene, this.x, this.y, this.player));
                        camRefresh(this.player.scene);
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
            scene.music.setRate(5);
            scene.time.delayedCall(300, () => {
                scene.music.stop()
                scene.music.setRate(1);
            })
            // scene.isPaused = true;
            this.player.setVelocity(0, 0);
            scene.time.delayedCall(3000, () => {
                glitchLag(scene, 8, 300, function(){
                    scene.music.setRate(scene.music.rate*1.01)
                    scene.music.play();
                    scene.music.setSeek(2);
                    scene.bg.sky.setPosition(0,0);
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
        camRefresh(scene);
        this.setOrigin(0.5, 0.5);
        this.setDepth(this.scene.player.depth + 1);
        createAnimation(this.scene, "shineanim", "shine", 0, 3, 10, 0, false);
        this.anims.play("shineanim");
        this.anims.play("shineanim");
        this.on('animationcomplete', () => this.destroy());
    }
}

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super (scene, x, y, 'enemy');
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setSize(25, 25);
        this.speed = 130;
        this.acceleration = 20;
        this.maxSpeed = 700;
        createAnimation(this.scene, "wolfidle", "enemy", 0, 1, 1, -1);
        createAnimation(this.scene, "wolfrun", "enemy", 2, 3, 2, -1);
        this.anims.play("wolfidle");
        this.target = this;
        this.isActive = true;
    }

    startChase(target) {
        this.target = target;
    }

    enemyLogic(delta) {
        if (this.target.x != this.x || this.target.y != this.y) {
            runEvery(this.scene, 5, delta, 'afterimage', () => {
                console.log('afterimage')
                const afterimage = this.scene.add.sprite(this.x, this.y, this.texture);
                afterimage.setFrame(this.frame.name);
                afterimage.setFlipX(this.flipX);
                afterimage.setDepth(this.depth-1);
                this.scene.tweens.add({
                    targets: afterimage,
                    x: this.x+Phaser.Math.Between(-50, 50),
                    y: this.y+Phaser.Math.Between(-50, 50),
                    alpha: { from: 0.2, to: 0 },
                    duration: 400,
                    onComplete: () => {
                        afterimage.destroy();
                    }
                });
            })


            this.body.velocity.limit(this.maxSpeed);
            this.anims.play("wolfrun", true);
            const from = new Phaser.Math.Vector2(this.body.center.x, this.body.center.y);
            const to = new Phaser.Math.Vector2(this.target.x, this.target.y);
            const dir = to.clone().subtract(from).normalize();

            const velocity = this.body.velocity.clone().normalize(); // normalize to compare direction only
            const dot = dir.dot(velocity);

            let multX = 1;
            if (dot > 0.99) {
                multX = 3;
            }else if (dot > 0.9){
                multX = 2;
            } else if (dot < -0.95) {
                multX = 2;
                this.body.velocity.scale(0.9)
            } else {
                multX = 1;
                this.body.velocity.scale(0.98);
            }

            this.setAcceleration(dir.x*multX*this.acceleration*delta, dir.y*multX*this.acceleration*delta);

            this.setFlipX(this.target.x > this.body.center.x);
            const speed = this.body.velocity.length();
            const maxSpeed = 1000;
            this.anims.timeScale = Phaser.Math.Clamp(maxSpeed / speed, 2, 5);
        } else {
            this.setAcceleration(0, 0);
            this.anims.timeScale = 1; // reset animation speed
        }
    }

    onOverlap() {
        if (!this.isActive) return;
        const scene = this.scene
        if (scene.level === 10) {
            this.isActive = false;
            this.setVelocity(0, 0);
            this.setAcceleration(0, 0);
            scene.isPaused = true;
            scene.player.setVelocity(0, 0);
            scene.time.delayedCall(1500, () => {
                const jumpscare = scene.add.image(400, 300, "static_face").setDepth(99);
                scene.music.setVolume(0);
                scene.time.delayedCall(4000, () => {
                    jumpscare.destroy();
                    scene.loadLevel(11);
                })
            })
        } else {
            console.log('DEAD');
            this.isActive = false;
            new Shine(scene, scene.player.x, scene.player.y)
            scene.time.delayedCall(100, () => {
                scene.music.stop();
                const jumpscare = scene.add.image(400, 300, "static_neck").setDepth(99);
                scene.time.delayedCall(4000, () => {
                    //jumpscare.destroy();
                    scene.scene.start("Forest");
                })
            })
        }
    }
}
