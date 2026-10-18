import { useEffect, useState } from 'react';
import { getEtatBoite } from '../lib/api/adminApi';

/**
 * DE QUELLE ADRESSE PART LE MESSAGE — Camara, le 17/10/2026 : dans « Écrire à
 * un parent » et « Message de diffusion », l'adresse d'envoi ne se voyait pas
 * comme dans la messagerie. La même carte, au-dessus du formulaire :
 *
 * - `boite` : « Écrire à un parent » part de SA boîte LWS, avec sa signature ;
 *   sans boîte connectée, rien ne part, et la carte le dit.
 * - `support` : la boîte commune, support@mimia.fr, signé « L'équipe Mimia ».
 * - `diffusion` : les annonces et les courriels automatiques partent de
 *   l'adresse d'envoi du site (no-reply), sans signature personnelle.
 */
export default function CarteExpediteur({ mode = 'boite', onConnecter = null }) {
  const [etat, setEtat] = useState(null);

  useEffect(() => {
    let actif = true;
    Promise.resolve()
      .then(() => getEtatBoite())
      .then((r) => r ?? {})
      .then(({ data }) => { if (actif) setEtat(data ?? {}); })
      .catch(() => { if (actif) setEtat({}); });
    return () => { actif = false; };
  }, []);

  if (!etat) return null;

  const diffusion = mode === 'diffusion';
  const support = mode === 'support';
  const connectee = diffusion || support || Boolean(etat.connectee);
  const adresse = support ? 'support@mimia.fr' : diffusion ? etat.diffusion?.adresse : etat.adresse;
  const nom = diffusion ? etat.diffusion?.nom : null;

  return (
    <div className={`messagerie__barre carte-expediteur${connectee ? '' : ' est-a-connecter'}`}>
      <div className="messagerie__compte">
        <span className="messagerie__compte-icone" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </span>
        <span className="messagerie__compte-texte">
          <span className="messagerie__compte-libelle">
            {diffusion && 'Envoyé depuis l’adresse de Mimia'}
            {support && 'Envoyé depuis la boîte commune du support'}
            {!diffusion && !support && 'Envoyé depuis votre boîte'}
          </span>
          <strong className="messagerie__compte-adresse">
            {connectee ? (adresse || '—') : 'Boîte non connectée'}
          </strong>
        </span>
        <span className="messagerie__compte-chiffres">
          {diffusion ? (
            <>
              {nom && <span className="messagerie__pastille">Nom affiché : {nom}</span>}
              <span className="messagerie__pastille">Sans signature personnelle</span>
            </>
          ) : support
            ? <span className="messagerie__pastille">Signé « L’équipe Mimia »</span>
            : connectee && <span className="messagerie__pastille">Avec votre signature</span>}
        </span>
      </div>

      {!connectee && (
        <div className="messagerie__barre-actions">
          <span className="carte-expediteur__aide">Sans boîte connectée, le message ne peut pas partir.</span>
          {onConnecter && (
            <button type="button" className="btn btn--compact" onClick={onConnecter}>Connecter ma boîte</button>
          )}
        </div>
      )}
    </div>
  );
}
