import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * LE BILAN HEBDOMADAIRE, LU SUR LE SITE — Camara, le 17/10/2026 : « au-dessus de
 * Dernier cours, un bouton Voir le bilan hebdomadaire ».
 *
 * Le bilan arrive en HTML, tel que le courriel : il est posé dans un cadre
 * isolé (`sandbox` sans scripts), qui garde ses propres styles sans toucher à
 * ceux de la page. Ses liens s'ouvrent dans un nouvel onglet.
 *
 * Le premier affichage d'une semaine peut prendre quelques secondes, quand le
 * professeur n'a pas encore écrit le texte ; les suivants sont immédiats.
 *
 * Se ferme par Échap, par la croix, ou par un clic sur le voile.
 *
 * TÉLÉCHARGER EN PDF (17/10/2026) : un vrai fichier, sur téléphone comme sur
 * ordinateur — la fenêtre d'impression d'un cadre intégré est capricieuse sur
 * iPhone. La bibliothèque (html2pdf.js, ~400 Ko) ne se charge qu'au clic.
 */

/** « bilan-bilal-2026-10-17.pdf » : sans accents ni espaces, daté du jour. */
export function nomDuPdf(prenom, aujourdhui = new Date()) {
  const propre = (prenom ?? 'enfant')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'enfant';
  return `bilan-${propre}-${aujourdhui.toISOString().slice(0, 10)}.pdf`;
}

export default function FenetreBilan({ prenom, charger, onFermer }) {
  const idTitre = useId();
  const [etat, setEtat] = useState({ html: null, erreur: null });
  const [pdf, setPdf] = useState('pret');

  // Le bilan est mis en page en styles en ligne : son corps suffit, posé sur
  // le fond crème du courriel. La capture prend la largeur d'une page A4 ; la
  // carte s'y centre d'elle-même (une largeur fixe laissait une bande blanche).
  const telecharger = async () => {
    if (!etat.html || pdf === 'encours') return;
    setPdf('encours');
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const corps = etat.html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? etat.html;
      const page = document.createElement('div');
      page.style.cssText = 'padding:16px 0;background:#f4efe6;';
      page.innerHTML = corps;
      // Les ombres sont mal dessinées par la capture : la carte s'en passe sur papier.
      page.querySelectorAll('[style*="box-shadow"]').forEach((el) => { el.style.boxShadow = 'none'; });
      await html2pdf().set({
        margin: [6, 6, 6, 6],
        filename: nomDuPdf(prenom),
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: '#f4efe6' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] },
      }).from(page).save();
      setPdf('pret');
    } catch {
      setPdf('echec');
    }
  };

  useEffect(() => {
    let vivant = true;
    charger()
      .then(({ data }) => { if (vivant) setEtat({ html: data, erreur: null }); })
      .catch((e) => {
        if (!vivant) return;
        setEtat({
          html: null,
          erreur: e?.response?.status === 404
            ? 'Pas encore de bilan : le premier arrive lundi, après une semaine de cours.'
            : 'Le bilan n’a pas pu être chargé. Réessayez dans un instant.',
        });
      });
    return () => { vivant = false; };
  }, [charger]);

  useEffect(() => {
    const surTouche = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', surTouche);
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = debordement;
    };
  }, [onFermer]);

  return createPortal(
    <div className="modale bilan-hebdo" onMouseDown={(e) => { if (e.target === e.currentTarget) onFermer(); }}>
      <div className="modale__boite bilan-hebdo__boite" role="dialog" aria-modal="true" aria-labelledby={idTitre}>
        <header className="bilan-hebdo__tete">
          <h2 id={idTitre}>Le bilan de la semaine de {prenom}</h2>
          {etat.html && (
            <button type="button" className="bilan-hebdo__pdf" onClick={telecharger} disabled={pdf === 'encours'}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
              </svg>
              {pdf === 'encours' ? 'Préparation…' : pdf === 'echec' ? 'Réessayer' : 'Télécharger en PDF'}
            </button>
          )}
          <button type="button" className="bilan-hebdo__fermer" aria-label="Fermer" onClick={onFermer}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="bilan-hebdo__corps">
          {etat.erreur && <p className="bilan-hebdo__message" role="alert">{etat.erreur}</p>}
          {!etat.erreur && etat.html === null && (
            <p className="bilan-hebdo__message" role="status">Le professeur prépare le bilan…</p>
          )}
          {etat.html && (
            <iframe
              className="bilan-hebdo__cadre"
              title={`Bilan de la semaine de ${prenom}`}
              srcDoc={etat.html.replace('<head>', '<head><base target="_blank">')}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
