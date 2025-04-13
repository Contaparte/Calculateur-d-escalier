// stairCheck.js - Code mis à jour pour la vérification et le calcul des escaliers selon le CNB

/**
 * Variables pour les limites du CNB 2015
 */
const CNB_LIMITS = {
  // Hauteurs des contremarches (mm)
  RISER_HEIGHT: {
    PRIVATE: { MIN: 125, MAX: 200 },   // §9.8.4.1 - Escaliers privés
    COMMON: { MIN: 125, MAX: 180 },    // §9.8.4.1 - Escaliers communs
    SERVICE: { MIN: 0, MAX: Infinity }, // Pas de limite pour les escaliers de service
    SPIRAL: { MIN: 0, MAX: 240 }       // §9.8.4.7 - Escaliers hélicoïdaux
  },
  
  // Profondeurs des girons (mm)
  TREAD_DEPTH: {
    PRIVATE: { MIN: 255, MAX: 355 },   // §9.8.4.2 - Escaliers privés
    COMMON: { MIN: 280, MAX: Infinity }, // §9.8.4.2 - Escaliers communs
    SPIRAL: { MIN: 190, MAX: Infinity }  // §9.8.4.7 - Escaliers hélicoïdaux (à 300mm de l'axe)
  },
  
  // Largeurs minimales (mm)
  WIDTH: {
    PRIVATE: 860,                     // §9.8.2.1 - Escaliers privés
    COMMON_RESIDENTIAL: 900,          // §9.8.2.1 - Escaliers communs dans habitations
    EXIT: 900,                        // §9.8.2.1 - Escaliers d'issue
    SPIRAL: 660                       // §9.8.4.7 - Escaliers hélicoïdaux
  },
  
  // Hauteurs libres minimales (mm)
  HEADROOM: {
    PRIVATE: 1950,                    // §9.8.2.2 - Escaliers privés
    ACCESSORY_DWELLING: 1850,         // §9.8.2.2 - Sous poutres dans logement accessoire
    COMMON: 2050,                     // §9.8.2.2 - Autres escaliers
    SPIRAL: 1980                      // §9.8.4.7 - Escaliers hélicoïdaux
  },
  
  // Hauteurs maximales des volées (mm)
  MAX_FLIGHT_HEIGHT: 3700,            // §9.8.3.3
  
  // Hauteurs des mains courantes (mm)
  HANDRAIL_HEIGHT: {
    MIN: 865,                         // §9.8.7.4
    MAX: 1070                         // §9.8.7.4
  },
  
  // Hauteurs des garde-corps (mm)
  GUARD_HEIGHT: {
    RESIDENTIAL_INTERIOR: 900,        // §9.8.8.3 - Intérieur d'un logement
    RESIDENTIAL_EXT_LOW: 900,         // §9.8.8.3 - Extérieur d'un logement (≤ 1.8m)
    COMMON: 1070                      // §9.8.8.3 - Autres garde-corps
  },
  
  // Parcours sans obstacles (mm) - Section 3.8
  BARRIER_FREE: {
    RAMP_WIDTH: 870,                  // §3.8.3.5 - Largeur de passage
    RAMP_SLOPE: 1/12,                 // §3.8.3.5 - Pente maximale
    HANDRAIL_HEIGHT: { MIN: 865, MAX: 965 } // §3.8.3.5
  },
  
  // Règles du confort de marche (pouces)
  COMFORT_RULES: {
    RISER_PLUS_TREAD: { MIN: 17, MAX: 18 },
    RISER_TIMES_TREAD: { MIN: 71, MAX: 74 },
    RISER_TIMES_2_PLUS_TREAD: { MIN: 22, MAX: 25 }
  }
};

/**
 * Parse une saisie métrique (en mm) ou impériale (pieds‑pouces-fraction)
 * et renvoie la valeur en millimètres.
 */
