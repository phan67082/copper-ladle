// The Copper Ladle — configuration: the kitchen's size, its ingredients, its
// recipes and how a shift escalates. One job only: numbers and names, no logic.
export const VIEW = { width: 1280, height: 800 };

// The shift lasts two and a half minutes of play.
export const SHIFT_SECONDS = 150;
export const RUSH_AT_SECONDS_LEFT = 60;

// How long a ticket waits before the customer walks out.
export const PATIENCE_START = 50;
export const PATIENCE_RUSH = 34;

// Seconds between new tickets, calm and rush.
export const SPAWN_START = 14;
export const SPAWN_RUSH = 7;
export const MAX_TICKETS = 3;

// Grill and chopping rules.
export const GRILL_SLOTS = 2;
export const CHOPS_NEEDED = 2;
export const BURN_AFTER_SECONDS = 4;

// Scoring.
export const MISS_PENALTY = 50;
export const COMBO_STEP = 0.25;
export const COMBO_MAX = 2.5;

// Every ingredient: its key, its colour story, what it needs before plating,
// and how long the grill takes it (0 means it never sees the grill).
export const INGREDIENTS = [
  { id: 'bun',     name: 'Bun',     key: '1', prep: 'ready', grillSeconds: 0, base: '#e8a94f', dark: '#b97a28', light: '#f7cf8a' },
  { id: 'patty',   name: 'Patty',   key: '2', prep: 'grill', grillSeconds: 5, base: '#7a4a2b', dark: '#54301a', light: '#a06a42' },
  { id: 'cheese',  name: 'Cheese',  key: '3', prep: 'ready', grillSeconds: 0, base: '#f2c230', dark: '#d19a12', light: '#ffe27a' },
  { id: 'lettuce', name: 'Lettuce', key: '4', prep: 'ready', grillSeconds: 0, base: '#58b368', dark: '#2f7d3d', light: '#8fd89b' },
  { id: 'tomato',  name: 'Tomato',  key: '5', prep: 'chop',  grillSeconds: 0, base: '#e0492f', dark: '#a92c17', light: '#ff7a5c' },
  { id: 'onion',   name: 'Onion',   key: '6', prep: 'chop',  grillSeconds: 0, base: '#efe3f2', dark: '#b48ec2', light: '#ffffff' },
  { id: 'egg',     name: 'Egg',     key: '7', prep: 'grill', grillSeconds: 4, base: '#f7e3a1', dark: '#d9b45c', light: '#fff6d8' },
  { id: 'bacon',   name: 'Bacon',   key: '8', prep: 'grill', grillSeconds: 4, base: '#c65a3c', dark: '#8f3a22', light: '#e88a68' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// The bistro's menu: six dishes, each a set of ingredients and a base price.
// No dish here belongs to any other game or kitchen.
export const RECIPES = [
  { id: 'copper-burger', name: 'Copper Burger', items: ['bun', 'patty', 'cheese', 'lettuce'], price: 260 },
  { id: 'garden-stack',  name: 'Garden Stack',  items: ['bun', 'lettuce', 'tomato', 'cheese'], price: 220 },
  { id: 'sunrise-plate', name: 'Sunrise Plate', items: ['egg', 'bacon', 'tomato'],             price: 240 },
  { id: 'smoky-melt',    name: 'Smoky Melt',    items: ['bun', 'patty', 'bacon', 'cheese'],    price: 300 },
  { id: 'veggie-tower',  name: 'Veggie Tower',  items: ['bun', 'lettuce', 'tomato', 'onion', 'egg'], price: 280 },
  { id: 'copper-classic', name: 'Copper Classic', items: ['bun', 'patty', 'lettuce', 'tomato', 'onion'], price: 290 },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

// Where things sit on the 1280x800 canvas. The order board owns the left,
// the kitchen owns the middle, the ingredient counter owns the bottom.
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 16, y: 80, w: 280, h: 392 },
  ticket: { w: 248, h: 112, gap: 12 },
  grill: { x: 320, y: 168, w: 300, h: 190 },
  chop: { x: 640, y: 168, w: 260, h: 190 },
  plate: { x: 920, y: 168, w: 344, h: 260 },
  pass: { x: 320, y: 380, w: 300, h: 150 },
  rush: { x: 640, y: 380, w: 260, h: 150 },
  counter: { x: 16, y: 636, w: 1248, h: 148 },
  hint: { x: 16, y: 786, w: 1248, h: 14 },
};
