import { ParticleRenderer, ParticleRenderOptions } from './ParticleRenderer';
import { Particle } from '../particleEngine';

// WebGL shaders 
const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  attribute vec4 a_color;
  attribute float a_size;
  attribute float a_rotation;

  uniform vec2 u_resolution;

  varying vec2 v_texCoord;
  varying vec4 v_color;
  varying float v_rotation;

  void main() {
    // Convert position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;
    
    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;
    
    // Convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;
    
    // Flip Y so positive Y is up
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    
    // Pass texture coords and color to fragment shader
    v_texCoord = a_texCoord;
    v_color = a_color;
    v_rotation = a_rotation;
    
    // Set point size based on attribute
    gl_PointSize = a_size;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  
  uniform sampler2D u_texture;
  uniform bool u_useTexture;
  
  varying vec2 v_texCoord;
  varying vec4 v_color;
  varying float v_rotation;
  
  void main() {
    vec2 coord = gl_PointCoord - 0.5;
    
    // Apply rotation if needed
    if (v_rotation != 0.0) {
      float c = cos(v_rotation);
      float s = sin(v_rotation);
      coord = vec2(
        coord.x * c - coord.y * s,
        coord.x * s + coord.y * c
      );
    }
    
    coord += 0.5;
    
    vec4 color = v_color;
    
    // Apply texture if available
    if (u_useTexture) {
      vec4 texColor = texture2D(u_texture, coord);
      // Premultiply alpha
      color *= texColor;
    } else {
      // If outside the circle, discard the fragment
      float dist = length(gl_PointCoord - 0.5);
      if (dist > 0.5) {
        discard;
      }
    }
    
    gl_FragColor = color;
  }
`;

export class WebGLRenderer implements ParticleRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private texture: WebGLTexture | null = null;
  private hasTexture: boolean = false;
  
  // Attributes and uniforms
  private positionLocation: number = -1;
  private texCoordLocation: number = -1;
  private colorLocation: number = -1;
  private sizeLocation: number = -1;
  private rotationLocation: number = -1;
  private resolutionLocation: WebGLUniformLocation | null = null;
  private textureLocation: WebGLUniformLocation | null = null;
  private useTextureLocation: WebGLUniformLocation | null = null;
  
  // Buffers
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;
  private colorBuffer: WebGLBuffer | null = null;
  private sizeBuffer: WebGLBuffer | null = null;
  private rotationBuffer: WebGLBuffer | null = null;
  
  // Temporary arrays for data
  private positions: Float32Array = new Float32Array(0);
  private texCoords: Float32Array = new Float32Array(0);
  private colors: Float32Array = new Float32Array(0);
  private sizes: Float32Array = new Float32Array(0);
  private rotations: Float32Array = new Float32Array(0);
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initWebGL();
  }
  
  private initWebGL(): void {
    try {
      // Get WebGL context
      this.gl = this.canvas.getContext('webgl', {
        premultipliedAlpha: true,
        alpha: true,
      });
      
      if (!this.gl) {
        console.error('WebGL not supported, falling back to Canvas renderer');
        return;
      }
      
      // Create shader program
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, VERTEX_SHADER);
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      
      if (!vertexShader || !fragmentShader) {
        console.error('Error creating shaders');
        return;
      }
      
      this.program = this.createProgram(vertexShader, fragmentShader);
      
      if (!this.program) {
        console.error('Error creating shader program');
        return;
      }
      
      // Get attribute and uniform locations
      this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
      this.texCoordLocation = this.gl.getAttribLocation(this.program, 'a_texCoord');
      this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
      this.sizeLocation = this.gl.getAttribLocation(this.program, 'a_size');
      this.rotationLocation = this.gl.getAttribLocation(this.program, 'a_rotation');
      
      this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
      this.textureLocation = this.gl.getUniformLocation(this.program, 'u_texture');
      this.useTextureLocation = this.gl.getUniformLocation(this.program, 'u_useTexture');
      
      // Create buffers
      this.positionBuffer = this.gl.createBuffer();
      this.texCoordBuffer = this.gl.createBuffer();
      this.colorBuffer = this.gl.createBuffer();
      this.sizeBuffer = this.gl.createBuffer();
      this.rotationBuffer = this.gl.createBuffer();
      
      // Enable necessary WebGL features
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    } catch (e) {
      console.error('Error initializing WebGL:', e);
    }
  }
  
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (!success) {
      console.error('Could not compile shader:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    if (!this.gl) return null;
    
    const program = this.gl.createProgram();
    if (!program) return null;
    
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    
    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!success) {
      console.error('Could not link program:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }
  
  public setTexture(image: HTMLImageElement | null): void {
    if (!this.gl || !this.program) return;
    
    if (image) {
      if (!this.texture) {
        this.texture = this.gl.createTexture();
      }
      
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      
      // Set texture parameters
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      
      this.hasTexture = true;
    } else {
      this.hasTexture = false;
    }
  }
  
  public resize(width: number, height: number): void {
    if (!this.gl) return;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }
  
  public clear(): void {
    if (!this.gl) return;
    
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
  public render(particles: Particle[], options: ParticleRenderOptions): void {
    if (!this.gl || !this.program) return;
    
    const { width, height, blendMode = 'source-over' } = options;
    
    // Set canvas size if changed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.resize(width, height);
    }
    
    // Set blend mode
    switch (blendMode) {
      case 'multiply':
        this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ONE_MINUS_SRC_ALPHA);
        break;
      case 'screen':
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_COLOR);
        break;
      case 'lighter':
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        break;
      default: // 'source-over'
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        break;
    }
    
    // Clear canvas
    this.clear();
    
    // Nothing to render
    if (particles.length === 0) return;
    
    // Resize buffers if needed
    if (this.positions.length < particles.length * 2) {
      this.positions = new Float32Array(particles.length * 2);
      this.texCoords = new Float32Array(particles.length * 2);
      this.colors = new Float32Array(particles.length * 4);
      this.sizes = new Float32Array(particles.length);
      this.rotations = new Float32Array(particles.length);
    }
    
    // Fill buffers with particle data
    let idx = 0, colorIdx = 0;
    for (const p of particles) {
      this.positions[idx] = p.position.x;
      this.positions[idx + 1] = p.position.y;
      
      this.texCoords[idx] = 0.5;
      this.texCoords[idx + 1] = 0.5;
      
      // Parse color from hex string to RGB (assuming #RRGGBB format)
      const hexColor = p.color.startsWith('#') ? p.color : '#ffffff';
      const r = parseInt(hexColor.substring(1, 3), 16) / 255;
      const g = parseInt(hexColor.substring(3, 5), 16) / 255;
      const b = parseInt(hexColor.substring(5, 7), 16) / 255;
      
      this.colors[colorIdx] = r;
      this.colors[colorIdx + 1] = g;
      this.colors[colorIdx + 2] = b;
      this.colors[colorIdx + 3] = p.opacity;
      
      // Use scale as size
      this.sizes[idx / 2] = p.scale * 10; // Scale factor to make particles visible
      this.rotations[idx / 2] = p.rotation;
      
      idx += 2;
      colorIdx += 4;
    }
    
    // Use our shader program
    this.gl.useProgram(this.program);
    
    // Set resolution uniform
    this.gl.uniform2f(this.resolutionLocation, width, height);
    
    // Set texture uniform
    this.gl.uniform1i(this.textureLocation, 0);
    this.gl.uniform1i(this.useTextureLocation, this.hasTexture ? 1 : 0);
    
    if (this.hasTexture) {
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
    
    // Position attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions.subarray(0, particles.length * 2), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.positionLocation);
    this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    // TexCoord attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.texCoords.subarray(0, particles.length * 2), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.texCoordLocation);
    this.gl.vertexAttribPointer(this.texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    
    // Color attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colors.subarray(0, particles.length * 4), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.colorLocation);
    this.gl.vertexAttribPointer(this.colorLocation, 4, this.gl.FLOAT, false, 0, 0);
    
    // Size attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.sizes.subarray(0, particles.length), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.sizeLocation);
    this.gl.vertexAttribPointer(this.sizeLocation, 1, this.gl.FLOAT, false, 0, 0);
    
    // Rotation attribute
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rotationBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.rotations.subarray(0, particles.length), this.gl.STATIC_DRAW);
    this.gl.enableVertexAttribArray(this.rotationLocation);
    this.gl.vertexAttribPointer(this.rotationLocation, 1, this.gl.FLOAT, false, 0, 0);
    
    // Draw the points
    this.gl.drawArrays(this.gl.POINTS, 0, particles.length);
  }

  public dispose(): void {
    if (!this.gl) return;
    
    // Delete buffers
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.texCoordBuffer);
    this.gl.deleteBuffer(this.colorBuffer);
    this.gl.deleteBuffer(this.sizeBuffer);
    this.gl.deleteBuffer(this.rotationBuffer);
    
    // Delete texture
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }
    
    // Delete shaders and program
    if (this.program) {
      this.gl.deleteProgram(this.program);
    }
    
    // Clear references
    this.gl = null;
    this.program = null;
    this.texture = null;
  }
} 