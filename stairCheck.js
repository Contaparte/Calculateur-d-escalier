// ==================== CALCULATEUR D'ESCALIER CNB 2015 ====================
// Version corrigée avec précision mathématique améliorée

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
        priority
    } = preferences;
    
    // Définir les limites CNB 2015
    let minRiser, maxRiser, minTread, maxTread;
    
    if (buildingType === 'part3') {
        minRiser = 125;
        maxRiser = 180;
        minTread = 280;
        maxTread = Infinity;
        
        if (stairConfig === 'spiral') {
            maxRiser = 240;
            minTread = 190;
        }
    } else {
        if (stairType === 'private') {
            minRiser = 125;
            maxRiser = 200;
            minTread = 255;
            maxTread = 355;
        } else {
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = Infinity;
        }
        
        if (stairConfig === 'spiral') {
            maxRiser = 240;
            minTread = 190;
        }
    }
    
    // Déterminer marches rayonnantes
    let numRadiatingSteps = 0;
    let configurationType = stairConfig === 'l_shaped' && lShapedConfig ? lShapedConfig : stairConfig;
    
    if (configurationType === 'two_45deg') {
        numRadiatingSteps = 2;
    } else if (configurationType === 'three_30deg') {
        numRadiatingSteps = 3;
    }
    
    const optimalStep = 640;
    let solutions = [];
    
    // Calculer nombre théorique de contremarches avec une marge plus large
    const theoreticalRisers = totalRise / (idealRiser > 0 ? idealRiser : (minRiser + maxRiser) / 2);
    const minRisersToTry = Math.max(3, Math.floor(theoreticalRisers - 6));
    const maxRisersToTry = Math.ceil(theoreticalRisers + 6);
    
    // Debug: afficher la plage de recherche en console
    console.log(`Recherche de ${minRisersToTry} à ${maxRisersToTry} contremarches`);
    console.log(`Hauteur totale: ${totalRise}mm, Longueur totale: ${totalRun}mm`);
    console.log(`Limites: Contremarche [${minRiser}, ${maxRiser}]mm, Giron [${minTread}, ${maxTread === Infinity ? '∞' : maxTread}]mm`);
    
    for (let numRisers = minRisersToTry; numRisers <= maxRisersToTry; numRisers++) {
        // PRÉCISION CRITIQUE: Diviser la hauteur totale exactement
        const riserHeight = totalRise / numRisers;
        
        if (riserHeight < minRiser || riserHeight > maxRiser) continue;
        
        const numTreads = numRisers - 1;
        if (numTreads <= 0) continue;
        
        // Calculer longueur disponible pour marches rectangulaires
        let availableRunForRectangular = totalRun;
        let numRectangularTreads = numTreads;
        let actualLandingLength = 0;
        
        if (numRadiatingSteps > 0) {
            numRectangularTreads = numTreads - numRadiatingSteps;
            if (numRectangularTreads < 0) continue;
            // Pour marches rayonnantes, on estime qu'elles occupent ~70% de la projection
            const estimatedRadiatingRun = (totalRun / numTreads) * numRadiatingSteps * 0.7;
            availableRunForRectangular = totalRun - estimatedRadiatingRun;
        } else if (stairConfig === 'l_shaped' && lShapedConfig === 'standard_landing') {
            actualLandingLength = stairType === 'private' ? 860 : 900;
            availableRunForRectangular = totalRun - actualLandingLength;
        } else if (stairConfig === 'u_shaped') {
            actualLandingLength = stairType === 'private' ? 860 : 1100;
            availableRunForRectangular = totalRun - actualLandingLength;
        } else if (stairConfig === 'dancing_steps') {
            availableRunForRectangular = totalRun;
        }
        
        // Vérifier que la longueur est positive
        if (availableRunForRectangular <= 0) continue;
        
        // PRÉCISION CRITIQUE: Diviser la longueur exactement
        const treadDepth = availableRunForRectangular / numRectangularTreads;
        
        if (treadDepth < minTread || (maxTread !== Infinity && treadDepth > maxTread)) continue;
        
        const stepRule = checkStepRule(riserHeight, treadDepth);
        const stepValue = 2 * riserHeight + treadDepth;
        
        const riserDeviation = idealRiser > 0 ? Math.abs(riserHeight - idealRiser) : 0;
        const treadDeviation = idealTread > 0 ? Math.abs(treadDepth - idealTread) : 0;
        const stepDeviation = Math.abs(stepValue - optimalStep);
        
        let score;
        if (priority === 'comfort') {
            score = stepDeviation * 2 + riserDeviation + treadDeviation;
            if (stepRule.isValid) score *= 0.8;
        } else {
            score = riserDeviation + treadDeviation * 2;
        }
        
        // Calculer longueur totale réelle pour vérification
        let actualTotalRun = treadDepth * numRectangularTreads;
        
        // Ajouter la projection des marches rayonnantes si applicable
        if (numRadiatingSteps > 0) {
            actualTotalRun += treadDepth * numRadiatingSteps * 0.7;
        }
        
        // Ajouter la longueur du palier si applicable
        actualTotalRun += actualLandingLength;
        
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
            actualTotalRun
        });
    }
    
    solutions.sort((a, b) => a.score - b.score);
    return solutions.slice(0, 3);
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
    const priorityComfort = document.getElementById('priorityComfort');
    const prioritySpace = document.getElementById('prioritySpace');
    const calculateButton = document.getElementById('calculateStair');
    const calculatorResult = document.getElementById('calculatorResult');
    const calculatorResultContent = document.getElementById('calculatorResultContent');
    
    // Placeholders
    const placeholders = {
        metrique: {
            "totalRun": "Ex: 3500 mm",
            "totalRunImperial": "Ex: 11'6\"",
            "totalRise": "Ex: 3000 mm",
            "totalRiseImperial": "Ex: 10'2\"",
            "stairDesiredWidth": "Ex: 900 mm",
            "stairDesiredWidthImperial": "Ex: 36\"",
            "idealRiser": "Ex: 180 mm",
            "idealRiserImperial": "Ex: 7\"",
            "idealTread": "Ex: 280 mm",
            "idealTreadImperial": "Ex: 11\"",
            "calcMinNarrowSide": "Ex: 150 mm",
            "calcMinNarrowSideImperial": "Ex: 6\"",
            "calcSpiralWidth": "Ex: 660 mm",
            "calcSpiralWidthImperial": "Ex: 26\"",
            "stairWidth": "Ex: 900 mm",
            "stairWidthImperial": "Ex: 36\"",
            "headroom": "Ex: 2050 mm",
            "headroomImperial": "Ex: 6'8\"",
            "riserHeight": "Ex: 180 mm",
            "riserHeightImperial": "Ex: 7\"",
            "treadDepth": "Ex: 280 mm",
            "treadDepthImperial": "Ex: 11\"",
            "narrowSide": "Ex: 150 mm",
            "narrowSideImperial": "Ex: 6\"",
            "spiralWidth": "Ex: 660 mm",
            "spiralWidthImperial": "Ex: 26\""
        },
        imperial: {
            "totalRun": "Ex: 3500 mm",
            "totalRunImperial": "Ex: 11'6\"",
            "totalRise": "Ex: 3000 mm",
            "totalRiseImperial": "Ex: 10'2\"",
            "stairDesiredWidth": "Ex: 900 mm",
            "stairDesiredWidthImperial": "Ex: 36\"",
            "idealRiser": "Ex: 180 mm",
            "idealRiserImperial": "Ex: 7\"",
            "idealTread": "Ex: 280 mm",
            "idealTreadImperial": "Ex: 11\"",
            "calcMinNarrowSide": "Ex: 150 mm",
            "calcMinNarrowSideImperial": "Ex: 6\"",
            "calcSpiralWidth": "Ex: 660 mm",
            "calcSpiralWidthImperial": "Ex: 26\"",
            "stairWidth": "Ex: 900 mm",
            "stairWidthImperial": "Ex: 36\"",
            "headroom": "Ex: 2050 mm",
            "headroomImperial": "Ex: 6'8\"",
            "riserHeight": "Ex: 180 mm",
            "riserHeightImperial": "Ex: 7\"",
            "treadDepth": "Ex: 280 mm",
            "treadDepthImperial": "Ex: 11\"",
            "narrowSide": "Ex: 150 mm",
            "narrowSideImperial": "Ex: 6\"",
            "spiralWidth": "Ex: 660 mm",
            "spiralWidthImperial": "Ex: 26\""
        }
    };
    
    // ==================== GESTION ONGLETS ====================
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            updatePlaceholders(tabId);
        });
    });
    
    function updatePlaceholders(tab) {
        const isCalcTab = tab === 'calculator';
        const systemeElement = isCalcTab ? calcMeasurementSystem : measurementSystem;
        const isImperial = systemeElement.value === 'imperial';
        const placeholdersData = isImperial ? placeholders.imperial : placeholders.metrique;
        
        for (const [id, placeholder] of Object.entries(placeholdersData)) {
            const element = document.getElementById(id);
            if (element) element.placeholder = placeholder;
        }
        
        const metricInputs = document.querySelectorAll('.metric-input');
        const imperialInputs = document.querySelectorAll('.imperial-input');
        
        metricInputs.forEach(input => {
            input.style.display = isImperial ? 'none' : 'block';
        });
        
        imperialInputs.forEach(input => {
            input.style.display = isImperial ? 'block' : 'none';
        });
    }
    
    // Synchroniser systèmes de mesure
    measurementSystem.addEventListener('change', function() {
        calcMeasurementSystem.value = this.value;
        updatePlaceholders('verification');
        updatePlaceholders('calculator');
    });
    
    calcMeasurementSystem.addEventListener('change', function() {
        measurementSystem.value = this.value;
        updatePlaceholders('verification');
        updatePlaceholders('calculator');
    });
    
    // Gestion configurations escalier - vérification
    stairConfig.addEventListener('change', function() {
        lShapedOptions.style.display = 'none';
        dancingStepsOptions.style.display = 'none';
        spiralOptions.style.display = 'none';
        
        if (this.value === 'l_shaped') {
            lShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps') {
            dancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            spiralOptions.style.display = 'block';
        }
    });
    
    // Gestion configurations escalier - calculateur
    calcStairConfig.addEventListener('change', function() {
        calcLShapedOptions.style.display = 'none';
        calcDancingStepsOptions.style.display = 'none';
        calcSpiralOptions.style.display = 'none';
        
        if (this.value === 'l_shaped') {
            calcLShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps') {
            calcDancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            calcSpiralOptions.style.display = 'block';
        }
    });
    
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
        { metric: narrowSide, imperial: narrowSideImperial },
        { metric: spiralWidth, imperial: spiralWidthImperial },
        { metric: calcMinNarrowSide, imperial: calcMinNarrowSideImperial },
        { metric: calcSpiralWidth, imperial: calcSpiralWidthImperial }
    ];
    
    metricInputPairs.forEach(pair => {
        if (pair.metric && pair.imperial) {
            pair.metric.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (!isNaN(value)) {
                    pair.imperial.value = metricToImperial(value);
                }
            });
            
            pair.imperial.addEventListener('input', function() {
                const value = imperialToMetric(validateImperialInput(this.value));
                if (value !== null) {
                    pair.metric.value = value;
                }
            });
        }
    });
    
    // ==================== VÉRIFICATION CONFORMITÉ ====================
    
    checkButton.addEventListener('click', function() {
        document.querySelectorAll('.error').forEach(el => el.textContent = '');
        
        const isMetric = measurementSystem.value === 'metric';
        const isBuildingPart3 = buildingType.value === 'part3';
        const type = stairType.value;
        const stairUseValue = stairUse.value;
        const config = stairConfig.value;
        const lShapedConfigValue = lShapedConfig ? lShapedConfig.value : 'standard_landing';
        const spiralConfigValue = spiralConfig ? spiralConfig.value : 'primary';
        
        let riserHeightValue, treadDepthValue, narrowSideValue, stairWidthValue, headroomValue, spiralWidthValue;
        
        if (isMetric) {
            riserHeightValue = parseFloat(riserHeight.value);
            treadDepthValue = parseFloat(treadDepth.value);
            narrowSideValue = parseFloat(narrowSide ? narrowSide.value : 0) || 0;
            stairWidthValue = parseFloat(stairWidth.value);
            headroomValue = parseFloat(headroom.value);
            spiralWidthValue = parseFloat(spiralWidth ? spiralWidth.value : 0) || 0;
        } else {
            riserHeightValue = imperialToMetric(validateImperialInput(riserHeightImperial.value));
            treadDepthValue = imperialToMetric(validateImperialInput(treadDepthImperial.value));
            narrowSideValue = imperialToMetric(validateImperialInput(narrowSideImperial ? narrowSideImperial.value : '')) || 0;
            stairWidthValue = imperialToMetric(validateImperialInput(stairWidthImperial.value));
            headroomValue = imperialToMetric(validateImperialInput(headroomImperial.value));
            spiralWidthValue = imperialToMetric(validateImperialInput(spiralWidthImperial ? spiralWidthImperial.value : '')) || 0;
        }
        
        let isValid = true;
        
        if (isNaN(riserHeightValue) || riserHeightValue <= 0) {
            document.getElementById('riserHeightError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (isNaN(treadDepthValue) || treadDepthValue <= 0) {
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
        
        if (config === 'spiral' && (isNaN(spiralWidthValue) || spiralWidthValue <= 0)) {
            document.getElementById('spiralWidthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Définir limites CNB 2015
        let minRiser, maxRiser, minTread, maxTread, minNarrowSide, minWidth, minHeadroom, minSpiralWidth;
        let codeReference = 'CNB 2015';
        
        if (isBuildingPart3) {
            codeReference = 'CNB 2015 Partie 3';
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = Infinity;
            
            if (config === 'dancing_steps') {
                minNarrowSide = 150;
            }
            
            minWidth = 1100;
            minHeadroom = 2050;
            
            if (config === 'spiral') {
                minSpiralWidth = 660;
                maxRiser = 240;
            }
        } else {
            codeReference = 'CNB 2015 Partie 9';
            
            if (type === 'private') {
                minRiser = 125;
                maxRiser = 200;
                minTread = 255;
                maxTread = 355;
            } else {
                minRiser = 125;
                maxRiser = 180;
                minTread = 280;
                maxTread = Infinity;
            }
            
            if (config === 'dancing_steps') {
                minNarrowSide = 150;
            }
            
            if (type === 'private') {
                minWidth = 860;
                minHeadroom = 1950;
            } else {
                minWidth = 900;
                minHeadroom = 2050;
            }
            
            if (config === 'spiral') {
                minSpiralWidth = 660;
                maxRiser = 240;
                minTread = 190;
            }
        }
        
        if (stairUseValue === 'exit') {
            if (isBuildingPart3) {
                minWidth = 1100;
                if (config === 'dancing_steps') {
                    minNarrowSide = 240;
                }
            } else {
                minWidth = 900;
            }
        }
        
        // Vérifier conformité
        let issues = [];
        let isCompliant = true;
        
        if (riserHeightValue < minRiser) {
            issues.push(`Hauteur contremarche (${riserHeightValue.toFixed(0)} mm) < minimum (${minRiser} mm)`);
            isCompliant = false;
        } else if (riserHeightValue > maxRiser) {
            issues.push(`Hauteur contremarche (${riserHeightValue.toFixed(0)} mm) > maximum (${maxRiser} mm)`);
            isCompliant = false;
        }
        
        if (treadDepthValue < minTread) {
            issues.push(`Giron (${treadDepthValue.toFixed(0)} mm) < minimum (${minTread} mm)`);
            isCompliant = false;
        } else if (treadDepthValue > maxTread && maxTread !== Infinity) {
            issues.push(`Giron (${treadDepthValue.toFixed(0)} mm) > maximum (${maxTread} mm)`);
            isCompliant = false;
        }
        
        const stepRule = checkStepRule(riserHeightValue, treadDepthValue);
        if (!stepRule.isValid) {
            let stepsIssue = "Règle du pas non respectée (< 2/3 règles):";
            if (!stepRule.rule1.isValid) {
                stepsIssue += `<br>- Règle 1: ${stepRule.rule1.value.toFixed(2)}" (idéal: 17"-18")`;
            }
            if (!stepRule.rule2.isValid) {
                stepsIssue += `<br>- Règle 2: ${stepRule.rule2.value.toFixed(2)} po² (idéal: 71-74 po²)`;
            }
            if (!stepRule.rule3.isValid) {
                stepsIssue += `<br>- Règle 3: ${stepRule.rule3.value.toFixed(2)}" (idéal: 22"-25")`;
            }
            issues.push(stepsIssue);
        }
        
        if (config === 'dancing_steps' && narrowSideValue < minNarrowSide) {
            issues.push(`Largeur côté étroit (${narrowSideValue.toFixed(0)} mm) < minimum (${minNarrowSide} mm)`);
            isCompliant = false;
        }
        
        if (stairWidthValue < minWidth) {
            issues.push(`Largeur escalier (${stairWidthValue.toFixed(0)} mm) < minimum (${minWidth} mm)`);
            isCompliant = false;
        }
        
        if (headroomValue < minHeadroom) {
            issues.push(`Hauteur libre (${headroomValue.toFixed(0)} mm) < minimum (${minHeadroom} mm)`);
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
        
        // Affichage résultat
        resultContent.innerHTML = '';
        result.className = 'result';
        
        if (isCompliant) {
            result.classList.add('compliant');
            resultContent.innerHTML = `<p class="success">✓ Conforme au ${codeReference}.</p>`;
            
            if (!stepRule.isValid) {
                resultContent.innerHTML += `
                <div class="warning">
                    <p>⚠ Règle du pas: ${stepRule.validRuleCount}/3 règles satisfaites (recommandé: 2/3)</p>
                    <ul>
                        <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: ${stepRule.rule1.value.toFixed(2)}" (17"-18")</li>
                        <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: ${stepRule.rule2.value.toFixed(2)} po² (71-74 po²)</li>
                        <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: ${stepRule.rule3.value.toFixed(2)}" (22"-25")</li>
                    </ul>
                </div>`;
            } else {
                resultContent.innerHTML += `
                <div class="result-section">
                    <p>✓ Règle du pas respectée (${stepRule.validRuleCount}/3):</p>
                    <ul>
                        <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: ${stepRule.rule1.value.toFixed(2)}"</li>
                        <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: ${stepRule.rule2.value.toFixed(2)} po²</li>
                        <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: ${stepRule.rule3.value.toFixed(2)}"</li>
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
    });
    
    // ==================== CALCUL ESCALIER ====================
    
    calculateButton.addEventListener('click', function() {
        document.querySelectorAll('#calculator .error').forEach(el => el.textContent = '');
        
        const isMetric = calcMeasurementSystem.value === 'metric';
        const buildingTypeValue = calcBuildingType.value;
        const stairTypeValue = calcStairType.value;
        const stairConfigValue = calcStairConfig.value;
        const lShapedConfigValue = calcLShapedConfig ? calcLShapedConfig.value : null;
        const spiralConfigValue = calcSpiralConfig ? calcSpiralConfig.value : null;
        
        let totalRunValue, totalRiseValue, stairWidthValue, idealRiserValue, idealTreadValue;
        let minNarrowSideValue, spiralWidthValue;
        
        if (isMetric) {
            totalRunValue = parseFloat(totalRun.value);
            totalRiseValue = parseFloat(totalRise.value);
            stairWidthValue = parseFloat(stairDesiredWidth.value);
            idealRiserValue = parseFloat(idealRiser.value) || 0;
            idealTreadValue = parseFloat(idealTread.value) || 0;
            minNarrowSideValue = parseFloat(calcMinNarrowSide ? calcMinNarrowSide.value : 0) || 0;
            spiralWidthValue = parseFloat(calcSpiralWidth ? calcSpiralWidth.value : 0) || 0;
        } else {
            totalRunValue = imperialToMetric(validateImperialInput(totalRunImperial.value));
            totalRiseValue = imperialToMetric(validateImperialInput(totalRiseImperial.value));
            stairWidthValue = imperialToMetric(validateImperialInput(stairDesiredWidthImperial.value));
            idealRiserValue = imperialToMetric(validateImperialInput(idealRiserImperial.value)) || 0;
            idealTreadValue = imperialToMetric(validateImperialInput(idealTreadImperial.value)) || 0;
            minNarrowSideValue = imperialToMetric(validateImperialInput(calcMinNarrowSideImperial ? calcMinNarrowSideImperial.value : '')) || 0;
            spiralWidthValue = imperialToMetric(validateImperialInput(calcSpiralWidthImperial ? calcSpiralWidthImperial.value : '')) || 0;
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
        
        if (stairConfigValue === 'dancing_steps' && (isNaN(minNarrowSideValue) || minNarrowSideValue <= 0)) {
            document.getElementById('calcMinNarrowSideError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (stairConfigValue === 'spiral' && (isNaN(spiralWidthValue) || spiralWidthValue <= 0)) {
            document.getElementById('calcSpiralWidthError').textContent = 'Valeur invalide.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        const priorityValue = priorityComfort && priorityComfort.checked ? 'comfort' : 'space';
        
        const preferences = {
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            lShapedConfig: lShapedConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priorityValue
        };
        
        const solutions = calculateOptimalStair(totalRiseValue, totalRunValue, preferences);
        
        if (!solutions || solutions.length === 0) {
            // Diagnostics pour aider l'utilisateur
            const avgRiser = totalRiseValue / (totalRunValue / 280); // Estimation avec giron standard
            const avgTread = totalRunValue / (totalRiseValue / 175); // Estimation avec contremarche standard
            
            let diagnostic = '<p>⚠ Aucune solution conforme trouvée avec ces dimensions.</p>';
            diagnostic += '<div class="warning"><p><strong>Diagnostic :</strong></p><ul>';
            
            if (avgRiser < 125) {
                diagnostic += '<li>La hauteur totale est trop faible pour la longueur disponible</li>';
            } else if (avgRiser > (stairTypeValue === 'private' ? 200 : 180)) {
                diagnostic += '<li>La hauteur totale est trop élevée pour la longueur disponible</li>';
            }
            
            if (avgTread < (stairTypeValue === 'private' ? 255 : 280)) {
                diagnostic += '<li>La longueur disponible est trop courte - augmentez-la ou réduisez la hauteur</li>';
            }
            
            diagnostic += '</ul><p><strong>Suggestions :</strong></p><ul>';
            diagnostic += `<li>Pour une hauteur de ${(totalRiseValue/1000).toFixed(2)} m, une longueur d'au moins ${Math.ceil((totalRiseValue/175)*280/100)*100} mm est recommandée</li>`;
            diagnostic += '<li>Essayez un escalier avec palier intermédiaire</li>';
            diagnostic += '<li>Vérifiez que vous avez sélectionné le bon type d\'escalier (Privé vs Commun)</li>';
            diagnostic += '</ul></div>';
            
            calculatorResultContent.innerHTML = diagnostic;
            calculatorResult.style.display = 'block';
            return;
        }
        
        const bestSolution = solutions[0];
        const codeReference = buildingTypeValue === 'part3' ? 'CNB 2015 Partie 3' : 'CNB 2015 Partie 9';
        
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
        
        // Formatage résultats
        const formatRiserHeight = isMetric ? `${bestSolution.riserHeight.toFixed(2)} mm` : metricToImperial(bestSolution.riserHeight);
        const formatTreadDepth = isMetric ? `${bestSolution.treadDepth.toFixed(2)} mm` : metricToImperial(bestSolution.treadDepth);
        const formatRiserExact = isMetric ? `${bestSolution.riserHeight.toFixed(2)} mm` : `${(bestSolution.riserHeight / 25.4).toFixed(4)}"`;
        const formatTreadExact = isMetric ? `${bestSolution.treadDepth.toFixed(2)} mm` : `${(bestSolution.treadDepth / 25.4).toFixed(4)}"`;
        
        // VÉRIFICATIONS MATHÉMATIQUES EXACTES
        const totalRiseCalculation = bestSolution.riserHeight * bestSolution.numRisers;
        const riseError = Math.abs(totalRiseCalculation - totalRiseValue);
        
        const totalRunCalculation = bestSolution.treadDepth * bestSolution.numTreads;
        const runError = Math.abs(totalRunCalculation - totalRunValue);
        
        const formatTotalRise = isMetric ? `${totalRiseCalculation.toFixed(2)} mm` : metricToImperial(totalRiseCalculation);
        const formatActualTotalRun = isMetric ? `${bestSolution.actualTotalRun.toFixed(2)} mm` : metricToImperial(bestSolution.actualTotalRun);
        const formatStairWidth = isMetric ? `${stairWidthValue.toFixed(0)} mm` : metricToImperial(stairWidthValue);
        
        let riserVerification = '';
        if (isMetric) {
            riserVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numRisers} × ${bestSolution.riserHeight.toFixed(2)} mm = ${totalRiseCalculation.toFixed(2)} mm
                    ${riseError < 0.1 ? '✓ Exact' : `⚠ Écart ${riseError.toFixed(2)} mm`}
                </div>`;
        } else {
            const riserInches = bestSolution.riserHeight / 25.4;
            const totalRiseInches = totalRiseCalculation / 25.4;
            riserVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numRisers} × ${riserInches.toFixed(4)}" = ${totalRiseInches.toFixed(4)}"
                    ${riseError < 2.5 ? '✓ Exact' : `⚠ Écart ${(riseError/25.4).toFixed(4)}"`}
                </div>`;
        }
        
        let treadVerification = '';
        if (isMetric) {
            treadVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numTreads} × ${bestSolution.treadDepth.toFixed(2)} mm = ${totalRunCalculation.toFixed(2)} mm
                    ${runError < 0.1 ? '✓ Exact' : `⚠ Écart ${runError.toFixed(2)} mm`}
                </div>`;
        } else {
            const treadInches = bestSolution.treadDepth / 25.4;
            const totalRunInches = totalRunCalculation / 25.4;
            treadVerification = `
                <div class="step-formula">
                    Vérification: ${bestSolution.numTreads} × ${treadInches.toFixed(4)}" = ${totalRunInches.toFixed(4)}"
                    ${runError < 2.5 ? '✓ Exact' : `⚠ Écart ${(runError/25.4).toFixed(4)}"`}
                </div>`;
        }
        
        let stepRuleDetails = `
            <div class="result-section">
                <h4>Règle du pas (solution optimale)</h4>
                <ul>
                    <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "⚠"} Règle 1: ${bestSolution.stepRule.rule1.value.toFixed(2)}" (17"-18")</li>
                    <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "⚠"} Règle 2: ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (71-74 po²)</li>
                    <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "⚠"} Règle 3: ${bestSolution.stepRule.rule3.value.toFixed(2)}" (22"-25")</li>
                </ul>
                <p>${bestSolution.stepRule.isValid ? "✓ Confort optimal (≥2/3 règles)" : "⚠ Confort limité (<2/3 règles)"}</p>
            </div>`;
        
        let detailsHtml = `
            <div class="result-section">
                <h3>Solution optimale</h3>
                <h4>Dimensions de traçage (valeurs exactes):</h4>
                <ul>
                    <li><strong>Hauteur contremarche:</strong> ${formatRiserExact} ${isMetric ? '' : '(≈ ' + formatRiserHeight + ')'}</li>
                    <li><strong>Profondeur giron:</strong> ${formatTreadExact} ${isMetric ? '' : '(≈ ' + formatTreadDepth + ')'}</li>
                </ul>
                ${riserVerification}
                ${treadVerification}
                <h4>Récapitulatif:</h4>
                <ul>
                    <li>Contremarches: ${bestSolution.numRisers}</li>
                    <li>Marches: ${bestSolution.numTreads}</li>
                    <li>Hauteur totale: ${formatTotalRise}</li>
                    <li>Longueur totale: ${formatActualTotalRun}</li>
                    <li>Largeur: ${formatStairWidth} ${isWidthCompliant ? '✓' : '⚠'}</li>
                </ul>
                <div class="warning">
                    <p><strong>Important traçage:</strong></p>
                    <ul>
                        <li>Utilisez les <strong>valeurs exactes décimales</strong> ci-dessus</li>
                        <li>Fractions = approximations au 1/16" près</li>
                        <li>Tolérance CNB 2015: ±5mm entre marches, ±10mm dans volée</li>
                        <li>Somme contremarches = hauteur totale exacte</li>
                        <li>Somme girons = longueur totale exacte</li>
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
                                <th>Contremarches</th>
                                <th>Hauteur CM</th>
                                <th>Giron</th>
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
                        <td>${index + 1}${index === 0 ? ' ★' : ''}</td>
                        <td>${sol.numRisers}</td>
                        <td>${riserStr}</td>
                        <td>${treadStr}</td>
                        <td>${sol.stepRule.validRuleCount}/3 ${sol.stepRule.isValid ? '✓' : '⚠'}</td>
                    </tr>`;
            });
            
            solutionsTable += `
                        </tbody>
                    </table>
                </div>`;
        }
        
        calculatorResultContent.innerHTML = `
            <p class="success">✓ Solution conforme ${codeReference}</p>
            ${widthWarning}
            ${detailsHtml}
            ${solutionsTable}
            ${configNotes}
            <div class="result-section">
                <h3>Notes importantes</h3>
                <ul>
                    <li>Calculs indicatifs - vérification professionnelle requise</li>
                    <li>Dimensions finales selon matériaux utilisés</li>
                    <li>Hauteur/giron uniformes dans volée</li>
                    <li>Exigences mains courantes et garde-corps à respecter</li>
                </ul>
            </div>`;
        
        calculatorResult.style.display = 'block';
    });
    
    // Initialisation
    stairConfig.dispatchEvent(new Event('change'));
    calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
});
