// stairCheck.js

/**
 * Parse une saisie métrique (en mm) ou impériale (pieds‑pouces-fraction)
 * et renvoie la valeur en millimètres.
 */
function parseMeasurement(input, system) {
  input = input.trim();
  if (system === 'metric') {
    const mm = parseFloat(input);
    if (isNaN(mm)) throw new Error('Format métrique invalide (ex: 190 ou 2050)');
    return mm;
  } else {
    const s = input.replace(/["”]/g, '').trim();
    let m;
    // 1) A'-B C/G
    m = s.match(/^(\d+)['’]-(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , ft, in_, num, den ] = m.map(Number);
      return (ft*12 + in_ + num/den) * 25.4;
    }
    // 2) A'-B
    m = s.match(/^(\d+)['’]-(\d+)$/);
    if (m) {
      const [ , ft, in_ ] = m.map(Number);
      return (ft*12 + in_) * 25.4;
    }
    // 3) A'
    m = s.match(/^(\d+)['’]$/);
    if (m) {
      return parseInt(m[1],10) * 12 * 25.4;
    }
    // 4) B C/G
    m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , in_, num, den ] = m.map(Number);
      return (in_ + num/den) * 25.4;
    }
    // 5) C/G
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) {
      const [ , num, den ] = m.map(Number);
      return (num/den) * 25.4;
    }
    // 6) B (pouces seuls)
    m = s.match(/^(\d+)$/);
    if (m) {
      return parseInt(m[1],10) * 25.4;
    }
    throw new Error('Format impérial invalide (ex: 7\'-3 15/32", 7\', 3 15/32", 15/32")');
  }
}

/**
 * Convertit des mm en pouces décimales.
 */
function mmToInches(mm) {
  return mm / 25.4;
}

/**
 * Vérifie la règle du pas (confort de marche).
 * Retourne le nombre de formules respectées (sur 3) et un tableau de booléens.
 */
function checkStepRule(riserMm, treadMm) {
  const r = mmToInches(riserMm);
  const g = mmToInches(treadMm);
  const ok1 = (g + r) >= 17 && (g + r) <= 18;       // G + CM = 17"–18"
  const ok2 = (g * r) >= 71 && (g * r) <= 74;      // G × CM = 71–74
  const ok3 = (g + 2*r) >= 22 && (g + 2*r) <= 25;  // G + 2·CM = 22"–25"
  const count = [ok1, ok2, ok3].filter(x => x).length;
  return { count, rules: [ok1, ok2, ok3] };
}

/**
 * Fonction principale appelée au clic du bouton "Vérifier la conformité".
 */
function validateStair() {
  const bType = document.getElementById('buildingType').value;
  const mSys  = document.getElementById('measurementSystem').value;
  const resEl = document.getElementById('results');
  resEl.innerHTML = '';

  try {
    // 1) Conversion
    const riser    = parseMeasurement(document.getElementById('riserHeight').value, mSys);
    const tread    = parseMeasurement(document.getElementById('treadDepth').value, mSys);
    const width    = parseMeasurement(document.getElementById('stairWidth').value, mSys);
    const headroom = parseMeasurement(document.getElementById('headroom').value, mSys);

    // 2) Seuils CNB
    let riserMin, riserMax, treadMin, treadMax, widthMin, headMin;
    if (bType === 'part9') {
      // Partie 9 – "privé"
      riserMin = 125;   riserMax = 200;
      treadMin = 255;   treadMax = 355;
      widthMin = 860;   headMin = 1950;
    } else {
      // Partie 3 – "commun"
      riserMin = 125;   riserMax = 180;
      treadMin = 280;   treadMax = Infinity;
      widthMin = 900;   headMin = 2050;
    }

    // 3) Validation CNB
    const errors = [];
    if (riser < riserMin || riser > riserMax) {
      errors.push(`⚠ CNB : contremarche ${riser.toFixed(1)} mm hors plage [${riserMin}–${riserMax}] mm.`);
    }
    if (tread < treadMin || tread > treadMax) {
      const maxTxt = (treadMax===Infinity)? '∞' : treadMax;
      errors.push(`⚠ CNB : giron ${tread.toFixed(1)} mm hors plage [${treadMin}–${maxTxt}] mm.`);
    }
    if (width < widthMin) {
      errors.push(`⚠ CNB : largeur ${width.toFixed(1)} mm < ${widthMin} mm.`);
    }
    if (headroom < headMin) {
      errors.push(`⚠ CNB : hauteur libre ${headroom.toFixed(1)} mm < ${headMin} mm.`);
    }

    // 4) Règle du pas (confort)
    const step = checkStepRule(riser, tread);
    if (step.count < 2) {
      errors.push(
        `⚠ Règle du pas non respectée : seulement ${step.count}/3 formules valides. ` +
        `Pour plus de confort, respectez au moins deux des trois : ` +
        `G+CM=17–18", G×CM=71–74, G+2·CM=22–25".`
      );
    }

    // 5) Affichage
    if (errors.length) {
      errors.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = msg;
        resEl.appendChild(div);
      });
    } else {
      const div = document.createElement('div');
      div.className = 'success';
      div.textContent = '✓ Conforme aux exigences CNB et règle du pas.';
      resEl.appendChild(div);
    }

  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur : ' + e.message;
    resEl.appendChild(div);
  }
}
