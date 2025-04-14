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

    // Convertir des pieds-pouces en millimètres
function imperialToMetric(imperialValue) {
    if (!imperialValue) return null;
    
    // Formats possibles: "6'2", "6' 2", "6 2", "6-2", "6 ft 2 in", "6'2\"", "6'-2", "6'-2 1/4", etc.
    imperialValue = imperialValue.toString().trim();
    
    // Pour les valeurs simples en pouces (comme "10" ou "10 in")
    if (/^(\d+(?:\.\d+)?)(?:\s*(?:in|inch|inches|"))?$/.test(imperialValue)) {
        const inches = parseFloat(imperialValue);
        return Math.round(inches * 25.4);
    }
    
    // Pour les fractions simples en pouces
    const simpleFractionMatch = imperialValue.match(/^(\d+)\/(\d+)(?:\s*(?:"|in|inch|inches))?$/);
    if (simpleFractionMatch) {
        const numerator = parseFloat(simpleFractionMatch[1]);
        const denominator = parseFloat(simpleFractionMatch[2]);
        const inches = numerator / denominator;
        return Math.round(inches * 25.4);
    }
    
    // Pour les valeurs en pieds-pouces avec trait d'union et fractions
    const dashFractionMatch = imperialValue.match(/^(\d+(?:\.\d+)?)'[-\s]*(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?(?:\s*(?:"|in|inch|inches))?$/);
    if (dashFractionMatch) {
        const feet = parseFloat(dashFractionMatch[1]) || 0;
        const inches = parseFloat(dashFractionMatch[2]) || 0;
        const fraction = dashFractionMatch[3] && dashFractionMatch[4] ? 
            parseFloat(dashFractionMatch[3]) / parseFloat(dashFractionMatch[4]) : 0;
        const totalInches = feet * 12 + inches + fraction;
        return Math.round(totalInches * 25.4);
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
            riserHeightValue = imperialToMetric(riserHeightImperial.value);
            treadDepthValue = imperialToMetric(treadDepthImperial.value);
            narrowSideValue = imperialToMetric(narrowSideImperial.value);
            stairWidthValue = imperialToMetric(stairWidthImperial.value);
            headroomValue = imperialToMetric(headroomImperial.value);
            spiralWidthValue = imperialToMetric(spiralWidthImperial.value);
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
    
    // Initialiser l'affichage en fonction des sélections initiales
    stairConfig.dispatchEvent(new Event('change'));
    measurementSystem.dispatchEvent(new Event('change'));
});
