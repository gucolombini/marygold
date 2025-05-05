// Definindo a largura e altura da página
var width = 800,
  height = 600;

var config = {
  //configuracoes basicas
  type: Phaser.WEBGL,
  width: width,
  height: height,
  zoom: 1, // ensures no internal scaling
  disableContextMenu: true, // Desativa a interação do navegador com o botão direito do mouse
  //CONSERTAR ENQUADRAMENTO
  scale: { mode: Phaser.Scale.FIT }, //Dimensiona o conteúdo para que ele preencha a tela inteira, mantendo sua proporção
  backgroundColor: "#272036", //define a cor de fundo
  pixelArt: true,
  roundPixels: true,
  //Adicionando as classes/cenas do jogo, conforme a ordem do gameflow
  physics: {
    //ativando a fisica do jogo
    default: "arcade", //fisicas tipo arcade
    arcade: {
      gravity: { y: 0 }, //Retirando a gravidade do jogo
      debug: false, //ativa o modo de debug/depuracao
    },
  },
  scale: {
    mode: Phaser.Scale.NONE, // No automatic scaling
    autoCenter: Phaser.Scale.NO_CENTER // Optional: don’t auto center
  },
  scene: [Loading, Garden],
};

// Instanciando o phaser
var game = new Phaser.Game(config);

// Mecânicas =)
//funcao para criar uma hitbox retangular
function createButton(graphics, x, y, width, height, funcao) {
  //cria o retangulo
  graphics.setInteractive(
    (this.retangulo = new Phaser.Geom.Rectangle(x, y, width, height)),
    Phaser.Geom.Rectangle.Contains
  );
  //realizar funcao ao clicar na hitbox
  graphics.on("pointerdown", funcao);
  //ativa o debug
  graphics.strokeRectShape(this.retangulo);
}
// Função para deixar o elemento clicável
function button(object, funcao) {
  // Transforma o elemento em interátivo
  object.setInteractive();
  //realizar funcao ao clicar na hitbox
  object.on("pointerdown", funcao);
}

// Função para movimentar o personagem sem pulo
function moveChar(scene, speedX, speedY, character) {
  scene.keys = scene.input.keyboard.addKeys({
    // Muita atenção com essa parte, caso queira mudar os inputs, é por aqui que se faz
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
  });

  if (scene.keys.left.isDown) {
    character.setVelocityX(-speedX);
  } else if (scene.keys.right.isDown) {
    character.setVelocityX(speedX);
  } else {
    character.setVelocityX(0);
  }
  if (scene.keys.up.isDown) {
    character.setVelocityY(-speedY);
  } else if (scene.keys.down.isDown) {
    character.setVelocityY(speedY);
  } else {
    character.setVelocityY(0);
  }
}

// Função para criar animações
function createAnimation(
  scene,
  animationName = String,
  spritesheet = String,
  start = Number,
  end = Number,
  frameRate = Number,
  repeat = Number,
  yoyo = Boolean
) {
  if (scene.anims.exists(animationName)) return;
  if (!yoyo) yoyo = false;
  scene.anims.create({
    //cria a animacao
    key: animationName, //nome da animacao
    frames: scene.anims.generateFrameNumbers(spritesheet, {
      //adiciona os frames em que a animacao vai rodar
      start: start,
      end: end,
    }),
    frameRate: frameRate, //velocidade da animacao
    repeat: repeat, //Quantas vezes a cena repete (OBS: para repitir infinitamente, usar -1)
    yoyo: yoyo,
  });
}

function Unload(scene, data)
{
	
	/*Animations are loaded from JSON files that are linked to spritesheets, however
	  We don't want to be too picky about the order in which things are unloaded
	  so we can't guarantee those JSON files will still exist. Thus we need to get
	  the animation data from the scene so we can figure out which ones need to be
	  removed.*/
	var animationData = scene.anims.toJSON().anims;
	
	for(var i = 0; i < data.length; i++)
	{
		
		switch (data[i].type)
		{
			
			case "image":
				//Unload Images by removing from the textures cache
				scene.textures.remove(data[i].id); 
				break;
			
			case "spritesheet":
				//Spritesheets are composed of a texture and animation data, so we need to remove the texture
				scene.textures.remove(data[i].id); 

				//Pick out which animations correspond to this spritesheet so we can remove them
				var animations = animationData.filter(function(val)
				{
					
					/*Our naming convention is that Spritesheet "Key" is given animations
					  with keys matching the format "Key-AnimationName". Therefore if we
					  remove that spritesheet, we remove all of the animations corresponding
					  to it. If your naming convention is different, then modify as necessary.*/
					return (val.key.indexOf(data[i].id + "-") == 0);
					
				});
				
				for(var j = 0; j < animations.length; j++)
				{
					
					scene.anims.remove(animations[j].key);
					
				}
				
				break;
			
			case "json":
				//The cache member of a scene has a bunch of subcaches for most other assets, so remove from there as necessary
				scene.cache.json.remove(data[i].id); 
				break;
			
			case "sound":
				scene.cache.audio.remove(data[i].id);
				break;
			
			case "music":
				scene.cache.audio.remove(data[i].id);
				break;
			
		}
		
	}
	
}

// Função que roda toda vez a cada intervalo no update
function runEvery(scene, interval, delta, key, callback) {
  if (!scene._timers) scene._timers = {};
  if (!scene._timers[key]) scene._timers[key] = 0;

  scene._timers[key]++;

  if (scene._timers[key] >= interval) {
      callback();
      scene._timers[key] = 0;
  }
}

/**
 * Create typewriter animation for text
 * @param {Phaser.GameObjects.Text} target
 * @param {number} [speedInMs=25]
 * @returns {Promise<void>}
 */
function animateText(target, speedInMs = 25, sound) {
  // store original text
  const message = target.text;
  const invisibleMessage = message.replace(/[^ ]/g, " ");

  // clear text on screen
  target.text = "";

  // mutable state for visible text
  let visibleText = "";

  // use a Promise to wait for the animation to complete
  return new Promise((resolve) => {
    const timer = target.scene.time.addEvent({
      delay: speedInMs,
      loop: true,
      callback() {
        // if all characters are visible, stop the timer
        if (target.text === message) {
          timer.destroy();
          return resolve();
        }

        // add next character to visible text
        if (sound != null && message[visibleText.length] != " " && message[visibleText.length] != "!" && message[visibleText.length] != "?" && message[visibleText.length] != "." && message[visibleText.length] != ",") {
          rate = Phaser.Math.Between(8, 12)/10
          sound.setRate(rate)
          sound.play();
        }

        visibleText += message[visibleText.length];

        // right pad with invisibleText
        const invisibleText = invisibleMessage.substring(visibleText.length);

        // update text on screen
        target.text = visibleText + invisibleText;
      },
    });
  });
}

function glitchLag(scene, times, interval, event, end) {
  for(let i=0; i<times; i++) {
    scene.time.delayedCall(interval*i, () => {
      console.log("GLITCH");
      if (event) event();
    })
  }
  scene.time.delayedCall(interval*times+1, () => {
    if (end) end();
  })
}