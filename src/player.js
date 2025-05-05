class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super (scene, x, y, 'mary')
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.collideWorldBounds = true;
        this.setSize(49, 32);
        this.body.setOffset(28, 79);
        this.speed = 200;
        this.carrots = 0;
        this.diagSpeed = this.speed / Math.SQRT2;
        this.animState = 'idledown'
        this._dir = {
            right: false,
            left: false,
            down: false,
            up: false
        };
        this._tooltip = false;
        this._isTalking = false;
        this._isJumping = false;
        if (!this.scene.arrowkeys) this.scene.arrowkeys = this.scene.input.keyboard.createCursorKeys();
        if (!this.scene.spaceKey) this.scene.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        if (!this.scene.Ekey) this.scene.Ekey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        createAnimation(this.scene, 'maryidledown', 'mary', 1, 1, -1, 0);
        createAnimation(this.scene, 'marywalkdown', 'mary', 0, 2, 4, -1, true);
        createAnimation(this.scene, 'maryidleup', 'mary', 4, 4, -1, 0);
        createAnimation(this.scene, 'marywalkup', 'mary', 3, 5, 4, -1, true);
        createAnimation(this.scene, 'maryidleright', 'mary', 7, 7, -1, 0);
        createAnimation(this.scene, 'marywalkright', 'mary', 6, 8, 4, -1, true);
        createAnimation(this.scene, 'marywaterdown', 'mary', 9, 10, 3, -1);
        createAnimation(this.scene, 'marywaterright', 'mary', 11, 12, 3, -1);
        createAnimation(this.scene, 'marywaterup', 'mary', 13, 14, 3, -1);

        this.play('maryidledown');

        this.dialogs = {
            error:   { next: null, speaker: "mary_cursed", text: "ERRO! Este diálogo vai se autodestruir!" },
            intro1:   { next: "intro1_1", speaker: "mary", text: "Olá! Eu sou Marygold, mas pode me chamar de Mary!" },
            intro1_1:  { next: "intro1_2", speaker: "mary", text: "Estou precisando de algumas cenourinhas para fazer um bolo de cenoura muito gostoso..." },
            intro1_2:  { next: null,    speaker: "mary", text: "Para isso, preciso dar um passeio na minha horta de cenouras! Você poderia me ajudar a colher?" },
            intro2:   { next: null, speaker: "mary_cursed", text: "Caguei meu cu." },
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
        console.log(this.animState);
        this.anims.play('mary'+this.animState, true);
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
                    this.dialogEnd();
                }
            }
        }
    }

    dialogStart(index) {
        if(!this.dialogs[index]) {
            console.log("invalid dialog index");
            this.dialogStart('error');
            return;
        }

        this.setVelocity(0, 0);
        if (!this.scene.dialogBox) this.scene.dialogBox = this.scene.add.image(400, 500, 'dialogbox');
        if (!this.scene.dialogE) this.scene.dialogE = new Tooltip(this.scene, 700, 550);
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
        animateText(this.scene.dialogText, 1, this.scene.bruh).then(() => {
        this._finishedDialog = true;
        this.scene.dialogE.show(700, 550);
        });
    }

    dialogEnd() {
        this.scene.dialogText.setText("FINISHED");
        this.scene.dialogBox.setVisible(false);
        this.scene.dialogText.setVisible(false);
        this.scene.dialogPortrait.destroy();
        this.scene.dialogE.hide();
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
                this.anims.play('maryidleup');
                break;
            case 'down':
                goal[1] += 85 + this.body.halfHeight
                this.anims.play('maryidledown');
                break;
            case 'left':
                goal[0] -= 85 + this.body.halfWidth
                this.anims.play('maryidleright');
                this.setFlipX(true);
                break;
            case 'right':
                goal[0] += 85 + this.body.halfWidth
                this.anims.play('maryidleright');
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
            repeat: 0, // Infinite loop
            ease: 'Sine.easeInOut',
            easeParams: [3.5],
            onComplete: () => {
                this._isJumping = false;
            }
        });
    }

    water(dir) {
        this._isWatering = true;
        this.scene.time.delayedCall(1000, () => {this._isWatering = false;})
        switch (dir) {
            case "up":
                this.anims.play("marywaterup");
                break;
            case "left":
                this.anims.play("marywaterright");
                this.setFlipX(true);
                break;
            case "right":
                this.anims.play("marywaterright");
                this.setFlipX(false);
                break;
            default:
                this.anims.play("marywaterdown");
                break;
        }
    }

    playerLogic() {
        this.moveLogic();
        this.dialogLogic();
    }
}