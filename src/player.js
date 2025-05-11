class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, alt) {
        let key = 'mary'
        if (alt === true) {
            console.log('alt')
            key = 'marysoul'
        }
        super (scene, x, y, key);
        this.key = key;
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.collideWorldBounds = true;
        this.setSize(49, 32);
        this.body.setOffset(28, 79);
        this.setSpeed(200);
        this.dialogPitchInterval = [0.8, 1.2];
        this.dialogSpeed = 50;
        this.dialogIndex = null;
        this.carrots = 0;
        this.diagSpeed = this.speed / Math.SQRT2;
        this.animState = 'idledown'
        this._dir = {
            right: false,
            left: false,
            down: false,
            up: false
        };
        if (!this.scene.ui) this.scene.ui = {};
        if (this.scene.ui.tooltip) this.scene.ui.tooltip.destroy();
        this.scene.ui.tooltip = new Tooltip(this.scene, "space");
        this.tooltip = this.scene.ui.tooltip;
        this._tooltipActiveTime = 0;
        this._tooltip = null;
        this._isTalking = false;
        this._isJumping = false;
        if (!this.scene.arrowkeys) this.scene.arrowkeys = this.scene.input.keyboard.createCursorKeys();
        if (!this.scene.spaceKey) this.scene.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if (!this.scene.Ekey) this.scene.Ekey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        createAnimation(this.scene, this.key+'idledown', this.key, 1, 1, -1, 0);
        createAnimation(this.scene, this.key+'walkdown', this.key, 0, 2, 5, -1, true);
        createAnimation(this.scene, this.key+'idleup', this.key, 4, 4, -1, 0);
        createAnimation(this.scene, this.key+'walkup', this.key, 3, 5, 5, -1, true);
        createAnimation(this.scene, this.key+'idleright', this.key, 7, 7, -1, 0);
        createAnimation(this.scene, this.key+'walkright', this.key, 6, 8, 5, -1, true);
        createAnimation(this.scene, this.key+'waterdown', this.key, 9, 10, 3, -1);
        createAnimation(this.scene, this.key+'waterright', this.key, 11, 12, 3, -1);
        createAnimation(this.scene, this.key+'waterup', this.key, 13, 14, 3, -1);

        this.play(this.key+'idledown');

        this.dialogs = {
            error:   { next: null, speaker: "mary_worried", text: "ERRO! Este diálogo vai se autodestruir!" },
            intro0:   { next: "intro0_1", speaker: "mary", text: "Olá! Eu sou Marygold, mas pode me chamar de Mary!" },
            intro0_1:  { next: "intro0_2", speaker: "mary", text: "Estou precisando de algumas cenourinhas para fazer um bolo de cenoura muito gostoso..." },
            intro0_2:  { next: null, end:"nextlevel", speaker: "mary", text: "Para isso, preciso dar um passeio na minha horta de cenouras! Você poderia me ajudar a colher?" },
            power1:  { next: "power1_1", speaker: "mary", text: "Que legal, agora eu posso pular por cima de poças de água!" },
            power1_1:  { next: null, end:"nextlevel", speaker: "exclamation", blip: "silent", text: "Pressione ESPAÇO para pular!"},
            power2:  { next: "power2_1", speaker: "mary", text: "Finalmente achei meu regador! Posso regar as cenourinhas que estão plantadas!" },
            power2_1:  { next: null, end:"nextlevel", speaker: "exclamation", blip: "silent", text: "Pressione E para regar!"},
            forest0:  { next: "forest0_1", speaker: "mary_worried", text: "..."},
            forest0_1:  { next: "forest0_2", speaker: "mary_worried", text: "Onde estou? O que está acontecendo?"},
            forest0_2:  { next: null, speaker: "mary_worried", text: "... Isso é..."},
            forest1:  { next: null, speaker: "mary_cursed", text: "Eu me sinto estranha..."},
            forest2:  { next: null, speaker: "mary_hole", text: "Eu me sinto vazia......................"},
            forest3:  { next: null, speaker: "mary_eye", text: "............................................................."},
          }; 

    } 
    moveLogic() {
        if (this._isTalking || this._isJumping || this._isWatering) return;

        // console.log(this.x, this.y);
        const keys = this.scene.arrowkeys;

        this._dir.right = keys.right.isDown;
        this._dir.left = keys.left.isDown;
        this._dir.down = keys.down.isDown;
        this._dir.up = keys.up.isDown;

        let vx = 0;
        let vy = 0;

        if (this._dir.right && !this._dir.left) vx = 1;
        else if (this._dir.left && !this._dir.right) vx = -1;

        if (this._dir.down && !this._dir.up) vy = 1;
        else if (this._dir.up && !this._dir.down) vy = -1;
        
        if (vx !== 0 && vy !== 0) {
            vx *= this.diagSpeed;
            vy *= this.diagSpeed;
        } else {
            vx *= this.speed;
            vy *= this.speed;
        }

        if (vx == 0 && vy == 0) {
            this.idle();
        }
        else if (vx > 0) {
            this.animState = 'walkright';
            this.setFlipX(false);
        }
        else if (vx < 0) {
            this.animState = 'walkright';
            this.setFlipX(true);
        }
        else if (vy > 0) {
            this.animState = 'walkdown';
            this.setFlipX(false);
        }
        else if (vy < 0) {
            this.animState = 'walkup';
            this.setFlipX(false);
        }

        if (vx != 0 || vy != 0) {
            this.footsteps()
        }

        this.anims.play(this.key+this.animState, true);
        this.setVelocity(vx, vy);
    }

    dialogLogic() {
        if (Phaser.Input.Keyboard.JustDown(this.scene.Ekey)) {
            if (!this._isTalking) {
                //this.dialogStart('intro');
            } else if (this._finishedDialog) {
                if (this._nextDialog) {
                    this.dialogStart(this._nextDialog)
                } else {
                    this.dialogEnd(this.dialogs[this.dialogIndex].end);
                }
            }
        }
    }

    dialogStart(index) {
        if(!this.dialogs[index]) {
            // console.log("invalid dialog index");
            // this.dialogStart('error');
            return;
        }

        this.setVelocity(0, 0);
        this.idle();
        this.anims.play(this.key+this.animState);

        this.dialogIndex = index;
        if (!this.scene.dialogBox) this.scene.dialogBox = this.scene.add.image(400, 500, 'dialogbox');
        if (!this.scene.dialogE) this.scene.dialogE = new Tooltip(this.scene, "e");
        this.scene.dialogE.setDepth(5).setScrollFactor(0,0).hide();
        if (!this.scene.dialogText) this.scene.dialogText = this.scene.add.text(215, 480, 'DUMMYTEXT',
            {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#000000',
                wordWrap: { width: 480 },
                align: 'left',
            }
        );
        this.scene.dialogBox.setScrollFactor(0,0);
        this.scene.dialogText.setScrollFactor(0,0);

        if (this.scene.dialogPortrait) this.scene.dialogPortrait.destroy();
        this.scene.dialogPortrait = this.scene.add.image(135, 463, 'portrait_' + this.dialogs[index].speaker);
        this.scene.dialogPortrait.setScrollFactor(0,0);

        this.scene.dialogBox.setVisible(true).setDepth(3);
        this.scene.dialogText.setVisible(true).setDepth(4);
        this.scene.dialogPortrait.setDepth(5);

        this._isTalking = true;
        this._finishedDialog = false;
        this._nextDialog = this.dialogs[index].next;
        this.scene.dialogText.setText(this.dialogs[index].text);

        if (!this.scene.bruh) this.scene.bruh = this.scene.sound.add("bruh");
        let blip = this.scene.bruh;
        if (this.dialogs[index].blip === 'silent') blip = null;
        animateText(this.scene.dialogText, this.dialogSpeed, blip, this.dialogPitchInterval[0], this.dialogPitchInterval[1]).then(() => {
        this._finishedDialog = true;
        this.scene.dialogE.show(700, 550);
        });
    }

    dialogEnd(event) {
        this.scene.dialogText.setText("FINISHED");
        this.scene.dialogBox.setVisible(false);
        this.scene.dialogText.setVisible(false);
        this.scene.dialogPortrait.destroy();
        this.scene.dialogE.hide();
        if(event) {
            switch (event) {
                case "nextlevel":
                    this.scene.transitionLevel(this.scene.level+1);
                    break;
            
                default:
                    break;
            }
        }
        this._isTalking = false;
    }

    jump(dir) {
        if (this._isJumping) return;
        this._isJumping = true;
        this.setVelocity(0, 0);

        let goal = [this.x, this.y];
        switch (dir) {
            case 'up':
                goal[1] -= 85 + this.body.halfHeight
                this.anims.play(this.key+'idleup');
                break;
            case 'down':
                goal[1] += 85 + this.body.halfHeight
                this.anims.play(this.key+'idledown');
                break;
            case 'left':
                goal[0] -= 85 + this.body.halfWidth
                this.anims.play(this.key+'idleright');
                this.setFlipX(true);
                break;
            case 'right':
                goal[0] += 85 + this.body.halfWidth
                this.anims.play(this.key+'idleright');
                this.setFlipX(false);
                break;
            default:
                break;
        }

        this.scene.tweens.add({
            targets: this,
            x: { from: this.x, to: goal[0]},
            y: { from: this.y, to: goal[1]},
            duration: 600,
            yoyo: false,
            repeat: 0,
            ease: 'Sine.easeInOut',
            easeParams: [3.5],
            onComplete: () => {
                this._isJumping = false;
            }
        });
    }

    water(dir) {
        this._isWatering = true;
        this.setVelocity(0, 0);
        this.scene.time.delayedCall(1000, () => {this._isWatering = false;})
        switch (dir) {
            case "up":
                this.anims.play(this.key+"waterup");
                break;
            case "left":
                this.anims.play(this.key+"waterright");
                this.setFlipX(true);
                break;
            case "right":
                this.anims.play(this.key+"waterright");
                this.setFlipX(false);
                break;
            default:
                this.anims.play(this.key+"waterdown");
                break;
        }
    }

    idle() {
        if (this.animState === 'walkright') {
            this.animState = 'idleright'
        }
        if (this.animState === 'walkup') {
            this.animState = 'idleup'
        }
        if (this.animState === 'walkdown') {
            this.animState = 'idledown'
        }
    }

    activateTooltip(key) {
        this._tooltip = key;
        this._tooltipActiveTime = 5;
    }

    playerLogic() {
        if (this._tooltipActiveTime > 0) {
            this._tooltipActiveTime--;
            if (!this._isJumping && !this._isTalking && !this._isWatering) {
                this.tooltip.show(this.body.x+24, this.body.y-100, this._tooltip);
            } else this.tooltip.hide();
        } else this.tooltip.hide();
        this.moveLogic();
        this.dialogLogic();
    }

    destroy() {
        this.tooltip.destroy();
        super.destroy();
    }

    setSpeed(speed) {
        this.speed = speed
        this.diagSpeed = this.speed / Math.SQRT2;
    }

    setFootstepsSound(soundKey) {
        if (soundKey === null) {
            this._footstepsActive = false;
            return;
        }
        this._footstepsActive = true;
        this.footstepsSound = this.scene.sound.add(soundKey);
        this.footstepsSound.setLoop(false);
        this.footstepsSound.setVolume(0.2);
    }

    footsteps() {
        //console.log(this.footstepsSound.isPlaying);
        if (!this._footstepsActive) return; 
            this._footstepsActive = false;
            const random = Phaser.Math.Between(0, 3)
            let musicSeek = [0, 0];
            switch (random) {
                case 0:
                    musicSeek = [0.057, 0.473];
                    break;
                case 1:
                    musicSeek = [0.773, 1.074];
                    break;
                case 2:
                    musicSeek = [1.49, 1.919];
                    break;
                case 3:
                    musicSeek = [3.137, 3.538];
                    break;
            
                default:
                    break;
            }
            this.footstepsSound.play();
            this.footstepsSound.setSeek(musicSeek[0]);
            this.scene.time.delayedCall((musicSeek[1]-musicSeek[0])*1000, () => {
                this.footstepsSound.stop()
                this.scene.time.delayedCall(400-(musicSeek[1]-musicSeek[0])*1000, () => {
                    this._footstepsActive = true;
                })
            })


    }
}