function parseMeasurement(input, system) {
  if (!input || input.trim() === '') return null;
  
  input = input.trim();
  if (system === 'metric') {
    const mm = parseFloat(input);
    if (isNaN(mm)) throw new Error('Format métrique invalide (ex: 190 ou 2050)');
    return mm;
  } else {
    const s = input.replace(/[""]/g, '').trim();
    let m;
    // 1) A'-B C/G"
    m = s.match(/^(\d+)['']-(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , ft, in_, num, den ] = m.map(Number);
      return (ft*12 + in_ + num/den) * 25.4;
    }
    // 2) A'-B"
    m = s.match(/^(\d+)['']-(\d+)$/);
    if (m) {
      const [ , ft, in_ ] = m.map(Number);
      return (ft*12 + in_) * 25.4;
    }
    // 3) A'"
    m = s.match(/^(\d+)['']$/);
    if (m) {
      const ft = parseInt(m[1], 10);
      return ft*12*25.4;
    }
    // 4) B C/G"
    m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , in_, num, den ] = m.map(Number);
      return (in_ + num/den) * 25.4;
    }
    // 5) C/G"
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) {
      const [ , num, den ] = m.map(Number);
      return (num/den) * 25.4;
    }
    // 6) B" (pouces seuls)
    m = s.match(/^(\d+)$/);
    if (m) {
      const in_ = parseInt(m[1], 10);
      return in_ * 25.4;
    }
    throw new Error('Format impérial invalide (ex: 7\'-3 15/32", 7\', 3 15/32", 15/32")');
  }
}

/**
 * Formatage d'une valeur en mm pour affichage
 */
function formatMeasurement(value, system) {
  if (value === null || value === undefined) return "non spécifié";
  
  if (system === 'metric') {
    return `${Math.round(value)} mm`;
  } else {
    // Conversion en pouces
    const totalInches = value / 25.4;
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    
    // Arrondir les pouces à 1/8 près
    const fraction = Math.round(inches * 8) / 8;
    const wholePart = Math.floor(fraction);
    const fractionalPart = fraction - wholePart;
    
    if (feet === 0) {
      if (fractionalPart === 0) {
        return `${wholePart}"`;
      } else {
        const numerator = fractionalPart * 8;
        return `${wholePart} ${numerator}/8"`;
      }
    } else {
      if (fractionalPart === 0) {
        if (wholePart === 0) {
          return `${feet}'`;
        } else {
          return `${feet}'-${wholePart}"`;
        }
      } else {
        const numerator = fractionalPart * 8;
        if (wholePart === 0) {
          return `${feet}'-${numerator}/8"`;
        } else {
          return `${feet}'-${wholePart} ${numerator}/8"`;
        }
      }
    }
  }
}

/**
 * Détermine le type d'escalier pour choisir les valeurs de référence
 */
function getStairTypeForLimits() {
  const bType = document.getElementById('buildingType').value;
  const useType = document.getElementById('useType').value;
  const stairType = document.getElementById('stairType').value;
  
  // Escalier hélicoïdal
  if (stairType === 'spiral') {
    return 'SPIRAL';
  }
  
  // Escalier de service
  if (useType === 'service') {
    return 'SERVICE';
  }
  
  // Escalier privé
  if (useType === 'private' || (bType === 'dwelling' && useType !== 'exit')) {
    return 'PRIVATE';
  }
  
  // Autres cas (commun, issue)
  return 'COMMON';
}

/**
 * Fonction de calcul des dimensions de l'escalier
 */
