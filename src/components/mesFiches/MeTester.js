import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TexteFiche from './TexteFiche';
import useAmbiance, { adresseAmbiance } from '../../lib/jeux/ambiance';
import { bruitage as bruitageDesJeux, prechargerBruitages } from '../../lib/jeux/bruitages';
import imageFlash from '../../assets/me-tester/flash.webp';
import imageQuiz from '../../assets/me-tester/quiz.webp';
import imageTranquille from '../../assets/me-tester/tranquille.webp';
import imageChallenge from '../../assets/me-tester/challenge.webp';
import imageCerveau from '../../assets/me-tester/cerveau.webp';
import './meTester.css';

/**
 * LES BRUITAGES DE « ME TESTER » : ceux des jeux, mais la bonne et la mauvaise
 * réponse plus bas (Camara, le 16/10/2026 : « baisse un peu le son des bonnes
 * et mauvaises réponses ») — 0,3 au lieu de 0,5.
 */
const VOLUME_REPONSE = 0.3;
const bruitage = (nom) => bruitageDesJeux(nom, nom === 'bonne' || nom === 'mauvaise' ? VOLUME_REPONSE : null);

/** Le temps d'une carte ou d'une question, en mode challenge. */
const SECONDES_CARTE = 10;
const SECONDES_QUESTION = 20;
/** Une séance ne dépasse pas ce nombre de questions : on rejoue pour la suite. */
const PAR_SEANCE = 20;

const melanger = (liste) => {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
};

const mouvementReduit = () => typeof window !== 'undefined'
  && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

/**
 * LE CHRONO DU MODE CHALLENGE : une barre qui se vide, et les secondes.
 * `cle` relance le décompte (une nouvelle carte, une nouvelle question).
 */
function useChrono(duree, actif, cle, onFin) {
  const [reste, setReste] = useState(duree);
  const debut = useRef(0);
  const finRef = useRef(onFin);
  finRef.current = onFin;

  useEffect(() => {
    setReste(duree);
    if (!actif) return undefined;
    debut.current = Date.now();
    const minuteur = setInterval(() => {
      const restant = Math.max(0, duree - (Date.now() - debut.current) / 1000);
      setReste(restant);
      if (restant <= 0) {
        clearInterval(minuteur);
        finRef.current?.();
      }
    }, 100);
    return () => clearInterval(minuteur);
  }, [duree, actif, cle]);

  return reste;
}

function Chrono({ reste, duree }) {
  const part = Math.max(0, Math.min(1, reste / duree));
  return (
    <div className={`mt-chrono${part < 0.3 ? ' est-presse' : ''}`} role="timer" aria-label={`${Math.ceil(reste)} secondes`}>
      <span className="mt-chrono__barre" style={{ transform: `scaleX(${part})` }} />
      <span className="mt-chrono__secondes">{Math.ceil(reste)} s</span>
    </div>
  );
}

