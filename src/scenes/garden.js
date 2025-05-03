class Garden extends Phaser.Scene {
    constructor() {
      super({ key: "Garden" });
    }

    preload(){
        // CRIAR MÉTODO PARA PRELOAD
    }

    create(){
        this.isPaused = false;
        this.add.image(400, 300, 'background').setDepth(-1);
        this.music = this.sound.add('garden_calm');
        this.music._interval = Phaser.Math.Between(-10, 10)
        this.music.setLoop(true);
        this.music.setVolume(0.5);
        this.music.play();
        console.log(this.music.currentConfig);
        this.arrowkeys = this.input.keyboard.createCursorKeys();
        this.player = new Player(this, 200, 200);
        this.tooltip = new Tooltip(this)
        this.tooltip.show(300,300);

        this.bruh = this.sound.add('bruh');
        this.player.dialogStart('intro')
    }

    update(time, delta){
        // runEvery(this, 10, delta, 'musicPitcher', () => randomMusicPitch(this.music));
        // this.player.dialogInput('oi', 'oi');
        if (this.isPaused) return;
        this.player.playerLogic();
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
            duration: 1000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });

        scene.tweens.add({
            targets: this,
            size: { from: 0.2, to: 1.6 },
            duration: 3000,
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