import type { SimulationStats, SimulationConfig } from './types';

export class UI {
  private onConfigChange: (config: Partial<SimulationConfig>) => void;
  private onReset: () => void;
  private onTogglePause: () => void;
  private isPaused = false;

  constructor(
    onConfigChange: (config: Partial<SimulationConfig>) => void,
    onReset: () => void,
    onTogglePause: () => void
  ) {
    this.onConfigChange = onConfigChange;
    this.onReset = onReset;
    this.onTogglePause = onTogglePause;

    this.setupControls();
  }

  private setupControls(): void {
    // Pause button
    const pauseBtn = document.getElementById('pause-btn')!;
    pauseBtn.addEventListener('click', () => {
      this.isPaused = !this.isPaused;
      pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
      pauseBtn.classList.toggle('paused', this.isPaused);
      this.onTogglePause();
    });

    // Reset button
    const resetBtn = document.getElementById('reset-btn')!;
    resetBtn.addEventListener('click', () => {
      this.onReset();
    });

    // Mutation rate slider
    const mutationSlider = document.getElementById('mutation-rate') as HTMLInputElement;
    const mutationValue = document.getElementById('mutation-value')!;
    mutationSlider.addEventListener('input', () => {
      const value = parseFloat(mutationSlider.value);
      mutationValue.textContent = value.toFixed(2);
      this.onConfigChange({ mutationRate: value });
    });

    // Food spawn rate slider
    const foodSlider = document.getElementById('food-rate') as HTMLInputElement;
    const foodValue = document.getElementById('food-value')!;
    foodSlider.addEventListener('input', () => {
      const value = parseFloat(foodSlider.value);
      foodValue.textContent = value.toFixed(2);
      this.onConfigChange({ foodSpawnRate: value });
    });

    // Speed slider (simulation speed)
    const speedSlider = document.getElementById('sim-speed') as HTMLInputElement;
    const speedValue = document.getElementById('speed-value')!;
    speedSlider.addEventListener('input', () => {
      const value = parseInt(speedSlider.value);
      speedValue.textContent = value.toString();
      // This is handled differently - we'll emit a custom event
      window.dispatchEvent(new CustomEvent('simSpeedChange', { detail: value }));
    });
  }

  updateStats(stats: SimulationStats): void {
    document.getElementById('stat-population')!.textContent = stats.population.toString();
    document.getElementById('stat-generation')!.textContent = stats.generation.toString();
    document.getElementById('stat-food')!.textContent = stats.foodCount.toString();
    document.getElementById('stat-births')!.textContent = stats.births.toString();
    document.getElementById('stat-deaths')!.textContent = stats.deaths.toString();
    document.getElementById('stat-avg-speed')!.textContent = stats.avgSpeed.toFixed(2);
    document.getElementById('stat-avg-size')!.textContent = stats.avgSize.toFixed(2);
    document.getElementById('stat-avg-perception')!.textContent = stats.avgPerception.toFixed(2);
    document.getElementById('stat-avg-efficiency')!.textContent = stats.avgEfficiency.toFixed(2);
  }
}