function calculateStair() {
  const mSys = document.getElementById('measurementSystem').value;
  const resEl = document.getElementById('results');
  resEl.innerHTML = '';
  
  try {
    // Récupération des entrées
    const totalRise = parseMeasurement(document.getElementById('totalRise').value, mSys);
    const availableRun = parseMeasurement(document.getElementById('availableRunLength').value, mSys);
    const desiredRiser = parseMeasurement(document.getElementById('riserHeight').value, mSys) || null;
    const desiredTread = parseMeasurement(document.getElementById('treadDepth').value, mSys) || null;
    
    if (!totalRise) {
      throw new Error('La hauteur totale à gravir est requise pour le calcul.');
    }
    
    // Détermination des limites selon le type d'escalier
    const stairTypeCode = getStairTypeForLimits();
    const riserLimits = CNB_LIMITS.RISER_HEIGHT[stairTypeCode];
    const treadLimits = CNB_LIMITS.TREAD_DEPTH[stairTypeCode] || CNB_LIMITS.TREAD_DEPTH.COMMON;
    
    let bestRiserHeight, bestTreadDepth, stepsCount, totalRunLength;
    
    // Si l'utilisateur a spécifié une hauteur de contremarche
    if (desiredRiser && desiredRiser >= riserLimits.MIN && desiredRiser <= riserLimits.MAX) {
      // Calcul du nombre de marches basé sur la hauteur de contremarche souhaitée
      stepsCount = Math.round(totalRise / desiredRiser);
      bestRiserHeight = totalRise / stepsCount;
      
      // Si l'utilisateur a aussi spécifié un giron
      if (desiredTread && desiredTread >= treadLimits.MIN && desiredTread <= (treadLimits.MAX || 400)) {
        bestTreadDepth = desiredTread;
      } else {
        // Calcul du giron optimal en fonction de la hauteur de contremarche
        // Règle de confort 2R + G = 600-640mm (formule Blondel)
        bestTreadDepth = 630 - (2 * bestRiserHeight);
        // Vérification que le giron est dans les limites
        bestTreadDepth = Math.max(treadLimits.MIN, Math.min(bestTreadDepth, treadLimits.MAX || 350));
      }
    } 
    // Si l'utilisateur a spécifié une profondeur de giron mais pas de hauteur de contremarche
    else if (desiredTread && desiredTread >= treadLimits.MIN && desiredTread <= (treadLimits.MAX || 400)) {
      bestTreadDepth = desiredTread;
      
      // Calcul du nombre de marches pour une longueur totale idéale
      if (availableRun) {
        // Estimation du nombre de marches basé sur l'espace disponible
        const estimatedSteps = Math.floor(availableRun / bestTreadDepth);
        
        // Calcul de la hauteur de contremarche correspondante
        bestRiserHeight = totalRise / estimatedSteps;
        
        // Ajustement si nécessaire pour rester dans les limites
        if (bestRiserHeight < riserLimits.MIN) {
          stepsCount = Math.floor(totalRise / riserLimits.MIN);
          bestRiserHeight = totalRise / stepsCount;
        } else if (bestRiserHeight > riserLimits.MAX) {
          stepsCount = Math.ceil(totalRise / riserLimits.MAX);
          bestRiserHeight = totalRise / stepsCount;
        } else {
          stepsCount = estimatedSteps;
        }
      } else {
        // Sans longueur disponible, utiliser la formule de Blondel
        bestRiserHeight = (630 - bestTreadDepth) / 2;
        
        // Vérification des limites
        bestRiserHeight = Math.max(riserLimits.MIN, Math.min(bestRiserHeight, riserLimits.MAX));
        
        // Calcul du nombre de marches
        stepsCount = Math.round(totalRise / bestRiserHeight);
        bestRiserHeight = totalRise / stepsCount;
      }
    }
    // Aucune préférence spécifiée
    else {
      // Essayer plusieurs combinaisons pour trouver le meilleur équilibre
      let bestScore = Infinity;
      let bestConfig = null;
      
      // Plage de contremarches à tester
      const minRiser = riserLimits.MIN;
      const maxRiser = riserLimits.MAX;
      const riserStep = (maxRiser - minRiser) / 20; // 20 pas entre min et max
      
      for (let riser = minRiser; riser <= maxRiser; riser += riserStep) {
        // Calcul du nombre de marches approximatif
        const steps = Math.round(totalRise / riser);
        if (steps < 3) continue; // Minimum 3 marches
        
        // Recalcul de la hauteur de contremarche exacte
        const exactRiser = totalRise / steps;
        
        // Calcul du giron avec la formule de Blondel (2R + G = 630mm)
        const calculatedTread = 630 - (2 * exactRiser);
        const tread = Math.max(treadLimits.MIN, Math.min(calculatedTread, treadLimits.MAX || 350));
        
        // Vérification de la longueur totale si spécifiée
        let runLengthOk = true;
        if (availableRun) {
          const runLength = tread * (steps - 1); // Nombre de girons = marches - 1
          if (runLength > availableRun) {
            runLengthOk = false;
          }
        }
        
        if (runLengthOk) {
          // Calcul d'un score basé sur l'écart par rapport aux valeurs idéales
          // La règle de Blondel : 2R + G = 630mm (idéal)
          const blondelValue = 2 * exactRiser + tread;
          const blondelScore = Math.abs(blondelValue - 630);
          
          // Règle du confort : R + G = 17-18 pouces
          const riserInInches = exactRiser / 25.4;
          const treadInInches = tread / 25.4;
          const comfortValue = riserInInches + treadInInches;
          const comfortScore = Math.min(
            Math.abs(comfortValue - 17),
            Math.abs(comfortValue - 18)
          ) * 10; // Poids plus important
          
          const totalScore = blondelScore + comfortScore;
          
          if (totalScore < bestScore) {
            bestScore = totalScore;
            bestConfig = {
              riser: exactRiser,
              tread: tread,
              steps: steps
            };
          }
        }
      }
      
      if (bestConfig) {
        bestRiserHeight = bestConfig.riser;
        bestTreadDepth = bestConfig.tread;
        stepsCount = bestConfig.steps;
      } else {
        // Solution par défaut si aucune bonne combinaison n'est trouvée
        stepsCount = Math.round(totalRise / ((riserLimits.MIN + riserLimits.MAX) / 2));
        bestRiserHeight = totalRise / stepsCount;
        bestTreadDepth = treadLimits.MIN;
      }
    }
    
    // Calcul de la longueur totale de l'escalier
    totalRunLength = bestTreadDepth * (stepsCount - 1);
    
    // Préparation de l'affichage des résultats
    const calculationDiv = document.createElement('div');
    calculationDiv.className = 'calculation-result';
    
    // Tableau de résultats
    const resultTable = `
      <h2>Résultats du calcul</h2>
      <table>
        <tr>
          <th>Paramètre</th>
          <th>Valeur calculée</th>
          <th>Limites CNB 2015</th>
        </tr>
        <tr>
          <td>Nombre de marches</td>
          <td>${stepsCount}</td>
          <td>Minimum 3 (intérieur)</td>
        </tr>
        <tr>
          <td>Hauteur de contremarche</td>
          <td>${formatMeasurement(bestRiserHeight, mSys)}</td>
          <td>${formatMeasurement(riserLimits.MIN, mSys)} - ${formatMeasurement(riserLimits.MAX, mSys)}</td>
        </tr>
        <tr>
          <td>Profondeur de giron</td>
          <td>${formatMeasurement(bestTreadDepth, mSys)}</td>
          <td>≥ ${formatMeasurement(treadLimits.MIN, mSys)}</td>
        </tr>
        <tr>
          <td>Longueur totale (horizontale)</td>
          <td>${formatMeasurement(totalRunLength, mSys)}</td>
          <td>${availableRun ? '≤ ' + formatMeasurement(availableRun, mSys) : 'Non spécifié'}</td>
        </tr>
        <tr>
          <td>Rapport 2R+G</td>
          <td>${Math.round(2 * bestRiserHeight + bestTreadDepth)} mm</td>
          <td>≈ 630 mm (idéal)</td>
        </tr>
        <tr>
          <td>Indice de confort (R+G)</td>
          <td>${((bestRiserHeight + bestTreadDepth)/25.4).toFixed(2)} pouces</td>
          <td>17 à 18 pouces (idéal)</td>
        </tr>
      </table>
      
      <div class="info" style="margin-top: 1em;">
        <p>Conseil: La hauteur maximale d'une volée d'escalier ne doit pas dépasser 3700 mm (CNB 9.8.3.3).</p>
        ${stepsCount > 3 && stepsCount <= 12 ? 
          '<p class="success">✓ Nombre de marches adapté pour un escalier résidentiel.</p>' : 
          '<p class="warning">⚠ Nombre de marches non optimal (idéal: entre 4 et 12 marches par volée).</p>'}
      </div>
    `;
    
    calculationDiv.innerHTML = resultTable;
    resEl.appendChild(calculationDiv);
    
  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur de calcul : ' + e.message;
    resEl.appendChild(div);
  }
}

