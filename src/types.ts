// Genetic traits that organisms can have
export interface Genes {
  speed: number;        // Movement speed (0-1)
  size: number;         // Body size (0-1)
  perception: number;   // How far they can see food (0-1)
  efficiency: number;   // How efficiently they use energy (0-1)
  hue: number;          // Color hue (0-360)
}

export interface Position {
  x: number;
  y: number;
}

export interface Organism {
  id: number;
  genes: Genes;
  position: Position;
  energy: number;
  age: number;
  generation: number;
  velocity: Position;
}

export interface Food {
  id: number;
  position: Position;
  energy: number;
}

export interface SimulationStats {
  generation: number;
  population: number;
  avgSpeed: number;
  avgSize: number;
  avgPerception: number;
  avgEfficiency: number;
  foodCount: number;
  births: number;
  deaths: number;
}

export interface SimulationConfig {
  worldWidth: number;
  worldHeight: number;
  initialPopulation: number;
  initialFood: number;
  foodSpawnRate: number;
  mutationRate: number;
  mutationStrength: number;
  reproductionThreshold: number;
  maxAge: number;
  baseEnergyDrain: number;
}
