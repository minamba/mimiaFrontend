import { useEffect, useState } from 'react';
import { sessionEleve } from '../../lib/storage/sessionEleve';
import FichesDuForfait from '../FichesDuForfait';
import './achatCredits.css';

/**
 * « ACHETER DES CRÉDITS » SUR LES PAGES DES FICHES ET DES PODCASTS — Camara, le 16/11/2026 : « à partir du compte
 * parent, quand il va dans podcasts, il faut un bouton pour acheter des crédits en plus, pareil pour les fiches de
 * révision ».
 *
 * LE PARENT SEULEMENT : un enfant entré par son code ne voit ni le bouton ni la fenêtre (Camara, le même jour) — il
 * n'a rien à payer, il demande à ses parents.
 *
 * LA FENÊTRE REPREND L'ENCADRÉ DE « MON FORFAIT » (`FichesDuForfait`) : les mêmes packs, la même confirmation, le même
 * paiement Stripe, les mêmes refus (essai, pause, Starter pour les podcasts). Rien de vendu ici qui ne le soit là-bas.
 */
export default function AchatCredits({ module = 'fiches', className = '' }) {
  // DE RETOUR DE STRIPE SUR CETTE PAGE (17/11/2026) : la fenêtre se rouvre d'elle-même — le merci et le solde relu
  // après un paiement, l'encadré tel qu'on l'a laissé après un abandon.
  const [ouvert, setOuvert] = useState(
    () => !sessionEleve() && new URLSearchParams(window.location.search).get('achat') === module,
  );

  useEffect(() => {
    if (!ouvert) return undefined;
    const auClavier = (evenement) => {
      if (evenement.key === 'Escape') setOuvert(false);
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [ouvert]);

  if (sessionEleve()) return null;

  const podcasts = module === 'podcasts';

  return (
    <>
      <button type="button" className={`btn btn--compact achat-credits__bouton ${className}`.trim()} onClick={() => setOuvert(true)}>
        Acheter des crédits
      </button>

      {ouvert && (
        <div
          className="modale"
          role="dialog"
          aria-modal="true"
          aria-label={podcasts ? 'Acheter des crédits de podcasts' : 'Acheter des crédits de fiches de révision'}
          onMouseDown={(evenement) => { if (evenement.target === evenement.currentTarget) setOuvert(false); }}
        >
          <div className="modale__boite achat-credits__fenetre">
            <button type="button" className="achat-credits__fermer" aria-label="Fermer" onClick={() => setOuvert(false)}>×</button>
            <FichesDuForfait module={module} fenetre />
          </div>
        </div>
      )}
    </>
  );
}
