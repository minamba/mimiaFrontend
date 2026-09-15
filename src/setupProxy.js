/**
 * LE SCANNER PAR QR CODE, EN MODE DÉVELOPPEMENT — et seulement là.
 *
 * Ce fichier est lu par le serveur de développement de React (`npm start`),
 * JAMAIS par le build de production : en production, le site et l'API sont
 * servis ensemble sur mimia.fr et le téléphone y accède directement.
 *
 * LE PROBLÈME QU'IL RÈGLE
 * -----------------------
 * En local, tout vit sur `localhost` : le site (3000) et l'API (5066). Or,
 * pour un téléphone, `localhost` c'est LUI-MÊME. Le QR code et les appels de
 * la page du téléphone tombaient donc dans le vide.
 *
 * CE QU'IL FAIT
 * -------------
 *   1. Il relaie `/scan-mobile/...` vers l'API locale. Le téléphone ne parle
 *      qu'au serveur de développement, joignable sur le réseau de la maison ;
 *      c'est lui qui transmet à l'API, sur la même machine. L'API n'a donc pas
 *      à s'ouvrir au réseau, ni à accepter une nouvelle origine.
 *   2. Il donne l'adresse de l'ordinateur sur le réseau (`/__adresse-reseau`),
 *      pour que le QR code la porte à la place de `localhost`.
 *
 * SEULES les routes du scanner passent par ici : le reste du site continue
 * d'appeler l'API directement, comme avant.
 *
 * Il faut que le téléphone soit sur le même Wi-Fi que l'ordinateur, et que le
 * pare-feu de Windows laisse Node répondre sur le réseau.
 */
const os = require('os');
const { createProxyMiddleware } = require('http-proxy-middleware');

/** L'adresse IPv4 de cet ordinateur sur le réseau local — privée de préférence. */
function adresseReseau() {
  const candidates = [];

  Object.values(os.networkInterfaces()).forEach((liste) => {
    (liste || []).forEach((i) => {
      const ipv4 = i.family === 'IPv4' || i.family === 4;
      if (ipv4 && !i.internal && !i.address.startsWith('169.254.')) candidates.push(i.address);
    });
  });

  const privee = candidates.find((a) => /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a));
  return privee || candidates[0] || null;
}

module.exports = function configurer(app) {
  const api = process.env.REACT_APP_API_URL || 'http://localhost:5066';

  app.use(createProxyMiddleware('/scan-mobile', {
    target: api,
    changeOrigin: true,
    logLevel: 'warn',
  }));

  app.get('/__adresse-reseau', (req, res) => {
    const ip = adresseReseau();
    const port = process.env.PORT || 3000;
    res.json({ adresse: ip ? `http://${ip}:${port}` : null });
  });
};
