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
      const ft = parseInt(m[1], 10);
      return ft*12*25.4;
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
      const in_ = parseInt(m[1], 10);
      return in_ * 25.4;
    }
    throw new Error('Format impérial invalide (ex: 7\'-3 15/32", 7\', 3 15/32", 15/32")');
  }
}

/**
 * Fonction principale appelée au clic du bouton "Vérifier la conformité".
 */
function validateStair() {
  const bType = document.getElementById('buildingType').value;       // 'part9' ou 'part3'
  const mSys  = document.getElementById('measurementSystem').value;  // 'metric' ou 'imperial'
  const resEl = document.getElementById('results');
  resEl.innerHTML = '';

  try {
    // 1) Récupération et conversion
    const riser    = parseMeasurement(document.getElementById('riserHeight').value, mSys);
    const tread    = parseMeasurement(document.getElementById('treadDepth').value, mSys);
    const width    = parseMeasurement(document.getElementById('stairWidth').value, mSys);
    const headroom = parseMeasurement(document.getElementById('headroom').value, mSys);

    // 2) Seuils CNB
    let riserMin, riserMax, treadMin, treadMax, widthMin, headMin;
    if (bType === 'part9') {
      riserMin = 125;   riserMax = 200;   // §9.8.4.1
      treadMin = 255;   treadMax = 355;   // §9.8.4.2
      widthMin = 860;                      // §9.8.2.1
      headMin  = 1950;                     // §9.8.2.2
    } else {
      riserMin = 125;   riserMax = 180;   // §9.8.4.1
      treadMin = 280;   treadMax = Infinity; // §9.8.4.2
      widthMin = 900;                      // §9.8.2.1
      headMin  = 2050;                     // §9.8.2.2
    }

    // 3) Validation CNB
    const errors = [];
    if (riser < riserMin || riser > riserMax) {
      errors.push(`Hauteur de contremarche (${riser.toFixed(1)} mm) doit être entre ${riserMin} et ${riserMax} mm (CNB 2015 §9.8.4.1).`);
    }
    if (tread < treadMin || tread > treadMax) {
      const maxTxt = (treadMax === Infinity) ? '∞' : treadMax;
      errors.push(`Profondeur de giron (${tread.toFixed(1)} mm) doit être ≥ ${treadMin} mm et ≤ ${maxTxt} mm (CNB 2015 §9.8.4.2).`);
    }
    if (width < widthMin) {
      errors.push(`Largeur de l'escalier (${width.toFixed(1)} mm) doit être ≥ ${widthMin} mm (CNB 2015 §9.8.2.1).`);
    }
    if (headroom < headMin) {
      errors.push(`Hauteur libre (${headroom.toFixed(1)} mm) doit être ≥ ${headMin} mm (CNB 2015 §9.8.2.2).`);
    }

    // 4) Affichage résultats CNB
    if (errors.length) {
      errors.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = '⚠ ' + msg;
        resEl.appendChild(div);
      });
    } else {
      const div = document.createElement('div');
      div.className = 'success';
      div.textContent = '✓ Conforme aux exigences du CNB.';
      resEl.appendChild(div);
    }

    // 5) Vérification de la règle du pas (confort)
    const riserIn = riser / 25.4;
    const treadIn = tread / 25.4;
    const rules = [
      { name: 'Giron + CM',     value: treadIn + riserIn,      min: 17, max: 18 },
      { name: 'Giron × CM',     value: treadIn * riserIn,      min: 71, max: 74 },
      { name: 'Giron + 2×CM',   value: treadIn + 2*riserIn,    min: 22, max: 25 },
    ];
    let okCount = 0;
    rules.forEach(r => {
      if (r.value >= r.min && r.value <= r.max) {
        okCount++;
      } else {
        const div = document.createElement('div');
        div.className = 'error';
        div.textContent = `⚠ Règle du pas « ${r.name} » = ${r.value.toFixed(2)}" (devrait être entre ${r.min}" et ${r.max}") – recommandé (CNB 2015 §9.8.4.2).`;
        resEl.appendChild(div);
      }
    });
    if (okCount < 2) {
      const div = document.createElement('div');
      div.className = 'error';
      div.textContent = '⚠ Confort de marche non optimal : seules ' +
        `${okCount} règle(s) sur 3 respectée(s). Il est recommandé d’en respecter au moins 2 pour un pas équilibré.`;
      resEl.appendChild(div);
    }

  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur : ' + e.message;
    resEl.appendChild(div);
  }
}
