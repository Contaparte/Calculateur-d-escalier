// stairCheck.js

/**
 * Parse une saisie métrique (en mm) ou impériale (pieds‑pouces-fraction)
 * et renvoie la valeur en millimètres.
 * Pour le système impérial, le format attendu est : X'-Y Z/W"
 *   ex. 7'-3 15/32"
 */
function parseMeasurement(input, system) {
  input = input.trim();
  if (system === 'metric') {
    const mm = parseFloat(input);
    if (isNaN(mm)) throw new Error('Format métrique invalide (ex: 190 ou 2050)');
    return mm;
  } else {
    // impérial : X'-Y Z/W"
    const re = /^(\d+)['’]-(\d+)(?:\s+(\d+)\/(\d+))?["”]?$/;
    const m = input.match(re);
    if (!m) throw new Error('Format impérial invalide (ex: 7\'-3 15/32")');
    const feet = parseInt(m[1], 10);
    const inches = parseInt(m[2], 10);
    const frac = m[3] ? (parseInt(m[3], 10) / parseInt(m[4], 10)) : 0;
    const totalInches = feet * 12 + inches + frac;
    return totalInches * 25.4;
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
      // Maisons et petits bâtiments (Partie 9) — valeurs "privé"
      riserMin = 125;   riserMax = 200;
      treadMin = 255;   treadMax = 355;
      widthMin = 860;
      headMin  = 1950;
    } else {
      // Autres bâtiments (Partie 3) — valeurs "commun"
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
