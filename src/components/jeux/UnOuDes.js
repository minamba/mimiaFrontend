import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  bilan, ESSAIS_AVANT_AIDE, etiquette, MANCHES, nom, PHRASES, serie, verdict,
} from '../../lib/jeux/unOuDes';
import { commun, repliquesUnOuDes } from '../../lib/jeux/voix/repliques';
import useVoixJeu from '../../lib/jeux/voix/useVoixJeu';
import BoutonsVoix from './BoutonsVoix';
import AccordsCE2 from './AccordsCE2';
import decor from '../../assets/Jeux/CP/uneoudes.webp';
import AccordsCM1 from './AccordsCM1';
import FinDePartie from './FinDePartie';
import Coeurs from './Coeurs';

/**
 * UN OU DES ?, À L'ÉCRAN.
 *
 * Toute la règle vit dans `unOuDes.js`, y compris pourquoi Adrien ne dit
 * jamais l'étiquette.
 *
 * DEUX RANGÉES DE CHOIX, UNE PAR CASE DE L'ÉTIQUETTE : le petit mot, puis le
 * nom. Toucher un choix le pose dans sa case ; en toucher un autre le
 * remplace. L'enfant annonce quand les deux cases sont remplies — la leçon
 * des paquets de dix.
 *
 * LE S DU PLURIEL EST MIS EN VALEUR sur l'étiquette juste : c'est la lettre
 * que le jeu apprend à écrire, et la seule qu'on ne peut pas entendre.
 *
 * LE DÉCOR EST UNE SALLE DE JEUX : l'ardoise et l'étiquette se posent sur le
 * mur clair du milieu.
 */
/** Au CE2, le féminin et le pluriel des groupes — voir `AccordsCE2.js`. */
function UnOuDesAvantCM1({ niveau, ...props }) {
  return niveau === 'CE2' ? <AccordsCE2 {...props} /> : <UnOuDesCP {...props} />;
}

