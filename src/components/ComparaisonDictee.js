import { Fragment, useMemo } from 'react';
import { comparerDictee, lireComparaison } from '../lib/storage/diffDictee';

/**
 * UN CÔTÉ DE LA COMPARAISON — le texte dicté ou la copie —, avec ses erreurs
 * surlignées et numérotées. Le même numéro se retrouve au même endroit de
 * l'autre côté : voir `diffDictee.js`.
 *
 * Partagé par le tableau et par « Mes dictées » : un seul rendu, pour que
 * l'enfant retrouve dans son archive exactement ce qu'il a vu en séance.
 */
export function TexteCompare({ segments, cote }) {
  return segments.map((segment, index) => {
    // L'ordre des segments ne change jamais pour un texte donné : l'index
    // suffit comme clé.
    /* eslint-disable react/no-array-index-key */
    if (segment.type === 'manque') {
      return (
        <span
          key={index}
          className={`compare__manque compare__manque--${cote}`}
          title={cote === 'copie'
            ? `Erreur ${segment.erreur} : il manque quelque chose ici`
            : `Erreur ${segment.erreur} : ceci n'était pas dans la dictée`}
        >
          <span className="compare__tirets" aria-hidden="true">-----</span>
          <span className="compare__badge">{segment.erreur}</span>
        </span>
      );
    }

    if (segment.type === 'mot') {
      // LE BADGE SE POSE APRÈS LE SURLIGNÉ, PAS DEDANS. Relevé par Camara le
      // 11/09/2026 : pris dans le trait jaune ou rouge, le chiffre se
      // lisait mal. Sur fond propre, il se voit d'un coup d'œil.
      return (
        <Fragment key={index}>
          <mark
            className={`compare__mot compare__mot--${cote}`}
            title={`Erreur ${segment.erreur}`}
          >
            {segment.texte}
          </mark>
          {segment.badge && <span className="compare__badge">{segment.erreur}</span>}
        </Fragment>
      );
    }

    return <Fragment key={index}>{segment.texte}</Fragment>;
    /* eslint-enable react/no-array-index-key */
  });
}

/**
 * Une dictée archivée, écrite comme le professeur l'écrit au tableau : le
 * titre et la date en tête, puis « La dictée » et « Ta copie ». C'est ce
 * que le tableau affiche quand le professeur la remet au tableau par son
 * numéro — voir `dicteeAuTableau`.
 */
