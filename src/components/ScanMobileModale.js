import { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { creerScanMobile, etatScanMobile } from '../lib/api/chatApi';
import { adresseScan, origineScan, tempsRestant } from '../lib/storage/scanMobile';

/** En développement, le téléphone doit joindre CET ordinateur : on le rappelle sous le QR code. */
const MODE_DEV = process.env.NODE_ENV === 'development';

/**
 * L'ICÔNE DU SCANNER : un cadre à quatre coins et un trait de lecture.
 *
 * Dessinée plutôt qu'un emoji — il n'existe pas d'emoji « scanner », et un 📱
 * se confondrait avec la caméra juste à côté.
 */
export function IconeScanner() {
  return (
    <svg
      className="icone-scanner"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M7 12h10" />
    </svg>
  );
}

/**
 * LE QR CODE DU SCANNER, SUR L'ORDINATEUR.
 *
 * Voulu par Camara le 13/09/2026 : l'enfant vise le QR code avec son
 * téléphone, photographie sa copie, et la photo arrive au professeur — sans
 * se connecter sur le téléphone.
 *
 * L'ordinateur demande toutes les deux secondes si la photo est arrivée. Une
 * attente courte, sans connexion permanente à maintenir : le QR code ne vit
 * que dix minutes.
 *
 * Dès qu'elle arrive, `onRecu` la remet à la séance, qui l'envoie au
 * professeur exactement comme une photo prise sur place. La fenêtre propose
 * alors une autre page : une copie en fait souvent plusieurs.
 */
export default function ScanMobileModale({
  conversationId, profPrenom, onRecu, onFermer, intervalle = 2000,
}) {
  const [jeton, setJeton] = useState(null);
  const [expireLe, setExpireLe] = useState(null);
  const [qr, setQr] = useState(null);
  const [etat, setEtat] = useState('creation');
  const [erreur, setErreur] = useState(null);
  const [, setTic] = useState(0);

  // Une pièce ne se remet qu'UNE fois à la séance, même si deux relevés
  // se croisent.
  const livreesRef = useRef(new Set());

  const nouveauQr = useCallback(async () => {
    setEtat('creation');
    setErreur(null);
    setQr(null);

    try {
      const { data } = await creerScanMobile(conversationId);
      const origine = await origineScan();

      // UN QR CODE « localhost » EST INUTILISABLE PAR UN TÉLÉPHONE — relevé
      // par Camara le 13/09/2026 : le téléphone ouvrait localhost:3000, sur
      // lui-même, et affichait « site inaccessible ». Le serveur de
      // développement n'avait pas été relancé depuis l'ajout du relais. On le
      // dit, plutôt que d'afficher un code qui ne peut pas marcher.
      if (MODE_DEV && /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(origine)) {
        setErreur(
          'Le téléphone ne peut pas joindre « localhost ». Relance le site (npm start) '
          + 'pour que le QR code porte l’adresse de cet ordinateur sur le réseau.',
        );
        setEtat('erreur');
        return;
      }

      const svg = await QRCode.toString(adresseScan(data.jeton, origine), {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#0b1320', light: '#ffffff' },
      });

      setJeton(data.jeton);
      setExpireLe(data.expireLe);
      setQr(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      setEtat('attente');
    } catch {
      setErreur('Le QR code n’a pas pu être créé. Tu peux réessayer ?');
      setEtat('erreur');
    }
  }, [conversationId]);

  useEffect(() => { nouveauQr(); }, [nouveauQr]);

  // LE RELEVÉ, tant que le QR code attend.
  useEffect(() => {
    if (etat !== 'attente' || !jeton) return undefined;

    let vivant = true;

    const minuteur = setInterval(async () => {
      try {
        const { data } = await etatScanMobile(conversationId, jeton);
        if (!vivant) return;

        if (data?.etat === 'recu' && data.piece && !livreesRef.current.has(data.piece.id)) {
          livreesRef.current.add(data.piece.id);
          setEtat('recu');
          onRecu?.(data.piece);
        } else if (data?.etat === 'expire') {
          setEtat('expire');
        }
      } catch {
        // Un relevé manqué n'est pas une panne : le suivant réessaie.
      }
    }, intervalle);

    return () => {
      vivant = false;
      clearInterval(minuteur);
    };
  }, [etat, jeton, conversationId, intervalle, onRecu]);

  // Le compte à rebours se redessine chaque seconde.
  useEffect(() => {
    if (etat !== 'attente') return undefined;
    const minuteur = setInterval(() => setTic((t) => t + 1), 1000);
    return () => clearInterval(minuteur);
  }, [etat]);

  // Échap ferme, comme partout ailleurs dans l'application.
  useEffect(() => {
    const auClavier = (e) => { if (e.key === 'Escape') onFermer?.(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  const prof = profPrenom ?? 'ton professeur';

  return (
    <div className="scan-mobile" role="dialog" aria-modal="true" aria-label="Scanner avec ton téléphone">
      <div className="scan-mobile__carte">
        <button type="button" className="scan-mobile__fermer" aria-label="Fermer" onClick={onFermer}>
          ×
        </button>

        <h2 className="scan-mobile__titre">
          <IconeScanner /> Scanner avec ton téléphone
        </h2>

        {etat === 'recu' ? (
          <div className="scan-mobile__recu" role="status">
            <p className="scan-mobile__coche" aria-hidden="true">✓</p>
            <p><strong>C’est arrivé !</strong> {prof} a reçu ta photo.</p>

            <div className="scan-mobile__actions">
              <button type="button" className="btn btn--compact" onClick={nouveauQr}>
                Scanner une autre page
              </button>
              <button type="button" className="btn btn--compact btn--fantome" onClick={onFermer}>
                Fermer
              </button>
            </div>
          </div>
        ) : etat === 'expire' ? (
          <div className="scan-mobile__recu">
            <p>Ce QR code a expiré.</p>
            <button type="button" className="btn btn--compact" onClick={nouveauQr}>
              Nouveau QR code
            </button>
          </div>
        ) : etat === 'erreur' ? (
          <div className="scan-mobile__recu">
            <p className="alert">{erreur}</p>
            <button type="button" className="btn btn--compact" onClick={nouveauQr}>
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <div className="scan-mobile__qr">
              {qr ? (
                <img src={qr} alt="QR code à viser avec ton téléphone" />
              ) : (
                <span className="scan-mobile__chargement">Création du QR code…</span>
              )}
            </div>

            <ol className="scan-mobile__etapes">
              <li>Ouvre l’appareil photo de ton téléphone.</li>
              <li>Vise ce QR code, puis touche le lien qui apparaît.</li>
              <li>Prends ta copie en photo et envoie-la à {prof}.</li>
            </ol>

            {MODE_DEV && (
              <p className="scan-mobile__dev">
                Mode développement : ton téléphone doit être sur le même Wi-Fi que cet ordinateur.
              </p>
            )}

            {expireLe && etat === 'attente' && (
              <p className="scan-mobile__attente">
                <span className="scan-mobile__pulsation" aria-hidden="true" />
                J’attends ta photo… (encore {tempsRestant(expireLe)})
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
