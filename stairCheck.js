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
// FONCTIONS DE CONVERSION MÉTRIQUES/IMPÉRIALES
// =====================================================================

/**
 * Nettoie et normalise une entrée impériale
 */
function validateImperialInput(inputValue) {
    if (!inputValue) return '';
    inputValue = inputValue.replace(/[''']/g, "'");
    inputValue = inputValue.replace(/[""ââ‚¬Â³]/g, '"');
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
 * doivent être testés APRÃƒË†S les formats avec apostrophe obligatoire
 */
/**
 * Convertit une valeur impériale en millimètres
 * Accepte de nombreux formats sans nettoyage préalable requis
 */
function imperialToMetric(imperialValue) {
    if (!imperialValue) return null;
    
    let input = imperialValue.toString().trim();
    // Normaliser les apostrophes et guillemets
    input = input.replace(/[''']/g, "'").replace(/[""ââ‚¬Â³]/g, '"');
    
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

// =====================================================================
// RÃƒË†GLE DU PAS ET VALIDATION
// =====================================================================

/**
 * Vérifie la règle du pas (3 formules traditionnelles)
 * Valeurs en mm, calculs en pouces
 */
function checkStepRule(riserMm, treadMm) {
    const riserIn = riserMm / 25.4;
    const treadIn = treadMm / 25.4;
    
    // Règle 1: G + H = 17" à 18" (432-457 mm)
    const rule1Value = treadIn + riserIn;
    const rule1Valid = rule1Value >= 17 && rule1Value <= 18;
    
    // Règle 2: G × H = 71 à 74 po² (458-477 cm²)
    const rule2Value = treadIn * riserIn;
    const rule2Valid = rule2Value >= 71 && rule2Value <= 74;
    
    // Règle 3: G + 2H = 22" à 25" (559-635 mm)
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
 * Partie 3: Max 3,7 m (3700 mm) - Max 2,4 m (2400 mm) pour groupe B div. 2
 * Partie 9: Pas de limite spécifique mais recommandé < 3,7 m
 */
function checkFlightHeightLimits(riserHeight, numRisers, buildingType, stairType) {
    const flightHeight = riserHeight * numRisers;
    
    // Limites selon le CNB 2020 Partie 3, article 3.4.6.3
    if (buildingType === 'part3') {
        // Groupe B, division 2 (soins, traitement, détention) - max 2,4 m
        // Pour simplifier, on applique toujours la limite de 3,7 m
        const maxHeight = 3700; // mm (3,7 m)
        
        if (flightHeight > maxHeight) {
            return {
                isValid: false,
                flightHeight: flightHeight,
                maxHeight: maxHeight,
                message: `La hauteur de volée (${(flightHeight/1000).toFixed(2)} m) dépasse la limite de ${(maxHeight/1000).toFixed(1)} m (CNB 3.4.6.3)`
            };
        }
    }
    
    return {
        isValid: true,
        flightHeight: flightHeight
    };
}

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
        // Hauteur exacte de chaque contremarche (sans arrondi)
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < limits.minRiser || riserHeight > limits.maxRiser) continue;

        // Vérifier la hauteur maximale de volée (CNB 3.4.6.3)
        const flightCheck = checkFlightHeightLimits(riserHeight, numRisers, buildingType, stairType);
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

        // Vérifier la hauteur maximale de volée
        const flightCheck = checkFlightHeightLimits(riserHeight, numRisers, buildingType, stairType);
        if (!flightCheck.isValid) continue;
        
        // Nombre de girons = nombre de contremarches - 1
        const numTreads = numRisers - 1;
        
        if (numTreads < 2) continue; // Au moins 1 giron par volée
        
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
        
        // Distribution des girons entre les volées
        // Approximation basée sur les longueurs disponibles
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
 * Les marches rayonnantes se situent à l'intersection des deux volées
 */
function calculateLShapedWithRadiating(params) {
    const {
        totalRise,
        firstFlightRun,
        secondFlightRun,
        buildingType,
        stairType,
        lShapedConfig,
        idealRiser,
        idealTread,
        priority
    } = params;
    
    // La longueur totale est la somme des deux volées perpendiculaires
    const totalRun = firstFlightRun + secondFlightRun;
    
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

        // Vérifier la hauteur maximale de volée
        const flightCheck = checkFlightHeightLimits(riserHeight, numRisers, buildingType, stairType);
        if (!flightCheck.isValid) continue;
        
        const numTreads = numRisers - 1;
        const numRectTreads = numTreads - numRadiatingSteps;
        
        if (numRectTreads < 2) continue;
        
        // IMPORTANT: Escalier en L avec marches rayonnantes = UNE SEULE VOLÉE
        // Tous les girons rectangulaires doivent avoir la MÃŠME profondeur (uniformité dans une volée)
        // Les marches rayonnantes occupent un espace diagonal à l'intersection
        
        // Facteur d'espace : une marche rayonnante occupe environ 0.7 × giron dans chaque direction
        const radiatingSpace = numRadiatingSteps * radiatingFactor;
        
        // Résoudre le système pour trouver la répartition optimale des girons
        // N1 × G + radiatingSpace × G = firstFlightRun
        // N2 × G + radiatingSpace × G = secondFlightRun
        // N1 + N2 = numRectTreads
        //
        // Pour que G soit identique dans les deux équations :
        // N1 = (firstFlightRun × numRectTreads + radiatingSpace × (firstFlightRun - secondFlightRun)) / totalRun
        
        const firstFlightRectTreads = Math.round(
            (firstFlightRun * numRectTreads + radiatingSpace * (firstFlightRun - secondFlightRun)) / totalRun
        );
        const secondFlightRectTreads = numRectTreads - firstFlightRectTreads;
        
        if (firstFlightRectTreads < 1 || secondFlightRectTreads < 1) continue;
        
        // Calculer le giron uniforme à partir de chaque direction
        const treadDepth1 = firstFlightRun / (firstFlightRectTreads + radiatingSpace);
        const treadDepth2 = secondFlightRun / (secondFlightRectTreads + radiatingSpace);
        
        // Utiliser la moyenne pour le giron uniforme
        const treadDepth = (treadDepth1 + treadDepth2) / 2;
        
        // Vérifier que la différence entre les deux est acceptable
        // (sinon les dimensions entrées ne permettent pas un giron parfaitement uniforme)
        const treadVariation = Math.abs(treadDepth1 - treadDepth2);
        if (treadVariation > 25) continue; // Max 25mm de différence
        
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
            // Marches rayonnantes: économie d'espace
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
    
    // Pour l'hélicoïdal, le giron est mesuré à 300mm de l'axe de la main courante
    const measurementRadius = innerRadius + 300;
    
    // Longueur de l'arc à 300mm
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
 * Génère une visualisation SVG d'un escalier droit (vue de profil)
 * Toutes les valeurs d'entrée sont en mm (unités internes du calculateur)
 * L'affichage est formaté selon le système de mesure choisi par l'utilisateur
 */
function generateStraightStairVisualization(stairData) {
    const {
        numRisers,
        numTreads,
        riserHeight,
        treadDepth,
        totalRise,
        totalRun,
        isMetric
    } = stairData;
    
    // Arrondir pour un rendu propre
    const r = (n) => Math.round(n * 10) / 10;
    
    // Dimensions du SVG
    const W = 620, H = 350;
    const PAD = { left: 55, right: 85, top: 40, bottom: 55 };
    
    // Zone de dessin
    const drawW = W - PAD.left - PAD.right;
    const drawH = H - PAD.top - PAD.bottom;
    
    // Echelle
    const scaleX = drawW / totalRun;
    const scaleY = drawH / totalRise;
    const scale = Math.min(scaleX, scaleY) * 0.85;
    
    // Taille de l'escalier
    const stairW = r(totalRun * scale);
    const stairH = r(totalRise * scale);
    
    // Position de depart (bas-gauche)
    const startX = r(PAD.left + (drawW - stairW) / 2);
    const startY = r(H - PAD.bottom);
    
    // Pas en pixels
    const stepH = r(riserHeight * scale);
    const stepW = r(treadDepth * scale);
    
    // Formatage des dimensions
    const riseText = formatValuePrecise(totalRise, isMetric);
    const runText = formatValuePrecise(totalRun, isMetric);
    const riserText = formatValuePrecise(riserHeight, isMetric);
    const treadText = formatValuePrecise(treadDepth, isMetric);

    // Debut du SVG
    let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';
    
    // Fond blanc
    svg += '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    
    // Styles
    svg += '<style>';
    svg += '.fill { fill: #c8e6c9; stroke: #2e7d32; stroke-width: 1; }';
    svg += '.line { stroke: #1b5e20; stroke-width: 2; fill: none; }';
    svg += '.grid { stroke: #bbb; stroke-width: 0.5; stroke-dasharray: 3,3; }';
    svg += '.dim { stroke: #555; stroke-width: 1; }';
    svg += '.txt { font: bold 11px Arial; fill: #333; }';
    svg += '.lbl { font: 10px Arial; fill: #666; }';
    svg += '.ttl { font: bold 12px Arial; fill: #1b5e20; }';
    svg += '</style>';
    
    // Marqueurs pour les fleches
    svg += '<defs>';
    svg += '<marker id="as" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto">';
    svg += '<path d="M6,0 L0,3 L6,6" fill="none" stroke="#555"/>';
    svg += '</marker>';
    svg += '<marker id="ae" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">';
    svg += '<path d="M0,0 L6,3 L0,6" fill="none" stroke="#555"/>';
    svg += '</marker>';
    svg += '</defs>';
    
    // Titre
    svg += '<text x="15" y="25" class="ttl">Vue de profil - Volee droite</text>';
    
    // Construction du path
    let x = startX, y = startY;
    let pathFill = 'M' + x + ',' + y;
    let pathLine = 'M' + x + ',' + y;
    
    for (let i = 0; i < numRisers; i++) {
        y = r(y - stepH);
        pathFill += ' L' + x + ',' + y;
        pathLine += ' L' + x + ',' + y;
        
        if (i < numTreads) {
            x = r(x + stepW);
            pathFill += ' L' + x + ',' + y;
            pathLine += ' L' + x + ',' + y;
        }
    }
    
    const endX = x, endY = y;
    
    // Fermer le remplissage
    pathFill += ' L' + r(endX + 20) + ',' + endY + ' L' + r(endX + 20) + ',' + startY + ' Z';
    
    // Dessiner
    svg += '<path d="' + pathFill + '" class="fill"/>';
    svg += '<path d="' + pathLine + '" class="line"/>';
    
    // Lignes de niveau
    svg += '<line x1="' + (startX - 25) + '" y1="' + startY + '" x2="' + r(startX + stairW + 5) + '" y2="' + startY + '" class="grid"/>';
    svg += '<text x="' + (startX - 30) + '" y="' + (startY + 4) + '" class="lbl" text-anchor="end">Sol</text>';
    
    svg += '<line x1="' + (endX - 5) + '" y1="' + endY + '" x2="' + r(endX + 45) + '" y2="' + endY + '" class="grid"/>';
    svg += '<text x="' + r(endX + 50) + '" y="' + (endY + 4) + '" class="lbl">Arrivee</text>';
    
    // Cotation horizontale
    const dimY = startY + 25;
    svg += '<line x1="' + startX + '" y1="' + dimY + '" x2="' + r(startX + stairW) + '" y2="' + dimY + '" class="dim" marker-start="url(#as)" marker-end="url(#ae)"/>';
    svg += '<line x1="' + startX + '" y1="' + (startY + 2) + '" x2="' + startX + '" y2="' + (dimY + 3) + '" class="dim"/>';
    svg += '<line x1="' + r(startX + stairW) + '" y1="' + (startY + 2) + '" x2="' + r(startX + stairW) + '" y2="' + (dimY + 3) + '" class="dim"/>';
    svg += '<text x="' + r(startX + stairW/2) + '" y="' + (dimY + 14) + '" class="txt" text-anchor="middle">' + runText + '</text>';
    svg += '<text x="' + r(startX + stairW/2) + '" y="' + (dimY + 26) + '" class="lbl" text-anchor="middle">(' + numTreads + ' girons x ' + treadText + ')</text>';
    
    // Cotation verticale
    const dimX = endX + 32;
    svg += '<line x1="' + dimX + '" y1="' + startY + '" x2="' + dimX + '" y2="' + endY + '" class="dim" marker-start="url(#as)" marker-end="url(#ae)"/>';
    svg += '<line x1="' + (endX + 2) + '" y1="' + startY + '" x2="' + (dimX + 3) + '" y2="' + startY + '" class="dim"/>';
    svg += '<line x1="' + (endX + 2) + '" y1="' + endY + '" x2="' + (dimX + 3) + '" y2="' + endY + '" class="dim"/>';
    
    const midY = r((startY + endY) / 2);
    svg += '<text x="' + (dimX + 8) + '" y="' + (midY - 5) + '" class="txt">' + riseText + '</text>';
    svg += '<text x="' + (dimX + 8) + '" y="' + (midY + 9) + '" class="lbl">(' + numRisers + ' CM)</text>';
    
    // Legende
    svg += '<text x="15" y="' + (H - 10) + '" class="lbl">CM = ' + riserText + ' | G = ' + treadText + '</text>';
    
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
        isMetric
    } = params;
    
    const resultDiv = document.getElementById('calculatorResult');
    const contentDiv = document.getElementById('calculatorResultContent');
    
    if (!solutions || solutions.length === 0) {
        // Utiliser les vraies limites CNB selon le type de bâtiment
        const limits = getCNBLimits(buildingTypeValue, stairTypeValue);
        const minRisers = Math.ceil(totalRiseValue / limits.maxRiser);
        const minTreads = minRisers - 1;
        
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
        
        let html = '<h3>Aucune solution conforme trouvée</h3>';
        html += '<div class="warning">';
        html += '<p><strong>Raison :</strong></p>';
        html += '<ul>';
        
        if (isMetric) {
            html += `<li>Giron calculé : ${calculatedTread.toFixed(0)} mm < minimum requis ${limits.minTread} mm (${codeRef})</li>`;
        } else {
            html += `<li>Giron calculé : ${metricToImperial(calculatedTread)} < minimum requis ${metricToImperial(limits.minTread)} (${codeRef})</li>`;
        }
        
        html += '</ul>';
        html += '<p><strong>Suggestions :</strong></p>';
        html += '<ul>';
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            // Suggestions spécifiques pour escalier en L avec palier
            const minLengthWithLanding = minLength + (stairWidthValue * 2);
            if (isMetric) {
                html += `<li>Longueur totale minimale requise ââ€°Ë† ${minLengthWithLanding.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm + 2× palier)</li>`;
            } else {
                html += `<li>Longueur totale minimale requise ââ€°Ë† ${metricToImperial(minLengthWithLanding)} (${minTreads} girons × ${metricToImperial(limits.minTread)} + 2× palier)</li>`;
            }
            html += '<li>Augmentez la longueur des volées</li>';
            html += '<li>Réduisez la largeur de l\'escalier (= profondeur du palier)</li>';
        } else if (stairConfigValue === 'l_shaped' && (lShapedConfigValue === 'two_45deg' || lShapedConfigValue === 'three_30deg')) {
            // Suggestions pour escalier en L avec marches rayonnantes
            if (isMetric) {
                html += `<li>Longueur totale minimale requise â‰ˆ ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
            } else {
                html += `<li>Longueur totale minimale requise â‰ˆ ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
            }
            html += '<li>Augmentez la longueur des deux volées perpendiculaires</li>';
            html += '<li>Les marches rayonnantes se situent à l\'intersection des deux volées</li>';
        } else {
            if (isMetric) {
                html += `<li>Longueur minimale requise ââ€°Ë† ${minLength.toFixed(0)} mm (${minTreads} girons × ${limits.minTread} mm)</li>`;
            } else {
                html += `<li>Longueur minimale requise ââ€°Ë† ${metricToImperial(minLength)} (${minTreads} girons × ${metricToImperial(limits.minTread)})</li>`;
            }
            html += '<li>Essayez une configuration avec palier (escalier en L ou U)</li>';
            html += '<li>Augmentez la longueur disponible</li>';
        }
        
        html += '<li>Vérifiez le type d\'escalier (Privé vs Commun)</li>';
        html += '</ul></div>';
        
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
    
    let html = '';
    
    // Titre et statut
    const isCompliant = best.stepRule.isValid && isWidthOk;
    html += `<h3>${isCompliant ? '✓' : 'âš '} Solution optimale (${codeRef})</h3>`;
    
    // Avertissement largeur
    if (!isWidthOk) {
        html += `<div class="warning"><p>âš  Largeur ${formatValue(stairWidthValue, isMetric, 0)} inférieure au minimum requis (${formatValue(limits.minWidth, isMetric, 0)})</p></div>`;
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
    }
    
    html += `<li><strong>Largeur :</strong> ${formatValue(stairWidthValue, isMetric, 0)} ${isWidthOk ? '✓' : 'âš  '}</li>`;
    html += '</ul></div>';
    
    // Vérification mathématique
    html += '<div class="step-formula">';
    html += '<strong>Vérification mathématique :</strong><br>';
    
    if (isMetric) {
        const totalRiseCalc = best.riserHeight * best.numRisers;
        const riseError = Math.abs(totalRiseCalc - totalRiseValue);
        html += `${best.numRisers} × ${best.riserHeight.toFixed(4)} mm = ${totalRiseCalc.toFixed(4)} mm `;
        html += riseError < 0.01 ? '✓ Exact' : `âš  Écart ${riseError.toFixed(4)} mm`;
        
        if (best.useLandingConfiguration) {
            html += '<br>';
            const totalTreadCalc = best.treadDepth * best.numTreads;
            const availableCalc = best.availableForTreads;
            const treadError = Math.abs(totalTreadCalc - availableCalc);
            html += `${best.numTreads} × ${best.treadDepth.toFixed(4)} mm = ${totalTreadCalc.toFixed(4)} mm `;
            html += treadError < 0.01 ? '✓ Exact' : `âš  Écart ${treadError.toFixed(4)} mm`;
        }
    } else {
        const riserIn = best.riserHeight / 25.4;
        const totalRiseIn = (best.riserHeight * best.numRisers) / 25.4;
        html += `${best.numRisers} × ${riserIn.toFixed(6)}" = ${totalRiseIn.toFixed(6)}" ✓`;
    }
    
    html += '</div>';
    
    // Règle du pas
    html += '<div class="result-section">';
    html += `<h4>${best.stepRule.isValid ? '✓' : 'âš  '} Règle du pas (${best.stepRule.validCount} sur 3)</h4>`;
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
        html += '<li>Les marches rayonnantes se situent à l\'intersection des deux volées perpendiculaires</li>';
        html += '<li>Côté long 1ère direction : ' + formatValuePrecise(best.firstFlightRun, isMetric) + '</li>';
        if (best.firstFlightRectTreads !== undefined) {
            html += '<li>Girons rectangulaires : ' + best.numRectTreads + ' total</li>';
            html += '<li>  â†’ 1ère direction : ' + best.firstFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
            const calc1 = best.firstFlightRectTreads * best.treadDepth;
            html += '<li>    Longueur tracée = ' + formatValuePrecise(calc1, isMetric) + ' (girons seuls)</li>';
            html += '<li>  â†’ 2ème direction : ' + best.secondFlightRectTreads + ' girons × ' + formatValuePrecise(best.treadDepth, isMetric) + '</li>';
            const calc2 = best.secondFlightRectTreads * best.treadDepth;
            html += '<li>    Longueur tracée = ' + formatValuePrecise(calc2, isMetric) + ' (girons seuls)</li>';
        } else {
            html += '<li>Girons rectangulaires : ' + best.numRectTreads + ' total</li>';
        }
        html += '<li>Côté long 2ème direction : ' + formatValuePrecise(best.secondFlightRun, isMetric) + '</li>';
        html += '<li>Giron mesuré à 500 mm de la rive étroite (CNB)</li>';
        html += '</ul></div>';
    }
    
    // Visualisation graphique pour volée droite uniquement
    if (!best.numRadiatingSteps && !best.useLandingConfiguration && !best.isSpiral) {
        html += '<div class="result-section">';
        html += '<h4>Visualisation graphique</h4>';
        html += generateStraightStairVisualization({
            numRisers: best.numRisers,
            numTreads: best.numTreads,
            riserHeight: best.riserHeight,
            treadDepth: best.treadDepth,
            totalRise: params.totalRise,
            totalRun: best.totalRunCalc || (best.treadDepth * best.numTreads),
            isMetric: isMetric
        });
        html += '</div>';
    }
    
    if (best.isSpiral) {
        html += '<div class="result-section">';
        html += '<h4>Notes - Escalier hélicoïdal</h4>';
        html += '<ul>';
        html += '<li>Giron mesuré à 300 mm de l\'axe de la main courante</li>';
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
        html += `<h3>âš  Non conforme au ${codeReference}</h3>`;
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
    html += `<h4>${stepRule.isValid ? '✓' : 'âš  '} Règle du pas (${stepRule.validCount} sur 3)</h4>`;
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
    
    // ===== Mise à jour des placeholders et visibilité selon le système de mesure =====
    
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
        // (les marches rayonnantes se situent à l'intersection des deux volées)
        calcStandardRunContainer.style.display = 'none';
        calcLandingDimensions.style.display = 'block';
    }
    
    calcStairConfig.addEventListener('change', updateCalcConfigOptions);
    calcLShapedConfig.addEventListener('change', updateCalcLShapedSubOptions);
    
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
            
            // Nettoyer/normaliser seulement à la perte de focus
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
        
        // Récupérer les valeurs selon le système de mesure
        let totalRiseValue, totalRunValue, stairWidthValue, idealRiserValue, idealTreadValue;
        let firstFlightRunValue = 0, secondFlightRunValue = 0;
        
        if (isMetric) {
            totalRiseValue = parseFloat(totalRise.value);
            stairWidthValue = parseFloat(stairDesiredWidth.value);
            idealRiserValue = parseFloat(idealRiser.value) || 0;
            idealTreadValue = parseFloat(idealTread.value) || 0;
            
            // Pour TOUS les escaliers en L (palier standard ET marches rayonnantes)
            if (stairConfigValue === 'l_shaped') {
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
            
            // Pour TOUS les escaliers en L (palier standard ET marches rayonnantes)
            if (stairConfigValue === 'l_shaped') {
                firstFlightRunValue = imperialToMetric(validateImperialInput(firstFlightRunImperial.value));
                secondFlightRunValue = imperialToMetric(validateImperialInput(secondFlightRunImperial.value));
                totalRunValue = firstFlightRunValue + secondFlightRunValue;
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
        
        // Priorité de conception
        const priorityRadio = document.querySelector('input[name="calcPriority"]:checked');
        const priority = priorityRadio ? priorityRadio.value : 'comfort';
        
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
        
        // Stocker les paramètres pour reformatage
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
        if (treadValue > limits.maxTread) {
            issues.push(`Giron ${treadValue.toFixed(0)} mm > maximum ${limits.maxTread} mm`);
            isCompliant = false;
        }
        
        // Largeur
        if (widthValue < limits.minWidth) {
            issues.push(`Largeur ${widthValue.toFixed(0)} mm < minimum ${limits.minWidth} mm`);
            isCompliant = false;
        }
        
        // Échappée
        if (headroomValue < limits.minHeadroom) {
            issues.push(`Échappée ${headroomValue.toFixed(0)} mm < minimum ${limits.minHeadroom} mm`);
            isCompliant = false;
        }
        
        // Vérifications spécifiques à la configuration
        if (stairConfigValue === 'dancing_steps' && narrowSideValue > 0) {
            if (narrowSideValue < limits.minNarrowSide) {
                issues.push(`Giron côté étroit ${narrowSideValue.toFixed(0)} mm < minimum ${limits.minNarrowSide} mm à 300 mm de l'axe`);
                isCompliant = false;
            }
        }
        
        if (stairConfigValue === 'spiral') {
            if (spiralWidthValue > 0 && spiralWidthValue < CNB_LIMITS.spiral.minWidth) {
                issues.push(`Largeur libre ${spiralWidthValue.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minWidth} mm`);
                isCompliant = false;
            }
            if (spiralTreadAt300Value > 0 && spiralTreadAt300Value < CNB_LIMITS.spiral.minTreadAt300) {
                issues.push(`Giron à 300 mm ${spiralTreadAt300Value.toFixed(0)} mm < minimum ${CNB_LIMITS.spiral.minTreadAt300} mm`);
                isCompliant = false;
            }
            if (stairUseValue === 'exit') {
                issues.push('Escalier hélicoïdal interdit comme issue (CNB 9.8.4.7)');
                isCompliant = false;
            }
        }
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            if (landingDepthValue > 0 && landingDepthValue < limits.minTread) {
                issues.push(`Profondeur palier ${landingDepthValue.toFixed(0)} mm < minimum ${limits.minTread} mm`);
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
});
