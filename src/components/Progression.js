import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProgression } from '../lib/api/elevesApi';

/**
 * LA CARTE DES COMPÉTENCES, POUR L'ENFANT.
 *
 * UNE TRACE, PAS UN CHEMIN IMPOSÉ
 * -------------------------------
 * Le professeur laisse l'élève choisir son sujet — c'est une règle écrite en
 * majuscules dans son prompt. Une carte qui verrouillerait les notions
 * suivantes la contredirait. Celle-ci montre ce qui est acquis DERRIÈRE lui :
 * la progression se lit, elle ne pousse pas.
 *
 * TROIS ÉTATS, PAS UN POURCENTAGE PAR NOTION
 * ------------------------------------------
 * Un score de 0,73 ne veut rien dire à un enfant de huit ans, et l'afficher
 * transformerait une carte en bulletin. Acquise, en cours, à découvrir : trois
 * états qui se lisent d'un coup d'œil.
 *
 * LE MOMENT DE LA VICTOIRE
 * ------------------------
 * La maîtrise est recalculée par un observateur qui tourne APRÈS la séance :
 * on ne peut donc rien célébrer pendant le cours. La récompense attend le
 * retour de l'enfant — et le serveur ne la sert qu'UNE fois, en avançant sa
 * date de dernière visite. La visite du parent ne la consomme pas.
 *
 * `parcours` ET NON `carte` COMME NOM DE BLOC
 * -------------------------------------------
 * `.carte` ET `.progression` existent déjà dans la feuille de style, la
 * première comme une carte HORIZONTALE (`display: flex; align-items: center`).
 * La première version en héritait : toutes les matières se sont rangées côte à
 * côte en colonnes illisibles, et six classes entraient en collision — dont
 * `carte__corps` et `carte__meta`. Un nom de bloc se vérifie avant d'être
 * choisi.
 */
/**
 * L'état, écrit en toutes lettres.
 *
 * UNE PASTILLE DE COULEUR NE SE DEVINE PAS. Elle distingue bien les états d'un
 * coup d'œil, mais elle ne dit pas lequel est lequel : un enfant qui ouvre sa
 * carte pour la première fois n'a aucune légende. Et une information portée par
 * la seule couleur est perdue pour un enfant daltonien — un garçon sur douze.
 *
 * Le mot porte donc le sens, la couleur ne fait que le renforcer.
 *
 * « À revoir » plutôt que « fragile » : on décrit ce qu'il y a à faire, pas ce
 * qui ne va pas. C'est la même règle que le professeur s'impose à l'oral.
 */
const LIBELLE_ETAT = {
  acquise: 'Acquise',
  'en-cours': 'En cours',
  fragile: 'À revoir',
  'a-decouvrir': 'À découvrir',
};

