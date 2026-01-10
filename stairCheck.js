/**
 * =====================================================================
 * CALCULATEUR D'ESCALIER - CNB 2020 (modifié)
 * Version complète et améliorée
 * =====================================================================
 * 
 * Conforme au Code de construction du Québec, Chapitre I – Bâtiment
 * et Code national du bâtiment – Canada 2020 (modifié)
 * 
 * Caractéristiques:
 * - Calculs précis sans arrondi intermédiaire (pour traçage CAD)
 * - Support métrique et impérial avec conversion automatique
 * - Toutes les configurations d'escalier (droit, L, U, hélicoïdal, dansantes)
 * - Règle du pas et validation CNB complète
 */

// =====================================================================
// CONSTANTES ET LIMITES CNB
// =====================================================================

const CNB_LIMITS = {
 // =====================================================================
 // PARTIE 3 - Grands bâtiments (CNB 2020, Section 3.4)
 // =====================================================================
 part3: {
  common: {
  minRiser: 125,  // CNB 3.4.6.8.(2) - min 125 mm
  maxRiser: 180,  // CNB 3.4.6.8.(2) - max 180 mm
  minTread: 280,  // CNB 3.4.6.8.(1) - min 280 mm
  maxTread: 9999,  // CNB 3.4.6.8 - Aucune limite max spécifiée
  minWidth: 1100,  // CNB 3.4.3.2 Tableau - >3 étages
  minWidthUnder3: 900, // CNB 3.4.3.2 Tableau - ≤3 étages
  minHeadroom: 2050, // CNB 3.4.3.4.(1) - min 2050 mm
  minNarrowSide: 150,  // CNB 3.3.1.16.(2)a) - min 150 mm côté étroit
  minNarrowSideTurning: 240, // CNB 3.4.6.9.(2)b) - min 240 mm volées tournantes issue
  maxRise: 3700,  // CNB 3.4.6.3.(1) - max 3,7 m par volée
  maxRiseB2: 2400,  // CNB 3.4.6.3.(1) - max 2,4 m groupe B div.2
  minRisersPerFlight: 3 // CNB 3.4.6.2.(1) - min 3 contremarches par volée
  }
 },
 // =====================================================================
 // PARTIE 9 - Maisons et petits bâtiments (CNB 2020, Section 9.8)
 // =====================================================================
 part9: {
  private: {
  // Escaliers privés: logements individuels, maisons avec logement accessoire
  minRiser: 125,  // CNB 9.8.4.1 Tableau - min 125 mm
  maxRiser: 200,  // CNB 9.8.4.1 Tableau - max 200 mm (privé)
  minTread: 255,  // CNB 9.8.4.2 Tableau - min 255 mm (privé)
  maxTread: 355,  // CNB 9.8.4.2 Tableau - max 355 mm (privé)
  minWidth: 860,  // CNB 9.8.2.1.(2)(4) - min 860 mm
  minHeadroom: 1950, // CNB 9.8.2.2.(3) - min 1950 mm (logement)
  minNarrowSide: 150,  // CNB 9.8.4.3.(1)a) - min 150 mm côté étroit
  maxRise: 3700,  // CNB 9.8.3.3.(1) - max 3,7 m par volée
  minRisersPerFlight: 1 // Pas de minimum pour escaliers privés dans logement
  },
  common: {
  // Escaliers communs: tous les autres escaliers
  minRiser: 125,  // CNB 9.8.4.1 Tableau - min 125 mm
  maxRiser: 180,  // CNB 9.8.4.1 Tableau - max 180 mm (commun)
  minTread: 280,  // CNB 9.8.4.2 Tableau - min 280 mm (commun)
  maxTread: 9999,  // CNB 9.8.4.2 Tableau - "Aucune limite" (commun)
  minWidth: 900,  // CNB 9.8.2.1.(1)(3) - min 900 mm
  minHeadroom: 2050, // CNB 9.8.2.2.(2) - min 2050 mm (général)
  minNarrowSide: 150,  // CNB 9.8.4.3.(1)a) - min 150 mm côté étroit
  maxRise: 3700,  // CNB 9.8.3.3.(1) - max 3,7 m par volée
  minRisersPerFlight: 3 // CNB 9.8.3.2.(1) - min 3 contremarches (sauf logement)
  }
 },
 // =====================================================================
 // ESCALIERS HÉLICOÏDAUX (CNB 2020, Article 9.8.4.7)
 // =====================================================================
 spiral: {
  minWidth: 660,   // CNB 9.8.4.7.(1)b) - min 660 mm entre mains courantes
  minTreadAt300: 190,  // CNB 9.8.4.7.(1)d)i) - min 190 mm à  300 mm de l'axe
  maxRiser: 240,   // CNB 9.8.4.7.(1)c) - max 240 mm
  minHeadroom: 1980,  // CNB 9.8.4.7.(1)e) - min 1980 mm
  maxPersons: 6   // CNB 9.8.4.7.(2) - max 6 personnes si seul moyen d'évacuation
 },
 // =====================================================================
 // MARCHES RAYONNANTES (CNB 2020, Article 9.8.4.6)
 // =====================================================================
 radiating: {
  allowedAngles: [30, 45], // CNB 9.8.4.6.(1) - angles permis (sans écart)
  maxRotation: 90   // CNB 9.8.4.6.(2) - max 90° par série
 },
 // =====================================================================
 // TOLÉRANCES (CNB 2020, Article 9.8.4.4)
 // =====================================================================
 tolerances: {
  riserSuccessive: 5,  // CNB 9.8.4.4.(1)a) - 5 mm entre marches successives
  riserInFlight: 10,  // CNB 9.8.4.4.(1)b) - 10 mm max dans la volée
  treadSuccessive: 5,  // CNB 9.8.4.4.(3)a) - 5 mm entre marches successives
  treadInFlight: 10,  // CNB 9.8.4.4.(3)b) - 10 mm max dans la volée
  stepSlope: 50   // CNB 9.8.4.4.(5) - inclinaison max 1:50
 }
};

// =====================================================================
// FONCTIONS DE CONVERSION MÉTRIQUES/IMPÉRIALES
// =====================================================================

/**
 * Nettoie et normalise une entrée impériale
 */
