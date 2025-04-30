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
    } 
    moveLogic() {
        console.log(this.x, this.y);
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
}