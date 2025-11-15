// ==================== CALCULATEUR D'ESCALIER CNB 2025 ====================
// Version corrigée - Calculs précis et affichage correct

// ==================== FONCTIONS DE CONVERSION ====================

function validateImperialInput(inputValue) {
    if (!inputValue) return '';
    inputValue = inputValue.replace(/[''′]/g, "'");
    inputValue = inputValue.replace(/\s*(['-/"])\s*/g, '$1');
    inputValue = inputValue.replace(/'-/g, "'");
    inputValue = inputValue.replace(/(\d)(\d+\/\d+)/g, '$1 $2');
    return inputValue;
}

function metricToImperial(mmValue) {
    if (!mmValue) return '';
    
    const inches = mmValue / 25.4;
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    const fraction = Math.round(remainingInches * 16) / 16;
    const wholePart = Math.floor(fraction);
    const fractionalPart = fraction - wholePart;
    
    let result = '';
    
    if (feet > 0) {
        result += feet + '\'';
    }
    
    if (wholePart > 0 || fractionalPart > 0.001 || (wholePart === 0 && feet === 0)) {
        if (feet > 0) result += ' ';
        
        if (wholePart > 0 || (fractionalPart < 0.001 && (wholePart > 0 || feet === 0))) {
            result += wholePart;
        }
        
        if (fractionalPart > 0.001) {
            const numerator = Math.round(fractionalPart * 16);
            const denominator = 16;
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(numerator, denominator);
            const simplifiedNumerator = numerator / divisor;
            const simplifiedDenominator = denominator / divisor;
            
            if (wholePart > 0) result += ' ';
            result += simplifiedNumerator + '/' + simplifiedDenominator;
        }
        
        result += '"';
    } else if (feet === 0 && wholePart === 0) {
        result = '0"';
    }
    
    return result;
}

function metricToImperialPrecise(mmValue) {
    if (!mmValue) return '';
    
    const inches = mmValue / 25.4;
    const wholePart = Math.floor(inches);
    const fractionalPart = inches - wholePart;
    
    // Convertir en 64èmes
    const fraction64 = Math.round(fractionalPart * 64);
    
    if (fraction64 === 0) {
        return `${wholePart}" (${inches.toFixed(6)}")`;
    }
    
    // Simplifier la fraction
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(fraction64, 64);
    const numerator = fraction64 / divisor;
    const denominator = 64 / divisor;
    
    return `${wholePart} ${numerator}/${denominator}" (${inches.toFixed(6)}")`;
}

function imperialToMetric(imperialValue) {
    if (!imperialValue) return null;
    
    imperialValue = imperialValue.trim();
    
    // Format: X' Y Z/W"
    let match = imperialValue.match(/^(\d+(?:\.\d+)?)'?\s*(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)(?:"|in|inch|inches)?$/);
    if (match) {
        const feet = parseFloat(match[1]) || 0;
        const inches = parseFloat(match[2]);
        const numerator = parseFloat(match[3]);
        const denominator = parseFloat(match[4]);
        return (feet * 12 + inches + (numerator / denominator)) * 25.4;
    }
    
    // Format: X' Y"
    match = imperialValue.match(/^(\d+(?:\.\d+)?)'?\s*(\d+(?:\.\d+)?)(?:"|in|inch|inches)?$/);
    if (match) {
        const feet = parseFloat(match[1]) || 0;
        const inches = parseFloat(match[2]) || 0;
        return (feet * 12 + inches) * 25.4;
    }
    
    // Format: X'
    match = imperialValue.match(/^(\d+(?:\.\d+)?)'?(?:ft|feet)?$/);
    if (match) {
        return parseFloat(match[1]) * 12 * 25.4;
    }
    
    // Format: Y Z/W"
    match = imperialValue.match(/^(\d+(?:\.\d+)?)\s+(\d+)\/(\d+)(?:"|in|inch|inches)?$/);
    if (match) {
        const inches = parseFloat(match[1]);
        const numerator = parseFloat(match[2]);
        const denominator = parseFloat(match[3]);
        return (inches + (numerator / denominator)) * 25.4;
    }
    
    // Format: Z/W"
    match = imperialValue.match(/^(\d+)\/(\d+)(?:"|in|inch|inches)?$/);
    if (match) {
        const numerator = parseFloat(match[1]);
        const denominator = parseFloat(match[2]);
        return (numerator / denominator) * 25.4;
    }
    
    // Format: Y"
    match = imperialValue.match(/^(\d+(?:\.\d+)?)(?:"|in|inch|inches)?$/);
    if (match) {
        return parseFloat(match[1]) * 25.4;
    }
    
    // Format: X' Z/W
    match = imperialValue.match(/^(\d+(?:\.\d+)?)'?\s*(\d+)\/(\d+)(?:"|in|inch|inches)?$/);
    if (match) {
        const feet = parseFloat(match[1]) || 0;
        const numerator = parseFloat(match[2]);
        const denominator = parseFloat(match[3]);
        return (feet * 12 + (numerator / denominator)) * 25.4;
    }
    
    return null;
}

// ==================== RÈGLE DU PAS ====================

function checkStepRule(riser, tread) {
    const riserInches = riser / 25.4;
    const treadInches = tread / 25.4;
    
    const rule1 = treadInches + riserInches;
    const isRule1Valid = rule1 >= 17 && rule1 <= 18;
    
    const rule2 = treadInches * riserInches;
    const isRule2Valid = rule2 >= 71 && rule2 <= 74;
    
    const rule3 = treadInches + (2 * riserInches);
    const isRule3Valid = rule3 >= 22 && rule3 <= 25;
    
    const validRules = [isRule1Valid, isRule2Valid, isRule3Valid].filter(Boolean).length;
    
    return {
        isValid: validRules >= 2,
        rule1: { value: rule1, isValid: isRule1Valid, min: 17, max: 18 },
        rule2: { value: rule2, isValid: isRule2Valid, min: 71, max: 74 },
        rule3: { value: rule3, isValid: isRule3Valid, min: 22, max: 25 },
        validRuleCount: validRules
    };
}

// ==================== CALCUL OPTIMAL ====================

function calculateOptimalStair(totalRise, totalRun, preferences) {
    const {
        buildingType,
        stairType,
        stairConfig,
        lShapedConfig,
        idealRiser,
        idealTread,
        priority,
        landingDepth,
        firstFlightRun,
        secondFlightRun
    } = preferences;
    
    // Définir les limites CNB 2025
    let minRiser, maxRiser, minTread, maxTread;
    
    if (buildingType === 'part3') {
        minRiser = 125;
        maxRiser = 180;
        minTread = 280;
        maxTread = 355;
    } else {
        if (stairType === 'private') {
            minRiser = 125;
            maxRiser = 200;
            minTread = 235;
            maxTread = 355;
        } else {
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = 355;
        }
    }
    
    const optimalStep = priority === 'comfort' ? 17.5 : 18;
    
    let numRadiatingSteps = 0;
    let actualLandingLength = 0;
    let useLandingConfiguration = false;
    let actualFirstFlightRun = totalRun;
    let actualSecondFlightRun = 0;
    
    // Configuration escalier en L avec palier
    if (stairConfig === 'l_shaped' && lShapedConfig === 'standard_landing') {
        useLandingConfiguration = true;
        actualLandingLength = landingDepth || minTread;
        actualFirstFlightRun = firstFlightRun || totalRun / 2;
        actualSecondFlightRun = secondFlightRun || totalRun / 2;
        
        // La longueur totale pour les girons = firstFlightRun + secondFlightRun - profondeur palier - largeur palier
        // Le palier compte comme un giron avec profondeur = landingDepth
        totalRun = actualFirstFlightRun + actualSecondFlightRun;
    } else if (stairConfig === 'l_shaped') {
        if (lShapedConfig === 'two_45deg') {
            numRadiatingSteps = 2;
        } else if (lShapedConfig === 'three_30deg') {
            numRadiatingSteps = 3;
        }
    }
    
    const availableForTreads = useLandingConfiguration ? 
        (actualFirstFlightRun + actualSecondFlightRun - actualLandingLength * 2) : 
        (totalRun - actualLandingLength);
    
    const minNumRisers = Math.ceil(totalRise / maxRiser);
    const maxNumRisers = Math.floor(totalRise / minRiser);
    
    const solutions = [];
    
    for (let numRisers = minNumRisers; numRisers <= maxNumRisers + 5; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < minRiser || riserHeight > maxRiser) continue;
        
        const numTreads = numRisers - 1;
        let numRectangularTreads = numTreads - numRadiatingSteps;
        
        if (numRectangularTreads < 0) continue;
        
        let treadDepth;
        if (numRadiatingSteps > 0) {
            const totalTreadFactor = numRectangularTreads + (numRadiatingSteps * 0.7);
            treadDepth = availableForTreads / totalTreadFactor;
        } else {
            treadDepth = availableForTreads / numRectangularTreads;
        }
        
        if (treadDepth < minTread || treadDepth > maxTread) continue;
        
        const stepRule = checkStepRule(riserHeight, treadDepth);
        const stepValue = (treadDepth / 25.4) + (riserHeight / 25.4);
        
        const riserDeviation = idealRiser > 0 ? 
            Math.abs(riserHeight - idealRiser) : 0;
        const treadDeviation = idealTread > 0 ? 
            Math.abs(treadDepth - idealTread) : 0;
        const stepDeviation = Math.abs(stepValue - optimalStep);
        
        let score;
        if (priority === 'comfort') {
            score = stepDeviation * 2 + riserDeviation + treadDeviation;
            if (stepRule.isValid) score *= 0.8;
        } else {
            score = riserDeviation + treadDeviation * 2;
        }
        
        // Calculer longueur totale réelle
        let actualTotalRun = treadDepth * numRectangularTreads;
        if (numRadiatingSteps > 0) {
            actualTotalRun += treadDepth * numRadiatingSteps * 0.7;
        }
        
        if (useLandingConfiguration) {
            // Pour escalier en L avec palier: longueur = girons + 2 × profondeur palier
            actualTotalRun += actualLandingLength * 2;
        } else {
            actualTotalRun += actualLandingLength;
        }
        
        solutions.push({
            numRisers,
            numTreads,
            numRectangularTreads,
            numRadiatingSteps,
            riserHeight,
            treadDepth,
            stepValue,
            stepRule,
            score,
            riserDeviation,
            treadDeviation,
            stepDeviation,
            actualTotalRun,
            actualLandingLength,
            useLandingConfiguration,
            firstFlightRun: actualFirstFlightRun,
            secondFlightRun: actualSecondFlightRun
        });
    }
    
    solutions.sort((a, b) => a.score - b.score);
    return solutions.slice(0, 3);
}

// ==================== VARIABLES GLOBALES POUR RECALCUL ====================

let lastCalculatorParams = null;
let lastVerificationParams = null;

// ==================== FONCTION D'AFFICHAGE DES RÉSULTATS CALCULATEUR ====================

function displayCalculatorResults(solutions, params) {
    const {
        totalRiseValue,
        totalRunValue,
        stairWidthValue,
        buildingTypeValue,
        stairTypeValue,
        stairConfigValue,
        lShapedConfigValue,
        isMetric
    } = params;
    
    const calculatorResult = document.getElementById('calculatorResult');
    const calculatorResultContent = document.getElementById('calculatorResultContent');
    
    if (!solutions || solutions.length === 0) {
        const avgRiser = totalRiseValue / (totalRunValue / 280);
        const minLength = Math.ceil((totalRiseValue/175)*280/100)*100;
        
        let diagnostic = '<p>⚠ Aucune solution conforme trouvée.</p>';
        diagnostic += '<div class="warning"><p><strong>Suggestions :</strong></p><ul>';
        
        if (isMetric) {
            diagnostic += `<li>Pour ${(totalRiseValue/1000).toFixed(2)} m de hauteur, longueur min ≈ ${minLength} mm</li>`;
        } else {
            diagnostic += `<li>Pour ${metricToImperial(totalRiseValue)} de hauteur, longueur min ≈ ${metricToImperial(minLength)}</li>`;
        }
        
        diagnostic += '<li>Essayez un escalier avec palier</li>';
        diagnostic += '<li>Vérifiez le type (Privé vs Commun)</li>';
        diagnostic += '</ul></div>';
        
        calculatorResultContent.innerHTML = diagnostic;
        calculatorResult.style.display = 'block';
        return;
    }
    
    const bestSolution = solutions[0];
    const codeReference = buildingTypeValue === 'part3' ? 'CNB 2020 Partie 3' : 'CNB 2020 Partie 9';
    
    // Vérifier largeur
    let minWidth = 900;
    if (buildingTypeValue === 'part3') {
        minWidth = 1100;
    } else if (stairTypeValue === 'private') {
        minWidth = 860;
    }
    
    const isWidthCompliant = stairWidthValue >= minWidth;
    let widthWarning = '';
    if (!isWidthCompliant) {
        widthWarning = `<div class="warning"><p>⚠ Largeur ${stairWidthValue.toFixed(0)} mm < minimum ${minWidth} mm</p></div>`;
    }
    
    // Formatage résultats avec précision maximale
    const formatRiserHeight = isMetric ? `${bestSolution.riserHeight.toFixed(2)} mm` : metricToImperial(bestSolution.riserHeight);
    const formatTreadDepth = isMetric ? `${bestSolution.treadDepth.toFixed(2)} mm` : metricToImperial(bestSolution.treadDepth);
    const formatRiserExact = isMetric ? `${bestSolution.riserHeight.toFixed(2)} mm` : metricToImperialPrecise(bestSolution.riserHeight);
    const formatTreadExact = isMetric ? `${bestSolution.treadDepth.toFixed(2)} mm` : metricToImperialPrecise(bestSolution.treadDepth);
    
    // VÉRIFICATIONS MATHÉMATIQUES EXACTES
    const totalRiseCalculation = bestSolution.riserHeight * bestSolution.numRisers;
    const riseError = Math.abs(totalRiseCalculation - totalRiseValue);
    
    // Pour la longueur, calculer selon la configuration
    let totalTreadRunCalculation, availableForTreads, runError;
    
    if (bestSolution.useLandingConfiguration) {
        // Escalier en L avec palier
        totalTreadRunCalculation = bestSolution.treadDepth * bestSolution.numTreads;
        availableForTreads = bestSolution.firstFlightRun + bestSolution.secondFlightRun - bestSolution.actualLandingLength * 2;
        runError = Math.abs(totalTreadRunCalculation - availableForTreads);
    } else {
        totalTreadRunCalculation = bestSolution.treadDepth * bestSolution.numTreads;
        availableForTreads = totalRunValue - bestSolution.actualLandingLength;
        runError = Math.abs(totalTreadRunCalculation - availableForTreads);
    }
    
    const formatTotalRise = isMetric ? `${totalRiseCalculation.toFixed(2)} mm` : metricToImperial(totalRiseCalculation);
    const formatTreadRun = isMetric ? `${totalTreadRunCalculation.toFixed(2)} mm` : metricToImperial(totalTreadRunCalculation);
    const formatTotalRunWithLanding = isMetric ? 
        `${(totalTreadRunCalculation + bestSolution.actualLandingLength).toFixed(2)} mm` : 
        metricToImperial(totalTreadRunCalculation + bestSolution.actualLandingLength);
    const formatStairWidth = isMetric ? `${stairWidthValue.toFixed(0)} mm` : metricToImperial(stairWidthValue);
    
    let riserVerification = '';
    if (isMetric) {
        riserVerification = `
            <div class="step-formula">
                Vérification: ${bestSolution.numRisers} contremarches × ${bestSolution.riserHeight.toFixed(2)} mm = ${totalRiseCalculation.toFixed(2)} mm
                ${riseError < 0.1 ? '✓ Exact' : `⚠ Écart ${riseError.toFixed(2)} mm`}
            </div>`;
    } else {
        const riserInches = bestSolution.riserHeight / 25.4;
        const totalRiseInches = totalRiseCalculation / 25.4;
        riserVerification = `
            <div class="step-formula">
                Vérification: ${bestSolution.numRisers} contremarches × ${riserInches.toFixed(4)}" = ${totalRiseInches.toFixed(4)}"
                ${riseError < 2.5 ? '✓ Exact' : `⚠ Écart ${(riseError/25.4).toFixed(4)}"`}
            </div>`;
    }
    
    let treadVerification = '';
    if (bestSolution.useLandingConfiguration) {
        // Vérification pour escalier en L avec palier
        const formatLandingDepth = isMetric ? `${bestSolution.actualLandingLength.toFixed(2)} mm` : metricToImperial(bestSolution.actualLandingLength);
        const formatFirstFlight = isMetric ? `${bestSolution.firstFlightRun.toFixed(2)} mm` : metricToImperial(bestSolution.firstFlightRun);
        const formatSecondFlight = isMetric ? `${bestSolution.secondFlightRun.toFixed(2)} mm` : metricToImperial(bestSolution.secondFlightRun);
        
        if (isMetric) {
            treadVerification = `
                <div class="step-formula">
                    Configuration en L avec palier:
                    <br>1ère volée: ${formatFirstFlight}
                    <br>2ème volée: ${formatSecondFlight}
                    <br>Profondeur palier: ${formatLandingDepth}
                    <br>Largeur palier: ${formatLandingDepth}
                    <br>Total girons: ${bestSolution.numTreads} × ${bestSolution.treadDepth.toFixed(4)} mm = ${totalTreadRunCalculation.toFixed(4)} mm
                    <br>Espace disponible: ${availableForTreads.toFixed(4)} mm
                    ${runError < 0.01 ? '✓ Exact' : `⚠ Écart ${runError.toFixed(4)} mm`}
                </div>`;
        } else {
            const treadInches = bestSolution.treadDepth / 25.4;
            const totalRunInches = totalTreadRunCalculation / 25.4;
            const targetRunInches = availableForTreads / 25.4;
            treadVerification = `
                <div class="step-formula">
                    Configuration en L avec palier:
                    <br>1ère volée: ${formatFirstFlight}
                    <br>2ème volée: ${formatSecondFlight}
                    <br>Profondeur palier: ${formatLandingDepth}
                    <br>Total girons: ${bestSolution.numTreads} × ${treadInches.toFixed(6)}" = ${totalRunInches.toFixed(6)}"
                    <br>Cible: ${targetRunInches.toFixed(6)}"
                    ${runError < 0.254 ? '✓ Exact' : `⚠ Écart ${(runError/25.4).toFixed(6)}"`}
                </div>`;
        }
    } else {
        if (isMetric) {
            treadVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numTreads} girons × ${bestSolution.treadDepth.toFixed(4)} mm = ${totalTreadRunCalculation.toFixed(4)} mm
                    ${runError < 0.01 ? '✓ Exact' : `⚠ Écart ${runError.toFixed(4)} mm`}
                </div>`;
        } else {
            const treadInches = bestSolution.treadDepth / 25.4;
            const totalRunInches = totalTreadRunCalculation / 25.4;
            const targetRunInches = availableForTreads / 25.4;
            treadVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numTreads} girons × ${treadInches.toFixed(6)}" = ${totalRunInches.toFixed(6)}"
                    ${runError < 0.254 ? '✓ Exact' : `⚠ Écart ${(runError/25.4).toFixed(6)}"`}
                    <br>Cible: ${targetRunInches.toFixed(6)}"
                </div>`;
        }
    }
    
    let stepRuleDetails = '';
    if (bestSolution.stepRule.isValid) {
        if (isMetric) {
            stepRuleDetails = `
            <div class="result-section">
                <p>✓ Règle du pas respectée (${bestSolution.stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${bestSolution.stepRule.rule1.value.toFixed(2)}" (432-457 mm)</li>
                    <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (458-477 cm²)</li>
                    <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${bestSolution.stepRule.rule3.value.toFixed(2)}" (559-635 mm)</li>
                </ul>
            </div>`;
        } else {
            stepRuleDetails = `
            <div class="result-section">
                <p>✓ Règle du pas respectée (${bestSolution.stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${bestSolution.stepRule.rule1.value.toFixed(2)}" (17"-18")</li>
                    <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (71-74 po²)</li>
                    <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${bestSolution.stepRule.rule3.value.toFixed(2)}" (22"-25")</li>
                </ul>
            </div>`;
        }
    } else {
        if (isMetric) {
            stepRuleDetails = `
            <div class="result-section">
                <p>⚠ Règle du pas non respectée (${bestSolution.stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${bestSolution.stepRule.rule1.value.toFixed(2)}" (432-457 mm)</li>
                    <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (458-477 cm²)</li>
                    <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${bestSolution.stepRule.rule3.value.toFixed(2)}" (559-635 mm)</li>
                </ul>
            </div>`;
        } else {
            stepRuleDetails = `
            <div class="result-section">
                <p>⚠ Règle du pas non respectée (${bestSolution.stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${bestSolution.stepRule.rule1.value.toFixed(2)}" (17"-18")</li>
                    <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (71-74 po²)</li>
                    <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${bestSolution.stepRule.rule3.value.toFixed(2)}" (22"-25")</li>
                </ul>
            </div>`;
        }
    }
    
    calculatorResultContent.innerHTML = `
        <div class="${bestSolution.stepRule.isValid && isWidthCompliant ? 'compliant' : 'non-compliant'}">
            <h3>✓ Solution optimale trouvée (${codeReference})</h3>
            ${widthWarning}
            <div class="result-section">
                <h3>Dimensions calculées</h3>
                <ul>
                    <li><strong>Contremarches:</strong> ${bestSolution.numRisers} × ${formatRiserExact}</li>
                    <li><strong>Girons:</strong> ${bestSolution.numTreads} × ${formatTreadExact}</li>
                    <li><strong>Largeur:</strong> ${formatStairWidth} ${isWidthCompliant ? '✓' : '⚠'}</li>
                </ul>
            </div>
            ${riserVerification}
            ${treadVerification}
            <div class="warning">
                <p><strong>Important traçage:</strong></p>
                <ul>
                    <li>Utilisez les ${isMetric ? 'valeurs exactes' : 'valeurs décimales entre parenthèses'} ci-dessus</li>
                    <li>${isMetric ? 'Tolérance' : 'Fractions au 1/64" = guides de construction'}</li>
                    <li>${bestSolution.numRisers} contremarches + ${bestSolution.numTreads} girons</li>
                    <li>Le dernier giron = plancher de l'étage (non compté)</li>
                    <li>Somme contremarches = hauteur totale exacte</li>
                    <li>Somme girons = longueur horizontale exacte</li>
                </ul>
            </div>
        </div>
        ${stepRuleDetails}`;
    
    let configNotes = '';
    if (stairConfigValue === 'spiral') {
        configNotes = `
            <div class="result-section">
                <h3>Notes escalier hélicoïdal</h3>
                <ul>
                    <li>Interdit comme issue (CNB 9.8.4.7)</li>
                    <li>Seul moyen évacuation: max 3 personnes</li>
                    <li>Largeur libre min: 660 mm</li>
                    <li>Giron min: 190 mm à 300 mm de l'axe côté étroit</li>
                </ul>
            </div>`;
    } else if (stairConfigValue === 'dancing_steps') {
        configNotes = `
            <div class="result-section">
                <h3>Notes marches dansantes</h3>
                <ul>
                    <li>Angle constant dans même volée</li>
                    <li>Giron min: ${isMetric ? '150 mm' : '6"'} à 300 mm de l'axe</li>
                    <li>Hauteur/giron uniformes à 300 mm de l'axe</li>
                    <li>Rotation même direction dans volée</li>
                </ul>
            </div>`;
    } else if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
        configNotes = `
            <div class="result-section">
                <h3>Notes escalier en L avec palier</h3>
                <ul>
                    <li>Le palier compte comme un giron surdimensionné</li>
                    <li>Profondeur du palier = largeur souhaitée</li>
                    <li>Cumul: girons volée 1 + palier + girons volée 2</li>
                    <li>Mesures prises sur le côté long de chaque volée</li>
                </ul>
            </div>`;
    }
    
    let solutionsTable = '';
    if (solutions.length > 1) {
        solutionsTable = `
            <div class="result-section">
                <h3>Alternatives</h3>
                <table class="result-table">
                    <thead>
                        <tr>
                            <th>Solution</th>
                            <th>CM</th>
                            <th>Hauteur CM</th>
                            <th>Girons</th>
                            <th>Profondeur</th>
                            <th>Règles</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        solutions.forEach((sol, index) => {
            const className = index === 0 ? 'optimal-solution' : '';
            const riserStr = isMetric ? `${sol.riserHeight.toFixed(1)} mm` : metricToImperial(sol.riserHeight);
            const treadStr = isMetric ? `${sol.treadDepth.toFixed(1)} mm` : metricToImperial(sol.treadDepth);
            
            solutionsTable += `
                <tr class="${className}">
                    <td>${index + 1}${index === 0 ? ' ⭐' : ''}</td>
                    <td>${sol.numRisers}</td>
                    <td>${riserStr}</td>
                    <td>${sol.numTreads}</td>
                    <td>${treadStr}</td>
                    <td>${sol.stepRule.validRuleCount}/3</td>
                </tr>`;
        });
        
        solutionsTable += `
                    </tbody>
                </table>
            </div>`;
    }
    
    calculatorResultContent.innerHTML += configNotes + solutionsTable;
    calculatorResult.style.display = 'block';
}

// ==================== FONCTION D'AFFICHAGE DES RÉSULTATS VÉRIFICATION ====================

function displayVerificationResults(params) {
    const {
        isCompliant,
        issues,
        stepRule,
        codeReference,
        isMetric
    } = params;
    
    const result = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    
    result.className = 'result';
    
    if (isCompliant) {
        result.classList.add('compliant');
        resultContent.innerHTML = `<p>✓ Conforme au ${codeReference}.</p>`;
        
        if (stepRule.isValid) {
            resultContent.innerHTML += `
            <div class="result-section">
                <p>✓ Règle du pas respectée (${stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${stepRule.rule1.value.toFixed(2)}"</li>
                    <li>${stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${stepRule.rule2.value.toFixed(2)} po²</li>
                    <li>${stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${stepRule.rule3.value.toFixed(2)}"</li>
                </ul>
            </div>`;
        } else if (!isMetric) {
            resultContent.innerHTML += `
            <div class="result-section">
                <p>⚠ Règle du pas non respectée (${stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${stepRule.rule1.value.toFixed(2)}" (17"-18")</li>
                    <li>${stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${stepRule.rule2.value.toFixed(2)} po² (71-74 po²)</li>
                    <li>${stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${stepRule.rule3.value.toFixed(2)}" (22"-25")</li>
                </ul>
            </div>`;
        } else {
            resultContent.innerHTML += `
            <div class="result-section">
                <p>✓ Règle du pas respectée (${stepRule.validRuleCount}/3):</p>
                <ul>
                    <li>${stepRule.rule1.isValid ? "✓" : "✗"} Règle 1: ${stepRule.rule1.value.toFixed(2)}"</li>
                    <li>${stepRule.rule2.isValid ? "✓" : "✗"} Règle 2: ${stepRule.rule2.value.toFixed(2)} po²</li>
                    <li>${stepRule.rule3.isValid ? "✓" : "✗"} Règle 3: ${stepRule.rule3.value.toFixed(2)}"</li>
                </ul>
            </div>`;
        }
    } else {
        result.classList.add('non-compliant');
        resultContent.innerHTML = `<p>⚠ Non conforme au ${codeReference}.</p><p>Problèmes:</p><ul>`;
        issues.forEach(issue => {
            resultContent.innerHTML += `<li>${issue}</li>`;
        });
        resultContent.innerHTML += '</ul>';
    }
    
    result.style.display = 'block';
}

// ==================== INITIALISATION ====================

document.addEventListener('DOMContentLoaded', function() {
    // Éléments formulaire vérification
    const measurementSystem = document.getElementById('measurementSystem');
    const buildingType = document.getElementById('buildingType');
    const buildingUse = document.getElementById('buildingUse');
    const stairType = document.getElementById('stairType');
    const stairUse = document.getElementById('stairUse');
    const stairConfig = document.getElementById('stairConfig');
    const lShapedOptions = document.getElementById('lShapedOptions');
    const lShapedConfig = document.getElementById('lShapedConfig');
    const dancingStepsOptions = document.getElementById('dancingStepsOptions');
    const dancingStepsConfig = document.getElementById('dancingStepsConfig');
    const spiralOptions = document.getElementById('spiralOptions');
    const spiralConfig = document.getElementById('spiralConfig');
    const riserHeight = document.getElementById('riserHeight');
    const riserHeightImperial = document.getElementById('riserHeightImperial');
    const treadDepth = document.getElementById('treadDepth');
    const treadDepthImperial = document.getElementById('treadDepthImperial');
    const narrowSide = document.getElementById('narrowSide');
    const narrowSideImperial = document.getElementById('narrowSideImperial');
    const stairWidth = document.getElementById('stairWidth');
    const stairWidthImperial = document.getElementById('stairWidthImperial');
    const headroom = document.getElementById('headroom');
    const headroomImperial = document.getElementById('headroomImperial');
    const spiralWidth = document.getElementById('spiralWidth');
    const spiralWidthImperial = document.getElementById('spiralWidthImperial');
    const checkButton = document.getElementById('checkCompliance');
    const result = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    const verifyLandingDimensions = document.getElementById('verifyLandingDimensions');
    const verifyLandingDepth = document.getElementById('verifyLandingDepth');
    const landingDepth = document.getElementById('landingDepth');
    const landingDepthImperial = document.getElementById('landingDepthImperial');

    // Éléments calculateur
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const calcMeasurementSystem = document.getElementById('calcMeasurementSystem');
    const calcBuildingType = document.getElementById('calcBuildingType');
    const calcStairType = document.getElementById('calcStairType');
    const calcStairConfig = document.getElementById('calcStairConfig');
    const calcLShapedOptions = document.getElementById('calcLShapedOptions');
    const calcLShapedConfig = document.getElementById('calcLShapedConfig');
    const calcDancingStepsOptions = document.getElementById('calcDancingStepsOptions');
    const calcDancingStepsConfig = document.getElementById('calcDancingStepsConfig');
    const calcSpiralOptions = document.getElementById('calcSpiralOptions');
    const calcSpiralConfig = document.getElementById('calcSpiralConfig');
    const calcMinNarrowSide = document.getElementById('calcMinNarrowSide');
    const calcMinNarrowSideImperial = document.getElementById('calcMinNarrowSideImperial');
    const calcSpiralWidth = document.getElementById('calcSpiralWidth');
    const calcSpiralWidthImperial = document.getElementById('calcSpiralWidthImperial');
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
    const calculateButton = document.getElementById('calculateStair');
    const calculatorResult = document.getElementById('calculatorResult');
    const calcLandingDimensions = document.getElementById('calcLandingDimensions');
    const firstFlightRun = document.getElementById('firstFlightRun');
    const firstFlightRunImperial = document.getElementById('firstFlightRunImperial');
    const secondFlightRun = document.getElementById('secondFlightRun');
    const secondFlightRunImperial = document.getElementById('secondFlightRunImperial');
    
    // Fonction pour basculer entre les onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
        });
    });
    
    // Fonction pour mettre à jour les placeholders selon le système
    function updatePlaceholders(section) {
        const system = section === 'verification' ? measurementSystem.value : calcMeasurementSystem.value;
        const isMetric = system === 'metric';
        
        if (section === 'verification') {
            document.querySelectorAll('#verification .metric-input').forEach(el => {
                el.style.display = isMetric ? 'block' : 'none';
            });
            document.querySelectorAll('#verification .imperial-input').forEach(el => {
                el.style.display = isMetric ? 'none' : 'block';
            });
        } else {
            document.querySelectorAll('#calculator .metric-input').forEach(el => {
                el.style.display = isMetric ? 'block' : 'none';
            });
            document.querySelectorAll('#calculator .imperial-input').forEach(el => {
                el.style.display = isMetric ? 'none' : 'block';
            });
        }
    }
    
    measurementSystem.addEventListener('change', function() {
        updatePlaceholders('verification');
        if (lastVerificationParams) {
            displayVerificationResults(lastVerificationParams);
        }
    });
    
    calcMeasurementSystem.addEventListener('change', function() {
        updatePlaceholders('calculator');
        if (lastCalculatorParams) {
            performCalculation();
        }
    });
    
    // Gestion configurations escalier - vérification
    stairConfig.addEventListener('change', function() {
        lShapedOptions.style.display = 'none';
        dancingStepsOptions.style.display = 'none';
        spiralOptions.style.display = 'none';
        verifyLandingDimensions.style.display = 'none';
        verifyLandingDepth.style.display = 'none';
        
        if (this.value === 'l_shaped') {
            lShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps') {
            dancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            spiralOptions.style.display = 'block';
        }
    });
    
    // Gestion sous-options L-shaped - vérification
    if (lShapedConfig) {
        lShapedConfig.addEventListener('change', function() {
            verifyLandingDimensions.style.display = 'none';
            verifyLandingDepth.style.display = 'none';
            
            if (this.value === 'standard_landing') {
                verifyLandingDimensions.style.display = 'block';
                verifyLandingDepth.style.display = 'block';
            }
        });
    }
    
    // Gestion configurations escalier - calculateur
    calcStairConfig.addEventListener('change', function() {
        calcLShapedOptions.style.display = 'none';
        calcDancingStepsOptions.style.display = 'none';
        calcSpiralOptions.style.display = 'none';
        calcLandingDimensions.style.display = 'none';
        
        if (this.value === 'l_shaped') {
            calcLShapedOptions.style.display = 'block';
            // Déclencher automatiquement le changement pour afficher les bons champs
            if (calcLShapedConfig) {
                calcLShapedConfig.dispatchEvent(new Event('change'));
            }
        } else if (this.value === 'dancing_steps') {
            calcDancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            calcSpiralOptions.style.display = 'block';
        }
    });
    
    // Gestion sous-options L-shaped - calculateur
    if (calcLShapedConfig) {
        calcLShapedConfig.addEventListener('change', function() {
            calcLandingDimensions.style.display = 'none';
            
            if (this.value === 'standard_landing') {
                calcLandingDimensions.style.display = 'block';
            }
        });
    }
    
    // Conversion métrique/impérial
    const metricInputPairs = [
        { metric: totalRun, imperial: totalRunImperial },
        { metric: totalRise, imperial: totalRiseImperial },
        { metric: stairDesiredWidth, imperial: stairDesiredWidthImperial },
        { metric: idealRiser, imperial: idealRiserImperial },
        { metric: idealTread, imperial: idealTreadImperial },
        { metric: stairWidth, imperial: stairWidthImperial },
        { metric: headroom, imperial: headroomImperial },
        { metric: riserHeight, imperial: riserHeightImperial },
        { metric: treadDepth, imperial: treadDepthImperial },
        { metric: firstFlightRun, imperial: firstFlightRunImperial },
        { metric: secondFlightRun, imperial: secondFlightRunImperial },
        { metric: landingDepth, imperial: landingDepthImperial }
    ];
    
    if (narrowSide && narrowSideImperial) {
        metricInputPairs.push({ metric: narrowSide, imperial: narrowSideImperial });
    }
    if (calcMinNarrowSide && calcMinNarrowSideImperial) {
        metricInputPairs.push({ metric: calcMinNarrowSide, imperial: calcMinNarrowSideImperial });
    }
    if (spiralWidth && spiralWidthImperial) {
        metricInputPairs.push({ metric: spiralWidth, imperial: spiralWidthImperial });
    }
    if (calcSpiralWidth && calcSpiralWidthImperial) {
        metricInputPairs.push({ metric: calcSpiralWidth, imperial: calcSpiralWidthImperial });
    }
    
    metricInputPairs.forEach(pair => {
        if (pair.metric && pair.imperial) {
            pair.metric.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (!isNaN(value) && value > 0) {
                    pair.imperial.value = metricToImperial(value);
                }
            });
            
            pair.imperial.addEventListener('input', function() {
                const validated = validateImperialInput(this.value);
                this.value = validated;
                const value = imperialToMetric(validated);
                if (value !== null && value > 0) {
                    pair.metric.value = value.toFixed(2);
                }
            });
        }
    });
    
    // ==================== CALCUL D'ESCALIER ====================
    
    function performCalculation() {
        document.querySelectorAll('#calculator .error').forEach(el => el.textContent = '');
        
        const isMetric = calcMeasurementSystem.value === 'metric';
        const buildingTypeValue = calcBuildingType.value;
        const stairTypeValue = calcStairType.value;
        const stairConfigValue = calcStairConfig.value;
        const lShapedConfigValue = calcLShapedConfig ? calcLShapedConfig.value : null;
        
        let totalRunValue, totalRiseValue, stairWidthValue, idealRiserValue, idealTreadValue;
        let firstFlightRunValue, secondFlightRunValue;
        
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
                firstFlightRunValue = 0;
                secondFlightRunValue = 0;
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
                firstFlightRunValue = 0;
                secondFlightRunValue = 0;
            }
        }
        
        let isValid = true;
        
        if (isNaN(totalRunValue) || totalRunValue <= 0) {
            document.getElementById('totalRunError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(totalRiseValue) || totalRiseValue <= 0) {
            document.getElementById('totalRiseError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
            document.getElementById('stairDesiredWidthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            if (isNaN(firstFlightRunValue) || firstFlightRunValue <= 0) {
                document.getElementById('firstFlightRunError').textContent = 'Valeur invalide.';
                isValid = false;
            }
            if (isNaN(secondFlightRunValue) || secondFlightRunValue <= 0) {
                document.getElementById('secondFlightRunError').textContent = 'Valeur invalide.';
                isValid = false;
            }
        }
        
        if (!isValid) return;
        
        const priorityComfort = document.querySelector('input[name="calcPriority"]:checked');
        const priority = priorityComfort ? priorityComfort.value : 'comfort';
        
        const solutions = calculateOptimalStair(totalRise, totalRunValue, {
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            lShapedConfig: lShapedConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priority,
            landingDepth: stairWidthValue,
            firstFlightRun: firstFlightRunValue,
            secondFlightRun: secondFlightRunValue
        });
        
        lastCalculatorParams = {
            totalRiseValue,
            totalRunValue,
            stairWidthValue,
            buildingTypeValue,
            stairTypeValue,
            stairConfigValue,
            lShapedConfigValue,
            isMetric
        };
        
        displayCalculatorResults(solutions, lastCalculatorParams);
    }
    
    calculateButton.addEventListener('click', performCalculation);
    
    // ==================== RECALCUL AVEC PRIORITÃ‰ CHANGÃ‰E ====================
    
    const priorityComfort = document.querySelector('input[name="calcPriority"][value="comfort"]');
    const prioritySpace = document.querySelector('input[name="calcPriority"][value="space"]');
    
    if (priorityComfort) {
        priorityComfort.addEventListener('change', function() {
            if (lastCalculatorParams) {
                performCalculation();
            }
        });
    }
    
    if (prioritySpace) {
        prioritySpace.addEventListener('change', function() {
            if (lastCalculatorParams) {
                performCalculation();
            }
        });
    }
    
    // ==================== TOUCHE ENTRÉE POUR CALCULER ====================
    
    const calculatorInputs = [
        totalRun, totalRunImperial, totalRise, totalRiseImperial,
        stairDesiredWidth, stairDesiredWidthImperial,
        idealRiser, idealRiserImperial, idealTread, idealTreadImperial,
        calcMinNarrowSide, calcMinNarrowSideImperial,
        calcSpiralWidth, calcSpiralWidthImperial,
        firstFlightRun, firstFlightRunImperial,
        secondFlightRun, secondFlightRunImperial
    ];
    
    calculatorInputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    calculateButton.click();
                }
            });
        }
    });
    
    // ==================== TOUCHE ENTRÉE POUR VÉRIFICATION ====================
    
    const verificationInputs = [
        riserHeight, riserHeightImperial, treadDepth, treadDepthImperial,
        narrowSide, narrowSideImperial, stairWidth, stairWidthImperial,
        headroom, headroomImperial, spiralWidth, spiralWidthImperial,
        landingDepth, landingDepthImperial
    ];
    
    verificationInputs.forEach(input => {
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    checkButton.click();
                }
            });
        }
    });
    
    // ==================== VÉRIFICATION CONFORMITÉ ====================
    
    checkButton.addEventListener('click', function() {
        document.querySelectorAll('#verification .error').forEach(el => el.textContent = '');
        
        const isMetric = measurementSystem.value === 'metric';
        const buildingTypeValue = buildingType.value;
        const buildingUseValue = buildingUse.value;
        const stairTypeValue = stairType.value;
        const stairUseValue = stairUse.value;
        const stairConfigValue = stairConfig.value;
        const lShapedConfigValue = lShapedConfig ? lShapedConfig.value : null;
        const dancingStepsConfigValue = dancingStepsConfig ? dancingStepsConfig.value : null;
        const spiralConfigValue = spiralConfig ? spiralConfig.value : null;
        
        let riserValue, treadValue, narrowSideValue, stairWidthValue, headroomValue, spiralWidthValue, landingDepthValue;
        
        if (isMetric) {
            riserValue = parseFloat(riserHeight.value);
            treadValue = parseFloat(treadDepth.value);
            narrowSideValue = parseFloat(narrowSide ? narrowSide.value : 0) || 0;
            stairWidthValue = parseFloat(stairWidth.value);
            headroomValue = parseFloat(headroom.value);
            spiralWidthValue = parseFloat(spiralWidth ? spiralWidth.value : 0) || 0;
            landingDepthValue = parseFloat(landingDepth ? landingDepth.value : 0) || 0;
        } else {
            riserValue = imperialToMetric(validateImperialInput(riserHeightImperial.value));
            treadValue = imperialToMetric(validateImperialInput(treadDepthImperial.value));
            narrowSideValue = imperialToMetric(validateImperialInput(narrowSideImperial ? narrowSideImperial.value : '')) || 0;
            stairWidthValue = imperialToMetric(validateImperialInput(stairWidthImperial.value));
            headroomValue = imperialToMetric(validateImperialInput(headroomImperial.value));
            spiralWidthValue = imperialToMetric(validateImperialInput(spiralWidthImperial ? spiralWidthImperial.value : '')) || 0;
            landingDepthValue = imperialToMetric(validateImperialInput(landingDepthImperial ? landingDepthImperial.value : '')) || 0;
        }
        
        let isValid = true;
        
        if (isNaN(riserValue) || riserValue <= 0) {
            document.getElementById('riserHeightError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(treadValue) || treadValue <= 0) {
            document.getElementById('treadDepthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
            document.getElementById('stairWidthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(headroomValue) || headroomValue <= 0) {
            document.getElementById('headroomError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (stairConfigValue === 'dancing_steps' && (isNaN(narrowSideValue) || narrowSideValue <= 0)) {
            document.getElementById('narrowSideError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (stairConfigValue === 'spiral' && (isNaN(spiralWidthValue) || spiralWidthValue <= 0)) {
            document.getElementById('spiralWidthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'standard_landing' && (isNaN(landingDepthValue) || landingDepthValue <= 0)) {
            document.getElementById('landingDepthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Déterminer type et configuration
        const type = buildingTypeValue === 'part3' ? 'common' : stairTypeValue;
        const config = stairConfigValue;
        const use = stairUseValue;
        
        // Limites CNB 2025
        let minRiser, maxRiser, minTread, maxTread, minWidth, minHeadroom, minNarrowSide, minSpiralWidth;
        
        if (buildingTypeValue === 'part3') {
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = 355;
            minWidth = 1100;
            minHeadroom = 2100;
            minNarrowSide = 150;
            minSpiralWidth = 660;
        } else {
            if (type === 'private') {
                minRiser = 125;
                maxRiser = 200;
                minTread = 235;
                maxTread = 355;
                minWidth = 860;
                minHeadroom = 1950;
                minNarrowSide = 150;
                minSpiralWidth = 660;
            } else {
                minRiser = 125;
                maxRiser = 180;
                minTread = 280;
                maxTread = 355;
                minWidth = 900;
                minHeadroom = 2050;
                minNarrowSide = 150;
                minSpiralWidth = 660;
            }
        }
        
        const issues = [];
        let isCompliant = true;
        
        // Vérifications
        if (riserValue < minRiser || riserValue > maxRiser) {
            issues.push(`Contremarche ${riserValue.toFixed(0)} mm hors limites (${minRiser}-${maxRiser} mm)`);
            isCompliant = false;
        }
        
        if (treadValue < minTread || treadValue > maxTread) {
            issues.push(`Giron ${treadValue.toFixed(0)} mm hors limites (${minTread}-${maxTread} mm)`);
            isCompliant = false;
        }
        
        if (stairWidthValue < minWidth) {
            issues.push(`Largeur ${stairWidthValue.toFixed(0)} mm < minimum (${minWidth} mm)`);
            isCompliant = false;
        }
        
        if (headroomValue < minHeadroom) {
            issues.push(`Échappée ${headroomValue.toFixed(0)} mm < minimum (${minHeadroom} mm)`);
            isCompliant = false;
        }
        
        if (config === 'dancing_steps' && narrowSideValue < minNarrowSide) {
            issues.push(`Côté étroit ${narrowSideValue.toFixed(0)} mm < minimum (${minNarrowSide} mm à 300 mm de l'axe)`);
            isCompliant = false;
        }
        
        if (config === 'spiral' && narrowSideValue < 190) {
            issues.push(`Giron minimum ${narrowSideValue.toFixed(0)} mm < 190 mm à 300 mm de l'axe (CNB 9.8.4.7)`);
            isCompliant = false;
        }
        
        if (config === 'spiral' && spiralWidthValue < minSpiralWidth) {
            issues.push(`Largeur libre mains courantes (${spiralWidthValue.toFixed(0)} mm) < minimum (${minSpiralWidth} mm)`);
            isCompliant = false;
        }
        
        if (config === 'spiral' && stairUseValue === 'exit') {
            issues.push(`Escaliers hélicoïdaux interdits comme issues (CNB 9.8.4.7)`);
            isCompliant = false;
        }
        
        if (config === 'spiral' && spiralConfigValue === 'primary' && type === 'common') {
            issues.push(`Escalier hélicoïdal seul moyen évacuation: max 3 personnes (CNB 9.8.4.7)`);
            isCompliant = false;
        }
        
        if (config === 'l_shaped' && lShapedConfigValue === 'standard_landing') {
            if (landingDepthValue < minTread) {
                issues.push(`Profondeur palier ${landingDepthValue.toFixed(0)} mm < minimum (${minTread} mm)`);
                isCompliant = false;
            }
        }
        
        const stepRule = checkStepRule(riserValue, treadValue);
        const codeReference = buildingTypeValue === 'part3' ? 'CNB 2020 Partie 3' : 'CNB 2020 Partie 9';
        
        // Stocker pour reformatage
        lastVerificationParams = {
            isCompliant,
            issues,
            stepRule,
            codeReference,
            isMetric
        };
        
        displayVerificationResults(lastVerificationParams);
    });
    
    // Initialisation
    stairConfig.dispatchEvent(new Event('change'));
    calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
});
