class Forest extends Phaser.Scene {
    constructor() {
      super({ key: "Forest" });
    }
    preload() {
        this.load.plugin('rexpixelationpipelineplugin', 'src/plugins/rexpixelationpipelineplugin.min.js', true);
    }

    create() {
        this.PixelationPlugin = this.plugins.get('rexpixelationpipelineplugin');
        this.treeheight = 110;
        width = 7000;
        this.physics.world.setBounds(0, this.treeheight, width, 600-this.treeheight)
        this.player = new Player(this, 200, 300, true).setDepth(1);
        this.floor = this.add.tileSprite(0, 0, width, 600, 'forestfloor').setOrigin(0).setDepth(-1);
        this.cameras.main.setBounds(0, 0, width, 600)
           .startFollow(this.player)
           .setDeadzone(175, 200);
        this.blood = this.add.tileSprite(500, 320, 6850-500, 0, 'blood').setOrigin(0);
        this.player.setSpeed(200);
        this.player.setFootstepsSound("footsteps_grass");
        this.head = this.add.image(6850, 320, 'head');
        this.headFilter = this.PixelationPlugin.add(this.head);
        this.headFilter.pixelWidth = 20;
        this.headFilter.pixelHeight = 20;
        this.headReveal = false;
        this._cameraStop = false;
        this._dialogIndex = 0;
        this.player.dialogStart("forest0")
    }

    update(time, delta) {
        this.player.playerLogic();
        if (!this.headReveal) {
            runEvery(this, 2, delta, "headcensor", () => {
                this.changePixelization(this.headFilter, Phaser.Math.Between(100, 120)/10)
            })
        }
        if (this.head.y+this.head.height/2 > this.player.body.y+this.player.body.height) this.head.setDepth(this.player.depth+1);
        else this.head.setDepth(this.player.depth-1);

        if (!this._cameraStop && this.cameras.main.scrollX >= 6200) {
            this._cameraStop = true;
            this.cameras.main.stopFollow();
            this.physics.world.setBounds(width-800, this.treeheight, 800, 600-this.treeheight)
            this.time.delayedCall(3000, () => {
                this.headReveal = true
                this.changePixelization(this.headFilter, 0)
                this.time.delayedCall(5000, () => {
                    console.log("my ass..... is shitted");
                    this.player.footstepsSound.stop();
                    this.scene.start('Cutscene');
                })
            })
        }
        if (this.player.x > 2000 && this._dialogIndex === 0) {
            this.player.dialogSpeed = 60;
            this.player.dialogPitchInterval = [0.6, 1.0];
            this.player.dialogStart("forest1");
            this._dialogIndex++
        } else if (this.player.x > 4000 && this._dialogIndex === 1) {
            this.player.dialogPitchInterval = [0.4, 0.7];
            this.player.dialogSpeed = 70;
            this.player.dialogStart("forest2");
            this._dialogIndex++
        } else if (this.player.x > 6000 && this._dialogIndex === 2) {
            this.player.dialogPitchInterval = [0.2, 0.4];
            this.player.dialogSpeed = 80;
            this.player.dialogStart("forest3");
            this._dialogIndex++
        }
    }

    changePixelization(target, pixelSize) {
        target.pixelWidth = pixelSize;
        target.pixelHeight = pixelSize;
    }
}