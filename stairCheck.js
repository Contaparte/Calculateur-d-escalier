/**
 * =====================================================================
 * CALCULATEUR D'ESCALIER - CNB 2020 (modifiÃ©)
 * Version complÃ¨te et amÃ©liorÃ©e
 * =====================================================================
 * 
 * Conforme au Code de construction du QuÃ©bec, Chapitre I â€“ BÃ¢timent
 * et Code national du bÃ¢timent â€“ Canada 2020 (modifiÃ©)
 * 
 * CaractÃ©ristiques:
 * - Calculs prÃ©cis sans arrondi intermÃ©diaire (pour traÃ§age CAD)
 * - Support mÃ©trique et impÃ©rial avec conversion automatique
 * - Toutes les configurations d'escalier (droit, L, U, hÃ©licoÃ¯dal, dansantes)
 * - RÃ¨gle du pas et validation CNB complÃ¨te
 */

// =====================================================================
// CONSTANTES ET LIMITES CNB
// =====================================================================

const CNB_LIMITS = {
    part3: {
        common: {
            minRiser: 125,
            maxRiser: 180,
            minTread: 280,
            maxTread: 355,
            minWidth: 1100,
            minWidthUnder3: 900,
            minHeadroom: 2100,
            minNarrowSide: 150,
            maxRise: 3700
        }
    },
    part9: {
        private: {
            minRiser: 125,
            maxRiser: 200,
            minTread: 235,
            maxTread: 355,
            minWidth: 860,
            minHeadroom: 1950,
            minNarrowSide: 150,
            maxRise: 3700
        },
        common: {
            minRiser: 125,
            maxRiser: 180,
            minTread: 280,
            maxTread: 355,
            minWidth: 900,
            minHeadroom: 2050,
            minNarrowSide: 150,
            maxRise: 3700
        }
    },
    spiral: {
        minWidth: 660,
        minTreadAt300: 190,
        maxRiser: 240
    }
};

// =====================================================================
// FONCTIONS DE CONVERSION MÃ‰TRIQUES/IMPÃ‰RIALES
// =====================================================================

/**
 * Nettoie et normalise une entrÃ©e impÃ©riale
 */
