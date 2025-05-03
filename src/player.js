class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, collisions = []) {
        super (scene, x, y, 'marygold')
        this.scene.add.existing(this)
        this.scene.physics.add.existing(this)
        this.body.collideWorldBounds = true;
        this.setSize(64, 32);
        this.body.setOffset(0, 70);
        this.speed = 200;
        this.diagSpeed = this.speed / Math.SQRT2;
        this._dir = {
            right: false,
            left: false,
            down: false,
            up: false
        };
        this._tooltip = false;
        this._isTalking = false;
        if (!this.scene.arrowkeys) this.input.keyboard.createCursorKeys();
        if (!this.scene.spaceKey) this.scene.spaceKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.dialogs = {
            error:   { next: null, speaker: "mary_cursed", text: "ERRO! Este diálogo vai se autodestruir!" },
            intro:   { next: "intro1", speaker: "mary", text: "Olá! Eu sou Marygold, mas pode me chamar de Mary!" },
            intro1:  { next: "intro2", speaker: "mary", text: "Estou precisando de algumas cenourinhas para fazer um bolo de cenoura muito gostoso..." },
            intro2:  { next: null,    speaker: "mary", text: "Para isso, preciso dar um passeio na minha horta de cenouras! Você poderia me ajudar a colher?" },
          }; 

    } 
    moveLogic() {
        if (this._isTalking) return;

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

        this.setVelocity(vx, vy);
    }

    dialogLogic() {
        if (Phaser.Input.Keyboard.JustDown(this.scene.spaceKey)) {
            if (!this._isTalking) {
                this.dialogStart('intro');
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
        if (!this.scene.dialogText) this.scene.dialogText = this.scene.add.text(215, 480, 'DUMMYTEXT',
            {
                fontSize: '20px',
                fontFamily: 'monospace',
                color: '#000000',
                wordWrap: { width: 480 },
                align: 'left',
            }
        );

        if (this.scene.dialogPortrait) this.scene.dialogPortrait.destroy();
        this.scene.dialogPortrait = this.scene.add.image(135, 463, 'portrait_' + this.dialogs[index].speaker);

        this.scene.dialogBox.setVisible(true).setDepth(3);
        this.scene.dialogText.setVisible(true).setDepth(4);
        this.scene.dialogPortrait.setDepth(5);

        this._isTalking = true;
        this._finishedDialog = false;
        this._nextDialog = this.dialogs[index].next;
        this.scene.dialogText.setText(this.dialogs[index].text);
        animateText(this.scene.dialogText, 50, this.scene.bruh).then(() => {
        this._finishedDialog = true;
        });
    }

    dialogEnd() {
        this.scene.dialogText.setText("FINISHED");
        this.scene.dialogBox.setVisible(false);
        this.scene.dialogText.setVisible(false);
        this.scene.dialogPortrait.destroy();
        this._isTalking = false;
    }

    playerLogic() {
        this.moveLogic();
        this.dialogLogic();
    }
}