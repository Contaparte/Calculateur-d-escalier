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

// Fonction pour calculer le nombre optimal de marches et leurs dimensions
function calculateOptimalStair(totalRise, totalRun, preferences) {
    const {
        buildingType,
        stairType,
        stairConfig,
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
        
        const treadDepth = totalRun / numTreads;
        
        // Vérifier si le giron est dans les limites
        if (treadDepth < minTread || (maxTread !== Infinity && treadDepth > maxTread)) continue;
        
        // Calculer la valeur du pas (2R + G)
        const stepValue = 2 * riserHeight + treadDepth;
        
        // Vérifier si la règle du pas est respectée
        const isStepRuleCompliant = (stepValue >= minStep && stepValue <= maxStep);
        
        // Calculer l'écart par rapport aux valeurs idéales
        const riserDeviation = idealRiser > 0 ? Math.abs(riserHeight - idealRiser) : 0;
        const treadDeviation = idealTread > 0 ? Math.abs(treadDepth - idealTread) : 0;
        const stepDeviation = Math.abs(stepValue - optimalStep);
        
        // Score global (plus il est bas, meilleure est la solution)
        let score;
        
        if (priority === 'comfort') {
            // Priorité au confort : la règle du pas est plus importante
            score = stepDeviation * 2 + riserDeviation + treadDeviation;
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
            isStepRuleCompliant,
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

document.addEventListener('DOMContentLoaded', function() {
    // Éléments du formulaire
    const measurementSystem = document.getElementById('measurementSystem');
    const buildingType = document.getElementById('buildingType');
    const buildingUse = document.getElementById('buildingUse');
    const stairType = document.getElementById('stairType');
    const stairUse = document.getElementById('stairUse');
    const stairConfig = document.getElementById('stairConfig');
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
    const minimumWidthTurningStair = document.getElementById('minimumWidthTurningStair');
    const spiralWidthField = document.getElementById('spiralWidthField');

    // Éléments du calculateur d'escalier
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const calcMeasurementSystem = document.getElementById('calcMeasurementSystem');
    const calcBuildingType = document.getElementById('calcBuildingType');
    const calcStairType = document.getElementById('calcStairType');
    const calcStairConfig = document.getElementById('calcStairConfig');
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
    
    // Gestion des onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Activer le bouton d'onglet et le contenu correspondant
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Synchroniser les systèmes de mesure entre les onglets
    measurementSystem.addEventListener('change', function() {
        calcMeasurementSystem.value = this.value;
        updateMeasurementDisplay(calcMeasurementSystem);
    });
    
    calcMeasurementSystem.addEventListener('change', function() {
        measurementSystem.value = this.value;
        updateMeasurementDisplay(measurementSystem);
    });
    
    function updateMeasurementDisplay(selectElement) {
        const isImperial = selectElement.value === 'imperial';
        const selector = selectElement.id === 'measurementSystem' ? '' : 'calc';
        
        const metricInputs = document.querySelectorAll(`.${selector === '' ? '' : selector + ' '}` + '.metric-input');
        const imperialInputs = document.querySelectorAll(`.${selector === '' ? '' : selector + ' '}` + '.imperial-input');
        
        if (isImperial) {
            metricInputs.forEach(input => input.style.display = 'none');
            imperialInputs.forEach(input => input.style.display = 'block');
        } else {
            metricInputs.forEach(input => input.style.display = 'block');
            imperialInputs.forEach(input => input.style.display = 'none');
        }
    }
    
    // Ajouter des écouteurs d'événements pour la conversion entre métrique et impérial
    const metricInputPairs = [
        { metric: totalRun, imperial: totalRunImperial },
        { metric: totalRise, imperial: totalRiseImperial },
        { metric: stairDesiredWidth, imperial: stairDesiredWidthImperial },
        { metric: idealRiser, imperial: idealRiserImperial },
        { metric: idealTread, imperial: idealTreadImperial }
    ];
    
    metricInputPairs.forEach(pair => {
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
    });

    // Gestion du changement de configuration d'escalier
    stairConfig.addEventListener('change', function() {
        if (this.value === 'turning') {
            minimumWidthTurningStair.style.display = 'block';
            spiralWidthField.style.display = 'none';
        } else if (this.value === 'spiral') {
            minimumWidthTurningStair.style.display = 'none';
            spiralWidthField.style.display = 'block';
        } else {
            minimumWidthTurningStair.style.display = 'none';
            spiralWidthField.style.display = 'none';
        }
    });

    // Gestion du changement de système de mesure
    measurementSystem.addEventListener('change', function() {
        const metricInputs = document.querySelectorAll('.metric-input');
        const imperialInputs = document.querySelectorAll('.imperial-input');
        
        if (this.value === 'imperial') {
            metricInputs.forEach(input => input.style.display = 'none');
            imperialInputs.forEach(input => input.style.display = 'block');
        } else {
            metricInputs.forEach(input => input.style.display = 'block');
            imperialInputs.forEach(input => input.style.display = 'none');
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
        
        if (config === 'turning' && (isNaN(narrowSideValue) || narrowSideValue <= 0)) {
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
            if (config === 'turning') {
                minNarrowSide = 240; // 240 mm pour une issue
            }
            
            // Largeur de l'escalier (3.4.3.2)
            minWidth = 1100; // 1100 mm pour une issue standard
            
            // Hauteur libre (3.4.3.4)
            minHeadroom = 2050; // 2050 mm
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
            
            // Largeur minimale côté étroit (9.8.4.3)
            if (config === 'turning') {
                minNarrowSide = 150; // 150 mm
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
                
                if (config === 'turning') {
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
        
        // Vérification de la largeur minimale côté étroit (pour escalier tournant)
        if (config === 'turning' && narrowSideValue < minNarrowSide) {
            issues.push(`La largeur minimale côté étroit (${narrowSideValue} mm) est inférieure au minimum requis (${minNarrowSide} mm).`);
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
        
        // Afficher le résultat
        resultContent.innerHTML = '';
        result.className = 'result';
        
        if (isCompliant) {
            result.classList.add('compliant');
            resultContent.innerHTML = `<p class="success">✓ Conforme au ${codeReference}.</p>`;
        } else {
            result.classList.add('non-compliant');
            let issuesList = `<p>⚠ Non conforme au ${codeReference}.</p><p>Problèmes détectés:</p><ul>`;
            issues.forEach(issue => {
                issuesList += `<li>${issue}</li>`;
            });
            issuesList += '</ul>';
            resultContent.innerHTML = issuesList;
        }
        
        result.style.display = 'block';
    });
    
    // Ajouter l'écouteur d'événement pour le bouton de calcul
    calculateButton.addEventListener('click', function() {
        // Réinitialiser les messages d'erreur
        document.querySelectorAll('#calculator-tab .error').forEach(el => el.textContent = '');
        
        // Récupérer les valeurs du formulaire
        const isMetric = calcMeasurementSystem.value === 'metric';
        const buildingTypeValue = calcBuildingType.value;
        const stairTypeValue = calcStairType.value;
        const stairConfigValue = calcStairConfig.value;
        
        // Conversion des valeurs en métrique si nécessaire
        let totalRunValue, totalRiseValue, stairWidthValue, idealRiserValue, idealTreadValue;
        
        if (isMetric) {
            totalRunValue = parseFloat(totalRun.value);
            totalRiseValue = parseFloat(totalRise.value);
            stairWidthValue = parseFloat(stairDesiredWidth.value);
            idealRiserValue = parseFloat(idealRiser.value) || 0;
            idealTreadValue = parseFloat(idealTread.value) || 0;
        } else {
            totalRunValue = imperialToMetric(validateImperialInput(totalRunImperial.value));
            totalRiseValue = imperialToMetric(validateImperialInput(totalRiseImperial.value));
            stairWidthValue = imperialToMetric(validateImperialInput(stairDesiredWidthImperial.value));
            idealRiserValue = imperialToMetric(validateImperialInput(idealRiserImperial.value)) || 0;
            idealTreadValue = imperialToMetric(validateImperialInput(idealTreadImperial.value)) || 0;
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
        
        if (!isValid) return;
        
        // Calculer les solutions optimales
        const preferences = {
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priorityComfort.checked ? 'comfort' : 'space'
        };
        
        const solutions = calculateOptimalStair(totalRiseValue, totalRunValue, preferences);
        
        // Définir les limites selon le CNB 2015 pour vérification
        let minRiser, maxRiser, minTread, maxTread, minWidth;
        let codeReference = 'CNB 2015';
        
        if (buildingTypeValue === 'part3') {
            codeReference = 'CNB 2015 Partie 3';
            minRiser = 125;
            maxRiser = 180;
            minTread = 280;
            maxTread = Infinity;
            minWidth = 1100;
            
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
            } else {
                minRiser = 125;
                maxRiser = 180;
                minTread = 280;
                maxTread = Infinity;
                minWidth = 900;
            }
            
            if (stairConfigValue === 'spiral') {
                maxRiser = 240;
            }
        }
        
        // Vérifier la largeur de l'escalier
        const isWidthCompliant = stairWidthValue >= minWidth;
        
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
                widthWarning = `
                    <div class="warning">
                        <p>⚠ La largeur spécifiée (${formatNumber(stairWidthValue)} mm) est inférieure au minimum requis (${minWidth} mm) selon le ${codeReference}.</p>
                    </div>
                `;
            }
            
            // Afficher une explication de la règle du pas
const explanationSection = `
    <div class="result-section">
        <h3>Règle du pas</h3>
        <p>La règle du pas optimale stipule que la somme de 2 fois la hauteur de contremarche (2R) plus la profondeur du giron (G) devrait idéalement être comprise entre 630 et 650 mm, avec un optimum à 640 mm.</p>
        <div class="step-formula">2R + G = 630 à 650 mm</div>
        <p>Cette formule correspond au pas moyen d'un adulte et assure un confort optimal lors de l'utilisation de l'escalier.</p>
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
                                <th>Règle du pas<br>(2R + G)</th>
                                <th>Longueur totale</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            solutions.forEach((solution, index) => {
                const isOptimal = index === 0;
                const className = isOptimal ? 'optimal-solution' : '';
                const riserHeight = formatNumber(solution.riserHeight);
                const treadDepth = formatNumber(solution.treadDepth);
                const stepValue = formatNumber(solution.stepValue);
                const actualTotalRun = formatNumber(solution.treadDepth * solution.numTreads);
                
                let riserHeightDisplay, treadDepthDisplay, stepValueDisplay, actualTotalRunDisplay;
                
                if (isMetric) {
                    riserHeightDisplay = riserHeight + ' mm';
                    treadDepthDisplay = treadDepth + ' mm';
                    stepValueDisplay = stepValue + ' mm';
                    actualTotalRunDisplay = actualTotalRun + ' mm';
                } else {
                    riserHeightDisplay = riserHeight + ' mm (' + metricToImperial(solution.riserHeight) + ')';
                    treadDepthDisplay = treadDepth + ' mm (' + metricToImperial(solution.treadDepth) + ')';
                    stepValueDisplay = stepValue + ' mm (' + metricToImperial(solution.stepValue) + ')';
                    actualTotalRunDisplay = actualTotalRun + ' mm (' + metricToImperial(solution.treadDepth * solution.numTreads) + ')';
                }
                
                solutionsHtml += `
                    <tr class="${className}">
                        <td>${isOptimal ? '✓ Optimale' : 'Alternative ' + index}</td>
                        <td>${solution.numRisers}</td>
                        <td>${riserHeightDisplay}</td>
                        <td>${treadDepthDisplay}</td>
                        <td>${stepValueDisplay}</td>
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
                
                detailsHtml = `
                    <div class="result-section">
                        <h3>Détails de la solution optimale</h3>
                        <ul>
                            <li>Nombre de contremarches: ${bestSolution.numRisers}</li>
                            <li>Nombre de marches: ${bestSolution.numTreads}</li>
                            <li>Hauteur de contremarche: ${formatNumber(bestSolution.riserHeight)} mm ${isMetric ? '' : '(' + metricToImperial(bestSolution.riserHeight) + ')'}</li>
                            <li>Profondeur du giron: ${formatNumber(bestSolution.treadDepth)} mm ${isMetric ? '' : '(' + metricToImperial(bestSolution.treadDepth) + ')'}</li>
                            <li>Valeur du pas (2R + G): ${formatNumber(bestSolution.stepValue)} mm ${isMetric ? '' : '(' + metricToImperial(bestSolution.stepValue) + ')'}</li>
                            <li>Hauteur totale: ${formatNumber(totalRiseCalculation)} mm ${isMetric ? '' : '(' + metricToImperial(totalRiseCalculation) + ')'}</li>
                            <li>Longueur totale: ${formatNumber(totalRunCalculation)} mm ${isMetric ? '' : '(' + metricToImperial(totalRunCalculation) + ')'}</li>
                            <li>Largeur recommandée: ${formatNumber(stairWidthValue)} mm ${isMetric ? '' : '(' + metricToImperial(stairWidthValue) + ')'} ${isWidthCompliant ? '' : '⚠'}</li>
                        </ul>
                    </div>
                `;
            }
            
            // Assembler le résultat final
            calculatorResultContent.innerHTML = `
                <p class="success">✓ Solution conforme au ${codeReference} trouvée.</p>
                ${widthWarning}
                ${explanationSection}
                ${solutionsHtml}
                ${detailsHtml}
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
    measurementSystem.dispatchEvent(new Event('change'));
});