function validateImperialInput(inputValue) {
    if (!inputValue) return '';
    inputValue = inputValue.replace(/[''']/g, "'");
    inputValue = inputValue.replace(/[""â€³]/g, '"');
    inputValue = inputValue.replace(/\s*(['-/"])\s*/g, '$1');
    inputValue = inputValue.replace(/'-/g, "'");
    inputValue = inputValue.replace(/(\d)(\d+\/\d+)/g, '$1 $2');
    return inputValue.trim();
}

/**
 * Convertit millimÃ¨tres en format impÃ©rial (pieds-pouces-fractions)
 * Arrondi au 1/16" pour affichage pratique
 */
function metricToImperial(mmValue) {
    if (!mmValue || isNaN(mmValue)) return '';
    
    const totalInches = mmValue / 25.4;
    const feet = Math.floor(totalInches / 12);
    const remainingInches = totalInches % 12;
    
    // Arrondir au 1/16" le plus proche
    const sixteenths = Math.round(remainingInches * 16);
    const wholeInches = Math.floor(sixteenths / 16);
    const fractionalSixteenths = sixteenths % 16;
    
    let result = '';
    
    if (feet > 0) {
        result += feet + "'";
    }
    
    const finalInches = wholeInches + (fractionalSixteenths > 0 ? 0 : 0);
    
    if (wholeInches > 0 || (feet === 0 && fractionalSixteenths === 0)) {
        if (feet > 0) result += ' ';
        result += wholeInches;
    } else if (feet > 0 && fractionalSixteenths > 0) {
        result += ' ';
    }
    
    if (fractionalSixteenths > 0) {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(fractionalSixteenths, 16);
        const num = fractionalSixteenths / divisor;
        const den = 16 / divisor;
        
        if (wholeInches > 0) result += ' ';
        result += num + '/' + den;
    }
    
    if (wholeInches > 0 || fractionalSixteenths > 0 || feet === 0) {
        result += '"';
    }
    
    return result || '0"';
}

/**
 * Convertit millimÃ¨tres en format impÃ©rial haute prÃ©cision (1/64")
 * Pour traÃ§age CAD - inclut la valeur dÃ©cimale exacte
 */
function metricToImperialPrecise(mmValue) {
    if (!mmValue || isNaN(mmValue)) return '';
    
    const totalInches = mmValue / 25.4;
    const wholeInches = Math.floor(totalInches);
    const fractionalPart = totalInches - wholeInches;
    
    // Convertir en 64Ã¨mes pour prÃ©cision maximale
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
 * Convertit une valeur impÃ©riale en millimÃ¨tres
 * Supporte tous les formats courants
 * IMPORTANT: L'ordre des regex est critique - les formats simples (pouces seuls) 
 * doivent Ãªtre testÃ©s APRÃˆS les formats avec apostrophe obligatoire
 */
/**
 * Convertit une valeur impÃ©riale en millimÃ¨tres
 * Accepte de nombreux formats sans nettoyage prÃ©alable requis
 */
function imperialToMetric(imperialValue) {
    if (!imperialValue) return null;
    
    let input = imperialValue.toString().trim();
    // Normaliser les apostrophes et guillemets
    input = input.replace(/[''']/g, "'").replace(/[""â€³]/g, '"');
    
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
 * Formate une valeur selon le systÃ¨me de mesure choisi
 */
function formatValue(mmValue, isMetric, precision = 2) {
    if (isMetric) {
        return `${mmValue.toFixed(precision)} mm`;
    }
    return metricToImperial(mmValue);
}

/**
 * Formate une valeur avec haute prÃ©cision pour le traÃ§age
 */
function formatValuePrecise(mmValue, isMetric) {
    if (isMetric) {
        return `${mmValue.toFixed(4)} mm`;
    }
    return metricToImperialPrecise(mmValue);
}

// =====================================================================
// RÃˆGLE DU PAS ET VALIDATION
// =====================================================================

/**
 * VÃ©rifie la rÃ¨gle du pas (3 formules traditionnelles)
 * Valeurs en mm, calculs en pouces
 */
function checkStepRule(riserMm, treadMm) {
    const riserIn = riserMm / 25.4;
    const treadIn = treadMm / 25.4;
    
    // RÃ¨gle 1: G + H = 17" Ã  18" (432-457 mm)
    const rule1Value = treadIn + riserIn;
    const rule1Valid = rule1Value >= 17 && rule1Value <= 18;
    
    // RÃ¨gle 2: G Ã— H = 71 Ã  74 poÂ² (458-477 cmÂ²)
    const rule2Value = treadIn * riserIn;
    const rule2Valid = rule2Value >= 71 && rule2Value <= 74;
    
    // RÃ¨gle 3: G + 2H = 22" Ã  25" (559-635 mm)
    const rule3Value = treadIn + (2 * riserIn);
    const rule3Valid = rule3Value >= 22 && rule3Value <= 25;
    
    const validCount = [rule1Valid, rule2Valid, rule3Valid].filter(Boolean).length;
    
    return {
        isValid: validCount >= 2,
        validCount,
        rule1: { value: rule1Value, isValid: rule1Valid, range: '17"-18"' },
        rule2: { value: rule2Value, isValid: rule2Valid, range: '71-74 poÂ²' },
        rule3: { value: rule3Value, isValid: rule3Valid, range: '22"-25"' }
    };
}

/**
 * Obtient les limites CNB selon le type de bÃ¢timent et d'escalier
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
 * Calcule la dimension manquante (hauteur ou longueur) selon la priorité
 * @param {Object} params - Paramètres incluant la dimension connue
 * @returns {Object} - Dimension calculée et solutions
 */
function calculateMissingDimension(params) {
    const {
        totalRise,
        totalRun,
        buildingType,
        stairType,
        idealRiser,
        idealTread,
        priority
    } = params;
    
    const limits = getCNBLimits(buildingType, stairType);
    const hasRise = totalRise > 0;
    const hasRun = totalRun > 0;
    
    // Valeurs optimales pour la règle du pas (en pouces)
    // G + H optimal = 17" à 18", idéalement 17.5"
    // Contremarche idéale ≈ 7" (178mm), Giron idéal ≈ 10.5" (267mm)
    const optimalRiserMm = idealRiser > 0 ? idealRiser : 178;
    const optimalTreadMm = idealTread > 0 ? idealTread : 267;
    
    let calculatedDimension = 0;
    let dimensionType = '';
    
    if (hasRise && !hasRun) {
        // Hauteur connue, calculer la longueur
        dimensionType = 'run';
        
        // Nombre de contremarches basé sur la hauteur idéale
        let targetRiser = optimalRiserMm;
        if (priority === 'space') {
            // Économie d'espace: utiliser la hauteur maximale permise
            targetRiser = limits.maxRiser;
        }
        
        const numRisers = Math.round(totalRise / targetRiser);
        const actualRiser = totalRise / numRisers;
        
        // Vérifier les limites
        let finalNumRisers = numRisers;
        if (actualRiser > limits.maxRiser) {
            finalNumRisers = Math.ceil(totalRise / limits.maxRiser);
        } else if (actualRiser < limits.minRiser) {
            finalNumRisers = Math.floor(totalRise / limits.minRiser);
        }
        
        const finalRiser = totalRise / finalNumRisers;
        const numTreads = finalNumRisers - 1;
        
        // Calculer le giron optimal
        let targetTread;
        if (priority === 'comfort') {
            // Règle du pas: G + H ≈ 17.5" → G = 17.5" - H
            const riserInches = finalRiser / 25.4;
            const treadInches = 17.5 - riserInches;
            targetTread = treadInches * 25.4;
            
            // Respecter les limites
            targetTread = Math.max(limits.minTread, Math.min(limits.maxTread, targetTread));
        } else {
            // Économie d'espace: giron minimal
            targetTread = limits.minTread;
        }
        
        calculatedDimension = targetTread * numTreads;
        
    } else if (!hasRise && hasRun) {
        // Longueur connue, calculer la hauteur
        dimensionType = 'rise';
        
        // Calculer le giron idéal
        let targetTread = optimalTreadMm;
        if (priority === 'space') {
            // Économie d'espace: giron minimal pour maximiser la hauteur
            targetTread = limits.minTread;
        }
        
        // Nombre de girons basé sur la longueur
        const numTreads = Math.round(totalRun / targetTread);
        const actualTread = totalRun / numTreads;
        
        // Vérifier les limites du giron
        let finalNumTreads = numTreads;
        if (actualTread > limits.maxTread) {
            finalNumTreads = Math.ceil(totalRun / limits.maxTread);
        } else if (actualTread < limits.minTread) {
            finalNumTreads = Math.floor(totalRun / limits.minTread);
        }
        
        const finalTread = totalRun / finalNumTreads;
        const numRisers = finalNumTreads + 1;
        
        // Calculer la hauteur de contremarche optimale
        let targetRiser;
        if (priority === 'comfort') {
            // Règle du pas: G + H ≈ 17.5" → H = 17.5" - G
            const treadInches = finalTread / 25.4;
            const riserInches = 17.5 - treadInches;
            targetRiser = riserInches * 25.4;
            
            // Respecter les limites
            targetRiser = Math.max(limits.minRiser, Math.min(limits.maxRiser, targetRiser));
        } else {
            // Économie d'espace: contremarche maximale
            targetRiser = limits.maxRiser;
        }
        
        calculatedDimension = targetRiser * numRisers;
    }
    
    return {
        calculatedDimension,
        dimensionType,
        isCalculated: true
    };
}

/**
 * Calcule les dimensions optimales pour une volÃ©e droite ou tournante simple
 */
function calculateStraightStair(params) {
    const {
        totalRise,
        totalRun,
        buildingType,
        stairType,
        stairConfig,
        idealRiser,
        idealTread,
        priority
    } = params;
    
    const limits = getCNBLimits(buildingType, stairType);
    
    // DÃ©terminer le nombre de marches rayonnantes selon la config
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
        // Hauteur exacte de chaque contremarche (sans arrondi)
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
        
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
        
        // Ã‰valuer la qualitÃ© de la solution
        const stepRule = checkStepRule(riserHeight, treadDepth);
        const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
        
        // Score de qualitÃ© (plus bas = meilleur)
        let score = 0;
        const stepDeviation = Math.abs(stepValue - optimalStepValue);
        
        if (priority === 'comfort') {
            score = stepDeviation * 2;
            if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 10;
            if (idealTread > 0) score += Math.abs(treadDepth - idealTread) / 10;
            if (stepRule.isValid) score *= 0.7;
        } else {
            // Ã‰conomie d'espace: prÃ©fÃ©rer plus de contremarches (escalier plus raide)
            score = -numRisers + stepDeviation;
            if (idealRiser > 0) score += Math.abs(riserHeight - idealRiser) / 20;
        }
        
        // Calculer la longueur rÃ©elle occupÃ©e
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
 */
function calculateLShapedWithLanding(params) {
    const {
        totalRise,
        firstFlightRun,
        secondFlightRun,
        landingDepth,
        buildingType,
        stairType,
        idealRiser,
        idealTread,
        priority
    } = params;
    
    const limits = getCNBLimits(buildingType, stairType);
    
    // Le palier compte comme 2 girons (profondeur + largeur = carrÃ©)
    // Espace disponible pour les vrais girons:
    // firstFlightRun = girons volÃ©e 1 + profondeur palier
    // secondFlightRun = largeur palier + girons volÃ©e 2
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
        
        if (numTreads < 2) continue; // Au moins 1 giron par volÃ©e
        
        // Profondeur de chaque giron
        const treadDepth = availableForTreads / numTreads;
        
        if (treadDepth < limits.minTread || treadDepth > limits.maxTread) continue;
        
        // VÃ©rifier que le palier a la profondeur minimale
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
        
        // Distribution des girons entre les volÃ©es
        // Approximation basÃ©e sur les longueurs disponibles
        const flight1Available = firstFlightRun - landingDepth;
        const flight2Available = secondFlightRun - landingDepth;
        const totalAvailable = flight1Available + flight2Available;
        
        const treadsInFlight1 = Math.round(numTreads * (flight1Available / totalAvailable));
        const treadsInFlight2 = numTreads - treadsInFlight1;
        
        solutions.push({
            numRisers,
            numTreads,
            treadsInFlight1: Math.max(1, treadsInFlight1),
            treadsInFlight2: Math.max(1, treadsInFlight2),
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
 */
function calculateLShapedWithRadiating(params) {
    const {
        totalRise,
        totalRun,
        buildingType,
        stairType,
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
    
    const minRisers = Math.ceil(totalRise / limits.maxRiser);
    const maxRisers = Math.floor(totalRise / limits.minRiser);
    
    const solutions = [];
    const optimalStepValue = priority === 'comfort' ? 17.5 : 18;
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;
        
        const numTreads = numRisers - 1;
        const numRectTreads = numTreads - numRadiatingSteps;
        
        if (numRectTreads < 2) continue;
        
        // Calcul de la profondeur du giron
        const effectiveTreads = numRectTreads + (numRadiatingSteps * radiatingFactor);
        const treadDepth = totalRun / effectiveTreads;
        
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
            totalRiseCalc: riserHeight * numRisers
        });
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
        landingLength,
        buildingType,
        stairType,
        uShapedConfig,
        idealRiser,
        idealTread,
        priority
    } = params;
    
    const limits = getCNBLimits(buildingType, stairType);
    
    let availableForTreads;
    let numLandings = 1;
    
    switch (uShapedConfig) {
        case 'two_landings':
            numLandings = 2;
            availableForTreads = flight1Run + flight2Run;
            break;
        case 'radiating':
            // Marches rayonnantes: Ã©conomie d'espace
            availableForTreads = flight1Run + flight2Run + (landingLength * 0.5);
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
            totalRiseCalc: riserHeight * numRisers
        });
    }
    
    solutions.sort((a, b) => a.score - b.score);
    return solutions.slice(0, 3);
}

/**
 * Calcule les dimensions pour un escalier hÃ©licoÃ¯dal
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
    
    // Pour l'hÃ©licoÃ¯dal, le giron est mesurÃ© Ã  300mm de l'axe de la main courante
    const measurementRadius = innerRadius + 300;
    
    // Longueur de l'arc Ã  300mm
    const arcLength = (2 * Math.PI * measurementRadius * rotationDegrees) / 360;
    
    const minRisers = Math.ceil(totalRise / spiralLimits.maxRiser);
    const maxRisers = Math.floor(totalRise / limits.minRiser);
    
    const solutions = [];
    
    for (let numRisers = minRisers; numRisers <= maxRisers + 3; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight > spiralLimits.maxRiser || riserHeight < limits.minRiser) continue;
        
        const numTreads = numRisers; // Dans un hÃ©licoÃ¯dal, autant de marches que de contremarches
        const treadAt300 = arcLength / numTreads;
        
        if (treadAt300 < spiralLimits.minTreadAt300) continue;
        
        let score = Math.abs(riserHeight - 200); // IdÃ©al pour hÃ©licoÃ¯dal
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
// AFFICHAGE DES RÃ‰SULTATS - CALCULATEUR
// =====================================================================

function displayCalculatorResults(solutions, params) {
    const {
        totalRiseValue,
        totalRunValue,
        stairWidthValue,
        buildingTypeValue,
        stairTypeValue,
        stairConfigValue,
        lShapedConfigValue,
        isMetric,
        dimensionCalculated,
        priority
    } = params;
    
    const resultDiv = document.getElementById('calculatorResult');
    const contentDiv = document.getElementById('calculatorResultContent');
    
    if (!solutions || solutions.length === 0) {
        // Utiliser les vraies limites CNB selon le type de bÃ¢timent
        const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
        const minRisers = Math.ceil(totalRiseValue / limits.maxRiser);
        const minTreads = minRisers - 1;
        
        // Pour escalier en L avec palier, calculer l'espace rÃ©ellement disponible pour les girons
        let availableForTreads = params.totalRunValue;
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            // L'espace disponible = somme des volÃ©es - 2 fois la profondeur du palier
            const landingDepth = stairWidthValue;
            availableForTreads = (params.firstFlightRunValue + params.secondFlightRunValue) - (landingDepth * 2);
        }
        
        const minLength = minTreads * limits.minTread;
        const calculatedTread = availableForTreads / minTreads;
        
        const codeRef = buildingTypeValue === 'part3' ? 'Partie 3' : 'Partie 9';
        
        let html = '<h3>âš Â Â Aucune solution conforme trouvÃ©e</h3>';
        html += '<div class="warning">';
        html += '<p><strong>Raison :</strong></p>';
        html += '<ul>';
        
        if (isMetric) {
            html += `<li>Giron calculÃ© : ${calculatedTread.toFixed(0)} mm < minimum requis ${limits.minTread} mm (${codeRef})</li>`;
        } else {
            html += `<li>Giron calculÃ© : ${metricToImperial(calculatedTread)} < minimum requis ${metricToImperial(limits.minTread)} (${codeRef})</li>`;
        }
        
        html += '</ul>';
        html += '<p><strong>Suggestions :</strong></p>';
        html += '<ul>';
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            // Suggestions spÃ©cifiques pour escalier en L avec palier
            const minLengthWithLanding = minLength + (stairWidthValue * 2);
            if (isMetric) {
                html += `<li>Longueur totale minimale requise â‰ˆ ${minLengthWithLanding.toFixed(0)} mm (${minTreads} girons Ã— ${limits.minTread} mm + 2Ã— palier)</li>`;
            } else {
                html += `<li>Longueur totale minimale requise â‰ˆ ${metricToImperial(minLengthWithLanding)} (${minTreads} girons Ã— ${metricToImperial(limits.minTread)} + 2Ã— palier)</li>`;
            }
            html += '<li>Augmentez la longueur des volÃ©es</li>';
            html += '<li>RÃ©duisez la largeur de l\'escalier (= profondeur du palier)</li>';
        } else {
            if (isMetric) {
                html += `<li>Longueur minimale requise â‰ˆ ${minLength.toFixed(0)} mm (${minTreads} girons Ã— ${limits.minTread} mm)</li>`;
            } else {
                html += `<li>Longueur minimale requise â‰ˆ ${metricToImperial(minLength)} (${minTreads} girons Ã— ${metricToImperial(limits.minTread)})</li>`;
            }
            html += '<li>Essayez une configuration avec palier (escalier en L ou U)</li>';
            html += '<li>Augmentez la longueur disponible</li>';
        }
        
        html += '<li>VÃ©rifiez le type d\'escalier (PrivÃ© vs Commun)</li>';
        html += '</ul></div>';
        
        contentDiv.innerHTML = html;
        resultDiv.className = 'result non-compliant';
        resultDiv.style.display = 'block';
        return;
    }
    
    const best = solutions[0];
    const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
    const codeRef = buildingTypeValue === 'part3' ? 'CNB 2020 Partie 3' : 'CNB 2020 Partie 9';
    
    // VÃ©rifier la largeur
    const isWidthOk = stairWidthValue >= limits.minWidth;
    
    let html = '';
    
    // Titre et statut
    const isCompliant = best.stepRule.isValid && isWidthOk;
    html += `<h3>${isCompliant ? 'âœ“' : 'âš Â Â'} Solution optimale (${codeRef})</h3>`;
    
    // Avertissement dimension calculée
    if (dimensionCalculated) {
        const priorityLabel = priority === 'comfort' ? 'confort optimal' : "économie d'espace";
        if (dimensionCalculated === 'rise') {
            html += '<div class="step-formula">';
            html += `<strong>📐 Hauteur suggérée (${priorityLabel}) :</strong> ${formatValuePrecise(totalRiseValue, isMetric)}`;
            html += '</div>';
        } else if (dimensionCalculated === 'run') {
            html += '<div class="step-formula">';
            html += `<strong>📐 Longueur suggérée (${priorityLabel}) :</strong> ${formatValuePrecise(totalRunValue, isMetric)}`;
            html += '</div>';
        }
    }
    
    // Avertissement largeur
    if (!isWidthOk) {
        html += `<div class="warning"><p>âš Â Â Largeur ${formatValue(stairWidthValue, isMetric, 0)} infÃ©rieure au minimum requis (${formatValue(limits.minWidth, isMetric, 0)})</p></div>`;
    }
    
    // Dimensions principales
    html += '<div class="result-section">';
    html += '<h4>ðŸ“Â Dimensions calculÃ©es</h4>';
    html += '<ul>';
    html += `<li><strong>Contremarches :</strong> ${best.numRisers} Ã— ${formatValuePrecise(best.riserHeight, isMetric)}</li>`;
    html += `<li><strong>Girons :</strong> ${best.numTreads} Ã— ${formatValuePrecise(best.treadDepth, isMetric)}</li>`;
    
    if (best.numRadiatingSteps > 0) {
        html += `<li><strong>Marches rayonnantes :</strong> ${best.numRadiatingSteps}</li>`;
        html += `<li><strong>Girons rectangulaires :</strong> ${best.numRectTreads}</li>`;
    }
    
    if (best.useLandingConfiguration) {
        html += `<li><strong>Profondeur palier :</strong> ${formatValuePrecise(best.landingDepth, isMetric)}</li>`;
        html += `<li><strong>Girons volÃ©e 1 :</strong> ${best.treadsInFlight1}</li>`;
        html += `<li><strong>Girons volÃ©e 2 :</strong> ${best.treadsInFlight2}</li>`;
    }
    
    html += `<li><strong>Largeur :</strong> ${formatValue(stairWidthValue, isMetric, 0)} ${isWidthOk ? 'âœ“' : 'âš Â Â'}</li>`;
    html += '</ul></div>';
    
    // Vérification mathématique
    html += '<div class="step-formula">';
    html += '<strong>Vérification mathématique :</strong><br>';
    
    // Déterminer la longueur disponible pour les girons
    let availableForTreadsValue = params.totalRunValue;
    if (best.useLandingConfiguration && best.availableForTreads) {
        availableForTreadsValue = best.availableForTreads;
    }
    
    if (isMetric) {
        // Vérification hauteur (contremarches)
        const totalRiseCalc = best.riserHeight * best.numRisers;
        const riseError = Math.abs(totalRiseCalc - totalRiseValue);
        html += `${best.numRisers} × ${best.riserHeight.toFixed(4)} mm = ${totalRiseCalc.toFixed(4)} mm `;
        html += riseError < 0.01 ? '✔' : `⚠ Écart ${riseError.toFixed(4)} mm`;
        
        // Vérification longueur (girons) - pour TOUS les escaliers
        if (!best.isSpiral && best.numTreads && best.treadDepth) {
            html += '<br>';
            const totalTreadCalc = best.treadDepth * best.numTreads;
            const treadError = Math.abs(totalTreadCalc - availableForTreadsValue);
            html += `${best.numTreads} × ${best.treadDepth.toFixed(4)} mm = ${totalTreadCalc.toFixed(4)} mm `;
            html += treadError < 0.01 ? '✔' : `⚠ Écart ${treadError.toFixed(4)} mm`;
        }
    } else {
        // Vérification hauteur (contremarches) en impérial
        const riserIn = best.riserHeight / 25.4;
        const totalRiseIn = (best.riserHeight * best.numRisers) / 25.4;
        html += `${best.numRisers} × ${riserIn.toFixed(6)}" = ${totalRiseIn.toFixed(6)}" ✔`;
        
        // Vérification longueur (girons) en impérial - pour TOUS les escaliers
        if (!best.isSpiral && best.numTreads && best.treadDepth) {
            html += '<br>';
            const treadIn = best.treadDepth / 25.4;
            const totalTreadIn = (best.treadDepth * best.numTreads) / 25.4;
            const availableIn = availableForTreadsValue / 25.4;
            const treadError = Math.abs(totalTreadIn - availableIn);
            html += `${best.numTreads} × ${treadIn.toFixed(6)}" = ${totalTreadIn.toFixed(6)}" `;
            html += treadError < 0.001 ? '✔' : `⚠ Écart ${treadError.toFixed(6)}"`;
        }
    }
    
    html += '</div>';

    // RÃ¨gle du pas
    html += '<div class="result-section">';
    html += `<h4>${best.stepRule.isValid ? 'âœ“' : 'âš Â Â'} RÃ¨gle du pas (${best.stepRule.validCount}/3)</h4>`;
    html += '<ul>';
    html += `<li>${best.stepRule.rule1.isValid ? 'âœ“' : 'âœ—'} G + H = ${best.stepRule.rule1.value.toFixed(2)}" (${best.stepRule.rule1.range})</li>`;
    html += `<li>${best.stepRule.rule2.isValid ? 'âœ“' : 'âœ—'} G Ã— H = ${best.stepRule.rule2.value.toFixed(2)} (${best.stepRule.rule2.range})</li>`;
    html += `<li>${best.stepRule.rule3.isValid ? 'âœ“' : 'âœ—'} G + 2H = ${best.stepRule.rule3.value.toFixed(2)}" (${best.stepRule.rule3.range})</li>`;
    html += '</ul></div>';
    
    // Instructions de traÃ§age
    html += '<div class="warning">';
    html += '<p><strong>ðŸ“Â Instructions pour le traÃ§age CAD :</strong></p>';
    html += '<ul>';
    html += `<li>Utilisez les ${isMetric ? 'valeurs exactes en mm' : 'valeurs dÃ©cimales entre parenthÃ¨ses'}</li>`;
    html += `<li>Nombre de contremarches : ${best.numRisers}</li>`;
    html += `<li>Nombre de girons tracÃ©s : ${best.numTreads} (le dernier giron = plancher supÃ©rieur)</li>`;
    html += '<li>La somme des contremarches doit Ã©galer la hauteur totale exacte</li>';
    html += '<li>La somme des girons doit Ã©galer la longueur horizontale exacte</li>';
    html += '</ul></div>';
    
    // Notes spÃ©cifiques selon la configuration
    if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
        html += '<div class="result-section">';
        html += '<h4>ðŸ“Â Notes - Escalier en L avec palier</h4>';
        html += '<ul>';
        html += '<li>Le palier est un giron surdimensionnÃ© (carrÃ©)</li>';
        html += '<li>Profondeur palier = largeur palier = largeur de l\'escalier</li>';
        html += '<li>Mesures prises sur le cÃ´tÃ© long de chaque volÃ©e</li>';
        html += '</ul></div>';
    }
    
    if (best.isSpiral) {
        html += '<div class="result-section">';
        html += '<h4>ðŸ“Â Notes - Escalier hÃ©licoÃ¯dal</h4>';
        html += '<ul>';
        html += '<li>Giron mesurÃ© Ã  300 mm de l\'axe de la main courante</li>';
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
        html += '<th>#</th><th>CM</th><th>Hauteur CM</th><th>Girons</th><th>Profondeur</th><th>RÃ¨gle</th>';
        html += '</tr></thead><tbody>';
        
        solutions.forEach((sol, i) => {
            const rowClass = i === 0 ? 'optimal-solution' : '';
            html += `<tr class="${rowClass}">`;
            html += `<td>${i + 1}${i === 0 ? ' â­Â' : ''}</td>`;
            html += `<td>${sol.numRisers}</td>`;
            html += `<td>${formatValue(sol.riserHeight, isMetric, 1)}</td>`;
            html += `<td>${sol.numTreads}</td>`;
            html += `<td>${formatValue(sol.treadDepth, isMetric, 1)}</td>`;
            html += `<td>${sol.stepRule.validCount}/3</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
    }
    
    contentDiv.innerHTML = html;
    resultDiv.className = 'result ' + (isCompliant ? 'compliant' : 'non-compliant');
    resultDiv.style.display = 'block';
}

// =====================================================================
// AFFICHAGE DES RÃ‰SULTATS - VÃ‰RIFICATION
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
        html += `<h3>âœ“ Conforme au ${codeReference}</h3>`;
    } else {
        html += `<h3>âš Â Â Non conforme au ${codeReference}</h3>`;
        html += '<div class="result-section">';
        html += '<h4>ProblÃ¨mes identifiÃ©s :</h4>';
        html += '<ul>';
        issues.forEach(issue => {
            html += `<li>${issue}</li>`;
        });
        html += '</ul></div>';
    }
    
    // RÃ¨gle du pas
    html += '<div class="result-section">';
    html += `<h4>${stepRule.isValid ? 'âœ“' : 'âš Â Â'} RÃ¨gle du pas (${stepRule.validCount}/3)</h4>`;
    html += '<ul>';
    html += `<li>${stepRule.rule1.isValid ? 'âœ“' : 'âœ—'} RÃ¨gle 1 (G+H) : ${stepRule.rule1.value.toFixed(2)}" (17"-18")</li>`;
    html += `<li>${stepRule.rule2.isValid ? 'âœ“' : 'âœ—'} RÃ¨gle 2 (GÃ—H) : ${stepRule.rule2.value.toFixed(2)} poÂ² (71-74)</li>`;
    html += `<li>${stepRule.rule3.isValid ? 'âœ“' : 'âœ—'} RÃ¨gle 3 (G+2H) : ${stepRule.rule3.value.toFixed(2)}" (22"-25")</li>`;
    html += '</ul></div>';
    
    contentDiv.innerHTML = html;
    resultDiv.className = 'result ' + (isCompliant ? 'compliant' : 'non-compliant');
    resultDiv.style.display = 'block';
}

// =====================================================================
// INITIALISATION ET GESTION DE L'INTERFACE
// =====================================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Ã‰lÃ©ments du DOM =====
    
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
    
    // VÃ©rification
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
    
    // ===== Mise Ã  jour des placeholders et visibilitÃ© selon le systÃ¨me de mesure =====
    
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
        
        // Reformater les rÃ©sultats si nÃ©cessaire
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
        const lConfig = calcLShapedConfig.value;
        
        if (lConfig === 'standard_landing') {
            calcStandardRunContainer.style.display = 'none';
            calcLandingDimensions.style.display = 'block';
        } else {
            calcStandardRunContainer.style.display = 'block';
            calcLandingDimensions.style.display = 'none';
        }
    }
    
    calcStairConfig.addEventListener('change', updateCalcConfigOptions);
    calcLShapedConfig.addEventListener('change', updateCalcLShapedSubOptions);
    
    if (calcDancingAngle) {
        calcDancingAngle.addEventListener('change', function() {
            calcDancingCustomAngleContainer.style.display = this.value === 'custom' ? 'block' : 'none';
        });
    }
    
    // ===== Gestion des configurations d'escalier - VÃ©rification =====
    
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
    
    // ===== Synchronisation des champs mÃ©triques/impÃ©riaux =====
    
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
            
            // Nettoyer/normaliser seulement Ã  la perte de focus
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
        
        // RÃ©cupÃ©rer les valeurs selon le systÃ¨me de mesure
        let totalRiseValue, totalRunValue, stairWidthValue, idealRiserValue, idealTreadValue;
        let firstFlightRunValue = 0, secondFlightRunValue = 0;
        
        if (isMetric) {
            totalRiseValue = parseFloat(totalRise.value);
            stairWidthValue = parseFloat(stairDesiredWidth.value);
            idealRiserValue = parseFloat(idealRiser.value) || 0;
            idealTreadValue = parseFloat(idealTread.value) || 0;
            
            if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
                firstFlightRunValue = parseFloat(firstFlightRun.value);
                secondFlightRunValue = parseFloat(secondFlightRun.value);
                totalRunValue = firstFlightRunValue + secondFlightRunValue;
            } else {
                totalRunValue = parseFloat(totalRun.value);
            }
        } else {
            totalRiseValue = imperialToMetric(validateImperialInput(totalRiseImperial.value));
            stairWidthValue = imperialToMetric(validateImperialInput(stairDesiredWidthImperial.value));
            idealRiserValue = imperialToMetric(validateImperialInput(idealRiserImperial.value)) || 0;
            idealTreadValue = imperialToMetric(validateImperialInput(idealTreadImperial.value)) || 0;
            
            if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
                firstFlightRunValue = imperialToMetric(validateImperialInput(firstFlightRunImperial.value));
                secondFlightRunValue = imperialToMetric(validateImperialInput(secondFlightRunImperial.value));
                totalRunValue = firstFlightRunValue + secondFlightRunValue;
            } else {
                totalRunValue = imperialToMetric(validateImperialInput(totalRunImperial.value));
            }
        }
        
        // PrioritÃ© de conception (dÃ©finie tÃ´t pour le calcul de dimension manquante)
        const priorityRadio = document.querySelector('input[name="calcPriority"]:checked');
        const priority = priorityRadio ? priorityRadio.value : 'comfort';
        
        // Validation - permettre une seule dimension pour escaliers droits
        let isValid = true;
        let dimensionCalculated = null; // 'rise', 'run', ou null
        
        const hasRise = !isNaN(totalRiseValue) && totalRiseValue > 0;
        const hasRun = !isNaN(totalRunValue) && totalRunValue > 0;
        
        // Pour les escaliers droits simples, permettre une seule dimension
        if (stairConfigValue === 'straight' || stairConfigValue === 'turning_30' || 
            stairConfigValue === 'turning_45' || stairConfigValue === 'turning_60') {
            
            if (!hasRise && !hasRun) {
                document.getElementById('totalRiseError').textContent = 'Entrez au moins une dimension (hauteur ou longueur).';
                isValid = false;
            } else if (!hasRise && hasRun) {
                // Calculer la hauteur optimale
                const result = calculateMissingDimension({
                    totalRise: 0,
                    totalRun: totalRunValue,
                    buildingType: buildingTypeValue,
                    stairType: stairTypeValue,
                    idealRiser: idealRiserValue,
                    idealTread: idealTreadValue,
                    priority: priority
                });
                totalRiseValue = result.calculatedDimension;
                dimensionCalculated = 'rise';
            } else if (hasRise && !hasRun) {
                // Calculer la longueur optimale
                const result = calculateMissingDimension({
                    totalRise: totalRiseValue,
                    totalRun: 0,
                    buildingType: buildingTypeValue,
                    stairType: stairTypeValue,
                    idealRiser: idealRiserValue,
                    idealTread: idealTreadValue,
                    priority: priority
                });
                totalRunValue = result.calculatedDimension;
                dimensionCalculated = 'run';
            }
            // Si les deux sont fournis, pas de calcul de dimension manquante
            
        } else if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            // Pour escalier en L, les deux volées sont requises
            if (!hasRise) {
                document.getElementById('totalRiseError').textContent = 'Veuillez entrer une hauteur valide.';
                isValid = false;
            }
            if (isNaN(firstFlightRunValue) || firstFlightRunValue <= 0) {
                document.getElementById('firstFlightRunError').textContent = 'Veuillez entrer une valeur valide.';
                isValid = false;
            }
            if (isNaN(secondFlightRunValue) || secondFlightRunValue <= 0) {
                document.getElementById('secondFlightRunError').textContent = 'Veuillez entrer une valeur valide.';
                isValid = false;
            }
        } else if (stairConfigValue !== 'spiral') {
            // Autres configurations: les deux dimensions requises
            if (!hasRise) {
                document.getElementById('totalRiseError').textContent = 'Veuillez entrer une hauteur valide.';
                isValid = false;
            }
            if (!hasRun) {
                document.getElementById('totalRunError').textContent = 'Veuillez entrer une longueur valide.';
                isValid = false;
            }
        }
        
        if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
            document.getElementById('stairDesiredWidthError').textContent = 'Veuillez entrer une largeur valide.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Calculer
        const solutions = calculateOptimalStair({
            totalRise: totalRiseValue,
            totalRun: totalRunValue,
            firstFlightRun: firstFlightRunValue,
            secondFlightRun: secondFlightRunValue,
            landingDepth: stairWidthValue,
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            lShapedConfig: lShapedConfigValue,
            uShapedConfig: uShapedConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priority
        });
        
        // Stocker les paramÃ¨tres pour reformatage
        lastCalculatorParams = {
            totalRiseValue,
            totalRunValue,
            firstFlightRunValue,
            secondFlightRunValue,
            stairWidthValue,
            buildingTypeValue,
            stairTypeValue,
            stairConfigValue,
            lShapedConfigValue,
            isMetric,
            dimensionCalculated,
            priority,
            solutions
        };
        
        displayCalculatorResults(solutions, lastCalculatorParams);
    }
    
    calculateButton.addEventListener('click', performCalculation);
    
    // Recalcul automatique lors du changement de prioritÃ©
    document.querySelectorAll('input[name="calcPriority"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (lastCalculatorParams) {
                performCalculation();
            }
        });
    });
    
    // ===== VÃ©rification de conformitÃ© =====
    
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
        
        // RÃ©cupÃ©rer les valeurs
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
        
        // VÃ©rifications
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
        if (treadValue > limits.maxTread) {
            issues.push(`Giron ${treadValue.toFixed(0)} mm > maximum ${limits.maxTread} mm`);
            isCompliant = false;
        }
        
        // Largeur
        if (widthValue < limits.minWidth) {
            issues.push(`Largeur ${widthValue.toFixed(0)} mm < minimum ${limits.minWidth} mm`);
            isCompliant = false;
        }
        
        // Ã‰chappÃ©e
        if (headroomValue < limits.minHeadroom) {
            issues.push(`Ã‰chappÃ©e ${headroomValue.toFixed(0)} mm < minimum ${limits.minHeadroom} mm`);
            isCompliant = false;
        }
        
        // VÃ©rifications spÃ©cifiques Ã  la configuration
        if (stairConfigValue === 'dancing_steps' && narrowSideValue > 0) {
            if (narrowSideValue < limits.minNarrowSide) {
                issues.push(`Giron cÃ´tÃ© Ã©troit ${narrowSideValue.toFixed(0)} mm < minimum ${limits.minNarrowSide} mm Ã  300 mm de l'axe`);
                isCompliant = false;
            }
        }
        
        if (stairConfigValue === 'spiral') {
            if (spiralWidthValue > 0 && spiralWidthValue < CNB_LIMITS.spiral.minWidth) {
                issues.push(`Largeur libre ${spiralWidthValue.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minWidth} mm`);
                isCompliant = false;
            }
            if (spiralTreadAt300Value > 0 && spiralTreadAt300Value < CNB_LIMITS.spiral.minTreadAt300) {
                issues.push(`Giron Ã  300 mm ${spiralTreadAt300Value.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minTreadAt300} mm`);
                isCompliant = false;
            }
            if (stairUseValue === 'exit') {
                issues.push('Escalier hÃ©licoÃ¯dal interdit comme issue (CNB 9.8.4.7)');
                isCompliant = false;
            }
        }
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            if (landingDepthValue > 0 && landingDepthValue < limits.minTread) {
                issues.push(`Profondeur palier ${landingDepthValue.toFixed(0)} mm < minimum ${limits.minTread} mm`);
                isCompliant = false;
            }
        }
        
        // RÃ¨gle du pas
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
    
    // ===== Support touche EntrÃ©e =====
    
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
});
