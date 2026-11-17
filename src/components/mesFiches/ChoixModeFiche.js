import { useEffect, useRef } from 'react';
import bandeCours from '../../assets/podcasts-choix/bande-cours.webp';
import bandeLibre from '../../assets/podcasts-choix/bande-libre.webp';
import bandeLivre from '../../assets/podcasts-choix/bande-livre.webp';
import microTitre from '../../assets/podcasts-choix/micro-titre.webp';
import carteCours from '../../assets/fiches-choix/carte-cours.webp';
import carteLibre from '../../assets/fiches-choix/carte-libre.webp';

/** Les deux façons de créer une fiche. */
export const MODE_COURS = 'cours';
export const MODE_LIBRE = 'libre';
/** Le résumé d'un livre (podcasts seulement, 15/11/2026). */
export const MODE_LIVRE = 'livre';

/**
 * LA FENÊTRE DE CHOIX — Camara, le 06/11/2026 : « quand l'enfant crée une
 * nouvelle fiche, une fenêtre avec deux choix : À partir d'un cours, Libre ».
 *
 * « Libre » ne change qu'une chose : à la place d'importer son cours, l'enfant
 * ÉCRIT ou DICTE ce qu'il veut réviser (sa leçon, ses notes, ou juste le sujet).
 * Matière et type de fiche se choisissent pareil.
 *
 * Fermer sans choisir ramène là d'où il vient (`onFermer`) : la page n'a rien à
 * montrer tant qu'il n'a pas dit comment il veut faire.
 */
export default function ChoixModeFiche({ estParent, onChoisir, onFermer, module = 'fiches' }) {
  const premier = useRef(null);

  useEffect(() => {
    premier.current?.focus();
    const auClavier = (e) => { if (e.key === 'Escape') onFermer(); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onFermer]);

  // LA FENÊTRE DES PODCASTS, D'APRÈS LA MAQUETTE DE CAMARA (15/11/2026) : « pour le podcast je veux exactement ce
  // visuel ». Les trois illustrations sont découpées dans sa maquette (assets/podcasts-choix) ; le cadre, les
  // pastilles, les panneaux et les textes sont du vrai code. Celle des fiches ne change pas.
  if (module === 'podcasts') {
    const cartes = [
      {
        mode: MODE_COURS, cle: 'cours', bande: bandeCours, nom: 'À partir d’un cours',
        texte: estParent ? 'Importez un document : photos ou PDF.' : 'Tu importes ton cours : une photo, un scan ou un PDF.',
      },
      {
        mode: MODE_LIBRE, cle: 'libre', bande: bandeLibre, nom: 'Libre',
        texte: estParent
          ? 'Écrivez ou dictez au micro ce que vous voulez réviser.'
          : 'Tu écris ou tu dictes au micro ce que tu veux réviser : ta leçon, tes notes, ou juste le sujet.',
      },
      {
        mode: MODE_LIVRE, cle: 'livre', bande: bandeLivre, nom: 'À partir d’un livre',
        texte: estParent
          ? 'Écrivez ou dictez le titre d’un livre : le professeur vous le résume, partie par partie.'
          : 'Tu écris ou tu dictes le titre d’un livre : ton professeur te le résume, partie par partie.',
      },
    ];

    return (
      <div className="mf-apercu mf-mode pod-mode" role="presentation" onClick={onFermer}>
        <div
          className="mf-apercu__fenetre pod-mode__fenetre"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mf-mode-titre"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pod-mode__tete">
            <h2 id="mf-mode-titre" className="pod-mode__titre">
              <img className="pod-mode__micro" src={microTitre} alt="" />
              {estParent ? 'Comment voulez-vous créer votre podcast ?' : 'Comment veux-tu créer ton podcast ?'}
            </h2>
            <button type="button" className="pod-mode__fermer" aria-label="Fermer" onClick={onFermer}>×</button>
          </div>

          <div className="pod-mode__choix">
            {cartes.map((c, i) => (
              <button
                key={c.cle}
                ref={i === 0 ? premier : undefined}
                type="button"
                className={`pod-mode__carte pod-mode__carte--${c.cle}`}
                onClick={() => onChoisir(c.mode)}
              >
                <span className="pod-mode__nom">{c.nom}</span>
                <img className="pod-mode__visuel" src={c.bande} alt="" />
                <span className="pod-mode__bas">
                  <span className="pod-mode__texte">{c.texte}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // LA FENÊTRE DES FICHES, D'APRÈS LA MAQUETTE DE CAMARA (15/11/2026) : « je veux ça pour le choix des fiches de
  // révision ». Chaque carte est l'illustration de la maquette, ruban et texte EFFACÉS (assets/fiches-choix) ; le
  // ruban et le texte sont redessinés ici, en vrai texte (le parent a ses phrases à lui).
  return (
    <div className="mf-apercu mf-mode fch-mode" role="presentation" onClick={onFermer}>
      <div
        className="mf-apercu__fenetre fch-mode__fenetre"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mf-mode-titre"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="fch-mode__tete">
          <h2 id="mf-mode-titre" className="fch-mode__titre">
            {estParent ? 'Comment voulez-vous créer votre fiche ?' : 'Comment veux-tu créer ta fiche ?'}
          </h2>
          <button type="button" className="fch-mode__fermer" aria-label="Fermer" onClick={onFermer}>×</button>
        </div>

        <div className="fch-mode__choix">
          <button
            ref={premier}
            type="button"
            className="fch-mode__carte fch-mode__carte--cours"
            style={{ backgroundImage: `url(${carteCours})` }}
            onClick={() => onChoisir(MODE_COURS)}
          >
            <span className="fch-mode__ruban">À partir d’un cours</span>
            <span className="fch-mode__texte">
              {estParent
                ? 'Importez un document : photos ou PDF.'
                : 'Tu importes ton cours : une photo, un scan ou un PDF.'}
            </span>
          </button>

          <button
            type="button"
            className="fch-mode__carte fch-mode__carte--libre"
            style={{ backgroundImage: `url(${carteLibre})` }}
            onClick={() => onChoisir(MODE_LIBRE)}
          >
            <span className="fch-mode__ruban">
              <span className="fch-mode__etoile" aria-hidden="true">✦</span>
              Libre
              <span className="fch-mode__etoile" aria-hidden="true">✦</span>
            </span>
            <span className="fch-mode__texte">
              {estParent
                ? 'Écrivez ou dictez au micro ce que vous voulez réviser.'
                : 'Tu écris ou tu dictes au micro ce que tu veux réviser : ta leçon, tes notes, ou juste le sujet.'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
