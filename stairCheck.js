/**
 * =====================================================================
 * CALCULATEUR D'ESCALIER - CNB 2020 (modifié)
 * Version complète et améliorée
 * =====================================================================
 * 
 * Conforme au Code de construction du Québec, Chapitre I "“ Bâtiment
 * et Code national du bâtiment "“ Canada 2020 (modifié)
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
            minRiser: 125,          // CNB 3.4.6.8.(2) - min 125 mm
            maxRiser: 180,          // CNB 3.4.6.8.(2) - max 180 mm
            minTread: 280,          // CNB 3.4.6.8.(1) - min 280 mm
            maxTread: 9999,         // CNB 3.4.6.8 - Aucune limite max spécifiée
            minWidth: 1100,         // CNB 3.4.3.2 Tableau - >3 étages
            minWidthUnder3: 900,    // CNB 3.4.3.2 Tableau - ≤≤3 étages
            minHeadroom: 2050,      // CNB 3.4.3.4.(1) - min 2050 mm
            minNarrowSide: 150,     // CNB 3.3.1.16.(2)a) - min 150 mm côté étroit
            minNarrowSideTurning: 240, // CNB 3.4.6.9.(2)b) - min 240 mm volées tournantes issue
            maxRise: 3700,          // CNB 3.4.6.3.(1) - max 3,7 m par volée
            maxRiseB2: 2400,        // CNB 3.4.6.3.(1) - max 2,4 m groupe B div.2
            minRisersPerFlight: 3   // CNB 3.4.6.2.(1) - min 3 contremarches par volée
        }
    },
    // =====================================================================
    // PARTIE 9 - Maisons et petits bâtiments (CNB 2020, Section 9.8)
    // =====================================================================
    part9: {
        private: {
            // Escaliers privés: logements individuels, maisons avec logement accessoire
            minRiser: 125,          // CNB 9.8.4.1 Tableau - min 125 mm
            maxRiser: 200,          // CNB 9.8.4.1 Tableau - max 200 mm (privé)
            minTread: 255,          // CNB 9.8.4.2 Tableau - min 255 mm (privé)
            maxTread: 355,          // CNB 9.8.4.2 Tableau - max 355 mm (privé)
            minWidth: 860,          // CNB 9.8.2.1.(2)(4) - min 860 mm
            minHeadroom: 1950,      // CNB 9.8.2.2.(3) - min 1950 mm (logement)
            minNarrowSide: 150,     // CNB 9.8.4.3.(1)a) - min 150 mm côté étroit
            maxRise: 3700,          // CNB 9.8.3.3.(1) - max 3,7 m par volée
            minRisersPerFlight: 1   // Pas de minimum pour escaliers privés dans logement
        },
        common: {
            // Escaliers communs: tous les autres escaliers
            minRiser: 125,          // CNB 9.8.4.1 Tableau - min 125 mm
            maxRiser: 180,          // CNB 9.8.4.1 Tableau - max 180 mm (commun)
            minTread: 280,          // CNB 9.8.4.2 Tableau - min 280 mm (commun)
            maxTread: 9999,         // CNB 9.8.4.2 Tableau - "Aucune limite" (commun)
            minWidth: 900,          // CNB 9.8.2.1.(1)(3) - min 900 mm
            minHeadroom: 2050,      // CNB 9.8.2.2.(2) - min 2050 mm (général)
            minNarrowSide: 150,     // CNB 9.8.4.3.(1)a) - min 150 mm côté étroit
            maxRise: 3700,          // CNB 9.8.3.3.(1) - max 3,7 m par volée
            minRisersPerFlight: 3   // CNB 9.8.3.2.(1) - min 3 contremarches (sauf logement)
        }
    },
    // =====================================================================
    // ESCALIERS HÉLICOàDAUX (CNB 2020, Article 9.8.4.7)
    // =====================================================================
    spiral: {
        minWidth: 660,              // CNB 9.8.4.7.(1)b) - min 660 mm entre mains courantes
        minTreadAt300: 190,         // CNB 9.8.4.7.(1)d)i) - min 190 mm à  300 mm de l'axe
        maxRiser: 240,              // CNB 9.8.4.7.(1)c) - max 240 mm
        minHeadroom: 1980,          // CNB 9.8.4.7.(1)e) - min 1980 mm
        maxPersons: 6               // CNB 9.8.4.7.(2) - max 6 personnes si seul moyen d'évacuation
    },
    // =====================================================================
    // MARCHES RAYONNANTES (CNB 2020, Article 9.8.4.6)
    // =====================================================================
    radiating: {
        allowedAngles: [30, 45],    // CNB 9.8.4.6.(1) - angles permis (sans écart)
        maxRotation: 90             // CNB 9.8.4.6.(2) - max 90° par série
    },
    // =====================================================================
    // TOLÉRANCES (CNB 2020, Article 9.8.4.4)
    // =====================================================================
    tolerances: {
        riserSuccessive: 5,         // CNB 9.8.4.4.(1)a) - 5 mm entre marches successives
        riserInFlight: 10,          // CNB 9.8.4.4.(1)b) - 10 mm max dans la volée
        treadSuccessive: 5,         // CNB 9.8.4.4.(3)a) - 5 mm entre marches successives
        treadInFlight: 10,          // CNB 9.8.4.4.(3)b) - 10 mm max dans la volée
        stepSlope: 50               // CNB 9.8.4.4.(5) - inclinaison max 1:50
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
    
    // Gérer le cas oà¹ wholeInches >= 12 (par exemple, 3' 12" devient 4'-0")
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
 * doivent être testés APRÈS les formats avec apostrophe obligatoire
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
// RÈGLE DU PAS ET VALIDATION
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
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
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
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
        
        // Nombre de girons = nombre de contremarches - 1
        const numTreads = numRisers - 1;
        
        if (numTreads < 2) continue; // Au moins 1 giron par volée
        
        // Distribution des girons entre les volées (basée sur les longueurs disponibles)
        const flight1Available = firstFlightRun - landingDepth;
        const flight2Available = secondFlightRun - landingDepth;
        const totalAvailable = flight1Available + flight2Available;
        
        const treadsInFlight1 = Math.max(1, Math.round(numTreads * (flight1Available / totalAvailable)));
        const treadsInFlight2 = Math.max(1, numTreads - treadsInFlight1);
        
        // Calculer la hauteur de chaque volée
        // Volée 1: treadsInFlight1 girons + 1 contremarche pour monter au palier
        // Volée 2: treadsInFlight2 girons = treadsInFlight2 contremarches
        const risersInFlight1 = treadsInFlight1 + 1;
        const risersInFlight2 = treadsInFlight2;
        
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
        
        for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
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
        
        for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
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
        landingLength,
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
    
    switch (uShapedConfig) {
        case 'two_landings':
        case 'rect_landing_rect':
            // Configuration avec palier uniquement (ancien "two_landings")
            numLandings = 1;
            availableForTreads = flight1Run + flight2Run;
            break;
        case 'radiating':
        case 'rect_radiating_rect':
            // Configuration avec marches rayonnantes uniquement (ancien "radiating")
            // Pour 180°: 4 marches à  45° ou 6 marches à  30°
            numLandings = 0;
            // Les marches rayonnantes contribuent moins en longueur effective
            // car elles occupent la zone de virage
            const radiatingSteps180 = radiatingAngle === 30 ? 6 : 4;
            // L'espace disponible dépend des volées rectangulaires
            // Les marches rayonnantes occupent une zone équivalente à  environ stairWidth
            availableForTreads = flight1Run + flight2Run;
            break;
        case 'rect_landing_radiating_rect':
            // Configuration palier + marches rayonnantes (3 volées)
            numLandings = 1;
            availableForTreads = flight1Run + flight2Run + (flight3Run || 0) + (landingLength * 0.25);
            break;
        case 'rect_radiating_landing_rect':
            // Configuration marches rayonnantes + palier (3 volées)
            numLandings = 1;
            availableForTreads = flight1Run + flight2Run + (flight3Run || 0) + (landingLength * 0.25);
            break;
        case 'rect_radiating_landing_radiating_rect':
            // Configuration marches rayonnantes + palier + marches rayonnantes (3 volées)
            numLandings = 1;
            availableForTreads = flight1Run + flight2Run + (flight3Run || 0) + (landingLength * 0.5);
            break;
        default:
            availableForTreads = flight1Run + flight2Run;
    }
    
    const minRisers = Math.ceil(totalRise / limits.maxRiser);
    const maxRisers = Math.floor(totalRise / limits.minRiser);
    
    const solutions = [];
    const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
        
        // Vérifier la hauteur maximale de volée (chaque volée séparément pour escalier en U)
        // Approximation: répartition égale des contremarches entre les volées
        const risersPerFlight = Math.ceil(numRisers / (numLandings + 1));
        const flightHeight = risersPerFlight * riserHeight;
        const flightCheck = checkFlightHeightLimits(flightHeight, buildingType, usageGroup);
        if (!flightCheck.isValid) continue;
        
        const numTreads = numRisers - 1;
        if (numTreads < 3) continue;
        
        const treadDepth = availableForTreads / numTreads;
        
        if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
        
        const stepRule = checkStepRule(riserHeight, treadDepth);
        const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
        
        let score = Math.abs(stepValue - optimalStepValue) * 2;
        if (priority === 'comfort' && stepRule.isValid) score *= 0.7;
        
        solutions.push({
            numRisers,
            numTreads,
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
    return solutions.slice(0, 3);
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
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
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
            // Pour les marches dansantes, utiliser le calcul droit avec ajustement
            return calculateStraightStair(params);
            
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
    const margin = { left: 60, right: 80, top: 55, bottom: 90 };
    const planW = W - margin.left - margin.right;
    const planH = H - margin.top - margin.bottom;
    
    // Calculer l'echelle pour maximiser l'utilisation de l'espace
    const scalePlan = Math.min(planW / totalRun, planH / actualWidth) * 0.85;
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
    const markerY = r(planStartY + stairH_plan * 0.75 + 3);  // En bas de la marche
    svg += '<text x="' + r(planStartX + treadW_plan/2) + '" y="' + markerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">1</text>';
    svg += '<text x="' + r(planStartX + stairW_plan - treadW_plan/2) + '" y="' + markerY + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
    
    // Fleche de montee - de l'EXTERIEUR de la 1ere marche jusqu'a la derniere CM
    const arrowY = r(planStartY + stairH_plan / 2);
    const arrowStartX = r(planStartX);  // Commence a l'EXTERIEUR (avant la 1ere CM)
    const arrowEndX = r(planStartX + stairW_plan);  // Finit a la derniere contremarche
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
    const legendY = H - 75;
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
    const margin = { left: 50, right: 70, top: 55, bottom: 70 };
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
        totalPlanH = actualWidth;  // Seulement le carre rayonnant en vertical
    } else if (isRadiatingAtExtremity && radiatingAtStart) {
        // Marches rayonnantes au debut: carre + volee verticale
        totalPlanW = actualWidth;  // Seulement le carre rayonnant en horizontal
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
        // Mot "Palier" décalé vers le bas pour éviter conflit avec la flèche
        svg += '<text x="' + r(palierX + landingW_plan/2) + '" y="' + r(palierY + landingW_plan * 0.75 + 4) + '" style="font:italic 10px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
        
        // Volee 2 (verticale) - du coin vers le haut
        svg += '<rect x="' + palierX + '" y="' + planStartY + '" width="' + stairWidth_plan + '" height="' + stairW2_plan + '" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>';
        
        // Lignes des girons volee 2 - épaisseur uniforme de 1.5
        const treadW2_exact = stairW2_plan / flight2Treads;
        for (let i = 1; i <= flight2Treads; i++) {
            const lineY = r(planStartY + stairW2_plan - i * treadW2_exact);
            svg += '<line x1="' + palierX + '" y1="' + lineY + '" x2="' + r(palierX + stairWidth_plan) + '" y2="' + lineY + '" stroke="#1b5e20" stroke-width="1.5"/>';
        }
        
        // Numerotation volee 2 - décalée vers la droite pour éviter conflit avec la flèche
        const v2MarkerX = r(palierX + stairWidth_plan * 0.75);
        svg += '<text x="' + v2MarkerX + '" y="' + r(planStartY + stairW2_plan - treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (flight1Treads + 1) + '</text>';
        svg += '<text x="' + v2MarkerX + '" y="' + r(planStartY + treadW2_exact/2 + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
        
        // Annotation nombre de girons rectangulaires volée 2 (à  gauche de la volée)
        svg += '<text x="' + r(palierX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="end" transform="rotate(-90 ' + r(palierX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
        
        // Fleche de montee continue - part de la 1ere CM (bord de l'escalier), traverse le palier, finit a la derniere CM
        const arrow1Y = r(planStartY + stairW2_plan + stairWidth_plan/2);
        const arrow1StartX = r(planStartX);  // Depart a la 1ere CM (bord gauche de l'escalier)
        const arrowCornerX = r(palierX + stairWidth_plan/2);  // Centre du palier
        const arrowEndY = r(planStartY);  // Fin a la derniere CM
        
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
        const totalHorizontal = flight1Run + actualLanding;  // Volee 1 + palier
        const totalHorizontalText = formatValueForPlan(totalHorizontal, isMetric);
        svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(palierX + landingW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
        svg += '<text x="' + r((planStartX + palierX + landingW_plan)/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalHorizontalText + '</text>';
        
        const dimX2 = r(palierX + stairWidth_plan + 25);
        const totalVertical = flight2Run + actualLanding;  // Volee 2 + palier
        const totalVerticalText = formatValueForPlan(totalVertical, isMetric);
        svg += '<line x1="' + dimX2 + '" y1="' + planStartY + '" x2="' + dimX2 + '" y2="' + r(palierY + landingW_plan) + '" stroke="#555" stroke-width="1" marker-start="url(#arrLS)" marker-end="url(#arrLE)"/>';
        svg += '<text x="' + (dimX2 + 5) + '" y="' + r((planStartY + palierY + landingW_plan)/2 + 4) + '" style="font:10px Arial;fill:#333;">' + totalVerticalText + '</text>';
        
        // Annotations girons (sans le palier, juste info)
        svg += '<text x="' + r(planStartX + stairW1_plan/2) + '" y="' + r(planStartY + stairW2_plan - 8) + '" style="font:9px Arial;fill:#666;" text-anchor="middle">' + flight1Treads + ' girons rectangulaires</text>';
        svg += '<text x="' + r(palierX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="end" transform="rotate(-90 ' + r(palierX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
        
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
            const arrowStartX = r(planStartX);  // Depart a la 1ere CM (bord gauche)
            const arrowCornerX = r(cornerX + L/2);
            const arrowEndY = r(cornerY);  // Fin au bord superieur du carre (derniere CM)
            
            // Segment horizontal (de la 1ere CM jusqu'au centre du carre)
            svg += '<line x1="' + arrowStartX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrow1Y + '" stroke="#1b5e20" stroke-width="1.5"/>';
            // Segment vertical avec fleche (du centre jusqu'au bord superieur)
            svg += '<line x1="' + arrowCornerX + '" y1="' + arrow1Y + '" x2="' + arrowCornerX + '" y2="' + arrowEndY + '" stroke="#1b5e20" stroke-width="1.5" marker-end="url(#arrLMontee)"/>';
            
            // "En haut" centré avec le centre de la volée de départ
            svg += '<text x="' + r(planStartX - 5) + '" y="' + (arrow1Y + 4) + '" style="font:bold 9px Arial;fill:#1b5e20;" text-anchor="end">En haut</text>';
            
            // Cotations - longueur totale (volee 1 + carre rayonnant)
            const dimY1 = r(planStartY + stairWidth_plan + 25);
            const totalLength = firstFlightRun + actualWidth;  // girons + largeur du carre
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
            const arrowStartX = r(cornerX + L + 8);  // Depart a l'EXTERIEUR (a droite du carre)
            const arrowStartY = r(cornerY + L/2);  // Centre vertical du carre
            const arrowCornerX = r(cornerX + stairWidth_plan/2);  // Point de virage (centre horizontal)
            const arrowEndY = r(planStartY);  // Fin a la derniere contremarche
            
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
            const totalHeight = secondFlightRun + actualWidth;  // girons + largeur du carre
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
            const arrowStartX = r(planStartX);  // Depart a la 1ere CM (bord gauche de l'escalier)
            const arrowEndY = r(planStartY);    // Fin a la derniere contremarche
            
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
            svg += '<text x="' + r(cornerX - 10) + '" y="' + r(planStartY + stairW2_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="end" transform="rotate(-90 ' + r(cornerX - 10) + ' ' + r(planStartY + stairW2_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
        }
    }
    
    // ===== LÉGENDE EN TABLEAU =====
    const legendX = 15;
    const legendY = H - 75;
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
    const actualFlight1Run = flight1Run || (treadsInFlight1 * treadDepth);
    const actualFlight2Run = flight2Run || (treadsInFlight2 * treadDepth);
    const actualLandingDepth = landingDepth || actualWidth;
    const actualLandingWidth = landingWidth || (2 * actualWidth);
    const actualSpaceBetween = spaceBetweenFlights || Math.max(0, actualLandingWidth - (2 * actualWidth));
    
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
    const margin = { left: 70, right: 70, top: 55, bottom: 70 };
    const planW = W - margin.left - margin.right;
    const planH = H - margin.top - margin.bottom;
    
    // Titre avec fond
    const titleText = 'VUE EN PLAN - Escalier en U (2 volées + palier)';
    svg += '<rect x="' + (W/2 - 155) + '" y="8" width="310" height="26" fill="#e8f5e9" rx="4"/>';
    svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
    
    // Calculer l'échelle pour la vue en plan
    // Largeur totale = 2 × largeur escalier + espace entre volées
    // Hauteur totale = max(longueur volée) + profondeur palier
    const totalPlanWidth = actualLandingWidth;
    const maxFlightRun = Math.max(actualFlight1Run, actualFlight2Run);
    const totalPlanHeight = maxFlightRun + actualLandingDepth;
    
    const scalePlan = Math.min(planW / totalPlanWidth, planH / totalPlanHeight) * 0.70;
    
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
            // Position Y: du bas vers le haut, chaque giron a la MàŠME profondeur que dans volée 2
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
    // Mot "Palier" décalé vers le haut pour éviter conflit avec la flèche qui traverse au centre
    svg += '<text x="' + r(landingX + landingW/2) + '" y="' + r(landingY + landingH * 0.3 + 4) + '" style="font:italic 11px Arial;fill:#f57f17;" text-anchor="middle">Palier</text>';
    
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
        const treadFirstV2CenterY = r(flight2Y + treadDepth_plan/2);
        svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadFirstV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + (flight1Treads + 1) + '</text>';
        const treadLastV2CenterY = r(flight2Y + flight2Run_plan - treadDepth_plan/2);
        svg += '<text x="' + r(flight2X + stairWidth_plan * 0.75) + '" y="' + r(treadLastV2CenterY + 3) + '" style="font:9px Arial;fill:#333;font-weight:bold;" text-anchor="middle">' + numTreads + '</text>';
        
        // Annotation nombre de girons rectangulaires volée 2 - MàŠME DIRECTION que volée 1 (rotation -90)
        svg += '<text x="' + r(flight2X + stairWidth_plan + 8) + '" y="' + r(flight2Y + flight2Run_plan/2) + '" style="font:9px Arial;fill:#666;" text-anchor="middle" transform="rotate(-90 ' + r(flight2X + stairWidth_plan + 8) + ' ' + r(flight2Y + flight2Run_plan/2) + ')">' + flight2Treads + ' girons rectangulaires</text>';
    }
    
    // ===== ESPACE ENTRE LES VOLÉES (si applicable) =====
    if (actualSpaceBetween > 0) {
        // Dessiner une ligne pointillée ou un indicateur de l'espace
        const spaceX = r(flight1X + stairWidth_plan);
        svg += '<rect x="' + spaceX + '" y="' + flight1Y + '" width="' + spaceBetween_plan + '" height="' + Math.max(flight1Run_plan, flight2Run_plan) + '" fill="none" stroke="#ccc" stroke-width="1" stroke-dasharray="4,2"/>';
    }
    
    // ===== FLÈCHE DE MONTÉE =====
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
    const legendY = H - 75;
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
    const margin = { left: 70, right: 70, top: 55, bottom: 70 };
    const planW = W - margin.left - margin.right;
    const planH = H - margin.top - margin.bottom;
    
    // Titre avec fond
    const titleText = 'VUE EN PLAN - Escalier en U (marches rayonnantes)';
    svg += '<rect x="' + (W/2 - 165) + '" y="8" width="330" height="26" fill="#e8f5e9" rx="4"/>';
    svg += '<text x="' + (W/2) + '" y="27" style="font:bold 12px Arial;fill:#2e7d32;" text-anchor="middle">' + titleText + '</text>';
    
    // Calculer l'échelle - utiliser les longueurs réelles
    const totalPlanWidth = actualLandingWidth;
    const maxFlightRun = Math.max(actualFlight1Run, actualFlight2Run);
    const totalPlanHeight = maxFlightRun + actualWidth; // parties + coins rayonnants
    
    const scalePlan = Math.min(planW / totalPlanWidth, planH / totalPlanHeight) * 0.65;
    
    const stairWidth_plan = r(actualWidth * scalePlan);
    // Pour configuration rect_radiating_rect, les deux coins sont ADJACENTS (pas d'espace)
    // Un espace correspondrait à un palier, ce qui est une autre configuration
    const spaceBetween = 0;
    const spaceBetween_plan = 0;
    
    // Longueurs des parties basées sur les valeurs RÉELLES entrées par l'utilisateur
    const flight1Run_plan = r(actualFlight1Run * scalePlan);
    const flight2Run_plan = r(actualFlight2Run * scalePlan);
    
    // CNB 9.8.4.4.(3) et 9.8.4.5.(1): Dans une même volée, le giron doit être UNIFORME
    // Pour cette configuration sans palier = UNE SEULE VOLÉE
    // Donc TOUS les girons rectangulaires ont la MÊME profondeur (treadDepth calculé globalement)
    const uniformTreadDepth = treadDepth; // Giron uniforme calculé par le calculateur
    const uniformTreadDepth_plan = r(uniformTreadDepth * scalePlan);
    
    // Répartition des girons rectangulaires entre les deux parties
    // basée sur les longueurs entrées par l'utilisateur
    // Note: totalRectRun et numRectTreads déjà calculés plus haut
    
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
    // Les deux coins étant adjacents, le pivot est à leur intersection
    const pivotX = corner2X; // = corner1X + stairWidth_plan
    const pivotY = r(corner1Y + stairWidth_plan);
    
    // COIN 1: Lignes de 180° (gauche) à 90° (haut)
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
    
    // COIN 2: Lignes de 90° (haut) à 0° (droite) - la ligne à 90° est déjà tracée
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
    
    // ===== FLÈCHE DE DIRECTION (MONTÉE) =====
    const arrowX1 = r(flight1X + stairWidth_plan / 2);
    const arrowX2 = r(flight2X + stairWidth_plan / 2);
    const arrowY1Start = r(flight1Y + flight1Run_visual - 8);
    const arrowY1End = r(flight1Y + 5);
    const arrowY2Start = r(flight2Y + 5);
    const arrowY2End = r(flight2Y + flight2Run_visual - 8);
    
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
    
    // Cotation largeur totale (en bas) - 2 × largeur car coins adjacents
    const dimY1 = r(Math.max(flight1Y + flight1Run_visual, flight2Y + flight2Run_visual) + 20);
    const totalWidthReal = 2 * actualWidth;
    const totalWidthText = formatValueForPlan(totalWidthReal, isMetric);
    svg += '<line x1="' + planStartX + '" y1="' + dimY1 + '" x2="' + r(planStartX + totalW_plan) + '" y2="' + dimY1 + '" stroke="#555" stroke-width="1" marker-start="url(#arrURS)" marker-end="url(#arrURE)"/>';
    svg += '<text x="' + r(planStartX + totalW_plan/2) + '" y="' + (dimY1 + 14) + '" style="font:10px Arial;fill:#333;" text-anchor="middle">' + totalWidthText + '</text>';
    
    // ===== LÉGENDE EN TABLEAU =====
    const legendX = 15;
    const legendY = H - 75;
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


function displayCalculatorResults(solutions, params) {
    const {
        totalRiseValue,
        stairWidthValue,
        buildingTypeValue,
        stairTypeValue,
        stairConfigValue,
        lShapedConfigValue,
        uShapedConfigValue,
        isMetric
    } = params;
    
    const resultDiv = document.getElementById('calculatorResult');
    const contentDiv = document.getElementById('calculatorResultContent');
    
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
        }
        
        const minLength = minTreads * limits.minTread;
        const calculatedTread = availableForTreads / minTreads;
        
        const codeRef = buildingTypeValue === 'part3' ? 'Partie 3' : 'Partie 9';
        
        // Déterminer si l'escalier a un palier intermédiaire qui divise la montée
        // - Escalier en L avec palier standard: 2 volées séparées
        // - Escalier en L avec marches rayonnantes: 1 SEULE volée (CNB)
        // - Escalier en U: plusieurs volées séparées par paliers
        const hasIntermediateLanding = (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') || 
                                       stairConfigValue === 'u_shaped';
        
        let html = '<h3>✗ Aucune solution conforme trouvée</h3>';
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
                        html += `<li>Longueur totale minimale requise ââ"°Â¥ ${minLengthWithLanding.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm + 2× palier)</li>`;
                    } else {
                        html += `<li>Longueur totale minimale requise ââ"°Â¥ ${metricToImperial(minLengthWithLanding)} (${minTreads} girons × ${metricToImperial(limits.minTread)} + 2× palier)</li>`;
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
                        html += `<li>Longueur totale minimale requise ââ"°Â¥ ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
                    } else {
                        html += `<li>Longueur totale minimale requise ââ"°Â¥ ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
                    }
                    html += '<li>Augmentez la longueur des deux volées perpendiculaires</li>';
                } else if (treadTooLarge) {
                    html += '<li>Réduisez la longueur des volées pour obtenir un giron plus court</li>';
                    html += '<li>Augmentez la hauteur totale pour ajouter plus de marches</li>';
                }
                html += '<li>Les marches rayonnantes se situent à  l\'intersection des deux volées</li>';
            } else {
                if (treadTooSmall) {
                    if (isMetric) {
                        html += `<li>Longueur minimale requise ââ"°Â¥ ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
                    } else {
                        html += `<li>Longueur minimale requise ââ"°Â¥ ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
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
    const isTreadOk = best.treadDepth >= limits.minTread && (hasMaxTreadLimit ? best.treadDepth <= limits.maxTread : true);
    
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
        html += `<div class="warning"><p>⚠  Largeur ${formatValue(stairWidthValue, isMetric, 0)} inférieure au minimum requis (${formatValue(limits.minWidth, isMetric, 0)})</p></div>`;
    }
    if (!isRiserOk) {
        html += `<div class="warning"><p>⚠  Hauteur de contremarche ${formatValuePrecise(best.riserHeight, isMetric)} hors limites CNB (${formatValue(limits.minRiser, isMetric, 0)} à  ${formatValue(limits.maxRiser, isMetric, 0)})</p></div>`;
    }
    if (!isTreadOk) {
        if (hasMaxTreadLimit) {
            html += `<div class="warning"><p>⚠  Profondeur de giron ${formatValuePrecise(best.treadDepth, isMetric)} hors limites CNB (${formatValue(limits.minTread, isMetric, 0)} à  ${formatValue(limits.maxTread, isMetric, 0)})</p></div>`;
        } else {
            html += `<div class="warning"><p>⚠  Profondeur de giron ${formatValuePrecise(best.treadDepth, isMetric)} inférieure au minimum CNB (${formatValue(limits.minTread, isMetric, 0)})</p></div>`;
        }
    }
    
    // Dimensions principales
    html += '<div class="result-section">';
    html += '<h4>Dimensions calculées</h4>';
    html += '<ul>';
    html += `<li><strong>Contremarches :</strong> ${best.numRisers} × ${formatValuePrecise(best.riserHeight, isMetric)}</li>`;
    html += `<li><strong>Girons :</strong> ${best.numTreads} × ${formatValuePrecise(best.treadDepth, isMetric)}</li>`;
    
    if (best.numRadiatingSteps > 0) {
        html += `<li><strong>Marches rayonnantes :</strong> ${best.numRadiatingSteps}</li>`;
        html += `<li><strong>Girons rectangulaires :</strong> ${best.numRectTreads}</li>`;
    }
    
    if (best.useLandingConfiguration) {
        html += `<li><strong>Profondeur palier :</strong> ${formatValuePrecise(best.landingDepth, isMetric)}</li>`;
        html += `<li><strong>Girons volée 1 :</strong> ${best.treadsInFlight1}</li>`;
        html += `<li><strong>Girons volée 2 :</strong> ${best.treadsInFlight2}</li>`;
        
        // Afficher les hauteurs de chaque volée avec validation (CNB 9.8.3.3 / 3.4.6.3)
        if (best.flight1Height && best.flight2Height) {
            const maxFlightHeight = 3700; // mm - limite CNB
            const flight1Ok = best.flight1Height <= maxFlightHeight;
            const flight2Ok = best.flight2Height <= maxFlightHeight;
            
            html += `<li><strong>Hauteur volée 1 :</strong> ${formatValuePrecise(best.flight1Height, isMetric)} (${best.risersInFlight1} CM) ${flight1Ok ? '✓' : '✗ > 3,7 m'}</li>`;
            html += `<li><strong>Hauteur volée 2 :</strong> ${formatValuePrecise(best.flight2Height, isMetric)} (${best.risersInFlight2} CM) ${flight2Ok ? '✓' : '✗ > 3,7 m'}</li>`;
            
            // Avertissement si une volée dépasse la limite
            if (!flight1Ok || !flight2Ok) {
                html += '</ul></div>';
                html += '<div class="warning"><p><strong>⚠  Non-conformité CNB 9.8.3.3 :</strong> ';
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
    
    html += `<li><strong>Largeur :</strong> ${formatValue(stairWidthValue, isMetric, 0)} ${isWidthOk ? '✓' : '✗'}</li>`;
    html += '</ul></div>';
    
    // Vérification mathématique
    html += '<div class="step-formula">';
    html += '<strong>Vérification mathématique :</strong><br>';
    
    if (isMetric) {
        const totalRiseCalc = best.riserHeight * best.numRisers;
        const riseError = Math.abs(totalRiseCalc - totalRiseValue);
        html += `${best.numRisers} × ${best.riserHeight.toFixed(4)} mm = ${totalRiseCalc.toFixed(4)} mm `;
        html += riseError < 0.01 ? '✓ Exact' : `⚠   Écart ${riseError.toFixed(4)} mm`;
        
        if (best.useLandingConfiguration) {
            html += '<br>';
            const totalTreadCalc = best.treadDepth * best.numTreads;
            const availableCalc = best.availableForTreads;
            const treadError = Math.abs(totalTreadCalc - availableCalc);
            html += `${best.numTreads} × ${best.treadDepth.toFixed(4)} mm = ${totalTreadCalc.toFixed(4)} mm `;
            html += treadError < 0.01 ? '✓ Exact' : `⚠   Écart ${treadError.toFixed(4)} mm`;
        }
    } else {
        const riserIn = best.riserHeight / 25.4;
        const totalRiseIn = (best.riserHeight * best.numRisers) / 25.4;
        html += `${best.numRisers} × ${riserIn.toFixed(6)}" = ${totalRiseIn.toFixed(6)}" ✓`;
    }
    
    html += '</div>';
    
    // Règle du pas (informative, non obligatoire selon CNB)
    html += '<div class="result-section">';
    html += `<h4>${best.stepRule.isValid ? '✓' : '○'} Règle du pas (${best.stepRule.validCount} sur 3)</h4>`;
    html += '<ul>';
    html += `<li>${best.stepRule.rule1.isValid ? '✓' : '○'} G + H = ${best.stepRule.rule1.value.toFixed(2)}" (${best.stepRule.rule1.range})</li>`;
    html += `<li>${best.stepRule.rule2.isValid ? '✓' : '○'} G × H = ${best.stepRule.rule2.value.toFixed(2)} (${best.stepRule.rule2.range})</li>`;
    html += `<li>${best.stepRule.rule3.isValid ? '✓' : '○'} G + 2H = ${best.stepRule.rule3.value.toFixed(2)}" (${best.stepRule.rule3.range})</li>`;
    html += '</ul></div>';
    
    // Instructions de traçage
    html += '<div class="warning">';
    html += '<p><strong>Instructions pour le traçage CAD :</strong></p>';
    html += '<ul>';
    html += `<li>Utilisez les ${isMetric ? 'valeurs exactes en mm' : 'valeurs décimales entre parenthèses'}</li>`;
    html += `<li>Nombre de contremarches : ${best.numRisers}</li>`;
    html += `<li>Nombre de girons tracés : ${best.numTreads} (le dernier giron = plancher supérieur)</li>`;
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
            html += '<li>  ↳Â  1ère direction : ' + best.firstFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
            const calc1 = best.firstFlightRectTreads * best.treadDepth;
            html += '<li>    Longueur tracée = ' + formatValuePrecise(calc1, isMetric) + ' (girons seuls)</li>';
            html += '<li>  ↳Â  2ème direction : ' + best.secondFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
            const calc2 = best.secondFlightRectTreads * best.treadDepth;
            html += '<li>    Longueur tracée = ' + formatValuePrecise(calc2, isMetric) + ' (girons seuls)</li>';
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
        const uLandingWidth = params.uLandingWidthValue || (2 * stairWidthValue);
        const uLandingDepth = params.uLandingDepthValue || stairWidthValue;
        const spaceBetween = params.spaceBetweenFlights || Math.max(0, uLandingWidth - (2 * stairWidthValue));
        
        // Répartition des girons entre les 2 volées (proportionnelle aux longueurs)
        const totalFlightLength = uFlight1 + uFlight2;
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
            landingWidth: uLandingWidth,
            landingDepth: uLandingDepth,
            spaceBetweenFlights: spaceBetween,
            treadsInFlight1: treads1,
            treadsInFlight2: treads2
        });
        html += '</div>';
    }
    
    // Visualisation graphique pour escalier en U avec marches rayonnantes (configurations avec 'radiating')
    const uShapedIsRadiatingOnly = uShapedConfigValue === 'radiating' || uShapedConfigValue === 'rect_radiating_rect';
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
        
        let configDescription = '';
        switch (uShapedConfigValue) {
            case 'rect_landing_radiating_rect':
                configDescription = 'marches rectangulaires + palier + marches rayonnantes + marches rectangulaires';
                break;
            case 'rect_radiating_landing_rect':
                configDescription = 'marches rectangulaires + marches rayonnantes + palier + marches rectangulaires';
                break;
            case 'rect_radiating_landing_radiating_rect':
                configDescription = 'marches rectangulaires + marches rayonnantes + palier + marches rayonnantes + marches rectangulaires';
                break;
        }
        
        html += '<div class="info-note">';
        html += '<p><strong>Configuration sélectionnée :</strong> ' + configDescription + '</p>';
        html += '<p>La visualisation graphique pour cette configuration sera disponible dans une prochaine mise à  jour.</p>';
        html += '<p>Les calculs ci-dessus sont néanmoins valides et conformes au CNB.</p>';
        html += '</div>';
        html += '</div>';
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
    const uLandingRow = document.getElementById('uLandingRow');
    const calcDancingStepsOptions = document.getElementById('calcDancingStepsOptions');
    const calcDancingAngle = document.getElementById('calcDancingAngle');
    const calcDancingCustomAngleContainer = document.getElementById('calcDancingCustomAngleContainer');
    const calcSpiralOptions = document.getElementById('calcSpiralOptions');
    
    const calcStandardRunContainer = document.getElementById('calcStandardRunContainer');
    const calcLandingDimensions = document.getElementById('calcLandingDimensions');
    const calcUDimensions = document.getElementById('calcUDimensions');
    
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
        const hasThreeFlights = config === 'rect_landing_radiating_rect' || 
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
        
        // Afficher/masquer les champs du palier (toujours visible sauf pour rect_radiating_rect)
        if (uLandingRow) {
            uLandingRow.style.display = hasLanding ? 'block' : 'none';
        }
        
        // Mettre à  jour les labels des volées selon la configuration
        updateUFlightLabels(config);
    }
    
    function updateUFlightLabels(config) {
        const label1 = document.getElementById('uFirstFlightRunLabel');
        const label2 = document.getElementById('uSecondFlightRunLabel');
        const label3 = document.getElementById('uThirdFlightRunLabel');
        
        if (!label1 || !label2) return;
        
        switch (config) {
            case 'rect_landing_rect':
                // 2 volées séparées par un palier
                label1.innerHTML = 'Longueur 1ère volée : <span class="info-icon" title="Distance horizontale de la première volée (marches rectangulaires)">i</span>';
                label2.innerHTML = 'Longueur 2ème volée : <span class="info-icon" title="Distance horizontale de la deuxième volée (marches rectangulaires)">i</span>';
                break;
            case 'rect_radiating_rect':
                // 2 volées séparées par des marches rayonnantes
                label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="Distance horizontale de la première partie (marches rectangulaires) jusqu\'aux marches rayonnantes">i</span>';
                label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Distance horizontale de la deuxième partie (marches rectangulaires) après les marches rayonnantes">i</span>';
                break;
            case 'rect_landing_radiating_rect':
                // 3 volées: palier puis marches rayonnantes
                label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="Distance horizontale avant le palier">i</span>';
                label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Distance horizontale entre le palier et les marches rayonnantes">i</span>';
                if (label3) label3.innerHTML = 'Longueur 3ème partie : <span class="info-icon" title="Distance horizontale après les marches rayonnantes">i</span>';
                break;
            case 'rect_radiating_landing_rect':
                // 3 volées: marches rayonnantes puis palier
                label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="Distance horizontale avant les marches rayonnantes">i</span>';
                label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Distance horizontale entre les marches rayonnantes et le palier">i</span>';
                if (label3) label3.innerHTML = 'Longueur 3ème partie : <span class="info-icon" title="Distance horizontale après le palier">i</span>';
                break;
            case 'rect_radiating_landing_radiating_rect':
                // 3 volées: marches rayonnantes + palier + marches rayonnantes
                label1.innerHTML = 'Longueur 1ère partie : <span class="info-icon" title="Distance horizontale avant les premières marches rayonnantes">i</span>';
                label2.innerHTML = 'Longueur 2ème partie : <span class="info-icon" title="Distance horizontale de la partie centrale (avec palier)">i</span>';
                if (label3) label3.innerHTML = 'Longueur 3ème partie : <span class="info-icon" title="Distance horizontale après les dernières marches rayonnantes">i</span>';
                break;
        }
    }
    
    calcStairConfig.addEventListener('change', updateCalcConfigOptions);
    calcLShapedConfig.addEventListener('change', updateCalcLShapedSubOptions);
    if (calcUShapedConfig) {
        calcUShapedConfig.addEventListener('change', updateCalcUShapedSubOptions);
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
        { metric: spiralTreadAt300, imperial: spiralTreadAt300Imperial }
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
            // Validation: Largeur palier ââ"°Â¥ 2 × largeur escalier
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
            // Validation: Profondeur palier ââ"°Â¥ largeur escalier (CNB 9.8.6.3)
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
        }
        
        // Calculer l'espace entre les volées (si largeur palier > 2× largeur escalier)
        const spaceBetweenFlights = Math.max(0, landingWidthForCalc - (2 * stairWidthValue));
        
        // Calculer
        const solutions = calculateOptimalStair({
            totalRise: totalRiseValue,
            totalRun: totalRunValue,
            firstFlightRun: flight1RunForCalc,
            secondFlightRun: flight2RunForCalc,
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
     * - Largeur palier ââ"°Â¥ 2 × largeur escalier (géométrie)
     * - Profondeur palier ââ"°Â¥ largeur escalier (CNB 9.8.6.3)
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
        
        // Valider: Largeur palier ââ"°Â¥ 2 × largeur escalier
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
        
        // Valider: Profondeur palier ââ"°Â¥ largeur escalier (CNB 9.8.6.3)
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
     * - Profondeur palier ââ"°Â¥ largeur escalier (CNB 9.8.6.3) - pour palier standard
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
     * - Largeur libre ââ"°Â¥ 660 mm (CNB 9.8.4.7)
     * - Giron à  300 mm ââ"°Â¥ 190 mm (CNB 9.8.4.7)
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
});
