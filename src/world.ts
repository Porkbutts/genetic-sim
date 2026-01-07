import type { Organism, Food, SimulationConfig, SimulationStats } from './types';
import {
  createRandomGenes,
  createOrganism,
  updateOrganism,
  canEatFood,
  eatFood,
  canReproduce,
  reproduce,
  isDead,
} from './organism';

let nextFoodId = 0;

export function createFood(x: number, y: number): Food {
  return {
    id: nextFoodId++,
    position: { x, y },
    energy: 30 + Math.random() * 20,
  };
}

export class World {
  organisms: Organism[] = [];
  foods: Food[] = [];
  config: SimulationConfig;
  stats: SimulationStats;
  private frameCount = 0;
  private birthsThisFrame = 0;
  private deathsThisFrame = 0;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.stats = {
      generation: 0,
      population: 0,
      avgSpeed: 0,
      avgSize: 0,
      avgPerception: 0,
      avgEfficiency: 0,
      foodCount: 0,
      births: 0,
      deaths: 0,
    };
  }

  initialize(): void {
    this.organisms = [];
    this.foods = [];

    // Create initial organisms
    for (let i = 0; i < this.config.initialPopulation; i++) {
      const genes = createRandomGenes();
      const position = {
        x: Math.random() * this.config.worldWidth,
        y: Math.random() * this.config.worldHeight,
      };
      this.organisms.push(createOrganism(genes, position));
    }

    // Create initial food
    for (let i = 0; i < this.config.initialFood; i++) {
      this.spawnFood();
    }

    this.updateStats();
  }

  spawnFood(): void {
    const x = Math.random() * this.config.worldWidth;
    const y = Math.random() * this.config.worldHeight;
    this.foods.push(createFood(x, y));
  }

  update(): void {
    this.frameCount++;
    this.birthsThisFrame = 0;
    this.deathsThisFrame = 0;

    // Spawn food periodically
    if (Math.random() < this.config.foodSpawnRate) {
      this.spawnFood();
    }

    // Update all organisms
    const newOrganisms: Organism[] = [];

    for (const organism of this.organisms) {
      updateOrganism(organism, this.foods, this.config);

      // Check for food eating
      for (let i = this.foods.length - 1; i >= 0; i--) {
        if (canEatFood(organism, this.foods[i])) {
          eatFood(organism, this.foods[i]);
          this.foods.splice(i, 1);
        }
      }

      // Check for reproduction
      if (canReproduce(organism, this.config)) {
        const child = reproduce(organism, this.config);
        newOrganisms.push(child);
        this.birthsThisFrame++;
      }
    }

    // Add new organisms
    this.organisms.push(...newOrganisms);

    // Remove dead organisms
    const originalCount = this.organisms.length;
    this.organisms = this.organisms.filter(o => !isDead(o, this.config));
    this.deathsThisFrame = originalCount - this.organisms.length;

    // Update statistics
    this.updateStats();
  }

  private updateStats(): void {
    if (this.organisms.length === 0) {
      this.stats = {
        ...this.stats,
        population: 0,
        avgSpeed: 0,
        avgSize: 0,
        avgPerception: 0,
        avgEfficiency: 0,
        foodCount: this.foods.length,
        births: this.birthsThisFrame,
        deaths: this.deathsThisFrame,
      };
      return;
    }

    let totalSpeed = 0;
    let totalSize = 0;
    let totalPerception = 0;
    let totalEfficiency = 0;
    let maxGeneration = 0;

    for (const organism of this.organisms) {
      totalSpeed += organism.genes.speed;
      totalSize += organism.genes.size;
      totalPerception += organism.genes.perception;
      totalEfficiency += organism.genes.efficiency;
      maxGeneration = Math.max(maxGeneration, organism.generation);
    }

    const count = this.organisms.length;
    this.stats = {
      generation: maxGeneration,
      population: count,
      avgSpeed: totalSpeed / count,
      avgSize: totalSize / count,
      avgPerception: totalPerception / count,
      avgEfficiency: totalEfficiency / count,
      foodCount: this.foods.length,
      births: this.birthsThisFrame,
      deaths: this.deathsThisFrame,
    };
  }

  getStats(): SimulationStats {
    return { ...this.stats };
  }
}
