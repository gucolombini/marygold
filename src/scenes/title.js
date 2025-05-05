class Title extends Phaser.Scene {
    // Tela do labirinto
    constructor() {
      super({ key: "Title" });
    }

    //variaveis
    start;

    preload(){
        this.load.image('titlescreen_bg', 'src/public/assets/titlescreen_bg.png');
        this.load.image('titlescreen_mary', 'src/public/assets/titlescreen_mary.png');
        this.load.spritesheet('playbutton', 'src/public/assets/playbutton.png', {
            frameWidth: 156,
            frameHeight: 73,
          });
    }

    create(){
        this.bg = this.add.image(width/2, 0, 'titlescreen_bg')
        this.add.image(width/2, (height/2), 'titlescreen_mary')
        const playButton = this.add.sprite(600, 500, 'playbutton', 0).setInteractive();

        this.tweens.add({
            targets: playButton,
            angle: { from: -2, to: 2 },
            scale: { from: 1, to: 2},
            duration: 2000,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: playButton,
            scale: { from: 1, to: 1.2 },
            duration: 1200,
            yoyo: true,
            repeat: -1, // Infinite loop
            ease: 'Sine.easeInOut'
        });
        // Hover effects
        playButton.on('pointerover', () => {
            playButton.setFrame(1);
        });
    
        playButton.on('pointerout', () => {
            playButton.setFrame(0);
        });
    
        // On click, go to Loading scene
        playButton.on('pointerdown', () => {
            this.scene.start('Loading');
        });
    }

    update(time, delta){
        if (this.bg.y < 600) {
            this.bg.setPosition(this.bg.x, this.bg.y+delta/10);
        } else this.bg.setPosition(this.bg.x, 0);

    }
}