/**
 * Fonction principale appelée au clic du bouton "Vérifier la conformité".
 */
function validateStair() {
  const bType = document.getElementById('buildingType').value;
  const useType = document.getElementById('useType').value;
  const stairType = document.getElementById('stairType').value;
  const location = document.getElementById('location').value;
  const accessible = document.getElementById('accessible').value;
  const mSys = document.getElementById('measurementSystem').value;
  const resEl = document.getElementById('results');
  
  resEl.innerHTML = '';

  try {
    // 1) Récupération et conversion
    const riser = parseMeasurement(document.getElementById('riserHeight').value, mSys);
    const tread = parseMeasurement(document.getElementById('treadDepth').value, mSys);
    const width = parseMeasurement(document.getElementById('stairWidth').value, mSys);
    const headroom = parseMeasurement(document.getElementById('headroom').value, mSys);
    const guardHeight = parseMeasurement(document.getElementById('guardHeight').value, mSys);
    const handrailHeight = parseMeasurement(document.getElementById('handrailHeight').value, mSys);
    
    // Valeurs pour escaliers tournants ou hélicoïdaux
    let innerWidth = null;
    let turningAngle = null;
    
    if (stairType === 'spiral' || stairType === 'l-shaped' || stairType === 'u-shaped' || stairType === 'winder') {
      innerWidth = parseMeasurement(document.getElementById('innerWidth').value, mSys);
      
      if (document.getElementById('turningAngle').value === 'custom') {
        turningAngle = parseInt(document.getElementById('customAngle').value);
      } else {
        turningAngle = parseInt(document.getElementById('turningAngle').value);
      }
    }

    // 2) Détermination des seuils CNB selon le type d'escalier
    const stairTypeCode = getStairTypeForLimits();
    let riserMin, riserMax, treadMin, treadMax, widthMin, headMin;
    let guardMin, handrailMin, handrailMax;
    
    // Limites pour hauteurs de contremarches et profondeurs de girons
    riserMin = CNB_LIMITS.RISER_HEIGHT[stairTypeCode].MIN;
    riserMax = CNB_LIMITS.RISER_HEIGHT[stairTypeCode].MAX;
    treadMin = CNB_LIMITS.TREAD_DEPTH[stairTypeCode].MIN;
    treadMax = CNB_LIMITS.TREAD_DEPTH[stairTypeCode].MAX || Infinity;
    
    // Limites pour largeurs
    if (stairType === 'spiral') {
      widthMin = CNB_LIMITS.WIDTH.SPIRAL;
    } else if (useType === 'private' || (bType === 'dwelling' && useType !== 'exit')) {
      widthMin = CNB_LIMITS.WIDTH.PRIVATE;
    } else if (useType === 'exit') {
      widthMin = CNB_LIMITS.WIDTH.EXIT;
    } else {
      widthMin = CNB_LIMITS.WIDTH.COMMON_RESIDENTIAL;
    }
    
    // Limites pour hauteurs libres
    if (stairType === 'spiral') {
      headMin = CNB_LIMITS.HEADROOM.SPIRAL;
    } else if (bType === 'dwelling' && useType === 'private') {
      headMin = CNB_LIMITS.HEADROOM.PRIVATE;
    } else {
      headMin = CNB_LIMITS.HEADROOM.COMMON;
    }
    
    // Limites pour garde-corps et mains courantes
    if (bType === 'dwelling' && location === 'interior') {
      guardMin = CNB_LIMITS.GUARD_HEIGHT.RESIDENTIAL_INTERIOR;
    } else {
      guardMin = CNB_LIMITS.GUARD_HEIGHT.COMMON;
    }
    
    handrailMin = CNB_LIMITS.HANDRAIL_HEIGHT.MIN;
    handrailMax = CNB_LIMITS.HANDRAIL_HEIGHT.MAX;
    
    // Ajustements pour parcours sans obstacles
    if (accessible === 'yes') {
      treadMin = Math.max(treadMin, 280); // Valeur minimale pour accessibilité
      
      if (stairType !== 'spiral') {
        widthMin = Math.max(widthMin, CNB_LIMITS.BARRIER_FREE.RAMP_WIDTH);
      }
      
      handrailMin = CNB_LIMITS.BARRIER_FREE.HANDRAIL_HEIGHT.MIN;
      handrailMax = CNB_LIMITS.BARRIER_FREE.HANDRAIL_HEIGHT.MAX;
    }

    // 3) Validation CNB
    const errors = [];
    const warnings = [];
    
    // Vérifications de base
    if (riser && (riser < riserMin || riser > riserMax)) {
      errors.push(`Hauteur de contremarche (${riser.toFixed(1)} mm) doit être entre ${riserMin} et ${riserMax} mm (CNB 2015 §9.8.4.1).`);
    }
    
    if (tread && (tread < treadMin || tread > treadMax)) {
      const maxTxt = (treadMax === Infinity) ? '∞' : treadMax;
      errors.push(`Profondeur de giron (${tread.toFixed(1)} mm) doit être ≥ ${treadMin} mm et ≤ ${maxTxt} mm (CNB 2015 §9.8.4.2).`);
    }
    
    if (width && width < widthMin) {
      errors.push(`Largeur de l'escalier (${width.toFixed(1)} mm) doit être ≥ ${widthMin} mm (CNB 2015 §9.8.2.1).`);
    }
    
    if (headroom && headroom < headMin) {
      errors.push(`Hauteur libre (${headroom.toFixed(1)} mm) doit être ≥ ${headMin} mm (CNB 2015 §9.8.2.2).`);
    }
    
    // Vérifications spécifiques aux garde-corps et mains courantes
    if (guardHeight && guardHeight < guardMin) {
      errors.push(`Hauteur du garde-corps (${guardHeight.toFixed(1)} mm) doit être ≥ ${guardMin} mm (CNB 2015 §9.8.8.3).`);
    }
    
    if (handrailHeight && (handrailHeight < handrailMin || handrailHeight > handrailMax)) {
      errors.push(`Hauteur de la main courante (${handrailHeight.toFixed(1)} mm) doit être entre ${handrailMin} et ${handrailMax} mm (CNB 2015 §9.8.7.4).`);
    }
    
    // Vérifications spécifiques aux escaliers tournants et hélicoïdaux
    if (stairType === 'spiral') {
      if (width && width < CNB_LIMITS.WIDTH.SPIRAL) {
        errors.push(`Largeur libre entre mains courantes d'un escalier hélicoïdal (${width.toFixed(1)} mm) doit être ≥ ${CNB_LIMITS.WIDTH.SPIRAL} mm (CNB 2015 §9.8.4.7).`);
      }
      
      if (!innerWidth) {
        warnings.push("Pour un escalier hélicoïdal, veuillez spécifier la largeur du côté intérieur pour une vérification complète.");
      } else if (innerWidth < 190) {
        errors.push(`Pour un escalier hélicoïdal, la profondeur de marche mesurée à 300 mm de l'axe de la main courante côté étroit (${innerWidth.toFixed(1)} mm) doit être ≥ 190 mm (CNB 2015 §9.8.4.7).`);
      }
      
      if (useType === 'exit') {
        errors.push("Les escaliers hélicoïdaux ne doivent pas être utilisés comme issues (CNB 2015 §9.8.4.7).");
      }
    } else if (stairType === 'winder') {
      if (!turningAngle) {
        warnings.push("Pour des marches rayonnantes, veuillez spécifier l'angle de rotation pour une vérification complète.");
      } else if (turningAngle > 90) {
        errors.push(`L'angle de rotation pour des marches rayonnantes (${turningAngle}°) ne doit pas être supérieur à 90° (CNB 2015 §9.8.4.6).`);
      } else if (turningAngle !== 30 && turningAngle !== 45) {
        errors.push(`Les marches rayonnantes doivent permettre de tourner à un angle de 30° ou 45° sans écart positif ou négatif (CNB 2015 §9.8.4.6).`);
      }
      
      if (innerWidth && innerWidth < 150) {
        errors.push(`Pour des marches dansantes/rayonnantes, le giron à l'extrémité étroite (${innerWidth.toFixed(1)} mm) doit être ≥ 150 mm (CNB 2015 §9.8.4.3).`);
      }
    }
    
    // Vérification de la règle du pas (confort) si hauteur et profondeur spécifiées
    if (riser && tread) {
      const riserIn = riser / 25.4;
      const treadIn = tread / 25.4;
      const rules = [
        { name: 'Giron + CM',     value: treadIn + riserIn,      min: 17, max: 18 },
        { name: 'Giron × CM',     value: treadIn * riserIn,      min: 71, max: 74 },
        { name: 'Giron + 2×CM',   value: treadIn + 2*riserIn,    min: 22, max: 25 },
      ];
      
      let okCount = 0;
      const ruleWarnings = [];
      
      rules.forEach(r => {
        if (r.value >= r.min && r.value <= r.max) {
          okCount++;
        } else {
          ruleWarnings.push(`Règle du pas « ${r.name} » = ${r.value.toFixed(2)}" (devrait être entre ${r.min}" et ${r.max}") – recommandé pour le confort.`);
        }
      });
      
      // Vérification de la formule Blondel (2R + G = 630)
      const blondel = 2 * riser + tread;
      if (blondel < 580 || blondel > 680) {
        ruleWarnings.push(`Formule de Blondel (2R + G) = ${blondel.toFixed(0)} mm (devrait être ≈ 630 mm) – recommandé pour le confort.`);
      }
      
      // Ajouter les avertissements si moins de 2 règles sont respectées
      if (okCount < 2) {
        warnings.push(...ruleWarnings);
        warnings.push(`Confort de marche non optimal : seules ${okCount} règle(s) sur 3 respectée(s). Il est recommandé d'en respecter au moins 2.`);
      }
    }

    // 4) Affichage résultats CNB
    const validationDiv = document.createElement('div');
    validationDiv.className = 'calculation-result';
    validationDiv.innerHTML = '<h2>Résultats de vérification de conformité</h2>';
    
    if (errors.length) {
      const errorsList = document.createElement('div');
      errorsList.innerHTML = '<h3 class="error">Non-conformités détectées :</h3>';
      
      errors.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = '⚠ ' + msg;
        errorsList.appendChild(div);
      });
      
      validationDiv.appendChild(errorsList);
    }
    
    if (warnings.length) {
      const warningsList = document.createElement('div');
      warningsList.innerHTML = '<h3 class="warning">Avertissements :</h3>';
      
      warnings.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'warning';
        div.textContent = '⚠ ' + msg;
        warningsList.appendChild(div);
      });
      
      validationDiv.appendChild(warningsList);
    }
    
    if (!errors.length && !warnings.length) {
      const div = document.createElement('div');
      div.className = 'success';
      div.innerHTML = '<h3>✓ Conforme aux exigences du CNB 2015</h3>' +
                      '<p>Toutes les dimensions respectent les exigences du Code National du Bâtiment.</p>';
      validationDiv.appendChild(div);
    } else if (!errors.length) {
      const div = document.createElement('div');
      div.className = 'success';
      div.innerHTML = '<h3>✓ Conforme aux exigences obligatoires du CNB 2015</h3>' +
                      '<p>Les dimensions respectent les exigences obligatoires, mais certaines recommandations pour le confort ne sont pas suivies.</p>';
      validationDiv.appendChild(div);
    }
    
    resEl.appendChild(validationDiv);

  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur : ' + e.message;
    resEl.appendChild(div);
  }
}

