import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMonQuota } from '../lib/api/abonnementApi';
import { heures } from './Quota';

/**
 * LE TEMPS QUI RESTE, SUR LA PAGE « MES ENFANTS » — Camara, le 01/11/2026 :
 * « je voudrais que tu affiches le temps qui reste sur le forfait du parent
 * pour que ce soit visible directement, avec un lien qui emmène sur l'onglet
 * Mon forfait ».
 *
 * C'est la première page qu'un parent voit après connexion. Le chiffre était
 * deux clics plus loin, dans « Mon compte » : un parent ne le regardait
 * qu'une fois ses enfants bloqués.
 *
 * UN RÉSUMÉ, PAS LE FORFAIT. Les achats, la pause et la résiliation restent
 * dans l'onglet ; ici une ligne et un lien. Le même calcul que l'onglet
 * (même route), donc jamais deux chiffres différents à l'écran.
 *
 * RIEN QUAND IL N'Y A RIEN À DIRE : pas d'abonnement (204), une erreur, ou un
 * compte qui n'y a pas droit. Un bandeau d'erreur sur la page d'accueil du
 * parent pour une information secondaire ferait plus de mal que son absence.
 */
export default function ResteForfait() {
  const [etat, setEtat] = useState(null);

  useEffect(() => {
    let actif = true;

    // Dans une promesse dès le départ : une exception levée par l'appel
    // lui-même finit dans le `catch`, au lieu de casser la page entière.
    Promise.resolve()
      .then(() => getMonQuota())
      .then(({ data, status }) => {
        if (actif && status !== 204) setEtat(data);
      })
      .catch(() => {
        // Voir plus haut : en cas d'échec, on n'affiche rien.
      });

    return () => { actif = false; };
  }, []);

  if (!etat || typeof etat.minutesRestantes !== 'number') return null;

  // Les mêmes trois états que l'onglet du forfait : l'ambre prévient avant la
  // panne, sous 20 % du pot.
  const niveau = etat.minutesRestantes === 0
    ? 'vide'
    : etat.partConsommee >= 0.8
      ? 'bas'
      : 'normal';

  return (
    <Link
      to="/profil?onglet=forfait"
      className={`reste-forfait reste-forfait--${niveau}`}
    >
      <span className="reste-forfait__offre">
        {etat.offreLibelle || 'Votre forfait'}
        {etat.enPause && <small> · en pause</small>}
      </span>

      <span className="reste-forfait__temps">
        <strong>{heures(etat.minutesRestantes)}</strong>
        {etat.minutesRestantes === 0 ? ' : plus d’heures' : ' restantes'}
      </span>

      <span className="reste-forfait__lien">
        Voir mon forfait
        <span aria-hidden="true"> →</span>
      </span>
    </Link>
  );
}
