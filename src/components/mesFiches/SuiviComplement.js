import { useEffect, useRef, useState } from 'react';
import { cheminFiches } from '../../lib/mesFiches/espaceFiches';
import { Link } from 'react-router-dom';

const EN_PREPARATION = ['a_lire', 'a_generer'];

/**
 * LE COMPLÉMENT, SUIVI AU MILIEU DE L'ÉCRAN — Camara, le 16/10/2026 : « je
 * veux une popup visuelle au centre au lieu d'être en bas de la page ; je me
 * suis demandé ce qu'il se passait, c'est en défilant que j'ai compris ».
 *
 * Elle s'ouvre d'elle-même quand le complément est lu ou rédigé, dit où il en
 * est, puis annonce les fiches prêtes (ou ce qui a raté). « Continuer à
 * réviser » la réduit en une pastille, en bas, qui la rouvre.
 *
 * `complement` : { id, etat, remarque } tel que le cours le rend ; null quand
 * il n'y en a plus en route.
 */
export default function SuiviComplement({ eleveId, complement }) {
  const etat = complement?.etat ?? null;
  const [vue, setVue] = useState(null); // null | 'ouverte' | 'reduite'
  const [fin, setFin] = useState(null); // null | 'pret' | 'echec'
  const avant = useRef(etat);
  const bouton = useRef(null);

  useEffect(() => {
    const precedent = avant.current;
    avant.current = etat;

    if (EN_PREPARATION.includes(etat) || etat === 'notions') {
      setFin(null);
      setVue((v) => v ?? 'ouverte');
      return;
    }

    // Il était en route et ne l'est plus : prêt (il a quitté la liste) ou raté.
    if (EN_PREPARATION.includes(precedent) || precedent === 'notions') {
      setFin(etat === 'echec' ? 'echec' : 'pret');
      setVue('ouverte');
    }
  }, [etat]);

  useEffect(() => { if (vue === 'ouverte') bouton.current?.focus(); }, [vue, fin]);

  useEffect(() => {
    if (vue !== 'ouverte') return undefined;
    const auClavier = (e) => { if (e.key === 'Escape') setVue(fin ? null : 'reduite'); };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [vue, fin]);

  if (!vue) return null;

  if (vue === 'reduite') {
    return (
      <button type="button" className="mf-suivi-pastille" onClick={() => setVue('ouverte')}>
        <span className="mf-etat__roue" aria-hidden="true" />
        Tes nouvelles fiches se préparent…
      </button>
    );
  }

  const fermer = () => { setVue(null); setFin(null); };

  let contenu;
  if (fin === 'pret') {
    contenu = (
      <>
        <span className="mf-suivi__coche" aria-hidden="true">✓</span>
        <h2 id="mf-suivi-titre" className="mf-suivi__titre">Tes nouvelles fiches sont prêtes !</h2>
        <p className="mf-suivi__texte">Elles sont rangées à la suite de ton cours, dans le sommaire.</p>
        <button ref={bouton} type="button" className="btn" onClick={fermer}>Voir mes fiches</button>
      </>
    );
  } else if (fin === 'echec') {
    contenu = (
      <>
        <span className="mf-suivi__coche est-echec" aria-hidden="true">!</span>
        <h2 id="mf-suivi-titre" className="mf-suivi__titre">Ton complément n’a pas pu être créé</h2>
        <p className="mf-suivi__texte">{complement?.remarque ?? 'Réessaie dans un moment.'}</p>
        <button ref={bouton} type="button" className="btn" onClick={fermer}>Compris</button>
      </>
    );
  } else if (etat === 'notions') {
    contenu = (
      <>
        <span className="mf-suivi__coche" aria-hidden="true">?</span>
        <h2 id="mf-suivi-titre" className="mf-suivi__titre">J’ai lu la suite de ton cours</h2>
        <p className="mf-suivi__texte">Choisis les notions à ajouter à ton cours.</p>
        <Link ref={bouton} to={`${cheminFiches(eleveId)}/cours/${complement.id}`} className="btn">Choisir mes notions</Link>
      </>
    );
  } else {
    contenu = (
      <>
        <span className="mf-suivi__roue" aria-hidden="true" />
        <h2 id="mf-suivi-titre" className="mf-suivi__titre">
          {etat === 'a_lire' ? 'Je lis la suite de ton cours…' : 'Tes nouvelles fiches sont en préparation…'}
        </h2>
        <p className="mf-suivi__texte" role="status">
          {etat === 'a_lire'
            ? 'Je repère les notions qu’elle contient. Ça prend quelques secondes.'
            : 'Elles s’ajoutent à ton cours une à une. Tu peux continuer à réviser pendant ce temps.'}
        </p>
        <button ref={bouton} type="button" className="btn btn--fantome" onClick={() => setVue('reduite')}>
          Continuer à réviser
        </button>
      </>
    );
  }

  return (
    <div className="mf-suivi" role="presentation">
      <div className="mf-suivi__fenetre" role="dialog" aria-modal="true" aria-labelledby="mf-suivi-titre">
        {contenu}
      </div>
    </div>
  );
}