export default function Progression() {
  const { eleveId } = useParams();
  const navigate = useNavigate();

  const [progression, setProgression] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // La fanfare est-elle passée ? Elle ne se rejoue pas quand l'enfant replie
  // une matière : c'est un moment, pas un décor.
  const [fanfareVue, setFanfareVue] = useState(false);

  useEffect(() => {
    let vivant = true;

    getProgression(eleveId)
      .then(({ data }) => { if (vivant) setProgression(data); })
      .catch(() => { if (vivant) setErreur("Ta carte n'a pas pu être chargée."); })
      .finally(() => { if (vivant) setChargement(false); });

    return () => { vivant = false; };
  }, [eleveId]);

  if (chargement) return <p className="etat-vide">Chargement…</p>;

  if (erreur || !progression) {
    return (
      <section className="page">
        <div className="alert">{erreur ?? 'Rien à afficher pour le moment.'}</div>
      </section>
    );
  }

  const {
    acquises, total, nouvelles, matieres, niveau,
    acquisesAutresAnnees = 0,
    premiereVisite = false,
  } = progression;

  // LES NOTIONS DES AUTRES ANNÉES, toutes matières confondues, regroupées par
  // niveau plutôt que par matière : ce qui compte ici n'est pas « en quoi »
  // mais « de quand » — c'est ce qui rend la section cohérente avec son titre.
  const rattrapage = matieres.flatMap((m) => m.competences.filter((c) => c.autreNiveau));

  const niveauxRattrapes = [...new Map(
    rattrapage.map((c) => [c.niveauOrdre, { ordre: c.niveauOrdre, libelle: c.niveau }]),
  ).values()]
    .sort((a, b) => b.ordre - a.ordre)
    .map((n) => ({
      ...n,
      notions: rattrapage
        .filter((c) => c.niveauOrdre === n.ordre)
        .sort((a, b) => (a.matiere ?? '').localeCompare(b.matiere ?? '')),
    }));

  // `Math.round` et non un décimal : « 6 % » se retient, « 5,8 % » se subit.
  const pourcent = total > 0 ? Math.round((acquises / total) * 100) : 0;

  // UNE CARTE VIDE N'EST PAS UNE PANNE.
  //
  // Six niveaux du référentiel n'ont aucune compétence — 3e prépa-métiers,
  // les voies professionnelles et technologiques du lycée. Un enfant inscrit
  // dans l'un d'eux ne doit pas lire un message d'erreur : il doit comprendre
  // qu'il n'y a rien À VOIR, pas que quelque chose est cassé.
  if (total === 0) {
    return (
      <section className="page parcours">
        <button
          type="button"
          className="btn-ghost parcours__retour"
          onClick={() => navigate(-1)}
        >
          ← Retour
        </button>

        <div className="parcours__score">
          <strong>🗺️</strong>
          <span>Ta carte se remplira bientôt</span>
          <small>
            Les notions de ton niveau ne sont pas encore répertoriées. Travaille
            avec tes professeurs comme d’habitude : ta progression est bien
            enregistrée, elle s’affichera ici dès que possible.
          </small>
        </div>
      </section>
    );
  }

  return (
    <section className="page parcours">
      <button
        type="button"
        className="btn-ghost parcours__retour"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>

      {/* LE CHIFFRE D'ABORD, ET EN GRAND. C'est ce que l'enfant vient
          chercher : combien j'en ai. Le détail par matière vient après. */}
      <div className="parcours__score">
        <strong>{acquises}</strong>

        <span>
          notion{acquises > 1 ? 's' : ''} maîtrisée{acquises > 1 ? 's' : ''}
          {niveau ? ` — programme de ${niveau}` : ''}
        </span>

        <div className="parcours__jauge" aria-hidden="true">
          <span style={{ width: `${pourcent}%` }} />
        </div>

        <small>{pourcent} % du chemin</small>
      </div>

      {/* LA VICTOIRE, UNE SEULE FOIS. Le serveur ne la sert qu'au premier
          affichage : elle a déjà été consommée quand cet écran se dessine, et
          recharger ne la fera pas revenir. */}
      {nouvelles.length > 0 && !fanfareVue && (
        <div className="parcours__fanfare" role="status">
          <span className="parcours__fanfare-icone" aria-hidden="true">🎉</span>

          <div className="parcours__fanfare-texte">
            {/* DEUX NOUVELLES DIFFÉRENTES, DEUX PHRASES.
                À la première ouverture, la carte montre TOUT ce que l'enfant a
                déjà acquis — c'est voulu, on ne l'accueille pas par un écran
                vide après des mois de travail. Mais il n'a rien maîtrisé
                aujourd'hui : lui annoncer « 120 nouvelles notions » serait faux
                sur le mot le plus important de la phrase. */}
            <strong>
              {premiereVisite ? (
                <>
                  Voici tout ce que tu as déjà maîtrisé — {nouvelles.length} notion
                  {nouvelles.length > 1 ? 's' : ''}
                </>
              ) : (
                <>
                  Bravo ! Tu as maîtrisé {nouvelles.length} nouvelle
                  {nouvelles.length > 1 ? 's' : ''} notion{nouvelles.length > 1 ? 's' : ''}
                </>
              )}
            </strong>

            <ul>
              {nouvelles.slice(0, 5).map((c) => (
                <li key={c.id}>{c.libelle}</li>
              ))}
            </ul>

            {/* Au-delà de cinq, on compte plutôt que d'énumérer : une liste de
                vingt lignes cesse d'être une récompense. */}
            {nouvelles.length > 5 && <p>… et {nouvelles.length - 5} autres.</p>}
          </div>

          <button
            type="button"
            className="parcours__fanfare-fermer"
            onClick={() => setFanfareVue(true)}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {/* REPLIÉES PAR DÉFAUT, SAUF CELLES OÙ IL A DÉJÀ GAGNÉ.
          Un collégien a plus de cent notions : dépliées, elles font un mur où
          l'on ne trouve rien. Ouvrir celles qui portent un acquis met ses
          réussites sous les yeux et laisse le reste au repos. */}
      {matieres.map((m) => {
        const part = m.total > 0 ? Math.round((m.acquises / m.total) * 100) : 0;

        // SON ANNÉE ICI, LE RATTRAPAGE PLUS BAS.
        //
        // Une carte titrée « programme de 3e » qui listait des notions de CM1
        // ne voulait rien dire : le compteur mélangeait deux choses. Les
        // notions des années précédentes ne disparaissent pas pour autant —
        // elles ont leur propre section, avec leur propre compte.
        const deSonAnnee = m.competences.filter((c) => !c.autreNiveau);

        return (
          <details key={m.matiereId} className="parcours__matiere" open={m.acquises > 0}>
            <summary>
              <span
                className="parcours__pastille"
                aria-hidden="true"
                style={m.couleur ? { background: m.couleur } : undefined}
              />

              <strong>{m.libelle}</strong>

              <span className="parcours__compte">{m.acquises} / {m.total}</span>

              <span className="parcours__mini" aria-hidden="true">
                <span style={{ width: `${part}%`, background: m.couleur || undefined }} />
              </span>
            </summary>

            {/* GROUPÉES PAR DOMAINE : « Nombres et calculs », « Grandeurs et
                mesures ». Quarante lignes en vrac ne racontent rien ; par
                domaine, l'enfant voit dans quoi il est fort. */}
            {[...new Set(deSonAnnee.map((c) => c.domaine))].map((domaine) => (
              <div key={domaine ?? 'sans'} className="parcours__domaine">
                {domaine && <span className="parcours__domaine-nom">{domaine}</span>}

                <ul className="parcours__notions">
                  {deSonAnnee
                    .filter((c) => c.domaine === domaine)
                    .map((c) => (
                      <li key={c.id} className={`parcours__notion est-${c.etat}`}>
                        <span className="parcours__puce" aria-hidden="true" />
                        <span className="parcours__libelle">{c.libelle}</span>
                        <span className="parcours__etat">{LIBELLE_ETAT[c.etat]}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </details>
        );
      })}

      {/* ------------------------------------ les années précédentes

          SÉPARÉES, ET NON MÉLANGÉES AU PROGRAMME DE L'ANNÉE.
          Une carte titrée « programme de 3e » qui listait des notions de CM1
          était incohérente : le compteur additionnait deux choses différentes.

          MAIS PAS SUPPRIMÉES POUR AUTANT. La méthode du produit est de
          chercher où ça bloque, donc en amont : un élève de 3e progresse
          d'abord sur des notions de 6e. Les masquer afficherait zéro à celui
          qui a le plus besoin d'être encouragé — c'est exactement le cas ici,
          où les sept notions acquises sont toutes de 6e et de 5e. */}
      {rattrapage.length > 0 && (
        <section className="parcours__avant">
          <h2 className="parcours__avant-titre">
            Tu as aussi consolidé {acquisesAutresAnnees} notion
            {acquisesAutresAnnees > 1 ? 's' : ''} des années précédentes
          </h2>

          {/* De la plus récente à la plus ancienne : ce qu'il vient de
              rattraper l'intéresse plus que son CE2. */}
          {niveauxRattrapes.map((niveau) => (
            <details key={niveau.ordre} className="parcours__matiere">
              <summary>
                <span className="parcours__pastille" aria-hidden="true" />
                <strong>{niveau.libelle}</strong>
                <span className="parcours__compte">
                  {niveau.notions.filter((c) => c.etat === 'acquise').length} / {niveau.notions.length}
                </span>
              </summary>

              <div className="parcours__domaine">
                <ul className="parcours__notions">
                  {niveau.notions.map((c) => (
                    <li key={c.id} className={`parcours__notion est-${c.etat}`}>
                      <span className="parcours__puce" aria-hidden="true" />
                      <span className="parcours__libelle">{c.libelle}</span>
                      <span className="parcours__etat">{LIBELLE_ETAT[c.etat]}</span>
                      <span className="parcours__niveau">{c.matiere}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </section>
      )}

      <p className="parcours__note">
        {/* CE QUI RASSURE PLUS QUE ÇA N'INFORME. Un enfant qui voit des lignes
            grises doit savoir qu'elles ne sont pas des échecs.
            La phrase disait « les notions grises, tu ne les as pas encore
            travaillées » — vrai pour son programme, FAUX pour la section du
            dessous, où tout a été travaillé au moins une fois. */}
        Les notions grises de ton programme, tu ne les as pas encore
        travaillées : il n’y a rien à rattraper, elles t’attendent. Celles en
        orange, tu les as déjà vues et elles ne tiennent pas encore.
      </p>
    </section>
  );
}