export function tableauDeDictee(dictee) {
  const date = dictee?.dateCreation
    ? new Date(dictee.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const entete = [dictee?.titre, date && `dictée du ${date}`].filter(Boolean).join(' — ');

  return `${entete}\n\nLa dictée\n${dictee?.texteDicte ?? ''}\n\nTa copie\n${dictee?.copie ?? ''}`;
}

/** Une correction a-t-elle des trous — un mot oublié, un mot en trop ? */
export const aDesTrous = (comparee) => [...comparee.dicte, ...comparee.copie]
  .some((segment) => segment.type === 'manque');

/**
 * COMMENT LIRE TES ERREURS — voulu par Camara le 11/09/2026 : un enfant qui
 * voit des couleurs et des chiffres sur sa copie doit comprendre, sans
 * qu'on le lui explique, où est son erreur et où est la correction.
 *
 * Des EXEMPLES plutôt que des phrases : le même surligné et le même badge que
 * sur la copie, à côté de ce qu'ils veulent dire. Un enfant de CE1 reconnaît
 * une couleur bien avant de lire une consigne.
 *
 * La ligne des tirets ----- ne paraît que s'il y en a : expliquer un repère
 * absent ferait chercher ce qui n'existe pas.
 */
export function LegendeErreurs({ trous = false, variante }) {
  const copie = (mot, n) => (
    <>
      <mark className="compare__mot compare__mot--copie">{mot}</mark>
      <span className="compare__badge">{n}</span>
    </>
  );

  const dictee = (mot, n) => (
    <>
      <mark className="compare__mot compare__mot--dictee">{mot}</mark>
      <span className="compare__badge">{n}</span>
    </>
  );

  return (
    <aside
      className={`legende-erreurs legende-erreurs--${variante}`}
      aria-label="Comment lire tes erreurs"
    >
      <p className="legende-erreurs__titre">
        <span className="legende-erreurs__icone" aria-hidden="true">💡</span>
        Comment lire tes erreurs
      </p>

      {/* UNE CARTE PAR IDÉE : l'exemple d'abord — c'est lui que l'œil
          reconnaît —, puis ce qu'il veut dire en trois mots, puis le détail. */}
      <ul className="legende-erreurs__liste">
        <li className="legende-erreurs__carte legende-erreurs__carte--copie">
          <span className="legende-erreurs__etiquette">Exemple</span><span className="legende-erreurs__exemple">{copie('mangé', 1)}</span>
          <strong className="legende-erreurs__nom">Ce que tu as écrit</strong>
          <span className="legende-erreurs__detail">Surligné en rouge, dans ta copie.</span>
        </li>

        <li className="legende-erreurs__carte legende-erreurs__carte--dictee">
          <span className="legende-erreurs__etiquette">Exemple</span><span className="legende-erreurs__exemple">{dictee('manger', 1)}</span>
          <strong className="legende-erreurs__nom">Ce qu’il fallait écrire</strong>
          <span className="legende-erreurs__detail">Surligné en jaune, dans la dictée.</span>
        </li>

        <li className="legende-erreurs__carte">
          <span className="legende-erreurs__etiquette">Exemple</span><span className="legende-erreurs__exemple">
            {copie('mangé', 1)}
            <span className="legende-erreurs__fleche" aria-hidden="true">→</span>
            {dictee('manger', 1)}
          </span>
          <strong className="legende-erreurs__nom">Même numéro, même erreur</strong>
          <span className="legende-erreurs__detail">
            Cherche le même chiffre de l’autre côté : c’est là qu’est la correction.
          </span>
        </li>

        {trous && (
          <li className="legende-erreurs__carte">
            <span className="legende-erreurs__etiquette">Exemple</span><span className="legende-erreurs__exemple">
              <span className="compare__manque compare__manque--copie">
                <span className="compare__tirets" aria-hidden="true">-----</span>
                <span className="compare__badge">2</span>
              </span>
            </span>
            <strong className="legende-erreurs__nom">Un mot oublié</strong>
            <span className="legende-erreurs__detail">
              Dans ta copie, les tirets marquent ce qui manque. Dans la dictée,
              la place d’un mot que tu as ajouté.
            </span>
          </li>
        )}
      </ul>
    </aside>
  );
}

/**
 * Le contenu du tableau. Une correction de dictée — « La dictée » puis
 * « Ta copie » — s'affiche avec ses erreurs numérotées ; tout le reste,
 * tel que le professeur l'a écrit.
 */
export function ContenuTableau({ contenu, copieReference = null }) {
  const lue = useMemo(() => lireComparaison(contenu), [contenu]);

  // LA VRAIE COPIE, SI ON LA CONNAÎT — voir `copieDeReference` : celle que
  // le professeur recopie peut être déjà corrigée, et les badges disparaîtraient
  // avec les fautes.
  const comparee = useMemo(
    () => (lue ? comparerDictee(lue.dicte, copieReference ?? lue.copie) : null),
    [lue, copieReference],
  );

  if (!lue || !comparee?.comparable) {
    return <pre className="ardoise__contenu">{contenu}</pre>;
  }

  // PAS DE LÉGENDE AU TABLEAU — décidé par Camara le 11/09/2026 : en séance,
  // le professeur reprend les erreurs une à une avec l'enfant, qui comprend
  // les badges en les voyant utilisés. La légende reste dans « Mes dictées »,
  // où il relit seul.
  return (
    <pre className="ardoise__contenu ardoise__contenu--dictee">
      {lue.avant && `${lue.avant}\n\n`}
      {`${lue.titreDictee}\n`}
      <TexteCompare segments={comparee.dicte} cote="dictee" />
      {`\n\n${lue.titreCopie}\n`}
      <TexteCompare segments={comparee.copie} cote="copie" />
    </pre>
  );
}