function Progression({ index, total }) {
  return (
    <div className="mt-progression" aria-hidden="true">
      <span style={{ width: `${(index / total) * 100}%` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ cartes */

/**
 * LES FLASH CARDS — Camara, le 16/10/2026 : « très belles, bien animées ».
 * Une pile de cartes ; la carte du dessus se retourne en 3D (clic, Espace ou
 * Entrée), puis l'enfant dit s'il savait : elle s'envole à droite (« je
 * savais ») ou à gauche (« à revoir »), et la suivante monte de la pile.
 * En challenge, dix secondes pour répondre dans sa tête avant que la carte
 * ne se retourne seule — elle compte alors « à revoir ».
 */
function FlashCards({ questions, challenge, onFin }) {
  const [index, setIndex] = useState(0);
  const [retournee, setRetournee] = useState(false);
  const [envol, setEnvol] = useState(null); // null | 'gauche' | 'droite'
  const [resultats, setResultats] = useState([]);
  const [tropTard, setTropTard] = useState(false);
  const [points, setPoints] = useState(0);
  const resteAuRetour = useRef(0);

  const carte = questions[index];
  const derniere = index === questions.length - 1;

  const reste = useChrono(SECONDES_CARTE, challenge && !retournee && !envol, index, () => {
    bruitage('mauvaise');
    bruitage('retourneCarte');
    setTropTard(true);
    resteAuRetour.current = 0;
    setRetournee(true);
  });

  const retourner = useCallback(() => {
    if (retournee || envol) return;
    resteAuRetour.current = reste;
    // Camara, le 16/10/2026 : return_card.mp3 quand la carte se retourne,
    // card_swipe.mp3 quand elle part pour laisser place à la suivante.
    bruitage('retourneCarte');
    setRetournee(true);
  }, [retournee, envol, reste]);

  const juger = useCallback((savait) => {
    if (!retournee || envol) return;
    const juste = savait && !tropTard;
    bruitage(juste ? 'bonne' : 'mauvaise');
    bruitage('glisseCarte');
    const gain = challenge && juste ? 100 + Math.round(resteAuRetour.current * 10) : 0;
    const suivants = [...resultats, { ...carte, juste }];
    setEnvol(savait ? 'droite' : 'gauche');
    setTimeout(() => {
      setResultats(suivants);
      setPoints((p) => p + gain);
      if (derniere) {
        onFin(suivants, points + gain);
        return;
      }
      setIndex((i) => i + 1);
      setRetournee(false);
      setTropTard(false);
      setEnvol(null);
    }, mouvementReduit() ? 0 : 380);
  }, [retournee, envol, tropTard, challenge, resultats, carte, derniere, onFin, points]);

  useEffect(() => {
    const auClavier = (e) => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!retournee) retourner(); }
      else if (e.key === 'ArrowRight') juger(true);
      else if (e.key === 'ArrowLeft') juger(false);
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [retourner, juger, retournee]);

  return (
    <div className="mt-jeu">
      <div className="mt-jeu__haut">
        <span className="mt-jeu__compte">Carte {index + 1} / {questions.length}</span>
        {challenge && <span className="mt-jeu__points">{points} pts</span>}
      </div>
      <Progression index={index} total={questions.length} />
      {challenge && <Chrono reste={retournee ? resteAuRetour.current : reste} duree={SECONDES_CARTE} />}

      <div className="mt-pile">
        {questions.length - index > 2 && <span className="mt-pile__fantome mt-pile__fantome--2" aria-hidden="true" />}
        {questions.length - index > 1 && <span className="mt-pile__fantome mt-pile__fantome--1" aria-hidden="true" />}

        <button
          key={index}
          type="button"
          className={`mt-carte${retournee ? ' est-retournee' : ''}${envol ? ` s-envole-${envol}` : ''}`}
          onClick={retourner}
          onPointerEnter={(e) => { if (!retournee && e.pointerType === 'mouse') bruitage('survol'); }}
          aria-label={retournee ? 'Carte retournée' : 'Retourner la carte'}
        >
          <span className="mt-carte__interieur">
            <span className="mt-carte__face mt-carte__face--avant">
              <span className="mt-carte__etiquette">Question{carte.fiche ? ` · ${carte.fiche}` : ''}</span>
              <span className="mt-carte__texte"><TexteFiche texte={carte.question} /></span>
              <span className="mt-carte__aide">Touche la carte pour voir la réponse</span>
            </span>
            <span className="mt-carte__face mt-carte__face--arriere" aria-live="polite">
              <span className="mt-carte__etiquette">{tropTard ? '⏱ Temps écoulé — la réponse' : 'Réponse'}</span>
              <span className="mt-carte__texte mt-carte__texte--reponse"><TexteFiche texte={carte.reponse} /></span>
              {carte.explication && (
                <span className="mt-carte__explication"><TexteFiche texte={carte.explication} /></span>
              )}
            </span>
          </span>
        </button>
      </div>

      <div className={`mt-jugement${retournee && !envol ? ' est-visible' : ''}`}>
        <button type="button" className="mt-jugement__bouton mt-jugement__bouton--revoir" disabled={!retournee || Boolean(envol)} onClick={() => juger(false)}>
          <span aria-hidden="true">😕</span> À revoir
        </button>
        <button
          type="button"
          className="mt-jugement__bouton mt-jugement__bouton--savais"
          disabled={!retournee || Boolean(envol) || tropTard}
          onClick={() => juger(true)}
        >
          <span aria-hidden="true">😎</span> Je savais
        </button>
      </div>
      <p className="mt-jeu__clavier" aria-hidden="true">Espace : retourner · ← à revoir · → je savais</p>
    </div>
  );
}

/* ------------------------------------------------------------------ quiz */

/**
 * LE QUIZ : quatre choix, la bonne réponse et trois leurres, mélangés. Juste :
 * le choix « pop » en vert ; faux : il tremble en rouge et la bonne s'allume.
 * L'explication suit. En challenge, vingt secondes par question, des points
 * selon la vitesse, et une série 🔥 à partir de trois justes d'affilée.
 */
function Quiz({ questions, challenge, onFin }) {
  const [index, setIndex] = useState(0);
  const [choix, setChoix] = useState(null); // null | indice choisi | -1 (temps écoulé)
  const [resultats, setResultats] = useState([]);
  const [points, setPoints] = useState(0);
  const [serie, setSerie] = useState(0);
  const [gainVu, setGainVu] = useState(null);

  const q = questions[index];
  const options = useMemo(() => melanger([
    { texte: q.reponse, juste: true },
    ...(q.leurres ?? []).map((texte) => ({ texte, juste: false })),
  ]), [q]);

  const repondu = choix !== null;
  const juste = repondu && choix >= 0 && options[choix]?.juste;

  const reste = useChrono(SECONDES_QUESTION, challenge && !repondu, index, () => {
    bruitage('mauvaise');
    setChoix(-1);
    setSerie(0);
    setResultats((r) => [...r, { ...q, juste: false }]);
  });

  const choisir = useCallback((i) => {
    if (repondu) return;
    const bon = options[i].juste;
    bruitage(bon ? 'bonne' : 'mauvaise');
    setChoix(i);
    setResultats((r) => [...r, { ...q, juste: bon }]);
    if (!bon) { setSerie(0); return; }
    const nouvelleSerie = serie + 1;
    setSerie(nouvelleSerie);
    if (challenge) {
      const gain = 100 + Math.round(reste * 5) + (nouvelleSerie >= 3 ? 50 : 0);
      setPoints((p) => p + gain);
      setGainVu(gain);
    }
  }, [repondu, options, q, serie, challenge, reste]);

  const suivante = useCallback(() => {
    if (!repondu) return;
    if (index === questions.length - 1) {
      onFin(resultats, points);
      return;
    }
    setIndex((i) => i + 1);
    setChoix(null);
    setGainVu(null);
  }, [repondu, index, questions.length, onFin, resultats, points]);

  useEffect(() => {
    const auClavier = (e) => {
      const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      if (n >= 0 && n < options.length) choisir(n);
      else if (e.key === 'Enter') { e.preventDefault(); suivante(); }
    };
    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [options.length, choisir, suivante]);

  return (
    <div className="mt-jeu">
      <div className="mt-jeu__haut">
        <span className="mt-jeu__compte">Question {index + 1} / {questions.length}</span>
        {serie >= 3 && <span className="mt-jeu__serie" key={serie}>🔥 {serie} d’affilée</span>}
        {challenge && (
          <span className="mt-jeu__points">
            {points} pts
            {gainVu && <span className="mt-jeu__gain" key={`${index}-${gainVu}`}>+{gainVu}</span>}
          </span>
        )}
      </div>
      <Progression index={index} total={questions.length} />
      {challenge && <Chrono reste={repondu ? 0 : reste} duree={SECONDES_QUESTION} />}

      <div className="mt-question" key={index}>
        {q.fiche && <span className="mt-carte__etiquette">{q.fiche}</span>}
        <p className="mt-question__texte"><TexteFiche texte={q.question} /></p>
      </div>

      <ol className="mt-options">
        {options.map((o, i) => {
          let etat = '';
          if (repondu && o.juste) etat = ' est-juste';
          else if (repondu && i === choix) etat = ' est-faux';
          else if (repondu) etat = ' est-eteint';
          return (
            <li key={o.texte}>
              <button
                type="button"
                className={`mt-option${etat}`}
                disabled={repondu}
                onPointerEnter={(e) => { if (!repondu && e.pointerType === 'mouse') bruitage('survol'); }}
                onClick={() => choisir(i)}
              >
                <span className="mt-option__lettre" aria-hidden="true">{'ABCD'[i]}</span>
                <span className="mt-option__texte"><TexteFiche texte={o.texte} /></span>
              </button>
            </li>
          );
        })}
      </ol>

      {repondu && (
        <div className={`mt-verdict${juste ? ' est-juste' : ' est-faux'}`} role="status">
          <strong>{juste ? 'Bravo, c’est juste !' : choix === -1 ? '⏱ Temps écoulé' : 'Pas tout à fait…'}</strong>
          {q.explication && <span><TexteFiche texte={q.explication} /></span>}
          <button type="button" className="btn mt-verdict__suite" onClick={suivante}>
            {index === questions.length - 1 ? 'Voir mon score' : 'Suivante →'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ fin */

function Fin({ resultats, points, challenge, jeu, onRevoir, onRejouer, onChanger, onFermer }) {
  const justes = resultats.filter((r) => r.juste).length;
  const total = resultats.length;
  const part = total ? Math.round((justes / total) * 100) : 0;
  const ratees = resultats.filter((r) => !r.juste);
  const [affiche, setAffiche] = useState(mouvementReduit() ? points : 0);

  // Les points montent jusqu'au score : petit plaisir de fin de partie.
  useEffect(() => {
    if (!challenge || mouvementReduit()) return undefined;
    const debut = Date.now();
    const minuteur = setInterval(() => {
      const t = Math.min(1, (Date.now() - debut) / 900);
      setAffiche(Math.round(points * t));
      if (t >= 1) clearInterval(minuteur);
    }, 30);
    return () => clearInterval(minuteur);
  }, [challenge, points]);

  const message = part === 100 ? 'Parfait, tout est su !'
    : part >= 80 ? 'Excellent, presque tout est su !'
      : part >= 50 ? 'Bien joué, encore un petit effort !'
        : 'C’est en se trompant qu’on apprend. On recommence ?';

  return (
    <div className="mt-fin">
      {part >= 80 && (
        <div className="mt-confettis" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => <span key={i} style={{ '--i': i }} />)}
        </div>
      )}
      <div className="mt-fin__anneau" style={{ '--part': part }}>
        <span>{part} %</span>
      </div>
      <h3 className="mt-fin__titre">{message}</h3>
      <p className="mt-fin__detail">
        {jeu === 'cartes' ? `Tu savais ${justes} carte${justes > 1 ? 's' : ''} sur ${total}.` : `${justes} bonne${justes > 1 ? 's' : ''} réponse${justes > 1 ? 's' : ''} sur ${total}.`}
      </p>
      {challenge && <p className="mt-fin__points">{affiche} points</p>}

      <div className="mt-fin__actions">
        {ratees.length > 0 && (
          <button type="button" className="btn" onClick={() => onRevoir(ratees)}>
            Revoir {ratees.length > 1 ? `les ${ratees.length} à revoir` : 'celle à revoir'}
          </button>
        )}
        <button type="button" className={`btn${ratees.length > 0 ? ' btn--fantome' : ''}`} onClick={onRejouer}>Recommencer</button>
        <button type="button" className="btn btn--fantome" onClick={onChanger}>Changer de jeu</button>
        <button type="button" className="btn btn--fantome" onClick={onFermer}>Fermer</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ ambiance */

/**
 * L'AMBIANCE SONORE — Camara, le 16/10/2026. Une musique PAR JEU : « pour le
 * quiz, un truc qui fasse un peu jeu télé ; pour les flash cards, une ambiance
 * qui fasse détective » (la première version, une ambiance par mode faite de
 * bruits — pièce calme, horloge —, n'a pas plu). Le lecteur des jeux la joue (volume
 * 0,08, boucle sans blanc) ; le bouton 🎵/🔇 garde le choix, comme dans Mes jeux.
 * Elle ne joue que pendant la partie ; sans fichier, pas de bouton.
 */
function AmbianceMeTester({ jeu }) {
  const url = adresseAmbiance(jeu === 'quiz' ? 'me-tester-quiz' : 'me-tester-flash');
  // PLUS DE MUSIQUE (Camara, le 16/10/2026, au soir) : une bibliothèque studieuse
  // pour les flash cards, la nature (ruisseau, brise, oiseaux lointains) pour le
  // quiz. Les musiques avaient été validées à 0,02 après « baisse encore » ; ces
  // bruits sont mélangés plus bas (-19 et -23,5 dB contre -17,5), le volume
  // compense pour qu'ils s'entendent pareil.
  const volume = jeu === 'quiz' ? 0.035 : 0.025;
  const { coupee, basculer, disponible } = useAmbiance(url, { volume });
  if (!disponible) return null;
  return (
    <button
      type="button"
      className={`mt__son${coupee ? ' est-coupee' : ''}`}
      onClick={basculer}
      aria-pressed={!coupee}
      title={coupee ? 'Remettre l’ambiance' : 'Couper l’ambiance'}
    >
      <span aria-hidden="true">{coupee ? '🔇' : '🎵'}</span>
      <span className="visuellement-cache">{coupee ? 'Ambiance coupée' : 'Ambiance'}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ la fenêtre */

/**
 * « ME TESTER » — Camara, le 16/10/2026 : « au clic, on a le choix entre
 * flash cards et quiz ; puis un mode tranquille ou challenge, avec un chrono ».
 *
 * `charger()` rend les questions (écrites une fois par fiche côté serveur,
 * ≈ 1,6 centime) ; `cartesLocales`, quand la fiche est déjà faite de
 * questions et réponses, sert les flash cards sans aucun appel.
 */
export default function MeTester({ titre, charger, cartesLocales = null, onFermer, style = undefined }) {
  const [etape, setEtape] = useState('jeu'); // jeu | mode | chargement | partie | fin
  const [jeu, setJeu] = useState(null); // cartes | quiz
  const [challenge, setChallenge] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [toutes, setToutes] = useState(null);
  const [fin, setFin] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [partie, setPartie] = useState(0);
  const fermer = useRef(null);
  // Le parent rend un nouveau `onFermer` à chaque rendu : on lit toujours le
  // dernier, sans rebrancher le clavier ni redonner le focus à la croix.
  // LES BRUITAGES DES JEUX (Camara, le 16/10/2026) : good/bad sur chaque
  // réponse, passage_sur_carte au survol des cartes de choix et select.mp3 au
  // clic, return.mp3 en
  // fermant ou en changeant de jeu — les sons et volumes de « Mes jeux ».
  const quitter = useRef(() => { bruitage('retour'); onFermer(); });
  quitter.current = () => { bruitage('retour'); onFermer(); };
  useEffect(() => { prechargerBruitages(); }, []);
  const survoler = (e) => { if (e.pointerType === 'mouse') bruitage('survol'); };
  const fermerAvecSon = () => quitter.current();

  useEffect(() => {
    fermer.current?.focus();
    const auClavier = (e) => { if (e.key === 'Escape') quitter.current(); };
    document.addEventListener('keydown', auClavier);
    const debordement = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.body.style.overflow = debordement;
    };
  }, []);

  const lancer = (liste) => {
    setQuestions(melanger(liste).slice(0, PAR_SEANCE));
    setFin(null);
    setPartie((p) => p + 1);
    setEtape('partie');
  };

  const demarrer = async (modeChallenge) => {
    setChallenge(modeChallenge);
    setErreur(null);

    if (jeu === 'cartes' && cartesLocales?.length) {
      lancer(cartesLocales);
      return;
    }
    if (toutes) {
      lancer(toutes);
      return;
    }

    setEtape('chargement');
    try {
      const { data } = await charger();
      const liste = data?.questions ?? [];
      if (liste.length === 0) throw new Error('vide');
      setToutes(liste);
      lancer(liste);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Je n’ai pas réussi à préparer tes questions. Réessaie dans un moment.');
      setEtape('mode');
    }
  };

  const terminer = useCallback((resultats, points) => {
    setFin({ resultats, points });
    setEtape('fin');
  }, []);

  return (
    <div className="mt" role="presentation" style={style} onClick={fermerAvecSon}>
      <div
        className="mt__fenetre"
        role="dialog"
        aria-modal="true"
        aria-label={`Me tester : ${titre}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt__tete">
          <div>
            <p className="mt__surtitre"><img className="mf-cerveau" src={imageCerveau} alt="" /> Me tester</p>
            <p className="mt__titre">{titre}</p>
          </div>
          <div className="mt__boutons">
            {etape === 'partie' && <AmbianceMeTester jeu={jeu} />}
            <button ref={fermer} type="button" className="mt__fermer" aria-label="Fermer" onClick={fermerAvecSon}>×</button>
          </div>
        </div>

        {etape === 'jeu' && (
          <div className="mt-choix">
            <p className="mt-choix__question">Comment veux-tu t’entraîner ?</p>
            {/* LES DEUX JEUX EN IMAGES — Camara, le 16/10/2026 (flash.png et
                quizz.png, réencodés en WebP : 1,8 Mo → 65 Ko). Le texte est dans
                l'image ; le bouton le porte aussi, pour les lecteurs d'écran. */}
            <div className="mt-choix__grille">
              <button
                type="button"
                className="mt-choix__image mt-choix__image--cartes"
                aria-label="Flash cards : une question, tu retournes la carte, tu dis si tu savais."
                onPointerEnter={survoler}
                onClick={() => { bruitage('selection'); setJeu('cartes'); setEtape('mode'); }}
              >
                <img src={imageFlash} alt="" />
                <span className="mt-choix__fleche" aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="mt-choix__image mt-choix__image--quiz"
                aria-label="Quiz : quatre réponses, une seule est la bonne."
                onPointerEnter={survoler}
                onClick={() => { bruitage('selection'); setJeu('quiz'); setEtape('mode'); }}
              >
                <img src={imageQuiz} alt="" />
                <span className="mt-choix__fleche" aria-hidden="true">›</span>
              </button>
            </div>
          </div>
        )}

        {etape === 'mode' && (
          <div className="mt-choix">
            <p className="mt-choix__question">{jeu === 'cartes' ? 'Flash cards' : 'Quiz'} : quel mode ?</p>
            {erreur && <p className="champ__erreur" role="alert">{erreur}</p>}
            <div className="mt-choix__grille">
              {/* LES DEUX MODES EN IMAGES — Camara, le 16/10/2026 (tkl.png et
                  chall.png, réencodés en WebP : 1,6 Mo → 61 et 77 Ko). */}
              <button
                type="button"
                className="mt-choix__image mt-choix__image--mode"
                aria-label="Tranquille : prends ton temps, sans chrono."
                onPointerEnter={survoler}
                onClick={() => { bruitage('selection'); demarrer(false); }}
              >
                <img src={imageTranquille} alt="" />
                <span className="mt-choix__fleche" aria-hidden="true">›</span>
              </button>
              <button
                type="button"
                className="mt-choix__image mt-choix__image--mode"
                aria-label={`Challenge : ${jeu === 'cartes' ? `${SECONDES_CARTE} s par carte` : `${SECONDES_QUESTION} s par question`}, des points et des séries.`}
                onPointerEnter={survoler}
                onClick={() => { bruitage('selection'); demarrer(true); }}
              >
                <img src={imageChallenge} alt="" />
                <span className="mt-choix__fleche" aria-hidden="true">›</span>
              </button>
            </div>
            <button type="button" className="mt-retour" onClick={() => { bruitage('retour'); setEtape('jeu'); }}>← Changer de jeu</button>
          </div>
        )}

        {etape === 'chargement' && (
          <div className="mt-chargement" role="status">
            <span className="mt-chargement__cartes" aria-hidden="true"><span /><span /><span /></span>
            <p><strong>Je prépare tes questions…</strong></p>
            <p className="mt-chargement__aide">Quelques secondes la première fois, puis elles sont gardées.</p>
          </div>
        )}

        {etape === 'partie' && jeu === 'cartes' && (
          <FlashCards key={partie} questions={questions} challenge={challenge} onFin={terminer} />
        )}
        {etape === 'partie' && jeu === 'quiz' && (
          <Quiz key={partie} questions={questions} challenge={challenge} onFin={terminer} />
        )}

        {etape === 'fin' && fin && (
          <Fin
            resultats={fin.resultats}
            points={fin.points}
            challenge={challenge}
            jeu={jeu}
            onRevoir={(ratees) => lancer(ratees)}
            onRejouer={() => lancer(jeu === 'cartes' && cartesLocales?.length ? cartesLocales : toutes)}
            onChanger={() => { bruitage('retour'); setFin(null); setEtape('jeu'); }}
            onFermer={fermerAvecSon}
          />
        )}
      </div>
    </div>
  );
}
