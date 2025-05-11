class Cutscene extends Phaser.Scene {
    constructor() {
      super({ key: "Cutscene" });
    }
    create() {
        this.add.rectangle(0, 0, 800, 600, 0x000000).setOrigin(0)
    }
}