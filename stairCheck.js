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
    
    // Formats possibles: "6'2", "6' 2", "6 2", "6-2", "6 ft 2 in", "6'2\"", "6'-2", "6'-2 1/4", etc.
    imperialValue = imperialValue.toString().trim();
    
    // Adapté spécifiquement au format "6'-9 1/4""
    const specialFormat = imperialValue.match(/^(\d+(?:\.\d+)?)'[-\s]*(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?(?:\s*(?:"|in|inch|inches))?$/);
    if (specialFormat) {
        const feet = parseFloat(specialFormat[1]) || 0;
        const inches = parseFloat(specialFormat[2]) || 0;
        const fraction = specialFormat[3] && specialFormat[4] ? 
            parseFloat(specialFormat[3]) / parseFloat(specialFormat[4]) : 0;
        const totalInches = feet * 12 + inches + fraction;
        return Math.round(totalInches * 25.4);
    }
    
    // Pour les valeurs simples en pouces (comme "10" ou "10 in")
    if (/^(\d+(?:\.\d+)?)(?:\s*(?:in|inch|inches|"))?$/.test(imperialValue)) {
        const inches = parseFloat(imperialValue);
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
            const feet = parseInt(match[1]) || 0;
            const inches = parseInt(match[2]) || 0;
            const fraction = match[3] && match[4] ? 
                parseInt(match[3]) / parseInt(match[4]) : 0;
            const totalInches = feet * 12 + inches + fraction;
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
            const feet = parseFloat(match[1]) || 0;
            const inches = match[2] ? parseFloat(match[2]) : 0;
            const totalInches = feet * 12 + inches;
            return Math.round(totalInches * 25.4);
        }
    }
    
    // Pour les fractions (par exemple, "6 1/2")
    const fractionMatch = imperialValue.match(/^(\d+(?:\.\d+)?)(?:\s*)(\d+)\/(\d+)(?:\s*(?:"|in|inch|inches))?$/);
    if (fractionMatch) {
        const wholeNumber = parseFloat(fractionMatch[1]) || 0;
        const numerator = parseFloat(fractionMatch[2]);
        const denominator = parseFloat(fractionMatch[3]);
        const inches = wholeNumber + (numerator / denominator);
        return Math.round(inches * 25.4);
    }
    
    // Pour les pieds avec fractions de pouce (par exemple "6' 1/2")
    const feetWithFractionMatch = imperialValue.match(/^(\d+(?:\.\d+)?)'(?:\s*)(\d+)\/(\d+)(?:\s*(?:"|in|inch|inches))?$/);
    if (feetWithFractionMatch) {
        const feet = parseFloat(feetWithFractionMatch[1]) || 0;
        const numerator = parseFloat(feetWithFractionMatch[2]);
        const denominator = parseFloat(feetWithFractionMatch[3]);
        const totalInches = feet * 12 + (numerator / denominator);
        return Math.round(totalInches * 25.4);
    }
    
    // Si aucun format ne correspond
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

                // Visualiser l'escalier pour la meilleure solution
                if (bestSolution) {
                    const stairParams = {
                        numRisers: bestSolution.numRisers,
                        numTreads: bestSolution.numTreads,
                        riserHeight: bestSolution.riserHeight,
                        treadDepth: bestSolution.treadDepth,
                        stairWidth: stairWidthValue
                    };
                    
                    // Visualiser l'escalier après que le DOM a été mis à jour
                    setTimeout(() => {
                        visualizeStair('calcStairVisualization', stairConfigValue, stairParams);
                    }, 0);
                }
            }
            
            calculatorResult.style.display = 'block';
        });
    }
    
    // Initialiser l'affichage en fonction des sélections initiales
    if (stairConfig) stairConfig.dispatchEvent(new Event('change'));
    if (calcStairConfig) calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
});
                
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
                `; else {
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
                            <p>${bestSolution.stepRule.isValid ? "✓ Cette solution respecte les critères de confort (au moins 2 des 3 règles sont satisfaites)." : "⚠ Cette solution ne respecte pas pleinement les critères de confort (moins de 2 règles satisfaites)."}
</p>
                        </div>
                    `;

                    // Ajouter la visualisation de l'escalier
                    detailsHtml += `
                        <div class="result-section">
                            <h3>Visualisation de l'escalier</h3>
                            <div id="calcStairVisualization"></div>
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

// Fonction pour créer un canvas pour visualiser l'escalier
function createStairCanvas(containerId, width, height) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Vérifier si un canvas existe déjà
    let canvas = container.querySelector('canvas');
    if (canvas) {
        // Si le canvas existe, simplement mettre à jour ses dimensions
        canvas.width = width;
        canvas.height = height;
    } else {
        // Créer un nouveau canvas
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.border = '1px solid #ccc';
        canvas.style.marginTop = '20px';
        canvas.style.marginBottom = '20px';
        canvas.style.display = 'block';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        
        // Ajouter le canvas au conteneur
        container.appendChild(canvas);
    }
    
    return canvas;
}

// Fonction pour dessiner un escalier droit
function drawStraightStair(canvas, stairParams) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Extraire les paramètres de l'escalier
    const { numRisers, numTreads, riserHeight, treadDepth, stairWidth } = stairParams;
    
    // Calculer les dimensions pour le dessin
    const totalRise = numRisers * riserHeight;
    const totalRun = numTreads * treadDepth;
    
    // Calculer l'échelle pour ajuster l'escalier au canvas
    // Gardons une marge de 40px de chaque côté
    const margin = 40;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    
    const scale = Math.min(
        availableWidth / totalRun,
        availableHeight / totalRise
    );
    
    // Position de départ (en bas à gauche)
    const startX = margin;
    const startY = height - margin;
    
    // Ligne de sol
    ctx.beginPath();
    ctx.moveTo(startX - 20, startY);
    ctx.lineTo(startX + totalRun * scale + 20, startY);
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Dessiner les marches
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Dessiner chaque marche
    for (let i = 0; i < numRisers; i++) {
        const x1 = startX + i * treadDepth * scale;
        const y1 = startY - (i + 1) * riserHeight * scale;
        
        // Ligne verticale (contremarche)
        ctx.lineTo(x1, y1);
        
        // Ligne horizontale (giron) sauf pour la dernière marche
        if (i < numRisers - 1) {
            ctx.lineTo(x1 + treadDepth * scale, y1);
        }
    }
    
    // Dessiner le plancher supérieur
    const topFloorX = startX + totalRun * scale;
    const topFloorY = startY - totalRise * scale;
    ctx.lineTo(topFloorX + 40, topFloorY);
    
    // Tracer l'escalier
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dessiner une main courante
    ctx.beginPath();
    ctx.moveTo(startX, startY - riserHeight * scale - 60); // Placer la main courante à une hauteur appropriée
    
    // Suivre l'inclinaison de l'escalier
    for (let i = 0; i <= numTreads; i++) {
        const x = startX + i * treadDepth * scale;
        const y = startY - i * riserHeight * scale - 60;
        ctx.lineTo(x, y);
    }
    
    // Prolonger la main courante horizontalement
    ctx.lineTo(topFloorX + 30, topFloorY - 60);
    
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Ajouter des légendes
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    // Légende pour la hauteur totale
    ctx.fillText(`Hauteur: ${Math.round(totalRise)}mm`, startX - 30, startY - totalRise * scale / 2);
    
    // Légende pour la longueur totale
    ctx.fillText(`Longueur: ${Math.round(totalRun)}mm`, startX + totalRun * scale / 2 - 50, startY + 20);
    
    // Légende pour la hauteur d'une contremarche et le giron
    ctx.fillText(`CM: ${Math.round(riserHeight)}mm`, startX + 10, startY - riserHeight * scale / 2);
    ctx.fillText(`Giron: ${Math.round(treadDepth)}mm`, startX + treadDepth * scale / 2 - 30, startY - riserHeight * scale - 10);
    
    // Informations générales
    ctx.fillText(`Total: ${numRisers} contremarches, ${numTreads} girons`, startX, startY + 40);
}

// Fonction pour dessiner les marches rayonnantes
function drawRadiusSteps(ctx, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, numSteps, scale = 1) {
    const angleStep = (endAngle - startAngle) / numSteps;
    
    // Dessiner les marches rayonnantes
    for (let i = 0; i < numSteps; i++) {
        const angle1 = startAngle + i * angleStep;
        const angle2 = startAngle + (i + 1) * angleStep;
        
        // Points de la marche rayonnante
        const innerX1 = centerX + innerRadius * Math.cos(angle1);
        const innerY1 = centerY + innerRadius * Math.sin(angle1);
        const outerX1 = centerX + outerRadius * Math.cos(angle1);
        const outerY1 = centerY + outerRadius * Math.sin(angle1);
        const innerX2 = centerX + innerRadius * Math.cos(angle2);
        const innerY2 = centerY + innerRadius * Math.sin(angle2);
        const outerX2 = centerX + outerRadius * Math.cos(angle2);
        const outerY2 = centerY + outerRadius * Math.sin(angle2);
        
        // Dessiner la marche
        ctx.beginPath();
        ctx.moveTo(innerX1, innerY1);
        ctx.lineTo(outerX1, outerY1);
        ctx.lineTo(outerX2, outerY2);
        ctx.lineTo(innerX2, innerY2);
        ctx.closePath();
        
        // Remplir avec une couleur légère alternée
        ctx.fillStyle = i % 2 === 0 ? '#f5f5f5' : '#e5e5e5';
        ctx.fill();
        ctx.stroke();
    }
}

// Fonction pour dessiner un escalier tournant (L ou U)
function drawTurningStair(canvas, stairParams, turnType) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Extraire les paramètres de l'escalier
    const { numRisers, numTreads, riserHeight, treadDepth, stairWidth } = stairParams;
    
    // Calculer les dimensions pour le dessin
    const totalRise = numRisers * riserHeight;
    
    // Définir le nombre de marches dans chaque section
    let stepsBeforeTurn = 0, stepsInTurn = 0, stepsAfterTurn = 0;
    let turnAngle = 0; // angle en radians pour les marches rayonnantes
    
    if (turnType === 'l_shaped') {
        // Escalier en L - environ 2/3 avant le virage, 1/3 après
        stepsBeforeTurn = Math.floor(numTreads * 0.6);
        stepsInTurn = 3; // Nombre de marches rayonnantes dans le virage
        stepsAfterTurn = numTreads - stepsBeforeTurn - stepsInTurn;
        turnAngle = Math.PI / 2; // 90 degrés
    } else if (turnType === 'u_shaped') {
        // Escalier en U - environ 1/3 dans chaque section
        stepsBeforeTurn = Math.floor(numTreads / 3);
        stepsInTurn = 6; // Marches dans les deux virages
        stepsAfterTurn = numTreads - stepsBeforeTurn - stepsInTurn;
        turnAngle = Math.PI; // 180 degrés
    } else {
        // Par défaut, volée droite
        stepsBeforeTurn = numTreads;
        stepsInTurn = 0;
        stepsAfterTurn = 0;
    }
    
    // Calculer les dimensions pour le dessin
    let totalWidth, totalDepth;
    
    if (turnType === 'l_shaped') {
        totalWidth = stepsBeforeTurn * treadDepth + stairWidth;
        totalDepth = stepsAfterTurn * treadDepth + stairWidth;
    } else if (turnType === 'u_shaped') {
        totalWidth = stepsBeforeTurn * treadDepth + stairWidth * 2;
        totalDepth = Math.max(stepsAfterTurn * treadDepth, stairWidth) + stairWidth;
    } else {
        totalWidth = numTreads * treadDepth;
        totalDepth = stairWidth;
    }
    
    // Calculer l'échelle pour ajuster l'escalier au canvas
    const margin = 40;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    
    const scale = Math.min(
        availableWidth / Math.max(totalWidth, totalDepth),
        availableHeight / Math.max(totalRise, totalWidth, totalDepth)
    ) * 0.8; // Réduire un peu pour une meilleure visibilité
    
    // Position de départ (en bas à gauche)
    const startX = width / 2 - (totalWidth * scale) / 2;
    const startY = height / 2 + (totalDepth * scale) / 2;
    
    // Dessiner l'escalier en fonction du type
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    if (turnType === 'l_shaped') {
        // Dessiner un escalier en L
        
        // 1. Première volée (droite) - montante vers la droite
        for (let i = 0; i < stepsBeforeTurn; i++) {
            const x1 = startX + i * treadDepth * scale;
            const y1 = startY - riserHeight * (i + 1) * scale;
            const x2 = x1 + treadDepth * scale;
            const y2 = y1;
            
            // Dessiner la marche
            ctx.beginPath();
            ctx.moveTo(x1, startY - i * riserHeight * scale); // Point bas gauche
            ctx.lineTo(x1, y1); // Point haut gauche
            ctx.lineTo(x2, y2); // Point haut droit
            ctx.lineTo(x2, startY - i * riserHeight * scale); // Point bas droit
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
            ctx.fill();
            ctx.stroke();
        }
        
        // 2. Marches rayonnantes dans le virage
        const cornerX = startX + stepsBeforeTurn * treadDepth * scale;
        const cornerY = startY - stepsBeforeTurn * riserHeight * scale;
        const radiusInner = stairWidth * scale * 0.2;
        const radiusOuter = stairWidth * scale;
        
        // Dessiner les marches rayonnantes
        drawRadiusSteps(
            ctx, 
            cornerX, 
            cornerY, 
            radiusInner, 
            radiusOuter, 
            -Math.PI/2, 
            0, 
            stepsInTurn,
            scale
        );
        
        // 3. Deuxième volée (droite) - montante vers le haut
        for (let i = 0; i < stepsAfterTurn; i++) {
            const x1 = cornerX + radiusOuter;
            const y1 = cornerY - i * riserHeight * scale;
            const y2 = y1 - riserHeight * scale;
            
            // Dessiner la marche
            ctx.beginPath();
            ctx.moveTo(x1, y1); // Point bas gauche
            ctx.lineTo(x1 + stairWidth * scale, y1); // Point bas droit
            ctx.lineTo(x1 + stairWidth * scale, y2); // Point haut droit
            ctx.lineTo(x1, y2); // Point haut gauche
            ctx.closePath();
            ctx.fillStyle = (i + stepsBeforeTurn + stepsInTurn) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
            ctx.fill();
            ctx.stroke();
        }
        
        // Dessiner les lignes principales de la cage d'escalier
        ctx.beginPath();
        // Ligne de base
        ctx.moveTo(startX, startY);
        ctx.lineTo(cornerX + radiusOuter + stairWidth * scale, startY);
        // Ligne du côté droit
        ctx.moveTo(cornerX + radiusOuter + stairWidth * scale, startY);
        ctx.lineTo(cornerX + radiusOuter + stairWidth * scale, cornerY - stepsAfterTurn * riserHeight * scale - 40);
        // Ligne du mur gauche
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, startY - (stepsBeforeTurn + 3) * riserHeight * scale);
        // Ligne du mur supérieur
        ctx.lineTo(cornerX + radiusOuter, cornerY - stepsAfterTurn * riserHeight * scale - 40);
        ctx.strokeStyle = '#555';
        ctx.stroke();
        
        // Main courante
        ctx.beginPath();
        // Première partie - montante vers la droite
        ctx.moveTo(startX, startY - 40);
        for (let i = 0; i <= stepsBeforeTurn; i++) {
            ctx.lineTo(startX + i * treadDepth * scale, startY - i * riserHeight * scale - 40);
        }
        
        // Partie rayonnante
        const handRailRadius = radiusInner + (radiusOuter - radiusInner) / 2;
        for (let i = 0; i <= stepsInTurn; i++) {
            const angle = -Math.PI/2 + (i / stepsInTurn) * Math.PI/2;
            const x = cornerX + handRailRadius * Math.cos(angle);
            const y = cornerY + handRailRadius * Math.sin(angle);
            ctx.lineTo(x, y - 40);
        }
        
        // Deuxième partie - montante vers le haut
        for (let i = 0; i <= stepsAfterTurn; i++) {
            ctx.lineTo(cornerX + radiusOuter + stairWidth * scale / 2, cornerY - i * riserHeight * scale - 40);
        }
        
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
    } else if (turnType === 'u_shaped') {
        // Dessiner un escalier en U
        
        // 1. Première volée (droite) - montante vers la droite
        for (let i = 0; i < stepsBeforeTurn; i++) {
            const x1 = startX + i * treadDepth * scale;
            const y1 = startY - riserHeight * (i + 1) * scale;
            const x2 = x1 + treadDepth * scale;
            const y2 = y1;
            
            // Dessiner la marche
            ctx.beginPath();
            ctx.moveTo(x1, startY - i * riserHeight * scale); // Point bas gauche
            ctx.lineTo(x1, y1); // Point haut gauche
            ctx.lineTo(x2, y2); // Point haut droit
            ctx.lineTo(x2, startY - i * riserHeight * scale); // Point bas droit
            ctx.closePath();
            ctx.fillStyle = i % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
            ctx.fill();
            ctx.stroke();
        }
        
        // 2. Premier virage
        const corner1X = startX + stepsBeforeTurn * treadDepth * scale;
        const corner1Y = startY - stepsBeforeTurn * riserHeight * scale;
        const radiusInner1 = stairWidth * scale * 0.2;
        const radiusOuter1 = stairWidth * scale;
        
        // Dessiner les marches rayonnantes du premier virage
        drawRadiusSteps(
            ctx, 
            corner1X, 
            corner1Y, 
            radiusInner1, 
            radiusOuter1, 
            -Math.PI/2, 
            0, 
            3,
            scale
        );
        
        // 3. Volée intermédiaire - montante vers la gauche
        const midSteps = stepsInTurn - 6; // Retirer les marches utilisées dans les virages
        for (let i = 0; i < midSteps; i++) {
            const x1 = corner1X + radiusOuter1 - i * treadDepth * scale;
            const y1 = corner1Y - 3 * riserHeight * scale - i * riserHeight * scale;
            const x2 = x1 - treadDepth * scale;
            const y2 = y1;
            
            // Dessiner la marche
            ctx.beginPath();
            ctx.moveTo(x1, y1 + riserHeight * scale); // Point bas droit
            ctx.lineTo(x1, y1); // Point haut droit
            ctx.lineTo(x2, y2); // Point haut gauche
            ctx.lineTo(x2, y2 + riserHeight * scale); // Point bas gauche
            ctx.closePath();
            ctx.fillStyle = (i + stepsBeforeTurn + 3) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
            ctx.fill();
            ctx.stroke();
        }
        
        // 4. Deuxième virage
        const corner2X = corner1X + radiusOuter1 - midSteps * treadDepth * scale;
        const corner2Y = corner1Y - 3 * riserHeight * scale - midSteps * riserHeight * scale;
        const radiusInner2 = stairWidth * scale * 0.2;
        const radiusOuter2 = stairWidth * scale;
        
        // Dessiner les marches rayonnantes du deuxième virage
        drawRadiusSteps(
            ctx, 
            corner2X, 
            corner2Y, 
            radiusInner2, 
            radiusOuter2, 
            0, 
            Math.PI/2, 
            3,
            scale
        );
        
        // 5. Troisième volée - montante vers la droite
        for (let i = 0; i < stepsAfterTurn; i++) {
            const x1 = corner2X - radiusOuter2 + i * treadDepth * scale;
            const y1 = corner2Y - radiusOuter2 - i * riserHeight * scale;
            const x2 = x1 + treadDepth * scale;
            const y2 = y1;
            
            // Dessiner la marche
            ctx.beginPath();
            ctx.moveTo(x1, y1 + riserHeight * scale); // Point bas gauche
            ctx.lineTo(x1, y1); // Point haut gauche
            ctx.lineTo(x2, y2); // Point haut droit
            ctx.lineTo(x2, y2 + riserHeight * scale); // Point bas droit
            ctx.closePath();
            ctx.fillStyle = (i + stepsBeforeTurn + midSteps + 6) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
            ctx.fill();
            ctx.stroke();
        }
        
        // Dessiner les lignes principales de la cage d'escalier
        ctx.beginPath();
        // Ligne de base
        ctx.moveTo(startX, startY);
        ctx.lineTo(corner1X + radiusOuter1, startY);
        // Côté droit
        ctx.moveTo(corner1X + radiusOuter1, startY);
        ctx.lineTo(corner1X + radiusOuter1, corner1Y - stairWidth * scale);
        // Côté gauche
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX, corner2Y - radiusOuter2 - stepsAfterTurn * riserHeight * scale);
        // Ligne intermédiaire
        ctx.moveTo(corner2X - radiusOuter2, corner2Y - radiusOuter2);
        ctx.lineTo(corner2X - radiusOuter2 + stepsAfterTurn * treadDepth * scale, corner2Y - radiusOuter2);
        ctx.strokeStyle = '#555';
        ctx.stroke();
        
        // Main courante
        ctx.beginPath();
        // Première partie
        ctx.moveTo(startX + 20, startY - 40);
        for (let i = 0; i <= stepsBeforeTurn; i++) {
            ctx.lineTo(startX + i * treadDepth * scale + 20, startY - i * riserHeight * scale - 40);
        }
        
        // Premier virage
        const handRailRadius1 = radiusInner1 + (radiusOuter1 - radiusInner1) / 2;
        for (let i = 0; i <= 3; i++) {
            const angle = -Math.PI/2 + (i / 3) * Math.PI/2;
            const x = corner1X + handRailRadius1 * Math.cos(angle);
            const y = corner1Y + handRailRadius1 * Math.sin(angle);
            ctx.lineTo(x, y - 40);
        }
        
        // Partie intermédiaire
        for (let i = 0; i <= midSteps; i++) {
            ctx.lineTo(corner1X + radiusOuter1 - i * treadDepth * scale - 20, corner1Y - 3 * riserHeight * scale - i * riserHeight * scale - 40);
        }
        
        // Deuxième virage
        const handRailRadius2 = radiusInner2 + (radiusOuter2 - radiusInner2) / 2;
        for (let i = 0; i <= 3; i++) {
            const angle = 0 + (i / 3) * Math.PI/2;
            const x = corner2X + handRailRadius2 * Math.cos(angle);
            const y = corner2Y + handRailRadius2 * Math.sin(angle);
            ctx.lineTo(x, y - 40);
        }
        
        // Dernière partie
        for (let i = 0; i <= stepsAfterTurn; i++) {
            ctx.lineTo(corner2X - radiusOuter2 + i * treadDepth * scale + 20, corner2Y - radiusOuter2 - i * riserHeight * scale - 40);
        }
        
        ctx.strokeStyle = '#777';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
    } else {
        // Si ce n'est ni un L ni un U, dessiner un escalier droit standard
        drawStraightStair(canvas, stairParams);
        return;
    }
    
    // Ajouter des légendes
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    // Informations générales
    ctx.fillText(`Total: ${numRisers} contremarches, ${numTreads} girons`, startX, startY + 30);
    ctx.fillText(`CM: ${Math.round(riserHeight)}mm, Giron: ${Math.round(treadDepth)}mm`, startX, startY + 50);
}

// Fonction pour dessiner un escalier avec marches dansantes
function drawDancingSteps(canvas, stairParams) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Extraire les paramètres de l'escalier
    const { numRisers, numTreads, riserHeight, treadDepth, stairWidth } = stairParams;
    
    // Calculer les dimensions pour le dessin
    const totalRise = numRisers * riserHeight;
    
    // Distribuer les marches
    const stepsBeforeTurn = Math.floor(numTreads * 0.4);
    const dancingSteps = Math.floor(numTreads * 0.3);
    const stepsAfterTurn = numTreads - stepsBeforeTurn - dancingSteps;
    
    // Calculer les dimensions totales
    const totalWidth = stepsBeforeTurn * treadDepth + stairWidth * 1.5;
    const totalDepth = stepsAfterTurn * treadDepth + stairWidth * 1.5;
    
    // Calculer l'échelle pour ajuster l'escalier au canvas
    const margin = 40;
    const availableWidth = width - 2 * margin;
    const availableHeight = height - 2 * margin;
    
    const scale = Math.min(
        availableWidth / Math.max(totalWidth, totalDepth),
        availableHeight / Math.max(totalRise, totalWidth, totalDepth)
    ) * 0.8; // Réduire un peu pour une meilleure visibilité
    
    // Position de départ (en bas à gauche)
    const startX = width / 2 - (totalWidth * scale) / 2;
    const startY = height / 2 + (totalDepth * scale) / 2;
    
    // Dessiner l'escalier
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // 1. Première volée droite
    for (let i = 0; i < stepsBeforeTurn; i++) {
        const x1 = startX + i * treadDepth * scale;
        const y1 = startY - riserHeight * (i + 1) * scale;
        const x2 = x1 + treadDepth * scale;
        const y2 = y1;
        
        // Dessiner la marche
        ctx.beginPath();
        ctx.moveTo(x1, startY - i * riserHeight * scale); // Point bas gauche
        ctx.lineTo(x1, y1); // Point haut gauche
        ctx.lineTo(x2, y2); // Point haut droit
        ctx.lineTo(x2, startY - i * riserHeight * scale); // Point bas droit
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
        ctx.fill();
        ctx.stroke();
    }
    
    // 2. Marches dansantes
    const turnCenterX = startX + stepsBeforeTurn * treadDepth * scale + stairWidth * scale / 2;
    const turnCenterY = startY - stepsBeforeTurn * riserHeight * scale - stairWidth * scale / 2;
    const turnRadius = stairWidth * scale;
    
    // Dessiner les marches dansantes
    const startAngle = -Math.PI/2;
    const endAngle = 0;
    
    for (let i = 0; i < dancingSteps; i++) {
        const angle1 = startAngle + (i / dancingSteps) * (endAngle - startAngle);
        const angle2 = startAngle + ((i + 1) / dancingSteps) * (endAngle - startAngle);
        
        // Points de la marche dansante
        const innerX1 = turnCenterX + turnRadius * 0.3 * Math.cos(angle1);
        const innerY1 = turnCenterY + turnRadius * 0.3 * Math.sin(angle1);
        const outerX1 = turnCenterX + turnRadius * Math.cos(angle1);
        const outerY1 = turnCenterY + turnRadius * Math.sin(angle1);
        const innerX2 = turnCenterX + turnRadius * 0.3 * Math.cos(angle2);
        const innerY2 = turnCenterY + turnRadius * 0.3 * Math.sin(angle2);
        const outerX2 = turnCenterX + turnRadius * Math.cos(angle2);
        const outerY2 = turnCenterY + turnRadius * Math.sin(angle2);
        
        // Dessiner les lignes de la marche
        ctx.beginPath();
        ctx.moveTo(innerX1, innerY1 - i * riserHeight * scale / dancingSteps);
        ctx.lineTo(outerX1, outerY1 - i * riserHeight * scale / dancingSteps);
        ctx.lineTo(outerX2, outerY2 - (i + 1) * riserHeight * scale / dancingSteps);
        ctx.lineTo(innerX2, innerY2 - (i + 1) * riserHeight * scale / dancingSteps);
        ctx.closePath();
        
        // Remplir et tracer
        ctx.fillStyle = (i + stepsBeforeTurn) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
        ctx.fill();
        ctx.stroke();
    }
    
    // 3. Dernière volée droite
    const lastStartX = turnCenterX + turnRadius;
    const lastStartY = turnCenterY - dancingSteps * riserHeight * scale;
    
    for (let i = 0; i < stepsAfterTurn; i++) {
        const x1 = lastStartX;
        const y1 = lastStartY - i * riserHeight * scale;
        const y2 = y1 - riserHeight * scale;
        
        // Dessiner la marche
        ctx.beginPath();
        ctx.moveTo(x1, y1); // Point bas gauche
        ctx.lineTo(x1 + stairWidth * scale, y1); // Point bas droit
        ctx.lineTo(x1 + stairWidth * scale, y2); // Point haut droit
        ctx.lineTo(x1, y2); // Point haut gauche
        ctx.closePath();
        ctx.fillStyle = (i + stepsBeforeTurn + dancingSteps) % 2 === 0 ? '#f0f0f0' : '#e0e0e0';
        ctx.fill();
        ctx.stroke();
    }
    
    // Dessiner les lignes principales de la cage d'escalier
    ctx.beginPath();
    // Ligne de base
    ctx.moveTo(startX, startY);
    ctx.lineTo(lastStartX + stairWidth * scale, startY);
    // Ligne du côté droit
    ctx.moveTo(lastStartX + stairWidth * scale, startY);
    ctx.lineTo(lastStartX + stairWidth * scale, lastStartY - stepsAfterTurn * riserHeight * scale - 40);
    // Ligne du mur gauche
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - (stepsBeforeTurn + dancingSteps) * riserHeight * scale);
    // Ligne du mur supérieur
    ctx.lineTo(lastStartX, lastStartY - stepsAfterTurn * riserHeight * scale - 40);
    ctx.strokeStyle = '#555';
    ctx.stroke();
    
    // Main courante
    ctx.beginPath();
    ctx.moveTo(startX, startY - 40);
    // Première section
    for (let i = 0; i <= stepsBeforeTurn; i++) {
        ctx.lineTo(startX + i * treadDepth * scale, startY - i * riserHeight * scale - 40);
    }
    // Section des marches dansantes
    for (let i = 0; i <= dancingSteps; i++) {
        const angle = startAngle + (i / dancingSteps) * (endAngle - startAngle);
        const x = turnCenterX + turnRadius * 0.8 * Math.cos(angle);
        const y = turnCenterY + turnRadius * 0.8 * Math.sin(angle) - i * riserHeight * scale / dancingSteps - 40;
        ctx.lineTo(x, y);
    }
    // Dernière section
    for (let i = 0; i <= stepsAfterTurn; i++) {
        ctx.lineTo(lastStartX + stairWidth * scale / 2, lastStartY - i * riserHeight * scale - 40);
    }
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Illustration du côté étroit des marches dansantes
    ctx.beginPath();
    ctx.moveTo(turnCenterX, turnCenterY - 60);
    ctx.lineTo(turnCenterX + 20, turnCenterY - 60);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ajouter des légendes
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    // Informations générales
    ctx.fillText(`Total: ${numRisers} contremarches, ${numTreads} girons`, startX, startY + 30);
    ctx.fillText(`CM: ${Math.round(riserHeight)}mm, Giron: ${Math.round(treadDepth)}mm`, startX, startY + 50);
    ctx.fillText(`Marches dansantes: ${dancingSteps}`, startX, startY + 70);
    
    // Légende pour le côté étroit
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('Côté étroit min: 300mm', turnCenterX - 40, turnCenterY - 80);
}

// Fonction pour dessiner un escalier hélicoïdal (spiral)
function drawSpiralStair(canvas, stairParams) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Extraire les paramètres de l'escalier
    const { numRisers, riserHeight, stairWidth } = stairParams;
    
    // Calculer le centre de l'escalier hélicoïdal
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Rayon intérieur et extérieur
    const innerRadius = Math.min(width, height) * 0.1;
    const outerRadius = Math.min(width, height) * 0.4;
    
    // Dessiner le noyau central (poteau)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#999';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dessiner les marches en spirale avec une meilleure représentation 3D
    for (let i = 0; i < numRisers; i++) {
        const startAngle = (i / numRisers) * Math.PI * 2;
        const endAngle = ((i + 1) / numRisers) * Math.PI * 2;
        
        // Calcul de la hauteur pour l'effet 3D
        const heightOffset = (numRisers - i) * 1.5;
        
        // Dessiner une marche avec effet 3D
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, outerRadius, endAngle, startAngle, true);
        ctx.closePath();
        
        // Remplir avec une couleur qui dépend de la "hauteur"
        const brightness = 150 + heightOffset;
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.fill();
        
        // Bordure de la marche
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Dessiner les lignes de profondeur pour un effet 3D
        if (i % 2 === 0) {
            ctx.beginPath();
            const midAngle = (startAngle + endAngle) / 2;
            ctx.moveTo(centerX + innerRadius * Math.cos(midAngle), centerY + innerRadius * Math.sin(midAngle));
            ctx.lineTo(centerX + outerRadius * Math.cos(midAngle), centerY + outerRadius * Math.sin(midAngle));
            ctx.strokeStyle = '#777';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    }
    
    // Dessiner la main courante
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        const x = centerX + outerRadius * Math.cos(angle);
        const y = centerY + outerRadius * Math.sin(angle);
        if (angle === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Dessiner une seconde main courante (intérieure)
    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        const x = centerX + innerRadius * 0.9 * Math.cos(angle);
        const y = centerY + innerRadius * 0.9 * Math.sin(angle);
        if (angle === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Dessiner une flèche pour indiquer le sens de montée
    ctx.beginPath();
    const arrowAngle = Math.PI / 4;  // 45 degrés
    const arrowX1 = centerX + (innerRadius + outerRadius) / 2 * Math.cos(arrowAngle);
    const arrowY1 = centerY + (innerRadius + outerRadius) / 2 * Math.sin(arrowAngle);
    ctx.moveTo(arrowX1, arrowY1);
    
    // Pointe de la flèche
    const arrowLength = 30;
    const arrowX2 = arrowX1 + arrowLength * Math.cos(arrowAngle - Math.PI / 6);
    const arrowY2 = arrowY1 + arrowLength * Math.sin(arrowAngle - Math.PI / 6);
    
    ctx.lineTo(arrowX2, arrowY2);
    
    // Dessiner la tête de la flèche
    const headSize = 10;
    ctx.lineTo(arrowX2 - headSize * Math.cos(arrowAngle - Math.PI / 3), 
               arrowY2 - headSize * Math.sin(arrowAngle - Math.PI / 3));
    ctx.moveTo(arrowX2, arrowY2);
    ctx.lineTo(arrowX2 - headSize * Math.cos(arrowAngle + Math.PI / 3), 
               arrowY2 - headSize * Math.sin(arrowAngle + Math.PI / 3));
    
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ajouter des légendes
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(`Escalier hélicoïdal: ${numRisers} marches`, centerX - 80, centerY + outerRadius + 30);
    ctx.fillText(`Hauteur contremarche: ${Math.round(riserHeight)}mm`, centerX - 80, centerY + outerRadius + 50);
    ctx.fillText(`Largeur: ${Math.round(stairWidth)}mm`, centerX - 80, centerY + outerRadius + 70);
    
    // Ajouter une légende pour le diamètre
    const diameter = outerRadius * 2;
    ctx.fillText(`Diamètre extérieur: ${Math.round(diameter * 3.5)}mm`, centerX - 80, centerY + outerRadius + 90);
    
    // Dessiner une ligne de mesure pour le diamètre
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius, centerY + outerRadius + 15);
    ctx.lineTo(centerX + outerRadius, centerY + outerRadius + 15);
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Ajouter des flèches aux extrémités de la ligne de mesure
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius, centerY + outerRadius + 15);
    ctx.lineTo(centerX - outerRadius + 5, centerY + outerRadius + 10);
    ctx.moveTo(centerX - outerRadius, centerY + outerRadius + 15);
    ctx.lineTo(centerX - outerRadius + 5, centerY + outerRadius + 20);
    ctx.moveTo(centerX + outerRadius, centerY + outerRadius + 15);
    ctx.lineTo(centerX + outerRadius - 5, centerY + outerRadius + 10);
    ctx.moveTo(centerX + outerRadius, centerY + outerRadius + 15);
    ctx.lineTo(centerX + outerRadius - 5, centerY + outerRadius + 20);
    ctx.stroke();
}

// Fonction principale pour visualiser l'escalier
function visualizeStair(containerId, stairConfig, stairParams) {
    // Définir les dimensions du canvas
    const width = 500;
    const height = 400;
    
    // Créer ou récupérer le canvas
    const canvas = createStairCanvas(containerId, width, height);
    if (!canvas) return;
    
    // Dessiner l'escalier en fonction du type
    switch (stairConfig) {
        case 'straight':
            drawStraightStair(canvas, stairParams);
            break;
            
        case 'l_shaped':
        case 'turning_30':
        case 'turning_45':
        case 'turning_60':
            drawTurningStair(canvas, stairParams, 'l_shaped');
            break;
            
        case 'u_shaped':
            drawTurningStair(canvas, stairParams, 'u_shaped');
            break;
            
        case 'spiral':
            drawSpiralStair(canvas, stairParams);
            break;
            
        case 'dancing_steps':
            drawDancingSteps(canvas, stairParams);
            break;
            
        default:
            // Par défaut, dessiner un escalier droit
            drawStraightStair(canvas, stairParams);
    }
}

// Ajouter des styles pour le canvas de visualisation
function addStairStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #stairVisualization, #calcStairVisualization {
            margin: 20px 0;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
            text-align: center;
        }
        canvas {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function() {
    // Ajouter les styles pour la visualisation
    addStairStyles();
    
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
        if (lShapedOptions) lShapedOptions.style.display = 'none';
        if (dancingStepsOptions) dancingStepsOptions.style.display = 'none';
        if (spiralOptions) spiralOptions.style.display = 'none';
        
        // Afficher les options appropriées selon la sélection
        if (this.value === 'l_shaped' && lShapedOptions) {
            lShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps' && dancingStepsOptions) {
            dancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral' && spiralOptions) {
            spiralOptions.style.display = 'block';
        }
    });
    
    // Gestion du changement de configuration d'escalier pour l'onglet calcul
    calcStairConfig.addEventListener('change', function() {
        // Masquer d'abord toutes les options conditionnelles
        if (calcLShapedOptions) calcLShapedOptions.style.display = 'none';
        if (calcDancingStepsOptions) calcDancingStepsOptions.style.display = 'none';
        if (calcSpiralOptions) calcSpiralOptions.style.display = 'none';
        
        // Afficher les options appropriées selon la sélection
        if (this.value === 'l_shaped' && calcLShapedOptions) {
            calcLShapedOptions.style.display = 'block';
        } else if (this.value === 'dancing_steps' && calcDancingStepsOptions) {
            calcDancingStepsOptions.style.display = 'block';
        } else if (this.value === 'spiral' && calcSpiralOptions) {
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
    if (buildingType) buildingType.addEventListener('change', updateRequirements);
    if (buildingUse) buildingUse.addEventListener('change', updateRequirements);
    if (stairType) stairType.addEventListener('change', updateRequirements);
    if (stairUse) stairUse.addEventListener('change', updateRequirements);

    function updateRequirements() {
        // Cette fonction sera utilisée pour ajuster les exigences en fonction
        // du type de bâtiment et de l'usage sélectionnés
        const isBuildingPart3 = buildingType && buildingType.value === 'part3';
        const isExitStair = stairUse && stairUse.value === 'exit';
    }

    // Vérification de la conformité
    if (checkButton) {
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

// Ajouter la visualisation de l'escalier
resultContent.innerHTML += '<div class="result-section"><h3>Visualisation de l\'escalier</h3><div id="stairVisualization"></div></div>';

// Estimer le nombre de marches pour la visualisation
let numRisers = Math.ceil(2000 / riserHeightValue); // Estimation approximative

// Paramètres pour la visualisation
const stairParams = {
    numRisers: numRisers,
    numTreads: numRisers - 1,
    riserHeight: riserHeightValue,
    treadDepth: treadDepthValue,
    stairWidth: stairWidthValue
};

// Visualiser l'escalier
visualizeStair('stairVisualization', config, stairParams);

result.style.display = 'block';
        });
    }
    
    // Calcul d'escalier
    if (calculateButton) {
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
                            <p>${bestSolution.stepRule.isValid ? "✓ Cette solution respecte les critères de confort (au moins 2 des 3 règles sont satisfaites)." : "⚠ Cette solution ne respecte pas pleinement les critères de confort (moins de 2 règles satisfaites)."}
</p>
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

                    // Ajouter la visualisation de l'escalier
                    detailsHtml += `
                        <div class="result-section">
                            <h3>Visualisation de l'escalier</h3>
                            <div id="calcStairVisualization"></div>
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

                // Visualiser l'escalier pour la meilleure solution
                if (bestSolution) {
                    const stairParams = {
                        numRisers: bestSolution.numRisers,
                        numTreads: bestSolution.numTreads,
                        riserHeight: bestSolution.riserHeight,
                        treadDepth: bestSolution.treadDepth,
                        stairWidth: stairWidthValue
                    };
                    
                    // Visualiser l'escalier après que le DOM a été mis à jour
                    setTimeout(() => {
                        visualizeStair('calcStairVisualization', stairConfigValue, stairParams);
                    }, 0);
                }
            }
            
            calculatorResult.style.display = 'block';
        });
    }
    
    // Initialiser l'affichage en fonction des sélections initiales
    if (stairConfig) stairConfig.dispatchEvent(new Event('change'));
    if (calcStairConfig) calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
});
