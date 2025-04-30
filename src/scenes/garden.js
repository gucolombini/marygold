class Garden extends Phaser.Scene {
    constructor() {
      super({ key: "Garden" });
    }

    preload(){
        // CRIAR MÉTODO PARA PRELOAD
        this.load.image('background', 'src/public/assets/bg.png');
        this.load.audio('garden_calm', 'src/public/assets/garden_calm.ogg');
        this.load.glsl('bundle', 'src/shaders/bundle.glsl.js');
        this.load.image('marygold', 'src/public/assets/marystatic.png');
        this.load.image('tooltip_e', 'src/public/assets/tooltipE.png');
    }

    create(){
        this.isPaused = false;
        this.add.image(400, 300, 'background');
        this.music = this.sound.add('garden_calm');
        this.music._interval = Phaser.Math.Between(-10, 10)
        this.music.setLoop(true);
        this.music.setVolume(0.5);
        this.music.play();
        console.log(this.music.currentConfig);
        this.arrowkeys = this.input.keyboard.createCursorKeys();
        this.player = new Player(this, 200, 200);
    }

    update(){
        runEvery(this, 10, 'musicPitcher', () => randomMusicPitch(this.music));
        if (this.isPaused) return;
        this.player.moveLogic();
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
    console.log(music.rate);
    if (music._interval < 0.5 && music._interval > -0.5) {
        music._interval = Phaser.Math.Between(-10, 10);
    };
}