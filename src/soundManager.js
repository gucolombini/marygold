class soundManager extends Phaser.Scene {
    randomMusicPitch(music) {
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
}