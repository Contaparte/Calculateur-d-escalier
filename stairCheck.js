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
                
                // Générer la visualisation de l'escalier pour la meilleure solution
                const stairVisualization = generateStairVisualization(stairConfigValue, {
                    numRisers: bestSolution.numRisers,
                    numTreads: bestSolution.numTreads,
                    riserHeight: bestSolution.riserHeight,
                    treadDepth: bestSolution.treadDepth,
                    totalRun: totalRunCalculation,
                    totalRise: totalRiseCalculation,
                    stairWidth: stairWidthValue,
                    narrowSide: minNarrowSideValue,
                    lShapedConfig: lShapedConfigValue
                });
                
                // Ajouter la visualisation de l'escalier
                detailsHtml += `
                    <div class="result-section">
                        <h3>Visualisation de l'escalier</h3>
                        <div class="stair-visualization">
                            ${stairVisualization}
                        </div>
                    </div>
                `;
            }
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
                `; else {
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

// Fonction pour générer la visualisation d'un escalier
function generateStairVisualization(stairConfig, params) {
    const {
        numRisers,
        numTreads,
        riserHeight,
        treadDepth,
        totalRun,
        totalRise,
        stairWidth,
        narrowSide = 0
    } = params;
    
    // Paramètres de dimensionnement du SVG
    const svgPadding = 40;
    const scale = Math.min(600 / (totalRun + 300), 400 / (totalRise + 300));
    const scaledTotalRun = totalRun * scale;
    const scaledTotalRise = totalRise * scale;
    const scaledTreadDepth = treadDepth * scale;
    const scaledRiserHeight = riserHeight * scale;
    const scaledStairWidth = stairWidth * scale;
    
    // Dimensions du SVG
    const svgWidth = scaledTotalRun + (svgPadding * 2);
    const svgHeight = scaledTotalRise + (svgPadding * 2);
    
    // Début du SVG
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Définitions: styles, motifs et marqueurs
    svg += `<defs>
        <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
        </pattern>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#e0e0e0" stroke-width="1"/>
        </pattern>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
        </marker>
        <marker id="dimensionMarker" markerWidth="8" markerHeight="8" refX="4" refY="4">
            <circle cx="4" cy="4" r="3" fill="#333" />
        </marker>
        <linearGradient id="stepGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#e8e8e8" />
            <stop offset="100%" stop-color="#d0d0d0" />
        </linearGradient>
        <linearGradient id="riserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#bbb" />
            <stop offset="100%" stop-color="#999" />
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="2" dy="2" result="offsetblur" />
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>`;
    
    // Grille de fond
    svg += `<rect width="100%" height="100%" fill="url(#grid)" />`;
    
    // Déterminer les couleurs et styles
    const colors = {
        tread: "url(#stepGradient)",         // Marche
        riser: "url(#riserGradient)",        // Contremarche
        landing: "#d9d9d9",                  // Palier
        handrail: "#8B4513",                 // Main courante
        guardrail: "#aaa",                   // Garde-corps
        nosing: "#777",                      // Nez de marche
        dimension: "#333",                   // Cotation
        criticalDimension: "#f44336",        // Dimension critique
        arrow: "#333",                       // Flèche
        spiralPost: "#8B4513"                // Poteau central d'escalier hélicoïdal
    };
    
    // Fonction pour dessiner une contremarche et une marche standards
    const drawStep = (x, y, width, depth, height, hasNosing = true, nosingLength = 25 * scale / 10) => {
        const nosingPath = hasNosing ? 
            `M ${x} ${y} h ${width} v ${nosingLength} h -${width} Z` : '';
        
        return `
            <g class="step">
                ${hasNosing ? `<path d="${nosingPath}" fill="${colors.tread}" stroke="#777" stroke-width="1" />` : ''}
                <rect x="${x}" y="${y + (hasNosing ? nosingLength : 0)}" width="${width}" height="${depth - (hasNosing ? nosingLength : 0)}" 
                      fill="${colors.tread}" stroke="#777" stroke-width="1" />
                <rect x="${x}" y="${y + depth}" width="${width}" height="${height}" 
                      fill="${colors.riser}" stroke="#777" stroke-width="1" />
                <line x1="${x}" y1="${y + depth}" x2="${x + width}" y2="${y + depth}" 
                      stroke="${colors.nosing}" stroke-width="1.5" />
            </g>
        `;
    };
    
    // Fonction pour dessiner un garde-corps
    const drawGuardrail = (startX, startY, endX, endY, height = 40, isRamp = false) => {
        const points = [];
        const numPosts = Math.ceil(Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)) / 40) + 1;
        const dx = (endX - startX) / (numPosts - 1);
        const dy = (endY - startY) / (numPosts - 1);
        
        let guardrailPath = '';
        
        // Dessiner les poteaux
        for (let i = 0; i < numPosts; i++) {
            const x = startX + i * dx;
            const y = startY + i * dy;
            
            guardrailPath += `
                <line x1="${x}" y1="${y}" x2="${x}" y2="${y - height}" 
                      stroke="${colors.guardrail}" stroke-width="2" />
            `;
            
            points.push([x, y - height]);
        }
        
        // Dessiner la main courante (barre horizontale supérieure)
        guardrailPath += `
            <polyline points="${points.map(p => p[0] + ',' + p[1]).join(' ')}" 
                     fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
        `;
        
        // Dessiner les barreaux horizontaux ou filins
        if (numPosts > 1) {
            const numBars = 2; // Nombre de barreaux horizontaux intermédiaires
            
            for (let i = 1; i <= numBars; i++) {
                const barHeight = height * i / (numBars + 1);
                const barPoints = [];
                
                for (let j = 0; j < numPosts; j++) {
                    const x = startX + j * dx;
                    const y = startY + j * dy - barHeight;
                    barPoints.push([x, y]);
                }
                
                guardrailPath += `
                    <polyline points="${barPoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                             fill="none" stroke="${colors.guardrail}" stroke-width="1.5" stroke-linejoin="round" />
                `;
            }
        }
        
        return guardrailPath;
    };
    
    // Dessiner le contenu principal selon la configuration d'escalier
    let stairsContent = '';
    
    switch(stairConfig) {
        case 'straight':
            // Escalier droit
            // Dessiner les marches
            for (let i = 0; i < numRisers; i++) {
                const x = svgPadding;
                const y = svgHeight - svgPadding - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Ajouter les garde-corps et mains courantes
            const straightGuardrailHeight = 40; // hauteur du garde-corps en unités SVG
            
            // Garde-corps côté gauche
            stairsContent += drawGuardrail(
                svgPadding, 
                svgHeight - svgPadding, 
                svgPadding, 
                svgHeight - svgPadding - scaledTotalRise,
                straightGuardrailHeight
            );
            
            // Garde-corps côté droit
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding, 
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding - scaledTotalRise,
                straightGuardrailHeight
            );
            
            // Ajouter une flèche indiquant la direction
            stairsContent += `
                <path d="M ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding + 20} 
                          L ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding - scaledTotalRise - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
            `;
            break;
            
        case 'l_shaped':
        case 'turning_90':
            // Escalier en L (tournant à 90°)
            // Nombre de marches avant le virage
            const halfTreads = Math.ceil(numTreads / 2);
            
            // Dessiner la première volée (verticale)
            for (let i = 0; i < halfTreads; i++) {
                const x = svgPadding;
                const y = svgHeight - svgPadding - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Dessiner le palier ou les marches rayonnantes
            if (params.lShapedConfig === 'standard_landing') {
                // Palier standard
                const landingX = svgPadding;
                const landingY = svgHeight - svgPadding - halfTreads * scaledRiserHeight;
                stairsContent += `
                    <rect x="${landingX}" y="${landingY - scaledStairWidth}" 
                          width="${scaledStairWidth}" height="${scaledStairWidth}" 
                          fill="${colors.landing}" stroke="#777" stroke-width="1" filter="url(#dropShadow)" />
                `;
                
                // Garde-corps autour du palier
                stairsContent += drawGuardrail(
                    landingX, landingY, 
                    landingX + scaledStairWidth, landingY,
                    40
                );
                
                stairsContent += drawGuardrail(
                    landingX + scaledStairWidth, landingY, 
                    landingX + scaledStairWidth, landingY - scaledStairWidth,
                    40
                );
                
            } else if (params.lShapedConfig === 'two_45deg' || params.lShapedConfig === 'three_30deg') {
                // Marches rayonnantes
                const cornerX = svgPadding + scaledStairWidth;
                const cornerY = svgHeight - svgPadding - halfTreads * scaledRiserHeight;
                
                const numRadialSteps = params.lShapedConfig === 'two_45deg' ? 2 : 3;
                const anglePerStep = 90 / numRadialSteps;
                
                for (let i = 0; i < numRadialSteps; i++) {
                    const angle1 = i * anglePerStep * (Math.PI / 180);
                    const angle2 = (i+1) * anglePerStep * (Math.PI / 180);
                    
                    // Dessiner une marche rayonnante
                    stairsContent += `
                        <path class="radial-step" 
                              d="M ${svgPadding} ${cornerY - i * scaledRiserHeight} 
                                 A ${scaledStairWidth} ${scaledStairWidth} 0 0 0 
                                   ${svgPadding + scaledStairWidth * Math.sin(angle2)} 
                                   ${cornerY - scaledStairWidth * (1 - Math.cos(angle2)) - i * scaledRiserHeight}
                                 L ${svgPadding + scaledStairWidth * Math.sin(angle1)}
                                   ${cornerY - scaledStairWidth * (1 - Math.cos(angle1)) - i * scaledRiserHeight} Z" 
                              fill="${colors.tread}" stroke="#777" stroke-width="1" />
                        
                        <!-- Contremarche -->
                        <path class="radial-riser"
                              d="M ${svgPadding} ${cornerY - i * scaledRiserHeight} 
                                 A ${scaledStairWidth} ${scaledStairWidth} 0 0 0 
                                   ${svgPadding + scaledStairWidth * Math.sin(angle2)} 
                                   ${cornerY - scaledStairWidth * (1 - Math.cos(angle2)) - i * scaledRiserHeight}
                                 L ${svgPadding + scaledStairWidth * Math.sin(angle2)}
                                   ${cornerY - scaledStairWidth * (1 - Math.cos(angle2)) - (i+1) * scaledRiserHeight}
                                 A ${scaledStairWidth} ${scaledStairWidth} 0 0 1
                                   ${svgPadding} ${cornerY - (i+1) * scaledRiserHeight} Z"
                              fill="${colors.riser}" stroke="#777" stroke-width="1" />
                    `;
                    
                    // Dessiner le nez de marche
                    stairsContent += `
                        <path class="radial-nosing"
                              d="M ${svgPadding} ${cornerY - i * scaledRiserHeight} 
                                 A ${scaledStairWidth} ${scaledStairWidth} 0 0 0 
                                   ${svgPadding + scaledStairWidth * Math.sin(angle2)} 
                                   ${cornerY - scaledStairWidth * (1 - Math.cos(angle2)) - i * scaledRiserHeight}"
                              fill="none" stroke="${colors.nosing}" stroke-width="1.5" />
                    `;
                }
                
                // Garde-corps pour les marches rayonnantes
                // Points pour la main courante qui suit la courbure
                let curvePoints = [];
                for (let i = 0; i <= 90; i += 10) {
                    const angle = i * (Math.PI / 180);
                    curvePoints.push([
                        svgPadding + scaledStairWidth * Math.sin(angle),
                        cornerY - scaledStairWidth * (1 - Math.cos(angle)) - 40
                    ]);
                }
                
                // Dessiner la main courante courbée
                stairsContent += `
                    <polyline points="${curvePoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                             fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
                `;
                
                // Ajouter quelques poteaux de garde-corps
                for (let i = 0; i <= 90; i += 30) {
                    const angle = i * (Math.PI / 180);
                    const x = svgPadding + scaledStairWidth * Math.sin(angle);
                    const y = cornerY - scaledStairWidth * (1 - Math.cos(angle));
                    
                    stairsContent += `
                        <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 40}" 
                              stroke="${colors.guardrail}" stroke-width="2" />
                    `;
                }
            }
            
            // Dessiner la deuxième volée (horizontale)
            for (let i = halfTreads; i < numTreads; i++) {
                const stepIndex = i - halfTreads;
                const x = svgPadding + scaledStairWidth + stepIndex * scaledTreadDepth;
                const y = svgHeight - svgPadding - numRisers * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledTreadDepth, scaledStairWidth, scaledRiserHeight, true, 25 * scale / 10);
            }
            
            // Garde-corps pour la deuxième volée
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding - numRisers * scaledRiserHeight, 
                svgPadding + scaledStairWidth + (numTreads - halfTreads) * scaledTreadDepth, 
                svgHeight - svgPadding - numRisers * scaledRiserHeight,
                40
            );
            
            // Garde-corps pour la première volée (côté extérieur)
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding, 
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding - halfTreads * scaledRiserHeight,
                40
            );
            
            // Garde-corps pour la première volée (côté intérieur/mur)
            stairsContent += drawGuardrail(
                svgPadding, 
                svgHeight - svgPadding, 
                svgPadding, 
                svgHeight - svgPadding - halfTreads * scaledRiserHeight,
                40
            );
            
            // Ajouter des flèches indiquant la direction
            stairsContent += `
                <path d="M ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding + 20} 
                          L ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding - halfTreads * scaledRiserHeight - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
                
                <path d="M ${svgPadding + scaledStairWidth + 20} ${svgHeight - svgPadding - numRisers * scaledRiserHeight + scaledStairWidth / 2} 
                          L ${svgPadding + scaledStairWidth + (numTreads - halfTreads) * scaledTreadDepth + 20} 
                            ${svgHeight - svgPadding - numRisers * scaledRiserHeight + scaledStairWidth / 2}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
            `;
            break;
            
        case 'u_shaped':
        case 'turning_180':
            // Escalier en U (tournant à 180°)
            // Nombre de marches avant et après le virage
            const thirdTreads = Math.ceil(numTreads / 3);
            const firstSection = thirdTreads;
            const lastSection = numTreads - 2 * thirdTreads;
            
            // Dessiner la première volée (montante)
            for (let i = 0; i < firstSection; i++) {
                const x = svgPadding;
                const y = svgHeight - svgPadding - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Dessiner le palier intermédiaire
            const landingX = svgPadding;
            const landingY = svgHeight - svgPadding - firstSection * scaledRiserHeight;
            const landingWidth = scaledStairWidth * 2 + scaledTreadDepth;
            const landingHeight = scaledStairWidth;
            
            stairsContent += `
                <rect x="${landingX}" y="${landingY - landingHeight}" 
                      width="${landingWidth}" height="${landingHeight}" 
                      fill="${colors.landing}" stroke="#777" stroke-width="1" filter="url(#dropShadow)" />
            `;
            
            // Dessiner la deuxième volée (descendante)
            for (let i = 0; i < thirdTreads; i++) {
                const x = svgPadding + scaledStairWidth + scaledTreadDepth;
                const y = landingY - landingHeight - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Garde-corps pour la première volée
            stairsContent += drawGuardrail(
                svgPadding, 
                svgHeight - svgPadding, 
                svgPadding, 
                landingY,
                40
            );
            
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding, 
                svgPadding + scaledStairWidth, 
                landingY,
                40
            );
            
            // Garde-corps pour le palier
            stairsContent += drawGuardrail(
                landingX, landingY, 
                landingX + landingWidth, landingY,
                40
            );
            
            // Garde-corps pour la deuxième volée
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth + scaledTreadDepth, 
                landingY - landingHeight, 
                svgPadding + scaledStairWidth + scaledTreadDepth, 
                landingY - landingHeight - thirdTreads * scaledRiserHeight,
                40
            );
            
            stairsContent += drawGuardrail(
                svgPadding + 2 * scaledStairWidth + scaledTreadDepth, 
                landingY - landingHeight, 
                svgPadding + 2 * scaledStairWidth + scaledTreadDepth, 
                landingY - landingHeight - thirdTreads * scaledRiserHeight,
                40
            );
            
            // Ajouter des flèches de direction
            stairsContent += `
                <path d="M ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding + 20} 
                          L ${svgPadding + scaledStairWidth / 2} ${landingY - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
                      
                <path d="M ${svgPadding + scaledStairWidth + scaledTreadDepth + scaledStairWidth / 2} ${landingY - landingHeight - 20} 
                          L ${svgPadding + scaledStairWidth + scaledTreadDepth + scaledStairWidth / 2} ${landingY - landingHeight - thirdTreads * scaledRiserHeight - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
            `;
            break;
            
        case 'turning_30':
        case 'turning_45':
        case 'turning_60':
            // Escalier tournant à 30°, 45° ou 60°
            // Angle de rotation
            let angle = 30;
            if (stairConfig === 'turning_45') angle = 45;
            if (stairConfig === 'turning_60') angle = 60;
            
            // Nombre de marches avant et après le virage
            const beforeTurn = Math.floor(numTreads / 2);
            const turnSteps = angle === 30 ? 3 : (angle === 45 ? 2 : 2); // Nombre de marches dans le tournant
            const afterTurn = numTreads - beforeTurn - turnSteps;
            
            // Dessiner la première volée
            for (let i = 0; i < beforeTurn; i++) {
                const x = svgPadding;
                const y = svgHeight - svgPadding - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Dessiner les marches rayonnantes
            const startX = svgPadding;
            const startY = svgHeight - svgPadding - beforeTurn * scaledRiserHeight;
            const radius = scaledStairWidth * 1.2;
            
            for (let i = 0; i < turnSteps; i++) {
                const angleStep = angle / turnSteps;
                const startAngle = i * angleStep;
                const endAngle = (i + 1) * angleStep;
                
                const startRadAngle = startAngle * (Math.PI / 180);
                const endRadAngle = endAngle * (Math.PI / 180);
                
                // Points pour dessiner la marche rayonnante
                const innerX1 = startX;
                const innerY1 = startY - i * scaledRiserHeight;
                const outerX1 = startX + radius * Math.sin(startRadAngle);
                const outerY1 = startY - radius * (1 - Math.cos(startRadAngle)) - i * scaledRiserHeight;
                const outerX2 = startX + radius * Math.sin(endRadAngle);
                const outerY2 = startY - radius * (1 - Math.cos(endRadAngle)) - i * scaledRiserHeight;
                
                // Dessiner le giron (marche)
                stairsContent += `
                    <path class="radial-step" 
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX1} ${outerY1} 
                             A ${radius} ${radius} 0 0 1 ${outerX2} ${outerY2} 
                             L ${innerX1} ${innerY1} Z" 
                          fill="${colors.tread}" stroke="#777" stroke-width="1" />
                `;
                
                // Dessiner la contremarche
                stairsContent += `
                    <path class="radial-riser"
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX2} ${outerY2}
                             L ${outerX2} ${outerY2 - scaledRiserHeight}
                             L ${innerX1} ${innerY1 - scaledRiserHeight} Z"
                          fill="${colors.riser}" stroke="#777" stroke-width="1" />
                `;
                
                // Dessiner le nez de marche
                stairsContent += `
                    <path class="radial-nosing"
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX1} ${outerY1} 
                             A ${radius} ${radius} 0 0 1 ${outerX2} ${outerY2}"
                          fill="none" stroke="${colors.nosing}" stroke-width="1.5" />
                `;
            }
            
            // Calculer l'angle final et la position pour la dernière volée
            const finalAngle = angle * (Math.PI / 180);
            const newDirection = [Math.sin(finalAngle), -Math.cos(finalAngle)];
            
            // Dessiner la deuxième volée
            const turnEndX = startX + radius * Math.sin(finalAngle);
            const turnEndY = startY - radius * (1 - Math.cos(finalAngle)) - turnSteps * scaledRiserHeight;
            
            for (let i = 0; i < afterTurn; i++) {
                const stepX = turnEndX + i * scaledTreadDepth * newDirection[0];
                const stepY = turnEndY + i * scaledTreadDepth * newDirection[1];
                
                // Rotation pour aligner avec la nouvelle direction
                stairsContent += `
                    <g transform="translate(${stepX}, ${stepY}) rotate(${angle})">
                        ${drawStep(0, 0, scaledStairWidth, scaledTreadDepth, scaledRiserHeight, true, 25 * scale / 10)}
                    </g>
                `;
            }
            
            // Garde-corps pour la première volée
            stairsContent += drawGuardrail(
                svgPadding, 
                svgHeight - svgPadding, 
                svgPadding, 
                startY,
                40
            );
            
            stairsContent += drawGuardrail(
                svgPadding + scaledStairWidth, 
                svgHeight - svgPadding, 
                svgPadding + scaledStairWidth, 
                startY,
                40
            );
            
            // Garde-corps pour la partie courbe
            let curvePoints = [];
            for (let i = 0; i <= angle; i += 10) {
                const curveAngle = i * (Math.PI / 180);
                curvePoints.push([
                    startX + radius * Math.sin(curveAngle),
                    startY - radius * (1 - Math.cos(curveAngle)) - 40
                ]);
            }
            
            stairsContent += `
                <polyline points="${curvePoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                         fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
            `;
            
            // Ajouter quelques poteaux pour le garde-corps courbe
            for (let i = 0; i <= angle; i += 15) {
                const poleAngle = i * (Math.PI / 180);
                const poleX = startX + radius * Math.sin(poleAngle);
                const poleY = startY - radius * (1 - Math.cos(poleAngle));
                
                stairsContent += `
                    <line x1="${poleX}" y1="${poleY}" x2="${poleX}" y2="${poleY - 40}" 
                          stroke="${colors.guardrail}" stroke-width="2" />
                `;
            }
            
            // Garde-corps pour la deuxième volée
            // Calculer les points du garde-corps selon la nouvelle direction
            const guardrailLength = afterTurn * scaledTreadDepth;
            const guardrailEndX = turnEndX + guardrailLength * newDirection[0];
            const guardrailEndY = turnEndY + guardrailLength * newDirection[1];
            
            stairsContent += `
                <g transform="translate(${turnEndX}, ${turnEndY}) rotate(${angle})">
                    ${drawGuardrail(0, 0, 0 + guardrailLength, 0, 40)}
                </g>
            `;
            
            // Ajouter une flèche de direction
            stairsContent += `
                <path d="M ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding + 20} 
                          L ${svgPadding + scaledStairWidth / 2} ${svgHeight - svgPadding - beforeTurn * scaledRiserHeight - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
            `;
            break;
            
        case 'dancing_steps':
            // Escalier avec marches dansantes
            // Similaire à l'escalier tournant mais avec un angle plus doux
            const danceAngle = 90; // Angle total de rotation
            const danceSteps = Math.min(6, Math.floor(numTreads / 2)); // Nombre de marches dansantes
            
            // Dessiner la première volée
            const beforeDance = Math.floor((numTreads - danceSteps) / 2);
            for (let i = 0; i < beforeDance; i++) {
                const x = svgPadding;
                const y = svgHeight - svgPadding - (i + 1) * scaledRiserHeight;
                stairsContent += drawStep(x, y, scaledStairWidth, scaledTreadDepth, scaledRiserHeight);
            }
            
            // Dessiner les marches dansantes
            const danceStartX = svgPadding;
            const danceStartY = svgHeight - svgPadding - beforeDance * scaledRiserHeight;
            const danceRadius = scaledStairWidth * 1.5;
            
            for (let i = 0; i < danceSteps; i++) {
                const stepAngle = danceAngle / danceSteps;
                const startAngle = i * stepAngle;
                const endAngle = (i + 1) * stepAngle;
                
                const startRadAngle = startAngle * (Math.PI / 180);
                const endRadAngle = endAngle * (Math.PI / 180);
                
                // Calculer les points pour la marche dansante
                const innerX1 = danceStartX;
                const innerY1 = danceStartY - i * scaledRiserHeight;
                const outerX1 = danceStartX + danceRadius * Math.sin(startRadAngle);
                const outerY1 = danceStartY - danceRadius * (1 - Math.cos(startRadAngle)) - i * scaledRiserHeight;
                const outerX2 = danceStartX + danceRadius * Math.sin(endRadAngle);
                const outerY2 = danceStartY - danceRadius * (1 - Math.cos(endRadAngle)) - i * scaledRiserHeight;
                
                // Calculer la largeur du côté étroit (simplifié)
                const narrowSideLength = Math.min(scaledStairWidth, narrowSide * scale);
                const narrowSideX = danceStartX + narrowSideLength * Math.sin(endRadAngle);
                const narrowSideY = danceStartY - narrowSideLength * (1 - Math.cos(endRadAngle)) - i * scaledRiserHeight;
                
                // Dessiner le giron (marche)
                stairsContent += `
                    <path class="dancing-step" 
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX1} ${outerY1} 
                             A ${danceRadius} ${danceRadius} 0 0 1 ${outerX2} ${outerY2} 
                             L ${innerX1} ${innerY1} Z" 
                          fill="${colors.tread}" stroke="#777" stroke-width="1" />
                `;
                
                // Dessiner la contremarche
                stairsContent += `
                    <path class="dancing-riser"
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX2} ${outerY2}
                             L ${outerX2} ${outerY2 - scaledRiserHeight}
                             L ${innerX1} ${innerY1 - scaledRiserHeight} Z"
                          fill="${colors.riser}" stroke="#777" stroke-width="1" />
                `;
                
                // Dessiner le nez de marche
                stairsContent += `
                    <path class="dancing-nosing"
                          d="M ${innerX1} ${innerY1} 
                             L ${outerX1} ${outerY1} 
                             A ${danceRadius} ${danceRadius} 0 0 1 ${outerX2} ${outerY2}"
                          fill="none" stroke="${colors.nosing}" stroke-width="1.5" />
                `;
                
                // Dessiner l'indication de la largeur du côté étroit
                stairsContent += `
                    <line x1="${innerX1}" y1="${innerY1}" x2="${narrowSideX}" y2="${narrowSideY}" 
                          stroke="${colors.criticalDimension}" stroke-width="2" />
                `;
                
                // Placer un point à 300 mm de l'axe de la main courante du côté intérieur
                // (Point de mesure du giron uniforme selon CNB)
                const measureDistance = 300 * scale / 25.4; // 300 mm convertis en unités SVG
                const measureX = danceStartX + measureDistance * Math.sin(endRadAngle);
                const measureY = danceStartY - measureDistance * (1 - Math.cos(endRadAngle)) - i * scaledRiserHeight;
                
                stairsContent += `
                    <circle cx="${measureX}" cy="${measureY}" r="3" fill="${colors.criticalDimension}" />
                `;
                
                // Ligne de référence à 300 mm
                if (i === 0) {
                    stairsContent += `
                        <path d="M ${danceStartX} ${danceStartY} 
                                 A ${measureDistance} ${measureDistance} 0 0 1 
                                   ${danceStartX + measureDistance} ${danceStartY}" 
                              fill="none" stroke="${colors.criticalDimension}" stroke-width="1" stroke-dasharray="5,5" />
                        <text x="${danceStartX + measureDistance/2}" y="${danceStartY - 10}" 
                              text-anchor="middle" fill="${colors.criticalDimension}" font-size="10">
                            300mm
                        </text>
                    `;
                }
            }
            
            // Dessiner la deuxième volée
            const danceEndX = danceStartX + danceRadius * Math.sin(danceAngle * (Math.PI / 180));
            const danceEndY = danceStartY - danceRadius * (1 - Math.cos(danceAngle * (Math.PI / 180))) - danceSteps * scaledRiserHeight;
            const afterDance = numTreads - beforeDance - danceSteps;
            
            // Direction finale après la rotation
            const danceDirection = [Math.sin(danceAngle * (Math.PI / 180)), -Math.cos(danceAngle * (Math.PI / 180))];
            
            for (let i = 0; i < afterDance; i++) {
                const stepX = danceEndX + i * scaledTreadDepth * danceDirection[0];
                const stepY = danceEndY + i * scaledTreadDepth * danceDirection[1];
                
                // Rotation du dessin pour aligner avec la nouvelle direction
                stairsContent += `
                    <g transform="translate(${stepX}, ${stepY}) rotate(${danceAngle})">
                        ${drawStep(0, 0, scaledStairWidth, scaledTreadDepth, scaledRiserHeight, true, 25 * scale / 10)}
                    </g>
                `;
            }
            
            // Garde-corps pour la première volée
            stairsContent += drawGuardrail(
                danceStartX, 
                svgHeight - svgPadding, 
                danceStartX, 
                danceStartY,
                40
            );
            
            stairsContent += drawGuardrail(
                danceStartX + scaledStairWidth, 
                svgHeight - svgPadding, 
                danceStartX + scaledStairWidth, 
                danceStartY,
                40
            );
            
            // Garde-corps pour la partie courbe (main courante extérieure)
            let danceCurvePoints = [];
            for (let i = 0; i <= danceAngle; i += 10) {
                const curveAngle = i * (Math.PI / 180);
                danceCurvePoints.push([
                    danceStartX + (danceRadius + scaledStairWidth) * Math.sin(curveAngle),
                    danceStartY - (danceRadius + scaledStairWidth) * (1 - Math.cos(curveAngle)) - 40
                ]);
            }
            
            stairsContent += `
                <polyline points="${danceCurvePoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                         fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
            `;
            
            // Main courante intérieure (côté étroit)
            let danceCurveInnerPoints = [];
            for (let i = 0; i <= danceAngle; i += 10) {
                const curveAngle = i * (Math.PI / 180);
                danceCurveInnerPoints.push([
                    danceStartX,
                    danceStartY - i/danceAngle * danceSteps * scaledRiserHeight - 40
                ]);
            }
            
            stairsContent += `
                <polyline points="${danceCurveInnerPoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                         fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
            `;
            
            // Garde-corps pour la deuxième volée
            const danceGuardrailLength = afterDance * scaledTreadDepth;
            
            stairsContent += `
                <g transform="translate(${danceEndX}, ${danceEndY}) rotate(${danceAngle})">
                    ${drawGuardrail(0, 0, 0 + danceGuardrailLength, 0, 40)}
                </g>
            `;
            
            // Ajouter flèche de direction
            stairsContent += `
                <path d="M ${danceStartX + scaledStairWidth / 2} ${svgHeight - svgPadding + 20} 
                          L ${danceStartX + scaledStairWidth / 2} ${danceStartY - beforeDance * scaledRiserHeight - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)" />
            `;
            break;
            
        case 'spiral':
            // Escalier hélicoïdal
            const centerX = svgWidth / 2;
            const centerY = svgHeight / 2;
            const spiralRadius = Math.min(scaledTotalRun, scaledTotalRise) / 2.5;
            const anglePerStep = 30; // Angle en degrés entre chaque marche
            
            // Dessiner le poteau central
            stairsContent += `
                <circle cx="${centerX}" cy="${centerY}" r="12" fill="${colors.spiralPost}" stroke="#664229" stroke-width="1" filter="url(#dropShadow)" />
            `;
            
            // Dessiner les marches hélicoïdales
            for (let i = 0; i < numRisers; i++) {
                const startAngle = i * anglePerStep;
                const endAngle = (i + 1) * anglePerStep;
                
                const startRadians = startAngle * (Math.PI / 180);
                const endRadians = endAngle * (Math.PI / 180);
                
                // Hauteur de la marche
                const stepHeight = i * (scaledTotalRise / numRisers);
                
                // Points pour dessiner la marche
                const innerX = centerX;
                const innerY = centerY;
                const outerX1 = centerX + spiralRadius * Math.cos(startRadians);
                const outerY1 = centerY + spiralRadius * Math.sin(startRadians);
                const outerX2 = centerX + spiralRadius * Math.cos(endRadians);
                const outerY2 = centerY + spiralRadius * Math.sin(endRadians);
                
                // Dessiner la marche hélicoïdale avec effet de profondeur
                stairsContent += `
                    <g transform="translate(0, ${-stepHeight/numRisers*i})">
                        <!-- Marche -->
                        <path d="M ${innerX} ${innerY} 
                                 L ${outerX1} ${outerY1} 
                                 A ${spiralRadius} ${spiralRadius} 0 0 1 ${outerX2} ${outerY2} 
                                 L ${innerX} ${innerY} Z" 
                              fill="${colors.tread}" stroke="#777" stroke-width="1" />
                        
                        <!-- Contremarche (vue depuis dessous) -->
                        <path d="M ${innerX} ${innerY} 
                                 L ${outerX2} ${outerY2} 
                                 L ${outerX2} ${outerY2 + 5} 
                                 L ${innerX} ${innerY + 5} Z" 
                              fill="${colors.riser}" stroke="#777" stroke-width="0.5" opacity="0.7" />
                        
                        <!-- Nez de marche -->
                        <path d="M ${innerX} ${innerY} 
                                 L ${outerX1} ${outerY1} 
                                 A ${spiralRadius} ${spiralRadius} 0 0 1 ${outerX2} ${outerY2}" 
                              fill="none" stroke="${colors.nosing}" stroke-width="1.5" />
                    </g>
                `;
            }
            
            // Ajouter les mains courantes
            // Main courante extérieure
            let outerHandrailPoints = [];
            for (let i = 0; i <= 360; i += 15) {
                const angle = i * (Math.PI / 180);
                const x = centerX + (spiralRadius + 5) * Math.cos(angle);
                const y = centerY + (spiralRadius + 5) * Math.sin(angle);
                outerHandrailPoints.push([x, y - 40]);
            }
            
            stairsContent += `
                <polyline points="${outerHandrailPoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                         fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
            `;
            
            // Main courante intérieure
            let innerHandrailPoints = [];
            const innerRadius = Math.max(20, spiralWidthValue ? spiralWidthValue * scale / 25.4 : 660 * scale / 25.4 / 2);
            
            for (let i = 0; i <= 360; i += 15) {
                const angle = i * (Math.PI / 180);
                const x = centerX + innerRadius * Math.cos(angle);
                const y = centerY + innerRadius * Math.sin(angle);
                innerHandrailPoints.push([x, y - 40]);
            }
            
            stairsContent += `
                <polyline points="${innerHandrailPoints.map(p => p[0] + ',' + p[1]).join(' ')}" 
                         fill="none" stroke="${colors.handrail}" stroke-width="2" stroke-linejoin="round" />
            `;
            
            // Ajouter quelques poteaux de garde-corps
            for (let i = 0; i < 360; i += 60) {
                const angle = i * (Math.PI / 180);
                const x = centerX + spiralRadius * Math.cos(angle);
                const y = centerY + spiralRadius * Math.sin(angle);
                
                stairsContent += `
                    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 40}" 
                          stroke="${colors.guardrail}" stroke-width="2" />
                `;
            }
            
            // Ajouter une indication de la largeur libre entre mains courantes
            if (spiralWidthValue) {
                const scaledSpiralWidth = spiralWidthValue * scale / 25.4;
                
                stairsContent += `
                    <line x1="${centerX - scaledSpiralWidth/2}" y1="${centerY}" 
                          x2="${centerX + scaledSpiralWidth/2}" y2="${centerY}" 
                          stroke="${colors.criticalDimension}" stroke-width="2" />
                    <text x="${centerX}" y="${centerY - 10}" 
                          text-anchor="middle" fill="${colors.criticalDimension}" font-size="12">
                        ${spiralWidthValue} mm
                    </text>
                `;
            }
            
            // Ajouter flèche de direction circulaire
            stairsContent += `
                <path d="M ${centerX} ${centerY + spiralRadius + 20} 
                          A ${spiralRadius + 20} ${spiralRadius + 20} 0 1 1 ${centerX} ${centerY - spiralRadius - 20}" 
                      fill="none" stroke="${colors.arrow}" stroke-width="2" stroke-dasharray="5,5" marker-end="url(#arrowhead)" />
            `;
            break;
    }
    
    // Ajouter des cotations
    svg += `
        <g class="dimensions">
            <!-- Cotation hauteur -->
            <line x1="${svgPadding - 20}" y1="${svgHeight - svgPadding}" 
                  x2="${svgPadding - 20}" y2="${svgHeight - svgPadding - scaledTotalRise}" 
                  stroke="${colors.dimension}" stroke-width="1" marker-start="url(#dimensionMarker)" marker-end="url(#dimensionMarker)"/>
            <text x="${svgPadding - 25}" y="${svgHeight - svgPadding - scaledTotalRise/2}" 
                  transform="rotate(-90, ${svgPadding - 25}, ${svgHeight - svgPadding - scaledTotalRise/2})" 
                  text-anchor="middle" fill="${colors.dimension}" font-size="12">
                ${formatNumber(totalRise)} mm
            </text>
            
            <!-- Cotation longueur -->
            <line x1="${svgPadding}" y1="${svgHeight - svgPadding + 20}" 
                  x2="${svgPadding + scaledTotalRun}" y2="${svgHeight - svgPadding + 20}" 
                  stroke="${colors.dimension}" stroke-width="1" marker-start="url(#dimensionMarker)" marker-end="url(#dimensionMarker)"/>
            <text x="${svgPadding + scaledTotalRun/2}" y="${svgHeight - svgPadding + 35}" 
                  text-anchor="middle" fill="${colors.dimension}" font-size="12">
                ${formatNumber(totalRun)} mm
            </text>
        </g>
    `;
    
    // Ajouter les marches et autres éléments au SVG
    svg += stairsContent;
    
    // Légende améliorée
    svg += `
        <g class="legend" transform="translate(${svgWidth - 160}, 20)">
            <rect x="0" y="0" width="140" height="120" fill="white" stroke="#ccc" stroke-width="1" opacity="0.9" rx="5"/>
            <text x="10" y="20" font-weight="bold" font-size="12">Légende:</text>
            <rect x="10" y="30" width="15" height="15" fill="${colors.tread}" stroke="#777" stroke-width="1"/>
            <text x="35" y="42" font-size="10">Marche</text>
            <rect x="10" y="50" width="15" height="15" fill="${colors.riser}" stroke="#777" stroke-width="1"/>
            <text x="35" y="62" font-size="10">Contremarche</text>
            <line x1="10" y1="75" x2="25" y2="75" stroke="${colors.handrail}" stroke-width="2"/>
            <text x="35" y="78" font-size="10">Main courante</text>
            <line x1="10" y1="90" x2="25" y2="90" stroke="${colors.criticalDimension}" stroke-width="2"/>
            <text x="35" y="94" font-size="10">Dimension critique</text>
            <line x1="10" y1="105" x2="25" y2="105" stroke="${colors.arrow}" stroke-width="2" marker-end="url(#arrowhead)"/>
            <text x="35" y="108" font-size="10">Direction</text>
        </g>
    `;
    
    // Fermer le SVG
    svg += '</svg>';
    
    return svg;
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
        
        // Générer la visualisation de l'escalier
        // Calcul de la longueur totale (estimation)
        let numTreads = 0;
        let totalRunValue = 0;
        let totalRiseValue = 0;
        
        // Estimer la longueur et hauteur totales pour la visualisation
        if (config === 'spiral') {
            // Pour un escalier hélicoïdal, utiliser une estimation
            numTreads = 12; // Valeur arbitraire pour la visualisation
            totalRunValue = stairWidthValue * 3; // Estimation de la largeur totale
            totalRiseValue = riserHeightValue * (numTreads + 1); // Hauteur totale estimée
        } else {
            // Pour les autres types d'escaliers, utiliser le giron et la hauteur de contremarche
            numTreads = 10; // Valeur arbitraire pour la visualisation, peut être ajustée
            totalRunValue = treadDepthValue * numTreads; // Longueur totale estimée
            totalRiseValue = riserHeightValue * (numTreads + 1); // Hauteur totale estimée
        }
        
        const stairVisualization = generateStairVisualization(config, {
            numRisers: numTreads + 1,
            numTreads: numTreads,
            riserHeight: riserHeightValue,
            treadDepth: treadDepthValue,
            totalRun: totalRunValue,
            totalRise: totalRiseValue,
            stairWidth: stairWidthValue,
            narrowSide: narrowSideValue || 0,
            lShapedConfig: lShapedConfigValue
        });
        
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
        
        // Ajouter la visualisation de l'escalier
        resultContent.innerHTML += `
        <div class="result-section">
            <h3>Visualisation de l'escalier</h3>
            <div class="stair-visualization">
                ${stairVisualization}
            </div>
        </div>
        `;
        
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
        
        if (!isValid) return; else {
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
    } // <- Cette accolade fermante est manquante dans votre code

    // Maintenant, procéder à la vérification de conformité
    checkCompliance();
});

}
        
        // Maintenant, procéder à la vérification de conformité
        checkCompliance();
    });
    
    // Fonction pour vérifier la conformité d'un escalier existant
    function checkCompliance() {
        // Récupérer les valeurs actuelles
        const isMetric = measurementSystem.value === 'metric';
        const isBuildingPart3 = buildingType.value === 'part3';
        const buildingUseValue = buildingUse.value;
        const typeValue = stairType.value;
        const stairUseValue = stairUse.value;
        const configValue = stairConfig.value;
        const lShapedConfigValue = lShapedConfig ? lShapedConfig.value : 'standard_landing';
        const dancingStepsConfigValue = dancingStepsConfig ? dancingStepsConfig.value : 'standard';
        const spiralConfigValue = spiralConfig ? spiralConfig.value : 'secondary';
        
        // Conversion des valeurs en métrique si nécessaire
        let riserHeightValue, treadDepthValue, narrowSideValue, stairWidthValue, headroomValue, spiralWidthValue;
        
        if (isMetric) {
            riserHeightValue = parseFloat(riserHeight.value) || 0;
            treadDepthValue = parseFloat(treadDepth.value) || 0;
            narrowSideValue = parseFloat(narrowSide.value) || 0;
            stairWidthValue = parseFloat(stairWidth.value) || 0;
            headroomValue = parseFloat(headroom.value) || 0;
            spiralWidthValue = parseFloat(spiralWidth.value) || 0;
        } else {
            riserHeightValue = imperialToMetric(validateImperialInput(riserHeightImperial.value)) || 0;
            treadDepthValue = imperialToMetric(validateImperialInput(treadDepthImperial.value)) || 0;
            narrowSideValue = imperialToMetric(validateImperialInput(narrowSideImperial.value)) || 0;
            stairWidthValue = imperialToMetric(validateImperialInput(stairWidthImperial.value)) || 0;
            headroomValue = imperialToMetric(validateImperialInput(headroomImperial.value)) || 0;
            spiralWidthValue = imperialToMetric(validateImperialInput(spiralWidthImperial.value)) || 0;
        }
        
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
            if (configValue === 'dancing_steps') {
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
            if (configValue === 'spiral') {
                minSpiralWidth = 660; // 660 mm
                maxRiser = 240; // 240 mm pour escalier hélicoïdal
            }
        } else {
            // Règles pour les bâtiments régis par la partie 9
            codeReference = 'CNB 2015 Partie 9';
            
            // Hauteur de contremarche (9.8.4.1)
            if (typeValue === 'private') {
                minRiser = 125; // 125 mm
                maxRiser = 200; // 200 mm
            } else { // common
                minRiser = 125; // 125 mm
                maxRiser = 180; // 180 mm
            }
            
            // Giron (9.8.4.2)
            if (typeValue === 'private') {
                minTread = 255; // 255 mm
                maxTread = 355; // 355 mm
            } else { // common
                minTread = 280; // 280 mm
                maxTread = Infinity; // pas de limite maximale
            }
            
            // Largeur minimale côté étroit (9.8.4.3 ou 9.8.4.6 pour marches rayonnantes)
            if (configValue === 'dancing_steps') {
                if (typeValue === 'private') {
                    minNarrowSide = 150; // 150 mm (9.8.4.3)
                } else if (dancingStepsConfigValue === 'exit') {
                    minNarrowSide = 240; // 240 mm pour une issue
                } else {
                    minNarrowSide = 150; // 150 mm standard
                }
            }
            
            // Largeur de l'escalier (9.8.2.1)
            if (typeValue === 'private') {
                minWidth = 860; // 860 mm
            } else { // common
                minWidth = 900; // 900 mm
            }
            
            // Hauteur libre (9.8.2.2)
            if (typeValue === 'private') {
                minHeadroom = 1950; // 1950 mm
            } else { // common
                minHeadroom = 2050; // 2050 mm
            }
            
            // Largeur libre entre mains courantes (escalier hélicoïdal) (9.8.4.7)
            if (configValue === 'spiral') {
                minSpiralWidth = 660; // 660 mm
                maxRiser = 240; // 240 mm pour escalier hélicoïdal
            }
        }
        
        // Ajustement supplémentaire pour les escaliers d'issue
        if (stairUseValue === 'exit') {
            if (isBuildingPart3) {
                // Ajustements spécifiques aux issues de la partie 3
                minWidth = 1100; // 1100 mm minimum pour une issue
                
                if (configValue === 'dancing_steps') {
                    minNarrowSide = 240; // 240 mm pour une issue
                }
            } else {
                // Ajustements spécifiques aux issues de la partie 9
                minWidth = 900; // 900 mm minimum pour une issue dans la partie 9
            }
        }
        
        // Largeur libre entre mains courantes (escalier hélicoïdal) (9.8.4.7)
        if (config === 'spiral') {
            minSpiralWidth = 660; // 660 mm
            maxRiser = 240; // 240 mm pour escalier hélicoïdal
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
        if (configValue === 'dancing_steps' && narrowSideValue < minNarrowSide) {
            const narrowSideImperialValue = metricToImperial(narrowSideValue);
            issues.push(`La largeur minimale côté étroit ${isMetric ? (narrowSideValue.toFixed(2) + ' mm') : narrowSideImperialValue} est inférieure au minimum requis (${isMetric ? (minNarrowSide + ' mm') : metricToImperial(minNarrowSide)}) selon le ${codeReference}.`);
            isCompliant = false;
        }
        
        // Vérification de la largeur de l'escalier
        if (stairWidthValue < minWidth) {
            issues.push(`La largeur de l'escalier (${isMetric ? (stairWidthValue.toFixed(2) + ' mm') : metricToImperial(stairWidthValue)}) est inférieure au minimum requis (${isMetric ? (minWidth + ' mm') : metricToImperial(minWidth)}).`);
            isCompliant = false;
        }
        
        // Vérification de la hauteur libre
        if (headroomValue < minHeadroom) {
            issues.push(`La hauteur libre (${isMetric ? (headroomValue.toFixed(2) + ' mm') : metricToImperial(headroomValue)}) est inférieure au minimum requis (${isMetric ? (minHeadroom + ' mm') : metricToImperial(minHeadroom)}).`);
            isCompliant = false;
        }
        
        // Vérification de la largeur libre entre mains courantes (pour escalier hélicoïdal)
        if (configValue === 'spiral' && spiralWidthValue < minSpiralWidth) {
            issues.push(`La largeur libre entre mains courantes (${isMetric ? (spiralWidthValue.toFixed(2) + ' mm') : metricToImperial(spiralWidthValue)}) est inférieure au minimum requis (${isMetric ? (minSpiralWidth + ' mm') : metricToImperial(minSpiralWidth)}).`);
            isCompliant = false;
        }
        
        // Vérification spécifique pour les escaliers hélicoïdaux servant d'issue
        if (configValue === 'spiral' && stairUseValue === 'exit') {
            issues.push(`Les escaliers hélicoïdaux ne doivent pas être utilisés comme issues (CNB 2015 9.8.4.7).`);
            isCompliant = false;
        }
        
        // Vérification pour escalier hélicoïdal comme seul moyen d'évacuation pour plus de 3 personnes
        if (configValue === 'spiral' && spiralConfigValue === 'primary' && typeValue === 'common') {
            issues.push(`Un escalier hélicoïdal ne peut servir de seul moyen d'évacuation que s'il ne dessert pas plus de 3 personnes (CNB 2015 9.8.4.7).`);
            isCompliant = false;
        }
        
        // Générer la visualisation de l'escalier
        // Calcul de la longueur totale (estimation)
        let numTreads = 0;
        let totalRunValue = 0;
        let totalRiseValue = 0;
        
        // Estimer la longueur et hauteur totales pour la visualisation
        if (configValue === 'spiral') {
            // Pour un escalier hélicoïdal, utiliser une estimation
            numTreads = 12; // Valeur arbitraire pour la visualisation
            totalRunValue = stairWidthValue * 3; // Estimation de la largeur totale
            totalRiseValue = riserHeightValue * (numTreads + 1); // Hauteur totale estimée
        } else {
            // Pour les autres types d'escaliers, utiliser le giron et la hauteur de contremarche
            numTreads = 10; // Valeur arbitraire pour la visualisation, peut être ajustée
            totalRunValue = treadDepthValue * numTreads; // Longueur totale estimée
            totalRiseValue = riserHeightValue * (numTreads + 1); // Hauteur totale estimée
        }
        
        const stairVisualization = generateStairVisualization(configValue, {
            numRisers: numTreads + 1,
            numTreads: numTreads,
            riserHeight: riserHeightValue,
            treadDepth: treadDepthValue,
            totalRun: totalRunValue,
            totalRise: totalRiseValue,
            stairWidth: stairWidthValue,
            narrowSide: narrowSideValue || 0,
            lShapedConfig: lShapedConfigValue
        });
        
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
        
        // Ajouter la visualisation de l'escalier
        resultContent.innerHTML += `
        <div class="result-section">
            <h3>Visualisation de l'escalier</h3>
            <div class="stair-visualization">
                ${stairVisualization}
            </div>
        </div>
        `;
        
        result.style.display = 'block';
    }
    
    // Fonction pour calculer les dimensions optimales d'un escalier
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
        const solutions = calculateOptimalStair(totalRiseValue, totalRunValue, {
            buildingType: buildingTypeValue,
            stairType: stairTypeValue,
            stairConfig: stairConfigValue,
            lShapedConfig: lShapedConfigValue,
            dancingStepsConfig: dancingStepsConfigValue,
            spiralConfig: spiralConfigValue,
            idealRiser: idealRiserValue,
            idealTread: idealTreadValue,
            priority: priorityComfort.checked ? 'comfort' : 'space'
        });
        
        // Préparation de l'affichage des résultats
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
            
            // Définir les limites selon le CNB 2015
            let minWidth;
            let codeReference = buildingTypeValue === 'part3' ? 'CNB 2015 Partie 3' : 'CNB 2015 Partie 9';
            
            // Déterminer minWidth selon le type d'escalier
            if (buildingTypeValue === 'part3') {
                minWidth = 1100;
            } else {
                if (stairTypeValue === 'private') {
                    minWidth = 860;
                } else {
                    minWidth = 900;
                }
            }
            
            // Vérification de la largeur
            const isWidthCompliant = stairWidthValue >= minWidth;
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
            
            // Avertissements spécifiques pour le type d'escalier
            let specificWarnings = '';
            
            if (stairConfigValue === 'spiral') {
                if (spiralConfigValue === 'primary' && stairTypeValue === 'common') {
                    specificWarnings += `
                        <div class="warning">
                            <p>⚠ Un escalier hélicoïdal ne peut servir de seul moyen d'évacuation que s'il ne dessert pas plus de 3 personnes (CNB 2015 9.8.4.7).</p>
                        </div>
                    `;
                }
            }
            
            // Afficher l'explication de la règle du pas
            const stepRuleIdeal = isMetric ? "432-457 mm" : "17-18 pouces";
            const stepRuleSquareIdeal = isMetric ? "45800-47700 mm²" : "71-74 po²";
            const stepRule2RGIdeal = isMetric ? "559-635 mm" : "22-25 pouces";
            
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
                
                // Générer la visualisation de l'escalier pour la meilleure solution
                const stairVisualization = generateStairVisualization(stairConfigValue, {
                    numRisers: bestSolution.numRisers,
                    numTreads: bestSolution.numTreads,
                    riserHeight: bestSolution.riserHeight,
                    treadDepth: bestSolution.treadDepth,
                    totalRun: totalRunCalculation,
                    totalRise: totalRiseCalculation,
                    stairWidth: stairWidthValue,
                    narrowSide: minNarrowSideValue,
                    lShapedConfig: lShapedConfigValue
                });
                
                // Ajouter la visualisation de l'escalier
                detailsHtml += `
                    <div class="result-section">
                        <h3>Visualisation de l'escalier</h3>
                        <div class="stair-visualization">
                            ${stairVisualization}
                        </div>
                    </div>
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
                            <li>Le giron minimal mesuré à 300 mm de l'axe de la main courante doit être ${isMetric ? (minNarrowSideValue + ' mm') : metricToImperial(minNarrowSideValue)}.</li>
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
