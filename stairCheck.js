function validateImperialInput(inputValue) {
    if (!inputValue) return '';
    
    // Remplacer les apostrophes spéciales par le caractère standard '
    inputValue = inputValue.replace(/[''′]/g, "'");
    
    // Simplifier les espaces autour des caractères spéciaux
    inputValue = inputValue.replace(/\s*(['-/"])\s*/g, '$1');
    
    // Normaliser l'apostrophe suivie d'un trait d'union (6'-9) en simple apostrophe (6'9)
    inputValue = inputValue.replace(/'-/g, "'");
    
    // Ajouter un espace entre un nombre et une fraction s'il n'y en a pas
    inputValue = inputValue.replace(/(\d)(\d+\/\d+)/g, '$1 $2');
    
    return inputValue;
}

// Fonction pour passer de millimètres à une chaîne en format impérial
function metricToImperial(mmValue) {
    if (!mmValue) return '';
    
    const inches = mmValue / 25.4;
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    
    // Arrondir au 1/16 de pouce le plus proche
    const fraction = Math.round(remainingInches * 16) / 16;
    const wholePart = Math.floor(fraction);
    const fractionalPart = fraction - wholePart;
    
    let result = '';
    
    if (feet > 0) {
        result += feet + '\'';
    }
    
    if (wholePart > 0 || fractionalPart > 0) {
        if (feet > 0) result += ' ';
        
        if (wholePart > 0) {
            result += wholePart;
        }
        
        if (fractionalPart > 0) {
            // Convertir la fraction décimale en fraction
            const numerator = Math.round(fractionalPart * 16);
            const denominator = 16;
            
            // Réduire la fraction
            const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
            const divisor = gcd(numerator, denominator);
            
            const simplifiedNumerator = numerator / divisor;
            const simplifiedDenominator = denominator / divisor;
            
            if (wholePart > 0) result += ' ';
            result += simplifiedNumerator + '/' + simplifiedDenominator;
        }
        
        result += '"';
    } else if (feet === 0) {
        result = '0"';
    }
    
    return result;
}

// Convertir des pieds-pouces en millimètres
function imperialToMetric(imperialValue) {
    if (!imperialValue) return null;
    
    // Log pour débogage
    console.log("Entrée imperialToMetric:", imperialValue);
    
    // Formats possibles: "6'2", "6' 2", "6 2", "6-2", "6 ft 2 in", "6'2\"", "6'-2", "6'-2 1/4", etc.
    imperialValue = imperialValue.toString().trim();
    
    // Adapté spécifiquement au format "6'-9 1/4""
    const specialFormat = imperialValue.match(/^(\d+(?:\.\d+)?)'[-\s]*(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?(?:\s*(?:"|in|inch|inches))?$/);
    if (specialFormat) {
        console.log("Format spécial détecté:", specialFormat);
        const feet = parseFloat(specialFormat[1]) || 0;
        const inches = parseFloat(specialFormat[2]) || 0;
        const fraction = specialFormat[3] && specialFormat[4] ? 
            parseFloat(specialFormat[3]) / parseFloat(specialFormat[4]) : 0;
        const totalInches = feet * 12 + inches + fraction;
        console.log(`Conversion: ${feet} pieds + ${inches} pouces + ${fraction} fraction = ${totalInches} pouces`);
        return Math.round(totalInches * 25.4);
    }
    
    // Pour les valeurs simples en pouces (comme "10" ou "10 in")
    if (/^(\d+(?:\.\d+)?)(?:\s*(?:in|inch|inches|"))?$/.test(imperialValue)) {
        const inches = parseFloat(imperialValue);
        console.log("Format pouces simple:", inches);
        return Math.round(inches * 25.4);
    }
    
    // Formats supplémentaires pour 6'-9 1/4"
    const formatsSpeciaux = [
        /^(\d+)['´][-\s]*(\d+)(?:\s+(\d+)\/(\d+))?["]?$/,  // 6'-9 1/4"
        /^(\d+)['´][-\s]*(\d+)(?:\s+(\d+)\/(\d+))?$/      // 6'-9 1/4
    ];
    
    for (let pattern of formatsSpeciaux) {
        const match = imperialValue.match(pattern);
        if (match) {
            console.log("Format spécifique trouvé:", match);
            const feet = parseInt(match[1]) || 0;
            const inches = parseInt(match[2]) || 0;
            const fraction = match[3] && match[4] ? 
                parseInt(match[3]) / parseInt(match[4]) : 0;
            const totalInches = feet * 12 + inches + fraction;
            console.log(`Format direct: ${feet} pieds + ${inches} pouces + ${fraction} fraction = ${totalInches} pouces`);
            return Math.round(totalInches * 25.4);
        }
    }
    
    // Pour les valeurs en pieds-pouces
    const patterns = [
        /^(\d+(?:\.\d+)?)'(?:\s*)(\d+(?:\.\d+)?)?(?:\s*(?:"|in|inch|inches))?$/,  // 6'2" or 6'2
        /^(\d+(?:\.\d+)?)(?:\s*(?:ft|feet|foot))(?:\s*)(\d+(?:\.\d+)?)?(?:\s*(?:"|in|inch|inches))?$/,  // 6 ft 2 in or 6 ft 2
        /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/,  // 6-2
        /^(\d+(?:\.\d+)?)(?:\s+)(\d+(?:\.\d+)?)$/  // 6 2
    ];
    
    for (let pattern of patterns) {
        const match = imperialValue.match(pattern);
        if (match) {
            console.log("Pattern standard trouvé:", match);
            const feet = parseFloat(match[1]) || 0;
            const inches = match[2] ? parseFloat(match[2]) : 0;
            const totalInches = feet * 12 + inches;
            console.log(`Standard: ${feet} pieds + ${inches} pouces = ${totalInches} pouces`);
            return Math.round(totalInches * 25.4);
        }
    }
    
    // Pour les fractions (par exemple, "6 1/2")
    const fractionMatch = imperialValue.match(/^(\d+(?:\.\d+)?)(?:\s*)(\d+)\/(\d+)(?:\s*(?:"|in|inch|inches))?$/);
    if (fractionMatch) {
        console.log("Fraction trouvée:", fractionMatch);
        const wholeNumber = parseFloat(fractionMatch[1]) || 0;
        const numerator = parseFloat(fractionMatch[2]);
        const denominator = parseFloat(fractionMatch[3]);
        const inches = wholeNumber + (numerator / denominator);
        console.log(`Fraction: ${wholeNumber} + ${numerator}/${denominator} = ${inches} pouces`);
        return Math.round(inches * 25.4);
    }
    
    // Pour les pieds avec fractions de pouce (par exemple "6' 1/2")
    const feetWithFractionMatch = imperialValue.match(/^(\d+(?:\.\d+)?)'(?:\s*)(\d+)\/(\d+)(?:\s*(?:"|in|inch|inches))?$/);
    if (feetWithFractionMatch) {
        console.log("Pieds avec fraction:", feetWithFractionMatch);
        const feet = parseFloat(feetWithFractionMatch[1]) || 0;
        const numerator = parseFloat(feetWithFractionMatch[2]);
        const denominator = parseFloat(feetWithFractionMatch[3]);
        const totalInches = feet * 12 + (numerator / denominator);
        console.log(`Pieds+fraction: ${feet} pieds + ${numerator}/${denominator} = ${totalInches} pouces`);
        return Math.round(totalInches * 25.4);
    }
    
    // Si aucun format ne correspond
    console.log("Aucun format reconnu");
    return null;
}

// Fonction pour vérifier si la règle du pas est respectée (2 des 3 règles doivent être respectées)
function checkStepRule(riser, tread) {
    // Convertir en pouces pour calculer selon les règles du pas
    const riserInches = riser / 25.4;
    const treadInches = tread / 25.4;
    
    // Règle 1: Giron + CM = 17" à 18"
    const rule1 = treadInches + riserInches;
    const isRule1Valid = rule1 >= 17 && rule1 <= 18;
    
    // Règle 2: Giron x CM = 71po² à 74po²
    const rule2 = treadInches * riserInches;
    const isRule2Valid = rule2 >= 71 && rule2 <= 74;
    
    // Règle 3: Giron + 2(CM) = 22" à 25"
    const rule3 = treadInches + (2 * riserInches);
    const isRule3Valid = rule3 >= 22 && rule3 <= 25;
    
    // Vérifier si au moins 2 des 3 règles sont respectées
    const validRules = [isRule1Valid, isRule2Valid, isRule3Valid].filter(Boolean).length;
    const isValid = validRules >= 2;
    
    return {
        isValid,
        rule1: {
            value: rule1,
            isValid: isRule1Valid,
            min: 17,
            max: 18
        },
        rule2: {
            value: rule2,
            isValid: isRule2Valid,
            min: 71,
            max: 74
        },
        rule3: {
            value: rule3,
            isValid: isRule3Valid,
            min: 22,
            max: 25
        },
        validRuleCount: validRules
    };
}

// Fonction pour calculer le nombre optimal de marches et leurs dimensions
function calculateOptimalStair(totalRise, totalRun, preferences) {
    const {
        buildingType,
        stairType,
        stairConfig,
        lShapedConfig,
        dancingStepsConfig,
        spiralConfig,
        idealRiser,
        idealTread,
        priority
    } = preferences;
    
    // Définir les limites selon le CNB 2015
    let minRiser, maxRiser, minTread, maxTread;
    
    if (buildingType === 'part3') {
        // Règles pour les bâtiments régis par la partie 3
        minRiser = 125; // 125 mm
        maxRiser = 180; // 180 mm
        minTread = 280; // 280 mm
        maxTread = Infinity; // pas de limite maximale
        
        // Ajustement pour escalier hélicoïdal
        if (stairConfig === 'spiral') {
            maxRiser = 240; // 240 mm pour escalier hélicoïdal
        }
    } else {
        // Règles pour les bâtiments régis par la partie 9
        if (stairType === 'private') {
            minRiser = 125; // 125 mm
            maxRiser = 200; // 200 mm
            minTread = 255; // 255 mm
            maxTread = 355; // 355 mm
        } else { // common
            minRiser = 125; // 125 mm
            maxRiser = 180; // 180 mm
            minTread = 280; // 280 mm
            maxTread = Infinity; // pas de limite maximale
        }
        
        // Ajustement pour escalier hélicoïdal
        if (stairConfig === 'spiral') {
            maxRiser = 240; // 240 mm pour escalier hélicoïdal
        }
    }
    
    // Règle du pas (2R + G = 630-650mm)
    const minStep = 630;
    const optimalStep = 640;
    const maxStep = 650;
    
    // Ajustement pour les configurations avec marches rayonnantes ou tournantes
    let adjustedTotalRun = totalRun;
    let configurationType = stairConfig;
    
    // Si c'est une volée tournante à 90° (en "L"), vérifier le type de configuration
    if (stairConfig === 'l_shaped' && lShapedConfig) {
        configurationType = lShapedConfig;
    }
    
    // Ajuster la longueur totale en fonction du type de configuration
    if (configurationType === 'two_45deg' || 
        configurationType === 'three_30deg' || 
        stairConfig === 'turning_30' || 
        stairConfig === 'turning_45' || 
        stairConfig === 'turning_60' || 
        stairConfig === 'dancing_steps') {
        
        // Utiliser la valeur idéale du giron comme référence, sinon prendre une valeur par défaut
        const standardTread = (idealTread > 0) ? idealTread : 280; // valeur par défaut
        
        if (configurationType === 'two_45deg' || stairConfig === 'turning_45') {
            // Deux marches rayonnantes à 45° prennent environ 1.5 fois l'espace d'une marche standard
            adjustedTotalRun = totalRun - (0.5 * standardTread);
        } else if (configurationType === 'three_30deg' || stairConfig === 'turning_30') {
            // Trois marches rayonnantes à 30° prennent environ 2.1 fois l'espace de marches standard
            adjustedTotalRun = totalRun - (1.1 * standardTread);
        } else if (stairConfig === 'turning_60') {
            // Volée tournante à 60° (2 marches rayonnantes de 30°)
            adjustedTotalRun = totalRun - (0.6 * standardTread);
        } else if (stairConfig === 'dancing_steps') {
            // Pour les marches dansantes, ajustement approximatif
            adjustedTotalRun = totalRun - (1.0 * standardTread);
        }
    }
    
    // Nombre théorique de marches
    let solutions = [];
    
    // Calculer les possibilités pour différents nombres de contremarches
    // Déterminer plage de recherche pour nombre de contremarches
    const theoreticalRisers = totalRise / ((idealRiser > 0) ? idealRiser : (minRiser + maxRiser) / 2);
    const minRisersToTry = Math.max(3, Math.floor(theoreticalRisers - 3));
    const maxRisersToTry = Math.ceil(theoreticalRisers + 3);
    
    for (let numRisers = minRisersToTry; numRisers <= maxRisersToTry; numRisers++) {
        const riserHeight = totalRise / numRisers;
        
        // Vérifier si la hauteur de contremarche est dans les limites
        if (riserHeight < minRiser || riserHeight > maxRiser) continue;
        
        // Le nombre de girons est toujours égal au nombre de contremarches moins 1
        const numTreads = numRisers - 1;
        
        if (numTreads <= 0) continue;
        
        // Utiliser la longueur ajustée pour les escaliers avec marches rayonnantes
        const treadDepth = adjustedTotalRun / numTreads;
        
        // Vérifier si le giron est dans les limites
        if (treadDepth < minTread || (maxTread !== Infinity && treadDepth > maxTread)) continue;
        
        // Vérifier la règle du pas
        const stepRule = checkStepRule(riserHeight, treadDepth);
        
        // Calculer la valeur du pas (2R + G)
        const stepValue = 2 * riserHeight + treadDepth;
        
        // Calculer l'écart par rapport aux valeurs idéales
        const riserDeviation = idealRiser > 0 ? Math.abs(riserHeight - idealRiser) : 0;
        const treadDeviation = idealTread > 0 ? Math.abs(treadDepth - idealTread) : 0;
        const stepDeviation = Math.abs(stepValue - optimalStep);
        
        // Score global (plus il est bas, meilleure est la solution)
        let score;
        
        if (priority === 'comfort') {
            // Priorité au confort : la règle du pas est plus importante
            score = stepDeviation * 2 + riserDeviation + treadDeviation;
            
            // Bonus si la règle du pas est respectée (au moins 2 des 3 règles)
            if (stepRule.isValid) {
                score *= 0.8; // Réduire le score pour favoriser les solutions conformes à la règle du pas
            }
        } else {
            // Priorité à l'espace : utiliser au mieux l'espace disponible
            score = riserDeviation + treadDeviation * 2;
        }
        
        solutions.push({
            numRisers,
            numTreads,
            riserHeight,
            treadDepth,
            stepValue,
            stepRule,
            score,
            riserDeviation,
            treadDeviation,
            stepDeviation
        });
    }
    
    // Trier les solutions par score (du plus bas au plus élevé)
    solutions.sort((a, b) => a.score - b.score);
    
    // Retourner les 3 meilleures solutions (ou moins s'il y en a moins)
    return solutions.slice(0, 3);
}

// Formatage des nombres avec 1 décimale si nécessaire
function formatNumber(number) {
    return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1);
}

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du formulaire de vérification
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

    // Éléments du calculateur d'escalier
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
    
    // Placeholders pour les systèmes de mesure
    const placeholders = {
        imperial: {
            // Onglet Calcul
            "idealRiser": "Ex: 7″",
            "idealRiserImperial": "Ex: 7″",
            "idealTread": "Ex: 11″",
            "idealTreadImperial": "Ex: 11″",
            "totalRun": "Ex: 15'-2″",
            "totalRunImperial": "Ex: 15'-2″",
            "totalRise": "Ex: 10'-2″",
            "totalRiseImperial": "Ex: 10'-2″",
            "stairDesiredWidth": "Ex: 36″",
            "stairDesiredWidthImperial": "Ex: 36″",
            "calcMinNarrowSide": "Ex: 6″",
            "calcMinNarrowSideImperial": "Ex: 6″",
            "calcSpiralWidth": "Ex: 26″",
            "calcSpiralWidthImperial": "Ex: 26″",
            
            // Onglet Vérification
            "stairWidth": "Ex: 36″",
            "stairWidthImperial": "Ex: 36″",
            "headroom": "Ex: 6'-8″",
            "headroomImperial": "Ex: 6'-8″",
            "riserHeight": "Ex: 7 1/4″",
            "riserHeightImperial": "Ex: 7 1/4″",
            "treadDepth": "Ex: 10 1/4″",
            "treadDepthImperial": "Ex: 10 1/4″",
            "narrowSide": "Ex: 6″",
            "narrowSideImperial": "Ex: 6″",
            "spiralWidth": "Ex: 26″",
            "spiralWidthImperial": "Ex: 26″"
        },
        metrique: {
            // Onglet Calcul
            "idealRiser": "Ex: 180 mm",
            "idealRiserImperial": "Ex: 180 mm",
            "idealTread": "Ex: 280 mm",
            "idealTreadImperial": "Ex: 280 mm",
            "totalRun": "Ex: 4500 mm",
            "totalRunImperial": "Ex: 4500 mm",
            "totalRise": "Ex: 3000 mm",
            "totalRiseImperial": "Ex: 3000 mm",
            "stairDesiredWidth": "Ex: 900 mm",
            "stairDesiredWidthImperial": "Ex: 900 mm",
            "calcMinNarrowSide": "Ex: 150 mm",
            "calcMinNarrowSideImperial": "Ex: 150 mm",
            "calcSpiralWidth": "Ex: 660 mm",
            "calcSpiralWidthImperial": "Ex: 660 mm",
            
            // Onglet Vérification
            "stairWidth": "Ex: 900 mm",
            "stairWidthImperial": "Ex: 900 mm",
            "headroom": "Ex: 2050 mm",
            "headroomImperial": "Ex: 2050 mm",
            "riserHeight": "Ex: 180 mm",
            "riserHeightImperial": "Ex: 180 mm",
            "treadDepth": "Ex: 280 mm",
            "treadDepthImperial": "Ex: 280 mm",
            "narrowSide": "Ex: 150 mm",
            "narrowSideImperial": "Ex: 150 mm",
            "spiralWidth": "Ex: 660 mm",
            "spiralWidthImperial": "Ex: 660 mm"
        }
    };
    
    // Gestion des onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Activer le bouton d'onglet et le contenu correspondant
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Mettre à jour les placeholders pour le nouvel onglet
            updatePlaceholders(tabId);
        });
    });
    
    // Fonction pour mettre à jour les placeholders selon le système de mesure
    function updatePlaceholders(tab) {
        const isCalcTab = tab === 'calculator';
        let systemeElement;
        
        if (isCalcTab) {
            systemeElement = calcMeasurementSystem;
        } else {
            systemeElement = measurementSystem;
        }
        
        const isImperial = systemeElement.value === 'imperial';
        const placeholdersData = isImperial ? placeholders.imperial : placeholders.metrique;
        
        // Mettre à jour tous les placeholders directement par ID
        for (const [id, placeholder] of Object.entries(placeholdersData)) {
            const element = document.getElementById(id);
            if (element) {
                element.placeholder = placeholder;
            }
        }
        
        // Afficher/masquer les champs métriques/impériaux
        const metricInputs = document.querySelectorAll('.metric-input');
        const imperialInputs = document.querySelectorAll('.imperial-input');
        
        metricInputs.forEach(input => {
            input.style.display = isImperial ? 'none' : 'block';
        });
        
        imperialInputs.forEach(input => {
            input.style.display = isImperial ? 'block' : 'none';
        });
    }
    
    // Synchroniser les systèmes de mesure entre les onglets
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
    
    // Gestion du changement de configuration d'escalier pour l'onglet vérification
    stairConfig.addEventListener('change', function() {
        // Masquer d'abord toutes les options conditionnelles
        lShapedOptions.style.display = 'none';
        dancingStepsOptions.style.display = 'none';
        spiralOptions.style.display = 'none';
        
        // Afficher les options appropriées selon la sélection
        if (this.value === 'l_shaped') {
            lShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps') {
            dancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            spiralOptions.style.display = 'block';
        }
    });
    
    // Gestion du changement de configuration d'escalier pour l'onglet calcul
    calcStairConfig.addEventListener('change', function() {
        // Masquer d'abord toutes les options conditionnelles
        calcLShapedOptions.style.display = 'none';
        calcDancingStepsOptions.style.display = 'none';
        calcSpiralOptions.style.display = 'none';
        
        // Afficher les options appropriées selon la sélection
        if (this.value === 'l_shaped') {
            calcLShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps') {
            calcDancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral') {
            calcSpiralOptions.style.display = 'block';
        }
    });
    
    // Ajouter des écouteurs d'événements pour la conversion entre métrique et impérial
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
            // Métrique vers impérial
            pair.metric.addEventListener('input', function() {
                const value = parseFloat(this.value);
                if (!isNaN(value)) {
                    pair.imperial.value = metricToImperial(value);
                }
            });
            
            // Impérial vers métrique
            pair.imperial.addEventListener('input', function() {
                const value = imperialToMetric(validateImperialInput(this.value));
                if (value !== null) {
                    pair.metric.value = value;
                }
            });
        }
    });

    // Gestion du changement de type de bâtiment et d'usage
    buildingType.addEventListener('change', updateRequirements);
    buildingUse.addEventListener('change', updateRequirements);
    stairType.addEventListener('change', updateRequirements);
    stairUse.addEventListener('change', updateRequirements);

    function updateRequirements() {
        // Cette fonction sera utilisée pour ajuster les exigences en fonction
        // du type de bâtiment et de l'usage sélectionnés
        const isBuildingPart3 = buildingType.value === 'part3';
        const isExitStair = stairUse.value === 'exit';
        
        // Ajustement des champs en fonction du type de bâtiment et de l'usage
        if (isBuildingPart3) {
            // Afficher un message ou ajuster des valeurs pour la partie 3
            // Pour l'instant, nous nous concentrons sur la partie 9
        }
        
        if (isExitStair) {
            // Ajuster les exigences pour les escaliers d'issue
        }
    }

    // Vérification de la conformité
    checkButton.addEventListener('click', function() {
        // Réinitialiser les messages d'erreur
        document.querySelectorAll('.error').forEach(el => el.textContent = '');
        
        // Récupérer les valeurs du formulaire
        const isMetric = measurementSystem.value === 'metric';
        const isBuildingPart3 = buildingType.value === 'part3';
        const buildingUseValue = buildingUse.value;
        const type = stairType.value;
        const stairUseValue = stairUse.value;
        const config = stairConfig.value;
        const lShapedConfigValue = lShapedConfig ? lShapedConfig.value : 'standard_landing';
        const dancingStepsConfigValue = dancingStepsConfig ? dancingStepsConfig.value : 'standard';
        const spiralConfigValue = spiralConfig ? spiralConfig.value : 'secondary';
        
        // Conversion des valeurs en métrique si nécessaire
        let riserHeightValue, treadDepthValue, narrowSideValue, stairWidthValue, headroomValue, spiralWidthValue;
        
        if (isMetric) {
            riserHeightValue = parseFloat(riserHeight.value);
            treadDepthValue = parseFloat(treadDepth.value);
            narrowSideValue = parseFloat(narrowSide.value);
            stairWidthValue = parseFloat(stairWidth.value);
            headroomValue = parseFloat(headroom.value);
            spiralWidthValue = parseFloat(spiralWidth.value);
        } else {
            riserHeightValue = imperialToMetric(validateImperialInput(riserHeightImperial.value));
            treadDepthValue = imperialToMetric(validateImperialInput(treadDepthImperial.value));
            narrowSideValue = imperialToMetric(validateImperialInput(narrowSideImperial.value));
            stairWidthValue = imperialToMetric(validateImperialInput(stairWidthImperial.value));
            headroomValue = imperialToMetric(validateImperialInput(headroomImperial.value));
            spiralWidthValue = imperialToMetric(validateImperialInput(spiralWidthImperial.value));
        }
        
        // Validation des entrées
        let isValid = true;
        
        if (isNaN(riserHeightValue) || riserHeightValue <= 0) {
            document.getElementById('riserHeightError').textContent = 'Veuillez entrer une valeur numérique valide pour la hauteur de contremarche.';
            isValid = false;
        }
        
        if (isNaN(treadDepthValue) || treadDepthValue <= 0) {
            document.getElementById('treadDepthError').textContent = 'Veuillez entrer une valeur numérique valide pour le giron.';
            isValid = false;
        }
        
        if (config === 'dancing_steps' && (isNaN(narrowSideValue) || narrowSideValue <= 0)) {
            document.getElementById('narrowSideError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur minimale côté étroit.';
            isValid = false;
        }
        
        if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
            document.getElementById('stairWidthError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur de l\'escalier.';
            isValid = false;
        }
        
        if (isNaN(headroomValue) || headroomValue <= 0) {
            document.getElementById('headroomError').textContent = 'Veuillez entrer une valeur numérique valide pour la hauteur libre.';
            isValid = false;
        }
        
        if (config === 'spiral' && (isNaN(spiralWidthValue) || spiralWidthValue <= 0)) {
            document.getElementById('spiralWidthError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur libre entre mains courantes.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Définir les limites selon le CNB 2015
        let minRiser, maxRiser, minTread, maxTread, minNarrowSide, minWidth, minHeadroom, minSpiralWidth;
        let codeReference = 'CNB 2015'; // Référence par défaut
        
        if (isBuildingPart3) {
            // Règles pour les bâtiments régis par la partie 3
            codeReference = 'CNB 2015 Partie 3';
            
            // Hauteur de contremarche (3.4.6.8)
            minRiser = 125; // 125 mm
            maxRiser = 180; // 180 mm
            
            // Giron (3.4.6.8)
            minTread = 280; // 280 mm
            maxTread = Infinity; // pas de limite maximale
            
            // Largeur minimale côté étroit (3.4.6.9)
            if (config === 'dancing_steps') {
                if (dancingStepsConfigValue === 'exit') {
                    minNarrowSide = 240; // 240 mm pour une issue
                } else {
                    minNarrowSide = 150; // 150 mm standard
                }
            }
            
            // Largeur de l'escalier (3.4.3.2)
            minWidth = 1100; // 1100 mm pour une issue standard
            
            // Hauteur libre (3.4.3.4)
            minHeadroom = 2050; // 2050 mm
            
            // Largeur libre entre mains courantes (escalier hélicoïdal)
            if (config === 'spiral') {
                minSpiralWidth = 660; // 660 mm
                maxRiser = 240; // 240 mm pour escalier hélicoïdal
            }
        } else {
            // Règles pour les bâtiments régis par la partie 9
            codeReference = 'CNB 2015 Partie 9';
            
            // Hauteur de contremarche (9.8.4.1)
            if (type === 'private') {
                minRiser = 125; // 125 mm
                maxRiser = 200; // 200 mm
            } else { // common
                minRiser = 125; // 125 mm
                maxRiser = 180; // 180 mm
            }
            
            // Giron (9.8.4.2)
            if (type === 'private') {
                minTread = 255; // 255 mm
                maxTread = 355; // 355 mm
            } else { // common
                minTread = 280; // 280 mm
                maxTread = Infinity; // pas de limite maximale
            }
            
            // Largeur minimale côté étroit (9.8.4.3 ou 9.8.4.6 pour marches rayonnantes)
            if (config === 'dancing_steps') {
                if (type === 'private') {
                    minNarrowSide = 150; // 150 mm (9.8.4.3)
                } else if (dancingStepsConfigValue === 'exit') {
                    minNarrowSide = 240; // 240 mm pour une issue
                } else {
                    minNarrowSide = 150; // 150 mm standard
                }
            }
            
            // Largeur de l'escalier (9.8.2.1)
            if (type === 'private') {
                minWidth = 860; // 860 mm
            } else { // common
                minWidth = 900; // 900 mm
            }
            
            // Hauteur libre (9.8.2.2)
            if (type === 'private') {
                minHeadroom = 1950; // 1950 mm
            } else { // common
                minHeadroom = 2050; // 2050 mm
            }
            
            // Largeur libre entre mains courantes (escalier hélicoïdal) (9.8.4.7)
            if (config === 'spiral') {
                minSpiralWidth = 660; // 660 mm
                maxRiser = 240; // 240 mm pour escalier hélicoïdal
            }
        }
        
        // Ajustement supplémentaire pour les escaliers d'issue
        if (stairUseValue === 'exit') {
            if (isBuildingPart3) {
                // Ajustements spécifiques aux issues de la partie 3
                minWidth = 1100; // 1100 mm minimum pour une issue
                
                if (config === 'dancing_steps') {
                    minNarrowSide = 240; // 240 mm pour une issue
                }
            } else {
                // Ajustements spécifiques aux issues de la partie 9
                minWidth = 900; // 900 mm minimum pour une issue dans la partie 9
            }
        }
        
        // Vérifier la conformité
        let issues = [];
        let isCompliant = true;
        
        // Vérification de la hauteur de contremarche
        if (riserHeightValue < minRiser) {
            issues.push(`La hauteur de contremarche (${riserHeightValue} mm) est inférieure au minimum requis (${minRiser} mm).`);
            isCompliant = false;
        } else if (riserHeightValue > maxRiser) {
            issues.push(`La hauteur de contremarche (${riserHeightValue} mm) dépasse le maximum autorisé (${maxRiser} mm).`);
            isCompliant = false;
        }
        
        // Vérification du giron
        if (treadDepthValue < minTread) {
            issues.push(`Le giron (${treadDepthValue} mm) est inférieur au minimum requis (${minTread} mm).`);
            isCompliant = false;
        } else if (treadDepthValue > maxTread && maxTread !== Infinity) {
            issues.push(`Le giron (${treadDepthValue} mm) dépasse le maximum autorisé (${maxTread} mm).`);
            isCompliant = false;
        }
        
        // Vérification de la règle du pas
        const stepRule = checkStepRule(riserHeightValue, treadDepthValue);
        if (!stepRule.isValid) {
            let stepsIssue = "La règle du pas n'est pas respectée (moins de 2 des 3 règles sont satisfaites) :";
            
            // Détailler les règles du pas qui ne sont pas respectées
            if (!stepRule.rule1.isValid) {
                stepsIssue += `<br>- Règle 1 : Giron + CM = ${stepRule.rule1.value.toFixed(2)}" (devrait être entre ${stepRule.rule1.min}" et ${stepRule.rule1.max}")`;
            }
            if (!stepRule.rule2.isValid) {
                stepsIssue += `<br>- Règle 2 : Giron × CM = ${stepRule.rule2.value.toFixed(2)} po² (devrait être entre ${stepRule.rule2.min} po² et ${stepRule.rule2.max} po²)`;
            }
            if (!stepRule.rule3.isValid) {
                stepsIssue += `<br>- Règle 3 : Giron + 2(CM) = ${stepRule.rule3.value.toFixed(2)}" (devrait être entre ${stepRule.rule3.min}" et ${stepRule.rule3.max}")`;
            }
            
            issues.push(stepsIssue);
            // Ne pas marquer comme non conforme car c'est juste une recommandation
        }
        
        // Vérification de la largeur minimale côté étroit (pour escalier avec marches dansantes)
        if (config === 'dancing_steps' && narrowSideValue < minNarrowSide) {
            const narrowSideImperialValue = metricToImperial(narrowSideValue);
            issues.push(`La largeur minimale côté étroit ${narrowSideImperialValue} (${narrowSideValue.toFixed(2)} mm) est inférieure au minimum requis (${minNarrowSide} mm) selon le ${codeReference}.`);
            isCompliant = false;
        }
        
        // Vérification de la largeur de l'escalier
        if (stairWidthValue < minWidth) {
            issues.push(`La largeur de l'escalier (${stairWidthValue} mm) est inférieure au minimum requis (${minWidth} mm).`);
            isCompliant = false;
        }
        
        // Vérification de la hauteur libre
        if (headroomValue < minHeadroom) {
            issues.push(`La hauteur libre (${headroomValue} mm) est inférieure au minimum requis (${minHeadroom} mm).`);
            isCompliant = false;
        }
        
        // Vérification de la largeur libre entre mains courantes (pour escalier hélicoïdal)
        if (config === 'spiral' && spiralWidthValue < minSpiralWidth) {
            issues.push(`La largeur libre entre mains courantes (${spiralWidthValue} mm) est inférieure au minimum requis (${minSpiralWidth} mm).`);
            isCompliant = false;
        }
        
        // Vérification spécifique pour les escaliers hélicoïdaux servant d'issue
        if (config === 'spiral' && stairUseValue === 'exit') {
            issues.push(`Les escaliers hélicoïdaux ne doivent pas être utilisés comme issues (CNB 2015 9.8.4.7).`);
            isCompliant = false;
        }
        
        // Vérification pour escalier hélicoïdal comme seul moyen d'évacuation pour plus de 3 personnes
        if (config === 'spiral' && spiralConfigValue === 'primary' && type === 'common') {
            issues.push(`Un escalier hélicoïdal ne peut servir de seul moyen d'évacuation que s'il ne dessert pas plus de 3 personnes (CNB 2015 9.8.4.7).`);
            isCompliant = false;
        }
        
        // Afficher le résultat
        resultContent.innerHTML = '';
        result.className = 'result';
        
        if (isCompliant) {
            result.classList.add('compliant');
            resultContent.innerHTML = `<p class="success">✓ Conforme au ${codeReference}.</p>`;
            
            // Si la conformité est vérifiée mais que la règle du pas n'est pas respectée
            if (!stepRule.isValid) {
                let stepRuleInfo = `
                <div class="warning">
                    <p>⚠ Note: La règle du pas n'est pas entièrement respectée (${stepRule.validRuleCount}/3 règles satisfaites). Pour un confort optimal, il est recommandé de respecter au moins 2 des 3 règles suivantes :</p>
                    <ul>
                        <li>Règle 1: Giron + CM = 17" à 18" (actuel: ${stepRule.rule1.value.toFixed(2)}")</li>
                        <li>Règle 2: Giron × CM = 71 po² à 74 po² (actuel: ${stepRule.rule2.value.toFixed(2)} po²)</li>
                        <li>Règle 3: Giron + 2(CM) = 22" à 25" (actuel: ${stepRule.rule3.value.toFixed(2)}")</li>
                    </ul>
                </div>
                `;
                resultContent.innerHTML += stepRuleInfo;
            } else {
                // Indiquer quelles règles du pas sont respectées
                let stepRuleInfo = `
                <div class="result-section">
                    <p>✓ La règle du pas est respectée (${stepRule.validRuleCount}/3 règles satisfaites) :</p>
                    <ul>
                        <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = 17" à 18" (actuel: ${stepRule.rule1.value.toFixed(2)}")</li>
                        <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = 71 po² à 74 po² (actuel: ${stepRule.rule2.value.toFixed(2)} po²)</li>
                        <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = 22" à 25" (actuel: ${stepRule.rule3.value.toFixed(2)}")</li>
                    </ul>
                </div>
                `;
                resultContent.innerHTML += stepRuleInfo;
            }
        } else {
            result.classList.add('non-compliant');
            let issuesList = `<p>⚠ Non conforme au ${codeReference}.</p><p>Problèmes détectés:</p><ul>`;
            issues.forEach(issue => {
                let formattedIssue = issue;
                if (!isMetric) {
                    // Convertir les valeurs métriques en impériales pour l'affichage
                    formattedIssue = issue.replace(/(\d+(?:\.\d+)?) mm/g, function(match, p1) {
                        return metricToImperial(parseFloat(p1)) + ' (' + parseFloat(p1).toFixed(2) + ' mm)';
                    });
                }
                issuesList += `<li>${formattedIssue}</li>`;
            });
            issuesList += '</ul>';
            resultContent.innerHTML = issuesList;
        }
        
        result.style.display = 'block';
    });
    
    // Calcul d'escalier
    calculateButton.addEventListener('click', function() {
        // Réinitialiser les messages d'erreur
        document.querySelectorAll('#calculator .error').forEach(el => el.textContent = '');
        
        // Récupérer les valeurs du formulaire
        const isMetric = calcMeasurementSystem.value === 'metric';
        const buildingTypeValue = calcBuildingType.value;
        const stairTypeValue = calcStairType.value;
        const stairConfigValue = calcStairConfig.value;
        const lShapedConfigValue = calcLShapedConfig ? calcLShapedConfig.value : null;
        const dancingStepsConfigValue = calcDancingStepsConfig ? calcDancingStepsConfig.value : null;
        const spiralConfigValue = calcSpiralConfig ? calcSpiralConfig.value : null;
        
        // Conversion des valeurs en métrique si nécessaire
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
        
        // Validation des entrées
        let isValid = true;
        
        if (isNaN(totalRunValue) || totalRunValue <= 0) {
            document.getElementById('totalRunError').textContent = 'Veuillez entrer une valeur numérique valide pour la longueur totale.';
            isValid = false;
        }
        
        if (isNaN(totalRiseValue) || totalRiseValue <= 0) {
            document.getElementById('totalRiseError').textContent = 'Veuillez entrer une valeur numérique valide pour la hauteur totale.';
            isValid = false;
        }
        
        if (isNaN(stairWidthValue) || stairWidthValue <= 0) {
            document.getElementById('stairDesiredWidthError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur souhaitée.';
            isValid = false;
        }
        
        // Validation spécifique pour les marches dansantes
        if (stairConfigValue === 'dancing_steps' && (isNaN(minNarrowSideValue) || minNarrowSideValue <= 0)) {
            document.getElementById('calcMinNarrowSideError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur minimale côté étroit.';
            isValid = false;
        }
        
        // Validation spécifique pour les escaliers hélicoïdaux
        if (stairConfigValue === 'spiral' && (isNaN(spiralWidthValue) || spiralWidthValue <= 0)) {
            document.getElementById('calcSpiralWidthError').textContent = 'Veuillez entrer une valeur numérique valide pour la largeur libre entre mains courantes.';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Calculer les solutions optimales
        const preferences = {
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            lShapedConfig: lShapedConfigValue,
            dancingStepsConfig: dancingStepsConfigValue,
            spiralConfig: spiralConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priorityComfort.checked ? 'comfort' : 'space'
        };
        
        const solutions = calculateOptimalStair(totalRiseValue, totalRunValue, preferences);
        
        // Définir les limites selon le CNB 2015 pour vérification
        let minRiser, maxRiser, minTread, maxTread, minWidth, minNarrowSide, minSpiralWidth;
        let codeReference = 'CNB 2015';
        
        if (buildingTypeValue === 'part3') {
            codeReference = 'CNB 2015 Partie 3';
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = Infinity;
            minWidth = 1100;
            minNarrowSide = 240; // Pour marches dansantes dans une issue
            minSpiralWidth = 660; // Pour escalier hélicoïdal
            
            if (stairConfigValue === 'spiral') {
                maxRiser = 240;
            }
        } else {
            codeReference = 'CNB 2015 Partie 9';
            
            if (stairTypeValue === 'private') {
                minRiser = 125;
                maxRiser = 200;
                minTread = 255;
                maxTread = 355;
                minWidth = 860;
                minNarrowSide = 150; // Pour marches dansantes privées
            } else {
                minRiser = 125;
                maxRiser = 180;
                minTread = 280;
                maxTread = Infinity;
                minWidth = 900;
                minNarrowSide = dancingStepsConfigValue === 'exit' ? 240 : 150; // Selon le type de marches dansantes
            }
            
            minSpiralWidth = 660; // Pour escalier hélicoïdal
            
            if (stairConfigValue === 'spiral') {
                maxRiser = 240;
            }
        }
        
        // Vérifier la largeur de l'escalier
        const isWidthCompliant = stairWidthValue >= minWidth;
        
        // Vérifications spécifiques selon le type d'escalier
        let specificWarnings = '';
        
        if (stairConfigValue === 'spiral') {
            const isSpiralWidthCompliant = spiralWidthValue >= minSpiralWidth;
            
            if (!isSpiralWidthCompliant) {
                let spiralWidthDisplay = isMetric ? 
                    `${formatNumber(spiralWidthValue)} mm` : 
                    metricToImperial(spiralWidthValue);
                
                let minSpiralWidthDisplay = isMetric ? 
                    `${minSpiralWidth} mm` : 
                    metricToImperial(minSpiralWidth);
                
                specificWarnings += `
                    <div class="warning">
                        <p>⚠ La largeur libre entre mains courantes (${spiralWidthDisplay}) est inférieure au minimum requis (${minSpiralWidthDisplay}) selon le ${codeReference}.</p>
                    </div>
                `;
            }
            
            if (spiralConfigValue === 'primary' && stairTypeValue === 'common') {
                specificWarnings += `
                    <div class="warning">
                        <p>⚠ Un escalier hélicoïdal ne peut servir de seul moyen d'évacuation que s'il ne dessert pas plus de 3 personnes (CNB 2015 9.8.4.7).</p>
                    </div>
                `;
            }
        } else if (stairConfigValue === 'dancing_steps') {
            const isNarrowSideCompliant = minNarrowSideValue >= minNarrowSide;
            
            if (!isNarrowSideCompliant) {
                let narrowSideDisplay = isMetric ? 
                    `${formatNumber(minNarrowSideValue)} mm` : 
                    metricToImperial(minNarrowSideValue);
                
                let minNarrowSideDisplay = isMetric ? 
                    `${minNarrowSide} mm` : 
                    metricToImperial(minNarrowSide);
                
                specificWarnings += `
                    <div class="warning">
                        <p>⚠ La largeur minimale côté étroit ${narrowSideDisplay} (${minNarrowSideValue.toFixed(2)} mm) est inférieure au minimum requis (${minNarrowSide} mm) selon le ${codeReference}.</p>
                    </div>
                `;
            }
        }
        
        // Préparer l'affichage des résultats
        calculatorResultContent.innerHTML = '';
        
        if (solutions.length === 0) {
            calculatorResult.className = 'result non-compliant';
            calculatorResultContent.innerHTML = `
                <p>⚠ Aucune solution conforme n'a été trouvée avec les dimensions spécifiées.</p>
                <p>Recommandations :</p>
                <ul>
                    <li>Augmentez la longueur horizontale disponible</li>
                    <li>Envisagez une configuration différente d'escalier</li>
                    <li>Consultez un professionnel pour une solution sur mesure</li>
                </ul>
            `;
        } else {
            calculatorResult.className = 'result compliant';
            
            // Vérification de la largeur
            let widthWarning = '';
            if (!isWidthCompliant) {
                let widthValueDisplay = isMetric ? 
                    `${formatNumber(stairWidthValue)} mm` : 
                    metricToImperial(stairWidthValue);
                
                let minWidthDisplay = isMetric ? 
                    `${minWidth} mm` : 
                    metricToImperial(minWidth);
                
                widthWarning = `
                    <div class="warning">
                        <p>⚠ La largeur spécifiée (${widthValueDisplay}) est inférieure au minimum requis (${minWidthDisplay}) selon le ${codeReference}.</p>
                    </div>
                `;
            }
            
            // Afficher une explication de la règle du pas
            const stepRuleIdealImperial = "17-18 pouces";
            const stepRuleIdealMetric = "432-457 mm";
            const stepRuleSquareIdealImperial = "71-74 po²";
            const stepRuleSquareIdealMetric = "45800-47700 mm²";
            const stepRule2RGIdealImperial = "22-25 pouces";
            const stepRule2RGIdealMetric = "559-635 mm";
            
            const stepRuleIdeal = isMetric ? stepRuleIdealMetric : stepRuleIdealImperial;
            const stepRuleSquareIdeal = isMetric ? stepRuleSquareIdealMetric : stepRuleSquareIdealImperial;
            const stepRule2RGIdeal = isMetric ? stepRule2RGIdealMetric : stepRule2RGIdealImperial;
            
            const explanationSection = `
                <div class="result-section">
                    <h3>Règle du pas</h3>
                    <p>Les critères de confort pour un escalier sont vérifiés lorsqu'au moins 2 des 3 règles suivantes sont respectées :</p>
                    <ol>
                        <li>Giron + CM = 17" à 18" (${isMetric ? "432-457 mm" : "17-18 pouces"})</li>
                        <li>Giron × CM = 71 po² à 74 po² (${isMetric ? "45800-47700 mm²" : "71-74 po²"})</li>
                        <li>Giron + 2(CM) = 22" à 25" (${isMetric ? "559-635 mm" : "22-25 pouces"})</li>
                    </ol>
                    <p>Ces formules correspondent au pas moyen d'un adulte et assurent un confort optimal lors de l'utilisation de l'escalier.</p>
                </div>
            `;

            // Afficher les solutions
            let solutionsHtml = `
                <div class="result-section">
                    <h3>Meilleures configurations</h3>
                    <table class="result-table">
                        <thead>
                            <tr>
                                <th>Solution</th>
                                <th>Contremarches</th>
                                <th>Hauteur contremarche</th>
                                <th>Giron</th>
                                <th>Règles du pas respectées</th>
                                <th>Longueur totale</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            solutions.forEach((solution, index) => {
                const isOptimal = index === 0;
                const className = isOptimal ? 'optimal-solution' : '';
                
                let riserHeightDisplay, treadDepthDisplay, stepRuleDisplay, actualTotalRunDisplay;
                
                if (isMetric) {
                    riserHeightDisplay = formatNumber(solution.riserHeight) + ' mm';
                    treadDepthDisplay = formatNumber(solution.treadDepth) + ' mm';
                    actualTotalRunDisplay = formatNumber(solution.treadDepth * solution.numTreads) + ' mm';
                } else {
                    riserHeightDisplay = metricToImperial(solution.riserHeight);
                    treadDepthDisplay = metricToImperial(solution.treadDepth);
                    actualTotalRunDisplay = metricToImperial(solution.treadDepth * solution.numTreads);
                }
                
                // Nombre de règles respectées pour la règle du pas
                const validRules = solution.stepRule.validRuleCount;
                const isStepRuleValid = solution.stepRule.isValid;
                stepRuleDisplay = `${validRules}/3 ${isStepRuleValid ? "✓" : "⨯"}`;
                
                solutionsHtml += `
                    <tr class="${className}">
                        <td>${isOptimal ? '✓ Optimale' : 'Alternative ' + index}</td>
                        <td>${solution.numRisers}</td>
                        <td>${riserHeightDisplay}</td>
                        <td>${treadDepthDisplay}</td>
                        <td>${stepRuleDisplay}</td>
                        <td>${actualTotalRunDisplay}</td>
                    </tr>
                `;
            });
            
            solutionsHtml += `
                        </tbody>
                    </table>
                </div>
            `;
            
            // Afficher les détails de la meilleure solution
            const bestSolution = solutions[0];
            let detailsHtml = '';
            
            if (bestSolution) {
                const totalRiseCalculation = bestSolution.riserHeight * bestSolution.numRisers;
                const totalRunCalculation = bestSolution.treadDepth * bestSolution.numTreads;
                
                let formatRiserHeight, formatTreadDepth, formatTotalRise, formatTotalRun, formatStairWidth;
                
                if (isMetric) {
                    formatRiserHeight = formatNumber(bestSolution.riserHeight) + ' mm';
                    formatTreadDepth = formatNumber(bestSolution.treadDepth) + ' mm';
                    formatTotalRise = formatNumber(totalRiseCalculation) + ' mm';
                    formatTotalRun = formatNumber(totalRunCalculation) + ' mm';
                    formatStairWidth = formatNumber(stairWidthValue) + ' mm';
                } else {
                    formatRiserHeight = metricToImperial(bestSolution.riserHeight);
                    formatTreadDepth = metricToImperial(bestSolution.treadDepth);
                    formatTotalRise = metricToImperial(totalRiseCalculation);
                    formatTotalRun = metricToImperial(totalRunCalculation);
                    formatStairWidth = metricToImperial(stairWidthValue);
                }
                
                // Informations sur les règles du pas pour la meilleure solution
                let stepRuleDetails = `
                    <div class="result-section">
                        <h4>Vérification de la règle du pas (solution optimale)</h4>
                        <ul>
                            <li>${bestSolution.stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = ${bestSolution.stepRule.rule1.value.toFixed(2)}" (idéal: ${bestSolution.stepRule.rule1.min}"-${bestSolution.stepRule.rule1.max}")</li>
                            <li>${bestSolution.stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = ${bestSolution.stepRule.rule2.value.toFixed(2)} po² (idéal: ${bestSolution.stepRule.rule2.min}-${bestSolution.stepRule.rule2.max} po²)</li>
                            <li>${bestSolution.stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = ${bestSolution.stepRule.rule3.value.toFixed(2)}" (idéal: ${bestSolution.stepRule.rule3.min}"-${bestSolution.stepRule.rule3.max}")</li>
                        </ul>
                        <p>${bestSolution.stepRule.isValid ? "✓ Cette solution respecte les critères de confort (au moins 2 des 3 règles sont satisfaites)." : "⚠ Cette solution ne respecte pas pleinement les critères de confort (moins de 2 règles satisfaites)."}</p>
                    </div>
                `;
                
                detailsHtml = `
                    <div class="result-section">
                        <h3>Détails de la solution optimale</h3>
                        <ul>
                            <li>Nombre de contremarches: ${bestSolution.numRisers}</li>
                            <li>Nombre de marches: ${bestSolution.numTreads}</li>
                            <li>Hauteur de contremarche: ${formatRiserHeight}</li>
                            <li>Profondeur du giron: ${formatTreadDepth}</li>
                            <li>Hauteur totale: ${formatTotalRise}</li>
                            <li>Longueur totale: ${formatTotalRun}</li>
                            <li>Largeur recommandée: ${formatStairWidth} ${isWidthCompliant ? '' : '⚠'}</li>
                        </ul>
                    </div>
                    ${stepRuleDetails}
                `;
            }
            
            // Ajouter des notes spécifiques selon le type d'escalier
            let configNotes = '';
            
            if (stairConfigValue === 'spiral') {
                configNotes = `
                    <div class="result-section">
                        <h3>Notes sur l'escalier hélicoïdal</h3>
                        <ul>
                            <li>Les escaliers hélicoïdaux ne doivent pas être utilisés comme issues (CNB 9.8.4.7).</li>
                            <li>Un escalier hélicoïdal ne peut servir de seul moyen d'évacuation que s'il ne dessert pas plus de 3 personnes.</li>
                            <li>La largeur libre minimale entre mains courantes doit être de 660 mm.</li>
                            <li>Le giron minimal doit être de 190 mm à 300 mm de l'axe de la main courante du côté étroit.</li>
                        </ul>
                    </div>
                `;
            } else if (stairConfigValue === 'dancing_steps') {
                configNotes = `
                    <div class="result-section">
                        <h3>Notes sur les marches dansantes</h3>
                        <ul>
                            <li>Toutes les marches dansantes d'une même volée doivent avoir un angle constant.</li>
                            <li>Le giron minimal mesuré à 300 mm de l'axe de la main courante doit être ${isMetric ? (minNarrowSide + ' mm') : metricToImperial(minNarrowSide)}.</li>
                            <li>La hauteur et le giron doivent être uniformes lorsqu'ils sont mesurés à 300 mm de l'axe de la main courante.</li>
                            <li>Toutes les marches dansantes d'une même volée doivent tourner dans la même direction.</li>
                        </ul>
                    </div>
                `;
            } else if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'two_45deg') {
                configNotes = `
                    <div class="result-section">
                        <h3>Notes sur les marches rayonnantes</h3>
                        <ul>
                            <li>Une seule série de marches rayonnantes est autorisée entre deux planchers.</li>
                            <li>Les marches rayonnantes à 45° doivent avoir un angle de rotation de 45° exactement.</li>
                            <li>Ces marches doivent être uniformes dans leur dimension.</li>
                        </ul>
                    </div>
                `;
            } else if (stairConfigValue === 'l_shaped' && lShapedConfigValue === 'three_30deg') {
                configNotes = `
                    <div class="result-section">
                        <h3>Notes sur les marches rayonnantes</h3>
                        <ul>
                            <li>Une seule série de marches rayonnantes est autorisée entre deux planchers.</li>
                            <li>Les marches rayonnantes à 30° doivent avoir un angle de rotation de 30° exactement.</li>
                            <li>Ces marches doivent être uniformes dans leur dimension.</li>
                        </ul>
                    </div>
                `;
            }
            
            // Assembler le résultat final
            calculatorResultContent.innerHTML = `
                <p class="success">✓ Solution conforme au ${codeReference} trouvée.</p>
                ${widthWarning}
                ${specificWarnings}
                ${explanationSection}
                ${solutionsHtml}
                ${detailsHtml}
                ${configNotes}
                <div class="result-section">
                    <h3>Notes importantes</h3>
                    <ul>
                        <li>Ces calculs sont indicatifs et doivent être vérifiés par un professionnel.</li>
                        <li>Les dimensions finales peuvent nécessiter des ajustements selon les matériaux utilisés.</li>
                        <li>La hauteur et la profondeur des marches doivent être uniformes dans une même volée.</li>
                        <li>N'oubliez pas les exigences concernant les mains courantes et garde-corps.</li>
                    </ul>
                </div>
            `;
        }
        
        calculatorResult.style.display = 'block';
    });
    
    // Initialiser l'affichage en fonction des sélections initiales
    stairConfig.dispatchEvent(new Event('change'));
    calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
});
