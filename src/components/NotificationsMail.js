import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvenementsAdmin } from '../lib/hooks/useEvenementsAdmin';
import { preparerCloche, sonnerCloche } from '../lib/sons/cloche';

/**
 * LES COURRIELS QUI ARRIVENT — Camara, le 19/10/2026 : « quand un mail arrive
 * sur la boîte de l'utilisateur, une notification comme les notifications
 * push, en bas à droite de l'écran, avec un petit son, une petite cloche ».
 *
 * Monté sur TOUTES les pages pour un administrateur : on est prévenu où que
 * l'on soit sur le site. Le serveur relève sa boîte chaque minute tant qu'un
 * onglet est ouvert (`SurveillanceBoitesWorker`) et n'envoie l'événement qu'à
 * LUI, par le flux `admin/evenements`.
 *
 * Un clic ouvre sa boîte ; chaque carte s'efface seule au bout de dix
 * secondes — une fine barre le montre —, et s'arrête tant que la souris est
 * dessus, puis reprend où elle en était. Au-delà de trois, les plus
 * anciennes partent : une avalanche de cartes cacherait la page.
 *
 * L'événement est aussi relayé à la page (`mimia:nouveau-mail`) : une
 * messagerie ouverte relit sa liste sans attendre.
 */
const DUREE_MS = 10000;
const MAXIMUM = 3;

/** L'initiale de l'expéditeur, pour sa pastille. */
function initiale(texte) {
  const lettre = (texte ?? '').trim().match(/\p{L}|\d/u)?.[0];
  return lettre ? lettre.toUpperCase() : '@';
}

function IconeCloche() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a6 6 0 0 0-6 6v3.6l-1.7 3.4A1 1 0 0 0 5.2 16.5h13.6a1 1 0 0 0 .9-1.5L18 11.6V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.8-2h-5.6A3 3 0 0 0 12 22Z" />
    </svg>
  );
}

export default function NotificationsMail() {
  const naviguer = useNavigate();
  const [cartes, setCartes] = useState([]);
  // Par carte : son minuteur, l'heure où elle doit partir, et ce qui lui
  // restait quand la souris s'est posée dessus.
  const minuteurs = useRef(new Map());

  useEffect(() => { preparerCloche(); }, []);

  const retirer = useCallback((cle) => {
    clearTimeout(minuteurs.current.get(cle)?.minuteur);
    minuteurs.current.delete(cle);
    setCartes((liste) => liste.filter((c) => c.cle !== cle));
  }, []);

  const programmer = useCallback((cle, duree = DUREE_MS) => {
    clearTimeout(minuteurs.current.get(cle)?.minuteur);
    minuteurs.current.set(cle, {
      minuteur: setTimeout(() => retirer(cle), duree),
      fin: Date.now() + duree,
      restant: duree,
    });
  }, [retirer]);

  const suspendre = useCallback((cle) => {
    const etat = minuteurs.current.get(cle);
    if (!etat) return;
    clearTimeout(etat.minuteur);
    minuteurs.current.set(cle, { ...etat, minuteur: null, restant: Math.max(0, etat.fin - Date.now()) });
  }, []);

  const reprendre = useCallback((cle) => {
    const etat = minuteurs.current.get(cle);
    if (etat && !etat.minuteur) programmer(cle, etat.restant);
  }, [programmer]);

  useEffect(() => () => { minuteurs.current.forEach((m) => clearTimeout(m.minuteur)); }, []);

  useEvenementsAdmin((type, charge) => {
    if (type !== 'mail') return;
    const messages = charge?.messages ?? [];
    if (messages.length === 0) return;

    window.dispatchEvent(new CustomEvent('mimia:nouveau-mail', { detail: charge }));
    sonnerCloche();

    const nouvelles = messages.slice(-MAXIMUM).map((m) => ({
      cle: `${charge.boite ?? 'moi'}-${m.id}`,
      boite: charge.boite ?? 'moi',
      de: m.deNom || m.deAdresse || 'Expéditeur inconnu',
      sujet: m.sujet || '(sans objet)',
      extrait: m.extrait || '',
    }));

    setCartes((liste) => {
      const sans = liste.filter((c) => !nouvelles.some((n) => n.cle === c.cle));
      const toutes = [...sans, ...nouvelles];
      toutes.slice(0, Math.max(0, toutes.length - MAXIMUM)).forEach((c) => {
        clearTimeout(minuteurs.current.get(c.cle)?.minuteur);
        minuteurs.current.delete(c.cle);
      });
      return toutes.slice(-MAXIMUM);
    });
    nouvelles.forEach((n) => programmer(n.cle));
  });

  if (cartes.length === 0) return null;

  return (
    <div className="notif-mail" aria-live="polite">
      {cartes.map((c) => (
        <div
          key={c.cle}
          className="notif-mail__carte"
          role="status"
          style={{ '--notif-duree': `${DUREE_MS}ms` }}
          onMouseEnter={() => suspendre(c.cle)}
          onMouseLeave={() => reprendre(c.cle)}
        >
          <button
            type="button"
            className="notif-mail__corps"
            onClick={() => {
              retirer(c.cle);
              naviguer(`/admin?onglet=mails&boite=${c.boite}`);
            }}
          >
            <span className="notif-mail__avatar" aria-hidden="true">
              {initiale(c.de)}
              <span className="notif-mail__cloche"><IconeCloche /></span>
            </span>
            <span className="notif-mail__texte">
              <span className="notif-mail__entete">
                <span className="notif-mail__etiquette">Nouveau mail</span>
                <span className="notif-mail__quand">à l’instant</span>
              </span>
              <span className="notif-mail__de">{c.de}</span>
              <strong className="notif-mail__sujet">{c.sujet}</strong>
              {c.extrait && <span className="notif-mail__extrait">{c.extrait}</span>}
              <span className="notif-mail__ouvrir">Ouvrir la boîte →</span>
            </span>
          </button>
          <button type="button" className="notif-mail__fermer" aria-label="Fermer la notification" onClick={() => retirer(c.cle)}>
            ×
          </button>
          <span className="notif-mail__temps" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
