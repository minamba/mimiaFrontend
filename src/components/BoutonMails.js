import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCompteursMessagerie } from '../lib/api/adminApi';
import iconeMails from '../assets/icone-mails2-160.png';
import iconeAdmin from '../assets/icone-admin-160.png';
import BoutonSignalementAdmin from './BoutonSignalementAdmin';

/**
 * LA BOÎTE AUX LETTRES, EN BAS À GAUCHE — Camara, le 20/10/2026 : pour les
 * admins et le super-admin, une icône toujours visible qui mène à
 * Administration › Mails ; un badge qui compte les non lus ; et un effet
 * « respirant » quand un courriel vient d'arriver.
 *
 * LE COMPTE vient des compteurs de la boîte (une connexion IMAP), lus à
 * l'arrivée, au retour sur l'onglet et toutes les deux minutes ; il est mis à
 * jour tout de suite quand un courriel arrive (`mimia:nouveau-mail`, voir
 * NotificationsMail) ou quand la messagerie ouverte change ses non lus
 * (`mimia:non-lus`, voir Messagerie).
 *
 * LA RESPIRATION dure jusqu'au clic sur l'icône, ou jusqu'à ce qu'il ne reste
 * plus rien à lire.
 *
 * LE BOUCLIER À CÔTÉ (20/10/2026) : il mène à l'administration, pour les
 * mêmes personnes, avec les mêmes règles d'affichage.
 *
 * CACHÉE PENDANT LE TRAVAIL D'UN ÉLÈVE — séance, jeu, contrôle, examen : un
 * administrateur qui essaie un cours ne doit pas voir une icône posée sur le
 * micro ou sur une réponse.
 */
const INTERVALLE_MS = 120000;
const PAGES_DE_TRAVAIL = [/\/chat$/, /\/jeux$/, /\/controles\/[^/]+$/, /\/examen\//, /^\/scan\//, /^\/code$/];

export default function BoutonMails() {
  const naviguer = useNavigate();
  const { pathname } = useLocation();
  const [nonLus, setNonLus] = useState(null);
  const [nouveau, setNouveau] = useState(false);

  const lire = useCallback(async () => {
    try {
      const { data } = await getCompteursMessagerie('moi');
      setNonLus(typeof data?.nonLus === 'number' ? data.nonLus : null);
    } catch {
      // Boîte pas encore connectée (409) ou injoignable : l'icône reste, sans badge.
      setNonLus(null);
    }
  }, []);

  useEffect(() => {
    lire();
    const minuteur = setInterval(() => { if (document.visibilityState !== 'hidden') lire(); }, INTERVALLE_MS);
    const auRetour = () => { if (document.visibilityState === 'visible') lire(); };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      clearInterval(minuteur);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [lire]);

  useEffect(() => {
    const arrive = (e) => {
      if ((e.detail?.boite ?? 'moi') !== 'moi') return;
      if (typeof e.detail?.nonLus === 'number') setNonLus(e.detail.nonLus);
      setNouveau(true);
    };
    const change = (e) => {
      if ((e.detail?.boite ?? 'moi') !== 'moi' || typeof e.detail?.nonLus !== 'number') return;
      setNonLus(e.detail.nonLus);
      if (e.detail.nonLus === 0) setNouveau(false);
    };
    window.addEventListener('mimia:nouveau-mail', arrive);
    window.addEventListener('mimia:non-lus', change);
    return () => {
      window.removeEventListener('mimia:nouveau-mail', arrive);
      window.removeEventListener('mimia:non-lus', change);
    };
  }, []);

  if (PAGES_DE_TRAVAIL.some((motif) => motif.test(pathname))) return null;

  const libelle = nonLus > 0
    ? `Mes mails — ${nonLus} non lu${nonLus > 1 ? 's' : ''}`
    : 'Mes mails';

  return (
    <div className="raccourcis-admin">
      <button
        type="button"
        className={`bouton-mails${nouveau ? ' est-nouveau' : ''}`}
        aria-label={libelle}
        title={libelle}
        onClick={() => {
          setNouveau(false);
          naviguer('/admin?onglet=mails&boite=moi');
        }}
      >
        <img src={iconeMails} alt="" width="64" height="64" />
        {nonLus > 0 && (
          <span className="bouton-mails__badge" aria-hidden="true">{nonLus > 99 ? '99+' : nonLus}</span>
        )}
      </button>

      {/* LE BOUCLIER : l'administration, d'un clic (20/10/2026). */}
      <button
        type="button"
        className="bouton-mails bouton-mails--admin"
        aria-label="Administration"
        title="Administration"
        onClick={() => naviguer('/admin')}
      >
        <img src={iconeAdmin} alt="" width="64" height="64" />
      </button>

      {/* LE SIGNALEMENT D'UN ADMINISTRATEUR, relié aux jeux de test (05/11/2026). */}
      <BoutonSignalementAdmin />
    </div>
  );
}
