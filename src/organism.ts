import type { Genes, Organism, Position, Food, SimulationConfig } from './types';

let nextOrganismId = 0;

export function createRandomGenes(): Genes {
  return {
    speed: Math.random() * 0.8 + 0.2,
    size: Math.random() * 0.8 + 0.2,
    perception: Math.random() * 0.8 + 0.2,
    efficiency: Math.random() * 0.8 + 0.2,
    hue: Math.random() * 360,
  };
}

export function createOrganism(
  genes: Genes,
  position: Position,
  generation: number = 0
): Organism {
  return {
    id: nextOrganismId++,
    genes,
    position: { ...position },
    energy: 100,
    age: 0,
    generation,
    velocity: { x: 0, y: 0 },
  };
}

export function mutateGenes(genes: Genes, rate: number, strength: number): Genes {
  const mutate = (value: number, min: number = 0.1, max: number = 1): number => {
    if (Math.random() < rate) {
      const mutation = (Math.random() - 0.5) * 2 * strength;
      return Math.max(min, Math.min(max, value + mutation));
    }
    return value;
  };

  return {
    speed: mutate(genes.speed),
    size: mutate(genes.size),
    perception: mutate(genes.perception),
    efficiency: mutate(genes.efficiency),
    hue: mutate(genes.hue, 0, 360),
  };
}

export function crossoverGenes(parent1: Genes, parent2: Genes): Genes {
  return {
    speed: Math.random() < 0.5 ? parent1.speed : parent2.speed,
    size: Math.random() < 0.5 ? parent1.size : parent2.size,
    perception: Math.random() < 0.5 ? parent1.perception : parent2.perception,
    efficiency: Math.random() < 0.5 ? parent1.efficiency : parent2.efficiency,
    hue: (parent1.hue + parent2.hue) / 2 + (Math.random() - 0.5) * 30,
  };
}

function distance(p1: Position, p2: Position): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function findNearestFood(organism: Organism, foods: Food[]): Food | null {
  const perceptionRange = organism.genes.perception * 200;
  let nearest: Food | null = null;
  let nearestDist = Infinity;

  for (const food of foods) {
    const dist = distance(organism.position, food.position);
    if (dist < perceptionRange && dist < nearestDist) {
      nearest = food;
      nearestDist = dist;
    }
  }

  return nearest;
}

export function updateOrganism(
  organism: Organism,
  foods: Food[],
  config: SimulationConfig
): void {
  // Age the organism
  organism.age++;

  // Find nearest food
  const nearestFood = findNearestFood(organism, foods);

  // Update velocity based on nearest food or random movement
  const maxSpeed = organism.genes.speed * 5;

  if (nearestFood) {
    // Move towards food
    const dx = nearestFood.position.x - organism.position.x;
    const dy = nearestFood.position.y - organism.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      organism.velocity.x = (dx / dist) * maxSpeed;
      organism.velocity.y = (dy / dist) * maxSpeed;
    }
  } else {
    // Random wandering
    organism.velocity.x += (Math.random() - 0.5) * 0.5;
    organism.velocity.y += (Math.random() - 0.5) * 0.5;

    // Limit speed
    const speed = Math.sqrt(
      organism.velocity.x * organism.velocity.x +
      organism.velocity.y * organism.velocity.y
    );
    if (speed > maxSpeed) {
      organism.velocity.x = (organism.velocity.x / speed) * maxSpeed;
      organism.velocity.y = (organism.velocity.y / speed) * maxSpeed;
    }
  }

  // Update position
  organism.position.x += organism.velocity.x;
  organism.position.y += organism.velocity.y;

  // Wrap around world edges
  if (organism.position.x < 0) organism.position.x += config.worldWidth;
  if (organism.position.x > config.worldWidth) organism.position.x -= config.worldWidth;
  if (organism.position.y < 0) organism.position.y += config.worldHeight;
  if (organism.position.y > config.worldHeight) organism.position.y -= config.worldHeight;

  // Energy drain based on speed and size (larger and faster = more energy)
  const speedCost = Math.sqrt(
    organism.velocity.x * organism.velocity.x +
    organism.velocity.y * organism.velocity.y
  ) * 0.1;
  const sizeCost = organism.genes.size * 0.05;
  const efficiencyModifier = 1 - (organism.genes.efficiency * 0.5);

  organism.energy -= (config.baseEnergyDrain + speedCost + sizeCost) * efficiencyModifier;
}

export function canEatFood(organism: Organism, food: Food): boolean {
  const eatRange = organism.genes.size * 20 + 10;
  return distance(organism.position, food.position) < eatRange;
}

export function eatFood(organism: Organism, food: Food): void {
  organism.energy += food.energy * (0.5 + organism.genes.efficiency * 0.5);
}

export function canReproduce(organism: Organism, config: SimulationConfig): boolean {
  return organism.energy >= config.reproductionThreshold;
}

export function reproduce(
  parent: Organism,
  config: SimulationConfig
): Organism {
  // Use energy for reproduction
  parent.energy -= config.reproductionThreshold / 2;

  // Create child with mutated genes
  const childGenes = mutateGenes(
    parent.genes,
    config.mutationRate,
    config.mutationStrength
  );

  // Spawn near parent
  const childPosition = {
    x: parent.position.x + (Math.random() - 0.5) * 50,
    y: parent.position.y + (Math.random() - 0.5) * 50,
  };

  const child = createOrganism(childGenes, childPosition, parent.generation + 1);
  child.energy = config.reproductionThreshold / 2;

  return child;
}

export function isDead(organism: Organism, config: SimulationConfig): boolean {
  return organism.energy <= 0 || organism.age >= config.maxAge;
}
