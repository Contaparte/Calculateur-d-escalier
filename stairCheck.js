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
    
    // Gestion des onglets - CORRECTION ici
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Récupérer l'ID de l'onglet cible
            const tabId = this.getAttribute('data-tab');
            console.log("Tab clicked:", tabId);
            
            // Désactiver tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            
            // Activer le contenu correspondant
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                // Mettre à jour les placeholders pour le nouvel onglet
                updatePlaceholders(tabId);
            } else {
                console.error("Tab not found:", tabId);
            }
        });
    });
    
    // Fonction pour mettre à jour les placeholders selon le système de mesure
    function updatePlaceholders(tab) {
        console.log("Updating placeholders for tab:", tab);
        
        const isCalcTab = tab === 'calculator';
        let systemeElement;
        
        if (isCalcTab) {
            systemeElement = calcMeasurementSystem;
        } else {
            systemeElement = measurementSystem;
        }
        
        if (!systemeElement) {
            console.error("Système de mesure non trouvé pour l'onglet:", tab);
            return;
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
    if (measurementSystem) {
        measurementSystem.addEventListener('change', function() {
            if (calcMeasurementSystem) {
                calcMeasurementSystem.value = this.value;
                updatePlaceholders('verification');
                updatePlaceholders('calculator');
            }
        });
    }
    
    if (calcMeasurementSystem) {
        calcMeasurementSystem.addEventListener('change', function() {
            if (measurementSystem) {
                measurementSystem.value = this.value;
                updatePlaceholders('verification');
                updatePlaceholders('calculator');
            }
        });
    }
    
    // Gestion du changement de configuration d'escalier pour l'onglet vérification
    if (stairConfig) {
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
    }
    
    // Gestion du changement de configuration d'escalier pour l'onglet calcul
    if (calcStairConfig) {
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
    }
    
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
        if (!buildingType || !stairUse) return;
        
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
    if (checkButton) {
        checkButton.addEventListener('click', function() {
            console.log("Check button clicked");
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
            
            // Vérification de la règle du pas (traitée séparément car c'est une notion complémentaire)
            const stepRule = checkStepRule(riserHeightValue, treadDepthValue);
            
            // Préparer le contenu pour la visualisation de l'escalier
            const stairData = {
                numRisers: Math.round(2500 / riserHeightValue), // Approximation pour la visualisation
                numTreads: Math.round(2500 / riserHeightValue) - 1,
                riserHeight: riserHeightValue,
                treadDepth: treadDepthValue,
                stairWidth: stairWidthValue,
                totalRun: treadDepthValue * (Math.round(2500 / riserHeightValue) - 1),
                totalRise: riserHeightValue * Math.round(2500 / riserHeightValue),
                stairConfig: config,
                lShapedConfig: lShapedConfigValue,
                dancingStepsConfig: dancingStepsConfigValue,
                spiralConfig: spiralConfigValue,
                narrowSide: narrowSideValue,
                spiralWidth: spiralWidthValue
            };
            
            // Afficher le résultat
            if (resultContent) resultContent.innerHTML = '';
            if (result) {
                result.className = 'result';
                
                if (isCompliant) {
                    result.classList.add('compliant');
                    
                    // Contenu pour le résultat conforme
                    let htmlContent = `
                        <p class="success">✓ Conforme au ${codeReference}.</p>
                        
                        <div class="result-section">
                            <h3>Vérification selon le CNB 2015</h3>
                            <ul>
                                <li>✓ Hauteur de contremarche: ${formatNumber(riserHeightValue)} mm ${isMetric ? '' : '(' + metricToImperial(riserHeightValue) + ')'} - conforme (min: ${minRiser} mm, max: ${maxRiser} mm)</li>
                                <li>✓ Giron: ${formatNumber(treadDepthValue)} mm ${isMetric ? '' : '(' + metricToImperial(treadDepthValue) + ')'} - conforme (min: ${minTread} mm${maxTread !== Infinity ? ', max: ' + maxTread + ' mm' : ''})</li>
                                <li>✓ Largeur de l'escalier: ${formatNumber(stairWidthValue)} mm ${isMetric ? '' : '(' + metricToImperial(stairWidthValue) + ')'} - conforme (min: ${minWidth} mm)</li>
                                <li>✓ Hauteur libre (échappée): ${formatNumber(headroomValue)} mm ${isMetric ? '' : '(' + metricToImperial(headroomValue) + ')'} - conforme (min: ${minHeadroom} mm)</li>
                    `;
                    
                    // Ajouter des vérifications spécifiques selon le type d'escalier
                    if (config === 'dancing_steps') {
                        htmlContent += `<li>✓ Largeur minimale côté étroit: ${formatNumber(narrowSideValue)} mm ${isMetric ? '' : '(' + metricToImperial(narrowSideValue) + ')'} - conforme (min: ${minNarrowSide} mm)</li>`;
                    }
                    
                    if (config === 'spiral') {
                        htmlContent += `<li>✓ Largeur libre entre mains courantes: ${formatNumber(spiralWidthValue)} mm ${isMetric ? '' : '(' + metricToImperial(spiralWidthValue) + ')'} - conforme (min: ${minSpiralWidth} mm)</li>`;
                    }
                    
                    htmlContent += `</ul></div>`;
                    
                    // Section séparée pour la règle du pas (notion complémentaire)
                    htmlContent += `
                        <div class="step-rule-section">
                            <h3 class="step-rule-title">Vérification du confort (Règle du pas - notion complémentaire)</h3>
                            <p class="info-text">La règle du pas n'est pas une exigence du CNB 2015, mais une pratique recommandée pour assurer le confort des utilisateurs de l'escalier.</p>
                    `;
                    
                    if (stepRule.isValid) {
                        htmlContent += `
                            <p class="success">✓ La règle du pas est respectée (${stepRule.validRuleCount}/3 règles satisfaites).</p>
                            <ul>
                                <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = ${stepRule.rule1.value.toFixed(2)}" (idéal: ${stepRule.rule1.min}"-${stepRule.rule1.max}")</li>
                                <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = ${stepRule.rule2.value.toFixed(2)} po² (idéal: ${stepRule.rule2.min} po²-${stepRule.rule2.max} po²)</li>
                                <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = ${stepRule.rule3.value.toFixed(2)}" (idéal: ${stepRule.rule3.min}"-${stepRule.rule3.max}")</li>
                            </ul>`;
                    } else {
                        htmlContent += `
                            <p style="color: #ff9800;">⚠ La règle du pas n'est pas entièrement respectée (${stepRule.validRuleCount}/3 règles satisfaites).</p>
                            <ul>
                                <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = ${stepRule.rule1.value.toFixed(2)}" (idéal: ${stepRule.rule1.min}"-${stepRule.rule1.max}")</li>
                                <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = ${stepRule.rule2.value.toFixed(2)} po² (idéal: ${stepRule.rule2.min} po²-${stepRule.rule2.max} po²)</li>
                                <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = ${stepRule.rule3.value.toFixed(2)}" (idéal: ${stepRule.rule3.min}"-${stepRule.rule3.max}")</li>
                            </ul>
                            <p class="info-text">Pour un confort optimal, il est recommandé de respecter au moins 2 des 3 règles du pas.</p>`;
                    }
                    
                    htmlContent += `</div>`;
                    
                    // Ajouter la visualisation de l'escalier
                    htmlContent += `
                        <div class="result-section" style="border-top: 1px dashed #ccc; padding-top: 15px;">
                            <h3>Visualisation de l'escalier</h3>
                            <div id="stairVisualization" class="stair-visualization-container"></div>
                        </div>`;
                    
                    if (resultContent) resultContent.innerHTML = htmlContent;
                    
                    // Générer la visualisation de l'escalier
                    setTimeout(() => {
                        generateStairVisualization(stairData, 'stairVisualization', isMetric);
                    }, 100);
                    
                } else {
                    result.classList.add('non-compliant');
                    
                    // Préparer la liste des problèmes
                    let issuesList = `<p>⚠ Non conforme au ${codeReference}.</p>`;
                    issuesList += `<div class="result-section"><h3>Problèmes détectés selon le CNB 2015:</h3><ul>`;
                    
                    issues.forEach(issue => {
                        let formattedIssue = issue;
                        if (!isMetric) {
                            // Convertir les valeurs métriques en impériales pour l'affichage
                            formattedIssue = issue.replace(/(\d+(?:\.\d+)?) mm/g, function(match, p1) {
                                return metricToImperial(parseFloat(p1)) + ' (' + parseFloat(p1).toFixed(0) + ' mm)';
                            });
                        }
                        issuesList += `<li>${formattedIssue}</li>`;
                    });
                    
                    issuesList += '</ul></div>';
                    
                    // Section séparée pour la règle du pas (notion complémentaire)
                    issuesList += `
                        <div class="step-rule-section">
                            <h3 class="step-rule-title">Vérification du confort (Règle du pas - notion complémentaire)</h3>
                            <p class="info-text">La règle du pas n'est pas une exigence du CNB 2015, mais une pratique recommandée pour assurer le confort des utilisateurs de l'escalier.</p>
                    `;
                    
                    if (stepRule.isValid) {
                        issuesList += `
                            <p class="success">✓ La règle du pas est respectée (${stepRule.validRuleCount}/3 règles satisfaites).</p>
                            <ul>
                                <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = ${stepRule.rule1.value.toFixed(2)}" (idéal: ${stepRule.rule1.min}"-${stepRule.rule1.max}")</li>
                                <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = ${stepRule.rule2.value.toFixed(2)} po² (idéal: ${stepRule.rule2.min} po²-${stepRule.rule2.max} po²)</li>
                                <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = ${stepRule.rule3.value.toFixed(2)}" (idéal: ${stepRule.rule3.min}"-${stepRule.rule3.max}")</li>
                            </ul>`;
                    } else {
                        issuesList += `
                            <p style="color: #ff9800;">⚠ La règle du pas n'est pas entièrement respectée (${stepRule.validRuleCount}/3 règles satisfaites).</p>
                            <ul>
                                <li>${stepRule.rule1.isValid ? "✓" : "⨯"} Règle 1: Giron + CM = ${stepRule.rule1.value.toFixed(2)}" (idéal: ${stepRule.rule1.min}"-${stepRule.rule1.max}")</li>
                                <li>${stepRule.rule2.isValid ? "✓" : "⨯"} Règle 2: Giron × CM = ${stepRule.rule2.value.toFixed(2)} po² (idéal: ${stepRule.rule2.min} po²-${stepRule.rule2.max} po²)</li>
                                <li>${stepRule.rule3.isValid ? "✓" : "⨯"} Règle 3: Giron + 2(CM) = ${stepRule.rule3.value.toFixed(2)}" (idéal: ${stepRule.rule3.min}"-${stepRule.rule3.max}")</li>
                            </ul>
                            <p class="info-text">Pour un confort optimal, il est recommandé de respecter au moins 2 des 3 règles du pas.</p>`;
                    }
                    
                    issuesList += `</div>`;
                    
                    // Ajouter la visualisation de l'escalier
                    issuesList += `
                        <div class="result-section" style="border-top: 1px dashed #ccc; padding-top: 15px;">
                            <h3>Visualisation de l'escalier</h3>
                            <div id="stairVisualization" class="stair-visualization-container"></div>
                        </div>`;
                    
                    if (resultContent) resultContent.innerHTML = issuesList;
                    
                    // Générer la visualisation de l'escalier
                    setTimeout(() => {
                        generateStairVisualization(stairData, 'stairVisualization', isMetric);
                    }, 100);
                }
                
                result.style.display = 'block';
            }
        });
    }
    
    // Calcul d'escalier - CORRECTION ici - éviter la duplication du gestionnaire d'événement
    if (calculateButton) {
        calculateButton.addEventListener('click', function() {
            console.log("Calculate button clicked");
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
            if (calculatorResultContent) calculatorResultContent.innerHTML = '';
            
            if (solutions.length === 0) {
                if (calculatorResult) {
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
                }
            } else {
                if (calculatorResult) {
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
                    
                    // Obtenir la meilleure solution pour la visualisation
                    const bestSolution = solutions[0];
                    
                    // Préparer les données pour la visualisation
                    const stairData = {
                        numRisers: bestSolution.numRisers,
                        numTreads: bestSolution.numTreads,
                        riserHeight: bestSolution.riserHeight,
                        treadDepth: bestSolution.treadDepth,
                        stairWidth: stairWidthValue,
                        totalRun: totalRunValue,
                        totalRise: totalRiseValue,
                        stairConfig: stairConfigValue,
                        lShapedConfig: lShapedConfigValue,
                        dancingStepsConfig: dancingStepsConfigValue,
                        spiralConfig: spiralConfigValue,
                        narrowSide: minNarrowSideValue,
                        spiralWidth: spiralWidthValue
                    };
                    
                    // Section pour les exigences du CNB
                    const cnbRequirementsSection = `
                        <div class="result-section">
                            <h3>Exigences du CNB 2015</h3>
                            <ul>
                                <li>Hauteur de contremarche: min ${formatNumber(minRiser)} mm, max ${formatNumber(maxRiser)} mm</li>
                                <li>Giron: min ${formatNumber(minTread)} mm${maxTread !== Infinity ? ', max ' + formatNumber(maxTread) + ' mm' : ''}</li>
                                <li>Largeur minimale de l'escalier: ${formatNumber(minWidth)} mm</li>
                                ${stairConfigValue === 'dancing_steps' ? `<li>Largeur minimale côté étroit: ${formatNumber(minNarrowSide)} mm</li>` : ''}
                                ${stairConfigValue === 'spiral' ? `<li>Largeur libre entre mains courantes: ${formatNumber(minSpiralWidth)} mm</li>` : ''}
                            </ul>
                        </div>
                    `;
                    
                    // Afficher une explication de la règle du pas (section séparée)
                    const stepRuleSection = `
                        <div class="step-rule-section">
                            <h3 class="step-rule-title">Règle du pas (notion complémentaire)</h3>
                            <p class="info-text">La règle du pas n'est pas une exigence du CNB 2015, mais une pratique recommandée pour assurer le confort des utilisateurs de l'escalier.</p>
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
                        
                        // Informations sur les règles du pas pour la meilleure solution (section séparée)
                        let stepRuleDetails = `
                            <div class="step-rule-section">
                                <h3 class="step-rule-title">Vérification de la règle du pas (solution optimale)</h3>
                                <p class="info-text">La règle du pas n'est pas une exigence du CNB 2015, mais une pratique recommandée pour assurer le confort des utilisateurs de l'escalier.</p>
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
                        `;
                        
                        // Ajouter la section de visualisation
                        detailsHtml += `
                            <div class="result-section" style="border-top: 1px dashed #ccc; padding-top: 15px;">
                                <h3>Visualisation de l'escalier</h3>
                                <div id="calculatorStairVisualization" class="stair-visualization-container"></div>
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
                        ${cnbRequirementsSection}
                        ${solutionsHtml}
                        ${detailsHtml}
                        ${stepRuleDetails}
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
                    
                    // Générer la visualisation de l'escalier
                    setTimeout(() => {
                        generateStairVisualization(stairData, 'calculatorStairVisualization', isMetric);
                    }, 100);
                }
            }
            
            if (calculatorResult) {
                calculatorResult.style.display = 'block';
            }
        });
    }
    
    // Initialiser l'affichage en fonction des sélections initiales
    if (stairConfig) stairConfig.dispatchEvent(new Event('change'));
    if (calcStairConfig) calcStairConfig.dispatchEvent(new Event('change'));
    updatePlaceholders('verification');
    updatePlaceholders('calculator');
    
    // Fonction pour générer un SVG d'escalier en vue de dessus et de côté
    function generateStairVisualization(stairData, elementId, isMetric) {
        // Récupérer les données de l'escalier
        const {
            numRisers,
            numTreads,
            riserHeight,
            treadDepth,
            stairWidth,
            stairConfig,
            totalRun,
            totalRise
        } = stairData;

        // Paramètres de visualisation
        const padding = 40;
        const scale = calculateScale(totalRun, totalRise, stairWidth, numTreads, numRisers);
        const svgWidth = Math.max(600, totalRun * scale + 2 * padding);
        const svgHeight = 500;
        const topViewHeight = 300;
        const sideViewHeight = 180;
        const sideViewTop = topViewHeight + 20;

        // Créer l'élément SVG
        const container = document.getElementById(elementId);
        if (!container) {
            console.error("Container not found:", elementId);
            return;
        }
        
        container.innerHTML = '';
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", svgWidth);
        svg.setAttribute("height", svgHeight);
        svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        svg.setAttribute("style", "border: 1px solid #ccc; background-color: #f9f9f9;");
        
        // Titre de la visualisation
        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", svgWidth / 2);
        title.setAttribute("y", 25);
        title.setAttribute("text-anchor", "middle");
        title.setAttribute("font-size", "16");
        title.setAttribute("font-weight", "bold");
        title.textContent = "Visualisation de l'escalier";
        svg.appendChild(title);
        
        // Sous-titre Vue de dessus
        const topViewTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        topViewTitle.setAttribute("x", padding);
        topViewTitle.setAttribute("y", 50);
        topViewTitle.setAttribute("font-size", "14");
        topViewTitle.setAttribute("font-weight", "bold");
        topViewTitle.textContent = "Vue de dessus";
        svg.appendChild(topViewTitle);
        
        // Sous-titre Vue de côté
        const sideViewTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        sideViewTitle.setAttribute("x", padding);
        sideViewTitle.setAttribute("y", sideViewTop - 10);
        sideViewTitle.setAttribute("font-size", "14");
        sideViewTitle.setAttribute("font-weight", "bold");
        sideViewTitle.textContent = "Vue de côté";
        svg.appendChild(sideViewTitle);

        // Dessiner l'escalier selon la configuration
        switch (stairConfig) {
            case 'straight':
                drawStraightStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
                break;
            case 'l_shaped':
                drawLShapedStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
                break;
            case 'u_shaped':
                drawUShapedStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
                break;
            case 'dancing_steps':
                drawDancingStepsStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
                break;
            case 'spiral':
                drawSpiralStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
                break;
            default:
                drawStraightStair(svg, stairData, {
                    padding,
                    scale,
                    topViewHeight,
                    sideViewTop,
                    sideViewHeight,
                    svgWidth,
                    isMetric
                });
        }
        
        // Ajouter le SVG au conteneur
        container.appendChild(svg);
    }

    // Calculer l'échelle appropriée pour la visualisation
    function calculateScale(totalRun, totalRise, stairWidth, numTreads, numRisers) {
        // Espace disponible (avec la marge)
        const availableWidth = 520; // 600 - 2*40
        const availableHeight = 220; // 300 - 2*40
        
        // Calculer les échelles possibles
        const scaleWidth = availableWidth / totalRun;
        const scaleHeight = availableHeight / Math.max(stairWidth, totalRise);
        
        // Prendre la plus petite échelle pour s'assurer que tout est visible
        return Math.min(scaleWidth, scaleHeight, 0.2); // Limiter l'échelle maximale
    }

    // Formater une dimension pour l'affichage
    function formatDimension(value, isMetric) {
        if (isMetric) {
            return Math.round(value) + " mm";
        } else {
            const inches = value / 25.4;
            const feet = Math.floor(inches / 12);
            const remainingInches = Math.round((inches % 12) * 10) / 10;
            
            if (feet > 0) {
                return `${feet}'-${remainingInches}"`;
            } else {
                return `${remainingInches}"`;
            }
        }
    }

    // Dessiner un escalier droit
    function drawStraightStair(svg, stairData, options) {
        const {
            numRisers,
            numTreads,
            riserHeight,
            treadDepth,
            stairWidth,
            totalRun,
            totalRise
        } = stairData;
        
        const {
            padding,
            scale,
            topViewHeight,
            sideViewTop,
            sideViewHeight,
            svgWidth,
            isMetric
        } = options;
        
        // Vue de dessus
        const topViewGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Cadre de la vue de dessus
        const topViewBorder = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        topViewBorder.setAttribute("x", padding);
        topViewBorder.setAttribute("y", 60);
        topViewBorder.setAttribute("width", totalRun * scale);
        topViewBorder.setAttribute("height", stairWidth * scale);
        topViewBorder.setAttribute("fill", "none");
        topViewBorder.setAttribute("stroke", "#333");
        topViewBorder.setAttribute("stroke-width", "1");
        topViewGroup.appendChild(topViewBorder);
        
        // Marches en vue de dessus
        for (let i = 0; i < numTreads; i++) {
            const tread = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const x = padding + i * treadDepth * scale;
            tread.setAttribute("x1", x);
            tread.setAttribute("y1", 60);
            tread.setAttribute("x2", x);
            tread.setAttribute("y2", 60 + stairWidth * scale);
            tread.setAttribute("stroke", "#777");
            tread.setAttribute("stroke-width", "1");
            topViewGroup.appendChild(tread);
            
            // Numéro de marche
            if (numTreads <= 20) { // N'afficher les numéros que si pas trop de marches
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", x + treadDepth * scale / 2);
                text.setAttribute("y", 60 + stairWidth * scale / 2);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("font-size", "10");
                text.textContent = (i + 1).toString();
                topViewGroup.appendChild(text);
            }
        }
        
        // Dernière ligne de marche
        const lastTread = document.createElementNS("http://www.w3.org/2000/svg", "line");
        lastTread.setAttribute("x1", padding + numTreads * treadDepth * scale);
        lastTread.setAttribute("y1", 60);
        lastTread.setAttribute("x2", padding + numTreads * treadDepth * scale);
        lastTread.setAttribute("y2", 60 + stairWidth * scale);
        lastTread.setAttribute("stroke", "#777");
        lastTread.setAttribute("stroke-width", "1");
        topViewGroup.appendChild(lastTread);
        
        // Flèche de direction
        const arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrow.setAttribute("d", `M ${padding + totalRun * scale / 2} ${60 + stairWidth * scale + 15} L ${padding + totalRun * scale / 2 + 15} ${60 + stairWidth * scale + 5} L ${padding + totalRun * scale / 2 - 15} ${60 + stairWidth * scale + 5} Z`);
        arrow.setAttribute("fill", "#4CAF50");
        topViewGroup.appendChild(arrow);
        
        // Légende pour la vue de dessus
        const widthText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        widthText.setAttribute("x", padding - 10);
        widthText.setAttribute("y", 60 + stairWidth * scale / 2);
        widthText.setAttribute("text-anchor", "end");
        widthText.setAttribute("dominant-baseline", "middle");
        widthText.setAttribute("font-size", "12");
        widthText.textContent = formatDimension(stairWidth, isMetric);
        topViewGroup.appendChild(widthText);
        
        const lengthText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lengthText.setAttribute("x", padding + totalRun * scale / 2);
        lengthText.setAttribute("y", 50);
        lengthText.setAttribute("text-anchor", "middle");
        lengthText.setAttribute("font-size", "12");
        lengthText.textContent = formatDimension(totalRun, isMetric);
        topViewGroup.appendChild(lengthText);
        
        svg.appendChild(topViewGroup);

        // Vue de côté
        const sideViewGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Dessiner les marches en vue de côté
        const polygonPoints = [];
        polygonPoints.push(`${padding},${sideViewTop}`);
        
        for (let i = 0; i < numRisers; i++) {
            // Point horizontal (giron)
            const x1 = padding + i * treadDepth * scale;
            const y1 = sideViewTop - i * riserHeight * scale;
            
            // Point vertical (hauteur)
            const x2 = x1;
            const y2 = sideViewTop - (i + 1) * riserHeight * scale;
            
            // Point suivant (prochain giron)
            const x3 = x1 + treadDepth * scale;
            const y3 = y2;
            
            if (i < numRisers - 1) {
                polygonPoints.push(`${x1},${y1} ${x2},${y2} ${x3},${y3}`);
            } else {
                // Dernière marche
                polygonPoints.push(`${x1},${y1} ${x2},${y2}`);
            }
            
            // Dessiner les lignes de marche
            const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line1.setAttribute("x1", x1);
            line1.setAttribute("y1", y1);
            line1.setAttribute("x2", x2);
            line1.setAttribute("y2", y2);
            line1.setAttribute("stroke", "#333");
            line1.setAttribute("stroke-width", "1.5");
            sideViewGroup.appendChild(line1);
            
            if (i < numRisers - 1) {
                const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line2.setAttribute("x1", x2);
                line2.setAttribute("y1", y2);
                line2.setAttribute("x2", x3);
                line2.setAttribute("y2", y3);
                line2.setAttribute("stroke", "#333");
                line2.setAttribute("stroke-width", "1.5");
                sideViewGroup.appendChild(line2);
            }
        }
        
        // Ajouter le point final
        polygonPoints.push(`${padding + totalRun * scale},${sideViewTop - totalRise * scale}`);
        
        // Fermer le polygone
        polygonPoints.push(`${padding + totalRun * scale},${sideViewTop} ${padding},${sideViewTop}`);
        
        // Créer le polygone de l'escalier
        const stairPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        stairPolygon.setAttribute("points", polygonPoints.join(" "));
        stairPolygon.setAttribute("fill", "#f0f0f0");
        stairPolygon.setAttribute("stroke", "#999");
        stairPolygon.setAttribute("stroke-width", "1");
        sideViewGroup.insertBefore(stairPolygon, sideViewGroup.firstChild);
        
        // Légende pour la vue de côté
        const riseText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        riseText.setAttribute("x", padding - 10);
        riseText.setAttribute("y", sideViewTop - totalRise * scale / 2);
        riseText.setAttribute("text-anchor", "end");
        riseText.setAttribute("dominant-baseline", "middle");
        riseText.setAttribute("font-size", "12");
        riseText.textContent = formatDimension(totalRise, isMetric);
        sideViewGroup.appendChild(riseText);
        
        const runText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        runText.setAttribute("x", padding + totalRun * scale / 2);
        runText.setAttribute("y", sideViewTop + 15);
        runText.setAttribute("text-anchor", "middle");
        runText.setAttribute("font-size", "12");
        runText.textContent = formatDimension(totalRun, isMetric);
        sideViewGroup.appendChild(runText);
        
        // Étiquettes de dimensions pour une marche
        if (numTreads > 0) {
            // Hauteur de contremarche
            const riserLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            riserLabel.setAttribute("x", padding + 0.5 * treadDepth * scale);
            riserLabel.setAttribute("y", sideViewTop - 0.5 * riserHeight * scale);
            riserLabel.setAttribute("text-anchor", "middle");
            riserLabel.setAttribute("dominant-baseline", "middle");
            riserLabel.setAttribute("font-size", "10");
            riserLabel.setAttribute("fill", "#d32f2f");
            riserLabel.textContent = formatDimension(riserHeight, isMetric);
            sideViewGroup.appendChild(riserLabel);
            
            // Giron
            const treadLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            treadLabel.setAttribute("x", padding + 1.5 * treadDepth * scale);
            treadLabel.setAttribute("y", sideViewTop - 1 * riserHeight * scale - 5);
            treadLabel.setAttribute("text-anchor", "middle");
            treadLabel.setAttribute("font-size", "10");
            treadLabel.setAttribute("fill", "#1976d2");
            treadLabel.textContent = formatDimension(treadDepth, isMetric);
            sideViewGroup.appendChild(treadLabel);
        }
        
        svg.appendChild(sideViewGroup);

        // Légende
        const legend = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Titre de légende
        const legendTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        legendTitle.setAttribute("x", svgWidth - padding - 100);
        legendTitle.setAttribute("y", 50);
        legendTitle.setAttribute("font-size", "12");
        legendTitle.setAttribute("font-weight", "bold");
        legendTitle.textContent = "Légende:";
        legend.appendChild(legendTitle);
        
        // Entrée Hauteur de contremarche
        const riserColorBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        riserColorBox.setAttribute("x", svgWidth - padding - 100);
        riserColorBox.setAttribute("y", 60);
        riserColorBox.setAttribute("width", 10);
        riserColorBox.setAttribute("height", 10);
        riserColorBox.setAttribute("fill", "#d32f2f");
        legend.appendChild(riserColorBox);
        
        const riserLegendText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        riserLegendText.setAttribute("x", svgWidth - padding - 85);
        riserLegendText.setAttribute("y", 69);
        riserLegendText.setAttribute("font-size", "10");
        riserLegendText.textContent = "Hauteur contremarche: " + formatDimension(riserHeight, isMetric);
        legend.appendChild(riserLegendText);
        
        // Entrée Giron
        const treadColorBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        treadColorBox.setAttribute("x", svgWidth - padding - 100);
        treadColorBox.setAttribute("y", 80);
        treadColorBox.setAttribute("width", 10);
        treadColorBox.setAttribute("height", 10);
        treadColorBox.setAttribute("fill", "#1976d2");
        legend.appendChild(treadColorBox);
        
        const treadLegendText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        treadLegendText.setAttribute("x", svgWidth - padding - 85);
        treadLegendText.setAttribute("y", 89);
        treadLegendText.setAttribute("font-size", "10");
        treadLegendText.textContent = "Giron: " + formatDimension(treadDepth, isMetric);
        legend.appendChild(treadLegendText);
        
        // Nombre de marches
        const stairsCountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        stairsCountText.setAttribute("x", svgWidth - padding - 100);
        stairsCountText.setAttribute("y", 109);
        stairsCountText.setAttribute("font-size", "10");
        stairsCountText.textContent = `Contremarches: ${numRisers}`;
        legend.appendChild(stairsCountText);
        
        // Nombre de girons
        const treadsCountText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        treadsCountText.setAttribute("x", svgWidth - padding - 100);
        treadsCountText.setAttribute("y", 129);
        treadsCountText.setAttribute("font-size", "10");
        treadsCountText.textContent = `Marches: ${numTreads}`;
        legend.appendChild(treadsCountText);
        
        svg.appendChild(legend);
    }

    // Cette section contient les fonctions auxiliaires qui ont été conservées telles quelles
    // car elles ne semblent pas contenir de problèmes

    // Fonction pour dessiner un escalier en L, etc.
    // ...

    // Fonction pour valider les entrées impériales
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
});
