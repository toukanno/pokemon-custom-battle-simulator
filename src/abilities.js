const ABILITIES = {
  blazeCore: {
    name: 'Blaze Core',
    description: 'Powers up Fire-type moves when HP is below 1/3',
    effect: { type: 'typeBoost', moveType: 'fire', hpThreshold: 0.33, multiplier: 1.5 },
  },
  torrentSoul: {
    name: 'Torrent Soul',
    description: 'Powers up Water-type moves when HP is below 1/3',
    effect: { type: 'typeBoost', moveType: 'water', hpThreshold: 0.33, multiplier: 1.5 },
  },
  overgrowth: {
    name: 'Overgrowth',
    description: 'Powers up Grass-type moves when HP is below 1/3',
    effect: { type: 'typeBoost', moveType: 'grass', hpThreshold: 0.33, multiplier: 1.5 },
  },
  staticAura: {
    name: 'Static Aura',
    description: '30% chance to paralyze attacker on contact',
    effect: { type: 'onContact', status: 'paralysis', chance: 30 },
  },
  intimidate: {
    name: 'Intimidate',
    description: "Lowers the opponent's Attack on entry",
    effect: { type: 'onEntry', stat: 'attack', stages: -1, target: 'opponent' },
  },
  levitate: {
    name: 'Levitate',
    description: 'Immune to Ground-type moves',
    effect: { type: 'typeImmunity', immuneType: 'ground' },
  },
  thickArmor: {
    name: 'Thick Armor',
    description: 'Reduces physical damage taken by 20%',
    effect: { type: 'damageReduction', category: 'physical', multiplier: 0.8 },
  },
  magicGuard: {
    name: 'Magic Guard',
    description: 'Only takes damage from direct attacks',
    effect: { type: 'magicGuard' },
  },
  ironWill: {
    name: 'Iron Will',
    description: 'Cannot be flinched',
    effect: { type: 'flinchImmunity' },
  },
  shadowCloak: {
    name: 'Shadow Cloak',
    description: 'Powers up Ghost-type moves by 20%',
    effect: { type: 'typeBoostFlat', moveType: 'ghost', multiplier: 1.2 },
  },
  frostBody: {
    name: 'Frost Body',
    description: '30% chance to freeze attacker on contact',
    effect: { type: 'onContact', status: 'freeze', chance: 30 },
  },
  regenerate: {
    name: 'Regenerate',
    description: 'Heals 1/3 of max HP on switch out',
    effect: { type: 'onSwitchOut', heal: 0.33 },
  },
  adaptability: {
    name: 'Adaptability',
    description: 'STAB bonus is increased to 2x',
    effect: { type: 'stabBoost', multiplier: 2.0 },
  },
  speedBoost: {
    name: 'Speed Boost',
    description: 'Speed rises by one stage at the end of each turn',
    effect: { type: 'endOfTurn', stat: 'speed', stages: 1 },
  },
  technician: {
    name: 'Technician',
    description: 'Moves with base power 60 or less get a 50% boost',
    effect: { type: 'technicianBoost', threshold: 60, multiplier: 1.5 },
  },
  clearBody: {
    name: 'Clear Body',
    description: 'Prevents stat reductions from opponent',
    effect: { type: 'statDropImmunity' },
  },
  sturdy: {
    name: 'Sturdy',
    description: 'Survives a hit that would KO at full HP with 1 HP',
    effect: { type: 'sturdy' },
  },
  naturalCure: {
    name: 'Natural Cure',
    description: 'Status conditions are healed on switch out',
    effect: { type: 'onSwitchOut', cureStatus: true },
  },
  pressure: {
    name: 'Pressure',
    description: "Opponent's moves use 2 PP instead of 1",
    effect: { type: 'pressure' },
  },
  sandForce: {
    name: 'Sand Force',
    description: 'Rock, Ground, and Steel moves get 30% boost in sandstorm',
    effect: { type: 'weatherBoost', weather: 'sandstorm', types: ['rock', 'ground', 'steel'], multiplier: 1.3 },
  },
  defiant: {
    name: 'Defiant',
    description: 'Attack rises by 2 stages when any stat is lowered',
    effect: { type: 'onStatDrop', stat: 'attack', stages: 2 },
  },
  prankster: {
    name: 'Prankster',
    description: 'Status moves get +1 priority',
    effect: { type: 'priorityBoost', category: 'status', bonus: 1 },
  },
  moldBreaker: {
    name: 'Mold Breaker',
    description: "Ignores the opponent's ability",
    effect: { type: 'moldBreaker' },
  },
  multiscale: {
    name: 'Multiscale',
    description: 'Halves damage taken when at full HP',
    effect: { type: 'fullHpShield', multiplier: 0.5 },
  },
  poisonTouch: {
    name: 'Poison Touch',
    description: '30% chance to poison on contact moves',
    effect: { type: 'onContactAttack', status: 'poison', chance: 30 },
  },
  filter: {
    name: 'Filter',
    description: 'Reduces super effective damage by 25%',
    effect: { type: 'superEffectiveReduction', multiplier: 0.75 },
  },
  galeWings: {
    name: 'Gale Wings',
    description: 'Flying-type moves get +1 priority at full HP',
    effect: { type: 'conditionalPriority', moveType: 'flying', bonus: 1, condition: 'fullHp' },
  },
  sheerForce: {
    name: 'Sheer Force',
    description: 'Removes secondary effects of moves but boosts power by 30%',
    effect: { type: 'sheerForce', multiplier: 1.3 },
  },
  dragonScale: {
    name: 'Dragon Scale',
    description: 'Powers up Dragon-type moves by 20%',
    effect: { type: 'typeBoostFlat', moveType: 'dragon', multiplier: 1.2 },
  },
  pixelateAura: {
    name: 'Pixelate Aura',
    description: 'Normal-type moves become Fairy-type and get a 20% boost',
    effect: { type: 'typeConvert', fromType: 'normal', toType: 'fairy', multiplier: 1.2 },
  },
};

