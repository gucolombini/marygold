class Cutscene extends Phaser.Scene {
    constructor() {
      super({ key: "Cutscene" });
    }
    create() {
        this.add.rectangle(0, 0, 800, 600, 0x000000).setOrigin(0).setDepth(10)
        this.meme = this.add.sprite(0, 0, 'circle1').setOrigin(0).setScale(0.5);

        this.Ekey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.meme.anims.create({
            key: 'wolfstill',
            frames: [
                { key: 'wolfstill1' },
                { key: 'wolfstill2' },
            ],
            frameRate: 1,
            repeat: -1
        });
        this.meme.anims.create({
            key: 'wolf2still',
            frames: [
                { key: 'wolf2still1' },
                { key: 'wolf2still2' },
            ],
            frameRate: 1,
            repeat: -1
        });
        this.meme.anims.create({
            key: 'ritual',
            frames: [
                { key: 'circle1' },
                { key: 'circle2' },
            ],
            frameRate: 1,
            repeat: -1
        });
        this.meme.anims.create({
            key: 'closeup',
            frames: [
                { key: 'closeup1' },
                { key: 'closeup2' },
            ],
            frameRate: 1,
            repeat: -1
        });

        this.time.delayedCall(3000, () => {
          this.meme.anims.play("ritual").setDepth(11);
          this.time.delayedCall(6000, () => {
            this.meme.anims.play("wolfstill");
            this.time.delayedCall(4000, () => {
              this.meme.anims.play("ritual");
              this.time.delayedCall(2000, () => {
                this.meme.anims.play("wolf2still");
                this.time.delayedCall(4000, () => {
                  this.meme.anims.play("ritual");
                  this.time.delayedCall(3000, () => {
                    this.E = new Tooltip(this, "e", false, 4).setScale(4).setDepth(12);
                    this.E.show(400, 300);
                  })
                })
              })
            })
          })
        })
    }

    update() {
      if (Phaser.Input.Keyboard.JustDown(this.Ekey) && this.E) {
        this.die();
      }
    }

    die() {
      this.E.destroy();
      this.time.delayedCall(1000, () => {
        this.meme.anims.play("closeup");
        this.time.delayedCall(2000, () => {
          this.die2();
        })
      })
    }

    dialogue(key) {

    }

    die2() {
      this.meme.anims.stop();
      this.meme.setTexture("remain1");
      this.time.delayedCall(2000, () => {
        this.meme.setTexture("remain2");
        this.time.delayedCall(3000, () => {
          this.meme.setTexture("static_bite");
          this.time.delayedCall(2000, () => {
            this.meme.setTexture("static_face_agape");
          })
        })
      })
    }
}