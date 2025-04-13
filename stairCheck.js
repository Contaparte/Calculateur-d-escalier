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
    
    // Afficher une proposition d'escalier conforme
    proposeCompliantStair(bestRiserHeight, bestTreadDepth, stepsCount, totalRunLength, riserLimits, treadLimits, mSys, availableRun);
    
  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur de calcul : ' + e.message;
    resEl.appendChild(div);
  }
}

/**
 * Fonction de proposition d'un escalier conforme
 */
function proposeCompliantStair(riserHeight, treadDepth, stepsCount, totalRunLength, riserLimits, treadLimits, mSys, availableRun) {
  const resEl = document.getElementById('results');
  const bType = document.getElementById('buildingType').value;
  const useType = document.getElementById('useType').value;
  const stairType = document.getElementById('stairType').value;
  const location = document.getElementById('location').value;
  const accessible = document.getElementById('accessible').value;
  
  // Déterminer si l'escalier calculé est conforme
  let isCompliant = true;
  const issues = [];
  const suggestions = [];
  
  // Vérification des limites de base
  if (riserHeight < riserLimits.MIN || riserHeight > riserLimits.MAX) {
    isCompliant = false;
    issues.push(`Hauteur de contremarche (${formatMeasurement(riserHeight, mSys)}) hors limites de ${formatMeasurement(riserLimits.MIN, mSys)} à ${formatMeasurement(riserLimits.MAX, mSys)}`);
  }
  
  if (treadDepth < treadLimits.MIN || (treadLimits.MAX !== Infinity && treadDepth > treadLimits.MAX)) {
    isCompliant = false;
    const maxTxt = (treadLimits.MAX === Infinity) ? '∞' : formatMeasurement(treadLimits.MAX, mSys);
    issues.push(`Profondeur du giron (${formatMeasurement(treadDepth, mSys)}) hors limites de ${formatMeasurement(treadLimits.MIN, mSys)} à ${maxTxt}`);
  }
  
  if (availableRun && totalRunLength > availableRun) {
    isCompliant = false;
    issues.push(`Longueur totale de l'escalier (${formatMeasurement(totalRunLength, mSys)}) dépasse l'espace disponible (${formatMeasurement(availableRun, mSys)})`);
  }
  
  // Vérification de la hauteur de volée
  const totalHeight = riserHeight * stepsCount;
  if (totalHeight > CNB_LIMITS.MAX_FLIGHT_HEIGHT) {
    issues.push(`La hauteur totale de la volée (${formatMeasurement(totalHeight, mSys)}) dépasse la limite de ${formatMeasurement(CNB_LIMITS.MAX_FLIGHT_HEIGHT, mSys)}`);
    suggestions.push(`Diviser l'escalier en deux volées avec un palier intermédiaire`);
  }
  
  // Vérification du nombre de marches
  if (stepsCount < 3) {
    issues.push(`Le nombre de marches (${stepsCount}) est inférieur au minimum de 3 marches requises`);
  }
  
  // Vérification du confort
  const riserInInches = riserHeight / 25.4;
  const treadInInches = treadDepth / 25.4;
  const comfortValue = riserInInches + treadInInches;
  
  if (comfortValue < 17 || comfortValue > 18) {
    suggestions.push(`Pour un meilleur confort, la somme hauteur + giron devrait être entre 17" et 18" (actuellement ${comfortValue.toFixed(2)}")`);
  }
  
  // Vérification de la formule de Blondel
  const blondelValue = 2 * riserHeight + treadDepth;
  if (blondelValue < 580 || blondelValue > 680) {
    suggestions.push(`Pour un meilleur confort, la formule 2R+G devrait être proche de 630mm (actuellement ${Math.round(blondelValue)}mm)`);
  }
  
  // Vérifications spécifiques au type d'escalier
  if (stairType === 'spiral') {
    const width = parseMeasurement(document.getElementById('stairWidth').value, mSys);
    
    if (width && width < CNB_LIMITS.WIDTH.SPIRAL) {
      issues.push(`La largeur d'un escalier hélicoïdal doit être d'au moins ${formatMeasurement(CNB_LIMITS.WIDTH.SPIRAL, mSys)}`);
    }
    
    if (useType === 'exit') {
      issues.push(`Les escaliers hélicoïdaux ne peuvent pas être utilisés comme issues selon le CNB §9.8.4.7`);
      suggestions.push(`Utiliser un autre type d'escalier pour les issues`);
    } else if (document.getElementById('handrailsCount').value !== '2') {
      issues.push(`Les escaliers hélicoïdaux doivent avoir des mains courantes des deux côtés selon le CNB §9.8.4.7`);
    }
  } else if (stairType === 'winder') {
    if (document.getElementById('turningAngle').value !== '30' && document.getElementById('turningAngle').value !== '45') {
      issues.push(`Les marches rayonnantes doivent permettre de tourner à un angle de 30° ou 45° selon le CNB §9.8.4.6`);
    }
    
    if (document.getElementById('turningAngle').value === 'custom') {
      const customAngle = parseInt(document.getElementById('customAngle').value);
      if (customAngle > 90) {
        issues.push(`Les marches rayonnantes ne doivent pas permettre de tourner à plus de 90° selon le CNB §9.8.4.6`);
      }
    }
  }
  
  // Proposition de solution
  const propositionDiv = document.createElement('div');
  propositionDiv.className = 'calculation-result';
  
  if (isCompliant && issues.length === 0) {
    propositionDiv.innerHTML = `
      <h2>Proposition d'escalier conforme</h2>
      <div class="success">
        <p>L'escalier calculé est conforme au Code National du Bâtiment 2015.</p>
        <p>Caractéristiques de l'escalier proposé :</p>
        <ul>
          <li>Nombre de marches : <strong>${stepsCount}</strong></li>
          <li>Hauteur de contremarche : <strong>${formatMeasurement(riserHeight, mSys)}</strong></li>
          <li>Profondeur de giron : <strong>${formatMeasurement(treadDepth, mSys)}</strong></li>
          <li>Longueur totale de l'escalier : <strong>${formatMeasurement(totalRunLength, mSys)}</strong></li>
        </ul>
    `;
    
    // Ajouter les exigences spécifiques selon le type d'escalier
    let specificRequirements = '';
    
    if (stairType === 'spiral') {
      specificRequirements = `
        <p>Exigences supplémentaires pour un escalier hélicoïdal :</p>
        <ul>
          <li>Largeur libre entre mains courantes : min. <strong>${formatMeasurement(CNB_LIMITS.WIDTH.SPIRAL, mSys)}</strong></li>
          <li>Profondeur de marche à 300mm de l'axe de la main courante : min. <strong>${formatMeasurement(CNB_LIMITS.TREAD_DEPTH.SPIRAL.MIN, mSys)}</strong></li>
          <li>Hauteur libre minimale : <strong>${formatMeasurement(CNB_LIMITS.HEADROOM.SPIRAL, mSys)}</strong></li>
          <li>Mains courantes des deux côtés obligatoires</li>
        </ul>
      `;
    } else if (stairType === 'winder') {
      specificRequirements = `
        <p>Exigences supplémentaires pour un escalier avec marches rayonnantes :</p>
        <ul>
          <li>Les marches rayonnantes doivent permettre de tourner à un angle de 30° ou 45°</li>
          <li>L'angle de rotation total ne doit pas dépasser 90°</li>
          <li>Giron minimal à l'extrémité étroite : <strong>150 mm</strong></li>
        </ul>
      `;
    }
    
    // Ajout des exigences de garde-corps et mains courantes
    let guardRequirements = `
      <p>Exigences pour les mains courantes et garde-corps :</p>
      <ul>
        <li>Hauteur de main courante : <strong>${formatMeasurement(CNB_LIMITS.HANDRAIL_HEIGHT.MIN, mSys)} à ${formatMeasurement(CNB_LIMITS.HANDRAIL_HEIGHT.MAX, mSys)}</strong></li>
    `;
    
    if (bType === 'dwelling' && location === 'interior') {
      guardRequirements += `<li>Hauteur de garde-corps (si applicable) : min. <strong>${formatMeasurement(CNB_LIMITS.GUARD_HEIGHT.RESIDENTIAL_INTERIOR, mSys)}</strong></li>`;
    } else {
      guardRequirements += `<li>Hauteur de garde-corps (si applicable) : min. <strong>${formatMeasurement(CNB_LIMITS.GUARD_HEIGHT.COMMON, mSys)}</strong></li>`;
    }
    
    guardRequirements += `</ul>`;
    
    propositionDiv.innerHTML += specificRequirements + guardRequirements;
    
    // Ajouter les suggestions d'amélioration
    if (suggestions.length > 0) {
      propositionDiv.innerHTML += `
        <div class="warning">
          <p>Suggestions pour améliorer le confort :</p>
          <ul>
            ${suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
  } else {
    // Si l'escalier n'est pas conforme
    propositionDiv.innerHTML = `
      <h2>Proposition d'escalier conforme</h2>
      <div class="error">
        <p>L'escalier calculé présente des non-conformités :</p>
        <ul>
          ${issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>
      </div>
    `;
    
    // Proposer une solution conforme
    let improvedRiserHeight = riserHeight;
    let improvedTreadDepth = treadDepth;
    let improvedStepsCount = stepsCount;
    
    // Ajuster la hauteur de contremarche si nécessaire
    if (riserHeight < riserLimits.MIN) {
      improvedRiserHeight = riserLimits.MIN;
    } else if (riserHeight > riserLimits.MAX) {
      improvedRiserHeight = riserLimits.MAX;
    }
    
    // Ajuster le giron si nécessaire
    if (treadDepth < treadLimits.MIN) {
      improvedTreadDepth = treadLimits.MIN;
    } else if (treadLimits.MAX !== Infinity && treadDepth > treadLimits.MAX) {
      improvedTreadDepth = treadLimits.MAX;
    }
    
    // Recalculer le nombre de marches si les dimensions ont changé
    if (improvedRiserHeight !== riserHeight) {
      improvedStepsCount = Math.round(totalHeight / improvedRiserHeight);
      improvedRiserHeight = totalHeight / improvedStepsCount;
    }
    
    // Vérifier si la longueur est conforme avec l'espace disponible
    const improvedRunLength = improvedTreadDepth * (improvedStepsCount - 1);
    let runLengthOk = true;
    
    if (availableRun && improvedRunLength > availableRun) {
      runLengthOk = false;
    }
    
    if (runLengthOk) {
      propositionDiv.innerHTML += `
        <div class="success">
          <p>Voici une proposition d'escalier conforme :</p>
          <ul>
            <li>Nombre de marches : <strong>${improvedStepsCount}</strong></li>
            <li>Hauteur de contremarche : <strong>${formatMeasurement(improvedRiserHeight, mSys)}</strong></li>
            <li>Profondeur de giron : <strong>${formatMeasurement(improvedTreadDepth, mSys)}</strong></li>
            <li>Longueur totale de l'escalier : <strong>${formatMeasurement(improvedRunLength, mSys)}</strong></li>
          </ul>
        </div>
      `;
    } else {
      // Si les dimensions proposées dépassent l'espace disponible
      propositionDiv.innerHTML += `
        <div class="warning">
          <p>Il n'est pas possible de concevoir un escalier totalement conforme avec les contraintes d'espace actuelles.</p>
          <p>Solutions possibles :</p>
          <ul>
            <li>Augmenter l'espace horizontal disponible à au moins ${formatMeasurement(improvedRunLength, mSys)}</li>
            <li>Diviser l'escalier en plusieurs volées avec des paliers intermédiaires</li>
            <li>Envisager un escalier tournant ou hélicoïdal pour économiser de l'espace</li>
            <li>Consulter un professionnel pour une solution personnalisée</li>
          </ul>
        </div>
      `;
    }
    
    // Ajouter des recommandations spécifiques selon le type d'escalier
    if (stairType === 'spiral' && useType === 'exit') {
      propositionDiv.innerHTML += `
        <div class="error">
          <p>Les escaliers hélicoïdaux ne peuvent pas être utilisés comme issues selon le CNB §9.8.4.7.</p>
          <p>Solution : Utiliser un autre type d'escalier pour les issues.</p>
        </div>
      `;
    }
  }
  
  resEl.appendChild(propositionDiv);
}
