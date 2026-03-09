const fetch = require('node-fetch');

async function checkSodium() {
  const url = 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=59360&size=500&sort=desc';
  const res = await fetch(url);
  const data = await res.json();
  const params = new Set();
  data.data.forEach(d => {
    params.add(`${d.code_parametre}: ${d.libelle_parametre}`);
  });
  console.log(Array.from(params).join('\n'));
}

checkSodium();