function validateImperialInput(inputValue) {
 if (!inputValue) return '';
 inputValue = inputValue.replace(/[''']/g, "'");
 inputValue = inputValue.replace(/[""]/g, '"');
 inputValue = inputValue.replace(/\s*(['-/"])\s*/g, '$1');
 inputValue = inputValue.replace(/'-/g, "'");
 inputValue = inputValue.replace(/(\d)(\d+\/\d+)/g, '$1 $2');
 return inputValue.trim();
}

/**
 * Convertit millimètres en format impérial (pieds-pouces-fractions)
 * Arrondi au 1/16" pour affichage pratique
 */
function metricToImperial(mmValue) {
 if (!mmValue || isNaN(mmValue)) return '';
 
 const totalInches = mmValue / 25.4;
 let feet = Math.floor(totalInches / 12);
 const remainingInches = totalInches % 12;
 
 // Arrondir au 1/16" le plus proche
 const sixteenths = Math.round(remainingInches * 16);
 let wholeInches = Math.floor(sixteenths / 16);
 let fractionalSixteenths = sixteenths % 16;
 
 // Gérer le cas où wholeInches >= 12 (par exemple, 3' 12" devient 4'-0")
 if (wholeInches >= 12) {
  feet += Math.floor(wholeInches / 12);
  wholeInches = wholeInches % 12;
 }
 
 let result = '';
 
 // Pieds
 if (feet > 0) {
  result += feet + "'";
  if (wholeInches > 0 || fractionalSixteenths === 0) {
  result += '-';
  }
 }
 
 // Pouces entiers
 if (wholeInches > 0 || (feet > 0 && fractionalSixteenths === 0)) {
  result += wholeInches;
 }
 
 // Fraction
 if (fractionalSixteenths > 0) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(fractionalSixteenths, 16);
  const num = fractionalSixteenths / divisor;
  const den = 16 / divisor;
  
  if (wholeInches > 0) result += ' ';
  result += num + '/' + den;
 }
 
 // Symbole de pouce
 if (feet > 0 || wholeInches > 0 || fractionalSixteenths > 0) {
  result += '"';
 }
 
 return result || '0"';
}

/**
 * Convertit millimètres en format impérial haute précision (1/64")
 * Pour traçage CAD - inclut la valeur décimale exacte
 */
function metricToImperialPrecise(mmValue) {
 if (!mmValue || isNaN(mmValue)) return '';
 
 const totalInches = mmValue / 25.4;
 const wholeInches = Math.floor(totalInches);
 const fractionalPart = totalInches - wholeInches;
 
 // Convertir en 64èmes pour précision maximale
 const sixtyFourths = Math.round(fractionalPart * 64);
 
 if (sixtyFourths === 0) {
  return `${wholeInches}" (${totalInches.toFixed(6)}")`;
 }
 
 if (sixtyFourths === 64) {
  return `${wholeInches + 1}" (${totalInches.toFixed(6)}")`;
 }
 
 // Simplifier la fraction
 const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
 const divisor = gcd(sixtyFourths, 64);
 const num = sixtyFourths / divisor;
 const den = 64 / divisor;
 
 if (wholeInches > 0) {
  return `${wholeInches} ${num}/${den}" (${totalInches.toFixed(6)}")`;
 }
 return `${num}/${den}" (${totalInches.toFixed(6)}")`;
}

/**
 * Convertit une valeur impériale en millimètres
 * Supporte tous les formats courants
 * IMPORTANT: L'ordre des regex est critique - les formats simples (pouces seuls) 
 * doivent être testés APRàˆS les formats avec apostrophe obligatoire
 */
/**
 * Convertit une valeur impériale en millimètres
 * Accepte de nombreux formats sans nettoyage préalable requis
 */
function imperialToMetric(imperialValue) {
 if (!imperialValue) return null;
 
 let input = imperialValue.toString().trim();
 // Normaliser les apostrophes et guillemets
 input = input.replace(/[''']/g, "'").replace(/[""]/g, '"');
 
 let match;
 
 // Format: X' Y Z/W" (ex: 10' 2 1/2", 10'2 1/2")
 match = input.match(/^(\d+(?:\.\d+)?)'[\s-]*(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)(?:"|in)?$/);
 if (match) {
  return (parseFloat(match[1]) * 12 + parseFloat(match[2]) + parseFloat(match[3]) / parseFloat(match[4])) * 25.4;
 }
 
 // Format: X' Y" (ex: 10' 2", 10'2", 10'-2")
 match = input.match(/^(\d+(?:\.\d+)?)'[\s-]*(\d+(?:\.\d+)?)(?:"|in)?$/);
 if (match) {
  return (parseFloat(match[1]) * 12 + parseFloat(match[2])) * 25.4;
 }
 
 // Format: X' Z/W" (ex: 3' 1/2", 3'1/2")
 match = input.match(/^(\d+(?:\.\d+)?)'[\s-]*(\d+)\/(\d+)(?:"|in)?$/);
 if (match) {
  return (parseFloat(match[1]) * 12 + parseFloat(match[2]) / parseFloat(match[3])) * 25.4;
 }
 
 // Format: X' (ex: 10', 10 ft)
 match = input.match(/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet)$/);
 if (match) {
  return parseFloat(match[1]) * 12 * 25.4;
 }
 
 // Format: Y Z/W" (ex: 7 1/4", 7-1/4")
 match = input.match(/^(\d+(?:\.\d+)?)[\s-]+(\d+)\/(\d+)(?:"|in)?$/);
 if (match) {
  return (parseFloat(match[1]) + parseFloat(match[2]) / parseFloat(match[3])) * 25.4;
 }
 
 // Format: Z/W" (ex: 1/2")
 match = input.match(/^(\d+)\/(\d+)(?:"|in)?$/);
 if (match) {
  return (parseFloat(match[1]) / parseFloat(match[2])) * 25.4;
 }
 
 // Format: Y" ou Y (ex: 108", 108, 36in)
 match = input.match(/^(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)?$/);
 if (match) {
  return parseFloat(match[1]) * 25.4;
 }
 
 return null;
}

/**
 * Formate une valeur selon le système de mesure choisi
 */
function formatValue(mmValue, isMetric, precision = 2) {
 if (isMetric) {
  return `${mmValue.toFixed(precision)} mm`;
 }
 return metricToImperial(mmValue);
}

/**
 * Formate une valeur avec haute précision pour le traçage
 */
function formatValuePrecise(mmValue, isMetric) {
 if (isMetric) {
  return `${mmValue.toFixed(4)} mm`;
 }
 return metricToImperialPrecise(mmValue);
}

/**
 * Formate une valeur pour affichage sur les plans (1 décimale seulement)
 * Garde la précision minimale pour ne pas encombrer les plans
 */
function formatValueForPlan(mmValue, isMetric) {
 if (isMetric) {
  // 1 décimale pour le métrique sur les plans
  const rounded = Math.round(mmValue * 10) / 10;
  // Si le nombre est entier, ne pas afficher de décimale
  if (rounded === Math.floor(rounded)) {
  return `${Math.floor(rounded)} mm`;
  }
  return `${rounded.toFixed(1)} mm`;
 }
 // Pour l'impérial, utiliser la conversion standard avec 1 décimale max
 const inches = mmValue / 25.4;
 const feet = Math.floor(inches / 12);
 const remainingInches = inches % 12;
 
 // Arrondir à  1 décimale
 const roundedInches = Math.round(remainingInches * 10) / 10;
 
 if (feet > 0) {
  if (roundedInches === Math.floor(roundedInches)) {
  return `${feet}'-${Math.floor(roundedInches)}"`;
  }
  return `${feet}'-${roundedInches.toFixed(1)}"`;
 } else {
  if (roundedInches === Math.floor(roundedInches)) {
  return `${Math.floor(roundedInches)}"`;
  }
  return `${roundedInches.toFixed(1)}"`;
 }
}

// =====================================================================
// RàˆGLE DU PAS ET VALIDATION
// =====================================================================

/**
 * Vérifie la règle du pas (3 formules traditionnelles)
 * Valeurs en mm, calculs en pouces
 */
function checkStepRule(riserMm, treadMm) {
 const riserIn = riserMm / 25.4;
 const treadIn = treadMm / 25.4;
 
 // Règle 1: G + H = 17" à  18" (432-457 mm)
 const rule1Value = treadIn + riserIn;
 const rule1Valid = rule1Value >= 17 && rule1Value <= 18;
 
 // Règle 2: G × H = 71 à  74 po² (458-477 cm²)
 const rule2Value = treadIn * riserIn;
 const rule2Valid = rule2Value >= 71 && rule2Value <= 74;
 
 // Règle 3: G + 2H = 22" à  25" (559-635 mm)
 const rule3Value = treadIn + (2 * riserIn);
 const rule3Valid = rule3Value >= 22 && rule3Value <= 25;
 
 const validCount = [rule1Valid, rule2Valid, rule3Valid].filter(Boolean).length;
 const validCountLabel = `${validCount} sur 3`;
 
 return {
  isValid: validCount >= 2,
  validCount,
  validCountLabel,
  rule1: { value: rule1Value, isValid: rule1Valid, range: '17"-18"' },
  rule2: { value: rule2Value, isValid: rule2Valid, range: '71-74 po²' },
  rule3: { value: rule3Value, isValid: rule3Valid, range: '22"-25"' }
 };
}

/**
 * Obtient les limites CNB selon le type de bâtiment et d'escalier
 */
function getCNBLimits(buildingType, stairType) {
 if (buildingType === 'part3') {
  return CNB_LIMITS.part3.common;
 }
 return CNB_LIMITS.part9[stairType] || CNB_LIMITS.part9.common;
}

// =====================================================================
// CALCULS D'ESCALIERS
// =====================================================================

/**
 * Calcule les dimensions optimales pour une volée droite ou tournante simple
 */

/**
 * Vérifie si la hauteur de volée respecte les limites du CNB
 * CNB 9.8.3.3 et 3.4.6.3: Max 3,7 m (3700 mm)
 * CNB 3.4.6.3: Max 2,4 m (2400 mm) pour groupe B div. 2 (soins de santé)
 * 
 * @param {number} flightHeight - Hauteur de la volée en mm
 * @param {string} buildingType - 'part3' ou 'part9'
 * @param {string} usageGroup - 'general' ou 'b_div2' (seulement pour Partie 3)
 * @returns {object} - { isValid, flightHeight, maxHeight, message }
 */
function checkFlightHeightLimits(flightHeight, buildingType, usageGroup = 'general') {
 // Limite par défaut: 3700 mm (3,7 m) - CNB 9.8.3.3 et 3.4.6.3
 let maxHeight = 3700;
 let codeRef = 'CNB 9.8.3.3';
 
 // Partie 3 avec groupe B, division 2 (soins de santé): limite de 2400 mm
 if (buildingType === 'part3') {
  codeRef = 'CNB 3.4.6.3';
  if (usageGroup === 'b_div2') {
  maxHeight = 2400; // mm (2,4 m) pour établissements de soins
  }
 }
 
 if (flightHeight > maxHeight) {
  return {
  isValid: false,
  flightHeight: flightHeight,
  maxHeight: maxHeight,
  message: `La hauteur de volée (${(flightHeight/1000).toFixed(2)} m) dépasse la limite de ${(maxHeight/1000).toFixed(1)} m (${codeRef})`
  };
 }
 
 return {
  isValid: true,
  flightHeight: flightHeight,
  maxHeight: maxHeight
 };
}

function calculateStraightStair(params) {
 const {
  totalRise,
  totalRun,
  buildingType,
  stairType,
  stairConfig,
  usageGroup,
  idealRiser,
  idealTread,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 
 // Déterminer le nombre de marches rayonnantes selon la config
 let numRadiatingSteps = 0;
 let radiatingFactor = 0.7; // Facteur d'occupation en plan des marches rayonnantes
 
 switch (stairConfig) {
  case 'turning_30': numRadiatingSteps = 1; break;
  case 'turning_45': numRadiatingSteps = 1; break;
  case 'turning_60': numRadiatingSteps = 2; break;
 }
 
 // Longueur disponible pour les girons rectangulaires
 const availableForTreads = totalRun;
 
 // Calcul du nombre de contremarches possibles
 const minRisers = Math.ceil(totalRise / limits.maxRiser);
 const maxRisers = Math.floor(totalRise / limits.minRiser);
 
 const solutions = [];
 const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
 
 for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  // Vérifier le nombre minimum de contremarches par volée (CNB 9.8.3.2 / 3.4.6.2)
  const minRisersRequired = limits.minRisersPerFlight || 1;
  if (numRisers < minRisersRequired) continue;
  
  // Hauteur exacte de chaque contremarche (sans arrondi)
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;

  // Vérifier la hauteur maximale de volée (CNB 9.8.3.3 / 3.4.6.3)
  const flightHeight = riserHeight * numRisers;
  const flightCheck = checkFlightHeightLimits(flightHeight, buildingType, usageGroup);
  if (!flightCheck.isValid) continue;
  
  const numTreads = numRisers - 1;
  const numRectTreads = numTreads - numRadiatingSteps;
  
  if (numRectTreads < 1) continue;
  
  // Calcul du giron selon la configuration
  let treadDepth;
  if (numRadiatingSteps > 0) {
  // Les marches rayonnantes occupent moins d'espace en plan
  const effectiveTreads = numRectTreads + (numRadiatingSteps * radiatingFactor);
  treadDepth = availableForTreads / effectiveTreads;
  } else {
  treadDepth = availableForTreads / numRectTreads;
  }
  
  if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
  
  // Évaluer la qualité de la solution
  const stepRule = checkStepRule(riserHeight, treadDepth);
  const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
  
  // Score de qualité (plus bas = meilleur)
  let score = 0;
  const stepDeviation = Math.abs(stepValue - optimalStepValue);
  
  if (priority === 'comfort') {
  score = stepDeviation * 2;
  if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
  if (idealTread > 0) score += Math.abs(treadDepth - idealTread) / 10;
  if (stepRule.isValid) score *= 0.7;
  } else {
  // Économie d'espace: préférer plus de contremarches (escalier plus raide)
  score = -numRisers + stepDeviation;
  if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 20;
  }
  
  // Calculer la longueur réelle occupée
  let actualTotalRun = treadDepth * numRectTreads;
  if (numRadiatingSteps > 0) {
  actualTotalRun += treadDepth * numRadiatingSteps * radiatingFactor;
  }
  
  solutions.push({
  numRisers,
  numTreads,
  numRectTreads,
  numRadiatingSteps,
  riserHeight,
  treadDepth,
  stepValue,
  stepRule,
  score,
  actualTotalRun,
  totalRiseCalc: riserHeight * numRisers,
  totalRunCalc: actualTotalRun
  });
 }
 
 // Trier par score et retourner les 3 meilleures solutions
 solutions.sort((a, b) => a.score - b.score);
 return solutions.slice(0, 3);
}

/**
 * Calcule les dimensions pour un escalier en L avec palier
 * Vérifie la hauteur de chaque volée séparément (CNB 9.8.3.3 / 3.4.6.3)
 */
function calculateLShapedWithLanding(params) {
 const {
  totalRise,
  firstFlightRun,
  secondFlightRun,
  landingDepth,
  buildingType,
  stairType,
  usageGroup,
  idealRiser,
  idealTread,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 
 // Le palier compte comme 2 girons (profondeur + largeur = carré)
 // Espace disponible pour les vrais girons:
 // firstFlightRun = girons volée 1 + profondeur palier
 // secondFlightRun = largeur palier + girons volée 2
 const availableForTreads = (firstFlightRun + secondFlightRun) - (landingDepth * 2);
 
 if (availableForTreads <= 0) {
  return [];
 }
 
 const minRisers = Math.ceil(totalRise / limits.maxRiser);
 const maxRisers = Math.floor(totalRise / limits.minRiser);
 
 const solutions = [];
 const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
 
 for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
  
  // Nombre de girons = nombre de contremarches - 2 (car palier remplace un giron mais pas une contremarche)
  // Pour escalier avec palier: CM = girons + 2 (une CM supplémentaire par volée pour atteindre le palier et le plancher)
  const numTreads = numRisers - 2;
  
  if (numTreads < 2) continue; // Au moins 1 giron par volée
  
  // Distribution des girons entre les volées (basée sur les longueurs disponibles)
  const flight1Available = firstFlightRun - landingDepth;
  const flight2Available = secondFlightRun - landingDepth;
  const totalAvailable = flight1Available + flight2Available;
  
  const treadsInFlight1 = Math.max(1, Math.round(numTreads * (flight1Available / totalAvailable)));
  const treadsInFlight2 = Math.max(1, numTreads - treadsInFlight1);
  
  // Calculer la hauteur de chaque volée
  // Volée 1: treadsInFlight1 girons + 1 contremarche pour monter au palier
  // Volée 2: treadsInFlight2 girons + 1 contremarche pour atteindre le plancher d'étage
  const risersInFlight1 = treadsInFlight1 + 1;
  const risersInFlight2 = treadsInFlight2 + 1;
  
  // Vérifier le nombre minimum de contremarches par volée (CNB 9.8.3.2 / 3.4.6.2)
  const minRisersRequired = limits.minRisersPerFlight || 1;
  if (risersInFlight1 < minRisersRequired || risersInFlight2 < minRisersRequired) continue;
  
  const flight1Height = risersInFlight1 * riserHeight;
  const flight2Height = risersInFlight2 * riserHeight;
  
  // Vérifier la hauteur de chaque volée séparément (CNB 9.8.3.3 / 3.4.6.3)
  const flight1Check = checkFlightHeightLimits(flight1Height, buildingType, usageGroup);
  const flight2Check = checkFlightHeightLimits(flight2Height, buildingType, usageGroup);
  
  if (!flight1Check.isValid || !flight2Check.isValid) continue;
  
  // Profondeur de chaque giron
  const treadDepth = availableForTreads / numTreads;
  
  if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
  
  // Vérifier que le palier a la profondeur minimale
  if (landingDepth < limits.minTread) continue;
  
  const stepRule = checkStepRule(riserHeight, treadDepth);
  const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
  
  let score = 0;
  const stepDeviation = Math.abs(stepValue - optimalStepValue);
  
  if (priority === 'comfort') {
  score = stepDeviation * 2;
  if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
  if (idealTread > 0) score += Math.abs(treadDepth - idealTread) / 10;
  if (stepRule.isValid) score *= 0.7;
  } else {
  score = -numRisers + stepDeviation;
  }
  
  solutions.push({
  numRisers,
  numTreads,
  treadsInFlight1,
  treadsInFlight2,
  risersInFlight1,
  risersInFlight2,
  flight1Height,
  flight2Height,
  riserHeight,
  treadDepth,
  landingDepth,
  stepValue,
  stepRule,
  score,
  firstFlightRun,
  secondFlightRun,
  availableForTreads,
  totalRiseCalc: riserHeight * numRisers,
  totalRunCalc: (treadDepth * numTreads) + (landingDepth * 2),
  useLandingConfiguration: true
  });
 }
 
 solutions.sort((a, b) => a.score - b.score);
 return solutions.slice(0, 3);
}

/**
 * Calcule les dimensions pour un escalier en L avec marches rayonnantes
 * Les marches rayonnantes peuvent être:
 * - À l'intersection des deux volées (cas standard)
 * - À l'extrémité de la volée (quand firstFlightRun ou secondFlightRun = stairWidth)
 */
function calculateLShapedWithRadiating(params) {
 const {
  totalRise,
  firstFlightRun,
  secondFlightRun,
  stairWidth,
  buildingType,
  stairType,
  usageGroup,
  lShapedConfig,
  idealRiser,
  idealTread,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 
 let numRadiatingSteps;
 switch (lShapedConfig) {
  case 'two_45deg': numRadiatingSteps = 2; break;
  case 'three_30deg': numRadiatingSteps = 3; break;
  default: numRadiatingSteps = 0;
 }
 
 // Facteur d'occupation des marches rayonnantes (environ 70% d'un giron normal)
 const radiatingFactor = 0.7;
 
 // Détecter si les marches rayonnantes sont à  l'extrémité
 // (quand l'une des dimensions est égale à  la largeur de l'escalier)
 const tolerance = stairWidth * 0.05; // 5% de tolérance
 const radiatingAtEnd = Math.abs(secondFlightRun - stairWidth) < tolerance;
 const radiatingAtStart = Math.abs(firstFlightRun - stairWidth) < tolerance;
 
 const solutions = [];
 const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
 
 if (radiatingAtEnd || radiatingAtStart) {
  // CAS SPÉCIAL: Marches rayonnantes à  l'extrémité
  // Tous les girons rectangulaires sont dans une seule direction
  
  const mainFlightRun = radiatingAtEnd ? firstFlightRun : secondFlightRun;
  const radiatingSpace = numRadiatingSteps * radiatingFactor;
  
  const minRisers = Math.ceil(totalRise / limits.maxRiser);
  const maxRisers = Math.floor(totalRise / limits.minRiser);
  
  for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
  
  // Vérifier la hauteur maximale de volée
  const flightHeight = riserHeight * numRisers;
  const flightCheck = checkFlightHeightLimits(flightHeight, buildingType, usageGroup);
  if (!flightCheck.isValid) continue;
  
  const numTreads = numRisers - 1;
  const numRectTreads = numTreads - numRadiatingSteps;
  
  if (numRectTreads < 1) continue;
  
  // Le giron est calculé uniquement sur la partie principale
  // L'espace des marches rayonnantes est la largeur de l'escalier
  const treadDepth = mainFlightRun / numRectTreads;
  
  if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
  
  const stepRule = checkStepRule(riserHeight, treadDepth);
  const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
  
  let score = Math.abs(stepValue - optimalStepValue) * 2;
  if (priority === 'comfort') {
   if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
   if (idealTread > 0) score += Math.abs(treadDepth - idealTread) / 10;
   if (stepRule.isValid) score *= 0.7;
  } else {
   score = -numRisers + Math.abs(stepValue - optimalStepValue);
  }
  
  solutions.push({
   numRisers,
   numTreads,
   numRectTreads,
   numRadiatingSteps,
   riserHeight,
   treadDepth,
   stepValue,
   stepRule,
   score,
   actualTotalRun: mainFlightRun + stairWidth,
   firstFlightRun,
   secondFlightRun,
   firstFlightRectTreads: radiatingAtEnd ? numRectTreads : 0,
   secondFlightRectTreads: radiatingAtStart ? numRectTreads : 0,
   treadDepth1: treadDepth,
   treadDepth2: treadDepth,
   totalRiseCalc: riserHeight * numRisers,
   radiatingAtEnd: radiatingAtEnd,
   radiatingAtStart: radiatingAtStart
  });
  }
 } else {
  // CAS STANDARD: Marches rayonnantes à  l'intersection
  const totalRun = firstFlightRun + secondFlightRun;
  const radiatingSpace = numRadiatingSteps * radiatingFactor;
  
  const minRisers = Math.ceil(totalRise / limits.maxRiser);
  const maxRisers = Math.floor(totalRise / limits.minRiser);
  
  for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;

  // Vérifier la hauteur maximale de volée
  const flightHeight = riserHeight * numRisers;
  const flightCheck = checkFlightHeightLimits(flightHeight, buildingType, usageGroup);
  if (!flightCheck.isValid) continue;
  
  const numTreads = numRisers - 1;
  const numRectTreads = numTreads - numRadiatingSteps;
  
  if (numRectTreads < 2) continue;
  
  const firstFlightRectTreads = Math.round(
   (firstFlightRun * numRectTreads + radiatingSpace * (firstFlightRun - secondFlightRun)) / totalRun
  );
  const secondFlightRectTreads = numRectTreads - firstFlightRectTreads;
  
  if (firstFlightRectTreads < 1 || secondFlightRectTreads < 1) continue;
  
  const treadDepth1 = firstFlightRun / (firstFlightRectTreads + radiatingSpace);
  const treadDepth2 = secondFlightRun / (secondFlightRectTreads + radiatingSpace);
  
  const treadDepth = (treadDepth1 + treadDepth2) / 2;
  
  const treadVariation = Math.abs(treadDepth1 - treadDepth2);
  if (treadVariation > 25) continue;
  
  if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
  
  const stepRule = checkStepRule(riserHeight, treadDepth);
  const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
  
  let score = Math.abs(stepValue - optimalStepValue) * 2;
  if (priority === 'comfort') {
   if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
   if (idealTread > 0) score += Math.abs(treadDepth - idealTread) / 10;
   if (stepRule.isValid) score *= 0.7;
  } else {
   score = -numRisers + Math.abs(stepValue - optimalStepValue);
  }
  
  solutions.push({
   numRisers,
   numTreads,
   numRectTreads,
   numRadiatingSteps,
   riserHeight,
   treadDepth,
   stepValue,
   stepRule,
   score,
   actualTotalRun: totalRun,
   firstFlightRun,
   secondFlightRun,
   firstFlightRectTreads,
   secondFlightRectTreads,
   treadDepth1,
   treadDepth2,
   totalRiseCalc: riserHeight * numRisers,
   radiatingAtEnd: false,
   radiatingAtStart: false
  });
  }
 }
 
 solutions.sort((a, b) => a.score - b.score);
 return solutions.slice(0, 3);
}

/**
 * Calcule les dimensions pour un escalier en U
 */
function calculateUShapedStair(params) {
 const {
  totalRise,
  flight1Run,
  flight2Run,
  flight3Run = 0,
  stairWidth,
  landingLength,
  landingDepth,
  buildingType,
  stairType,
  usageGroup,
  uShapedConfig,
  radiatingAngle = 45,
  idealRiser,
  idealTread,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 
 let availableForTreads;
 let numLandings = 1;
 
 // Utiliser landingDepth si fourni, sinon landingLength, sinon stairWidth
 const effectiveLandingDepth = landingDepth || landingLength || stairWidth;
 
 switch (uShapedConfig) {
  case 'two_landings':
  case 'rect_landing_rect':
   // Configuration avec palier uniquement (pas de rayonnantes)
   // 1ère partie = girons + profondeur zone virage (= effectiveLandingDepth)
   // 2ème partie = largeur totale: 2×stairWidth + palier (si espace)
   // 3ème partie = girons + profondeur zone virage
   numLandings = 1;
   availableForTreads = (flight1Run - effectiveLandingDepth) + ((flight3Run || flight1Run) - effectiveLandingDepth);
   break;
  case 'rect_landing_radiating_rect':
   // Palier au début, rayonnantes à  la fin
   // 1ère partie = girons + zone palier (effectiveLandingDepth)
   // 3ème partie = girons + zone rayonnante (stairWidth)
   numLandings = 1;
   availableForTreads = (flight1Run - effectiveLandingDepth) + ((flight3Run || flight1Run) - stairWidth);
   break;
  case 'rect_radiating_landing_rect':
   // Rayonnantes au début, palier à  la fin
   // 1ère partie = girons + zone rayonnante (stairWidth)
   // 3ème partie = girons + zone palier (effectiveLandingDepth)
   numLandings = 1;
   availableForTreads = (flight1Run - stairWidth) + ((flight3Run || flight1Run) - effectiveLandingDepth);
   break;
  case 'rect_radiating_landing_radiating_rect':
   // Rayonnantes des deux côtés avec palier au milieu
   // 1ère partie = girons + zone rayonnante (stairWidth)
   // 3ème partie = girons + zone rayonnante (stairWidth)
   // Le palier est DANS la 2ème partie (segment horizontal)
   numLandings = 1;
   availableForTreads = (flight1Run - stairWidth) + ((flight3Run || flight1Run) - stairWidth);
   break;
  default:
   availableForTreads = (flight1Run - effectiveLandingDepth) + ((flight3Run || flight1Run) - effectiveLandingDepth);
 }
 
 // === VALIDATION DE FLIGHT2RUN (segment horizontal du U) ===
 // Vérifier que flight2Run est suffisant pour contenir les éléments requis
 let minRequiredWidth = 2 * stairWidth; // Minimum: 2 × largeur escalier (volées côte à  côte)
 let flight2RunError = null;
 
 if (uShapedConfig === 'rect_landing_rect' || uShapedConfig === 'two_landings') {
  // Palier seul: largeur min = 2 × stairWidth
  minRequiredWidth = 2 * stairWidth;
 } else if (uShapedConfig === 'rect_landing_radiating_rect' || uShapedConfig === 'rect_radiating_landing_rect') {
  // 1 coin rayonnant + palier: largeur min = 2 × stairWidth (coin = stairWidth, palier se partage l'espace)
  minRequiredWidth = 2 * stairWidth;
 } else if (uShapedConfig === 'rect_radiating_landing_radiating_rect') {
  // 2 coins rayonnants + palier: largeur min = 2 × stairWidth + landingLength (profondeur palier minimum)
  minRequiredWidth = (2 * stairWidth) + landingLength;
 }
 
 // Vérifier si flight2Run (2ème partie) est fourni et suffisant
 if (flight2Run && flight2Run < minRequiredWidth) {
  flight2RunError = {
   message: `La longueur de la 2ème partie (${Math.round(flight2Run)} mm) est insuffisante. Minimum requis: ${Math.round(minRequiredWidth)} mm pour cette configuration.`,
   minRequired: minRequiredWidth,
   provided: flight2Run
  };
 }

 // Déterminer le nombre de marches rayonnantes selon la configuration
 let totalRadiatingSteps = 0;
 let numRadiatingSeries = 0; // Nombre de séries de marches rayonnantes (max 90° par série selon CNB 9.8.4.6)
 
 // Configurations avec UNE série de marches rayonnantes (90°)
 if (uShapedConfig === 'rect_landing_radiating_rect' || uShapedConfig === 'rect_radiating_landing_rect') {
  numRadiatingSeries = 1;
  // 1 série de 90°: 2 marches (45°) ou 3 marches (30°)
  totalRadiatingSteps = radiatingAngle === 30 ? 3 : 2;
 }
 // Configuration avec DEUX séries de marches rayonnantes (2 × 90°)
 else if (uShapedConfig === 'rect_radiating_landing_radiating_rect') {
  numRadiatingSeries = 2;
  // 2 séries de 90°: 4 marches (45°) ou 6 marches (30°)
  totalRadiatingSteps = radiatingAngle === 30 ? 6 : 4;
 }
 
 const minRisers = Math.ceil(totalRise / limits.maxRiser);
 const maxRisers = Math.floor(totalRise / limits.minRiser);
 
 const solutions = [];
 const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
 
 for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
  
  // Vérifier la hauteur maximale de volée (chaque volée séparément pour escalier en U)
  // Approximation: répartition égale des contremarches entre les volées
  const risersPerFlight = Math.ceil(numRisers / (numLandings + 1));
  const flightHeight = risersPerFlight * riserHeight;
  const flightCheck = checkFlightHeightLimits(flightHeight, buildingType, usageGroup);
  if (!flightCheck.isValid) continue;
  
  // Pour escalier en U avec palier: CM = girons + 2
  // Car chaque volée a 1 contremarche de plus que de girons
  const numTreads = numRisers - 2;
  if (numTreads < 3) continue;
  
  // Pour les configurations avec marches rayonnantes:
  // Les marches rayonnantes occupent la zone de virage, pas la longueur horizontale
  // Donc le giron est calculé sur les girons RECTANGULAIRES seulement
  const numRectTreads = numTreads - totalRadiatingSteps;
  if (numRectTreads < 1) continue;
  
  const treadDepth = availableForTreads / numRectTreads;
  
  if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
  
  const stepRule = checkStepRule(riserHeight, treadDepth);
  const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
  
  let score = Math.abs(stepValue - optimalStepValue) * 2;
  if (priority === 'comfort' && stepRule.isValid) score *= 0.7;
  
  solutions.push({
  numRisers,
  numTreads,
  numRectTreads,
  totalRadiatingSteps,
  numRadiatingSeries,
  riserHeight,
  treadDepth,
  stepValue,
  stepRule,
  score,
  numLandings,
  landingLength,
  flight1Run,
  flight2Run,
  flight3Run,
  uShapedConfig,
  radiatingAngle,
  totalRiseCalc: riserHeight * numRisers
  });
 }
 
 solutions.sort((a, b) => a.score - b.score);
 
 // Retourner l'erreur flight2Run si présente
 if (flight2RunError) {
  return {
   error: true,
   flight2RunError: flight2RunError,
   solutions: solutions.slice(0, 3)
  };
 }
 
 return solutions.slice(0, 3);
}

/**
 * Calcule les dimensions pour un escalier avec marches dansantes
 * Configuration flexible: 1 virage (type L) ou 2 virages (type U)
 * CNB 9.8.4.3: Giron min 150mm extrémité étroite, giron conforme tableau 9.8.4.2 à 300mm axe MC
 */
function calculateDancingSteps(params) {
 const {
  totalRise,
  firstFlightRun,
  secondFlightRun,
  thirdFlightRun,
  stairWidth,
  innerRadius,
  dancingAngle,
  dancingNumSteps,
  dancingConfig,
  buildingType,
  stairType,
  idealRiser,
  idealTread,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 
 // Configuration: 1 virage (type L) ou 2 virages (type U)
 const isUConfig = dancingConfig === 'u_dancing';
 const numTurnZones = isUConfig ? 2 : 1;
 const totalDancingSteps = dancingNumSteps * numTurnZones;
 
 // Calcul géométrique pour les marches dansantes
 const measurementRadius = innerRadius + 300;
 const anglePerStep = dancingAngle / dancingNumSteps;
 const anglePerStepRad = (anglePerStep * Math.PI) / 180;
 
 // Girons calculés
 const treadAt300 = measurementRadius * anglePerStepRad;
 const treadAtNarrow = innerRadius * anglePerStepRad;
 
 // Espace pour marches rectangulaires
 const turnZoneSpace = stairWidth;
 let totalRectRun;
 if (isUConfig) {
  totalRectRun = firstFlightRun + secondFlightRun + thirdFlightRun - (turnZoneSpace * 2);
 } else {
  totalRectRun = firstFlightRun + secondFlightRun - turnZoneSpace;
 }
 
 // ===== ANALYSE COMPLÈTE DES CONTRAINTES =====
 const analysis = {
  // Contrainte 1: Giron extrémité étroite ≥ 150mm (CNB 9.8.4.3.1a)
  narrowTreadOk: treadAtNarrow >= 150,
  narrowTreadValue: treadAtNarrow,
  narrowTreadMin: 150,
  
  // Contrainte 2: Giron à 300mm ≥ min CNB (CNB 9.8.4.3.1b)
  tread300Ok: treadAt300 >= limits.minTread,
  tread300Value: treadAt300,
  tread300Min: limits.minTread,
  tread300Max: limits.maxTread,
  
  // Contrainte 3: Espace disponible pour marches rectangulaires
  rectSpaceOk: totalRectRun > 0,
  rectSpace: totalRectRun,
  
  // Paramètres calculés
  measurementRadius: measurementRadius,
  anglePerStep: anglePerStep
 };
 
 // ===== CALCUL DES PARAMÈTRES SUGGÉRÉS =====
 // Calcul inverse: quel rayon pour obtenir un giron de 150mm à l'extrémité étroite?
 const minRadiusFor150 = Math.ceil(150 / anglePerStepRad);
 
 // Calcul inverse: quel rayon pour obtenir le giron minimum CNB à 300mm?
 const minRadiusForCNBTread = Math.ceil((limits.minTread / anglePerStepRad) - 300);
 
 // Le rayon minimum requis est le plus grand des deux
 const suggestedMinRadius = Math.max(minRadiusFor150, Math.max(0, minRadiusForCNBTread));
 
 // Calcul: avec le rayon actuel, quel nombre de marches fonctionnerait?
 let suggestedNumSteps = dancingNumSteps;
 for (let n = 2; n <= 6; n++) {
  const testAngleRad = (dancingAngle / n) * Math.PI / 180;
  const testNarrow = innerRadius * testAngleRad;
  const testAt300 = (innerRadius + 300) * testAngleRad;
  if (testNarrow >= 150 && testAt300 >= limits.minTread) {
   suggestedNumSteps = n;
   break;
  }
 }
 
 // ===== GÉNÉRATION DU DIAGNOSTIC SI CONTRAINTES NON RESPECTÉES =====
 const criticalIssues = [];
 const suggestions = [];
 
 if (!analysis.narrowTreadOk) {
  criticalIssues.push({
   title: 'Giron extrémité étroite insuffisant',
   detail: `${treadAtNarrow.toFixed(0)} mm < 150 mm minimum (CNB 9.8.4.3.1a)`,
   deficit: 150 - treadAtNarrow
  });
  suggestions.push(`Augmenter le rayon intérieur à ≥ ${minRadiusFor150} mm (actuellement ${innerRadius} mm)`);
  if (suggestedNumSteps < dancingNumSteps) {
   suggestions.push(`Ou réduire à ${suggestedNumSteps} marches dansantes par zone`);
  }
 }
 
 if (!analysis.tread300Ok) {
  criticalIssues.push({
   title: 'Giron à 300mm insuffisant',
   detail: `${treadAt300.toFixed(0)} mm < ${limits.minTread} mm minimum (CNB tableau 9.8.4.2)`,
   deficit: limits.minTread - treadAt300
  });
  if (minRadiusForCNBTread > 0) {
   suggestions.push(`Augmenter le rayon intérieur à ≥ ${minRadiusForCNBTread} mm`);
  }
 }
 
 if (!analysis.rectSpaceOk) {
  criticalIssues.push({
   title: 'Espace insuffisant pour marches rectangulaires',
   detail: `${totalRectRun.toFixed(0)} mm disponible (doit être > 0)`,
   deficit: -totalRectRun
  });
  const minNeeded = limits.minTread * 3 + (isUConfig ? turnZoneSpace * 2 : turnZoneSpace);
  suggestions.push(`Augmenter la somme des longueurs à ≥ ${Math.ceil(minNeeded)} mm`);
  suggestions.push(`Ou réduire la largeur de l'escalier (actuellement ${stairWidth} mm)`);
 }
 
 // Si contraintes critiques non respectées, retourner erreur avec diagnostic
 if (criticalIssues.length > 0) {
  return generateDancingDiagnosticError(criticalIssues, suggestions, {
   innerRadius, dancingAngle, dancingNumSteps, anglePerStep,
   treadAtNarrow, treadAt300, totalRectRun, limits,
   suggestedMinRadius, suggestedNumSteps, stairWidth,
   firstFlightRun, secondFlightRun, thirdFlightRun, isUConfig
  });
 }
 
 // ===== RECHERCHE DE SOLUTIONS =====
 const solutions = [];
 const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
 
 const minRisers = Math.ceil(totalRise / limits.maxRiser);
 const maxRisers = Math.floor(totalRise / limits.minRiser);
 
 // Collecter les raisons de rejet pour diagnostic détaillé
 const rejectionStats = {
  tested: 0,
  notEnoughRectTreads: [],
  rectTreadTooSmall: [],
  rectTreadTooLarge: [],
  treadVariationTooHigh: [],
  validSolutions: []
 };
 
 for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
  
  rejectionStats.tested++;
  const numTreads = numRisers - 1;
  const numRectTreads = numTreads - totalDancingSteps;
  
  // Vérification: au moins 2 girons rectangulaires
  if (numRectTreads < 2) {
   rejectionStats.notEnoughRectTreads.push({
    numRisers, numTreads, numRectTreads, riserHeight
   });
   continue;
  }
  
  const rectTreadDepth = totalRectRun / numRectTreads;
  
  // Vérification: giron rectangulaire dans les limites CNB
  if (rectTreadDepth < limits.minTread) {
   rejectionStats.rectTreadTooSmall.push({
    numRisers, numRectTreads, rectTreadDepth, riserHeight
   });
   continue;
  }
  if (rectTreadDepth > limits.maxTread) {
   rejectionStats.rectTreadTooLarge.push({
    numRisers, numRectTreads, rectTreadDepth, riserHeight
   });
   continue;
  }
  
  // CNB 9.8.4.5: uniformité des girons dans les volées à marches mixtes
  // Le giron des marches dansantes (à 300mm) et le giron rectangulaire
  // sont chacun validés individuellement contre leurs limites CNB respectives.
  // Paragraphe (2): Si les marches dansantes sont au bas, leur giron peut être supérieur.
  // En pratique, pour un escalier en L où les dansantes sont au virage,
  // nous acceptons la solution si chaque type respecte ses limites CNB.
  const treadVariation = treadAt300 - rectTreadDepth;
  
  // Note: On ne rejette plus basé sur la variation entre types de marches.
  // Si giron dansantes et giron rect sont tous deux dans les limites CNB, c'est acceptable.
  // La variation sera utilisée comme critère de score (préférer solutions plus uniformes).
  
  // Solution valide trouvée!
  const stepValue = (rectTreadDepth / 25.4) + (riserHeight / 25.4);
  const stepRule = checkStepRule(riserHeight, rectTreadDepth);
  
  let score = Math.abs(stepValue - optimalStepValue) * 2;
  if (priority === 'comfort') {
   if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
   if (idealTread > 0) score += Math.abs(rectTreadDepth - idealTread) / 10;
   if (stepRule.isValid) score *= 0.7;
   // Pénalité légère pour grande variation entre girons (préférer uniformité)
   score += Math.abs(treadVariation) / 50;
  } else {
   score = -numRisers + Math.abs(stepValue - optimalStepValue);
  }
  
  // Répartition des girons rectangulaires entre les volées
  let flight1RectTreads, flight2RectTreads, flight3RectTreads;
  
  if (isUConfig) {
   const run1Adj = Math.max(0, firstFlightRun - turnZoneSpace);
   const run2Adj = secondFlightRun;
   const run3Adj = Math.max(0, thirdFlightRun - turnZoneSpace);
   const totalAdj = run1Adj + run2Adj + run3Adj;
   
   if (totalAdj > 0) {
    flight1RectTreads = Math.max(1, Math.round(numRectTreads * run1Adj / totalAdj));
    flight2RectTreads = Math.max(0, Math.round(numRectTreads * run2Adj / totalAdj));
    flight3RectTreads = Math.max(1, numRectTreads - flight1RectTreads - flight2RectTreads);
   } else {
    flight1RectTreads = Math.floor(numRectTreads / 3);
    flight2RectTreads = Math.floor(numRectTreads / 3);
    flight3RectTreads = numRectTreads - flight1RectTreads - flight2RectTreads;
   }
  } else {
   const run1Adj = firstFlightRun;
   const run2Adj = Math.max(0, secondFlightRun - turnZoneSpace);
   const totalAdj = run1Adj + run2Adj;
   
   if (totalAdj > 0) {
    flight1RectTreads = Math.max(1, Math.round(numRectTreads * run1Adj / totalAdj));
    flight2RectTreads = Math.max(1, numRectTreads - flight1RectTreads);
   } else {
    flight1RectTreads = Math.floor(numRectTreads / 2);
    flight2RectTreads = numRectTreads - flight1RectTreads;
   }
   flight3RectTreads = 0;
  }
  
  const solution = {
   numRisers,
   numTreads,
   numRectTreads,
   totalDancingSteps,
   dancingStepsPerZone: dancingNumSteps,
   numTurnZones,
   riserHeight,
   rectTreadDepth,
   treadAt300,
   treadAtNarrow,
   anglePerStep,
   innerRadius,
   dancingAngle,
   stepValue,
   stepRule,
   score,
   treadVariation,
   firstFlightRun,
   secondFlightRun,
   thirdFlightRun: isUConfig ? thirdFlightRun : 0,
   flight1RectTreads,
   flight2RectTreads,
   flight3RectTreads,
   stairWidth,
   totalRiseCalc: riserHeight * numRisers,
   isDancing: true,
   dancingConfig
  };
  
  solutions.push(solution);
  rejectionStats.validSolutions.push(solution);
 }
 
 // ===== SI AUCUNE SOLUTION, DIAGNOSTIC DÉTAILLÉ =====
 if (solutions.length === 0) {
  return generateDancingNoSolutionError(rejectionStats, {
   innerRadius, dancingAngle, dancingNumSteps, anglePerStep,
   treadAtNarrow, treadAt300, totalRectRun, limits, totalRise,
   stairWidth, firstFlightRun, secondFlightRun, thirdFlightRun,
   isUConfig, totalDancingSteps, minRisers, maxRisers
  });
 }
 
 solutions.sort((a, b) => a.score - b.score);
 return solutions.slice(0, 3);
}

/**
 * Génère un message d'erreur HTML détaillé pour les contraintes géométriques non respectées
 */
function generateDancingDiagnosticError(issues, suggestions, params) {
 const {
  innerRadius, dancingAngle, dancingNumSteps, anglePerStep,
  treadAtNarrow, treadAt300, totalRectRun, limits,
  suggestedMinRadius, suggestedNumSteps, stairWidth,
  firstFlightRun, secondFlightRun, thirdFlightRun, isUConfig
 } = params;
 
 let html = '<div class="diagnostic-details">';
 
 // Titre avec icône
 html += '<h4 style="color:#c62828;margin-bottom:15px;">⚠ Contraintes géométriques non respectées</h4>';
 
 // Problèmes identifiés
 html += '<div style="background:#ffebee;padding:12px;border-radius:6px;margin-bottom:15px;">';
 html += '<p style="margin:0 0 10px 0;font-weight:600;color:#b71c1c;">Problèmes identifiés :</p>';
 html += '<ul style="margin:0;padding-left:20px;">';
 issues.forEach(issue => {
  html += `<li style="margin-bottom:8px;"><strong>${issue.title}</strong><br><span style="color:#666;">${issue.detail}</span></li>`;
 });
 html += '</ul></div>';
 
 // Suggestions
 if (suggestions.length > 0) {
  html += '<div style="background:#e8f5e9;padding:12px;border-radius:6px;margin-bottom:15px;">';
  html += '<p style="margin:0 0 10px 0;font-weight:600;color:#2e7d32;">✓ Suggestions pour obtenir une solution conforme :</p>';
  html += '<ul style="margin:0;padding-left:20px;">';
  suggestions.forEach(sug => {
   html += `<li style="margin-bottom:6px;">${sug}</li>`;
  });
  html += '</ul></div>';
 }
 
 // Tableau des paramètres actuels vs requis
 html += '<p style="font-weight:600;margin-bottom:10px;">Analyse des paramètres :</p>';
 html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:15px;">';
 html += '<tr style="background:#f5f5f5;"><th style="padding:8px;border:1px solid #ddd;text-align:left;">Paramètre</th><th style="padding:8px;border:1px solid #ddd;">Valeur actuelle</th><th style="padding:8px;border:1px solid #ddd;">Minimum requis</th><th style="padding:8px;border:1px solid #ddd;">Statut</th></tr>';
 
 // Giron extrémité étroite
 const narrowOk = treadAtNarrow >= 150;
 html += `<tr><td style="padding:6px;border:1px solid #ddd;">Giron extrémité étroite</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;${!narrowOk ? 'color:#c62828;font-weight:bold;' : ''}">${treadAtNarrow.toFixed(0)} mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">150 mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">${narrowOk ? '<span style="color:#2e7d32;">✓</span>' : '<span style="color:#c62828;">✗</span>'}</td></tr>`;
 
 // Giron à 300mm
 const tread300Ok = treadAt300 >= limits.minTread;
 html += `<tr><td style="padding:6px;border:1px solid #ddd;">Giron à 300 mm de l'axe</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;${!tread300Ok ? 'color:#c62828;font-weight:bold;' : ''}">${treadAt300.toFixed(0)} mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">${limits.minTread} mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">${tread300Ok ? '<span style="color:#2e7d32;">✓</span>' : '<span style="color:#c62828;">✗</span>'}</td></tr>`;
 
 // Espace rectangulaire
 const rectOk = totalRectRun > 0;
 html += `<tr><td style="padding:6px;border:1px solid #ddd;">Espace marches rect.</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;${!rectOk ? 'color:#c62828;font-weight:bold;' : ''}">${totalRectRun.toFixed(0)} mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">> 0 mm</td>`;
 html += `<td style="padding:6px;border:1px solid #ddd;text-align:center;">${rectOk ? '<span style="color:#2e7d32;">✓</span>' : '<span style="color:#c62828;">✗</span>'}</td></tr>`;
 
 html += '</table>';
 
 // Paramètres suggérés
 html += '<div style="background:#fff3e0;padding:12px;border-radius:6px;">';
 html += '<p style="margin:0 0 10px 0;font-weight:600;color:#e65100;">💡 Paramètres suggérés pour cette configuration :</p>';
 html += '<ul style="margin:0;padding-left:20px;">';
 html += `<li>Rayon intérieur : <strong>${suggestedMinRadius} mm</strong> minimum (actuellement ${innerRadius} mm)</li>`;
 if (suggestedNumSteps !== dancingNumSteps) {
  html += `<li>Ou ${suggestedNumSteps} marches dansantes par zone (actuellement ${dancingNumSteps})</li>`;
 }
 html += `<li>Angle par marche actuel : ${anglePerStep.toFixed(1)}° (${dancingAngle}° ÷ ${dancingNumSteps})</li>`;
 html += '</ul></div>';
 
 html += '</div>';
 
 return {
  error: true,
  errorMessage: html,
  errorType: 'geometry',
  solutions: []
 };
}

/**
 * Génère un message d'erreur HTML détaillé quand aucune solution n'est trouvée
 */
function generateDancingNoSolutionError(stats, params) {
 const {
  innerRadius, dancingAngle, dancingNumSteps, anglePerStep,
  treadAtNarrow, treadAt300, totalRectRun, limits, totalRise,
  stairWidth, firstFlightRun, secondFlightRun, thirdFlightRun,
  isUConfig, totalDancingSteps, minRisers, maxRisers
 } = params;
 
 let html = '<div class="diagnostic-details">';
 
 html += '<h4 style="color:#c62828;margin-bottom:15px;">⚠ Aucune solution conforme CNB trouvée</h4>';
 
 // Résumé de l'analyse
 html += '<div style="background:#e3f2fd;padding:12px;border-radius:6px;margin-bottom:15px;">';
 html += `<p style="margin:0;"><strong>${stats.tested}</strong> configurations testées (${minRisers} à ${maxRisers} contremarches)</p>`;
 html += '</div>';
 
 // Détail des rejets par catégorie
 html += '<p style="font-weight:600;margin-bottom:10px;">Raisons des rejets :</p>';
 
 // 1. Pas assez de girons rectangulaires
 if (stats.notEnoughRectTreads.length > 0) {
  html += '<div style="background:#fff8e1;padding:10px;border-radius:6px;margin-bottom:10px;border-left:4px solid #ff9800;">';
  html += `<p style="margin:0 0 8px 0;font-weight:600;color:#e65100;">Girons rectangulaires insuffisants : ${stats.notEnoughRectTreads.length} configuration(s)</p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Avec ${totalDancingSteps} marches dansantes au total, il reste trop peu de girons rectangulaires.</p>`;
  html += `<p style="margin:8px 0 0 0;font-size:12px;"><strong>Solution :</strong> Réduire le nombre de marches dansantes par zone (actuellement ${dancingNumSteps}).</p>`;
  html += '</div>';
 }
 
 // 2. Giron rectangulaire trop petit
 if (stats.rectTreadTooSmall.length > 0) {
  const minFound = Math.min(...stats.rectTreadTooSmall.map(r => r.rectTreadDepth));
  const maxFound = Math.max(...stats.rectTreadTooSmall.map(r => r.rectTreadDepth));
  html += '<div style="background:#ffebee;padding:10px;border-radius:6px;margin-bottom:10px;border-left:4px solid #f44336;">';
  html += `<p style="margin:0 0 8px 0;font-weight:600;color:#c62828;">Giron rectangulaire trop petit : ${stats.rectTreadTooSmall.length} configuration(s)</p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Girons calculés : ${minFound.toFixed(0)} - ${maxFound.toFixed(0)} mm (minimum CNB : ${limits.minTread} mm)</p>`;
  html += `<p style="margin:8px 0 0 0;font-size:12px;"><strong>Solution :</strong> Augmenter les longueurs des parties pour plus d'espace.</p>`;
  html += '</div>';
 }
 
 // 3. Giron rectangulaire trop grand
 if (stats.rectTreadTooLarge.length > 0) {
  const minFound = Math.min(...stats.rectTreadTooLarge.map(r => r.rectTreadDepth));
  const maxFound = Math.max(...stats.rectTreadTooLarge.map(r => r.rectTreadDepth));
  html += '<div style="background:#ffebee;padding:10px;border-radius:6px;margin-bottom:10px;border-left:4px solid #f44336;">';
  html += `<p style="margin:0 0 8px 0;font-weight:600;color:#c62828;">Giron rectangulaire trop grand : ${stats.rectTreadTooLarge.length} configuration(s)</p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Girons calculés : ${minFound.toFixed(0)} - ${maxFound.toFixed(0)} mm (maximum CNB : ${limits.maxTread} mm)</p>`;
  html += `<p style="margin:8px 0 0 0;font-size:12px;"><strong>Solution :</strong> Réduire les longueurs des parties ou augmenter la hauteur.</p>`;
  html += '</div>';
 }
 
 // 4. Giron dansantes inférieur aux rectangulaires (CNB 9.8.4.5)
 if (stats.treadVariationTooHigh.length > 0) {
  const minVar = Math.min(...stats.treadVariationTooHigh.map(r => r.treadVariation));
  const minRectTread = Math.min(...stats.treadVariationTooHigh.map(r => r.rectTreadDepth));
  const maxRectTread = Math.max(...stats.treadVariationTooHigh.map(r => r.rectTreadDepth));
  
  html += '<div style="background:#fff3e0;padding:10px;border-radius:6px;margin-bottom:10px;border-left:4px solid #ff9800;">';
  html += `<p style="margin:0 0 8px 0;font-weight:600;color:#e65100;">Giron dansantes inférieur aux rectangulaires (CNB 9.8.4.5) : ${stats.treadVariationTooHigh.length} configuration(s)</p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Giron dansantes (à 300 mm) : <strong>${treadAt300.toFixed(0)} mm</strong></p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Girons rectangulaires calculés : ${minRectTread.toFixed(0)} - ${maxRectTread.toFixed(0)} mm</p>`;
  html += `<p style="margin:0;font-size:12px;color:#666;">Note : CNB 9.8.4.5.(2) permet giron dansantes ≥ giron rectangulaire</p>`;
  
  // Calculer le rayon idéal pour que le giron dansantes soit égal ou supérieur au rectangulaire
  const targetTread = minRectTread; // Viser au moins le giron rectangulaire minimum
  const idealRadius = Math.round((targetTread / ((dancingAngle / dancingNumSteps) * Math.PI / 180)) - 300);
  
  html += `<p style="margin:8px 0 0 0;font-size:12px;"><strong>Solution :</strong> Augmenter le rayon intérieur à ≥ <strong>${Math.max(150, idealRadius)} mm</strong> pour que le giron dansantes ≥ ${targetTread.toFixed(0)} mm.</p>`;
  html += '</div>';
 }
 
 // Tableau récapitulatif des paramètres
 html += '<p style="font-weight:600;margin:15px 0 10px 0;">Paramètres actuels :</p>';
 html += '<table style="width:100%;font-size:12px;border-collapse:collapse;margin-bottom:15px;">';
 html += '<tr style="background:#f5f5f5;"><th style="padding:6px;border:1px solid #ddd;text-align:left;" colspan="2">Géométrie des marches dansantes</th></tr>';
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Rayon intérieur</td><td style="padding:5px;border:1px solid #ddd;">${innerRadius} mm</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Angle total par virage</td><td style="padding:5px;border:1px solid #ddd;">${dancingAngle}°</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Marches dansantes/zone</td><td style="padding:5px;border:1px solid #ddd;">${dancingNumSteps}</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Angle par marche</td><td style="padding:5px;border:1px solid #ddd;">${anglePerStep.toFixed(1)}°</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Giron à l'extrémité étroite</td><td style="padding:5px;border:1px solid #ddd;">${treadAtNarrow.toFixed(0)} mm ${treadAtNarrow >= 150 ? '<span style="color:#2e7d32;">✓</span>' : '<span style="color:#c62828;">✗</span>'}</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Giron à 300 mm de l'axe</td><td style="padding:5px;border:1px solid #ddd;">${treadAt300.toFixed(0)} mm ${treadAt300 >= limits.minTread ? '<span style="color:#2e7d32;">✓</span>' : '<span style="color:#c62828;">✗</span>'}</td></tr>`;
 
 html += '<tr style="background:#f5f5f5;"><th style="padding:6px;border:1px solid #ddd;text-align:left;" colspan="2">Dimensions globales</th></tr>';
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Hauteur totale</td><td style="padding:5px;border:1px solid #ddd;">${totalRise} mm</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Largeur escalier</td><td style="padding:5px;border:1px solid #ddd;">${stairWidth} mm</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Espace marches rect.</td><td style="padding:5px;border:1px solid #ddd;">${totalRectRun.toFixed(0)} mm</td></tr>`;
 html += `<tr><td style="padding:5px;border:1px solid #ddd;">Limites giron CNB</td><td style="padding:5px;border:1px solid #ddd;">${limits.minTread} - ${limits.maxTread} mm</td></tr>`;
 html += '</table>';
 
 // Suggestions de paramètres fonctionnels
 html += '<div style="background:#e8f5e9;padding:12px;border-radius:6px;">';
 html += '<p style="margin:0 0 10px 0;font-weight:600;color:#2e7d32;">💡 Exemple de paramètres fonctionnels :</p>';
 html += '<ul style="margin:0;padding-left:20px;font-size:13px;">';
 
 // Calculer des paramètres qui fonctionneraient
 const idealTread = (limits.minTread + limits.maxTread) / 2;
 const idealAngleRad = idealTread / (300 + 300); // rayon 300mm + 300mm de mesure
 const idealAngle = idealAngleRad * 180 / Math.PI;
 const suggestedSteps = Math.round(dancingAngle / idealAngle);
 
 html += `<li>Pour un angle de <strong>${dancingAngle}°</strong> : essayer <strong>${Math.max(2, Math.min(6, suggestedSteps))} marches</strong> avec rayon <strong>300-400 mm</strong></li>`;
 html += `<li>Longueurs des parties : au moins <strong>1500 mm</strong> chacune</li>`;
 html += `<li>Cible : giron dansantes (à 300 mm) proche de <strong>${idealTread.toFixed(0)} mm</strong></li>`;
 html += '</ul></div>';
 
 html += '</div>';
 
 return {
  error: true,
  errorMessage: html,
  errorType: 'no_solution',
  solutions: []
 };
}

/**
 * Calcule les dimensions pour un escalier hélicoïdal
 */
function calculateSpiralStair(params) {
 const {
  totalRise,
  innerRadius,
  rotationDegrees,
  buildingType,
  stairType,
  idealRiser,
  priority
 } = params;
 
 const limits = getCNBLimits(buildingType, stairType);
 const spiralLimits = CNB_LIMITS.spiral;
 
 // Pour l'hélicoïdal, le giron est mesuré à  300mm de l'axe de la main courante
 const measurementRadius = innerRadius + 300;
 
 // Longueur de l'arc à  300mm
 const arcLength = (2 * Math.PI * measurementRadius * rotationDegrees) / 360;
 
 const minRisers = Math.ceil(totalRise / spiralLimits.maxRiser);
 const maxRisers = Math.floor(totalRise / limits.minRiser);
 
 const solutions = [];
 
 for (let numRisers = minRisers; numRisers <= maxRisers; numRisers++) {
  const riserHeight = totalRise / numRisers;
  
  if (riserHeight > spiralLimits.maxRiser || riserHeight < limits.minRiser) continue;
  
  const numTreads = numRisers; // Dans un hélicoïdal, autant de marches que de contremarches
  const treadAt300 = arcLength / numTreads;
  
  if (treadAt300 < spiralLimits.minTreadAt300) continue;
  
  let score = Math.abs(riserHeight - 200); // Idéal pour hélicoïdal
  if (idealRiser > 0) score = Math.abs(riserHeight - idealRiser);
  
  solutions.push({
  numRisers,
  numTreads,
  riserHeight,
  treadAt300,
  innerRadius,
  rotationDegrees,
  arcLength,
  score,
  isSpiral: true,
  totalRiseCalc: riserHeight * numRisers
  });
 }
 
 solutions.sort((a, b) => a.score - b.score);
 return solutions.slice(0, 3);
}

/**
 * Fonction principale de calcul selon la configuration
 */
function calculateOptimalStair(params) {
 const { stairConfig, lShapedConfig } = params;
 
 switch (stairConfig) {
  case 'straight':
  case 'turning_30':
  case 'turning_45':
  case 'turning_60':
  return calculateStraightStair(params);
  
  case 'l_shaped':
  if (lShapedConfig === 'standard_landing') {
   return calculateLShapedWithLanding(params);
  }
  return calculateLShapedWithRadiating(params);
  
  case 'u_shaped':
  return calculateUShapedStair(params);
  
  case 'spiral':
  return calculateSpiralStair(params);
  
  case 'dancing_steps':
  return calculateDancingSteps(params);
  
  default:
  return calculateStraightStair(params);
 }
}

// =====================================================================
// VARIABLES GLOBALES
// =====================================================================

let lastCalculatorParams = null;
let lastVerificationParams = null;

// =====================================================================
// AFFICHAGE DES RÉSULTATS - CALCULATEUR
// =====================================================================





/**
 * Génère une visualisation simple d'un escalier droit
 * Vue de profil montrant la pente et les dimensions
 */
/**
 * Genere une visualisation SVG d'un escalier droit (vue en plan uniquement)
 * Toutes les valeurs d'entree sont en mm (unites internes du calculateur)
 * L'affichage est formate selon le systeme de mesure choisi par l'utilisateur
 */
function generateStraightStairVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  treadDepth,
  totalRise,
  totalRun,
  stairWidth,
  isMetric
 } = stairData;
 
 const r = (n) => Math.round(n * 10) / 10;
 
 // Dimensions du SVG - optimisees pour vue en plan seule
 const W = 700, H = 395;
 
 // Formatage des dimensions - précis pour légende, simplifié pour cotations
 const riseText = formatValueForPlan(totalRise, isMetric);
 const runText = formatValueForPlan(totalRun, isMetric);
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(treadDepth, isMetric);
 const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
 const actualWidth = stairWidth || 914;

 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs fleches pour cotations
 svg += '<defs>';
 svg += '<marker id="arrS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 // Marqueur fleche de montee - plus fine et elegante
 svg += '<marker id="arrMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // ========== VUE EN PLAN (centree) ==========
 const margin = { left: 60, right: 80, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Calculer l'échelle pour occuper l'espace disponible
 const scalePlan = Math.min(planW / totalRun, planH / actualWidth) * 0.75;
 
 const stairW_plan = r(totalRun * scalePlan);
 const stairH_plan = r(actualWidth * scalePlan);
 const treadW_plan = r(treadDepth * scalePlan);
 
 // Centrer le plan
 const planStartX = r(margin.left + (planW - stairW_plan) / 2);
 const planStartY = r(margin.top + (planH - stairH_plan) / 2);
 
 // Titre avec fond
 svg += '<rect x="' + (W/2 - 100) + '" y="8" width="200" height="26" fill="#e8f5e9" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="27" style="font:bold 13px Arial;fill:#2e7d32;" text-anchor="middle">VUE EN PLAN - Escalier droit</text>';
 
 // Rectangle de l'escalier (fond)
 svg += '<rect x="' + planStartX + '" y="' + planStartY + '" width="' + stairW_plan + '" height="' + stairH_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
 
 // Lignes des girons (contremarches en plan) - épaisseur uniforme de 1.5
 for (let i = 1; i <= numTreads; i++) {
  const lineX = r(planStartX + i * treadW_plan);
  svg += '<line x1="' + lineX + '" y1="' + planStartY + '" x2="' + lineX + '" y2="' + r(planStartY + stairH_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
 }
 
 // Numerotation des marches - décalée vers le bas pour éviter conflit avec la flèche
 const markerY = r(planStartY + stairH_plan * 0.75 + 3); // En bas de la marche
 svg += '<text x="' + r(planStartX + treadW_plan/2) + '" y="' + markerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
 svg += '<text x="' + r(planStartX + stairW_plan - treadW_plan/2) + '" y="' + markerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
 
 // Fleche de montee - de l'EXTERIEUR de la 1ere marche jusqu'a la derniere CM
 const arrowY = r(planStartY + stairH_plan / 2);
 const arrowStartX = r(planStartX); // Commence a l'EXTERIEUR (avant la 1ere CM)
 const arrowEndX = r(planStartX + stairW_plan); // Finit a la derniere contremarche
 svg += '<line x1="' + arrowStartX + '" y1="' + arrowY + '" x2="' + arrowEndX + '" y2="' + arrowY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrMontee)"/>';
 
 // Indicateur "En haut" centré avec le centre de la volée de départ
 svg += '<text x="' + r(arrowStartX - 5) + '" y="' + (arrowY + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
 
 // ===== COTATIONS =====
 
 // Cotation longueur (en bas)
 const dimY_bottom = r(planStartY + stairH_plan + 35);
 svg += '<line x1="' + planStartX + '" y1="' + dimY_bottom + '" x2="' + r(planStartX + stairW_plan) + '" y2="' + dimY_bottom + '" stroke="#555" stroke-width="1" marker-start="url(#arrS)" marker-end="url(#arrE)"/>';
 svg += '<line x1="' + planStartX + '" y1="' + r(planStartY + stairH_plan + 18) + '" x2="' + planStartX + '" y2="' + (dimY_bottom + 4) + '" stroke="#555" stroke-width="1"/>';
 svg += '<line x1="' + r(planStartX + stairW_plan) + '" y1="' + r(planStartY + stairH_plan + 18) + '" x2="' + r(planStartX + stairW_plan) + '" y2="' + (dimY_bottom + 4) + '" stroke="#555" stroke-width="1"/>';
 svg += '<text x="' + r(planStartX + stairW_plan/2) + '" y="' + (dimY_bottom + 15) + '" style="font:bold 11px Arial;fill:#333;" text-anchor="middle">Longueur : ' + runText + '</text>';
 svg += '<text x="' + r(planStartX + stairW_plan/2) + '" y="' + (dimY_bottom + 28) + '" style="font:10px Arial;fill:#666;" text-anchor="middle">(' + numTreads + ' girons x ' + treadText + ')</text>';
 
 // Cotation largeur (a droite)
 const dimX_right = r(planStartX + stairW_plan + 25);
 svg += '<line x1="' + dimX_right + '" y1="' + planStartY + '" x2="' + dimX_right + '" y2="' + r(planStartY + stairH_plan) + '" stroke="#555" stroke-width="1" marker-start="url(#arrS)" marker-end="url(#arrE)"/>';
 svg += '<line x1="' + r(planStartX + stairW_plan + 5) + '" y1="' + planStartY + '" x2="' + (dimX_right + 4) + '" y2="' + planStartY + '" stroke="#555" stroke-width="1"/>';
 svg += '<line x1="' + r(planStartX + stairW_plan + 5) + '" y1="' + r(planStartY + stairH_plan) + '" x2="' + (dimX_right + 4) + '" y2="' + r(planStartY + stairH_plan) + '" stroke="#555" stroke-width="1"/>';
 
 const midY_right = r(planStartY + stairH_plan / 2);
 svg += '<text x="' + (dimX_right + 8) + '" y="' + (midY_right - 5) + '" style="font:bold 11px Arial;fill:#333;">Largeur</text>';
 svg += '<text x="' + (dimX_right + 8) + '" y="' + (midY_right + 10) + '" style="font:bold 11px Arial;fill:#333;">' + widthText + '</text>';
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = 85;
 const cellH = 16;
 const cols = 4;
 
 // Fond du tableau
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
 
 // En-têtes
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">CM</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Giron</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
 
 // Ligne séparatrice
 svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
 
 // Valeurs
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' × ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' × ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
 
 svg += '</svg>';
 return svg;
}




/**
 * Genere la visualisation SVG pour un escalier en L (90 degres)
 * Vue en plan uniquement - configurations: palier standard, marches rayonnantes
 */
function generateLShapedStairVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  treadDepth,
  totalRise,
  stairWidth,
  isMetric,
  lShapedConfig,
  treadsInFlight1,
  treadsInFlight2,
  landingDepth,
  firstFlightRectTreads,
  secondFlightRectTreads,
  numRadiatingSteps,
  firstFlightRun,
  secondFlightRun,
  radiatingAtEnd,
  radiatingAtStart
 } = stairData;
 
 const r = (n) => Math.round(n * 10) / 10;
 
 // Dimensions du SVG - optimisees pour vue en plan seule
 const W = 680, H = 495;
 
 // Formatage des dimensions - simplifié pour les plans
 const riseText = formatValueForPlan(totalRise, isMetric);
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(treadDepth, isMetric);
 const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
 
 // Determiner la configuration
 const isLanding = lShapedConfig === 'standard_landing';
 const numRadSteps = numRadiatingSteps || 0;
 const isRadiatingAtExtremity = radiatingAtEnd || radiatingAtStart;
 
 // Calculer les dimensions des volees
 let flight1Treads, flight2Treads, flight1Run, flight2Run;
 
 if (isLanding) {
  flight1Treads = treadsInFlight1 || Math.floor(numTreads / 2);
  flight2Treads = treadsInFlight2 || (numTreads - flight1Treads);
  flight1Run = flight1Treads * treadDepth;
  flight2Run = flight2Treads * treadDepth;
 } else if (isRadiatingAtExtremity) {
  if (radiatingAtEnd) {
  flight1Treads = firstFlightRectTreads || (numTreads - numRadSteps);
  flight2Treads = 0;
  flight1Run = firstFlightRun || (flight1Treads * treadDepth);
  flight2Run = stairWidth || 914;
  } else {
  flight1Treads = 0;
  flight2Treads = secondFlightRectTreads || (numTreads - numRadSteps);
  flight1Run = stairWidth || 914;
  flight2Run = secondFlightRun || (flight2Treads * treadDepth);
  }
 } else {
  flight1Treads = firstFlightRectTreads || Math.floor((numTreads - numRadSteps) / 2);
  flight2Treads = secondFlightRectTreads || ((numTreads - numRadSteps) - flight1Treads);
  flight1Run = firstFlightRun || (flight1Treads * treadDepth);
  flight2Run = secondFlightRun || (flight2Treads * treadDepth);
 }
 
 const actualWidth = stairWidth || 914;
 const actualLanding = landingDepth || actualWidth;
 
 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs fleches
 svg += '<defs>';
 svg += '<marker id="arrLS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrLE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 // Marqueur fleche de montee - plus fine et elegante
 svg += '<marker id="arrLMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // ========== VUE EN PLAN ==========
 const margin = { left: 50, right: 70, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Titre avec fond
 let titleText = 'VUE EN PLAN - Escalier en L';
 if (isLanding) {
  titleText += ' (2 volees + palier)';
 } else {
  titleText += ' (1 volee continue)';
 }
 svg += '<rect x="' + (W/2 - 140) + '" y="8" width="280" height="26" fill="#e8f5e9" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
 
 // Calculer l'echelle pour la vue en plan
 // Ajuster les dimensions selon la configuration
 let totalPlanW, totalPlanH;
 
 if (isRadiatingAtExtremity && radiatingAtEnd) {
  // Marches rayonnantes a la fin: volee horizontale + carre
  totalPlanW = flight1Run + actualWidth;
  totalPlanH = actualWidth; // Seulement le carre rayonnant en vertical
 } else if (isRadiatingAtExtremity && radiatingAtStart) {
  // Marches rayonnantes au debut: carre + volee verticale
  totalPlanW = actualWidth; // Seulement le carre rayonnant en horizontal
  totalPlanH = flight2Run + actualWidth;
 } else if (isLanding) {
  // Palier: volee 1 + palier en horizontal, volee 2 + palier en vertical
  totalPlanW = flight1Run + actualLanding;
  totalPlanH = flight2Run + actualLanding;
 } else {
  // Marches rayonnantes a l'intersection
  totalPlanW = flight1Run + actualWidth;
  totalPlanH = flight2Run + actualWidth;
 }
 
 // Échelle pour occuper l'espace disponible
 const scalePlan = Math.min(planW / totalPlanW, planH / totalPlanH) * 0.75;
 
 const stairW1_plan = r(flight1Run * scalePlan);
 const stairW2_plan = r(flight2Run * scalePlan);
 const stairWidth_plan = r(actualWidth * scalePlan);
 const treadW_plan = r(treadDepth * scalePlan);
 const landingW_plan = r(actualLanding * scalePlan);
 
 // Position de depart centree - ajustee selon configuration
 let planStartX, planStartY;
 
 if (isRadiatingAtExtremity && radiatingAtEnd) {
  // Volee horizontale + carre a droite
  planStartX = r(margin.left + (planW - (stairW1_plan + stairWidth_plan)) / 2);
  planStartY = r(margin.top + (planH - stairWidth_plan) / 2);
 } else if (isRadiatingAtExtremity && radiatingAtStart) {
  // Carre en bas + volee verticale
  planStartX = r(margin.left + (planW - stairWidth_plan) / 2);
  planStartY = r(margin.top + (planH - (stairW2_plan + stairWidth_plan)) / 2);
 } else if (isLanding) {
  // Palier: volee 1 + palier en horizontal, volee 2 + palier en vertical
  planStartX = r(margin.left + (planW - (stairW1_plan + landingW_plan)) / 2);
  planStartY = r(margin.top + (planH - (stairW2_plan + landingW_plan)) / 2);
 } else {
  // Marches rayonnantes a l'intersection
  planStartX = r(margin.left + (planW - (stairW1_plan + stairWidth_plan)) / 2);
  planStartY = r(margin.top + (planH - (stairW2_plan + stairWidth_plan)) / 2);
 }
 
 if (isLanding) {
  // ===== ESCALIER EN L AVEC PALIER STANDARD (2 VOLEES) =====
  
  // Volee 1 (horizontale) - du bas vers le coin
  svg += '<rect x="' + planStartX + '" y="' + r(planStartY + stairW2_plan) + '" width="' + stairW1_plan + '" height="' + stairWidth_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons volee 1 - épaisseur uniforme de 1.5
  const treadW1_exact = stairW1_plan / flight1Treads;
  for (let i = 1; i <= flight1Treads; i++) {
  const lineX = r(planStartX + i * treadW1_exact);
  svg += '<line x1="' + lineX + '" y1="' + r(planStartY + stairW2_plan) + '" x2="' + lineX + '" y2="' + r(planStartY + stairW2_plan + stairWidth_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numerotation volee 1 - décalée vers le bas pour éviter conflit avec la flèche
  const v1MarkerY = r(planStartY + stairW2_plan + stairWidth_plan * 0.75 + 3);
  svg += '<text x="' + r(planStartX + treadW1_exact/2) + '" y="' + v1MarkerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
  svg += '<text x="' + r(planStartX + stairW1_plan - treadW1_exact/2) + '" y="' + v1MarkerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + flight1Treads + '</text>';
  
  // Annotation nombre de girons rectangulaires volée 1 (au-dessus de la volée)
  svg += '<text x="' + r(planStartX + stairW1_plan/2) + '" y="' + r(planStartY + stairW2_plan - 8) + '" style="font:9px Arial;fill:#666;" text-anchor="middle">' + flight1Treads + ' girons rectangulaires</text>';
  
  // Palier (carre au coin)
  const palierX = r(planStartX + stairW1_plan);
  const palierY = r(planStartY + stairW2_plan);
  svg += '<rect x="' + palierX + '" y="' + palierY + '" width="' + landingW_plan + '" height="' + landingW_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
  // Numéro du palier - déplacé vers le coin bas-droit pour éviter conflit avec la flèche qui passe au centre
  svg += '<text x="' + r(palierX + landingW_plan * 0.78) + '" y="' + r(palierY + landingW_plan * 0.35) + '" style="font:bold 9px Arial;fill:#f57f17;" text-anchor="middle">' + (flight1Treads + 1) + '</text>';
  // Mot "Palier" déplacé vers le bas-gauche pour éviter conflit avec la flèche
  svg += '<text x="' + r(palierX + landingW_plan * 0.35) + '" y="' + r(palierY + landingW_plan * 0.78) + '" style="font:italic 10px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
  
  // Volee 2 (verticale) - du coin vers le haut
  svg += '<rect x="' + palierX + '" y="' + planStartY + '" width="' + stairWidth_plan + '" height="' + stairW2_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons volee 2 - épaisseur uniforme de 1.5
  const treadW2_exact = stairW2_plan / flight2Treads;
  for (let i = 1; i <= flight2Treads; i++) {
  const lineY = r(planStartY + stairW2_plan - i * treadW2_exact);
  svg += '<line x1="' + palierX + '" y1="' + lineY + '" x2="' + r(palierX + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numerotation volee 2 - décalée vers la droite pour éviter conflit avec la flèche
  // NUMÉROTATION CONTINUE: Volée 1 (1 à  flight1Treads) + Palier (flight1Treads+1) + Volée 2 (flight1Treads+2 à  numTreads+1)
  const v2MarkerX = r(palierX + stairWidth_plan * 0.75);
  svg += '<text x="' + v2MarkerX + '" y="' + r(planStartY + stairW2_plan - treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (flight1Treads + 2) + '</text>';
  svg += '<text x="' + v2MarkerX + '" y="' + r(planStartY + treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (numTreads + 1) + '</text>';
  
  // Annotation nombre de girons rectangulaires volée 2 (à  gauche de la volée)
  svg += '<text x="' + r(palierX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(palierX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
  
  // Fleche de montee continue - part de la 1ere CM (bord de l'escalier), traverse le palier, finit a la derniere CM
  const arrow1Y = r(planStartY + stairW2_plan + stairWidth_plan/2);
  const arrow1StartX = r(planStartX); // Depart a la 1ere CM (bord gauche de l'escalier)
  const arrowCornerX = r(palierX + stairWidth_plan/2); // Centre du palier
  const arrowEndY = r(planStartY); // Fin a la derniere CM
  
  // Segment horizontal (volee 1) - part de la 1ere CM
  svg += '<line x1="' + arrow1StartX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrow1Y + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment dans le palier (virage)
  svg += '<line x1="' + arrowCornerX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + r(planStartY + stairW2_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment vertical avec fleche (volee 2)
  svg += '<line x1="' + arrowCornerX + '" y1="' + r(planStartY + stairW2_plan) + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrLMontee)"/>';
  
  // "En haut" centré avec le centre de la volée de départ
  svg += '<text x="' + r(planStartX - 5) + '" y="' + (arrow1Y + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
  
  // Cotations TOTALES (incluant le palier pour coherence avec marches rayonnantes)
  const dimY1 = r(planStartY + stairW2_plan + stairWidth_plan + 25);
  const totalHorizontal = flight1Run + actualLanding; // Volee 1 + palier
  const totalHorizontalText = formatValueForPlan(totalHorizontal, isMetric);
  svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(palierX + landingW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + r((planStartX + palierX + landingW_plan)/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalHorizontalText + '</text>';
  
  const dimX2 = r(palierX + stairWidth_plan + 25);
  const totalVertical = flight2Run + actualLanding; // Volee 2 + palier
  const totalVerticalText = formatValueForPlan(totalVertical, isMetric);
  svg += '<line x1="' + dimX2 + '" y1="' + planStartY + '" x2="' + dimX2 + '" y2="' + r(palierY + landingW_plan) + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + (dimX2 + 5) + '" y="' + r((planStartY + palierY + landingW_plan)/2 + 4) + '" style="font:10px Arial;fill:#333;">' + totalVerticalText + '</text>';
  
  // Annotations girons (sans le palier, juste info)
  svg += '<text x="' + r(planStartX + stairW1_plan/2) + '" y="' + r(planStartY + stairW2_plan - 8) + '" style="font:9px Arial;fill:#666;" text-anchor="middle">' + flight1Treads + ' girons rectangulaires</text>';
  svg += '<text x="' + r(palierX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(palierX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
  
 } else {
  // ===== ESCALIER EN L AVEC MARCHES RAYONNANTES (1 VOLEE CONTINUE) =====
  
  const L = stairWidth_plan;
  
  if (isRadiatingAtExtremity && radiatingAtEnd) {
  // Marches rayonnantes a la FIN
  const treadW1_exact = stairW1_plan / flight1Treads;
  const cornerX = r(planStartX + stairW1_plan);
  const cornerY = planStartY;
  
  // Volee 1 (horizontale)
  svg += '<rect x="' + planStartX + '" y="' + planStartY + '" width="' + stairW1_plan + '" height="' + stairWidth_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  for (let i = 1; i <= flight1Treads; i++) {
   const lineX = r(planStartX + i * treadW1_exact);
   svg += '<line x1="' + lineX + '" y1="' + planStartY + '" x2="' + lineX + '" y2="' + r(planStartY + stairWidth_plan) + '" stroke="#1b5e20" stroke-width="' + (i === 1 || i === flight1Treads ? '2' : '1') + '"/>';
  }
  
  // Numerotation SUR les marches (au centre)
  const markerY_v1 = r(planStartY + stairWidth_plan/2 + 3);
  svg += '<text x="' + r(planStartX + treadW1_exact/2) + '" y="' + markerY_v1 + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
  svg += '<text x="' + r(planStartX + stairW1_plan - treadW1_exact/2) + '" y="' + markerY_v1 + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + flight1Treads + '</text>';
  
  // Zone marches rayonnantes
  svg += '<rect x="' + cornerX + '" y="' + cornerY + '" width="' + L + '" height="' + L + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Lignes rayonnantes
  const pivotX = cornerX;
  const pivotY = cornerY;
  if (numRadSteps === 2) {
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(pivotX + L) + '" y2="' + r(pivotY + L) + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">2×45°</text>';
  } else {
   const endX30 = r(pivotX + L);
   const endY30 = r(pivotY + L * Math.tan(Math.PI/6));
   const endX60 = r(pivotX + L / Math.tan(Math.PI/3));
   const endY60 = r(pivotY + L);
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX30 + '" y2="' + endY30 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX60 + '" y2="' + endY60 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">3×30°</text>';
  }
  
  // Fleche de montee continue - part de la 1ere CM (bord de l'escalier), tourne a 90 degres
  const arrow1Y = r(planStartY + stairWidth_plan/2);
  const arrowStartX = r(planStartX); // Depart a la 1ere CM (bord gauche)
  const arrowCornerX = r(cornerX + L/2);
  const arrowEndY = r(cornerY); // Fin au bord superieur du carre (derniere CM)
  
  // Segment horizontal (de la 1ere CM jusqu'au centre du carre)
  svg += '<line x1="' + arrowStartX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrow1Y + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment vertical avec fleche (du centre jusqu'au bord superieur)
  svg += '<line x1="' + arrowCornerX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrLMontee)"/>';
  
  // "En haut" centré avec le centre de la volée de départ
  svg += '<text x="' + r(planStartX - 5) + '" y="' + (arrow1Y + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
  
  // Cotations - longueur totale (volee 1 + carre rayonnant)
  const dimY1 = r(planStartY + stairWidth_plan + 25);
  const totalLength = firstFlightRun + actualWidth; // girons + largeur du carre
  const run1Text = formatValueForPlan(totalLength, isMetric);
  svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(cornerX + L) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + r((planStartX + cornerX + L)/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + run1Text + '</text>';
  
  // Annotation girons rectangulaires
  if (flight1Treads > 0) {
   svg += '<text x="' + r(planStartX + stairW1_plan/2) + '" y="' + r(planStartY - 8) + '" style="font:9px Arial;fill:#666;" text-anchor="middle">' + flight1Treads + ' girons rectangulaires</text>';
  }
  
  // Cotation largeur (a droite du carre)
  const dimX2 = r(cornerX + L + 15);
  const widthTextLocal = formatValueForPlan(actualWidth, isMetric);
  svg += '<line x1="' + dimX2 + '" y1="' + cornerY + '" x2="' + dimX2 + '" y2="' + r(cornerY + L) + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + (dimX2 + 5) + '" y="' + r(cornerY + L/2 + 4) + '" style="font:10px Arial;fill:#333;">' + widthTextLocal + '</text>';
  
  } else if (isRadiatingAtExtremity && radiatingAtStart) {
  // Marches rayonnantes au DEBUT (tournant a l'entree)
  // Configuration: entree horizontale dans le carre rayonnant, puis montee verticale
  const treadW2_exact = flight2Treads > 0 ? stairW2_plan / flight2Treads : stairW2_plan;
  const cornerX = planStartX;
  const cornerY = r(planStartY + stairW2_plan);
  
  // Zone marches rayonnantes (carre en bas a gauche)
  svg += '<rect x="' + cornerX + '" y="' + cornerY + '" width="' + L + '" height="' + L + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Lignes rayonnantes depuis le pivot (coin superieur gauche du carre)
  const pivotX = cornerX;
  const pivotY = cornerY;
  if (numRadSteps === 2) {
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(pivotX + L) + '" y2="' + r(pivotY + L) + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">2×45°</text>';
  } else {
   const endX30 = r(pivotX + L);
   const endY30 = r(pivotY + L * Math.tan(Math.PI/6));
   const endX60 = r(pivotX + L / Math.tan(Math.PI/3));
   const endY60 = r(pivotY + L);
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX30 + '" y2="' + endY30 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX60 + '" y2="' + endY60 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">3×30°</text>';
  }
  
  // Volee 2 (verticale) - au-dessus du carre rayonnant
  if (flight2Treads > 0) {
   svg += '<rect x="' + cornerX + '" y="' + planStartY + '" width="' + stairWidth_plan + '" height="' + stairW2_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   
   for (let i = 1; i <= flight2Treads; i++) {
    const lineY = r(planStartY + stairW2_plan - i * treadW2_exact);
    svg += '<line x1="' + cornerX + '" y1="' + lineY + '" x2="' + r(cornerX + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="' + (i === 1 || i === flight2Treads ? '2' : '1') + '"/>';
   }
   
   // Numerotation volee 2 - SUR les marches (au centre)
   const markerX_v2 = r(cornerX + stairWidth_plan/2);
   svg += '<text x="' + markerX_v2 + '" y="' + r(planStartY + stairW2_plan - treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (numRadSteps + 1) + '</text>';
   svg += '<text x="' + markerX_v2 + '" y="' + r(planStartY + treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
  }
  
  // Fleche de montee avec VIRAGE A 90 DEGRES
  // Part de l'exterieur a DROITE du carre, entre horizontalement, tourne, puis monte
  const arrowStartX = r(cornerX + L + 8); // Depart a l'EXTERIEUR (a droite du carre)
  const arrowStartY = r(cornerY + L/2); // Centre vertical du carre
  const arrowCornerX = r(cornerX + stairWidth_plan/2); // Point de virage (centre horizontal)
  const arrowEndY = r(planStartY); // Fin a la derniere contremarche
  
  // Segment horizontal (de l'exterieur vers le centre du carre)
  svg += '<line x1="' + arrowStartX + '" y1="' + arrowStartY + '" x2="' + arrowCornerX + '" y2="' + arrowStartY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment de virage dans le carre (du centre vers le haut du carre)
  svg += '<line x1="' + arrowCornerX + '" y1="' + arrowStartY + '" x2="' + arrowCornerX + '" y2="' + r(cornerY) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment vertical avec fleche (du haut du carre jusqu'a la derniere CM)
  svg += '<line x1="' + arrowCornerX + '" y1="' + r(cornerY) + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrLMontee)"/>';
  
  // "En haut" centré avec le centre de la volée de départ
  svg += '<text x="' + r(arrowStartX) + '" y="' + r(arrowStartY - 8) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
  
  // Cotations - hauteur totale (volee 2 + carre rayonnant)
  const dimX2 = r(cornerX + stairWidth_plan + 25);
  const totalHeight = secondFlightRun + actualWidth; // girons + largeur du carre
  const run2Text = formatValueForPlan(totalHeight, isMetric);
  svg += '<line x1="' + dimX2 + '" y1="' + planStartY + '" x2="' + dimX2 + '" y2="' + r(cornerY + L) + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + (dimX2 + 5) + '" y="' + r((planStartY + cornerY + L)/2 + 4) + '" style="font:10px Arial;fill:#333;">' + run2Text + '</text>';
  
  // Annotation girons rectangulaires
  if (flight2Treads > 0) {
   svg += '<text x="' + r(cornerX + stairWidth_plan + 5) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;">' + flight2Treads + ' girons rectangulaires</text>';
  }
  
  // Cotation largeur (en bas du carre)
  const dimY1 = r(cornerY + L + 15);
  const widthTextLocal = formatValueForPlan(actualWidth, isMetric);
  svg += '<line x1="' + cornerX + '" y1="' + dimY1 + '" x2="' + r(cornerX + L) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + r(cornerX + L/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + widthTextLocal + '</text>';
  
  } else {
  // CAS STANDARD: Marches rayonnantes a l'intersection
  const cornerX = r(planStartX + stairW1_plan);
  const cornerY = r(planStartY + stairW2_plan);
  const treadW1_exact = flight1Treads > 0 ? stairW1_plan / flight1Treads : stairW1_plan;
  const treadW2_exact = flight2Treads > 0 ? stairW2_plan / flight2Treads : stairW2_plan;
  
  // Volee 1 (horizontale)
  svg += '<rect x="' + planStartX + '" y="' + r(planStartY + stairW2_plan) + '" width="' + stairW1_plan + '" height="' + stairWidth_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons volée 1 - épaisseur uniforme de 1.5
  for (let i = 1; i <= flight1Treads; i++) {
   const lineX = r(planStartX + i * treadW1_exact);
   svg += '<line x1="' + lineX + '" y1="' + r(planStartY + stairW2_plan) + '" x2="' + lineX + '" y2="' + r(planStartY + stairW2_plan + stairWidth_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numerotation volee 1 - décalée vers le bas pour éviter conflit avec la flèche
  const markerY_v1m = r(planStartY + stairW2_plan + stairWidth_plan * 0.75 + 3);
  svg += '<text x="' + r(planStartX + treadW1_exact/2) + '" y="' + markerY_v1m + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
  svg += '<text x="' + r(planStartX + stairW1_plan - treadW1_exact/2) + '" y="' + markerY_v1m + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + flight1Treads + '</text>';
  
  // Zone marches rayonnantes (coin)
  svg += '<rect x="' + cornerX + '" y="' + cornerY + '" width="' + L + '" height="' + L + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Lignes rayonnantes
  const pivotX = cornerX;
  const pivotY = cornerY;
  if (numRadSteps === 2) {
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(pivotX + L) + '" y2="' + r(pivotY + L) + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">2×45°</text>';
  } else {
   const endX30 = r(pivotX + L);
   const endY30 = r(pivotY + L * Math.tan(Math.PI/6));
   const endX60 = r(pivotX + L / Math.tan(Math.PI/3));
   const endY60 = r(pivotY + L);
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX30 + '" y2="' + endY30 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + endX60 + '" y2="' + endY60 + '" stroke="#e65100" stroke-width="2"/>';
   svg += '<text x="' + r(cornerX + L/2 - 5) + '" y="' + r(cornerY + L/2 + 14) + '" style="font:bold 10px Arial;fill:#e65100;" text-anchor="middle">3×30°</text>';
  }
  
  // Volee 2 (verticale)
  svg += '<rect x="' + cornerX + '" y="' + planStartY + '" width="' + stairWidth_plan + '" height="' + stairW2_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons volée 2 - épaisseur uniforme de 1.5
  for (let i = 1; i <= flight2Treads; i++) {
   const lineY = r(planStartY + stairW2_plan - i * treadW2_exact);
   svg += '<line x1="' + cornerX + '" y1="' + lineY + '" x2="' + r(cornerX + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numerotation volee 2 - décalée vers la droite pour éviter conflit avec la flèche
  const startNum2 = flight1Treads + numRadSteps + 1;
  const markerX_v2m = r(cornerX + stairWidth_plan * 0.75);
  svg += '<text x="' + markerX_v2m + '" y="' + r(planStartY + stairW2_plan - treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + startNum2 + '</text>';
  svg += '<text x="' + markerX_v2m + '" y="' + r(planStartY + treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
  
  // Fleche de montee (une seule volee continue) - virage a 90 degres
  const arrow1Y = r(planStartY + stairW2_plan + stairWidth_plan/2);
  const arrowCornerX = r(cornerX + stairWidth_plan/2);
  const arrowStartX = r(planStartX); // Depart a la 1ere CM (bord gauche de l'escalier)
  const arrowEndY = r(planStartY); // Fin a la derniere contremarche
  
  // Segment horizontal
  svg += '<line x1="' + arrowStartX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrow1Y + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment dans le coin (traverse le carre rayonnant)
  svg += '<line x1="' + arrowCornerX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + r(cornerY) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment vertical avec fleche
  svg += '<line x1="' + arrowCornerX + '" y1="' + r(cornerY) + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrLMontee)"/>';
  
  // "En haut" centré avec le centre de la volée de départ
  svg += '<text x="' + r(planStartX - 5) + '" y="' + (arrow1Y + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
  
  // Cotations
  const dimY1 = r(planStartY + stairW2_plan + stairWidth_plan + 25);
  const run1Text = formatValueForPlan(firstFlightRun || flight1Run, isMetric);
  svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(cornerX + stairWidth_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + r((planStartX + cornerX + stairWidth_plan)/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + run1Text + '</text>';
  
  const dimX2 = r(cornerX + stairWidth_plan + 25);
  const run2Text = formatValueForPlan(secondFlightRun || flight2Run, isMetric);
  svg += '<line x1="' + dimX2 + '" y1="' + planStartY + '" x2="' + dimX2 + '" y2="' + r(cornerY + stairWidth_plan) + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
  svg += '<text x="' + (dimX2 + 5) + '" y="' + r((planStartY + cornerY + stairWidth_plan)/2 + 4) + '" style="font:10px Arial;fill:#333;">' + run2Text + '</text>';
  
  // Annotations girons rectangulaires - bien positionnées
  svg += '<text x="' + r(planStartX + stairW1_plan/2) + '" y="' + r(planStartY + stairW2_plan - 8) + '" style="font:9px Arial;fill:#666;" text-anchor="middle">' + flight1Treads + ' girons rectangulaires</text>';
  svg += '<text x="' + r(cornerX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(cornerX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
  }
 }
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = isLanding ? 75 : 68;
 const cellH = 16;
 const cols = isLanding ? 5 : 5;
 
 // Fond du tableau
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
 
 // En-têtes
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">CM</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Giron</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
 if (isLanding) {
  svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Palier</text>';
 } else {
  svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Marche ray.</text>';
 }
 
 // Ligne séparatrice
 svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
 
 // Valeurs
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' × ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' × ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
 if (isLanding) {
  svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + formatValueForPlan(actualLanding, isMetric) + '</text>';
 } else {
  svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRadSteps + '×' + (numRadSteps === 2 ? '45°' : '30°') + '</text>';
 }
 
 svg += '</svg>';
 return svg;
}


/**
 * Génère une visualisation SVG d'un escalier en U avec palier (vue en plan uniquement)
 * Configuration: 2 volées parallèles reliées par un palier de retournement (180°)
 * Supporte les configurations avec ou sans espace entre les volées
 */
function generateUShapedStairVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  treadDepth,
  totalRise,
  stairWidth,
  isMetric,
  uShapedConfig,
  flight1Run,
  flight2Run,
  flight3Run,
  landingWidth,
  landingDepth,
  spaceBetweenFlights,
  treadsInFlight1,
  treadsInFlight2
 } = stairData;
 
 const r = (n) => Math.round(n * 10) / 10;
 
 // Dimensions du SVG
 const W = 680, H = 495;
 
 // Formatage des dimensions
 const riseText = formatValueForPlan(totalRise, isMetric);
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(treadDepth, isMetric);
 const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
 
 const actualWidth = stairWidth || 914;
 // flight1 = 1er segment vertical complet, flight2 = segment horizontal (palier), flight3 = dernier segment vertical complet
 const actualFlight1Run = flight1Run || (treadsInFlight1 * treadDepth);
 const actualFlight3Run = flight3Run || flight1Run || (treadsInFlight2 * treadDepth);
 const actualLandingDepth = landingDepth || actualWidth;
 const actualLandingWidth = landingWidth || flight2Run || (2 * actualWidth);
 const actualSpaceBetween = spaceBetweenFlights || Math.max(0, actualLandingWidth - (2 * actualWidth));
 
 // Longueur des girons = segment vertical - profondeur palier
 const flight1GironsRun = Math.max(0, actualFlight1Run - actualLandingDepth);
 const flight3GironsRun = Math.max(0, actualFlight3Run - actualLandingDepth);
 
 // Calculer le nombre de girons par volée si non fourni
 const flight1Treads = treadsInFlight1 || Math.floor(numTreads / 2);
 const flight2Treads = treadsInFlight2 || (numTreads - flight1Treads);
 
 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs flèches
 svg += '<defs>';
 svg += '<marker id="arrUS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrUE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrUMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // ========== VUE EN PLAN ==========
 const margin = { left: 70, right: 70, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Titre avec fond
 const titleText = 'VUE EN PLAN - Escalier en U (2 volées + palier)';
 svg += '<rect x="' + (W/2 - 155) + '" y="8" width="310" height="26" fill="#e8f5e9" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
 
 // Calculer l'échelle pour occuper l'espace disponible
 const totalPlanWidth = actualLandingWidth;
 const maxFlightRun = Math.max(actualFlight1Run, actualFlight3Run);
 const scalePlan = Math.min(planW / totalPlanWidth, planH / maxFlightRun) * 0.75;
 
 const stairWidth_plan = r(actualWidth * scalePlan);
 const landingDepth_plan = r(actualLandingDepth * scalePlan);
 const spaceBetween_plan = r(actualSpaceBetween * scalePlan);
 
 // Profondeur de giron uniforme en pixels (basée sur la profondeur réelle du calcul)
 // CRITIQUE: Tous les girons doivent avoir la même profondeur (CNB)
 const treadDepth_plan = r(treadDepth * scalePlan);
 
 // IMPORTANT: Les dimensions des volées sont calculées à  partir du nombre de girons × profondeur uniforme
 // Ceci garantit que les rectangles correspondent exactement aux girons tracés
 const flight1Run_plan = r(flight1Treads * treadDepth_plan);
 const flight2Run_plan = r(flight2Treads * treadDepth_plan);
 
 // Position de départ centrée
 const totalW_plan = (2 * stairWidth_plan) + spaceBetween_plan;
 const totalH_plan = Math.max(flight1Run_plan, flight2Run_plan) + landingDepth_plan;
 const planStartX = r(margin.left + (planW - totalW_plan) / 2);
 const planStartY = r(margin.top + (planH - totalH_plan) / 2);
 
 // ===== VOLÉE 1 (gauche, monte de bas vers haut) =====
 const flight1X = planStartX;
 const flight1Y = r(planStartY + landingDepth_plan);
 svg += '<rect x="' + flight1X + '" y="' + flight1Y + '" width="' + stairWidth_plan + '" height="' + flight1Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
 
 // Lignes des girons volée 1 (horizontales) - UTILISER treadDepth_plan pour uniformité avec volée 2
 // IMPORTANT: Utiliser une épaisseur uniforme de 1.5 pour toutes les lignes de contremarche
 if (flight1Treads > 0) {
  for (let i = 1; i <= flight1Treads; i++) {
  // Position Y: du bas vers le haut, chaque giron a la Mà… ME profondeur que dans volée 2
  const lineY = r(flight1Y + flight1Run_plan - (i * treadDepth_plan));
  svg += '<line x1="' + flight1X + '" y1="' + lineY + '" x2="' + r(flight1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numérotation volée 1 - décalée vers l'extérieur (côté gauche) pour éviter conflit avec la flèche
  // Marche 1: en bas
  const tread1CenterY = r(flight1Y + flight1Run_plan - treadDepth_plan/2);
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(tread1CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
  // Dernière marche de V1: en haut
  const treadLastV1CenterY = r(flight1Y + treadDepth_plan/2);
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(treadLastV1CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + flight1Treads + '</text>';
  
  // Annotation nombre de girons rectangulaires volée 1 (sur le côté gauche, rotation -90)
  svg += '<text x="' + r(flight1X - 8) + '" y="' + r(flight1Y + flight1Run_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight1X - 8) + ' ' + r(flight1Y + flight1Run_plan/2) + ')">' + flight1Treads + ' girons rectangulaires</text>';
 }
 
 // ===== PALIER (rectangulaire en haut, reliant les 2 volées) =====
 const landingX = planStartX;
 const landingY = planStartY;
 const landingW = totalW_plan;
 const landingH = landingDepth_plan;
 svg += '<rect x="' + landingX + '" y="' + landingY + '" width="' + landingW + '" height="' + landingH + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
 // Numéro du palier - décalé vers le coin sup. gauche pour éviter conflit avec la flèche
 svg += '<text x="' + r(landingX + landingW * 0.07) + '" y="' + r(landingY + landingH * 0.32 + 4) + '" style="font:bold 9px Arial;fill:#f57f17;" text-anchor="middle">' + (flight1Treads + 1) + '</text>';
 // Mot "Palier" au centre mais légèrement au-dessus de la ligne de flèche
 svg += '<text x="' + r(landingX + landingW/2) + '" y="' + r(landingY + landingH * 0.28 + 4) + '" style="font:italic 11px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
 
 // ===== VOLÉE 2 (droite, descend de haut vers bas = sens opposé à  volée 1) =====
 const flight2X = r(planStartX + stairWidth_plan + spaceBetween_plan);
 const flight2Y = r(planStartY + landingDepth_plan);
 svg += '<rect x="' + flight2X + '" y="' + flight2Y + '" width="' + stairWidth_plan + '" height="' + flight2Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
 
 // Lignes des girons volée 2 (horizontales) - UTILISER treadDepth_plan pour uniformité
 if (flight2Treads > 0) {
  for (let i = 1; i <= flight2Treads; i++) {
  // Position Y: depuis le haut, même profondeur que volée 1
  const lineY = r(flight2Y + ((i - 1) * treadDepth_plan));
  svg += '<line x1="' + flight2X + '" y1="' + lineY + '" x2="' + r(flight2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numérotation volée 2 - décalée vers l'extérieur (côté droit)
  // NUMÉROTATION CONTINUE: Volée 1 (1 à  flight1Treads) + Palier (flight1Treads+1) + Volée 2 (flight1Treads+2 à  numTreads+1)
  const treadFirstV2CenterY = r(flight2Y + treadDepth_plan/2);
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadFirstV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (flight1Treads + 2) + '</text>';
  const treadLastV2CenterY = r(flight2Y + flight2Run_plan - treadDepth_plan/2);
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadLastV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (numTreads + 1) + '</text>';
  
  // Annotation nombre de girons rectangulaires volée 2 - Mà… ME DIRECTION que volée 1 (rotation -90)
  svg += '<text x="' + r(flight2X + stairWidth_plan + 8) + '" y="' + r(flight2Y + flight2Run_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight2X + stairWidth_plan + 8) + ' ' + r(flight2Y + flight2Run_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
 }
 
 // ===== ESPACE ENTRE LES VOLÉES (si applicable) =====
 if (actualSpaceBetween > 0) {
  // Dessiner une ligne pointillée ou un indicateur de l'espace
  const spaceX = r(flight1X + stairWidth_plan);
  svg += '<rect x="' + spaceX + '" y="' + flight1Y + '" width="' + spaceBetween_plan + '" height="' + Math.max(flight1Run_plan, flight2Run_plan) + '" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="4,2"/>';
 }
 
 // ===== FLàˆCHE DE MONTÉE =====
 const arrowX1 = r(flight1X + stairWidth_plan/2);
 const arrowY1Start = r(flight1Y + flight1Run_plan);
 const arrowY1End = r(flight1Y);
 
 const arrowX2 = r(flight2X + stairWidth_plan/2);
 const arrowY2Start = r(landingY + landingH);
 const arrowY2End = r(flight2Y + flight2Run_plan);
 
 // Segment 1: Monte dans la volée 1
 svg += '<line x1="' + arrowX1 + '" y1="' + arrowY1Start + '" x2="' + arrowX1 + '" y2="' + arrowY1End + '" stroke="#1b5e20" stroke-width="1.5"/>';
 
 // Connecteur volée 1 -> palier
 svg += '<line x1="' + arrowX1 + '" y1="' + arrowY1End + '" x2="' + arrowX1 + '" y2="' + r(landingY + landingH/2) + '" stroke="#1b5e20" stroke-width="1.5"/>';
 
 // Segment 2: Traverse le palier horizontalement
 svg += '<line x1="' + arrowX1 + '" y1="' + r(landingY + landingH/2) + '" x2="' + arrowX2 + '" y2="' + r(landingY + landingH/2) + '" stroke="#1b5e20" stroke-width="1.5"/>';
 
 // Connecteur palier -> volée 2
 svg += '<line x1="' + arrowX2 + '" y1="' + r(landingY + landingH/2) + '" x2="' + arrowX2 + '" y2="' + arrowY2Start + '" stroke="#1b5e20" stroke-width="1.5"/>';
 
 // Segment 3: Descend dans la volée 2 avec flèche
 svg += '<line x1="' + arrowX2 + '" y1="' + arrowY2Start + '" x2="' + arrowX2 + '" y2="' + arrowY2End + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrUMontee)"/>';
 
 // "En haut" centré sous la volée 1 (entrée de l'escalier)
 svg += '<text x="' + arrowX1 + '" y="' + r(arrowY1Start + 14) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
 
 // ===== COTATIONS =====
 // Calculer les centres exacts des lignes de cote pour un centrage précis
 const leftDimStart = planStartY;
 const leftDimEnd = r(flight1Y + flight1Run_plan);
 const leftDimCenter = r((leftDimStart + leftDimEnd) / 2);
 
 // Cotation UNIQUE côté gauche (volée 1 + palier) - suppression de la cote droite redondante
 const dimX1 = r(flight1X - 30);
 const totalLeft = actualFlight1Run + actualLandingDepth;
 const totalLeftText = formatValueForPlan(totalLeft, isMetric);
 svg += '<line x1="' + dimX1 + '" y1="' + leftDimStart + '" x2="' + dimX1 + '" y2="' + leftDimEnd + '" stroke="#555" stroke-width="1" marker-start="url(#arrUS)" marker-end="url(#arrUE)"/>';
 svg += '<text x="' + (dimX1 - 5) + '" y="' + leftDimCenter + '" style="font:10px Arial;fill:#333;" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ' + (dimX1 - 5) + ' ' + leftDimCenter + ')">' + totalLeftText + '</text>';
 
 // Cotation largeur totale (en bas)
 const dimY1 = r(flight1Y + Math.max(flight1Run_plan, flight2Run_plan) + 20);
 const totalWidthText = formatValueForPlan(actualLandingWidth, isMetric);
 svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(planStartX + totalW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrUS)" marker-end="url(#arrUE)"/>';
 svg += '<text x="' + r(planStartX + totalW_plan/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalWidthText + '</text>';
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = 80;
 const cellH = 16;
 const cols = 5;
 const landingDepthText = formatValueForPlan(actualLandingDepth, isMetric);
 
 // Fond du tableau
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
 
 // En-têtes
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">CM</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Giron</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Palier</text>';
 
 // Ligne séparatrice
 svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
 
 // Valeurs
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' × ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' × ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + landingDepthText + '</text>';
 
 svg += '</svg>';
 return svg;
}


/**
 * Génère une visualisation SVG d'un escalier en U avec marches rayonnantes (vue en plan)
 * Configuration: 2 volées droites + 2 coins de marches rayonnantes (90° chacun = 180° total)
 * Conforme au CNB 9.8.4.6: marches rayonnantes à  30° ou 45°, max 90° par série
 */
function generateUShapedRadiatingVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  treadDepth,
  totalRise,
  stairWidth,
  isMetric,
  flight1Run,
  flight2Run,
  landingWidth,
  landingDepth,
  radiatingAngle = 45
 } = stairData;
 
 const r = (n) => Math.round(n * 10) / 10;
 
 // Dimensions du SVG
 const W = 680, H = 495;
 
 // Formatage des dimensions
 const riseText = formatValueForPlan(totalRise, isMetric);
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(treadDepth, isMetric);
 const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
 
 const actualWidth = stairWidth || 914;
 const actualFlight1Run = flight1Run || 2000;
 const actualFlight2Run = flight2Run || 2000;
 const actualLandingWidth = landingWidth || (2 * actualWidth);
 
 // Configuration des marches rayonnantes selon CNB 9.8.4.6
 // Pour 180°, on a besoin de 2 séries de 90° chacune
 const stepsPerCorner = radiatingAngle === 30 ? 3 : 2;
 const totalRadiatingSteps = stepsPerCorner * 2; // 4 marches (45°) ou 6 marches (30°)
 
 // Calcul des girons rectangulaires basé sur les longueurs réelles des parties
 // Si les longueurs sont différentes, répartir proportionnellement
 const totalRectRun = actualFlight1Run + actualFlight2Run;
 const numRectTreads = Math.max(0, numTreads - totalRadiatingSteps);
 
 // Répartition des girons selon les longueurs des parties
 let flight1RectTreads, flight2RectTreads;
 if (totalRectRun > 0 && numRectTreads > 0) {
  const ratio1 = actualFlight1Run / totalRectRun;
  flight1RectTreads = Math.round(numRectTreads * ratio1);
  flight2RectTreads = numRectTreads - flight1RectTreads;
  // S'assurer qu'au moins 1 giron par partie si la longueur > 0
  if (flight1RectTreads === 0 && actualFlight1Run > 0) {
  flight1RectTreads = 1;
  flight2RectTreads = numRectTreads - 1;
  }
  if (flight2RectTreads === 0 && actualFlight2Run > 0) {
  flight2RectTreads = 1;
  flight1RectTreads = numRectTreads - 1;
  }
 } else {
  flight1RectTreads = Math.ceil(numRectTreads / 2);
  flight2RectTreads = numRectTreads - flight1RectTreads;
 }
 
 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs flèches
 svg += '<defs>';
 svg += '<marker id="arrURS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrURE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrURMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // ========== VUE EN PLAN ==========
 const margin = { left: 70, right: 70, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Titre avec fond
 const titleText = 'VUE EN PLAN - Escalier en U (marches rayonnantes)';
 svg += '<rect x="' + (W/2 - 165) + '" y="8" width="330" height="26" fill="#e8f5e9" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
 
 // Calculer l'échelle pour occuper l'espace disponible
 const totalPlanWidth = actualLandingWidth;
 const maxFlightRun = Math.max(actualFlight1Run, actualFlight2Run);
 const totalPlanHeight = maxFlightRun + actualWidth;
 const scalePlan = Math.min(planW / totalPlanWidth, planH / totalPlanHeight) * 0.75;
 
 const stairWidth_plan = r(actualWidth * scalePlan);
 // Configuration avec marches rayonnantes: les deux coins sont ADJACENTS (pas d'espace)
 // Un espace correspondrait à  un palier, ce qui est une autre configuration
 const spaceBetween = 0;
 const spaceBetween_plan = 0;
 
 // Longueurs des parties basées sur les valeurs RÉELLES entrées par l'utilisateur
 const flight1Run_plan = r(actualFlight1Run * scalePlan);
 const flight2Run_plan = r(actualFlight2Run * scalePlan);
 
 // CNB 9.8.4.4.(3) et 9.8.4.5.(1): Dans une même volée, le giron doit être UNIFORME
 // Pour cette configuration sans palier = UNE SEULE VOLÉE
 // Donc TOUS les girons rectangulaires ont la Mà… ME profondeur (treadDepth calculé globalement)
 const uniformTreadDepth = treadDepth; // Giron uniforme calculé par le calculateur
 const uniformTreadDepth_plan = r(uniformTreadDepth * scalePlan);
 
 // Répartition des girons rectangulaires entre les deux parties
 // basée sur les longueurs entrées par l'utilisateur
 // Note: totalRectRun et numRectTreads déjà  calculés plus haut
 
 // Calculer la proportion de girons pour chaque partie
 let flight1RectTreadsCalc, flight2RectTreadsCalc;
 if (totalRectRun > 0 && numRectTreads > 0) {
  const ratio1 = actualFlight1Run / totalRectRun;
  flight1RectTreadsCalc = Math.round(numRectTreads * ratio1);
  flight2RectTreadsCalc = numRectTreads - flight1RectTreadsCalc;
  
  // S'assurer qu'au moins 1 giron par partie si longueur > 0
  if (flight1RectTreadsCalc <= 0 && actualFlight1Run > 0) {
  flight1RectTreadsCalc = 1;
  flight2RectTreadsCalc = numRectTreads - 1;
  }
  if (flight2RectTreadsCalc <= 0 && actualFlight2Run > 0) {
  flight2RectTreadsCalc = 1;
  flight1RectTreadsCalc = numRectTreads - 1;
  }
 } else {
  flight1RectTreadsCalc = Math.ceil(numRectTreads / 2);
  flight2RectTreadsCalc = numRectTreads - flight1RectTreadsCalc;
 }
 
 // IMPORTANT: Les dimensions VISUELLES doivent correspondre au giron uniforme
 // pour que les lignes de contremarche soient correctement espacées
 const flight1Run_visual = r(flight1RectTreadsCalc * uniformTreadDepth_plan);
 const flight2Run_visual = r(flight2RectTreadsCalc * uniformTreadDepth_plan);
 
 // Position de départ centrée
 // Utiliser les dimensions visuelles (basées sur giron uniforme) pour le centrage
 const totalW_plan = (2 * stairWidth_plan); // Deux coins adjacents
 const totalH_plan = Math.max(flight1Run_visual, flight2Run_visual) + stairWidth_plan;
 const planStartX = r(margin.left + (planW - totalW_plan) / 2);
 const planStartY = r(margin.top + (planH - totalH_plan) / 2);
 
 // ===== PARTIE 1 (gauche, monte de bas vers haut) =====
 const flight1X = planStartX;
 const flight1Y = r(planStartY + stairWidth_plan);
 
 if (flight1RectTreadsCalc > 0) {
  // Hauteur du rectangle = nombre de girons × giron uniforme (pour cohérence visuelle)
  svg += '<rect x="' + flight1X + '" y="' + flight1Y + '" width="' + stairWidth_plan + '" height="' + flight1Run_visual + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons partie 1 - CNB 9.8.4.4.(3): giron UNIFORME
  for (let i = 1; i <= flight1RectTreadsCalc; i++) {
  const lineY = r(flight1Y + flight1Run_visual - (i * uniformTreadDepth_plan));
  svg += '<line x1="' + flight1X + '" y1="' + lineY + '" x2="' + r(flight1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numérotation partie 1
  const tread1CenterY = r(flight1Y + flight1Run_visual - uniformTreadDepth_plan/2);
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(tread1CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
  const treadLastV1CenterY = r(flight1Y + uniformTreadDepth_plan/2);
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(treadLastV1CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + flight1RectTreadsCalc + '</text>';
  
  // Annotation nombre de girons rectangulaires partie 1
  svg += '<text x="' + r(flight1X - 8) + '" y="' + r(flight1Y + flight1Run_visual/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight1X - 8) + ' ' + r(flight1Y + flight1Run_visual/2) + ')">' + flight1RectTreadsCalc + ' girons rect.</text>';
 }
 
 // ===== COIN 1 - MARCHES RAYONNANTES (haut-gauche) =====
 const corner1X = planStartX;
 const corner1Y = planStartY;
 
 svg += '<rect x="' + corner1X + '" y="' + corner1Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
 
 // ===== COIN 2 - MARCHES RAYONNANTES (haut-droite, ADJACENT) =====
 const corner2X = r(corner1X + stairWidth_plan); // Adjacent, pas d'espace
 const corner2Y = planStartY;
 
 svg += '<rect x="' + corner2X + '" y="' + corner2Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
 
 // ===== LIGNES RAYONNANTES - PIVOT AU POINT D'INTERSECTION =====
 // Les deux coins étant adjacents, le pivot est à  leur intersection
 const pivotX = corner2X; // = corner1X + stairWidth_plan
 const pivotY = r(corner1Y + stairWidth_plan);
 
 // COIN 1: Lignes de 180° (gauche) à  90° (haut)
 for (let i = 0; i <= stepsPerCorner; i++) {
  const angle = Math.PI - (i * (Math.PI / 2) / stepsPerCorner);
  let x2, y2;
  
  if (i === 0) {
  x2 = corner1X;
  y2 = pivotY;
  } else if (i === stepsPerCorner) {
  x2 = pivotX;
  y2 = corner1Y;
  } else {
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  const tLeft = (corner1X - pivotX) / dx;
  const tTop = (corner1Y - pivotY) / dy;
  
  if (tLeft > 0 && (tTop <= 0 || tLeft < tTop)) {
   x2 = corner1X;
   y2 = pivotY + tLeft * dy;
  } else {
   x2 = pivotX + tTop * dx;
   y2 = corner1Y;
  }
  }
  svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
 }
 
 // COIN 2: Lignes de 90° (haut) à  0° (droite) - la ligne à  90° est déjà  tracée
 for (let i = 1; i <= stepsPerCorner; i++) {
  const angle = (Math.PI / 2) - (i * (Math.PI / 2) / stepsPerCorner);
  let x2, y2;
  
  if (i === stepsPerCorner) {
  x2 = corner2X + stairWidth_plan;
  y2 = pivotY;
  } else {
  const dx = Math.cos(angle);
  const dy = -Math.sin(angle);
  const tRight = (corner2X + stairWidth_plan - pivotX) / dx;
  const tTop = (corner2Y - pivotY) / dy;
  
  if (tTop > 0 && (tRight <= 0 || tTop < tRight)) {
   x2 = pivotX + tTop * dx;
   y2 = corner2Y;
  } else {
   x2 = corner2X + stairWidth_plan;
   y2 = pivotY + tRight * dy;
  }
  }
  svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
 }
 
 // Annotations des coins rayonnants
 const radStart1 = flight1RectTreadsCalc + 1;
 const radEnd1 = flight1RectTreadsCalc + stepsPerCorner;
 svg += '<text x="' + r(corner1X + stairWidth_plan * 0.35) + '" y="' + r(corner1Y + stairWidth_plan * 0.35) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
 svg += '<text x="' + r(corner1X + stairWidth_plan * 0.35) + '" y="' + r(corner1Y + stairWidth_plan * 0.55) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + radStart1 + '-' + radEnd1 + '</text>';
 
 const radStart2 = flight1RectTreadsCalc + stepsPerCorner + 1;
 const radEnd2 = flight1RectTreadsCalc + totalRadiatingSteps;
 svg += '<text x="' + r(corner2X + stairWidth_plan * 0.65) + '" y="' + r(corner2Y + stairWidth_plan * 0.35) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
 svg += '<text x="' + r(corner2X + stairWidth_plan * 0.65) + '" y="' + r(corner2Y + stairWidth_plan * 0.55) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + radStart2 + '-' + radEnd2 + '</text>';
 
 // ===== PARTIE 2 (droite, descend de haut vers bas) =====
 const flight2X = corner2X;
 const flight2Y = r(planStartY + stairWidth_plan);
 
 if (flight2RectTreadsCalc > 0) {
  // Hauteur du rectangle = nombre de girons × giron uniforme
  svg += '<rect x="' + flight2X + '" y="' + flight2Y + '" width="' + stairWidth_plan + '" height="' + flight2Run_visual + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  
  // Lignes des girons partie 2 - CNB 9.8.4.4.(3): giron UNIFORME
  for (let i = 1; i <= flight2RectTreadsCalc; i++) {
  const lineY = r(flight2Y + ((i - 1) * uniformTreadDepth_plan));
  svg += '<line x1="' + flight2X + '" y1="' + lineY + '" x2="' + r(flight2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  
  // Numérotation partie 2
  const startNum2 = flight1RectTreadsCalc + totalRadiatingSteps + 1;
  const treadFirstV2CenterY = r(flight2Y + uniformTreadDepth_plan/2);
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadFirstV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + startNum2 + '</text>';
  const treadLastV2CenterY = r(flight2Y + flight2Run_visual - uniformTreadDepth_plan/2);
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadLastV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
  
  // Annotation nombre de girons rectangulaires partie 2
  svg += '<text x="' + r(flight2X + stairWidth_plan + 8) + '" y="' + r(flight2Y + flight2Run_visual/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight2X + stairWidth_plan + 8) + ' ' + r(flight2Y + flight2Run_visual/2) + ')">' + flight2RectTreadsCalc + ' girons rect.</text>';
 }
 
 // ===== FLàˆCHE DE DIRECTION (MONTÉE) =====
 const arrowX1 = r(flight1X + stairWidth_plan / 2);
 const arrowX2 = r(flight2X + stairWidth_plan / 2);
 // Les flèches doivent démarrer exactement à  la première contremarche et finir à  la dernière
 const arrowY1Start = r(flight1Y + flight1Run_visual); // Bord du bas (1ère CM)
 const arrowY1End = r(flight1Y);     // Bord du haut
 const arrowY2Start = r(flight2Y);     // Bord du haut
 const arrowY2End = r(flight2Y + flight2Run_visual);  // Bord du bas (dernière CM)
 
 // Segment 1: Monte dans la partie 1
 if (flight1Run_visual > 0) {
  svg += '<line x1="' + arrowX1 + '" y1="' + arrowY1Start + '" x2="' + arrowX1 + '" y2="' + arrowY1End + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + arrowX1 + '" y1="' + arrowY1End + '" x2="' + arrowX1 + '" y2="' + r(corner1Y + stairWidth_plan * 0.7) + '" stroke="#1b5e20" stroke-width="1.5"/>';
 }
 
 // Segment horizontal (traverse les coins)
 const arrowHorizY = r(corner1Y + stairWidth_plan * 0.7);
 svg += '<line x1="' + arrowX1 + '" y1="' + arrowHorizY + '" x2="' + arrowX2 + '" y2="' + arrowHorizY + '" stroke="#1b5e20" stroke-width="1.5"/>';
 
 // Segment: Descend vers partie 2
 if (flight2Run_visual > 0) {
  svg += '<line x1="' + arrowX2 + '" y1="' + arrowHorizY + '" x2="' + arrowX2 + '" y2="' + arrowY2Start + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + arrowX2 + '" y1="' + arrowY2Start + '" x2="' + arrowX2 + '" y2="' + arrowY2End + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrURMontee)"/>';
 }
 
 // "En haut" centré sous la partie 1 (entrée)
 svg += '<text x="' + arrowX1 + '" y="' + r(arrowY1Start + 14) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
 
 // ===== COTATIONS =====
 // Cotation côté gauche (hauteur totale)
 const leftDimStart = planStartY;
 const leftDimEnd = r(flight1Y + flight1Run_visual);
 const leftDimCenter = r((leftDimStart + leftDimEnd) / 2);
 
 const dimX1 = r(flight1X - 30);
 // Afficher la dimension réelle (giron uniforme × nombre de girons + largeur)
 const totalLeftReal = (flight1RectTreadsCalc * uniformTreadDepth) + actualWidth;
 const totalLeftText = formatValueForPlan(totalLeftReal, isMetric);
 svg += '<line x1="' + dimX1 + '" y1="' + leftDimStart + '" x2="' + dimX1 + '" y2="' + leftDimEnd + '" stroke="#555" stroke-width="1" marker-start="url(#arrURS)" marker-end="url(#arrURE)"/>';
 svg += '<text x="' + (dimX1 - 5) + '" y="' + leftDimCenter + '" style="font:10px Arial;fill:#333;" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ' + (dimX1 - 5) + ' ' + leftDimCenter + ')">' + totalLeftText + '</text>';
 
 // Cotation largeur totale (en bas) - utilise flight2Run (segment horizontal du U)
 const dimY1 = r(Math.max(flight1Y + flight1Run_visual, flight2Y + flight2Run_visual) + 20);
 const totalWidthReal = actualFlight2Run; // Segment horizontal = 2ème partie
 const totalWidthText = formatValueForPlan(totalWidthReal, isMetric);
 svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(planStartX + totalW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrURS)" marker-end="url(#arrURE)"/>';
 svg += '<text x="' + r(planStartX + totalW_plan/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalWidthText + '</text>';
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = 68;
 const cellH = 16;
 const cols = 5;
 
 // Fond du tableau
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
 
 // En-têtes
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">CM</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Giron</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Marche ray.</text>';
 
 // Ligne séparatrice
 svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
 
 // Valeurs - utiliser String.fromCharCode pour les caractères spéciaux
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' ' + String.fromCharCode(215) + ' ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' ' + String.fromCharCode(215) + ' ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + (stepsPerCorner * 2) + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
 
 svg += '</svg>';
 return svg;
}


/**
 * Génère une visualisation SVG d'un escalier en U avec configuration mixte (palier + marches rayonnantes)
 * Configurations supportées:
 * - rect_landing_radiating_rect: marches rect. + palier + marches ray. (90°) + marches rect.
 * - rect_radiating_landing_rect: marches rect. + marches ray. (90°) + palier + marches rect.
 * Conforme au CNB 9.8.4.6: chaque série de marches rayonnantes ≤ 90°
 */
function generateUShapedMixedVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  treadDepth,
  totalRise,
  stairWidth,
  isMetric,
  flight1Run,
  flight2Run,
  flight3Run,
  landingWidth,
  landingDepth,
  radiatingAngle = 45,
  configType = 'rect_landing_radiating_rect'
 } = stairData;
 
 const r = (n) => Math.round(n * 10) / 10;
 
 // Dimensions du SVG
 const W = 680, H = 530;
 
 // Formatage des dimensions
 const riseText = formatValueForPlan(totalRise, isMetric);
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(treadDepth, isMetric);
 const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
 
 const actualWidth = stairWidth || 914;
 const actualFlight1Run = flight1Run || 1500;
 const actualFlight2Run = flight2Run || 1500;
 const actualFlight3Run = flight3Run || actualFlight1Run;
 const actualLandingDepth = landingDepth || actualWidth;
 // flight2Run = segment horizontal = largeur totale
 const actualLandingWidth = landingWidth || actualFlight2Run || (2 * actualWidth);
 // Espace entre volées = largeur totale - (2 × largeur escalier)
 const actualSpaceBetween = Math.max(0, actualLandingWidth - (2 * actualWidth));
 
 // Longueur des girons = segment vertical - profondeur zone virage
 const flight1GironsRun = Math.max(0, actualFlight1Run - actualLandingDepth);
 const flight3GironsRun = Math.max(0, actualFlight3Run - actualLandingDepth);
 
 // Nombre de marches rayonnantes (une seule série de 90° pour les configs mixtes)
 const stepsPerCorner = radiatingAngle === 30 ? 3 : 2;
 const totalRadiatingSteps = stepsPerCorner; // Une seule série de 90°
 
 // Répartition des girons rectangulaires entre les 2 sections
 // flight1GironsRun et flight3GironsRun = longueur disponible pour les girons
 const numRectTreads = Math.max(0, numTreads - totalRadiatingSteps);
 const totalRectRun = flight1GironsRun + flight3GironsRun;
 
 let flight1Treads, flight3Treads;
 if (totalRectRun > 0 && numRectTreads > 0) {
  const ratio1 = flight1GironsRun / totalRectRun;
  flight1Treads = Math.max(1, Math.round(numRectTreads * ratio1));
  flight3Treads = Math.max(1, numRectTreads - flight1Treads);
 } else {
  flight1Treads = Math.floor(numRectTreads / 2);
  flight3Treads = numRectTreads - flight1Treads;
 }
 
 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs flèches
 svg += '<defs>';
 svg += '<marker id="arrUMS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrUME" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrUMMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // ========== VUE EN PLAN ==========
 const margin = { left: 70, right: 70, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Déterminer le titre selon la configuration
 let titleText = '';
 if (configType === 'rect_landing_radiating_rect') {
  titleText = 'VUE EN PLAN - Escalier en U (palier + marches ray.)';
 } else if (configType === 'rect_radiating_landing_rect') {
  titleText = 'VUE EN PLAN - Escalier en U (marches ray. + palier)';
 } else {
  titleText = 'VUE EN PLAN - Escalier en U (configuration mixte)';
 }
 
 svg += '<rect x="' + (W/2 - 180) + '" y="8" width="360" height="26" fill="#e8f5e9" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
 
 // Calculer l'échelle pour occuper l'espace disponible
 const totalPlanWidth = actualFlight2Run;
 const maxFlightRun = Math.max(actualFlight1Run, actualFlight3Run);
 const scalePlan = Math.min(planW / totalPlanWidth, planH / maxFlightRun) * 0.75;
 
 const stairWidth_plan = r(actualWidth * scalePlan);
 const landingDepth_plan = r(actualLandingDepth * scalePlan);
 const treadDepth_plan = r(treadDepth * scalePlan);
 const spaceBetween_plan = r(actualSpaceBetween * scalePlan);
 
 const flight1Run_plan = r(flight1Treads * treadDepth_plan);
 const flight3Run_plan = r(flight3Treads * treadDepth_plan);
 
 // Position de départ centrée - totalW_plan = flight2Run (segment horizontal)
 const totalW_plan = r(actualFlight2Run * scalePlan);
 const totalH_plan = Math.max(flight1Run_plan + landingDepth_plan, flight3Run_plan + stairWidth_plan);
 const planStartX = r(margin.left + (planW - totalW_plan) / 2);
 const planStartY = r(margin.top + (planH - totalH_plan) / 2);
 
 let currentStep = 1;
 
 if (configType === 'rect_landing_radiating_rect') {
  // Configuration: Rect + Palier + Rayonnantes + Rect
  // Volée 1 (gauche, monte vers le palier)
  const flight1X = planStartX;
  const flight1Y = r(planStartY + landingDepth_plan);
  
  if (flight1Treads > 0) {
  svg += '<rect x="' + flight1X + '" y="' + flight1Y + '" width="' + stairWidth_plan + '" height="' + flight1Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  for (let i = 1; i <= flight1Treads; i++) {
   const lineY = r(flight1Y + flight1Run_plan - (i * treadDepth_plan));
   svg += '<line x1="' + flight1X + '" y1="' + lineY + '" x2="' + r(flight1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  // Numérotation
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + flight1Run_plan - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (currentStep + flight1Treads - 1) + '</text>';
  currentStep += flight1Treads;
  }
  
  // Palier (en haut à  gauche)
  const landingX = planStartX;
  const landingY = planStartY;
  svg += '<rect x="' + landingX + '" y="' + landingY + '" width="' + r(stairWidth_plan + spaceBetween_plan) + '" height="' + landingDepth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
  // Texte Palier positionné en haut pour éviter conflit avec la flèche
  svg += '<text x="' + r(landingX + r(stairWidth_plan + spaceBetween_plan)/2) + '" y="' + r(landingY + landingDepth_plan * 0.35 + 4) + '" style="font:italic 10px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
  
  // Zone de marches rayonnantes (en haut à  droite, coin 90°)
  const cornerX = r(planStartX + stairWidth_plan + spaceBetween_plan);
  const cornerY = planStartY;
  svg += '<rect x="' + cornerX + '" y="' + cornerY + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#ffecb3" stroke="#f9a825" stroke-width="2"/>';
  
  // Lignes rayonnantes (90°)
  const pivotX = cornerX;
  const pivotY = r(cornerY + stairWidth_plan);
  for (let i = 0; i <= stepsPerCorner; i++) {
  const angle = Math.PI / 2 - (i * (Math.PI / 2) / stepsPerCorner);
  let x2, y2;
  if (i === 0) {
   x2 = pivotX;
   y2 = cornerY;
  } else if (i === stepsPerCorner) {
   x2 = cornerX + stairWidth_plan;
   y2 = pivotY;
  } else {
   const dx = Math.cos(angle);
   const dy = -Math.sin(angle);
   const tRight = (cornerX + stairWidth_plan - pivotX) / dx;
   const tTop = (cornerY - pivotY) / dy;
   if (tTop > 0 && tTop < tRight) {
    x2 = pivotX + tTop * dx;
    y2 = cornerY;
   } else {
    x2 = cornerX + stairWidth_plan;
    y2 = pivotY + tRight * dy;
   }
  }
  svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
  }
  svg += '<text x="' + r(cornerX + stairWidth_plan * 0.6) + '" y="' + r(cornerY + stairWidth_plan * 0.4) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
  svg += '<text x="' + r(cornerX + stairWidth_plan * 0.6) + '" y="' + r(cornerY + stairWidth_plan * 0.6) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + currentStep + '-' + (currentStep + stepsPerCorner - 1) + '</text>';
  currentStep += stepsPerCorner;
  
  // Volée 2 (droite, descend)
  const flight2X = cornerX;
  const flight2Y = r(cornerY + stairWidth_plan);
  if (flight3Treads > 0) {
  svg += '<rect x="' + flight2X + '" y="' + flight2Y + '" width="' + stairWidth_plan + '" height="' + flight3Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  for (let i = 1; i <= flight3Treads; i++) {
   const lineY = r(flight2Y + ((i - 1) * treadDepth_plan));
   svg += '<line x1="' + flight2X + '" y1="' + lineY + '" x2="' + r(flight2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  // Numérotation
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + flight3Run_plan - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
  }
  
  // Flèche de direction (virage à  90°)
  const arrowX1 = r(flight1X + stairWidth_plan/2);
  const arrowX2 = r(flight2X + stairWidth_plan/2);
  const arrowPalierY = r(landingY + landingDepth_plan * 0.65);
  
  // Segment 1: Monte dans la volée 1
  svg += '<line x1="' + arrowX1 + '" y1="' + r(flight1Y + flight1Run_plan) + '" x2="' + arrowX1 + '" y2="' + arrowPalierY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment 2: Traverse le palier horizontalement (virage à  90°)
  svg += '<line x1="' + arrowX1 + '" y1="' + arrowPalierY + '" x2="' + r(cornerX + stairWidth_plan * 0.5) + '" y2="' + arrowPalierY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment 3: Virage vertical dans le coin
  svg += '<line x1="' + r(cornerX + stairWidth_plan * 0.5) + '" y1="' + arrowPalierY + '" x2="' + arrowX2 + '" y2="' + r(flight2Y) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment 4: Descend dans la volée 2 avec flèche
  svg += '<line x1="' + arrowX2 + '" y1="' + r(flight2Y) + '" x2="' + arrowX2 + '" y2="' + r(flight2Y + flight3Run_plan) + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrUMMontee)"/>';
  svg += '<text x="' + arrowX1 + '" y="' + r(flight1Y + flight1Run_plan + 14) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
  
 } else if (configType === 'rect_radiating_landing_rect') {
  // Configuration: Rect + Rayonnantes + Palier + Rect
  // Volée 1 (gauche, monte vers les rayonnantes)
  const flight1X = planStartX;
  const flight1Y = r(planStartY + stairWidth_plan);
  
  if (flight1Treads > 0) {
  svg += '<rect x="' + flight1X + '" y="' + flight1Y + '" width="' + stairWidth_plan + '" height="' + flight1Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  for (let i = 1; i <= flight1Treads; i++) {
   const lineY = r(flight1Y + flight1Run_plan - (i * treadDepth_plan));
   svg += '<line x1="' + flight1X + '" y1="' + lineY + '" x2="' + r(flight1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  // Numérotation
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + flight1Run_plan - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
  svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (currentStep + flight1Treads - 1) + '</text>';
  currentStep += flight1Treads;
  }
  
  // Zone de marches rayonnantes (en haut à  gauche, coin 90°)
  const cornerX = planStartX;
  const cornerY = planStartY;
  svg += '<rect x="' + cornerX + '" y="' + cornerY + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#ffecb3" stroke="#f9a825" stroke-width="2"/>';
  
  // Lignes rayonnantes (90°)
  const pivotX = r(cornerX + stairWidth_plan);
  const pivotY = r(cornerY + stairWidth_plan);
  for (let i = 0; i <= stepsPerCorner; i++) {
  const angle = Math.PI - (i * (Math.PI / 2) / stepsPerCorner);
  let x2, y2;
  if (i === 0) {
   x2 = cornerX;
   y2 = pivotY;
  } else if (i === stepsPerCorner) {
   x2 = pivotX;
   y2 = cornerY;
  } else {
   const dx = Math.cos(angle);
   const dy = -Math.sin(angle);
   const tLeft = (cornerX - pivotX) / dx;
   const tTop = (cornerY - pivotY) / dy;
   if (tLeft > 0 && (tTop <= 0 || tLeft < tTop)) {
    x2 = cornerX;
    y2 = pivotY + tLeft * dy;
   } else {
    x2 = pivotX + tTop * dx;
    y2 = cornerY;
   }
  }
  svg += '<line x1="' + pivotX + '" y1="' + pivotY + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
  }
  svg += '<text x="' + r(cornerX + stairWidth_plan * 0.4) + '" y="' + r(cornerY + stairWidth_plan * 0.4) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
  svg += '<text x="' + r(cornerX + stairWidth_plan * 0.4) + '" y="' + r(cornerY + stairWidth_plan * 0.6) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + currentStep + '-' + (currentStep + stepsPerCorner - 1) + '</text>';
  currentStep += stepsPerCorner;
  
  // Palier (en haut à  droite)
  const landingX = r(planStartX + stairWidth_plan);
  const landingY = planStartY;
  svg += '<rect x="' + landingX + '" y="' + landingY + '" width="' + r(stairWidth_plan + spaceBetween_plan) + '" height="' + landingDepth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
  // Texte Palier positionné en haut pour éviter conflit avec la flèche
  svg += '<text x="' + r(landingX + r(stairWidth_plan + spaceBetween_plan)/2) + '" y="' + r(landingY + landingDepth_plan * 0.35 + 4) + '" style="font:italic 10px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
  
  // Volée 2 (droite, descend)
  const flight2X = r(landingX + spaceBetween_plan);
  const flight2Y = r(landingY + landingDepth_plan);
  if (flight3Treads > 0) {
  svg += '<rect x="' + flight2X + '" y="' + flight2Y + '" width="' + stairWidth_plan + '" height="' + flight3Run_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
  for (let i = 1; i <= flight3Treads; i++) {
   const lineY = r(flight2Y + ((i - 1) * treadDepth_plan));
   svg += '<line x1="' + flight2X + '" y1="' + lineY + '" x2="' + r(flight2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  }
  // Numérotation
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
  svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + flight3Run_plan - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
  }
  
  // Flèche de direction - parcourt rayonnantes puis palier puis descend
  const arrowX1 = r(flight1X + stairWidth_plan/2);
  const arrowX2 = r(flight2X + stairWidth_plan/2);
  // La flèche doit longer le palier horizontalement
  const arrowPalierY = r(landingY + landingDepth_plan * 0.65);
  
  // Segment 1: Monte dans la volée 1 jusqu'en haut du coin
  svg += '<line x1="' + arrowX1 + '" y1="' + r(flight1Y + flight1Run_plan) + '" x2="' + arrowX1 + '" y2="' + arrowPalierY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment 2: Traverse horizontalement le palier (après le coin)
  svg += '<line x1="' + arrowX1 + '" y1="' + arrowPalierY + '" x2="' + arrowX2 + '" y2="' + arrowPalierY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  // Segment 3: Descend verticalement vers la volée 2 avec flèche
  svg += '<line x1="' + arrowX2 + '" y1="' + arrowPalierY + '" x2="' + arrowX2 + '" y2="' + r(flight2Y + flight3Run_plan) + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrUMMontee)"/>';
  svg += '<text x="' + arrowX1 + '" y="' + r(flight1Y + flight1Run_plan + 14) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
 }
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = 68;
 const cellH = 16;
 const cols = 5;
 
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
 
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">CM</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Giron</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 9px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Marche ray.</text>';
 
 svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
 
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' ' + String.fromCharCode(215) + ' ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' ' + String.fromCharCode(215) + ' ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:9px Arial;fill:#555;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
 
 svg += '</svg>';
 return svg;
}


/**
 * Génère une visualisation SVG d'un escalier en U avec double série de marches rayonnantes et palier central
 * Configuration: rect + rayonnantes (90°) + palier + rayonnantes (90°) + rect
 * Conforme au CNB 9.8.4.6: chaque série de marches rayonnantes ≤ 90°
 */
function generateUShapedDoubleRadiatingVisualization(stairData) {
    const {
        numRisers,
        numTreads,
        riserHeight,
        treadDepth,
        totalRise,
        stairWidth,
        isMetric,
        flight1Run,
        flight2Run,
        flight3Run,
        landingWidth,
        landingDepth,
        radiatingAngle = 45
    } = stairData;
    
    const r = (n) => Math.round(n * 10) / 10;
    
    // Dimensions du SVG
    const W = 680, H = 550;
    
    // Formatage des dimensions
    const riseText = formatValueForPlan(totalRise, isMetric);
    const riserText = formatValueForPlan(riserHeight, isMetric);
    const treadText = formatValueForPlan(treadDepth, isMetric);
    const widthText = stairWidth ? formatValueForPlan(stairWidth, isMetric) : "3'-0\"";
    
    const actualWidth = stairWidth || 914;
    const actualFlight1Run = flight1Run || 2000;
    // flight2Run = segment horizontal (largeur totale zone centrale)
    const actualFlight2Run = flight2Run || (2 * actualWidth + actualWidth); // Default: 2 coins + palier
    // flight3Run = dernier segment vertical
    const actualFlight3Run = flight3Run || actualFlight1Run;
    const actualLandingDepth = landingDepth || actualWidth;
    // Largeur totale = flight2Run (segment horizontal du U)
    // Structure: coin1 (stairWidth) + palier (landingDepth) + coin2 (stairWidth) + espace
    const minRequiredWidth = (2 * actualWidth) + actualLandingDepth;
    // Espace entre les éléments = largeur totale - largeur minimale requise
    const actualSpaceBetween = Math.max(0, actualFlight2Run - minRequiredWidth);
    
    // Longueur des girons = segment vertical - profondeur zone virage
    const flight1GironsRun = Math.max(0, actualFlight1Run - actualLandingDepth);
    const flight3GironsRun = Math.max(0, actualFlight3Run - actualLandingDepth);
    
    // Configuration des marches rayonnantes selon CNB 9.8.4.6
    // Pour cette config: 2 séries de 90° chacune (une de chaque côté du palier)
    const stepsPerCorner = radiatingAngle === 30 ? 3 : 2;
    const totalRadiatingSteps = stepsPerCorner * 2; // 4 (45°) ou 6 (30°)
    
    // Calcul des girons rectangulaires
    const numRectTreads = Math.max(0, numTreads - totalRadiatingSteps);
    const totalRectRun = flight1GironsRun + flight3GironsRun;
    
    // Répartition des girons rectangulaires selon les longueurs des volées
    let flight1RectTreads, flight2RectTreads;
    if (totalRectRun > 0 && numRectTreads > 0) {
        const ratio1 = flight1GironsRun / totalRectRun;
        flight1RectTreads = Math.max(1, Math.round(numRectTreads * ratio1));
        flight2RectTreads = Math.max(1, numRectTreads - flight1RectTreads);
    } else {
        flight1RectTreads = Math.ceil(numRectTreads / 2);
        flight2RectTreads = numRectTreads - flight1RectTreads;
    }
    
    let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
    
    // Marqueurs flèches
    svg += '<defs>';
    svg += '<marker id="arrUDRS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
    svg += '<marker id="arrUDRE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
    svg += '<marker id="arrUDRMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
    svg += '</defs>';
    
    // ========== VUE EN PLAN ==========
    const margin = { left: 70, right: 70, top: 55, bottom: 100 };
    const planW = W - margin.left - margin.right;
    const planH = H - margin.top - margin.bottom;
    
    // Titre avec fond
    const titleText = 'VUE EN PLAN - Escalier en U (ray. + palier + ray.)';
    svg += '<rect x="' + (W/2 - 175) + '" y="8" width="350" height="26" fill="#e8f5e9" rx="4"/>';
    svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
    
    // Calculer l'échelle pour occuper l'espace disponible
    const totalPlanWidth = actualFlight2Run;
    const maxFlightRun = Math.max(actualFlight1Run, actualFlight3Run);
    const scalePlan = Math.min(planW / totalPlanWidth, planH / maxFlightRun) * 0.75;
    
    const stairWidth_plan = r(actualWidth * scalePlan);
    const landingDepth_plan = r(actualLandingDepth * scalePlan);
    const treadDepth_plan = r(treadDepth * scalePlan);
    const spaceBetween_plan = r(actualSpaceBetween * scalePlan);
    
    // Dimensions visuelles basées sur le giron uniforme
    const flight1Run_visual = r(flight1RectTreads * treadDepth_plan);
    const flight2Run_visual = r(flight2RectTreads * treadDepth_plan);
    
    // Position de départ centrée - totalW_plan = flight2Run (segment horizontal)
    const totalW_plan = r(actualFlight2Run * scalePlan);
    const totalH_plan = Math.max(flight1Run_visual, flight2Run_visual) + stairWidth_plan;
    const planStartX = r(margin.left + (planW - totalW_plan) / 2);
    const planStartY = r(margin.top + (planH - totalH_plan) / 2);
    
    let currentStep = 1;
    
    // ===== VOLÉE 1 (gauche, monte de bas vers haut) =====
    const flight1X = planStartX;
    const flight1Y = r(planStartY + stairWidth_plan);
    
    if (flight1RectTreads > 0) {
        svg += '<rect x="' + flight1X + '" y="' + flight1Y + '" width="' + stairWidth_plan + '" height="' + flight1Run_visual + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
        
        for (let i = 1; i <= flight1RectTreads; i++) {
            const lineY = r(flight1Y + flight1Run_visual - (i * treadDepth_plan));
            svg += '<line x1="' + flight1X + '" y1="' + lineY + '" x2="' + r(flight1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
        }
        
        // Numérotation volée 1
        svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + flight1Run_visual - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
        svg += '<text x="' + r(flight1X + stairWidth_plan * 0.25) + '" y="' + r(flight1Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (currentStep + flight1RectTreads - 1) + '</text>';
        
        // Annotation volée 1
        svg += '<text x="' + r(flight1X - 8) + '" y="' + r(flight1Y + flight1Run_visual/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight1X - 8) + ' ' + r(flight1Y + flight1Run_visual/2) + ')">' + flight1RectTreads + ' girons rect.</text>';
        
        currentStep += flight1RectTreads;
    }
    
    // ===== COIN 1 - MARCHES RAYONNANTES (haut-gauche) =====
    const corner1X = planStartX;
    const corner1Y = planStartY;
    
    svg += '<rect x="' + corner1X + '" y="' + corner1Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
    
    // Lignes rayonnantes coin 1 (de gauche vers le haut)
    const pivot1X = r(corner1X + stairWidth_plan);
    const pivot1Y = r(corner1Y + stairWidth_plan);
    
    for (let i = 0; i <= stepsPerCorner; i++) {
        const angle = Math.PI - (i * (Math.PI / 2) / stepsPerCorner);
        let x2, y2;
        
        if (i === 0) {
            x2 = corner1X;
            y2 = pivot1Y;
        } else if (i === stepsPerCorner) {
            x2 = pivot1X;
            y2 = corner1Y;
        } else {
            const dx = Math.cos(angle);
            const dy = -Math.sin(angle);
            const tLeft = (corner1X - pivot1X) / dx;
            const tTop = (corner1Y - pivot1Y) / dy;
            
            if (tLeft > 0 && (tTop <= 0 || tLeft < tTop)) {
                x2 = corner1X;
                y2 = pivot1Y + tLeft * dy;
            } else {
                x2 = pivot1X + tTop * dx;
                y2 = corner1Y;
            }
        }
        svg += '<line x1="' + pivot1X + '" y1="' + pivot1Y + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
    }
    
    // Annotation coin 1
    svg += '<text x="' + r(corner1X + stairWidth_plan * 0.35) + '" y="' + r(corner1Y + stairWidth_plan * 0.35) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
    svg += '<text x="' + r(corner1X + stairWidth_plan * 0.35) + '" y="' + r(corner1Y + stairWidth_plan * 0.55) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + currentStep + '-' + (currentStep + stepsPerCorner - 1) + '</text>';
    currentStep += stepsPerCorner;
    
    // ===== PALIER CENTRAL =====
    // Le palier occupe l'espace entre les deux coins: flight2Run - (2 × stairWidth)
    const landingX = r(corner1X + stairWidth_plan);
    const landingY = planStartY;
    const landingW_plan = r(totalW_plan - (2 * stairWidth_plan)); // Largeur = flight2Run - 2 coins
    
    svg += '<rect x="' + landingX + '" y="' + landingY + '" width="' + landingW_plan + '" height="' + stairWidth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
    // Texte "Palier" positionné en haut pour éviter conflit avec la flèche
    svg += '<text x="' + r(landingX + landingW_plan/2) + '" y="' + r(landingY + stairWidth_plan * 0.35) + '" style="font:italic 10px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
    
    // ===== COIN 2 - MARCHES RAYONNANTES (haut-droite) =====
    const corner2X = r(landingX + landingW_plan);
    const corner2Y = planStartY;
    
    svg += '<rect x="' + corner2X + '" y="' + corner2Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#fff9c4" stroke="#f9a825" stroke-width="2"/>';
    
    // Lignes rayonnantes coin 2 (du haut vers la droite)
    const pivot2X = corner2X;
    const pivot2Y = r(corner2Y + stairWidth_plan);
    
    for (let i = 0; i <= stepsPerCorner; i++) {
        const angle = (Math.PI / 2) - (i * (Math.PI / 2) / stepsPerCorner);
        let x2, y2;
        
        if (i === 0) {
            x2 = pivot2X;
            y2 = corner2Y;
        } else if (i === stepsPerCorner) {
            x2 = corner2X + stairWidth_plan;
            y2 = pivot2Y;
        } else {
            const dx = Math.cos(angle);
            const dy = -Math.sin(angle);
            const tRight = (corner2X + stairWidth_plan - pivot2X) / dx;
            const tTop = (corner2Y - pivot2Y) / dy;
            
            if (tTop > 0 && (tRight <= 0 || tTop < tRight)) {
                x2 = pivot2X + tTop * dx;
                y2 = corner2Y;
            } else {
                x2 = corner2X + stairWidth_plan;
                y2 = pivot2Y + tRight * dy;
            }
        }
        svg += '<line x1="' + pivot2X + '" y1="' + pivot2Y + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
    }
    
    // Annotation coin 2
    svg += '<text x="' + r(corner2X + stairWidth_plan * 0.65) + '" y="' + r(corner2Y + stairWidth_plan * 0.35) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + stepsPerCorner + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
    svg += '<text x="' + r(corner2X + stairWidth_plan * 0.65) + '" y="' + r(corner2Y + stairWidth_plan * 0.55) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + currentStep + '-' + (currentStep + stepsPerCorner - 1) + '</text>';
    currentStep += stepsPerCorner;
    
    // ===== VOLÉE 2 (droite, descend de haut vers bas) =====
    const flight2X = corner2X;
    const flight2Y = r(corner2Y + stairWidth_plan);
    
    if (flight2RectTreads > 0) {
        svg += '<rect x="' + flight2X + '" y="' + flight2Y + '" width="' + stairWidth_plan + '" height="' + flight2Run_visual + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
        
        for (let i = 1; i <= flight2RectTreads; i++) {
            const lineY = r(flight2Y + ((i - 1) * treadDepth_plan));
            svg += '<line x1="' + flight2X + '" y1="' + lineY + '" x2="' + r(flight2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
        }
        
        // Numérotation volée 2
        svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + currentStep + '</text>';
        svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(flight2Y + flight2Run_visual - treadDepth_plan/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
        
        // Annotation volée 2
        svg += '<text x="' + r(flight2X + stairWidth_plan + 8) + '" y="' + r(flight2Y + flight2Run_visual/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight2X + stairWidth_plan + 8) + ' ' + r(flight2Y + flight2Run_visual/2) + ')">' + flight2RectTreads + ' girons rect.</text>';
    }
    
    // ===== FLàˆCHE DE DIRECTION (virage à  90°) =====
    const arrowX1 = r(flight1X + stairWidth_plan / 2);
    const arrowX2 = r(flight2X + stairWidth_plan / 2);
    const arrowLandingY = r(planStartY + stairWidth_plan * 0.65);
    
    // Segment 1: Monte dans la volée 1
    if (flight1Run_visual > 0) {
        svg += '<line x1="' + arrowX1 + '" y1="' + r(flight1Y + flight1Run_visual) + '" x2="' + arrowX1 + '" y2="' + r(flight1Y) + '" stroke="#1b5e20" stroke-width="1.5"/>';
    }
    
    // Segment 2: Traverse le coin 1 (vertical)
    svg += '<line x1="' + arrowX1 + '" y1="' + r(flight1Y) + '" x2="' + arrowX1 + '" y2="' + arrowLandingY + '" stroke="#1b5e20" stroke-width="1.5"/>';
    
    // Segment 3: Traverse le palier (horizontal)
    svg += '<line x1="' + arrowX1 + '" y1="' + arrowLandingY + '" x2="' + arrowX2 + '" y2="' + arrowLandingY + '" stroke="#1b5e20" stroke-width="1.5"/>';
    
    // Segment 4: Traverse le coin 2 (vertical)
    svg += '<line x1="' + arrowX2 + '" y1="' + arrowLandingY + '" x2="' + arrowX2 + '" y2="' + r(flight2Y) + '" stroke="#1b5e20" stroke-width="1.5"/>';
    
    // Segment 5: Descend dans la volée 2 avec flèche
    if (flight2Run_visual > 0) {
        svg += '<line x1="' + arrowX2 + '" y1="' + r(flight2Y) + '" x2="' + arrowX2 + '" y2="' + r(flight2Y + flight2Run_visual) + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrUDRMontee)"/>';
    }
    
    // "En haut" centré sous la volée 1
    svg += '<text x="' + arrowX1 + '" y="' + r(flight1Y + flight1Run_visual + 14) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="middle">En haut</text>';
    
    // ===== COTATIONS =====
    // Cotation gauche (hauteur volée 1 + coin)
    const leftDimStart = planStartY;
    const leftDimEnd = r(flight1Y + flight1Run_visual);
    const leftDimCenter = r((leftDimStart + leftDimEnd) / 2);
    
    const dimX1 = r(flight1X - 30);
    const totalLeftReal = (flight1RectTreads * treadDepth) + actualWidth;
    const totalLeftText = formatValueForPlan(totalLeftReal, isMetric);
    svg += '<line x1="' + dimX1 + '" y1="' + leftDimStart + '" x2="' + dimX1 + '" y2="' + leftDimEnd + '" stroke="#555" stroke-width="1" marker-start="url(#arrUDRS)" marker-end="url(#arrUDRE)"/>';
    svg += '<text x="' + (dimX1 - 5) + '" y="' + leftDimCenter + '" style="font:10px Arial;fill:#333;" text-anchor="middle" dominant-baseline="middle" transform="rotate(-90 ' + (dimX1 - 5) + ' ' + leftDimCenter + ')">' + totalLeftText + '</text>';
    
    // Cotation largeur totale (en bas) - utilise flight2Run (segment horizontal du U)
    const dimY1 = r(Math.max(flight1Y + flight1Run_visual, flight2Y + flight2Run_visual) + 20);
    const totalWidthReal = actualFlight2Run; // Segment horizontal = 2ème partie
    const totalWidthText = formatValueForPlan(totalWidthReal, isMetric);
    svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(planStartX + totalW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrUDRS)" marker-end="url(#arrUDRE)"/>';
    svg += '<text x="' + r(planStartX + totalW_plan/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalWidthText + '</text>';
    
    // ===== LÉGENDE EN TABLEAU =====
    const legendX = 15;
    const legendY = H - 55;
    const cellW = 60;
    const cellH = 16;
    const cols = 6;
    const landingDepthText = formatValueForPlan(actualLandingDepth, isMetric);
    
    // Fond du tableau
    svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ddd" stroke-width="1" rx="3"/>';
    
    // En-têtes
    svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">CM</text>';
    svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Giron</text>';
    svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
    svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Hauteur</text>';
    svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 7px Arial;fill:#333;" text-anchor="middle">Ray.</text>';
    svg += '<text x="' + (legendX + cellW * 5.5) + '" y="' + (legendY + 12) + '" style="font:bold 7px Arial;fill:#333;" text-anchor="middle">Palier</text>';
    
    // Ligne séparatrice
    svg += '<line x1="' + legendX + '" y1="' + (legendY + cellH) + '" x2="' + (legendX + cellW * cols) + '" y2="' + (legendY + cellH) + '" stroke="#ddd" stroke-width="1"/>';
    
    // Valeurs
    svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' ' + String.fromCharCode(215) + ' ' + riserText + '</text>';
    svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + numTreads + ' ' + String.fromCharCode(215) + ' ' + treadText + '</text>';
    svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
    svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + riseText + '</text>';
    svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + totalRadiatingSteps + String.fromCharCode(215) + radiatingAngle + String.fromCharCode(176) + '</text>';
    svg += '<text x="' + (legendX + cellW * 5.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + landingDepthText + '</text>';
    
    svg += '</svg>';
    return svg;
}

/**
 * Génère une visualisation SVG pour un escalier avec marches dansantes
 * Vue en plan avec courbe intérieure montrant le virage progressif
 * Les contremarches sont représentées par des lignes radiales
 */
function generateDancingStepsVisualization(stairData) {
 const {
  numRisers,
  numTreads,
  riserHeight,
  rectTreadDepth,
  treadAt300,
  treadAtNarrow,
  anglePerStep,
  innerRadius,
  dancingAngle,
  totalRise,
  stairWidth,
  firstFlightRun,
  secondFlightRun,
  thirdFlightRun,
  flight1RectTreads,
  flight2RectTreads,
  flight3RectTreads,
  dancingStepsPerZone,
  numTurnZones,
  dancingConfig,
  isMetric
 } = stairData;
 
 const W = 680;
 const H = 550;
 const r = (v) => Math.round(v * 100) / 100;
 
 // Fonction de formatage
 function formatValueForPlan(mmValue, metric) {
  if (metric) {
   return Math.round(mmValue) + ' mm';
  } else {
   const inches = mmValue / 25.4;
   const feet = Math.floor(inches / 12);
   const remainingInches = inches % 12;
   if (feet > 0) {
    return feet + "'-" + remainingInches.toFixed(1) + '"';
   }
   return remainingInches.toFixed(1) + '"';
  }
 }
 
 const isUConfig = dancingConfig === 'u_dancing';
 
 // Dimensions réelles
 const actualWidth = stairWidth || 914;
 const actualFlight1Run = firstFlightRun || 2000;
 const actualFlight2Run = secondFlightRun || 1800;
 const actualFlight3Run = isUConfig ? (thirdFlightRun || 1500) : 0;
 const actualInnerRadius = innerRadius || 200;
 
 let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;background:#fafafa;border:1px solid #e0e0e0;border-radius:6px;">';
 
 // Marqueurs flèches
 svg += '<defs>';
 svg += '<marker id="arrDS" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrDE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6" fill="none" stroke="#555" stroke-width="1"/></marker>';
 svg += '<marker id="arrDMontee" markerWidth="10" markerHeight="6" refX="9" refY="3" orient="auto"><path d="M0,0.5 L8,3 L0,5.5" fill="none" stroke="#1b5e20" stroke-width="1.2"/></marker>';
 svg += '</defs>';
 
 // Titre
 const titleText = isUConfig ? 'VUE EN PLAN - MARCHES DANSANTES (2 VIRAGES)' : 'VUE EN PLAN - MARCHES DANSANTES (1 VIRAGE)';
 svg += '<rect x="10" y="8" width="' + (W - 20) + '" height="22" fill="#1565c0" rx="4"/>';
 svg += '<text x="' + (W/2) + '" y="24" style="font:bold 12px Arial;fill:white;" text-anchor="middle">' + titleText + '</text>';
 
 // Zone de dessin
 const margin = { left: 70, right: 70, top: 55, bottom: 100 };
 const planW = W - margin.left - margin.right;
 const planH = H - margin.top - margin.bottom;
 
 // Échelle pour que l'escalier occupe bien l'espace disponible
 let totalWidth, totalHeight;
 if (isUConfig) {
  totalWidth = actualFlight2Run;
  totalHeight = Math.max(actualFlight1Run, actualFlight3Run) + actualWidth * 2;
 } else {
  totalWidth = actualFlight1Run + actualWidth;
  totalHeight = actualFlight2Run + actualWidth;
 }
 
 const scaleX = planW / totalWidth;
 const scaleY = planH / totalHeight;
 const scale = Math.min(scaleX, scaleY) * 0.85;
 
 // Dimensions à l'échelle
 const stairWidth_plan = actualWidth * scale;
 const flight1_plan = actualFlight1Run * scale;
 const flight2_plan = actualFlight2Run * scale;
 const flight3_plan = isUConfig ? actualFlight3Run * scale : 0;
 const innerR_plan = actualInnerRadius * scale;
 const outerR_plan = (actualInnerRadius + actualWidth) * scale;
 
 // Position de départ centrée
 const planStartX = margin.left + (planW - (isUConfig ? flight2_plan : flight1_plan + stairWidth_plan)) / 2;
 const planStartY = margin.top + (planH - (isUConfig ? Math.max(flight1_plan, flight3_plan) + stairWidth_plan * 2 : flight2_plan + stairWidth_plan)) / 2;
 
 if (isUConfig) {
  // ========== CONFIGURATION U (2 VIRAGES) ==========
  
  // Volée 1 (verticale, descend)
  const v1X = planStartX;
  const v1Y = planStartY;
  const v1Height = flight1_plan - stairWidth_plan;
  
  if (flight1RectTreads > 0 && v1Height > 0) {
   svg += '<rect x="' + v1X + '" y="' + v1Y + '" width="' + stairWidth_plan + '" height="' + v1Height + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   const treadH1 = v1Height / flight1RectTreads;
   for (let i = 1; i < flight1RectTreads; i++) {
    const lineY = r(v1Y + i * treadH1);
    svg += '<line x1="' + v1X + '" y1="' + lineY + '" x2="' + r(v1X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
   }
   svg += '<text x="' + r(v1X + stairWidth_plan/2) + '" y="' + r(v1Y + v1Height/2 + 4) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1-' + flight1RectTreads + '</text>';
  }
  
  // Zone de virage 1 (coin inférieur gauche) avec arc de cercle
  const turn1X = planStartX;
  const turn1Y = planStartY + flight1_plan - stairWidth_plan;
  const turn1CenterX = turn1X + stairWidth_plan; // Centre de l'arc (coin intérieur)
  const turn1CenterY = turn1Y;
  
  svg += '<rect x="' + turn1X + '" y="' + turn1Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Arc intérieur (courbe des marches dansantes)
  const angleStart1 = 180; // Début de l'arc (vers la gauche)
  const angleEnd1 = 270; // Fin de l'arc (vers le bas)
  
  // Lignes radiales pour les contremarches des marches dansantes
  const angleStep = dancingAngle / dancingStepsPerZone;
  for (let i = 0; i <= dancingStepsPerZone; i++) {
   const angle = (angleStart1 + i * angleStep) * Math.PI / 180;
   const x1 = turn1CenterX + innerR_plan * Math.cos(angle);
   const y1 = turn1CenterY + innerR_plan * Math.sin(angle);
   const x2 = turn1CenterX + outerR_plan * Math.cos(angle);
   const y2 = turn1CenterY + outerR_plan * Math.sin(angle);
   svg += '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
  }
  
  // Arc intérieur visible
  svg += '<path d="M ' + r(turn1CenterX - innerR_plan) + ' ' + turn1CenterY + ' A ' + innerR_plan + ' ' + innerR_plan + ' 0 0 1 ' + turn1CenterX + ' ' + r(turn1CenterY + innerR_plan) + '" fill="none" stroke="#e65100" stroke-width="2"/>';
  
  // Annotation zone 1
  const startStep1 = flight1RectTreads + 1;
  const endStep1 = flight1RectTreads + dancingStepsPerZone;
  svg += '<text x="' + r(turn1X + stairWidth_plan * 0.35) + '" y="' + r(turn1Y + stairWidth_plan * 0.65) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + dancingStepsPerZone + '×' + Math.round(angleStep) + '°</text>';
  svg += '<text x="' + r(turn1X + stairWidth_plan * 0.35) + '" y="' + r(turn1Y + stairWidth_plan * 0.82) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + startStep1 + '-' + endStep1 + '</text>';
  
  // Volée 2 (horizontale)
  const v2X = planStartX + stairWidth_plan;
  const v2Y = planStartY + flight1_plan;
  const v2Width = flight2_plan - stairWidth_plan * 2;
  
  if (flight2RectTreads > 0 && v2Width > 0) {
   svg += '<rect x="' + v2X + '" y="' + v2Y + '" width="' + v2Width + '" height="' + stairWidth_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   const treadW2 = v2Width / flight2RectTreads;
   for (let i = 1; i < flight2RectTreads; i++) {
    const lineX = r(v2X + i * treadW2);
    svg += '<line x1="' + lineX + '" y1="' + v2Y + '" x2="' + lineX + '" y2="' + r(v2Y + stairWidth_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
   }
   const startStep2 = flight1RectTreads + dancingStepsPerZone + 1;
   const endStep2 = startStep2 + flight2RectTreads - 1;
   svg += '<text x="' + r(v2X + v2Width/2) + '" y="' + r(v2Y + stairWidth_plan/2 + 4) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + startStep2 + '-' + endStep2 + '</text>';
  }
  
  // Zone de virage 2 (coin inférieur droit)
  const turn2X = planStartX + flight2_plan - stairWidth_plan;
  const turn2Y = planStartY + flight1_plan;
  const turn2CenterX = turn2X;
  const turn2CenterY = turn2Y;
  
  svg += '<rect x="' + turn2X + '" y="' + turn2Y + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Lignes radiales pour zone 2
  const angleStart2 = 270;
  for (let i = 0; i <= dancingStepsPerZone; i++) {
   const angle = (angleStart2 + i * angleStep) * Math.PI / 180;
   const x1 = turn2CenterX + innerR_plan * Math.cos(angle);
   const y1 = turn2CenterY + innerR_plan * Math.sin(angle);
   const x2 = turn2CenterX + outerR_plan * Math.cos(angle);
   const y2 = turn2CenterY + outerR_plan * Math.sin(angle);
   svg += '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
  }
  
  // Arc intérieur zone 2
  svg += '<path d="M ' + turn2CenterX + ' ' + r(turn2CenterY + innerR_plan) + ' A ' + innerR_plan + ' ' + innerR_plan + ' 0 0 1 ' + r(turn2CenterX + innerR_plan) + ' ' + turn2CenterY + '" fill="none" stroke="#e65100" stroke-width="2"/>';
  
  // Annotation zone 2
  const startStep2b = flight1RectTreads + dancingStepsPerZone + flight2RectTreads + 1;
  const endStep2b = startStep2b + dancingStepsPerZone - 1;
  svg += '<text x="' + r(turn2X + stairWidth_plan * 0.65) + '" y="' + r(turn2Y + stairWidth_plan * 0.65) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + dancingStepsPerZone + '×' + Math.round(angleStep) + '°</text>';
  svg += '<text x="' + r(turn2X + stairWidth_plan * 0.65) + '" y="' + r(turn2Y + stairWidth_plan * 0.82) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + startStep2b + '-' + endStep2b + '</text>';
  
  // Volée 3 (verticale, monte)
  const v3X = planStartX + flight2_plan - stairWidth_plan;
  const v3Y = planStartY;
  const v3Height = flight1_plan - stairWidth_plan;
  
  if (flight3RectTreads > 0 && v3Height > 0) {
   svg += '<rect x="' + v3X + '" y="' + v3Y + '" width="' + stairWidth_plan + '" height="' + v3Height + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   const treadH3 = v3Height / flight3RectTreads;
   for (let i = 1; i < flight3RectTreads; i++) {
    const lineY = r(v3Y + v3Height - i * treadH3);
    svg += '<line x1="' + v3X + '" y1="' + lineY + '" x2="' + r(v3X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
   }
   const startStep3 = startStep2b + dancingStepsPerZone;
   svg += '<text x="' + r(v3X + stairWidth_plan/2) + '" y="' + r(v3Y + v3Height/2 + 4) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + startStep3 + '-' + numTreads + '</text>';
  }
  
  // Flèche de montée
  const arrowY = r(v1Y + v1Height/2);
  svg += '<line x1="' + r(v1X - 10) + '" y1="' + arrowY + '" x2="' + r(v1X + stairWidth_plan/2) + '" y2="' + arrowY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + r(v1X + stairWidth_plan/2) + '" y1="' + arrowY + '" x2="' + r(v1X + stairWidth_plan/2) + '" y2="' + r(v2Y + stairWidth_plan/2) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + r(v1X + stairWidth_plan/2) + '" y1="' + r(v2Y + stairWidth_plan/2) + '" x2="' + r(v3X + stairWidth_plan/2) + '" y2="' + r(v2Y + stairWidth_plan/2) + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + r(v3X + stairWidth_plan/2) + '" y1="' + r(v2Y + stairWidth_plan/2) + '" x2="' + r(v3X + stairWidth_plan/2) + '" y2="' + r(v3Y) + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrDMontee)"/>';
  svg += '<text x="' + r(v1X - 15) + '" y="' + r(arrowY + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
  
  // Cotations
  const dimY = r(v2Y + stairWidth_plan + 20);
  svg += '<line x1="' + planStartX + '" y1="' + dimY + '" x2="' + r(planStartX + flight2_plan) + '" y2="' + dimY + '" stroke="#555" stroke-width="1" marker-start="url(#arrDS)" marker-end="url(#arrDE)"/>';
  svg += '<text x="' + r(planStartX + flight2_plan/2) + '" y="' + r(dimY + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + formatValueForPlan(actualFlight2Run, isMetric) + '</text>';
  
 } else {
  // ========== CONFIGURATION L (1 VIRAGE) ==========
  
  // Volée 1 (horizontale)
  const v1X = planStartX;
  const v1Y = planStartY + stairWidth_plan;
  const v1Width = flight1_plan;
  
  if (flight1RectTreads > 0) {
   svg += '<rect x="' + v1X + '" y="' + v1Y + '" width="' + v1Width + '" height="' + stairWidth_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   const treadW1 = v1Width / flight1RectTreads;
   for (let i = 1; i < flight1RectTreads; i++) {
    const lineX = r(v1X + i * treadW1);
    svg += '<line x1="' + lineX + '" y1="' + v1Y + '" x2="' + lineX + '" y2="' + r(v1Y + stairWidth_plan) + '" stroke="#1b5e20" stroke-width="1.5"/>';
   }
   svg += '<text x="' + r(v1X + v1Width/2) + '" y="' + r(v1Y + stairWidth_plan * 0.75) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1-' + flight1RectTreads + '</text>';
  }
  
  // Zone de virage (coin) avec arc de cercle
  const turnX = planStartX + flight1_plan;
  const turnY = planStartY;
  const turnCenterX = turnX; // Centre de l'arc (coin intérieur)
  const turnCenterY = turnY + stairWidth_plan;
  
  svg += '<rect x="' + turnX + '" y="' + turnY + '" width="' + stairWidth_plan + '" height="' + stairWidth_plan + '" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/>';
  
  // Lignes radiales pour les contremarches des marches dansantes
  const angleStep = dancingAngle / dancingStepsPerZone;
  const angleStart = 180; // Début de l'arc (vers la gauche)
  
  for (let i = 0; i <= dancingStepsPerZone; i++) {
   const angle = (angleStart - i * angleStep) * Math.PI / 180;
   const x1 = turnCenterX + innerR_plan * Math.cos(angle);
   const y1 = turnCenterY + innerR_plan * Math.sin(angle);
   const x2 = turnCenterX + outerR_plan * Math.cos(angle);
   const y2 = turnCenterY + outerR_plan * Math.sin(angle);
   svg += '<line x1="' + r(x1) + '" y1="' + r(y1) + '" x2="' + r(x2) + '" y2="' + r(y2) + '" stroke="#e65100" stroke-width="1.5"/>';
  }
  
  // Arc intérieur visible (courbe des marches dansantes)
  const arcEndAngle = 180 - dancingAngle;
  const arcEndX = turnCenterX + innerR_plan * Math.cos(arcEndAngle * Math.PI / 180);
  const arcEndY = turnCenterY + innerR_plan * Math.sin(arcEndAngle * Math.PI / 180);
  svg += '<path d="M ' + r(turnCenterX - innerR_plan) + ' ' + turnCenterY + ' A ' + innerR_plan + ' ' + innerR_plan + ' 0 0 0 ' + r(arcEndX) + ' ' + r(arcEndY) + '" fill="none" stroke="#e65100" stroke-width="2"/>';
  
  // Annotation zone de virage
  const startStepTurn = flight1RectTreads + 1;
  const endStepTurn = flight1RectTreads + dancingStepsPerZone;
  svg += '<text x="' + r(turnX + stairWidth_plan * 0.65) + '" y="' + r(turnY + stairWidth_plan * 0.4) + '" style="font:bold 9px Arial;fill:#e65100;" text-anchor="middle">' + dancingStepsPerZone + '×' + Math.round(angleStep) + '°</text>';
  svg += '<text x="' + r(turnX + stairWidth_plan * 0.65) + '" y="' + r(turnY + stairWidth_plan * 0.57) + '" style="font:8px Arial;fill:#e65100;" text-anchor="middle">' + startStepTurn + '-' + endStepTurn + '</text>';
  
  // Volée 2 (verticale)
  const v2X = planStartX + flight1_plan;
  const v2Y = planStartY - flight2_plan + stairWidth_plan;
  const v2Height = flight2_plan - stairWidth_plan;
  
  if (flight2RectTreads > 0 && v2Height > 0) {
   svg += '<rect x="' + v2X + '" y="' + v2Y + '" width="' + stairWidth_plan + '" height="' + v2Height + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
   const treadH2 = v2Height / flight2RectTreads;
   for (let i = 1; i < flight2RectTreads; i++) {
    const lineY = r(v2Y + v2Height - i * treadH2);
    svg += '<line x1="' + v2X + '" y1="' + lineY + '" x2="' + r(v2X + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
   }
   const startStep2 = flight1RectTreads + dancingStepsPerZone + 1;
   svg += '<text x="' + r(v2X + stairWidth_plan * 0.75) + '" y="' + r(v2Y + v2Height/2 + 4) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + startStep2 + '-' + numTreads + '</text>';
  }
  
  // Flèche de montée avec virage à 90°
  const arrowStartX = r(v1X);
  const arrowY = r(v1Y + stairWidth_plan/2);
  const arrowCornerX = r(v2X + stairWidth_plan/2);
  const arrowEndY = r(v2Y);
  
  svg += '<line x1="' + arrowStartX + '" y1="' + arrowY + '" x2="' + arrowCornerX + '" y2="' + arrowY + '" stroke="#1b5e20" stroke-width="1.5"/>';
  svg += '<line x1="' + arrowCornerX + '" y1="' + arrowY + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrDMontee)"/>';
  svg += '<text x="' + r(arrowStartX - 5) + '" y="' + r(arrowY + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
  
  // Cotations
  const dimY1 = r(v1Y + stairWidth_plan + 20);
  svg += '<line x1="' + v1X + '" y1="' + dimY1 + '" x2="' + r(turnX + stairWidth_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrDS)" marker-end="url(#arrDE)"/>';
  svg += '<text x="' + r((v1X + turnX + stairWidth_plan)/2) + '" y="' + r(dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + formatValueForPlan(actualFlight1Run + actualWidth, isMetric) + '</text>';
  
  const dimX2 = r(turnX + stairWidth_plan + 20);
  svg += '<line x1="' + dimX2 + '" y1="' + v2Y + '" x2="' + dimX2 + '" y2="' + r(turnY + stairWidth_plan) + '" stroke="#555" stroke-width="1" marker-start="url(#arrDS)" marker-end="url(#arrDE)"/>';
  svg += '<text x="' + r(dimX2 + 5) + '" y="' + r((v2Y + turnY + stairWidth_plan)/2 + 4) + '" style="font:10px Arial;fill:#333;">' + formatValueForPlan(actualFlight2Run, isMetric) + '</text>';
 }
 
 // ===== LÉGENDE EN TABLEAU =====
 const legendX = 15;
 const legendY = H - 55;
 const cellW = 75;
 const cellH = 16;
 const cols = 6;
 
 // Fond de légende
 svg += '<rect x="' + legendX + '" y="' + legendY + '" width="' + (cellW * cols) + '" height="' + (cellH * 2 + 4) + '" fill="#f5f5f5" stroke="#ccc" stroke-width="1" rx="3"/>';
 
 // En-têtes
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Contremarches</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Girons rect.</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Giron @300mm</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Giron étroit</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">M. dansantes</text>';
 svg += '<text x="' + (legendX + cellW * 5.5) + '" y="' + (legendY + 12) + '" style="font:bold 8px Arial;fill:#333;" text-anchor="middle">Largeur</text>';
 
 // Valeurs formatées
 const riserText = formatValueForPlan(riserHeight, isMetric);
 const treadText = formatValueForPlan(rectTreadDepth, isMetric);
 const tread300Text = formatValueForPlan(treadAt300, isMetric);
 const narrowText = formatValueForPlan(treadAtNarrow, isMetric);
 const widthText = formatValueForPlan(actualWidth, isMetric);
 const totalDancing = dancingStepsPerZone * numTurnZones;
 
 // Valeurs
 svg += '<text x="' + (legendX + cellW * 0.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + numRisers + ' × ' + riserText + '</text>';
 svg += '<text x="' + (legendX + cellW * 1.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + (numTreads - totalDancing) + ' × ' + treadText + '</text>';
 svg += '<text x="' + (legendX + cellW * 2.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + tread300Text + '</text>';
 svg += '<text x="' + (legendX + cellW * 3.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + narrowText + '</text>';
 svg += '<text x="' + (legendX + cellW * 4.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + totalDancing + '×' + Math.round(anglePerStep) + '°</text>';
 svg += '<text x="' + (legendX + cellW * 5.5) + '" y="' + (legendY + cellH + 14) + '" style="font:8px Arial;fill:#555;" text-anchor="middle">' + widthText + '</text>';
 
 svg += '</svg>';
 return svg;
}


function displayCalculatorResults(solutions, params) {
 const {
  totalRiseValue,
  stairWidthValue,
  buildingTypeValue,
  stairTypeValue,
  stairConfigValue,
  lShapedConfigValue,
  uShapedConfigValue,
  uRadiatingAngleValue,
  uFirstFlightRunValue,
  uThirdFlightRunValue,
  uLandingDepthValue,
  isMetric
 } = params;
 
 const resultDiv = document.getElementById('calculatorResult');
 const contentDiv = document.getElementById('calculatorResultContent');
 
 // Vérifier si une erreur de marches dansantes a été retournée
 if (solutions && solutions.error && solutions.errorMessage && stairConfigValue === 'dancing_steps') {
  let html = '<h3>⚠ Paramètres non conformes - Marches dansantes</h3>';
  html += '<div class="warning">';
  html += solutions.errorMessage;
  html += '</div>';
  contentDiv.innerHTML = html;
  resultDiv.className = 'result non-compliant';
  resultDiv.style.display = 'block';
  return;
 }
 
 // Vérifier si une erreur flight2Run a été retournée
 if (solutions && solutions.error && solutions.flight2RunError) {
  const err = solutions.flight2RunError;
  let html = '<h3>✗ Paramètre incohérent</h3>';
  html += '<div class="warning">';
  html += '<p><strong>Erreur :</strong></p>';
  html += '<ul>';
  if (isMetric) {
   html += `<li>La longueur de la 2ème partie (${Math.round(err.provided)} mm) est insuffisante pour cette configuration.</li>`;
   html += `<li>Minimum requis : ${Math.round(err.minRequired)} mm</li>`;
  } else {
   html += `<li>La longueur de la 2ème partie (${metricToImperial(err.provided)}) est insuffisante pour cette configuration.</li>`;
   html += `<li>Minimum requis : ${metricToImperial(err.minRequired)}</li>`;
  }
  html += '</ul>';
  html += '<p><strong>Solution :</strong> Augmentez la valeur de "Longueur 2ème partie" ou réduisez la "Largeur de l\'escalier".</p>';
  html += '</div>';
  contentDiv.innerHTML = html;
  resultDiv.style.display = 'block';
  return;
 }
 
 // Extraire les solutions si elles sont dans un objet avec erreur partielle
 if (solutions && solutions.solutions) {
  solutions = solutions.solutions;
 }
 
 if (!solutions || solutions.length === 0) {
  // Utiliser les vraies limites CNB selon le type de bâtiment
  const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
  const minRisers = Math.ceil(totalRiseValue / limits.maxRiser);
  const minTreads = minRisers - 1;
  
  // Vérifier si la hauteur dépasse la limite de volée
  const usageGroupValue = params.usageGroupValue || 'general';
  const maxFlightHeight = (buildingTypeValue === 'part3' && usageGroupValue === 'b_div2') ? 2400 : 3700;
  const flightHeightExceeded = totalRiseValue > maxFlightHeight;
  
  // Pour escalier en L avec palier, calculer l'espace réellement disponible pour les girons
  let availableForTreads = params.totalRunValue;
  let totalRadiatingStepsForCalc = 0;
  
  if (stairConfigValue === 'l_shaped') {
  if (lShapedConfigValue === 'standard_landing') {
  // L'espace disponible = somme des volées - 2 fois la profondeur du palier
  const landingDepth = stairWidthValue;
   availableForTreads = (params.firstFlightRunValue + params.secondFlightRunValue) - (landingDepth * 2);
  } else {
   // Pour marches rayonnantes, l'espace disponible = somme des deux volées
   // (les marches rayonnantes occupent moins d'espace en plan)
   availableForTreads = params.firstFlightRunValue + params.secondFlightRunValue;
  }
  } else if (stairConfigValue === 'u_shaped') {
  // Pour escalier en U, calculer selon la configuration
  const flight1 = uFirstFlightRunValue || params.firstFlightRunValue || 0;
  const flight3 = uThirdFlightRunValue || params.thirdFlightRunValue || flight1;
  const effectiveLandingDepth = uLandingDepthValue || stairWidthValue;
  
  switch (uShapedConfigValue) {
   case 'two_landings':
   case 'rect_landing_rect':
    // Palier seul: soustraire la profondeur de zone de chaque côté
    availableForTreads = (flight1 - effectiveLandingDepth) + (flight3 - effectiveLandingDepth);
    break;
   case 'rect_landing_radiating_rect':
    // Palier au début, rayonnantes à  la fin
    availableForTreads = (flight1 - effectiveLandingDepth) + (flight3 - stairWidthValue);
    totalRadiatingStepsForCalc = uRadiatingAngleValue === 30 ? 3 : 2;
    break;
   case 'rect_radiating_landing_rect':
    // Rayonnantes au début, palier à  la fin
    availableForTreads = (flight1 - stairWidthValue) + (flight3 - effectiveLandingDepth);
    totalRadiatingStepsForCalc = uRadiatingAngleValue === 30 ? 3 : 2;
    break;
   case 'rect_radiating_landing_radiating_rect':
    // Rayonnantes des deux côtés
    availableForTreads = (flight1 - stairWidthValue) + (flight3 - stairWidthValue);
    totalRadiatingStepsForCalc = uRadiatingAngleValue === 30 ? 6 : 4;
    break;
   default:
    availableForTreads = (flight1 - effectiveLandingDepth) + (flight3 - effectiveLandingDepth);
  }
  }
  
  // Pour les escaliers avec palier intermédiaire: numTreads = numRisers - 2
  // Pour les autres: numTreads = numRisers - 1
  const hasLandingConfig = (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') || 
              stairConfigValue === 'u_shaped';
  const adjustedMinTreads = hasLandingConfig ? minRisers - 2 : minTreads;
  const numRectTreads = Math.max(1, adjustedMinTreads - totalRadiatingStepsForCalc);
  
  const minLength = numRectTreads * limits.minTread;
  const calculatedTread = availableForTreads / numRectTreads;
  
  const codeRef = buildingTypeValue === 'part3' ? 'Partie 3' : 'Partie 9';
  
  // Déterminer si l'escalier a un palier intermédiaire qui divise la montée
  // - Escalier en L avec palier standard: 2 volées séparées
  // - Escalier en L avec marches rayonnantes: 1 SEULE volée (CNB)
  // - Escalier en U: plusieurs volées séparées par paliers
  const hasIntermediateLanding = (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') || 
       stairConfigValue === 'u_shaped';
  
  let html = '<h3>✓ Aucune solution conforme trouvée</h3>';
  html += '<div class="warning">';
  html += '<p><strong>Raison :</strong></p>';
  html += '<ul>';
  
  // Vérifier d'abord si c'est un problème de hauteur de volée
  // (seulement pour les configurations sans palier intermédiaire)
  if (flightHeightExceeded && !hasIntermediateLanding) {
  if (isMetric) {
   html += `<li>Hauteur totale (${totalRiseValue.toFixed(0)} mm) dépasse la limite de ${maxFlightHeight} mm par volée (CNB 9.8.3.3)</li>`;
  } else {
   html += `<li>Hauteur totale (${metricToImperial(totalRiseValue)}) dépasse la limite de ${metricToImperial(maxFlightHeight)} par volée (CNB 9.8.3.3)</li>`;
  }
  
  // Message spécifique pour escalier en L avec marches rayonnantes
  if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
   html += '<li>Note: Un escalier en L avec marches rayonnantes est considéré comme UNE SEULE VOLÉE selon le CNB</li>';
  }
  
  html += '</ul>';
  html += '<p><strong>Suggestions :</strong></p>';
  html += '<ul>';
  
  if (stairConfigValue === 'l_shaped') {
   html += '<li>Utilisez un palier standard au lieu des marches rayonnantes pour diviser la montée en 2 volées</li>';
  } else {
   html += '<li>Utilisez une configuration avec palier (escalier en L ou U) pour diviser la montée</li>';
  }
  
  if (usageGroupValue === 'b_div2') {
   html += '<li>La limite est de 2400 mm pour le groupe B, division 2 (soins de santé)</li>';
  }
  html += '<li>Vérifiez le type d\'escalier (Privé vs Commun)</li>';
  html += '</ul></div>';
  } else {
  // Déterminer si le giron est trop petit ou trop grand
  const hasMaxTreadLimit = limits.maxTread < 9000;
  const treadTooSmall = calculatedTread < limits.minTread;
  const treadTooLarge = hasMaxTreadLimit && calculatedTread > limits.maxTread;
  
  if (treadTooSmall) {
   if (isMetric) {
    html += `<li>Giron calculé : ${calculatedTread.toFixed(0)} mm < minimum requis ${limits.minTread} mm (${codeRef})</li>`;
   } else {
    html += `<li>Giron calculé : ${metricToImperial(calculatedTread)} < minimum requis ${metricToImperial(limits.minTread)} (${codeRef})</li>`;
   }
  } else if (treadTooLarge) {
   if (isMetric) {
    html += `<li>Giron calculé : ${calculatedTread.toFixed(0)} mm > maximum autorisé ${limits.maxTread} mm (${codeRef})</li>`;
   } else {
    html += `<li>Giron calculé : ${metricToImperial(calculatedTread)} > maximum autorisé ${metricToImperial(limits.maxTread)} (${codeRef})</li>`;
   }
  } else {
   // Autre raison (hauteur de contremarche hors limites, etc.)
   html += `<li>Aucune combinaison contremarche/giron conforme trouvée pour ces dimensions (${codeRef})</li>`;
  }
  
  html += '</ul>';
  html += '<p><strong>Suggestions :</strong></p>';
  html += '<ul>';
  
  if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
   // Suggestions spécifiques pour escalier en L avec palier
   const minLengthWithLanding = minLength + (stairWidthValue * 2);
   if (treadTooSmall) {
    if (isMetric) {
    html += `<li>Longueur totale minimale requise ≥ ${minLengthWithLanding.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm + 2× palier)</li>`;
    } else {
    html += `<li>Longueur totale minimale requise ≥ ${metricToImperial(minLengthWithLanding)} (${minTreads} girons × ${metricToImperial(limits.minTread)} + 2× palier)</li>`;
    }
    html += '<li>Augmentez la longueur des volées</li>';
   } else if (treadTooLarge) {
    html += '<li>Réduisez la longueur des volées pour obtenir un giron plus court</li>';
    html += '<li>Augmentez la hauteur totale pour ajouter plus de marches</li>';
   }
   html += '<li>Réduisez la largeur de l\'escalier (= profondeur du palier)</li>';
  } else if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
   // Suggestions pour escalier en L avec marches rayonnantes
   if (treadTooSmall) {
    if (isMetric) {
    html += `<li>Longueur totale minimale requise ≥ ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
    } else {
    html += `<li>Longueur totale minimale requise ≥ ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
    }
    html += '<li>Augmentez la longueur des deux volées perpendiculaires</li>';
   } else if (treadTooLarge) {
    html += '<li>Réduisez la longueur des volées pour obtenir un giron plus court</li>';
    html += '<li>Augmentez la hauteur totale pour ajouter plus de marches</li>';
   }
   html += '<li>Les marches rayonnantes se situent à  l\'intersection des deux volées</li>';
  } else if (stairConfigValue === 'u_shaped') {
   // Suggestions spécifiques pour escalier en U
   if (treadTooSmall) {
    html += '<li>Augmentez la longueur des 1ère et 3ème parties (segments verticaux)</li>';
    html += '<li>La zone de virage (= largeur escalier) est soustraite de ces longueurs</li>';
   } else if (treadTooLarge) {
    html += '<li><strong>Giron trop grand</strong> = pas assez de marches pour l\'espace disponible</li>';
    html += '<li>Augmentez la hauteur totale à  gravir pour ajouter des contremarches</li>';
    html += '<li>Réduisez la longueur des 1ère et 3ème parties</li>';
    html += '<li>Vérifiez que la largeur de l\'escalier correspond à  l\'espace de virage voulu</li>';
   }
   // Info sur les rayonnantes si applicable
   if (uShapedConfigValue && uShapedConfigValue.includes('radiating')) {
    const numRad = uShapedConfigValue === 'rect_radiating_landing_radiating_rect' ? 
    (uRadiatingAngleValue === 30 ? 6 : 4) : (uRadiatingAngleValue === 30 ? 3 : 2);
    html += `<li>Cette configuration inclut ${numRad} marches rayonnantes qui ne comptent pas dans le calcul du giron</li>`;
   }
  } else {
   if (treadTooSmall) {
    if (isMetric) {
    html += `<li>Longueur minimale requise ≥ ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
    } else {
    html += `<li>Longueur minimale requise ≥ ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
    }
    html += '<li>Essayez une configuration avec palier (escalier en L ou U)</li>';
    html += '<li>Augmentez la longueur disponible</li>';
   } else if (treadTooLarge) {
    html += '<li>Réduisez la longueur disponible pour obtenir un giron plus court</li>';
    html += '<li>Augmentez la hauteur totale pour ajouter plus de marches</li>';
   }
  }
  
  html += '<li>Vérifiez le type d\'escalier (Privé vs Commun)</li>';
  html += '</ul></div>';
  }
  
  contentDiv.innerHTML = html;
  resultDiv.className = 'result non-compliant';
  resultDiv.style.display = 'block';
  return;
 }
 
 const best = solutions[0];
 const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
 const codeRef = buildingTypeValue === 'part3' ? 'CNB 2020 Partie 3' : 'CNB 2020 Partie 9';
 
 // Vérifier la largeur
 const isWidthOk = stairWidthValue >= limits.minWidth;
 
 // Vérifier que les dimensions sont dans les limites CNB
 const isRiserOk = best.riserHeight >= limits.minRiser && best.riserHeight <= limits.maxRiser;
 // Vérifier que les dimensions sont dans les limites CNB (gérer "Aucune limite" pour maxTread)
 const hasMaxTreadLimit = limits.maxTread < 9000;
 
 // Pour les marches dansantes, vérifier le giron rectangulaire (rectTreadDepth)
 // Pour les autres configurations, vérifier treadDepth
 const treadToCheck = (stairConfigValue === 'dancing_steps' && best.rectTreadDepth) ? best.rectTreadDepth : best.treadDepth;
 const isTreadOk = treadToCheck >= limits.minTread && (hasMaxTreadLimit ? treadToCheck <= limits.maxTread : true);
 
 let html = '';
 
 // Conformité CNB = dimensions dans les limites (la règle du pas n'est pas obligatoire)
 const isCompliant = isWidthOk && isRiserOk && isTreadOk;
 
 // Titre selon la conformité
 if (isCompliant) {
  html += '<h3>✓ Solution optimale</h3>';
 } else {
  html += '<h3>✗ Aucune solution conforme trouvée</h3>';
 }
 
 // Avertissements pour non-conformité
 if (!isWidthOk) {
  html += `<div class="warning"><p>⚠ Largeur ${formatValue(stairWidthValue, isMetric, 0)} inférieure au minimum requis (${formatValue(limits.minWidth, isMetric, 0)})</p></div>`;
 }
 if (!isRiserOk) {
  html += `<div class="warning"><p>⚠ Hauteur de contremarche ${formatValuePrecise(best.riserHeight, isMetric)} hors limites CNB (${formatValue(limits.minRiser, isMetric, 0)} à  ${formatValue(limits.maxRiser, isMetric, 0)})</p></div>`;
 }
 if (!isTreadOk) {
  const treadLabel = (stairConfigValue === 'dancing_steps') ? 'giron rectangulaire' : 'giron';
  if (hasMaxTreadLimit) {
  html += `<div class="warning"><p>⚠ Profondeur de ${treadLabel} ${formatValuePrecise(treadToCheck, isMetric)} hors limites CNB (${formatValue(limits.minTread, isMetric, 0)} à  ${formatValue(limits.maxTread, isMetric, 0)})</p></div>`;
  } else {
  html += `<div class="warning"><p>⚠ Profondeur de ${treadLabel} ${formatValuePrecise(treadToCheck, isMetric)} inférieure au minimum CNB (${formatValue(limits.minTread, isMetric, 0)})</p></div>`;
  }
 }
 
 // Dimensions principales
 html += '<div class="result-section">';
 html += '<h4>Dimensions calculées</h4>';
 html += '<ul>';
 html += `<li><strong>Contremarches :</strong> ${best.numRisers} × ${formatValuePrecise(best.riserHeight, isMetric)}</li>`;
 
 // Pour les configurations avec marches rayonnantes, afficher distinctement
 if (best.totalRadiatingSteps > 0) {
  html += `<li><strong>Girons rectangulaires :</strong> ${best.numRectTreads} × ${formatValuePrecise(best.treadDepth, isMetric)}</li>`;
  // Construire le descriptif des marches rayonnantes selon le nombre de séries
  let radiatingDesc = '';
  if (best.numRadiatingSeries === 1) {
   // 1 série de 90°: "2×45°" ou "3×30°"
   radiatingDesc = best.radiatingAngle === 45 ? '2×45°' : '3×30°';
  } else {
   // 2 séries de 90°: "2×2×45°" ou "2×3×30°"
   radiatingDesc = best.radiatingAngle === 45 ? '2×2×45°' : '2×3×30°';
  }
  html += `<li><strong>Marches rayonnantes :</strong> ${best.totalRadiatingSteps} (${radiatingDesc})</li>`;
  html += `<li><strong>Total girons :</strong> ${best.numTreads}</li>`;
  // Afficher le palier pour les escaliers en U avec palier
  if (best.numLandings > 0) {
   html += `<li><strong>Palier :</strong> ${best.numLandings}</li>`;
  }
 } else if (best.numRadiatingSteps > 0) {
  // Pour les escaliers en L avec marches rayonnantes (ancienne variable)
  html += `<li><strong>Girons :</strong> ${best.numTreads} × ${formatValuePrecise(best.treadDepth, isMetric)}</li>`;
  html += `<li><strong>Marches rayonnantes :</strong> ${best.numRadiatingSteps}</li>`;
  html += `<li><strong>Girons rectangulaires :</strong> ${best.numRectTreads}</li>`;
 } else {
  html += `<li><strong>Girons :</strong> ${best.numTreads} × ${formatValuePrecise(best.treadDepth, isMetric)}</li>`;
  // Afficher le palier pour les escaliers en U avec palier (sans marches rayonnantes)
  if (best.numLandings > 0) {
   html += `<li><strong>Palier :</strong> ${best.numLandings}</li>`;
  }
 }
 
 if (best.useLandingConfiguration) {
  html += `<li><strong>Palier :</strong> 1</li>`;
  html += `<li><strong>Profondeur palier :</strong> ${formatValuePrecise(best.landingDepth, isMetric)}</li>`;
  html += `<li><strong>Girons volée 1 :</strong> ${best.treadsInFlight1}</li>`;
  html += `<li><strong>Girons volée 2 :</strong> ${best.treadsInFlight2}</li>`;
  
  // Afficher les hauteurs de chaque volée avec validation (CNB 9.8.3.3 / 3.4.6.3)
  if (best.flight1Height && best.flight2Height) {
  const maxFlightHeight = 3700; // mm - limite CNB
  const flight1Ok = best.flight1Height <= maxFlightHeight;
  const flight2Ok = best.flight2Height <= maxFlightHeight;
  
  html += `<li><strong>Hauteur volée 1 :</strong> ${formatValuePrecise(best.flight1Height, isMetric)} (${best.risersInFlight1} CM) ${flight1Ok ? '✓' : '✓ > 3,7 m'}</li>`;
  html += `<li><strong>Hauteur volée 2 :</strong> ${formatValuePrecise(best.flight2Height, isMetric)} (${best.risersInFlight2} CM) ${flight2Ok ? '✓' : '✓ > 3,7 m'}</li>`;
  
  // Avertissement si une volée dépasse la limite
  if (!flight1Ok || !flight2Ok) {
   html += '</ul></div>';
   html += '<div class="warning"><p><strong>⚠ Non-conformité CNB 9.8.3.3 :</strong> ';
   if (!flight1Ok && !flight2Ok) {
    html += 'Les deux volées dépassent la hauteur maximale de 3,7 m par volée.';
   } else if (!flight1Ok) {
    html += 'La volée 1 dépasse la hauteur maximale de 3,7 m par volée.';
   } else {
    html += 'La volée 2 dépasse la hauteur maximale de 3,7 m par volée.';
   }
   html += '</p></div>';
   html += '<div class="result-section"><ul>';
  }
  }
 }
 
 html += `<li><strong>Largeur :</strong> ${formatValue(stairWidthValue, isMetric, 0)} ${isWidthOk ? '✓' : '✓'}</li>`;
 html += '</ul></div>';
 
 // Vérification mathématique
 html += '<div class="step-formula">';
 html += '<strong>Vérification mathématique :</strong><br>';
 
 if (isMetric) {
  const totalRiseCalc = best.riserHeight * best.numRisers;
  const riseError = Math.abs(totalRiseCalc - totalRiseValue);
  html += `${best.numRisers} × ${best.riserHeight.toFixed(4)} mm = ${totalRiseCalc.toFixed(4)} mm `;
  html += riseError < 0.01 ? '✓ Exact' : `⚠ Écart ${riseError.toFixed(4)} mm`;
  
  if (best.useLandingConfiguration) {
  html += '<br>';
  const totalTreadCalc = best.treadDepth * best.numTreads;
  const availableCalc = best.availableForTreads;
  const treadError = Math.abs(totalTreadCalc - availableCalc);
  html += `${best.numTreads} × ${best.treadDepth.toFixed(4)} mm = ${totalTreadCalc.toFixed(4)} mm `;
  html += treadError < 0.01 ? '✓ Exact' : `⚠ Écart ${treadError.toFixed(4)} mm`;
  }
 } else {
  const riserIn = best.riserHeight / 25.4;
  const totalRiseIn = (best.riserHeight * best.numRisers) / 25.4;
  html += `${best.numRisers} × ${riserIn.toFixed(6)}" = ${totalRiseIn.toFixed(6)}" ✓`;
 }
 
 html += '</div>';
 
 // Règle du pas (informative, non obligatoire selon CNB)
 html += '<div class="result-section">';
 html += `<h4>${best.stepRule.isValid ? '✓' : '✗'} Règle du pas (${best.stepRule.validCount} sur 3)</h4>`;
 html += '<ul>';
 html += `<li>${best.stepRule.rule1.isValid ? '✓' : '✗'} G + H = ${best.stepRule.rule1.value.toFixed(2)}" (${best.stepRule.rule1.range})</li>`;
 html += `<li>${best.stepRule.rule2.isValid ? '✓' : '✗'} G × H = ${best.stepRule.rule2.value.toFixed(2)} (${best.stepRule.rule2.range})</li>`;
 html += `<li>${best.stepRule.rule3.isValid ? '✓' : '✗'} G + 2H = ${best.stepRule.rule3.value.toFixed(2)}" (${best.stepRule.rule3.range})</li>`;
 html += '</ul></div>';
 
 // Instructions de traçage
 html += '<div class="warning">';
 html += '<p><strong>Instructions pour le traçage CAD :</strong></p>';
 html += '<ul>';
 html += `<li>Utilisez les ${isMetric ? 'valeurs exactes en mm' : 'valeurs décimales entre parenthèses'}</li>`;
 html += `<li>Nombre de contremarches : ${best.numRisers}</li>`;
 html += `<li>Nombre de girons tracés : ${best.numTreads} (le dernier giron n'est pas comptabilisé, car il correspond au niveau du plancher supérieur)</li>`;
 html += '<li>La somme des contremarches doit égaler la hauteur totale exacte</li>';
 html += '<li>La somme des girons doit égaler la longueur horizontale exacte</li>';
 html += '</ul></div>';
 
 // Notes spécifiques selon la configuration
 if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
  html += '<div class="result-section">';
  html += '<h4>Notes - Escalier en L avec palier</h4>';
  html += '<ul>';
  html += '<li>Le palier est un giron surdimensionné (carré)</li>';
  html += '<li>Profondeur palier = largeur palier = largeur de l\'escalier</li>';
  html += '<li>Mesures prises sur le côté long de chaque volée</li>';
  html += '</ul></div>';
 }
 
 if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
  html += '<div class="result-section">';
  html += '<h4>Notes - Escalier en L avec marches rayonnantes (UNE SEULE volée)</h4>';
  html += '<ul>';
  html += '<li>Les marches rayonnantes se situent à  l\'intersection des deux volées perpendiculaires</li>';
  html += '<li>Côté long 1ère direction : ' + formatValuePrecise(best.firstFlightRun, isMetric) + '</li>';
  if (best.firstFlightRectTreads !== undefined) {
  html += '<li>Girons rectangulaires : ' + best.numRectTreads + ' total</li>';
  html += '<li> â†’  1ère direction : ' + best.firstFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
  const calc1 = best.firstFlightRectTreads * best.treadDepth;
  html += '<li> Longueur tracée = ' + formatValuePrecise(calc1, isMetric) + ' (girons seuls)</li>';
  html += '<li> â†’  2ème direction : ' + best.secondFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
  const calc2 = best.secondFlightRectTreads * best.treadDepth;
  html += '<li> Longueur tracée = ' + formatValuePrecise(calc2, isMetric) + ' (girons seuls)</li>';
  } else {
  html += '<li>Girons rectangulaires : ' + best.numRectTreads + ' total</li>';
  }
  html += '<li>Côté long 2ème direction : ' + formatValuePrecise(best.secondFlightRun, isMetric) + '</li>';
  html += '<li>Giron mesuré à  500 mm de la rive étroite (CNB)</li>';
  html += '</ul></div>';
 }
 
 // Visualisation graphique pour volée droite uniquement (seulement si conforme et pas L ou U)
 if (isCompliant && !best.numRadiatingSteps && !best.useLandingConfiguration && !best.isSpiral && stairConfigValue !== 'l_shaped' && stairConfigValue !== 'u_shaped') {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  html += generateStraightStairVisualization({
  numRisers: best.numRisers,
  numTreads: best.numTreads,
  riserHeight: best.riserHeight,
  treadDepth: best.treadDepth,
  totalRise: totalRiseValue,
  totalRun: best.treadDepth * best.numTreads,
  stairWidth: stairWidthValue,
  isMetric: isMetric
  });
  html += '</div>';
 }
 
 // Visualisation graphique pour escalier en L (seulement si conforme)
 if (isCompliant && stairConfigValue === 'l_shaped' && (best.useLandingConfiguration || best.numRadiatingSteps > 0)) {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  html += generateLShapedStairVisualization({
  numRisers: best.numRisers,
  numTreads: best.numTreads,
  riserHeight: best.riserHeight,
  treadDepth: best.treadDepth,
  totalRise: totalRiseValue,
  stairWidth: stairWidthValue,
  isMetric: isMetric,
  lShapedConfig: lShapedConfigValue,
  // Pour palier standard
  treadsInFlight1: best.treadsInFlight1,
  treadsInFlight2: best.treadsInFlight2,
  landingDepth: best.landingDepth || stairWidthValue,
  // Pour marches rayonnantes
  firstFlightRectTreads: best.firstFlightRectTreads,
  secondFlightRectTreads: best.secondFlightRectTreads,
  numRadiatingSteps: best.numRadiatingSteps,
  firstFlightRun: best.firstFlightRun,
  secondFlightRun: best.secondFlightRun,
  // Pour marches rayonnantes à  l'extrémité
  radiatingAtEnd: best.radiatingAtEnd,
  radiatingAtStart: best.radiatingAtStart
  });
  html += '</div>';
 }
 
 // Visualisation graphique pour escalier en U avec palier (configurations avec 'landing' mais sans 'radiating')
 if (isCompliant && stairConfigValue === 'u_shaped' && (uShapedConfigValue === 'two_landings' || uShapedConfigValue === 'rect_landing_rect')) {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  
  // Utiliser les valeurs de best si disponibles, sinon utiliser les params
  const uFlight1 = best.flight1Run || params.uFirstFlightRunValue || params.firstFlightRunValue || 0;
  const uFlight2 = best.flight2Run || params.uSecondFlightRunValue || params.secondFlightRunValue || 0;
  // flight2Run = segment horizontal = largeur totale du palier
  const uLandingWidth = uFlight2 || (2 * stairWidthValue);
  const uLandingDepth = params.uLandingDepthValue || stairWidthValue;
  // Espace entre volées = largeur totale - (2 × largeur escalier)
  const spaceBetween = Math.max(0, uLandingWidth - (2 * stairWidthValue));
  
  // flight1 = 1er segment vertical, flight2 = segment horizontal (palier), flight3 = dernier segment vertical
  const uFlight3 = best.flight3Run || params.uThirdFlightRunValue || uFlight1;
  
  // Répartition des girons entre les 2 volées (proportionnelle aux longueurs)
  const totalFlightLength = uFlight1 + uFlight3;
  const treads1 = totalFlightLength > 0 ? Math.round(best.numTreads * (uFlight1 / totalFlightLength)) : Math.floor(best.numTreads / 2);
  const treads2 = best.numTreads - treads1;
  
  html += generateUShapedStairVisualization({
  numRisers: best.numRisers,
  numTreads: best.numTreads,
  riserHeight: best.riserHeight,
  treadDepth: best.treadDepth,
  totalRise: totalRiseValue,
  stairWidth: stairWidthValue,
  isMetric: isMetric,
  uShapedConfig: uShapedConfigValue,
  flight1Run: uFlight1,
  flight2Run: uFlight2,
  flight3Run: uFlight3,
  landingWidth: uLandingWidth,
  landingDepth: uLandingDepth,
  spaceBetweenFlights: spaceBetween,
  treadsInFlight1: treads1,
  treadsInFlight2: treads2
  });
  html += '</div>';
 }
 
 // Visualisation graphique pour escalier en U avec marches rayonnantes uniquement
 // Note: Cette configuration (rect_radiating_rect) a été supprimée car non conforme au CNB 9.8.4.6
 // (chaque série de marches rayonnantes ne peut tourner qu'à  max 90°, donc un virage de 180° nécessite un palier)
 const uShapedIsRadiatingOnly = false; // Configuration supprimée
 if (isCompliant && stairConfigValue === 'u_shaped' && uShapedIsRadiatingOnly) {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  
  // Utiliser les valeurs de best si disponibles, sinon utiliser les params
  const uFlight1 = best.flight1Run || params.uFirstFlightRunValue || params.firstFlightRunValue || 0;
  const uFlight2 = best.flight2Run || params.uSecondFlightRunValue || params.secondFlightRunValue || 0;
  const uLandingWidth = params.uLandingWidthValue || (2 * stairWidthValue);
  const uLandingDepth = params.uLandingDepthValue || stairWidthValue;
  const radiatingAngle = params.uRadiatingAngleValue || best.radiatingAngle || 45;
  
  html += generateUShapedRadiatingVisualization({
  numRisers: best.numRisers,
  numTreads: best.numTreads,
  riserHeight: best.riserHeight,
  treadDepth: best.treadDepth,
  totalRise: totalRiseValue,
  stairWidth: stairWidthValue,
  isMetric: isMetric,
  flight1Run: uFlight1,
  flight2Run: uFlight2,
  landingWidth: uLandingWidth,
  landingDepth: uLandingDepth,
  radiatingAngle: radiatingAngle
  });
  html += '</div>';
 }
 
 // Visualisation graphique pour configurations mixtes (palier + marches rayonnantes)
 const uShapedIsMixed = uShapedConfigValue === 'rect_landing_radiating_rect' || 
     uShapedConfigValue === 'rect_radiating_landing_rect' || 
     uShapedConfigValue === 'rect_radiating_landing_radiating_rect';
 if (isCompliant && stairConfigValue === 'u_shaped' && uShapedIsMixed) {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  
  // Pour les configurations avec une seule série de marches rayonnantes, générer la visualisation
  if (uShapedConfigValue === 'rect_landing_radiating_rect' || uShapedConfigValue === 'rect_radiating_landing_rect') {
  const uFlight1 = best.flight1Run || params.uFirstFlightRunValue || 1500;
  const uFlight2 = best.flight2Run || params.uSecondFlightRunValue || 1500;
  const uFlight3 = best.flight3Run || params.uThirdFlightRunValue || uFlight1;
  // Pour les configs avec rayonnantes: flight2Run = segment horizontal = largeur du palier
  const uLandingWidth = uFlight2;
  const uLandingDepth = params.uLandingDepthValue || stairWidthValue;
  const radiatingAngle = params.uRadiatingAngleValue || best.radiatingAngle || 45;
  
  html += generateUShapedMixedVisualization({
   numRisers: best.numRisers,
   numTreads: best.numTreads,
   riserHeight: best.riserHeight,
   treadDepth: best.treadDepth,
   totalRise: totalRiseValue,
   stairWidth: stairWidthValue,
   isMetric: isMetric,
   flight1Run: uFlight1,
   flight2Run: uFlight2,
   flight3Run: uFlight3,
   landingWidth: uLandingWidth,
   landingDepth: uLandingDepth,
   radiatingAngle: radiatingAngle,
   configType: uShapedConfigValue
  });
  } else {
            // Pour rect_radiating_landing_radiating_rect (double série de marches rayonnantes avec palier)
            const uFlight1 = best.flight1Run || params.uFirstFlightRunValue || 1500;
            const uFlight2 = best.flight2Run || params.uSecondFlightRunValue || 1500;
            const uFlight3 = best.flight3Run || params.uThirdFlightRunValue || uFlight1;
            // Pour les configs avec rayonnantes: flight2Run = segment horizontal = largeur du palier
            const uLandingWidth = uFlight2;
            const uLandingDepth = params.uLandingDepthValue || stairWidthValue;
            const radiatingAngle = params.uRadiatingAngleValue || best.radiatingAngle || 45;
            
            html += generateUShapedDoubleRadiatingVisualization({
                numRisers: best.numRisers,
                numTreads: best.numTreads,
                riserHeight: best.riserHeight,
                treadDepth: best.treadDepth,
                totalRise: totalRiseValue,
                stairWidth: stairWidthValue,
                isMetric: isMetric,
                flight1Run: uFlight1,
                flight2Run: uFlight2,
                flight3Run: uFlight3,
                landingWidth: uLandingWidth,
                landingDepth: uLandingDepth,
                radiatingAngle: radiatingAngle
            });
        }
  html += '</div>';
 }
 
 // Visualisation graphique pour escalier avec marches dansantes
 if (isCompliant && stairConfigValue === 'dancing_steps' && best.isDancing) {
  html += '<div class="result-section">';
  html += '<h4>Visualisation graphique</h4>';
  html += generateDancingStepsVisualization({
   numRisers: best.numRisers,
   numTreads: best.numTreads,
   riserHeight: best.riserHeight,
   rectTreadDepth: best.rectTreadDepth,
   treadAt300: best.treadAt300,
   treadAtNarrow: best.treadAtNarrow,
   anglePerStep: best.anglePerStep,
   innerRadius: best.innerRadius,
   dancingAngle: best.dancingAngle,
   totalRise: totalRiseValue,
   stairWidth: stairWidthValue,
   firstFlightRun: best.firstFlightRun,
   secondFlightRun: best.secondFlightRun,
   thirdFlightRun: best.thirdFlightRun,
   flight1RectTreads: best.flight1RectTreads,
   flight2RectTreads: best.flight2RectTreads,
   flight3RectTreads: best.flight3RectTreads,
   dancingStepsPerZone: best.dancingStepsPerZone,
   numTurnZones: best.numTurnZones,
   dancingConfig: best.dancingConfig,
   isMetric: isMetric
  });
  html += '</div>';
  
  // Notes spécifiques aux marches dansantes
  html += '<div class="result-section">';
  html += '<h4>Notes - Marches dansantes (CNB 9.8.4.3)</h4>';
  html += '<ul>';
  html += '<li>Giron à 300 mm de l\'axe de la main courante : ' + formatValue(best.treadAt300, isMetric, 1) + '</li>';
  html += '<li>Giron à l\'extrémité étroite : ' + formatValue(best.treadAtNarrow, isMetric, 1) + ' (min. 150 mm)</li>';
  html += '<li>Angle par marche dansante : ' + best.anglePerStep.toFixed(1) + '°</li>';
  html += '<li>Main courante obligatoire côté intérieur (CNB 9.8.7.1.(5))</li>';
  html += '<li>Non permises comme issue (CNB 9.8.3.1)</li>';
  html += '</ul></div>';
 }
 
 
 if (best.isSpiral) {
  html += '<div class="result-section">';
  html += '<h4>Notes - Escalier hélicoïdal</h4>';
  html += '<ul>';
  html += '<li>Giron mesuré à  300 mm de l\'axe de la main courante</li>';
  html += '<li>Largeur libre min. entre mains courantes : 660 mm</li>';
  html += '<li>Interdit comme issue (CNB 9.8.4.7)</li>';
  html += '</ul></div>';
 }
 
 // Tableau des alternatives
 if (solutions.length > 1) {
  html += '<div class="result-section">';
  html += '<h4>Alternatives</h4>';
  html += '<table class="result-table">';
  html += '<thead><tr>';
  html += '<th>#</th><th>CM</th><th>Hauteur CM</th><th>Girons</th><th>Profondeur</th><th>Règle</th>';
  html += '</tr></thead><tbody>';
  
  solutions.forEach((sol, i) => {
  const rowClass = i === 0 ? 'optimal-solution' : '';
  html += `<tr class="${rowClass}">`;
  html += `<td>${i + 1}</td>`;
  html += `<td>${sol.numRisers}</td>`;
  html += `<td>${formatValue(sol.riserHeight, isMetric, 1)}</td>`;
  html += `<td>${sol.numTreads}</td>`;
  html += `<td>${formatValue(sol.treadDepth, isMetric, 1)}</td>`;
  html += `<td>${sol.stepRule.validCount} sur 3</td>`;
  html += '</tr>';
  });
  
  html += '</tbody></table></div>';
 }
 
 contentDiv.innerHTML = html;
 resultDiv.className = 'result ' + (isCompliant ? 'compliant' : 'non-compliant');
 resultDiv.style.display = 'block';
}

// =====================================================================
// AFFICHAGE DES RÉSULTATS - VÉRIFICATION
// =====================================================================

function displayVerificationResults(params) {
 const {
  isCompliant,
  issues,
  stepRule,
  codeReference,
  isMetric,
  riserValue,
  treadValue
 } = params;
 
 const resultDiv = document.getElementById('result');
 const contentDiv = document.getElementById('resultContent');
 
 let html = '';
 
 if (isCompliant) {
  html += `<h3>✓ Conforme au ${codeReference}</h3>`;
 } else {
  html += `<h3>✗ Non conforme au ${codeReference}</h3>`;
  html += '<div class="result-section">';
  html += '<h4>Problèmes identifiés :</h4>';
  html += '<ul>';
  issues.forEach(issue => {
  html += `<li>${issue}</li>`;
  });
  html += '</ul></div>';
 }
 
 // Règle du pas
 html += '<div class="result-section">';
 html += `<h4>${stepRule.isValid ? '✓' : '✗'} Règle du pas (${stepRule.validCount} sur 3)</h4>`;
 html += '<ul>';
 html += `<li>${stepRule.rule1.isValid ? '✓' : '✗'} Règle 1 (G+H) : ${stepRule.rule1.value.toFixed(2)}" (17"-18")</li>`;
 html += `<li>${stepRule.rule2.isValid ? '✓' : '✗'} Règle 2 (G×H) : ${stepRule.rule2.value.toFixed(2)} po² (71-74)</li>`;
 html += `<li>${stepRule.rule3.isValid ? '✓' : '✗'} Règle 3 (G+2H) : ${stepRule.rule3.value.toFixed(2)}" (22"-25")</li>`;
 html += '</ul></div>';
 
 contentDiv.innerHTML = html;
 resultDiv.className = 'result ' + (isCompliant ? 'compliant' : 'non-compliant');
 resultDiv.style.display = 'block';
}

// =====================================================================
// INITIALISATION ET GESTION DE L'INTERFACE
// =====================================================================

document.addEventListener('DOMContentLoaded', function() {
 
 // ===== Éléments du DOM =====
 
 // Onglets
 const tabButtons = document.querySelectorAll('.tab-button');
 const tabContents = document.querySelectorAll('.tab-content');
 
 // Calculateur
 const calcMeasurementSystem = document.getElementById('calcMeasurementSystem');
 const calcBuildingType = document.getElementById('calcBuildingType');
 const calcStairType = document.getElementById('calcStairType');
 const calcStairConfig = document.getElementById('calcStairConfig');
 const calcLShapedOptions = document.getElementById('calcLShapedOptions');
 const calcLShapedConfig = document.getElementById('calcLShapedConfig');
 const calcUShapedOptions = document.getElementById('calcUShapedOptions');
 const calcUShapedConfig = document.getElementById('calcUShapedConfig');
 const calcURadiatingAngleRow = document.getElementById('calcURadiatingAngleRow');
 const calcURadiatingAngle = document.getElementById('calcURadiatingAngle');
 const uThirdFlightRow = document.getElementById('uThirdFlightRow');
 const uLandingWidthRow = document.getElementById('uLandingWidthRow');
 const uLandingDepthRow = document.getElementById('uLandingDepthRow');
 const calcDancingStepsOptions = document.getElementById('calcDancingStepsOptions');
 const calcDancingAngle = document.getElementById('calcDancingAngle');
 const calcDancingCustomAngleContainer = document.getElementById('calcDancingCustomAngleContainer');
 const calcSpiralOptions = document.getElementById('calcSpiralOptions');
 
 const calcStandardRunContainer = document.getElementById('calcStandardRunContainer');
 const calcLandingDimensions = document.getElementById('calcLandingDimensions');
 const calcUDimensions = document.getElementById('calcUDimensions');
 const calcDancingDimensions = document.getElementById('calcDancingDimensions');
 const calcDancingStepsConfig = document.getElementById('calcDancingStepsConfig');
 const calcDancingNumSteps = document.getElementById('calcDancingNumSteps');
 const calcDancingInnerRadius = document.getElementById('calcDancingInnerRadius');
 const calcDancingInnerRadiusImperial = document.getElementById('calcDancingInnerRadiusImperial');
 const dancingThirdFlightRow = document.getElementById('dancingThirdFlightRow');
 
 const totalRun = document.getElementById('totalRun');
 const totalRunImperial = document.getElementById('totalRunImperial');
 const totalRise = document.getElementById('totalRise');
 const totalRiseImperial = document.getElementById('totalRiseImperial');
 const stairDesiredWidth = document.getElementById('stairDesiredWidth');
 const stairDesiredWidthImperial = document.getElementById('stairDesiredWidthImperial');
 const idealRiser = document.getElementById('idealRiser');
 const idealRiserImperial = document.getElementById('idealRiserImperial');
 const idealTread = document.getElementById('idealTread');
 const idealTreadImperial = document.getElementById('idealTreadImperial');
 const firstFlightRun = document.getElementById('firstFlightRun');
 const firstFlightRunImperial = document.getElementById('firstFlightRunImperial');
 const secondFlightRun = document.getElementById('secondFlightRun');
 const secondFlightRunImperial = document.getElementById('secondFlightRunImperial');
 
 const calculateButton = document.getElementById('calculateStair');
 
 // Vérification
 const measurementSystem = document.getElementById('measurementSystem');
 const buildingType = document.getElementById('buildingType');
 const stairType = document.getElementById('stairType');
 const stairConfig = document.getElementById('stairConfig');
 const lShapedOptions = document.getElementById('lShapedOptions');
 const lShapedConfig = document.getElementById('lShapedConfig');
 const dancingStepsOptions = document.getElementById('dancingStepsOptions');
 const spiralOptions = document.getElementById('spiralOptions');
 const verifyLandingDimensions = document.getElementById('verifyLandingDimensions');
 
 const riserHeight = document.getElementById('riserHeight');
 const riserHeightImperial = document.getElementById('riserHeightImperial');
 const treadDepth = document.getElementById('treadDepth');
 const treadDepthImperial = document.getElementById('treadDepthImperial');
 const stairWidth = document.getElementById('stairWidth');
 const stairWidthImperial = document.getElementById('stairWidthImperial');
 const headroom = document.getElementById('headroom');
 const headroomImperial = document.getElementById('headroomImperial');
 const landingDepth = document.getElementById('landingDepth');
 const landingDepthImperial = document.getElementById('landingDepthImperial');
 const narrowSide = document.getElementById('narrowSide');
 const narrowSideImperial = document.getElementById('narrowSideImperial');
 const spiralWidth = document.getElementById('spiralWidth');
 const spiralWidthImperial = document.getElementById('spiralWidthImperial');
 const spiralTreadAt300 = document.getElementById('spiralTreadAt300');
 const spiralTreadAt300Imperial = document.getElementById('spiralTreadAt300Imperial');
 
 const checkButton = document.getElementById('checkCompliance');
 
 // ===== Navigation des onglets =====
 
 tabButtons.forEach(button => {
  button.addEventListener('click', function() {
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  this.classList.add('active');
  const tabId = this.dataset.tab;
  document.getElementById(tabId).classList.add('active');
  });
 });
 
 // ===== Mise à  jour des placeholders et visibilité selon le système de mesure =====
 
 function updateMeasurementSystem(section) {
  const system = section === 'calculator' ? calcMeasurementSystem.value : measurementSystem.value;
  const isMetric = system === 'metric';
  const container = document.getElementById(section);
  
  container.querySelectorAll('.metric-input').forEach(el => {
  el.style.display = isMetric ? 'block' : 'none';
  });
  container.querySelectorAll('.imperial-input').forEach(el => {
  el.style.display = isMetric ? 'none' : 'block';
  });
  
  // Reformater les résultats si nécessaire
  if (section === 'calculator' && lastCalculatorParams && lastCalculatorParams.solutions) {
  lastCalculatorParams.isMetric = isMetric;
  displayCalculatorResults(lastCalculatorParams.solutions, lastCalculatorParams);
  }
  if (section === 'verification' && lastVerificationParams) {
  lastVerificationParams.isMetric = isMetric;
  displayVerificationResults(lastVerificationParams);
  }
 }
 
 calcMeasurementSystem.addEventListener('change', () => updateMeasurementSystem('calculator'));
 measurementSystem.addEventListener('change', () => updateMeasurementSystem('verification'));
 
 // ===== Gestion des configurations d'escalier - Calculateur =====
 
 function updateCalcConfigOptions() {
  const config = calcStairConfig.value;
  
  // Masquer toutes les options
  calcLShapedOptions.style.display = 'none';
  calcUShapedOptions.style.display = 'none';
  calcDancingStepsOptions.style.display = 'none';
  calcSpiralOptions.style.display = 'none';
  calcLandingDimensions.style.display = 'none';
  calcUDimensions.style.display = 'none';
  calcStandardRunContainer.style.display = 'block';
  
  switch (config) {
  case 'l_shaped':
   calcLShapedOptions.style.display = 'block';
   updateCalcLShapedSubOptions();
   break;
  case 'u_shaped':
   calcUShapedOptions.style.display = 'block';
   calcStandardRunContainer.style.display = 'none';
   calcUDimensions.style.display = 'block';
   updateCalcUShapedSubOptions();
   break;
  case 'dancing_steps':
   calcDancingStepsOptions.style.display = 'block';
   calcStandardRunContainer.style.display = 'none';
   if (calcDancingDimensions) calcDancingDimensions.style.display = 'block';
   updateCalcDancingSubOptions();
   break;
  case 'spiral':
   calcSpiralOptions.style.display = 'block';
   calcStandardRunContainer.style.display = 'none';
   break;
  }
 }
 
 function updateCalcLShapedSubOptions() {
  // Pour TOUS les types de virage en L, on utilise les deux dimensions
  // (les marches rayonnantes se situent à  l'intersection des deux volées)
  calcStandardRunContainer.style.display = 'none';
  calcLandingDimensions.style.display = 'block';
 }
 
 function updateCalcUShapedSubOptions() {
  const config = calcUShapedConfig ? calcUShapedConfig.value : 'rect_landing_rect';
  
  // Configurations avec marches rayonnantes
  const hasRadiating = config.includes('radiating');
  // Configurations avec palier
  const hasLanding = config.includes('landing');
  // Configurations avec 3 volées (combinaison palier + marches rayonnantes)
  // Toutes les configurations U ont 3 segments: 1er vertical, horizontal, dernier vertical
  const hasThreeFlights = config === 'rect_landing_rect' ||
      config === 'two_landings' ||
      config === 'rect_landing_radiating_rect' || 
      config === 'rect_radiating_landing_rect' ||
      config === 'rect_radiating_landing_radiating_rect';
  
  // Afficher/masquer le sélecteur d'angle des marches rayonnantes
  if (calcURadiatingAngleRow) {
  calcURadiatingAngleRow.style.display = hasRadiating ? 'block' : 'none';
  }
  
  // Afficher/masquer la 3ème volée
  if (uThirdFlightRow) {
  uThirdFlightRow.style.display = hasThreeFlights ? 'block' : 'none';
  }
  
  // Largeur du palier: toujours cachée (remplacée par Longueur 2ème partie)
  if (uLandingWidthRow) {
  uLandingWidthRow.style.display = 'none';
  }
  // Profondeur du palier: visible si palier présent
  if (uLandingDepthRow) {
  uLandingDepthRow.style.display = hasLanding ? 'block' : 'none';
  }
  
  // Mettre à  jour les labels des volées selon la configuration
  updateUFlightLabels(config);
 }
 
 function updateUFlightLabels(config) {
  const label1 = document.getElementById('uFirstFlightRunLabel');
  const label2 = document.getElementById('uSecondFlightRunLabel');
  const label3 = document.getElementById('uThirdFlightRunLabel');
  
  if (!label1 || !label2) return;
  
  if (config === 'rect_landing_rect' || config === 'two_landings') {
   // Palier seulement: segments incluent profondeur du palier
   label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="1er segment vertical du U (girons + profondeur du palier)">i</span>';
   label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Segment horizontal du U (largeur totale du palier)">i</span>';
   if (label3) label3.innerHTML = 'Longueur 3ème partie : <span class="info-icon" title="Dernier segment vertical du U (girons + profondeur du palier)">i</span>';
  } else {
   // Configurations avec rayonnantes: segments incluent landingDepth (zone palier/virage)
   label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="1er segment vertical du U (girons + profondeur zone virage)">i</span>';
   label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Segment horizontal du U (largeur totale zone centrale)">i</span>';
   if (label3) label3.innerHTML = 'Longueur 3ème partie : <span class="info-icon" title="Dernier segment vertical du U (girons + profondeur zone virage)">i</span>';
  }
 }
 
 function updateCalcDancingSubOptions() {
  const config = calcDancingStepsConfig ? calcDancingStepsConfig.value : 'l_dancing';
  
  // Afficher la 3ème volée seulement pour configuration U (2 virages)
  if (dancingThirdFlightRow) {
   dancingThirdFlightRow.style.display = config === 'u_dancing' ? 'block' : 'none';
  }
 }
 
 calcStairConfig.addEventListener('change', updateCalcConfigOptions);
 calcLShapedConfig.addEventListener('change', updateCalcLShapedSubOptions);
 if (calcUShapedConfig) {
  calcUShapedConfig.addEventListener('change', updateCalcUShapedSubOptions);
 }
 if (calcDancingStepsConfig) {
  calcDancingStepsConfig.addEventListener('change', updateCalcDancingSubOptions);
 }
 
 // Gestion de l'affichage des options Partie 3 (groupe d'usage)
 const calcPart3Options = document.getElementById('calcPart3Options');
 function updatePart3Options() {
  if (calcPart3Options) {
  calcPart3Options.style.display = calcBuildingType.value === 'part3' ? 'block' : 'none';
  }
 }
 calcBuildingType.addEventListener('change', updatePart3Options);
 updatePart3Options(); // Initialiser
 
 if (calcDancingAngle) {
  calcDancingAngle.addEventListener('change', function() {
  calcDancingCustomAngleContainer.style.display = this.value === 'custom' ? 'block' : 'none';
  });
 }
 
 // ===== Gestion des configurations d'escalier - Vérification =====
 
 function updateVerifyConfigOptions() {
  const config = stairConfig.value;
  
  lShapedOptions.style.display = 'none';
  dancingStepsOptions.style.display = 'none';
  spiralOptions.style.display = 'none';
  verifyLandingDimensions.style.display = 'none';
  
  switch (config) {
  case 'l_shaped':
   lShapedOptions.style.display = 'block';
   updateVerifyLShapedSubOptions();
   break;
  case 'dancing_steps':
   dancingStepsOptions.style.display = 'block';
   break;
  case 'spiral':
   spiralOptions.style.display = 'block';
   break;
  }
 }
 
 function updateVerifyLShapedSubOptions() {
  const lConfig = lShapedConfig.value;
  verifyLandingDimensions.style.display = lConfig === 'standard_landing' ? 'block' : 'none';
 }
 
 stairConfig.addEventListener('change', updateVerifyConfigOptions);
 lShapedConfig.addEventListener('change', updateVerifyLShapedSubOptions);
 
 // ===== Synchronisation des champs métriques/impériaux =====
 
 const inputPairs = [
  { metric: totalRun, imperial: totalRunImperial },
  { metric: totalRise, imperial: totalRiseImperial },
  { metric: stairDesiredWidth, imperial: stairDesiredWidthImperial },
  { metric: idealRiser, imperial: idealRiserImperial },
  { metric: idealTread, imperial: idealTreadImperial },
  { metric: firstFlightRun, imperial: firstFlightRunImperial },
  { metric: secondFlightRun, imperial: secondFlightRunImperial },
  { metric: stairWidth, imperial: stairWidthImperial },
  { metric: headroom, imperial: headroomImperial },
  { metric: riserHeight, imperial: riserHeightImperial },
  { metric: treadDepth, imperial: treadDepthImperial },
  { metric: landingDepth, imperial: landingDepthImperial },
  { metric: narrowSide, imperial: narrowSideImperial },
  { metric: spiralWidth, imperial: spiralWidthImperial },
  { metric: spiralTreadAt300, imperial: spiralTreadAt300Imperial },
  // Marches dansantes
  { metric: document.getElementById('calcDancingInnerRadius'), imperial: document.getElementById('calcDancingInnerRadiusImperial') },
  { metric: document.getElementById('dancingFirstFlightRun'), imperial: document.getElementById('dancingFirstFlightRunImperial') },
  { metric: document.getElementById('dancingSecondFlightRun'), imperial: document.getElementById('dancingSecondFlightRunImperial') },
  { metric: document.getElementById('dancingThirdFlightRun'), imperial: document.getElementById('dancingThirdFlightRunImperial') }
 ];
 
 inputPairs.forEach(pair => {
  if (pair.metric && pair.imperial) {
  pair.metric.addEventListener('input', function() {
   const val = parseFloat(this.value);
   if (!isNaN(val) && val > 0) {
    pair.imperial.value = metricToImperial(val);
   }
  });
  
  // Ne pas modifier la valeur pendant la saisie - seulement convertir
  pair.imperial.addEventListener('input', function() {
   const val = imperialToMetric(this.value);
   if (val !== null && val > 0) {
    pair.metric.value = val.toFixed(2);
   }
  });
  
  // Nettoyer/normaliser seulement à  la perte de focus
  pair.imperial.addEventListener('blur', function() {
   const validated = validateImperialInput(this.value);
   if (validated && validated !== this.value) {
    this.value = validated;
   }
  });
  }
 });
 
 // ===== Calcul d'escalier =====
 
 function performCalculation() {
  // Nettoyer les erreurs
  document.querySelectorAll('#calculator .error').forEach(el => el.textContent = '');
  
  const isMetric = calcMeasurementSystem.value === 'metric';
  const buildingTypeValue = calcBuildingType.value;
  const stairTypeValue = calcStairType.value;
  const stairConfigValue = calcStairConfig.value;
  const lShapedConfigValue = calcLShapedConfig ? calcLShapedConfig.value : null;
  const uShapedConfigValue = calcUShapedConfig ? calcUShapedConfig.value : null;
  
  // Récupérer le groupe d'usage (seulement pour Partie 3)
  const calcUsageGroup = document.getElementById('calcUsageGroup');
  const usageGroupValue = (buildingTypeValue === 'part3' && calcUsageGroup) ? calcUsageGroup.value : 'general';
  
  // Récupérer les valeurs selon le système de mesure
  let totalRiseValue, totalRunValue, stairWidthValue, idealRiserValue, idealTreadValue;
  let firstFlightRunValue = 0, secondFlightRunValue = 0;
  let uFirstFlightRunValue = 0, uSecondFlightRunValue = 0, uThirdFlightRunValue = 0;
  let uLandingWidthValue = 0, uLandingDepthValue = 0;
  let uRadiatingAngleValue = 45;
  
  // Variables pour marches dansantes
  let dancingConfigValue = 'l_dancing';
  let dancingAngleValue = 90;
  let dancingNumStepsValue = 3;
  let dancingInnerRadiusValue = 200;
  let dancingFirstFlightRunValue = 0, dancingSecondFlightRunValue = 0, dancingThirdFlightRunValue = 0;
  
  if (isMetric) {
  totalRiseValue = parseFloat(totalRise.value);
  stairWidthValue = parseFloat(stairDesiredWidth.value);
  idealRiserValue = idealRiser ? (parseFloat(idealRiser.value) || 0) : 0;
  idealTreadValue = idealTread ? (parseFloat(idealTread.value) || 0) : 0;
  
  // Pour TOUS les escaliers en L (palier standard ET marches rayonnantes)
  if (stairConfigValue === 'l_shaped') {
   firstFlightRunValue = parseFloat(firstFlightRun.value);
   secondFlightRunValue = parseFloat(secondFlightRun.value);
   totalRunValue = firstFlightRunValue + secondFlightRunValue;
  } else if (stairConfigValue === 'u_shaped') {
   // Pour escalier en U
   const uFirstFlightRunEl = document.getElementById('uFirstFlightRun');
   const uSecondFlightRunEl = document.getElementById('uSecondFlightRun');
   const uThirdFlightRunEl = document.getElementById('uThirdFlightRun');
   const uLandingWidthEl = document.getElementById('uLandingWidth');
   const uLandingDepthEl = document.getElementById('uLandingDepth');
   const uRadiatingAngleEl = document.getElementById('calcURadiatingAngle');
   
   uFirstFlightRunValue = uFirstFlightRunEl ? parseFloat(uFirstFlightRunEl.value) : 0;
   uSecondFlightRunValue = uSecondFlightRunEl ? parseFloat(uSecondFlightRunEl.value) : 0;
   uThirdFlightRunValue = uThirdFlightRunEl ? parseFloat(uThirdFlightRunEl.value) : 0;
   uLandingWidthValue = uLandingWidthEl ? parseFloat(uLandingWidthEl.value) : (2 * stairWidthValue);
   uLandingDepthValue = uLandingDepthEl ? parseFloat(uLandingDepthEl.value) : stairWidthValue;
   uRadiatingAngleValue = uRadiatingAngleEl ? parseInt(uRadiatingAngleEl.value) : 45;
   
   totalRunValue = uFirstFlightRunValue + uSecondFlightRunValue + (uThirdFlightRunValue || 0);
  } else if (stairConfigValue === 'dancing_steps') {
   // Pour escalier avec marches dansantes
   const dancingConfigEl = document.getElementById('calcDancingStepsConfig');
   const dancingAngleEl = document.getElementById('calcDancingAngle');
   const dancingCustomAngleEl = document.getElementById('calcDancingCustomAngle');
   const dancingNumStepsEl = document.getElementById('calcDancingNumSteps');
   const dancingInnerRadiusEl = document.getElementById('calcDancingInnerRadius');
   const dancingFirstFlightEl = document.getElementById('dancingFirstFlightRun');
   const dancingSecondFlightEl = document.getElementById('dancingSecondFlightRun');
   const dancingThirdFlightEl = document.getElementById('dancingThirdFlightRun');
   
   dancingConfigValue = dancingConfigEl ? dancingConfigEl.value : 'l_dancing';
   
   // Récupérer l'angle (standard ou personnalisé)
   const angleSelect = dancingAngleEl ? dancingAngleEl.value : '90';
   if (angleSelect === 'custom' && dancingCustomAngleEl) {
    dancingAngleValue = parseFloat(dancingCustomAngleEl.value) || 90;
   } else {
    dancingAngleValue = parseInt(angleSelect) || 90;
   }
   
   dancingNumStepsValue = dancingNumStepsEl ? parseInt(dancingNumStepsEl.value) : 3;
   dancingInnerRadiusValue = dancingInnerRadiusEl ? parseFloat(dancingInnerRadiusEl.value) : 200;
   dancingFirstFlightRunValue = dancingFirstFlightEl ? parseFloat(dancingFirstFlightEl.value) : 0;
   dancingSecondFlightRunValue = dancingSecondFlightEl ? parseFloat(dancingSecondFlightEl.value) : 0;
   dancingThirdFlightRunValue = dancingThirdFlightEl ? parseFloat(dancingThirdFlightEl.value) : 0;
   
   totalRunValue = dancingFirstFlightRunValue + dancingSecondFlightRunValue + (dancingConfigValue === 'u_dancing' ? dancingThirdFlightRunValue : 0);
  } else {
   totalRunValue = parseFloat(totalRun.value);
  }
  } else {
  totalRiseValue = imperialToMetric(validateImperialInput(totalRiseImperial.value));
  stairWidthValue = imperialToMetric(validateImperialInput(stairDesiredWidthImperial.value));
  idealRiserValue = idealRiserImperial ? (imperialToMetric(validateImperialInput(idealRiserImperial.value)) || 0) : 0;
  idealTreadValue = idealTreadImperial ? (imperialToMetric(validateImperialInput(idealTreadImperial.value)) || 0) : 0;
  
  // Pour TOUS les escaliers en L (palier standard ET marches rayonnantes)
  if (stairConfigValue === 'l_shaped') {
   firstFlightRunValue = imperialToMetric(validateImperialInput(firstFlightRunImperial.value));
   secondFlightRunValue = imperialToMetric(validateImperialInput(secondFlightRunImperial.value));
   totalRunValue = firstFlightRunValue + secondFlightRunValue;
  } else if (stairConfigValue === 'u_shaped') {
   // Pour escalier en U
   const uFirstFlightRunImpEl = document.getElementById('uFirstFlightRunImperial');
   const uSecondFlightRunImpEl = document.getElementById('uSecondFlightRunImperial');
   const uThirdFlightRunImpEl = document.getElementById('uThirdFlightRunImperial');
   const uLandingWidthImpEl = document.getElementById('uLandingWidthImperial');
   const uLandingDepthImpEl = document.getElementById('uLandingDepthImperial');
   const uRadiatingAngleEl = document.getElementById('calcURadiatingAngle');
   
   uFirstFlightRunValue = uFirstFlightRunImpEl ? imperialToMetric(validateImperialInput(uFirstFlightRunImpEl.value)) : 0;
   uSecondFlightRunValue = uSecondFlightRunImpEl ? imperialToMetric(validateImperialInput(uSecondFlightRunImpEl.value)) : 0;
   uThirdFlightRunValue = uThirdFlightRunImpEl ? imperialToMetric(validateImperialInput(uThirdFlightRunImpEl.value)) : 0;
   uLandingWidthValue = uLandingWidthImpEl ? imperialToMetric(validateImperialInput(uLandingWidthImpEl.value)) : (2 * stairWidthValue);
   uLandingDepthValue = uLandingDepthImpEl ? imperialToMetric(validateImperialInput(uLandingDepthImpEl.value)) : stairWidthValue;
   uRadiatingAngleValue = uRadiatingAngleEl ? parseInt(uRadiatingAngleEl.value) : 45;
   
   totalRunValue = uFirstFlightRunValue + uSecondFlightRunValue + (uThirdFlightRunValue || 0);
  } else if (stairConfigValue === 'dancing_steps') {
   // Pour escalier avec marches dansantes (impérial)
   const dancingConfigEl = document.getElementById('calcDancingStepsConfig');
   const dancingAngleEl = document.getElementById('calcDancingAngle');
   const dancingCustomAngleEl = document.getElementById('calcDancingCustomAngle');
   const dancingNumStepsEl = document.getElementById('calcDancingNumSteps');
   const dancingInnerRadiusImpEl = document.getElementById('calcDancingInnerRadiusImperial');
   const dancingFirstFlightImpEl = document.getElementById('dancingFirstFlightRunImperial');
   const dancingSecondFlightImpEl = document.getElementById('dancingSecondFlightRunImperial');
   const dancingThirdFlightImpEl = document.getElementById('dancingThirdFlightRunImperial');
   
   dancingConfigValue = dancingConfigEl ? dancingConfigEl.value : 'l_dancing';
   
   // Récupérer l'angle (standard ou personnalisé)
   const angleSelect = dancingAngleEl ? dancingAngleEl.value : '90';
   if (angleSelect === 'custom' && dancingCustomAngleEl) {
    dancingAngleValue = parseFloat(dancingCustomAngleEl.value) || 90;
   } else {
    dancingAngleValue = parseInt(angleSelect) || 90;
   }
   
   dancingNumStepsValue = dancingNumStepsEl ? parseInt(dancingNumStepsEl.value) : 3;
   dancingInnerRadiusValue = dancingInnerRadiusImpEl ? imperialToMetric(validateImperialInput(dancingInnerRadiusImpEl.value)) : 200;
   dancingFirstFlightRunValue = dancingFirstFlightImpEl ? imperialToMetric(validateImperialInput(dancingFirstFlightImpEl.value)) : 0;
   dancingSecondFlightRunValue = dancingSecondFlightImpEl ? imperialToMetric(validateImperialInput(dancingSecondFlightImpEl.value)) : 0;
   dancingThirdFlightRunValue = dancingThirdFlightImpEl ? imperialToMetric(validateImperialInput(dancingThirdFlightImpEl.value)) : 0;
   
   totalRunValue = dancingFirstFlightRunValue + dancingSecondFlightRunValue + (dancingConfigValue === 'u_dancing' ? dancingThirdFlightRunValue : 0);
  } else {
   totalRunValue = imperialToMetric(validateImperialInput(totalRunImperial.value));
  }
  }
  
  // Validation
  let isValid = true;
  
  if (isNaN(totalRiseValue) || totalRiseValue <= 0) {
  document.getElementById('totalRiseError').textContent = 'Veuillez entrer une hauteur valide.';
  isValid = false;
  }
  
  // Pour TOUS les escaliers en L (palier standard ET marches rayonnantes)
  if (stairConfigValue === 'l_shaped') {
  if (isNaN(firstFlightRunValue) || firstFlightRunValue <= 0) {
   document.getElementById('firstFlightRunError').textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  if (isNaN(secondFlightRunValue) || secondFlightRunValue <= 0) {
   document.getElementById('secondFlightRunError').textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  // Validation CNB 9.8.6.3 pour escalier en L avec palier standard:
  // Le palier doit être au moins aussi large et aussi long que la largeur de l'escalier
  // Donc chaque côté (firstFlightRun et secondFlightRun) doit pouvoir contenir:
  // - le palier (= largeur escalier) + au moins un giron minimum
  if (lShapedConfigValue === 'standard_landing' && stairWidthValue > 0) {
   const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
   const minTread = limits.minTread || 255;
   const minDimensionRequired = stairWidthValue + minTread;
   
   if (firstFlightRunValue > 0 && firstFlightRunValue < minDimensionRequired) {
    const errEl = document.getElementById('firstFlightRunError');
    if (errEl) {
    if (isMetric) {
     errEl.textContent = `Dimension insuffisante pour palier CNB 9.8.6.3: min. ${minDimensionRequired.toFixed(0)} mm (palier ${stairWidthValue.toFixed(0)} mm + giron min. ${minTread} mm)`;
    } else {
     errEl.textContent = `Dimension insuffisante pour palier CNB 9.8.6.3: min. ${metricToImperial(minDimensionRequired)} (palier + giron min.)`;
    }
    }
    isValid = false;
   }
   if (secondFlightRunValue > 0 && secondFlightRunValue < minDimensionRequired) {
    const errEl = document.getElementById('secondFlightRunError');
    if (errEl) {
    if (isMetric) {
     errEl.textContent = `Dimension insuffisante pour palier CNB 9.8.6.3: min. ${minDimensionRequired.toFixed(0)} mm (palier ${stairWidthValue.toFixed(0)} mm + giron min. ${minTread} mm)`;
    } else {
     errEl.textContent = `Dimension insuffisante pour palier CNB 9.8.6.3: min. ${metricToImperial(minDimensionRequired)} (palier + giron min.)`;
    }
    }
    isValid = false;
   }
  }
  } else if (stairConfigValue === 'u_shaped') {
  // Validation pour escalier en U
  if (isNaN(uFirstFlightRunValue) || uFirstFlightRunValue <= 0) {
   const errEl = document.getElementById('uFirstFlightRunError');
   if (errEl) errEl.textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  if (isNaN(uSecondFlightRunValue) || uSecondFlightRunValue <= 0) {
   const errEl = document.getElementById('uSecondFlightRunError');
   if (errEl) errEl.textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  // Validation: Largeur palier ≥ 2 × largeur escalier
  if (uLandingWidthValue > 0 && stairWidthValue > 0 && uLandingWidthValue < (2 * stairWidthValue)) {
   const errEl = document.getElementById('uLandingWidthError');
   if (errEl) {
    if (isMetric) {
    errEl.textContent = `La largeur du palier (${uLandingWidthValue.toFixed(0)} mm) ne peut être inférieure au double de la largeur de l'escalier (${(2 * stairWidthValue).toFixed(0)} mm) pour cette configuration en U.`;
    } else {
    errEl.textContent = `La largeur du palier ne peut être inférieure au double de la largeur de l'escalier (min. ${metricToImperial(2 * stairWidthValue)}) pour cette configuration en U.`;
    }
   }
   isValid = false;
  }
  // Validation: Profondeur palier >= largeur escalier (CNB 9.8.6.3)
  if (uLandingDepthValue > 0 && stairWidthValue > 0 && uLandingDepthValue < stairWidthValue) {
   const errEl = document.getElementById('uLandingDepthError');
   if (errEl) {
    if (isMetric) {
    errEl.textContent = `La profondeur du palier (${uLandingDepthValue.toFixed(0)} mm) ne peut être inférieure à  la largeur de l'escalier (${stairWidthValue.toFixed(0)} mm) selon CNB 9.8.6.3.`;
    } else {
    errEl.textContent = `La profondeur du palier ne peut être inférieure à  la largeur de l'escalier (min. ${metricToImperial(stairWidthValue)}) selon CNB 9.8.6.3.`;
    }
   }
   isValid = false;
  }
  // Validation CNB 9.8.6.3 pour configurations avec palier:
  // Vérifier que la 2ème partie (segment horizontal) peut contenir les éléments requis
  // Note: Ces validations sont des AVERTISSEMENTS, pas des blocages
  const uConfigHasLanding = uShapedConfigValue && (
   uShapedConfigValue.includes('landing') || 
   uShapedConfigValue === 'rect_landing_rect' || 
   uShapedConfigValue === 'two_landings'
  );
  
  // Vérifier la profondeur du palier si fournie
  if (uConfigHasLanding && uLandingDepthValue > 0 && stairWidthValue > 0) {
   // CNB 9.8.6.3: Profondeur palier >= largeur escalier
   if (uLandingDepthValue < stairWidthValue) {
    const errEl = document.getElementById('uLandingDepthError');
    if (errEl) {
    if (isMetric) {
     errEl.textContent = `CNB 9.8.6.3: Profondeur palier (${uLandingDepthValue.toFixed(0)} mm) < largeur escalier (${stairWidthValue.toFixed(0)} mm)`;
    } else {
     errEl.textContent = `CNB 9.8.6.3: Profondeur palier < largeur escalier (min. ${metricToImperial(stairWidthValue)})`;
    }
    }
    // Avertissement seulement, ne pas bloquer
   }
  }
  
  // Validation 2ème partie pour configs avec 2 coins rayonnants + palier central
  if (uShapedConfigValue === 'rect_radiating_landing_radiating_rect' && stairWidthValue > 0 && uSecondFlightRunValue > 0) {
   // Minimum: 2×stairWidth (coins) + profondeur palier fournie
   const actualLandingDepth = uLandingDepthValue || stairWidthValue;
   const minRequiredWidth = (2 * stairWidthValue) + actualLandingDepth;
   
   if (uSecondFlightRunValue < minRequiredWidth) {
    const errEl = document.getElementById('uSecondFlightRunError');
    if (errEl) {
    if (isMetric) {
     errEl.textContent = `Avertissement: min. recommandé ${minRequiredWidth.toFixed(0)} mm (2×${stairWidthValue.toFixed(0)} + palier ${actualLandingDepth.toFixed(0)})`;
    } else {
     errEl.textContent = `Avertissement: min. recommandé ${metricToImperial(minRequiredWidth)}`;
    }
    }
    // Avertissement seulement, ne pas bloquer
   }
  }
  } else if (stairConfigValue !== 'spiral') {
  if (isNaN(totalRunValue) || totalRunValue <= 0) {
   document.getElementById('totalRunError').textContent = 'Veuillez entrer une longueur valide.';
   isValid = false;
  }
  }
  
  if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
  document.getElementById('stairDesiredWidthError').textContent = 'Veuillez entrer une largeur valide.';
  isValid = false;
  }
  
  // Validation pour escalier avec marches dansantes
  if (stairConfigValue === 'dancing_steps') {
  if (isNaN(dancingFirstFlightRunValue) || dancingFirstFlightRunValue <= 0) {
   const errEl = document.getElementById('dancingFirstFlightRunError');
   if (errEl) errEl.textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  if (isNaN(dancingSecondFlightRunValue) || dancingSecondFlightRunValue <= 0) {
   const errEl = document.getElementById('dancingSecondFlightRunError');
   if (errEl) errEl.textContent = 'Veuillez entrer une valeur valide.';
   isValid = false;
  }
  if (dancingConfigValue === 'u_dancing') {
   if (isNaN(dancingThirdFlightRunValue) || dancingThirdFlightRunValue <= 0) {
    const errEl = document.getElementById('dancingThirdFlightRunError');
    if (errEl) errEl.textContent = 'Veuillez entrer une valeur valide pour la 3ème partie.';
    isValid = false;
   }
  }
  if (isNaN(dancingInnerRadiusValue) || dancingInnerRadiusValue <= 0) {
   const errEl = document.getElementById('calcDancingInnerRadiusError');
   if (errEl) errEl.textContent = 'Veuillez entrer un rayon intérieur valide.';
   isValid = false;
  }
  }
  
  if (!isValid) return;
  
  // Vérifier si la configuration est permise selon CNB A-9.8.3.1
  const resultDiv = document.getElementById('calculatorResult');
  const contentDiv = document.getElementById('calculatorResultContent');
  
  // Marches rayonnantes: permises uniquement dans logements privés (Partie 9)
  if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
  if (buildingTypeValue === 'part3') {
   contentDiv.innerHTML = '<h3>✗ Configuration non permise</h3>' +
    '<div class="warning"><p>Les marches rayonnantes ne sont pas permises pour les bâtiments de Partie 3 (CNB A-9.8.3.1 Tableau).</p>' +
    '<p><strong>Solutions :</strong></p><ul>' +
    '<li>Utilisez un palier standard au lieu des marches rayonnantes</li>' +
    '<li>Utilisez un escalier droit ou tournant avec volées droites</li></ul></div>';
   resultDiv.className = 'result non-compliant';
   resultDiv.style.display = 'block';
   return;
  }
  if (stairTypeValue === 'common') {
   contentDiv.innerHTML = '<h3>✗ Configuration non permise</h3>' +
    '<div class="warning"><p>Les marches rayonnantes ne sont pas permises pour les escaliers communs (CNB A-9.8.3.1 Tableau).</p>' +
    '<p><strong>Solutions :</strong></p><ul>' +
    '<li>Utilisez un palier standard au lieu des marches rayonnantes</li>' +
    '<li>Les marches rayonnantes sont réservées aux escaliers privés dans les logements</li></ul></div>';
   resultDiv.className = 'result non-compliant';
   resultDiv.style.display = 'block';
   return;
  }
  }
  
  // Marches rayonnantes dans escaliers en U: permises uniquement dans logements privés (Partie 9)
  const uShapedHasRadiating = stairConfigValue === 'u_shaped' && uShapedConfigValue && uShapedConfigValue.includes('radiating');
  if (uShapedHasRadiating) {
  if (buildingTypeValue === 'part3') {
   contentDiv.innerHTML = '<h3>✗ Configuration non permise</h3>' +
    '<div class="warning"><p>Les marches rayonnantes ne sont pas permises pour les bâtiments de Partie 3 (CNB A-9.8.3.1 Tableau).</p>' +
    '<p><strong>Solutions :</strong></p><ul>' +
    '<li>Utilisez un palier standard au lieu des marches rayonnantes</li>' +
    '<li>Sélectionnez la configuration "Marche(s) rectangulaire(s) + palier + marche(s) rectangulaire(s)"</li></ul></div>';
   resultDiv.className = 'result non-compliant';
   resultDiv.style.display = 'block';
   return;
  }
  if (stairTypeValue === 'common') {
   contentDiv.innerHTML = '<h3>✗ Configuration non permise</h3>' +
    '<div class="warning"><p>Les marches rayonnantes ne sont pas permises pour les escaliers communs (CNB A-9.8.3.1 Tableau).</p>' +
    '<p><strong>Solutions :</strong></p><ul>' +
    '<li>Utilisez un palier standard au lieu des marches rayonnantes</li>' +
    '<li>Les marches rayonnantes sont réservées aux escaliers privés dans les logements</li></ul></div>';
   resultDiv.className = 'result non-compliant';
   resultDiv.style.display = 'block';
   return;
  }
  }
  
  // Escalier hélicoïdal: pas permis pour Partie 3 comme issue
  if (stairConfigValue === 'spiral' && buildingTypeValue === 'part3') {
  contentDiv.innerHTML = '<h3>✗ Configuration non permise</h3>' +
   '<div class="warning"><p>Les escaliers hélicoïdaux ne sont pas permis pour les bâtiments de Partie 3 (CNB 9.8.4.7.(3)).</p>' +
   '<p><strong>Solutions :</strong></p><ul>' +
   '<li>Utilisez un escalier droit ou avec palier</li>' +
   '<li>Les hélicoïdaux sont réservés aux logements de Partie 9</li></ul></div>';
  resultDiv.className = 'result non-compliant';
  resultDiv.style.display = 'block';
  return;
  }
  
  // Priorité de conception
  const priorityRadio = document.querySelector('input[name="calcPriority"]:checked');
  const priority = priorityRadio ? priorityRadio.value : 'comfort';
  
  // Déterminer les valeurs de volées selon la configuration
  let flight1RunForCalc = firstFlightRunValue;
  let flight2RunForCalc = secondFlightRunValue;
  let flight3RunForCalc = 0;
  let landingWidthForCalc = 2 * stairWidthValue;
  let landingDepthForCalc = stairWidthValue;
  
  if (stairConfigValue === 'u_shaped') {
  flight1RunForCalc = uFirstFlightRunValue;
  flight2RunForCalc = uSecondFlightRunValue;
  flight3RunForCalc = uThirdFlightRunValue || 0;
  landingWidthForCalc = uLandingWidthValue || (2 * stairWidthValue);
  landingDepthForCalc = uLandingDepthValue || stairWidthValue;
  } else if (stairConfigValue === 'dancing_steps') {
  flight1RunForCalc = dancingFirstFlightRunValue;
  flight2RunForCalc = dancingSecondFlightRunValue;
  flight3RunForCalc = dancingConfigValue === 'u_dancing' ? dancingThirdFlightRunValue : 0;
  }
  
  // Calculer l'espace entre les volées (si largeur palier > 2× largeur escalier)
  const spaceBetweenFlights = Math.max(0, landingWidthForCalc - (2 * stairWidthValue));
  
  // Calculer
  const solutions = calculateOptimalStair({
  totalRise: totalRiseValue,
  totalRun: totalRunValue,
  firstFlightRun: flight1RunForCalc,
  secondFlightRun: flight2RunForCalc,
  thirdFlightRun: flight3RunForCalc,
  flight1Run: flight1RunForCalc,
  flight2Run: flight2RunForCalc,
  flight3Run: flight3RunForCalc,
  stairWidth: stairWidthValue,
  landingDepth: landingDepthForCalc,
  landingWidth: landingWidthForCalc,
  landingLength: landingDepthForCalc,
  spaceBetweenFlights: spaceBetweenFlights,
  buildingType: buildingTypeValue,
  stairType: stairTypeValue,
  stairConfig: stairConfigValue,
  lShapedConfig: lShapedConfigValue,
  uShapedConfig: uShapedConfigValue,
  radiatingAngle: uRadiatingAngleValue,
  // Paramètres marches dansantes
  dancingConfig: dancingConfigValue,
  dancingAngle: dancingAngleValue,
  dancingNumSteps: dancingNumStepsValue,
  innerRadius: dancingInnerRadiusValue,
  usageGroup: usageGroupValue,
  idealRiser: idealRiserValue,
  idealTread: idealTreadValue,
  priority: priority
  });
  
  // Stocker les paramètres pour reformatage
  lastCalculatorParams = {
  totalRiseValue,
  totalRunValue,
  firstFlightRunValue: flight1RunForCalc,
  secondFlightRunValue: flight2RunForCalc,
  thirdFlightRunValue: flight3RunForCalc,
  uFirstFlightRunValue,
  uSecondFlightRunValue,
  uThirdFlightRunValue,
  uLandingWidthValue: landingWidthForCalc,
  uLandingDepthValue: landingDepthForCalc,
  uRadiatingAngleValue,
  spaceBetweenFlights,
  stairWidthValue,
  buildingTypeValue,
  stairTypeValue,
  stairConfigValue,
  lShapedConfigValue,
  uShapedConfigValue,
  // Paramètres marches dansantes
  dancingConfigValue,
  dancingAngleValue,
  dancingNumStepsValue,
  dancingInnerRadiusValue,
  dancingFirstFlightRunValue,
  dancingSecondFlightRunValue,
  dancingThirdFlightRunValue,
  usageGroupValue,
  isMetric,
  solutions
  };
  
  displayCalculatorResults(solutions, lastCalculatorParams);
 }
 
 calculateButton.addEventListener('click', performCalculation);
 
 // Recalcul automatique lors du changement de priorité
 document.querySelectorAll('input[name="calcPriority"]').forEach(radio => {
  radio.addEventListener('change', function() {
  if (lastCalculatorParams) {
   performCalculation();
  }
  });
 });
 
 // ===== Vérification de conformité =====
 
 function performVerification() {
  // Nettoyer les erreurs
  document.querySelectorAll('#verification .error').forEach(el => el.textContent = '');
  
  const isMetric = measurementSystem.value === 'metric';
  const buildingTypeValue = buildingType.value;
  const stairTypeValue = stairType.value;
  const stairConfigValue = stairConfig.value;
  const lShapedConfigValue = lShapedConfig ? lShapedConfig.value : null;
  const spiralConfigValue = document.getElementById('spiralConfig')?.value;
  const stairUseValue = document.getElementById('stairUse')?.value;
  
  // Récupérer les valeurs
  let riserValue, treadValue, widthValue, headroomValue;
  let narrowSideValue = 0, spiralWidthValue = 0, landingDepthValue = 0;
  let spiralTreadAt300Value = 0;
  
  if (isMetric) {
  riserValue = parseFloat(riserHeight.value);
  treadValue = parseFloat(treadDepth.value);
  widthValue = parseFloat(stairWidth.value);
  headroomValue = parseFloat(headroom.value);
  narrowSideValue = parseFloat(narrowSide?.value) || 0;
  spiralWidthValue = parseFloat(spiralWidth?.value) || 0;
  spiralTreadAt300Value = parseFloat(spiralTreadAt300?.value) || 0;
  landingDepthValue = parseFloat(landingDepth?.value) || 0;
  } else {
  riserValue = imperialToMetric(validateImperialInput(riserHeightImperial.value));
  treadValue = imperialToMetric(validateImperialInput(treadDepthImperial.value));
  widthValue = imperialToMetric(validateImperialInput(stairWidthImperial.value));
  headroomValue = imperialToMetric(validateImperialInput(headroomImperial.value));
  narrowSideValue = imperialToMetric(validateImperialInput(narrowSideImperial?.value)) || 0;
  spiralWidthValue = imperialToMetric(validateImperialInput(spiralWidthImperial?.value)) || 0;
  spiralTreadAt300Value = imperialToMetric(validateImperialInput(spiralTreadAt300Imperial?.value)) || 0;
  landingDepthValue = imperialToMetric(validateImperialInput(landingDepthImperial?.value)) || 0;
  }
  
  // Validation de base
  let isValid = true;
  
  if (isNaN(riserValue) || riserValue <= 0) {
  document.getElementById('riserHeightError').textContent = 'Valeur requise.';
  isValid = false;
  }
  if (isNaN(treadValue) || treadValue <= 0) {
  document.getElementById('treadDepthError').textContent = 'Valeur requise.';
  isValid = false;
  }
  if (isNaN(widthValue) || widthValue <= 0) {
  document.getElementById('stairWidthError').textContent = 'Valeur requise.';
  isValid = false;
  }
  if (isNaN(headroomValue) || headroomValue <= 0) {
  document.getElementById('headroomError').textContent = 'Valeur requise.';
  isValid = false;
  }
  
  if (!isValid) return;
  
  // Obtenir les limites CNB
  const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
  const codeReference = buildingTypeValue === 'part3' ? 'CNB 2020 Partie 3' : 'CNB 2020 Partie 9';
  
  // Vérifications
  const issues = [];
  let isCompliant = true;
  
  // Contremarche
  if (riserValue < limits.minRiser) {
  issues.push(`Contremarche ${riserValue.toFixed(0)} mm < minimum ${limits.minRiser} mm`);
  isCompliant = false;
  }
  if (riserValue > limits.maxRiser) {
  issues.push(`Contremarche ${riserValue.toFixed(0)} mm > maximum ${limits.maxRiser} mm`);
  isCompliant = false;
  }
  
  // Giron
  if (treadValue < limits.minTread) {
  issues.push(`Giron ${treadValue.toFixed(0)} mm < minimum ${limits.minTread} mm`);
  isCompliant = false;
  }
  // Vérifier le maximum seulement s'il y a une limite (pas "Aucune limite")
  if (limits.maxTread < 9000 && treadValue > limits.maxTread) {
  issues.push(`Giron ${treadValue.toFixed(0)} mm > maximum ${limits.maxTread} mm`);
  isCompliant = false;
  }
  
  // Largeur
  if (widthValue < limits.minWidth) {
  issues.push(`Largeur ${widthValue.toFixed(0)} mm < minimum ${limits.minWidth} mm`);
  isCompliant = false;
  }
  
  // Échappée (sauf hélicoïdal qui a ses propres règles)
  if (stairConfigValue !== 'spiral' && headroomValue < limits.minHeadroom) {
  issues.push(`Échappée ${headroomValue.toFixed(0)} mm < minimum ${limits.minHeadroom} mm`);
  isCompliant = false;
  }
  
  // Vérifications spécifiques à  la configuration
  if (stairConfigValue === 'dancing_steps' && narrowSideValue > 0) {
  if (narrowSideValue < limits.minNarrowSide) {
   issues.push(`Giron côté étroit ${narrowSideValue.toFixed(0)} mm < minimum ${limits.minNarrowSide} mm à  300 mm de l'axe`);
   isCompliant = false;
  }
  // Marches dansantes non permises comme issue selon CNB 9.8.3.1 et 3.4.6.9
  if (stairUseValue === 'exit') {
   issues.push('Marches dansantes non permises dans un escalier d\'issue (CNB 9.8.3.1, 3.4.6.9)');
   isCompliant = false;
  }
  }
  
  // Vérifications pour escaliers en L avec marches rayonnantes
  if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
  // Marches rayonnantes permises uniquement dans logements privés (CNB 9.8.3.1 et A-9.8.3.1)
  if (stairTypeValue === 'common') {
   issues.push('Marches rayonnantes non permises pour escaliers communs (CNB A-9.8.3.1 Tableau)');
   isCompliant = false;
  }
  if (stairUseValue === 'exit') {
   issues.push('Marches rayonnantes non permises dans un escalier d\'issue (CNB 9.8.3.1)');
   isCompliant = false;
  }
  if (buildingTypeValue === 'part3') {
   issues.push('Marches rayonnantes non permises pour Partie 3 (CNB A-9.8.3.1 Tableau)');
   isCompliant = false;
  }
  }
  
  if (stairConfigValue === 'spiral') {
  // Vérifications spécifiques pour escaliers hélicoïdaux (CNB 9.8.4.7)
  if (spiralWidthValue > 0 && spiralWidthValue < CNB_LIMITS.spiral.minWidth) {
   issues.push(`Largeur libre ${spiralWidthValue.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minWidth} mm (CNB 9.8.4.7.(1)b)`);
   isCompliant = false;
  }
  if (spiralTreadAt300Value > 0 && spiralTreadAt300Value < CNB_LIMITS.spiral.minTreadAt300) {
   issues.push(`Giron à  300 mm ${spiralTreadAt300Value.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minTreadAt300} mm (CNB 9.8.4.7.(1)d)`);
   isCompliant = false;
  }
  // Échappée spécifique pour hélicoïdal: 1980 mm (CNB 9.8.4.7.(1)e)
  if (headroomValue > 0 && headroomValue < CNB_LIMITS.spiral.minHeadroom) {
   issues.push(`Échappée ${headroomValue.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minHeadroom} mm pour hélicoïdal (CNB 9.8.4.7.(1)e)`);
   isCompliant = false;
  }
  // Contremarche max pour hélicoïdal: 240 mm (CNB 9.8.4.7.(1)c)
  if (riserValue > CNB_LIMITS.spiral.maxRiser) {
   issues.push(`Contremarche ${riserValue.toFixed(0)} mm > maximum ${CNB_LIMITS.spiral.maxRiser} mm pour hélicoïdal (CNB 9.8.4.7.(1)c)`);
   isCompliant = false;
  }
  if (stairUseValue === 'exit') {
   issues.push('Escalier hélicoïdal interdit comme issue (CNB 9.8.4.7.(3))');
   isCompliant = false;
  }
  }
  
  if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
  // CNB 9.8.6.3.(1): Les paliers doivent être au moins aussi larges et aussi longs que la largeur de l'escalier
  if (landingDepthValue > 0 && landingDepthValue < widthValue) {
   issues.push(`Profondeur palier ${landingDepthValue.toFixed(0)} mm < largeur escalier ${widthValue.toFixed(0)} mm (CNB 9.8.6.3)`);
   isCompliant = false;
  }
  }
  
  // Règle du pas
  const stepRule = checkStepRule(riserValue, treadValue);
  
  // Stocker pour reformatage
  lastVerificationParams = {
  isCompliant,
  issues,
  stepRule,
  codeReference,
  isMetric,
  riserValue,
  treadValue
  };
  
  displayVerificationResults(lastVerificationParams);
 }
 
 checkButton.addEventListener('click', performVerification);
 
 // ===== Support touche Entrée =====
 
 const allInputs = document.querySelectorAll('input[type="text"]');
 allInputs.forEach(input => {
  input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
   e.preventDefault();
   const tab = this.closest('.tab-content');
   if (tab.id === 'calculator') {
    calculateButton.click();
   } else {
    checkButton.click();
   }
  }
  });
 });
 
 // ===== Initialisation =====
 
 updateMeasurementSystem('calculator');
 updateMeasurementSystem('verification');
 updateCalcConfigOptions();
 updateVerifyConfigOptions();
 
 // ===== VALIDATION EN TEMPS RÉEL DES CHAMPS =====
 
 /**
  * Valide les champs pour l'escalier en U et affiche les erreurs
  * Règles:
  * - Largeur palier ≥ 2 × largeur escalier (géométrie)
  * - Profondeur palier ≥ largeur escalier (CNB 9.8.6.3)
  */
 function validateUShapedInputs() {
  const stairConfigSelect = document.getElementById('calcStairConfig');
  if (!stairConfigSelect || stairConfigSelect.value !== 'u_shaped') return;
  
  const measurementSelect = document.getElementById('calcMeasurementSystem');
  const isMetric = !measurementSelect || measurementSelect.value === 'metric';
  
  // Récupérer les valeurs
  let stairWidth = 0, landingWidth = 0, landingDepth = 0;
  
  if (isMetric) {
  const widthEl = document.getElementById('stairDesiredWidth');
  const landingWidthEl = document.getElementById('uLandingWidth');
  const landingDepthEl = document.getElementById('uLandingDepth');
  stairWidth = widthEl ? parseFloat(widthEl.value) || 0 : 0;
  landingWidth = landingWidthEl ? parseFloat(landingWidthEl.value) || 0 : 0;
  landingDepth = landingDepthEl ? parseFloat(landingDepthEl.value) || 0 : 0;
  } else {
  const widthEl = document.getElementById('stairDesiredWidthImperial');
  const landingWidthEl = document.getElementById('uLandingWidthImperial');
  const landingDepthEl = document.getElementById('uLandingDepthImperial');
  stairWidth = widthEl ? imperialToMetric(validateImperialInput(widthEl.value)) || 0 : 0;
  landingWidth = landingWidthEl ? imperialToMetric(validateImperialInput(landingWidthEl.value)) || 0 : 0;
  landingDepth = landingDepthEl ? imperialToMetric(validateImperialInput(landingDepthEl.value)) || 0 : 0;
  }
  
  // Valider: Largeur palier ≥ 2 × largeur escalier
  const landingWidthError = document.getElementById('uLandingWidthError');
  if (landingWidthError) {
  if (stairWidth > 0 && landingWidth > 0 && landingWidth < (2 * stairWidth)) {
   const minRequired = 2 * stairWidth;
   if (isMetric) {
    landingWidthError.textContent = `La largeur du palier (${landingWidth.toFixed(0)} mm) ne peut être inférieure au double de la largeur de l'escalier (${minRequired.toFixed(0)} mm) pour cette configuration en U.`;
   } else {
    landingWidthError.textContent = `La largeur du palier ne peut être inférieure au double de la largeur de l'escalier (min. ${metricToImperial(minRequired)}) pour cette configuration en U.`;
   }
  } else {
   landingWidthError.textContent = '';
  }
  }
  
  // Valider: Profondeur palier ≥ largeur escalier (CNB 9.8.6.3)
  const landingDepthError = document.getElementById('uLandingDepthError');
  if (landingDepthError) {
  if (stairWidth > 0 && landingDepth > 0 && landingDepth < stairWidth) {
   if (isMetric) {
    landingDepthError.textContent = `La profondeur du palier (${landingDepth.toFixed(0)} mm) ne peut être inférieure à  la largeur de l'escalier (${stairWidth.toFixed(0)} mm) selon CNB 9.8.6.3.`;
   } else {
    landingDepthError.textContent = `La profondeur du palier ne peut être inférieure à  la largeur de l'escalier (min. ${metricToImperial(stairWidth)}) selon CNB 9.8.6.3.`;
   }
  } else {
   landingDepthError.textContent = '';
  }
  }
  
  // Aussi valider la largeur de l'escalier si les dimensions du palier sont déjà  saisies
  const stairWidthError = document.getElementById('stairDesiredWidthError');
  if (stairWidthError && stairWidth > 0) {
  // Vérifier si largeur escalier est compatible avec largeur palier déjà  saisie
  if (landingWidth > 0 && landingWidth < (2 * stairWidth)) {
   if (isMetric) {
    stairWidthError.textContent = `Pour une largeur de palier de ${landingWidth.toFixed(0)} mm, la largeur d'escalier max. est ${(landingWidth/2).toFixed(0)} mm.`;
   } else {
    stairWidthError.textContent = `Pour cette largeur de palier, la largeur d'escalier max. est ${metricToImperial(landingWidth/2)}.`;
   }
  } else if (landingDepth > 0 && landingDepth < stairWidth) {
   if (isMetric) {
    stairWidthError.textContent = `Pour une profondeur de palier de ${landingDepth.toFixed(0)} mm, la largeur d'escalier max. est ${landingDepth.toFixed(0)} mm.`;
   } else {
    stairWidthError.textContent = `Pour cette profondeur de palier, la largeur d'escalier max. est ${metricToImperial(landingDepth)}.`;
   }
  } else {
   stairWidthError.textContent = '';
  }
  }
 }
 
 /**
  * Valide les champs pour l'escalier en L et affiche les erreurs
  * Règles:
  * - Profondeur palier ≥ largeur escalier (CNB 9.8.6.3) - pour palier standard
  */
 function validateLShapedInputs() {
  const stairConfigSelect = document.getElementById('calcStairConfig');
  const lShapedConfigSelect = document.getElementById('calcLShapedConfig');
  if (!stairConfigSelect || stairConfigSelect.value !== 'l_shaped') return;
  if (!lShapedConfigSelect || lShapedConfigSelect.value !== 'standard_landing') return;
  
  const measurementSelect = document.getElementById('calcMeasurementSystem');
  const isMetric = !measurementSelect || measurementSelect.value === 'metric';
  
  // Récupérer les valeurs - pour L, la profondeur du palier = largeur escalier par défaut
  let stairWidth = 0;
  
  if (isMetric) {
  const widthEl = document.getElementById('stairDesiredWidth');
  stairWidth = widthEl ? parseFloat(widthEl.value) || 0 : 0;
  } else {
  const widthEl = document.getElementById('stairDesiredWidthImperial');
  stairWidth = widthEl ? imperialToMetric(validateImperialInput(widthEl.value)) || 0 : 0;
  }
  
  // Pour l'escalier en L, la profondeur du palier est égale à  la largeur de l'escalier
  // donc pas de validation supplémentaire nécessaire ici
 }
 
 /**
  * Valide les champs pour l'escalier hélicoïdal
  * Règles:
  * - Largeur libre ≥ 660 mm (CNB 9.8.4.7)
  * - Giron à  300 mm ≥ 190 mm (CNB 9.8.4.7)
  */
 function validateSpiralInputs() {
  const stairConfigSelect = document.getElementById('calcStairConfig');
  if (!stairConfigSelect || stairConfigSelect.value !== 'spiral') return;
  
  const measurementSelect = document.getElementById('calcMeasurementSystem');
  const isMetric = !measurementSelect || measurementSelect.value === 'metric';
  
  // Note: Pour l'instant, les champs hélicoïdaux ne sont pas encore présents dans le calculateur
  // Cette fonction est prête pour une future implémentation
 }
 
 /**
  * Fonction principale de validation appelée sur changement des champs
  */
 function validateCalculatorInputs() {
  const stairConfigSelect = document.getElementById('calcStairConfig');
  if (!stairConfigSelect) return;
  
  const config = stairConfigSelect.value;
  
  if (config === 'u_shaped') {
  validateUShapedInputs();
  } else if (config === 'l_shaped') {
  validateLShapedInputs();
  } else if (config === 'spiral') {
  validateSpiralInputs();
  }
 }
 
 // Attacher les validateurs aux champs concernés
 const fieldsToValidate = [
  'stairDesiredWidth', 'stairDesiredWidthImperial',
  'uLandingWidth', 'uLandingWidthImperial',
  'uLandingDepth', 'uLandingDepthImperial',
  'uFirstFlightRun', 'uFirstFlightRunImperial',
  'uSecondFlightRun', 'uSecondFlightRunImperial'
 ];
 
 fieldsToValidate.forEach(fieldId => {
  const field = document.getElementById(fieldId);
  if (field) {
  field.addEventListener('input', validateCalculatorInputs);
  field.addEventListener('change', validateCalculatorInputs);
  field.addEventListener('blur', validateCalculatorInputs);
  }
 });
 
 // Aussi valider quand la configuration change
 const configSelects = ['calcStairConfig', 'calcUShapedConfig', 'calcMeasurementSystem'];
 configSelects.forEach(selectId => {
  const select = document.getElementById(selectId);
  if (select) {
  select.addEventListener('change', validateCalculatorInputs);
  }
 });

 // =====================================================================
 // VALIDATION CNB EN TEMPS REEL - PANNEAU D'AVERTISSEMENTS
 // =====================================================================
 
 function validateCNBParameters() {
  const warningsPanel = document.getElementById('cnbWarningsPanel');
  const warningsList = document.getElementById('cnbWarningsList');
  if (!warningsPanel || !warningsList) return;
  
  const warnings = [];
  
  const measurementSelect = document.getElementById('calcMeasurementSystem');
  const isMetric = !measurementSelect || measurementSelect.value === 'metric';
  
  const buildingTypeSelect = document.getElementById('calcBuildingType');
  const stairTypeSelect = document.getElementById('calcStairType');
  const stairConfigSelect = document.getElementById('calcStairConfig');
  const lShapedConfigSelect = document.getElementById('calcLShapedConfig');
  const uShapedConfigSelect = document.getElementById('calcUShapedConfig');
  
  const buildingType = buildingTypeSelect ? buildingTypeSelect.value : 'part9';
  const stairType = stairTypeSelect ? stairTypeSelect.value : 'private';
  const stairConfig = stairConfigSelect ? stairConfigSelect.value : 'straight';
  const lShapedConfig = lShapedConfigSelect ? lShapedConfigSelect.value : 'standard_landing';
  const uShapedConfig = uShapedConfigSelect ? uShapedConfigSelect.value : 'landing_only';
  
  const limits = getCNBLimits(buildingType, stairType);
  
  let stairWidth = 0, totalRise = 0, landingDepth = 0, landingWidth = 0;
  
  if (isMetric) {
  const widthEl = document.getElementById('stairDesiredWidth');
  const riseEl = document.getElementById('totalRise');
  stairWidth = widthEl ? parseFloat(widthEl.value) || 0 : 0;
  totalRise = riseEl ? parseFloat(riseEl.value) || 0 : 0;
  if (stairConfig === 'u_shaped') {
   const depthEl = document.getElementById('uLandingDepth');
   const widthLandEl = document.getElementById('uLandingWidth');
   landingDepth = depthEl ? parseFloat(depthEl.value) || 0 : 0;
   landingWidth = widthLandEl ? parseFloat(widthLandEl.value) || 0 : 0;
  }
  } else {
  const widthEl = document.getElementById('stairDesiredWidthImperial');
  const riseEl = document.getElementById('totalRiseImperial');
  stairWidth = widthEl ? imperialToMetric(validateImperialInput(widthEl.value)) || 0 : 0;
  totalRise = riseEl ? imperialToMetric(validateImperialInput(riseEl.value)) || 0 : 0;
  if (stairConfig === 'u_shaped') {
   const depthEl = document.getElementById('uLandingDepthImperial');
   const widthLandEl = document.getElementById('uLandingWidthImperial');
   landingDepth = depthEl ? imperialToMetric(validateImperialInput(depthEl.value)) || 0 : 0;
   landingWidth = widthLandEl ? imperialToMetric(validateImperialInput(widthLandEl.value)) || 0 : 0;
  }
  }
  
  // Largeur minimale (CNB 9.8.2.1 / 3.4.3.2)
  if (stairWidth > 0 && stairWidth < limits.minWidth) {
  const article = buildingType === 'part3' ? '3.4.3.2' : '9.8.2.1';
  if (isMetric) {
   warnings.push({type: 'error', text: 'Largeur ' + stairWidth.toFixed(0) + ' mm < minimum ' + limits.minWidth + ' mm (CNB ' + article + ')'});
  } else {
   warnings.push({type: 'error', text: 'Largeur ' + metricToImperial(stairWidth) + ' < minimum ' + metricToImperial(limits.minWidth) + ' (CNB ' + article + ')'});
  }
  }
  
  // Hauteur max par volee (CNB 9.8.3.3 / 3.4.6.3)
  const maxFlightHeight = limits.maxRise || 3700;
  if (stairConfig === 'straight' && totalRise > maxFlightHeight) {
  const article = buildingType === 'part3' ? '3.4.6.3.(1)' : '9.8.3.3.(1)';
  if (isMetric) {
   warnings.push({type: 'error', text: 'Hauteur ' + totalRise.toFixed(0) + ' mm > max ' + maxFlightHeight + ' mm par volee - palier requis (CNB ' + article + ')'});
  } else {
   warnings.push({type: 'error', text: 'Hauteur ' + metricToImperial(totalRise) + ' > max ' + metricToImperial(maxFlightHeight) + ' par volee - palier requis (CNB ' + article + ')'});
  }
  }
  
  // Escalier en U - palier
  if (stairConfig === 'u_shaped') {
  // Profondeur palier >= largeur escalier (CNB 9.8.6.3.(1))
  if (landingDepth > 0 && stairWidth > 0 && landingDepth < stairWidth) {
   if (isMetric) {
   warnings.push({type: 'error', text: 'Profondeur palier ' + landingDepth.toFixed(0) + ' mm < largeur escalier ' + stairWidth.toFixed(0) + ' mm (CNB 9.8.6.3.(1))'});
   } else {
   warnings.push({type: 'error', text: 'Profondeur palier ' + metricToImperial(landingDepth) + ' < largeur escalier ' + metricToImperial(stairWidth) + ' (CNB 9.8.6.3.(1))'});
   }
  }
  // Largeur palier >= 2 x largeur escalier
  if (landingWidth > 0 && stairWidth > 0 && landingWidth < (2 * stairWidth)) {
   const minRequired = 2 * stairWidth;
   if (isMetric) {
   warnings.push({type: 'error', text: 'Largeur palier ' + landingWidth.toFixed(0) + ' mm < 2 x largeur escalier (' + minRequired.toFixed(0) + ' mm)'});
   } else {
   warnings.push({type: 'error', text: 'Largeur palier ' + metricToImperial(landingWidth) + ' < 2 x largeur escalier (' + metricToImperial(minRequired) + ')'});
   }
  }
  }
  
  // Marches rayonnantes - restrictions
  if (stairConfig === 'l_shaped' && (lShapedConfig === 'two_45deg' || lShapedConfig === 'three_30deg')) {
  if (buildingType === 'part3') {
   warnings.push({type: 'error', text: 'Marches rayonnantes non permises pour Partie 3 (CNB A-9.8.3.1)'});
  }
  if (stairType === 'common') {
   warnings.push({type: 'error', text: 'Marches rayonnantes non permises pour escaliers communs (CNB A-9.8.3.1)'});
  }
  }
  
  // Marches rayonnantes en U
  if (stairConfig === 'u_shaped' && uShapedConfig !== 'landing_only') {
  if (buildingType === 'part3') {
   warnings.push({type: 'error', text: 'Marches rayonnantes non permises pour Partie 3 (CNB A-9.8.3.1)'});
  }
  if (stairType === 'common') {
   warnings.push({type: 'error', text: 'Marches rayonnantes non permises pour escaliers communs (CNB A-9.8.3.1)'});
  }
  }
  
  // Affichage
  if (warnings.length > 0) {
  warningsList.innerHTML = warnings.map(function(w) {
   return '<li class="warning-' + w.type + '">' + w.text + '</li>';
  }).join('');
  warningsPanel.style.display = 'block';
  } else {
  warningsPanel.style.display = 'none';
  warningsList.innerHTML = '';
  }
 }
 
 // Attacher la validation CNB
 var cnbFields = ['stairDesiredWidth', 'stairDesiredWidthImperial', 'totalRise', 'totalRiseImperial',
         'uLandingWidth', 'uLandingWidthImperial', 'uLandingDepth', 'uLandingDepthImperial'];
 cnbFields.forEach(function(fieldId) {
  var field = document.getElementById(fieldId);
  if (field) {
  field.addEventListener('input', validateCNBParameters);
  field.addEventListener('change', validateCNBParameters);
  }
 });
 
 var cnbSelects = ['calcStairConfig', 'calcLShapedConfig', 'calcUShapedConfig', 'calcBuildingType', 'calcStairType', 'calcMeasurementSystem'];
 cnbSelects.forEach(function(selectId) {
  var select = document.getElementById(selectId);
  if (select) {
  select.addEventListener('change', validateCNBParameters);
  }
 });
 
 validateCNBParameters();
});