/**
 * Affiche ou masque les options pour les escaliers tournants
 */
function toggleTurningOptions() {
  const stairType = document.getElementById('stairType').value;
  const turningOptions = document.getElementById('turningOptions');
  
  if (stairType === 'spiral' || stairType === 'l-shaped' || stairType === 'u-shaped' || stairType === 'winder') {
    turningOptions.classList.remove('hidden');
  } else {
    turningOptions.classList.add('hidden');
  }
  
  // Afficher l'option d'angle personnalisé si nécessaire
  const turningAngle = document.getElementById('turningAngle').value;
  const customAngleDiv = document.getElementById('customAngleDiv');
  
  if (turningAngle === 'custom') {
    customAngleDiv.classList.remove('hidden');
  } else {
    customAngleDiv.classList.add('hidden');
  }
}

/**
 * Initialisation des écouteurs d'événements quand la page est chargée
 */
document.addEventListener('DOMContentLoaded', function() {
  // Écouteur pour le changement de type d'escalier
  document.getElementById('stairType').addEventListener('change', toggleTurningOptions);
  
  // Écouteur pour le changement d'angle de rotation
  document.getElementById('turningAngle').addEventListener('change', function() {
    const customAngleDiv = document.getElementById('customAngleDiv');
    if (this.value === 'custom') {
      customAngleDiv.classList.remove('hidden');
    } else {
      customAngleDiv.classList.add('hidden');
    }
  });
  
  // Initialisation de l'affichage
  toggleTurningOptions();
});
