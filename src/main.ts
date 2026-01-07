import './style.css';
import type { SimulationConfig } from './types';
import { World } from './world';
import { Renderer } from './renderer';
import { UI } from './ui';

const defaultConfig: SimulationConfig = {
  worldWidth: 1000,
  worldHeight: 800,
  initialPopulation: 30,
  initialFood: 100,
  foodSpawnRate: 0.3,
  mutationRate: 0.15,
  mutationStrength: 0.2,
  reproductionThreshold: 150,
  maxAge: 3000,
  baseEnergyDrain: 0.1,
};

class Simulation {
  private world: World;
  private renderer: Renderer;
  private ui: UI;
  private config: SimulationConfig;
  private isPaused = false;
  private stepsPerFrame = 1;

  constructor() {
    this.config = { ...defaultConfig };
    this.world = new World(this.config);

    const canvas = document.getElementById('simulation-canvas') as HTMLCanvasElement;
    this.renderer = new Renderer(canvas, this.world);

    this.ui = new UI(
      (partialConfig) => this.updateConfig(partialConfig),
      () => this.reset(),
      () => this.togglePause()
    );

    // Listen for speed changes
    window.addEventListener('simSpeedChange', ((e: CustomEvent) => {
      this.stepsPerFrame = e.detail;
    }) as EventListener);

    this.reset();
    this.startLoop();
  }

  private updateConfig(partialConfig: Partial<SimulationConfig>): void {
    Object.assign(this.config, partialConfig);
    Object.assign(this.world.config, partialConfig);
  }

  private reset(): void {
    this.world.initialize();
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
  }

  private startLoop(): void {
    const loop = () => {
      if (!this.isPaused) {
        for (let i = 0; i < this.stepsPerFrame; i++) {
          this.world.update();
        }
      }

      this.renderer.render();
      this.ui.updateStats(this.world.getStats());

      requestAnimationFrame(loop);
    };

    loop();
  }
}

// Start the simulation when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Simulation();
});
