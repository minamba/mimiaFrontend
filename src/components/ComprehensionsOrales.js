import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { chargerReferentiel } from '../lib/actions/referentielActions';
import { chargerEleves } from '../lib/actions/elevesActions';
import {
  getComprehensionsOrales, getComprehensionOrale, marquerComprehensionOraleVue,
} from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import Avatar from './Avatar';
import ComprehensionOraleDetail from './ComprehensionOraleDetail';
import Loader from './Loader';

/**
 * Les compréhensions orales archivées d'un élève dans une matière — vues par
 * l'ÉLÈVE. Même construction que `Dictees.js` : l'enfant est le premier
 * concerné, c'est à lui que sert de retrouver le passage à réécouter.
 */

/**
 * Le texte d'un passage, reduit a sa substance : minuscules, sans accents,
 * sans ponctuation. Sert a reconnaitre qu'un extrait relu appartient a une
 * histoire deja ecoutee.
 */
const cle = (texte) =>
  (texte ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\u0300-\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Le titre a afficher pour un exercice.
 *
 * Quand personne ne l'a nomme, le titre est le DEBUT du passage lu — les
 * premiers mots de l'histoire. Sans rien pour le signaler, on croit lire un
 * titre complet alors que la phrase continue dans l'audio. Les points de
 * suspension le disent.
 *
 * Un vrai titre ecrit par le professeur, lui, n'y touche pas : on ne le
 * reconnait pas comme un debut du passage.
 */
const titreAffiche = (exercice, defaut) => {
  const titre = (exercice.titre ?? '').trim();
  if (!titre) return defaut;

  const passage = (exercice.passage ?? '').trim();

  const estUnDebut =
    passage.length > titre.length
    && passage.toLowerCase().startsWith(titre.toLowerCase());

  if (!estUnDebut || titre.endsWith('…')) return titre;

  return `${titre}…`;
};

/**
 * Regroupe les exercices d'une seance par HISTOIRE.
 *
 * Le professeur lit un texte, puis en repasse une phrase pour aider l'eleve a
 * retrouver un detail : ce second audio est un extrait du premier. Il garde sa
 * fiche et son enregistrement — l'eleve doit pouvoir le reecouter seul — mais
 * il s'affiche SOUS l'histoire dont il est tire, pas a cote d'elle.
 */
const enFamilles = (exercices) => {
  const parLongueur = [...exercices].sort(
    (a, b) => (b.passage?.length ?? 0) - (a.passage?.length ?? 0),
  );

  const familles = [];

  parLongueur.forEach((exercice) => {
    const sien = cle(exercice.passage);

    const parent = familles.find(
      (f) => sien && cle(f.principal.passage).includes(sien),
    );

    if (parent) parent.extraits.push(exercice);
    else familles.push({ principal: exercice, extraits: [] });
  });

  // On rend l'ordre chronologique : l'histoire telle qu'elle a ete ecoutee.
  return familles
    .map((f) => ({
      ...f,
      extraits: [...f.extraits].sort(
        (a, b) => new Date(a.dateCreation) - new Date(b.dateCreation),
      ),
    }))
    // Du plus recent au plus ancien : ce qu'on vient de faire est ce qu'on
    // revient chercher.
    .sort((a, b) => new Date(b.principal.dateCreation) - new Date(a.principal.dateCreation));
};

/** L'heure de l'exercice — c'est elle qui donne l'ordre du cours. */
const heure = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

const date = (valeur) =>
  valeur
    ? new Date(valeur).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    : '';

export default function ComprehensionsOrales() {
  const { eleveId, matiereId } = useParams();
  const dispatch = useDispatch();

  const { matieres } = useSelector((state) => state.referentiel);
  const { liste } = useSelector((state) => state.eleves);

  const [comprehensionsOrales, setComprehensionsOrales] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La fiche ouverte. `ouverture` porte l'identifiant plutôt qu'un booléen :
  // c'est ce qui permet de n'afficher « Ouverture… » que sur la carte cliquée.
  const [fiche, setFiche] = useState(null);
  const [ouverture, setOuverture] = useState(null);

  // Les séances dépliées, par identifiant de conversation. La plus récente
  // s'ouvre d'elle-même : c'est presque toujours celle qu'on vient chercher.
  const [depliees, setDepliees] = useState(() => new Set());

  // Les histoires dont on a deplie les extraits relus.
  const [extraitsOuverts, setExtraitsOuverts] = useState(() => new Set());

  const eleve = liste.find((e) => String(e.id) === String(eleveId));
  const matiere = matieres.find((m) => String(m.id) === String(matiereId));

  useEffect(() => {
    if (matieres.length === 0) dispatch(chargerReferentiel());
    if (liste.length === 0) dispatch(chargerEleves());
  }, [dispatch, matieres.length, liste.length]);

  useEffect(() => {
    let vivant = true;

    getComprehensionsOrales(eleveId, matiereId)
      .then(({ data }) => {
        if (vivant) setComprehensionsOrales(data ?? []);
      })
      .catch(() => {
        if (vivant) setErreur("Tes compréhensions orales n'ont pas pu être chargées.");
      })
      .finally(() => {
        if (vivant) setChargement(false);
      });

    return () => { vivant = false; };
  }, [eleveId, matiereId]);

  /**
   * Les exercices regroupés par SÉANCE, la plus récente en tête.
   *
   * Six écoutes faites dans deux cours différents s'affichaient à plat, sans
   * qu'on sache laquelle allait avec quel cours — et toutes portaient le même
   * nom. On regroupe donc par conversation : une ligne par cours, dépliable.
   */
  const seances = useMemo(() => {
    const parSeance = new Map();

    [...comprehensionsOrales]
      .sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation))
      .forEach((co) => {
        const cle = co.conversationId ?? 0;
        if (!parSeance.has(cle)) parSeance.set(cle, { cle, exercices: [] });
        parSeance.get(cle).exercices.push(co);
      });

    return [...parSeance.values()]
      .map((seance) => ({
        ...seance,
        // La date de la séance est celle de son PREMIER exercice : c'est
        // l'heure où l'enfant s'est mis au travail.
        date: seance.exercices[0].dateCreation,
        familles: enFamilles(seance.exercices),
        nouveautes: seance.exercices.filter((e) => e.jamaisLue).length,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [comprehensionsOrales]);

  // La séance la plus récente s'ouvre seule, une fois la liste chargée.
  useEffect(() => {
    if (seances.length === 0) return;
    setDepliees((actuel) => (actuel.size > 0 ? actuel : new Set([seances[0].cle])));
  }, [seances]);

  const basculerExtraits = (id) => {
    setExtraitsOuverts((actuel) => {
      const suivant = new Set(actuel);
      if (suivant.has(id)) suivant.delete(id); else suivant.add(id);
      return suivant;
    });
  };

  const basculer = (cleSeance) => {
    setDepliees((actuel) => {
      const suivant = new Set(actuel);
      if (suivant.has(cleSeance)) suivant.delete(cleSeance); else suivant.add(cleSeance);
      return suivant;
    });
  };

  const voirLaFiche = async (comprehensionOraleId) => {
    setOuverture(comprehensionOraleId);
    setErreur(null);

    try {
      const { data } = await getComprehensionOrale(eleveId, comprehensionOraleId);
      setFiche(data);
      // La pastille « à consulter » s'éteint dès l'ouverture — l'échec ne
      // doit rien changer à l'affichage de la fiche, d'où le catch muet.
      marquerComprehensionOraleVue(eleveId, comprehensionOraleId).catch(() => {});

      // ET ON L ETEINT TOUT DE SUITE A L ECRAN.
      //
      // Le serveur savait la fiche lue, la liste affichee ne le savait pas :
      // le compteur « 1 a consulter » restait allume jusqu au prochain F5,
      // sur une fiche qu on venait d ouvrir sous ses yeux.
      setComprehensionsOrales((actuelles) => actuelles.map(
        (c) => (c.id === comprehensionOraleId ? { ...c, jamaisLue: false } : c),
      ));
    } catch {
      setErreur("La compréhension orale n'a pas pu être ouverte.");
    } finally {
      setOuverture(null);
    }
  };

  const teinte = matiere?.profCouleur || 'var(--accent)';

  return (
    <section
      className="page page--large"
      style={{ '--teinte': teinte, ...styleMatiere(matiere) }}
    >
      <Link to={`/eleves/${eleveId}/matieres`} className="lien-retour">
        <span aria-hidden="true">←</span> Mes matières
      </Link>

      <header className="fiches-entete">
        {matiere && (
          <span className="fiches-entete__avatar">
            <Avatar nom={matiere.profAvatar} couleur={matiere.profCouleur} taille={56} />
          </span>
        )}

        <div className="fiches-entete__texte">
          {matiere?.libelle && (
            <p className="fiches-entete__sur-titre">{matiere.libelle}</p>
          )}

          <h1>Mes compréhensions orales</h1>

          <p className="fiches-entete__ligne">
            {[
              matiere?.profPrenom && `Avec ${matiere.profPrenom}`,
              eleve && `pour ${eleve.prenom}`,
            ]
              .filter(Boolean)
              .join(' ')}
          </p>
        </div>
      </header>

      {/* CE QUE VEULENT DIRE LES PASTILLES.
          Le point orange et le bouton des réécoutes se ressemblaient assez
          pour qu'on les confonde, et rien ne disait lequel voulait dire quoi. */}
      {seances.length > 0 && (
        <ul className="co-legende">
          <li className="co-legende__item">
            <span className="co-legende__pastille" aria-hidden="true" />
            Pas encore écouté
          </li>

          <li className="co-legende__item">
            <span className="co-legende__bouton" aria-hidden="true">↺ 2</span>
            Réécoute d'un passage pour obtenir des précisions
          </li>

        </ul>
      )}

      {chargement && <Loader texte="Chargement de tes compréhensions orales…" />}
      {erreur && <div className="alert">{erreur}</div>}

      {!chargement && !erreur && seances.length === 0 && (
        <div className="fiches-vide">
          <p className="fiches-vide__titre">Pas encore de compréhension orale ici.</p>
          <p>
            {matiere?.profPrenom ?? 'Ton professeur'} archivera ici chaque exercice
            d'écoute, avec le passage à réécouter et ce que tu en as compris.
          </p>
        </div>
      )}

      {seances.length > 0 && (
        <ul className="co-seances">
          {seances.map((seance) => {
            const ouverte = depliees.has(seance.cle);

            return (
              <li key={seance.cle} className="co-seance">
                <button
                  type="button"
                  className={`co-seance__entete ${ouverte ? 'co-seance__entete--ouverte' : ''}`}
                  onClick={() => basculer(seance.cle)}
                  aria-expanded={ouverte}
                >
                  <span className="co-seance__chevron" aria-hidden="true">›</span>

                  <span className="co-seance__titre">
                    <strong>Cours du {date(seance.date)}</strong>
                    <span className="co-seance__compte">
                      {seance.exercices.length} exercice{seance.exercices.length > 1 ? 's' : ''}
                      {seance.nouveautes > 0 && ` · ${seance.nouveautes} à consulter`}
                    </span>
                  </span>

                  {seance.nouveautes > 0 && <span className="co-seance__pastille" aria-hidden="true" />}
                </button>

                {ouverte && (
                  <ul className="co-exercices">
                    {seance.familles.map(({ principal, extraits }) => {
                      const extraitsVisibles = extraitsOuverts.has(principal.id);

                      return (
                        <li key={principal.id}>
                          <div className="co-exercice-ligne">
                            <button
                              type="button"
                              className="co-exercice"
                              onClick={() => voirLaFiche(principal.id)}
                              disabled={ouverture === principal.id}
                            >
                              <span className="co-exercice__icone" aria-hidden="true">🎧</span>

                              <span className="co-exercice__corps">
                                <strong className="co-exercice__titre">
                                  {titreAffiche(principal, 'Compréhension orale')}
                                </strong>
                                <span className="co-exercice__heure">
                                  {heure(principal.dateCreation)}
                                </span>
                                {principal.jamaisLue && (
                                  <span className="co-exercice__neuf">Nouveau</span>
                                )}
                              </span>

                              <span className="co-exercice__lire">
                                {ouverture === principal.id ? 'Ouverture…' : 'Écouter'}
                                {' '}
                                <span aria-hidden="true">→</span>
                              </span>
                            </button>

                            {/* LES REECOUTES CIBLEES SE RANGENT SOUS LEUR HISTOIRE.
                                Le professeur repasse une phrase pour aider a retrouver
                                un detail : c est un audio a part, mais du MEME exercice. */}
                            {extraits.length > 0 && (
                              <button
                                type="button"
                                className={`co-extraits__bascule ${extraitsVisibles ? 'co-extraits__bascule--ouverte' : ''} ${extraits.some((e) => e.jamaisLue) ? 'co-extraits__bascule--neuf' : ''}`}
                                onClick={() => basculerExtraits(principal.id)}
                                aria-expanded={extraitsVisibles}
                                aria-label={`${extraits.length} réécoute${extraits.length > 1 ? 's' : ''} de ce passage`}
                              >
                                <span className="co-extraits__compte">{extraits.length}</span>
                                <span className="co-extraits__chevron" aria-hidden="true">⌄</span>
                              </button>
                            )}
                          </div>

                          {extraits.length > 0 && extraitsVisibles && (
                            <ul className="co-extraits">
                              {extraits.map((extrait) => (
                                <li key={extrait.id}>
                                  <button
                                    type="button"
                                    className="co-exercice co-exercice--extrait"
                                    onClick={() => voirLaFiche(extrait.id)}
                                    disabled={ouverture === extrait.id}
                                  >
                                    <span className="co-exercice__icone" aria-hidden="true">↺</span>

                                    <span className="co-exercice__corps">
                                      <strong className="co-exercice__titre">
                                        {titreAffiche(extrait, 'Passage réécouté')}
                                      </strong>
                                      <span className="co-exercice__heure">
                                        {heure(extrait.dateCreation)}
                                      </span>
                                      <span className="co-exercice__note">réécoute</span>
                                      {extrait.jamaisLue && (
                                        <span className="co-exercice__neuf">Nouveau</span>
                                      )}
                                    </span>

                                    <span className="co-exercice__lire">
                                      {ouverture === extrait.id ? 'Ouverture…' : 'Écouter'}
                                      {' '}
                                      <span aria-hidden="true">→</span>
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {fiche && (
        <ComprehensionOraleDetail
          eleveId={eleveId}
          fiche={fiche}
          onFermer={() => setFiche(null)}
        />
      )}
    </section>
  );
}