function UnOuDesCP({ onQuitter, matiereCode }) {
  const [graine, setGraine] = useState(() => Date.now());
  const manches = useMemo(() => serie(graine), [graine]);

  const [manche, setManche] = useState(0);
  const [petitMot, setPetitMot] = useState(null);
  const [forme, setForme] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [ratees, setRatees] = useState(0);
  const [propre, setPropre] = useState(true);
  const [duPremierCoup, setDuPremierCoup] = useState(0);
  const [fini, setFini] = useState(false);
  // Les formes du nom que l'enfant a écoutées dans cette manche, et si Adrien
  // a déjà fait remarquer que « c'est pareil » dans cette partie.
  const [entendus, setEntendus] = useState([]);
  const [pareilDit, setPareilDit] = useState(false);

  const courante = manches[manche];
  const leNom = nom(courante.nom);
  const juste = resultat?.sens === 'juste';
  const montrer = !juste && ratees >= ESSAIS_AVANT_AIDE;
  const termine = juste || montrer;

  const voix = useVoixJeu(matiereCode);
  const { dire } = voix;
  const laConsigne = repliquesUnOuDes.consigne;

  useEffect(() => {
    if (!fini && manche === 0) dire(laConsigne);
  }, [fini, manche, graine, dire, laConsigne]);

  useEffect(() => {
    if (fini) dire(commun.note(duPremierCoup, MANCHES));
  }, [fini, duPremierCoup, dire]);

  const poserPetitMot = useCallback((m) => {
    if (termine) return;
    setResultat(null);
    setPetitMot(m);
  }, [termine]);

  const poserForme = useCallback((f) => {
    if (termine) return;
    setResultat(null);
    setForme(f);
  }, [termine]);

  /**
   * ÉCOUTER UNE ÉTIQUETTE, SANS LA CHOISIR. Quand l'enfant a écouté les deux
   * formes du nom — « fleur », puis « fleurs » —, Adrien ajoute que c'est
   * pareil : une fois par partie. Voir la note de `unOuDes.js`.
   */
  const ecouter = useCallback((etiquetteChoisie, estNom) => {
    const mot = repliquesUnOuDes.mot(etiquetteChoisie);
    if (!estNom) {
      dire(mot);
      return;
    }
    const suivants = entendus.includes(etiquetteChoisie) ? entendus : [...entendus, etiquetteChoisie];
    setEntendus(suivants);
    const lesDeux = courante.formes.every((f) => suivants.includes(f));
    if (lesDeux && !pareilDit) {
      setPareilDit(true);
      dire([mot, repliquesUnOuDes.pareil]);
    } else {
      dire(mot);
    }
  }, [entendus, courante, pareilDit, dire]);

  const annoncer = useCallback(() => {
    const r = verdict(petitMot, forme, courante);
    if (r.sens === 'juste') {
      dire(commun.bravo(manche));
    } else {
      const suivantes = ratees + 1;
      setPropre(false);
      setRatees(suivantes);
      if (suivantes >= ESSAIS_AVANT_AIDE) dire(repliquesUnOuDes.aide);
      else if (r.sens === 'nombre') dire(repliquesUnOuDes.nombre(r.pluriel));
      else dire(repliquesUnOuDes.accord(r.pluriel));
    }
    setResultat(r);
  }, [petitMot, forme, courante, manche, ratees, dire]);

  const suivante = useCallback(() => {
    if (propre && juste) setDuPremierCoup((n) => n + 1);

    if (manche + 1 >= MANCHES) {
      setFini(true);
      return;
    }

    setManche(manche + 1);
    setPetitMot(null);
    setForme(null);
    setResultat(null);
    setRatees(0);
    setPropre(true);
    setEntendus([]);
  }, [manche, propre, juste]);

  const rejouer = useCallback(() => {
    setGraine(Date.now());
    setManche(0);
    setPetitMot(null);
    setForme(null);
    setResultat(null);
    setRatees(0);
    setPropre(true);
    setDuPremierCoup(0);
    setFini(false);
    setEntendus([]);
    setPareilDit(false);
  }, []);

  if (fini) {
    return (
      <FinDePartie
        score={duPremierCoup}
        total={MANCHES}
        mot={bilan(duPremierCoup)}
        onRejouer={rejouer}
        onQuitter={onQuitter}
      />
    );
  }

  let message = null;
  if (resultat && !termine) {
    if (resultat.sens === 'nombre') message = resultat.pluriel ? PHRASES.nombreDes : PHRASES.nombreUn;
    else message = resultat.pluriel ? PHRASES.accordDes : PHRASES.accordUn;
  }

  // Ce que porte l'étiquette : le choix de l'enfant, ou la bonne réponse.
  const [motAffiche, formeAffichee] = montrer
    ? etiquette(courante).split(' ')
    : [petitMot, forme];
  const pluriel = courante.combien > 1;
  const faute = resultat && !termine ? resultat.sens : null;

  return (
    <div className="jeu jeu--unoudes" style={{ backgroundImage: `url(${decor})` }}>
      <Coeurs manche={manche} duPremierCoup={duPremierCoup} />
      <ol className="jeu__manches" aria-label={`Manche ${manche + 1} sur ${MANCHES}`}>
        {manches.map((m, i) => (
          <li
            key={`${m.nom}-${i}`}
            className={`jeu__manche${i < manche ? ' est-faite' : ''}${i === manche ? ' est-courante' : ''}`}
          />
        ))}
      </ol>

      <p className="jeu__consigne">
        {PHRASES.consigne}
        <BoutonsVoix voix={voix} consigne={laConsigne} />
      </p>

      {/* L'IMAGE : un objet, ou plusieurs — c'est elle qui décide. */}
      <div
        className={`unoudes__image${pluriel ? ' est-pluriel' : ''}`}
        role="img"
        // Le nombre d'objets, sans l'étiquette : la lire donnerait la réponse.
        aria-label={`${courante.combien} fois l’image : ${leNom.nom}`}
      >
        {Array.from({ length: courante.combien }, (_, i) => (
          // Des copies du même objet : la place est la seule identité.
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} aria-hidden="true">{leNom.image}</span>
        ))}
      </div>

      {/* L'ÉTIQUETTE À ÉCRIRE : deux cases. */}
      <p className={`unoudes__etiquette${juste || montrer ? ' est-juste' : ''}`} aria-label="L’étiquette">
        <span className={`unoudes__case${motAffiche ? ' est-pleine' : ''}${faute === 'nombre' ? ' est-fautive' : ''}`}>
          {motAffiche ?? '…'}
        </span>
        <span className={`unoudes__case unoudes__case--nom${formeAffichee ? ' est-pleine' : ''}${faute === 'accord' ? ' est-fautive' : ''}`}>
          {formeAffichee && (juste || montrer) && pluriel
            ? <>{leNom.nom}<strong className="unoudes__s">s</strong></>
            : (formeAffichee ?? '…')}
        </span>
      </p>

      {!termine && (
        <div className="unoudes__choix">
          <ul className="unoudes__rangee" aria-label="Le petit mot">
            {courante.petitsMots.map((m) => (
              <li key={m} className="unoudes__place">
                <button
                  type="button"
                  className={`unoudes__tuile${petitMot === m ? ' est-choisie' : ''}`}
                  onClick={() => poserPetitMot(m)}
                  aria-pressed={petitMot === m}
                >
                  {m}
                </button>
                <BoutonEcouter mot={m} onEcouter={() => ecouter(m, false)} />
              </li>
            ))}
          </ul>
          <ul className="unoudes__rangee" aria-label="Le nom">
            {courante.formes.map((f) => (
              <li key={f} className="unoudes__place">
                <button
                  type="button"
                  className={`unoudes__tuile${forme === f ? ' est-choisie' : ''}`}
                  onClick={() => poserForme(f)}
                  aria-pressed={forme === f}
                >
                  {f}
                </button>
                <BoutonEcouter mot={f} onEcouter={() => ecouter(f, true)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && <p className="jeu__trop" role="status">{message}</p>}

      {montrer && (
        <div className="jeu__gagne" role="status">
          <p className="unoudes__aide">{PHRASES.aide}</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {juste && (
        <div className="jeu__gagne" role="status">
          <p className="jeu__gagne-calcul">Bien écrit&nbsp;!</p>
          <button type="button" className="btn btn--principal" onClick={suivante}>
            Continuer
          </button>
        </div>
      )}

      {!termine && petitMot && forme && !resultat && (
        <button type="button" className="btn btn--principal" onClick={annoncer}>
          C’est prêt&nbsp;!
        </button>
      )}

      <button type="button" className="jeu__quitter" onClick={onQuitter}>
        ← Revenir aux jeux
      </button>
    </div>
  );
}

/**
 * Le haut-parleur d'une étiquette : il la fait dire, il ne la choisit pas.
 * C'est un bouton à part, pour qu'écouter ne soit jamais répondre.
 */
function BoutonEcouter({ mot, onEcouter }) {
  return (
    <button type="button" className="unoudes__ecouter" onClick={onEcouter} aria-label={`Écouter « ${mot} »`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" />
      </svg>
    </button>
  );
}

/** Au CM1 et au CM2, l'écran du cycle 3 — voir `AccordsCM1.js` ; il lit la classe. */
export default function UnOuDes({ niveau, ...props }) {
  return niveau === 'CM1' || niveau === 'CM2' ? <AccordsCM1 niveau={niveau} {...props} /> : <UnOuDesAvantCM1 niveau={niveau} {...props} />;
}
