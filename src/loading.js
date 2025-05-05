class Loading extends Phaser.Scene {
    // Tela de loading
    constructor() {
      super({ key: "Loading" });
    }
  
    loadingProgress;
    loadingText;
    loadedFile;
  
    preload() {
      // Adiciona um texto na tela
      this.loadingText = this.add
      .text(width / 2, height / 2, "Loading: " + this.loadingProgress + "%/n" + this.loadedFile, {
        fontFamily: 'Arial', // Fonte utilizada (ATENÇÃO: Essa fonte só existe porque foram carregadas fontes no html)
        resolution: 5, // Resolução da fonte
        fontSize: "30px", // Tamanho da fonte
        fill: "#FFFFFF", // Cor da fonte
        align: "center", // Alinhamento do texto
        wordWrap: { width: 500 }, // Tamanho para a quebra do texto
      })
      .setOrigin(0.5, 0.5); // Mudando a origem para o centro do texto
  
      this.load.on('fileprogress', (file) => { // Mostra o arquivo que foi carregado
        this.loadedFile = file.src;
        console.log(this.loadedFile); // Verifica se o arquivo está correto no log
      });
  
      // Atualizando a porcentagem carregado
      this.load.on("progress", (value) => {
        this.loadingProgress = Math.floor(value * 100); // Armazena a porcentagem
        console.log(this.loadingProgress)
        this.loadingText.setText("Loading: " + this.loadingProgress + "%" + "\n" + this.loadedFile)
      });
      this.load.image('background0', 'src/public/assets/bg0.png');
      this.load.image('background', 'src/public/assets/bg.png');
      this.load.image('floor', 'src/public/assets/floor.png');
      this.load.image('sky', 'src/public/assets/sky.png');
      this.load.image('trees', 'src/public/assets/trees.png');
      this.load.audio('garden_calm', 'src/public/assets/garden_calm.ogg');
      this.load.image('marystatic', 'src/public/assets/marystatic.png');
      this.load.image('tooltip_e', 'src/public/assets/tooltipE.png');
      this.load.image('tooltip_space', 'src/public/assets/tooltipSPACE.png');
      this.load.image('dialogbox', 'src/public/assets/dialogbox.png');
      this.load.image('fence', 'src/public/assets/fence.png');
  
      this.load.image('portrait_mary', 'src/public/assets/portraits/portrait_mary.png');
      this.load.image('portrait_mary_worried', 'src/public/assets/portraits/portrait_mary_worried.png');
      this.load.image('portrait_mary_cursed', 'src/public/assets/portraits/portrait_mary_cursed.png');
      this.load.image('portrait_mary_eye', 'src/public/assets/portraits/portrait_mary_eye.png');
      this.load.image('portrait_mary_hole', 'src/public/assets/portraits/portrait_mary_hole.png');
      this.load.image('portrait_exclamation', 'src/public/assets/portraits/portrait_exclamation.png');
  
      this.load.audio('bruh', 'src/public/assets/audio/blip_mary.ogg');

      this.load.spritesheet('mary', 'src/public/assets/mary.png', {
        frameWidth: 104,
        frameHeight: 119,
      });

      // mapa tilesets e elementos especiais
      for (let i = 0; i < 16; i++) {
        this.load.tilemapTiledJSON('map_'+i, 'src/public/assets/maps/garden'+i+'.json');
      }
      for (let i = 1; i < 4; i++) {
        this.load.tilemapTiledJSON('map_power'+i, 'src/public/assets/maps/gardenpower'+i+'.json');
      }
      this.load.image('tileset_garden', 'src/public/assets/maps/tileset_garden.png');
      this.load.spritesheet('puddle', 'src/public/assets/puddle.png', {
        frameWidth: 80,
        frameHeight: 80,
      });
      this.load.spritesheet('carrot', 'src/public/assets/carrot.png', {
        frameWidth: 36,
        frameHeight: 51,
      });
      this.load.spritesheet('buriedcarrot', 'src/public/assets/carrotburied.png', {
        frameWidth: 29,
        frameHeight: 24,
      });
      this.load.spritesheet('powerup', 'src/public/assets/powerup.png', {
        frameWidth: 64,
        frameHeight: 59,
      });
      this.load.spritesheet('shine', 'src/public/assets/shine.png', {
        frameWidth: 80,
        frameHeight: 80,
      });
    }
  
    create() {
  
    }
  
    update() {
      // Atualizando a porcentagem do loading
      this.loadingText.setText("Loading: " + this.loadingProgress + "%");
  
      // Quando completar 100% ele troca de cena
      if (this.loadingProgress == 100) {
        this.scene.start("Garden");
      }
    }
  }
  