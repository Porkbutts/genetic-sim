import { World } from './world';
import type { Organism, Food } from './types';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private world: World;

  constructor(canvas: HTMLCanvasElement, world: World) {
    this.canvas = canvas;
    this.world = world;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize(): void {
    const container = this.canvas.parentElement;
    if (container) {
      this.canvas.width = container.clientWidth;
      this.canvas.height = container.clientHeight;
    }
  }

  render(): void {
    const { ctx, canvas } = this;
    const { worldWidth, worldHeight } = this.world.config;

    // Calculate scale to fit world in canvas
    const scaleX = canvas.width / worldWidth;
    const scaleY = canvas.height / worldHeight;
    const scale = Math.min(scaleX, scaleY);

    // Center the world
    const offsetX = (canvas.width - worldWidth * scale) / 2;
    const offsetY = (canvas.height - worldHeight * scale) / 2;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw world background
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // World border
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(0, 0, worldWidth, worldHeight);

    // Draw grid
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1 / scale;
    const gridSize = 100;
    for (let x = 0; x <= worldWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= worldHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldWidth, y);
      ctx.stroke();
    }

    // Draw food
    for (const food of this.world.foods) {
      this.renderFood(food);
    }

    // Draw organisms
    for (const organism of this.world.organisms) {
      this.renderOrganism(organism);
    }

    ctx.restore();
  }

  private renderFood(food: Food): void {
    const { ctx } = this;
    const { x, y } = food.position;
    const size = 4 + food.energy / 10;

    // Glow effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, 'rgba(100, 255, 100, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 255, 100, 0.3)');
    gradient.addColorStop(1, 'rgba(100, 255, 100, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = '#90EE90';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderOrganism(organism: Organism): void {
    const { ctx } = this;
    const { x, y } = organism.position;
    const { genes, energy } = organism;

    const size = 8 + genes.size * 12;
    const hue = genes.hue;

    // Calculate opacity based on energy
    const alpha = Math.max(0.3, Math.min(1, energy / 100));

    // Perception range indicator
    if (genes.perception > 0.5) {
      const perceptionRange = genes.perception * 200;
      ctx.strokeStyle = `hsla(${hue}, 50%, 50%, 0.1)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, perceptionRange, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Body glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${alpha})`);
    gradient.addColorStop(0.7, `hsla(${hue}, 70%, 40%, ${alpha * 0.5})`);
    gradient.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Main body
    ctx.fillStyle = `hsla(${hue}, 80%, 50%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    const { velocity } = organism;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    if (speed > 0.1) {
      const dirX = velocity.x / speed;
      const dirY = velocity.y / speed;

      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dirX * size * 1.5, y + dirY * size * 1.5);
      ctx.stroke();
    }

    // Energy bar
    const barWidth = size * 2;
    const barHeight = 3;
    const barX = x - barWidth / 2;
    const barY = y - size - 8;
    const energyPercent = Math.max(0, Math.min(1, energy / 150));

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const energyHue = energyPercent * 120; // Red to green
    ctx.fillStyle = `hsl(${energyHue}, 80%, 50%)`;
    ctx.fillRect(barX, barY, barWidth * energyPercent, barHeight);
  }
}
