import { useId, useState } from 'react';
import TexteFiche from './TexteFiche';
import { texteNu } from '../../lib/mesFiches/texteFiche';

/**
 * LES BRIQUES D'UNE FICHE. Le modèle ne dessine rien : il remplit des
 * briques, et c'est l'application qui les met en page — même allure d'une
 * fiche à l'autre, aux couleurs de Mimia, et une impression propre.
 *
 * Sept briques suffisent aux six types : paragraphe et titre, tableau,
 * liste, étapes, encadré, questions — plus l'arbre et la carte, qui ont
 * leurs propres fichiers.
 */

/**
 * « Exemple ajouté » : le cours de l'enfant n'en donnait pas, la fiche en a
 * mis un. Discret, mais visible — l'enfant doit savoir ce qui vient de son
 * professeur et ce qui n'en vient pas.
 */
export function Ajoute() {
  return (
    <span className="fdr-ajoute" title="Cet exemple n’était pas dans ton cours : il a été ajouté pour t’aider.">
      exemple ajouté
    </span>
  );
}

const texteCellule = (cellule) => (typeof cellule === 'string' ? cellule : cellule?.texte ?? '');

/**
 * Un tableau. Sur téléphone, trois colonnes ne se lisent pas : chaque ligne
 * devient une carte, la première cellule pour titre, les autres précédées du
 * nom de leur colonne (`data-colonne`, lu par la feuille de style).
 */
