class ShaderTest extends Phaser.Scene {
    constructor() {
        super({ key: "ShaderTest" });
    }
    
    preload() {
        this.load.image('background', 'src/public/assets/bg.png');
        
        // Load both test shaders
        this.load.glsl('testshader', 'src/shaders/test_shader.frag');
        this.load.glsl('glitchshader', 'src/shaders/glitch.frag');
    }
    
    create() {
        this.currentShader = 'test';
        
        // Add UI elements
        this.add.text(20, 20, 'Shader Test Scene', { color: '#ffffff' });
        
        // Add toggle button
        const toggleButton = this.add.text(20, 60, 'Toggle Shader', { 
            color: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        });
        toggleButton.setInteractive();
        toggleButton.on('pointerdown', () => this.toggleShader());
        
        // Create test shader pipeline
        this.renderer.pipelines.add('Test', new TestPipeline(this.game));
        
        // Create glitch shader pipeline
        this.renderer.pipelines.add('Glitch', new GlitchPipeline(this.game));
        
        // Add background image
        this.bg = this.add.image(400, 300, 'background');
        this.bg.setPipeline('Test'); // Start with test shader
        
        // Display current shader name
        this.shaderText = this.add.text(20, 100, 'Current: Test Shader', { color: '#ffffff' });
        
        // Add FPS counter
        this.fpsText = this.add.text(20, 140, 'FPS: 0', { color: '#ffffff' });
        
        // Add pipeline info
        this.pipelineText = this.add.text(20, 180, '', { color: '#ffffff' });
        this.updatePipelineInfo();
    }
    
    toggleShader() {
        if (this.currentShader === 'test') {
            this.bg.setPipeline('Glitch');
            this.currentShader = 'glitch';
            this.shaderText.setText('Current: Glitch Shader');
        } else {
            this.bg.setPipeline('Test');
            this.currentShader = 'test';
            this.shaderText.setText('Current: Test Shader');
        }
    }
    
    updatePipelineInfo() {
        const pipelines = this.renderer.pipelines;
        const info = [
            `Total pipelines: ${pipelines.length}`,
            `Available pipelines: ${Object.keys(pipelines.pipes).join(', ')}`
        ].join('\n');
        
        this.pipelineText.setText(info);
    }
    
    update(time, delta) {
        // Update FPS counter
        this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        
        // Update the time uniform for both pipelines
        const testPipeline = this.renderer.pipelines.get('Test');
        const glitchPipeline = this.renderer.pipelines.get('Glitch');
        
        if (testPipeline) {
            testPipeline.setFloat1('time', time / 1000);
        }
        
        if (glitchPipeline) {
            glitchPipeline.setFloat1('time', time / 1000);
        }
    }
}

class TestPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game: game,
            name: 'Test',
            fragShader: game.cache.shader.get('testshader').fragmentSrc,
            uniforms: [
                'tDiffuse',
                'resolution',
                'time'
            ]
        });
    }
}

class GlitchPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game: game,
            name: 'Glitch',
            fragShader: game.cache.shader.get('glitchshader').fragmentSrc,
            uniforms: [
                'tDiffuse',
                'resolution',
                'time'
            ]
        });
    }
}