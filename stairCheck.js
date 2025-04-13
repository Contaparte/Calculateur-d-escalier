// stairCheck.js

/**
 * Parse une saisie métrique (en mm) ou impériale (pieds‑pouces-fraction)
 * et renvoie la valeur en millimètres.
 * Formats impériaux supportés :
 *  - A'-B C/G"   (ex. 7'-3 15/32")
 *  - A'          (ex. 7')
 *  - A'-B"       (ex. 7'-3")
 *  - B"          (ex. 36")
 *  - B C/G"      (ex. 3 15/32")
 *  - C/G"        (ex. 15/32")
 */
function parseMeasurement(input, system) {
  input = input.trim();
  if (system === 'metric') {
    const mm = parseFloat(input);
    if (isNaN(mm)) throw new Error('Format métrique invalide (ex: 190 ou 2050)');
    return mm;
  } else {
    // On retire d'abord les guillemets doubles pour simplifier
    const s = input.replace(/["”]/g, '');

    // 1) Pieds‑pouces‑fraction : A'-B C/G
    let m = s.match(/^(\d+)['’]-(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , ft, in_, num, den ] = m.map(Number);
      return (ft * 12 + in_ + num/den) * 25.4;
    }
    // 2) Pieds‑pouces : A'-B
    m = s.match(/^(\d+)['’]-(\d+)$/);
    if (m) {
      const [ , ft, in_ ] = m.map(Number);
      return (ft * 12 + in_) * 25.4;
    }
    // 3) Pieds seuls : A'
    m = s.match(/^(\d+)['’]$/);
    if (m) {
      const ft = parseInt(m[1], 10);
      return ft * 12 * 25.4;
    }
    // 4) Pouces‑fraction : B C/G
    m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (m) {
      const [ , in_, num, den ] = m.map(Number);
      return (in_ + num/den) * 25.4;
    }
    // 5) Fraction seule : C/G
    m = s.match(/^(\d+)\/(\d+)$/);
    if (m) {
      const [ , num, den ] = m.map(Number);
      return (num/den) * 25.4;
    }
    // 6) Pouces seuls : B
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
 * Elle lit les valeurs du formulaire, convertit en mm, puis compare
 * aux seuils CNB selon le type de bâtiment choisi.
 */
function validateStair() {
  const bType = document.getElementById('buildingType').value;       // 'part9' ou 'part3'
  const mSys  = document.getElementById('measurementSystem').value;  // 'metric' ou 'imperial'
  const resEl = document.getElementById('results');
  resEl.innerHTML = '';

  try {
    // Récupération et conversion
    const riser     = parseMeasurement(document.getElementById('riserHeight').value, mSys);
    const tread     = parseMeasurement(document.getElementById('treadDepth').value, mSys);
    const width     = parseMeasurement(document.getElementById('stairWidth').value, mSys);
    const headroom  = parseMeasurement(document.getElementById('headroom').value, mSys);

    // Seuils CNB
    let riserMin, riserMax, treadMin, treadMax, widthMin, headMin;
    if (bType === 'part9') {
      riserMin = 125;   riserMax = 200;
      treadMin = 255;   treadMax = 355;
      widthMin = 860;
      headMin  = 1950;
    } else {
      riserMin = 125;   riserMax = 180;
      treadMin = 280;   treadMax = Infinity;
      widthMin = 900;
      headMin  = 2050;
    }

    // Validation
    const errors = [];
    if (riser < riserMin || riser > riserMax) {
      errors.push(`Hauteur de contremarche (${riser.toFixed(1)} mm) doit être entre ${riserMin} et ${riserMax} mm.`);
    }
    if (tread < treadMin || tread > treadMax) {
      const maxTxt = (treadMax === Infinity) ? '∞' : treadMax;
      errors.push(`Profondeur de giron (${tread.toFixed(1)} mm) doit être ≥ ${treadMin} mm et ≤ ${maxTxt} mm.`);
    }
    if (width < widthMin) {
      errors.push(`Largeur de l'escalier (${width.toFixed(1)} mm) doit être ≥ ${widthMin} mm.`);
    }
    if (headroom < headMin) {
      errors.push(`Hauteur libre (${headroom.toFixed(1)} mm) doit être ≥ ${headMin} mm.`);
    }

    // Affichage des résultats
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
  } catch (e) {
    const div = document.createElement('div');
    div.className = 'error';
    div.textContent = 'Erreur : ' + e.message;
    resEl.appendChild(div);
  }
}