export function Tableau({ bloc }) {
  const colonnes = bloc.colonnes ?? [];

  return (
    <section className="fdr-bloc">
      {bloc.titre && <h3 className="fdr-bloc__titre"><TexteFiche texte={bloc.titre} /></h3>}
      <table className="fdr-tableau">
        {colonnes.length > 0 && (
          <thead>
            <tr>{colonnes.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
        )}
        <tbody>
          {(bloc.lignes ?? []).map((ligne) => (
            <tr key={ligne.map(texteCellule).join('|')}>
              {ligne.map((cellule, rang) => {
                const Balise = rang === 0 ? 'th' : 'td';
                return (
                  <Balise
                    key={colonnes[rang] ?? rang}
                    scope={rang === 0 ? 'row' : undefined}
                    data-colonne={colonnes[rang] ?? ''}
                  >
                    <TexteFiche texte={texteCellule(cellule)} />
                    {typeof cellule === 'object' && cellule?.ajoute && <Ajoute />}
                  </Balise>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/**
 * Une liste. En « coches », chaque ligne se coche — c'est la liste « à savoir
 * par cœur » de la fiche de contrôle : l'enfant la parcourt en se testant.
 * Les coches ne sont pas gardées : elles servent le temps d'une révision.
 */
export function Liste({ bloc }) {
  const elements = bloc.elements ?? [];

  return (
    <section className="fdr-bloc">
      {bloc.titre && <h3 className="fdr-bloc__titre"><TexteFiche texte={bloc.titre} /></h3>}
      {bloc.style === 'coches' ? (
        <ul className="fdr-coches">
          {elements.map((e) => (
            <li key={e}>
              <label>
                <input type="checkbox" />
                <span><TexteFiche texte={e} /></span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="fdr-puces">
          {elements.map((e) => <li key={e}><TexteFiche texte={e} /></li>)}
        </ul>
      )}
    </section>
  );
}

/** Des étapes numérotées : la méthode, dans l'ordre où on la suit. */
export function Etapes({ bloc }) {
  return (
    <section className="fdr-bloc">
      {bloc.titre && <h3 className="fdr-bloc__titre"><TexteFiche texte={bloc.titre} /></h3>}
      <ol className="fdr-etapes">
        {(bloc.etapes ?? []).map((etape) => (
          <li key={etape.titre} className="fdr-etape">
            <strong className="fdr-etape__titre"><TexteFiche texte={etape.titre} /></strong>
            {etape.texte && <p className="fdr-etape__texte"><TexteFiche texte={etape.texte} /></p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

const TONS = {
  cle: 'À retenir',
  piege: 'Attention, piège',
  astuce: 'Astuce',
  souvent: 'Ce qui tombe souvent',
  modele: 'Phrase modèle',
  definition: 'Définition',
  exemple: 'Exemple rédigé',
};

/** Un encadré : une définition, un piège, une phrase modèle… Le ton donne la couleur. */
export function Encadre({ bloc }) {
  const ton = TONS[bloc.ton] ? bloc.ton : 'cle';

  return (
    <aside className={`fdr-encadre fdr-encadre--${ton}`}>
      <p className="fdr-encadre__titre">{bloc.titre ?? TONS[ton]}</p>
      {bloc.texte && <p className="fdr-encadre__texte"><TexteFiche texte={bloc.texte} /></p>}
      {bloc.elements?.length > 0 && (
        <ul className="fdr-puces">
          {bloc.elements.map((e) => <li key={e}><TexteFiche texte={e} /></li>)}
        </ul>
      )}
    </aside>
  );
}

/**
 * LES QUESTIONS À RETOURNER — « pour mémoriser activement » : la réponse est
 * cachée, l'enfant essaie, puis la découvre. Relire une réponse qu'on a sous
 * les yeux ne fait rien retenir ; la chercher, si.
 *
 * « Tout afficher » pour relire d'une traite. À l'impression, tout apparaît
 * (la feuille de style s'en charge) : une fiche papier ne se retourne pas.
 */
export function Questions({ bloc }) {
  const base = useId();
  const questions = bloc.questions ?? [];
  const [vues, setVues] = useState(() => new Set());

  const toutes = questions.length > 0 && vues.size === questions.length;

  const basculer = (rang) => setVues((avant) => {
    const apres = new Set(avant);
    if (apres.has(rang)) apres.delete(rang); else apres.add(rang);
    return apres;
  });

  return (
    <section className="fdr-bloc">
      <div className="fdr-questions__tete">
        {bloc.titre && <h3 className="fdr-bloc__titre"><TexteFiche texte={bloc.titre} /></h3>}
        <span className="fdr-questions__compte fdr-sans-impression" aria-live="polite">
          {vues.size} / {questions.length} découverte{vues.size > 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className="fdr-questions__tout fdr-sans-impression"
          onClick={() => setVues(toutes ? new Set() : new Set(questions.map((_, i) => i)))}
        >
          {toutes ? 'Tout cacher' : 'Tout afficher'}
        </button>
      </div>

      <ol className="fdr-questions">
        {questions.map((q, rang) => {
          const ouverte = vues.has(rang);
          const idReponse = `${base}-r${rang}`;

          return (
            <li key={q.question} className={`fdr-question${ouverte ? ' est-ouverte' : ''}`}>
              <button
                type="button"
                className="fdr-question__bouton"
                aria-expanded={ouverte}
                aria-controls={idReponse}
                aria-label={`${texteNu(q.question)} — ${ouverte ? 'cacher' : 'voir'} la réponse`}
                onClick={() => basculer(rang)}
              >
                <span className="fdr-question__numero" aria-hidden="true">{rang + 1}</span>
                <span className="fdr-question__texte"><TexteFiche texte={q.question} /></span>
                <span className="fdr-question__indice fdr-sans-impression" aria-hidden="true">
                  {ouverte ? 'Cacher' : 'Voir la réponse'}
                </span>
              </button>

              <div id={idReponse} className="fdr-question__reponse" hidden={!ouverte}>
                <p><TexteFiche texte={q.reponse} /></p>
                {q.exemple && (
                  <p className="fdr-question__exemple">
                    <TexteFiche texte={q.exemple} />
                    {q.ajoute && <Ajoute />}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function Paragraphe({ bloc }) {
  return <p className="fdr-paragraphe"><TexteFiche texte={bloc.texte} /></p>;
}

export function Intertitre({ bloc }) {
  return <h3 className="fdr-intertitre"><TexteFiche texte={bloc.texte} /></h3>;
}