function getAbility(abilityId) {
  return ABILITIES[abilityId] || null;
}

function applyAbilityModifier(ability, context) {
  if (!ability) return context;

  const { effect } = ability;

  if (effect.type === 'typeBoost' && context.moveType === effect.moveType) {
    const hpPercent = context.attackerHp / context.attackerMaxHp;
    if (hpPercent <= effect.hpThreshold) {
      context.powerMultiplier = (context.powerMultiplier || 1) * effect.multiplier;
    }
  }

  if (effect.type === 'typeBoostFlat' && context.moveType === effect.moveType) {
    context.powerMultiplier = (context.powerMultiplier || 1) * effect.multiplier;
  }

  if (effect.type === 'stabBoost' && context.isStab) {
    context.stabMultiplier = effect.multiplier;
  }

  if (effect.type === 'technicianBoost' && context.basePower <= effect.threshold) {
    context.powerMultiplier = (context.powerMultiplier || 1) * effect.multiplier;
  }

  if (effect.type === 'sheerForce' && context.hasSecondaryEffect) {
    context.powerMultiplier = (context.powerMultiplier || 1) * effect.multiplier;
    context.removeSecondaryEffects = true;
  }

  if (effect.type === 'damageReduction' && context.moveCategory === effect.category) {
    context.damageMultiplier = (context.damageMultiplier || 1) * effect.multiplier;
  }

  if (effect.type === 'fullHpShield' && context.defenderHp === context.defenderMaxHp) {
    context.damageMultiplier = (context.damageMultiplier || 1) * effect.multiplier;
  }

  if (effect.type === 'superEffectiveReduction' && context.effectiveness > 1) {
    context.damageMultiplier = (context.damageMultiplier || 1) * effect.multiplier;
  }

  if (effect.type === 'typeImmunity' && context.moveType === effect.immuneType) {
    context.immune = true;
  }

  return context;
}

module.exports = { ABILITIES, getAbility, applyAbilityModifier };
