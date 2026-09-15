import { useEffect, useState } from 'react';
import VerificationExamensAdmin from './VerificationExamensAdmin';
import { getProgrammeScolaire, traiterEcheanceReferentiel } from '../lib/api/adminApi';

/**
 * LE PROGRAMME SCOLAIRE, CLASSE PAR CLASSE.
 *
 * Refait le 13/09/2026 à la demande de Camara : la première version listait
 * des échéances en vrac, sans les notions — « pas clair ». Celle-ci suit la
 * forme du référentiel lui-même : on choisit une classe, on voit ses
 * matières, et sous chaque matière ses notions avec ce qui leur est arrivé
 * (à jour, ajoutée, modifiée, retirée — et quand), puis l'échéance
 * officielle qui la concerne et ce que la veille en a constaté.
 *
 * CE QUE CET ÉCRAN NE FAIT PAS : il n'édite aucune notion, il ne réécrit
 * rien du référentiel. Le référentiel change par ses fichiers de seed, et
 * la vérification contre le texte officiel reste un geste humain — le seul
 * bouton ici est celui qui dit « c'est fait ». Voir
 * `EcheanceReferentielWorker` pour pourquoi cette limite est volontaire.
 */

/**
 * LE STATUT DE LA VEILLE — trois mots demandés par Camara, plus un quatrième
 * qu'il a fallu ajouter. « Mis à jour » est SON mot pour ce que le worker
 * appelle « changée » : la PAGE officielle a changé — pas forcément le
 * référentiel de l'application, qui attend toujours la vérification humaine.
 * D'où l'info-bulle. Le mot est toujours écrit ; la couleur ne fait que le
 * souligner.
 */
const STATUTS_VEILLE = {
  changee: {
    libelle: 'Mis à jour',
    classe: 'est-changee',
    info: 'La page officielle a changé depuis le dernier relevé. Cela ne veut pas dire que le référentiel de l’application a déjà été corrigé — seulement qu’il y a quelque chose à revérifier.',
  },
  inchangee: {
    libelle: 'Inchangé',
    classe: 'est-inchangee',
    info: 'Aucun changement constaté sur la page officielle depuis le dernier relevé.',
  },
  injoignable: {
    libelle: 'Injoignable',
    classe: 'est-injoignable',
    info: 'La page n’a pas pu être lue automatiquement (réseau, ou adresse indisponible). À vérifier à la main.',
  },
};

const VEILLE_INCONNUE = {
  libelle: 'Pas encore vérifiée',
  classe: 'est-inconnu',
  info: 'Aucune adresse connue, ou premier relevé pas encore effectué : rien à comparer pour l’instant.',
};

const statutVeille = (echeance) => {
  if (!echeance.url) return VEILLE_INCONNUE;
  return STATUTS_VEILLE[echeance.dernierStatutVeille] ?? VEILLE_INCONNUE;
};

/**
 * LE STATUT D'UNE NOTION — ce qui lui est arrivé, et quand.
 *
 * « Retirée » l'emporte sur tout : une notion sortie du programme reste
 * dans la liste, c'est justement ce qu'on vient voir, mais barrée. Une
 * notion sans aucune date est simplement « à jour » : elle existait avant
 * qu'on date les lignes, et rien ne lui est arrivé depuis.
 */
const statutNotion = (notion) => {
  if (!notion.actif) return { libelle: 'Retirée', classe: 'est-retiree', date: notion.dateFinValidite };
  if (notion.dateModification) return { libelle: 'Modifiée', classe: 'est-modifiee', date: notion.dateModification };
  if (notion.dateCreation) return { libelle: 'Ajoutée', classe: 'est-ajoutee', date: notion.dateCreation };
  return { libelle: 'À jour', classe: 'est-a-jour', date: null };
};

/**
 * LES CLASSES, RANGÉES PAR RANG — Camara, le 14/09/2026 : « gros problème de
 * design ». Vingt-sept onglets sur une seule ligne sortaient de l'écran et
 * faisaient défiler toute l'administration à l'horizontale.
 *
 * LE RANG VIENT DU SERVEUR (`ordre`), PAS DU LIBELLÉ. Au lycée, trois à sept
 * classes partagent un rang (générale, pro, ST2S, STI2D…) : c'est ce rang qui
 * les regroupe. Un rang imprévu tombe dans « Autres » plutôt que de
 * disparaître de l'écran.
 */
const RANGS_CLASSES = [
  { cle: 'primaire', libelle: 'Primaire', contient: (ordre) => ordre >= 1 && ordre <= 5 },
  { cle: 'college', libelle: 'Collège', contient: (ordre) => ordre >= 6 && ordre <= 9 },
  { cle: 'seconde', libelle: 'Seconde', contient: (ordre) => ordre === 10, prefixe: 'Seconde' },
  { cle: 'premiere', libelle: 'Première', contient: (ordre) => ordre === 11, prefixe: 'Première' },
  { cle: 'terminale', libelle: 'Terminale', contient: (ordre) => ordre === 12, prefixe: 'Terminale' },
];

/**
 * Le libellé de la puce, sans le rang que la ligne dit déjà : « Première
 * ST2S » devient « ST2S » sur la ligne « Première ». Le libellé complet reste
 * le nom accessible de la puce — lu seul, « Générale » ne dirait pas laquelle.
 */
const libelleCourt = (classe, rang) => {
  if (!rang.prefixe || !classe.libelle.startsWith(`${rang.prefixe} `)) return classe.libelle;

  const reste = classe.libelle.slice(rang.prefixe.length + 1);
  return reste.charAt(0).toUpperCase() + reste.slice(1);
};

function SelecteurClasses({ classes, actif, onChoisir }) {
  const places = new Set();

  const lignes = RANGS_CLASSES
    .map((rang) => {
      const siennes = classes.filter((c) => rang.contient(c.ordre));
      siennes.forEach((c) => places.add(c.code));
      return { ...rang, classes: siennes };
    })
    .filter((ligne) => ligne.classes.length > 0);

  const autres = classes.filter((c) => !places.has(c.code));
  if (autres.length > 0) lignes.push({ cle: 'autres', libelle: 'Autres', classes: autres });

  return (
    <div className="classes-selecteur" role="tablist" aria-label="Classe">
      {lignes.map((ligne) => (
        <div key={ligne.cle} className="classes-selecteur__ligne" role="presentation">
          <span className="classes-selecteur__rang" aria-hidden="true">{ligne.libelle}</span>

          <div className="classes-selecteur__puces" role="presentation">
            {ligne.classes.map((c) => (
              <button
                key={c.code}
                type="button"
                role="tab"
                aria-selected={actif === c.code}
                aria-label={c.libelle}
                className={`classe-puce${actif === c.code ? ' classe-puce--active' : ''}`}
                onClick={() => onChoisir(c.code)}
              >
                {libelleCourt(c, ligne)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const dateLongue = (iso) => (iso
  ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—');

const dateCourte = (iso) => (iso
  ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  : '');

/** Une échéance officielle, avec ce que la veille en a constaté et le geste qui la clôt. */
function Echeance({ echeance, occupe, onTraiter }) {
  const veille = statutVeille(echeance);

  return (
    <div className={`programme-scolaire__echeance${echeance.traiteeLe ? ' est-traitee' : ''}`}>
      <div className="programme-scolaire__echeance-tete">
        <span className={`veille-statut ${veille.classe}`} title={veille.info}>
          <span className="veille-statut__point" aria-hidden="true" />
          {veille.libelle}
        </span>

        <strong className="programme-scolaire__echeance-titre">
          {echeance.sentinelle
            ? echeance.texteOfficiel
            : echeance.dateConnue
              ? `Bascule le ${dateLongue(echeance.dateEcheance)}`
              : `Texte attendu — rappel le ${dateLongue(echeance.dateEcheance)}`}
        </strong>
      </div>

      <dl className="programme-scolaire__echeance-faits">
        {!echeance.sentinelle && echeance.texteOfficiel && (
          <>
            <dt>Texte</dt>
            <dd>{echeance.texteOfficiel}</dd>
          </>
        )}

        <dt>Dernier relevé</dt>
        <dd>{dateLongue(echeance.dernierePageVerifieeLe)}</dd>

        {echeance.url && (
          <>
            <dt>Page</dt>
            <dd>
              <a href={echeance.url} target="_blank" rel="noreferrer" className="programme-scolaire__lien">
                texte officiel ↗
              </a>
            </dd>
          </>
        )}
      </dl>

      {echeance.notes && <p className="programme-scolaire__notes">{echeance.notes}</p>}

      <div className="programme-scolaire__echeance-action">
        {echeance.traiteeLe ? (
          <span className="programme-scolaire__traitee">Traitée le {dateLongue(echeance.traiteeLe)}</span>
        ) : (
          <button
            type="button"
            className="btn-ghost btn-ghost--mini"
            disabled={occupe}
            onClick={() => onTraiter(echeance)}
          >
            {/* UNE SENTINELLE NE SE CLÔT PAS : « vue » remet son statut à
                zéro et elle continue de veiller. */}
            {occupe ? 'Enregistrement…' : echeance.sentinelle ? 'Marquer vue' : 'Marquer traitée'}
          </button>
        )}
      </div>
    </div>
  );
}

/** Une matière d'une classe : son en-tête, ses échéances, puis ses notions par domaine. */
function Matiere({ matiere, occupe, onTraiter }) {
  const actives = matiere.notions.filter((n) => n.actif).length;
  const retirees = matiere.notions.length - actives;
  const domaines = [...new Set(matiere.notions.map((n) => n.domaine ?? ''))];

  return (
    <section className="programme-scolaire__matiere">
      <header className="programme-scolaire__matiere-tete">
        <span
          className="programme-scolaire__pastille"
          aria-hidden="true"
          style={matiere.couleur ? { background: matiere.couleur } : undefined}
        />
        <h3 className="programme-scolaire__matiere-nom">{matiere.libelle}</h3>
        <span className="programme-scolaire__compte">
          {actives} notion{actives > 1 ? 's' : ''}
          {retirees > 0 && ` · ${retirees} retirée${retirees > 1 ? 's' : ''}`}
        </span>
      </header>

      {matiere.echeances.length === 0 ? (
        <p className="programme-scolaire__sans-echeance">
          Aucune bascule annoncée : programme en vigueur.
        </p>
      ) : (
        matiere.echeances.map((e) => (
          <Echeance key={e.id} echeance={e} occupe={occupe === e.id} onTraiter={onTraiter} />
        ))
      )}

      {matiere.notions.length > 0 && (
        <div className="tableau">
          <table className="programme-scolaire__notions">
            <thead>
              <tr>
                <th scope="col">Notion</th>
                <th scope="col">Statut</th>
              </tr>
            </thead>
            <tbody>
              {domaines.map((domaine) => (
                <DomaineLignes
                  key={domaine || 'sans'}
                  domaine={domaine}
                  notions={matiere.notions.filter((n) => (n.domaine ?? '') === domaine)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DomaineLignes({ domaine, notions }) {
  return (
    <>
      {domaine && (
        <tr className="programme-scolaire__domaine">
          <th scope="rowgroup" colSpan={2}>{domaine}</th>
        </tr>
      )}

      {notions.map((n) => {
        const statut = statutNotion(n);

        return (
          <tr key={n.id} className={n.actif ? undefined : 'est-retiree'}>
            <td className="programme-scolaire__notion">{n.libelle}</td>
            <td>
              <span className={`notion-statut ${statut.classe}`}>
                {statut.libelle}
                {statut.date && <small> le {dateCourte(statut.date)}</small>}
              </span>
            </td>
          </tr>
        );
      })}
    </>
  );
}

export default function ProgrammeScolaireAdmin() {
  const [programme, setProgramme] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [occupe, setOccupe] = useState(null);
  const [classe, setClasse] = useState(null);

  const charger = () => {
    setChargement(true);

    return getProgrammeScolaire()
      .then(({ data }) => setProgramme(data))
      .catch(() => setErreur("Le programme scolaire n'a pas pu être chargé."))
      .finally(() => setChargement(false));
  };

  useEffect(() => { charger(); }, []);

  const marquerTraitee = async (echeance) => {
    setOccupe(echeance.id);

    try {
      await traiterEcheanceReferentiel(echeance.id);
      await charger();
    } catch {
      setErreur("Cette échéance n'a pas pu être marquée traitée.");
    } finally {
      setOccupe(null);
    }
  };

  if (chargement && !programme) return <p className="etat-vide">Chargement…</p>;
  if (!programme) return <div className="alert">{erreur ?? 'Rien à afficher.'}</div>;

  const classes = programme.classes ?? [];
  const sentinelles = programme.sentinelles ?? [];
  const courante = classes.find((c) => c.code === classe) ?? classes[0];

  return (
    <div className="programme-scolaire">
      {erreur && <div className="alert">{erreur}</div>}

      {/* LE TITRE DIT SUR QUOI ON EST — et il vient du serveur, jamais d'une
          chaîne à changer chaque rentrée : le 1er août, il passera tout seul
          à l'année suivante. Le retard, s'il y en a, est dit à côté. */}
      <header className="programme-scolaire__titre">
        <h2>{programme.titre}</h2>
        {programme.echeancesEnRetard > 0 ? (
          <span className="programme-scolaire__retard">
            {programme.echeancesEnRetard} échéance{programme.echeancesEnRetard > 1 ? 's' : ''} dépassée
            {programme.echeancesEnRetard > 1 ? 's' : ''} à vérifier
          </span>
        ) : (
          <span className="programme-scolaire__a-jour">Aucune vérification en retard</span>
        )}
      </header>

      <p className="programme-scolaire__note">
        Chaque page officielle est relevée automatiquement tous les jours : le
        worker constate si elle a changé, il ne corrige jamais le référentiel
        lui-même. Une notion retirée du programme reste ici, barrée : les
        élèves qui l’ont travaillée la gardent, les nouveaux ne la voient plus.
      </p>

      <VerificationExamensAdmin />

      {sentinelles.length > 0 && (
        <section className="programme-scolaire__veille">
          <h3 className="programme-scolaire__section-titre">Veille générale</h3>
          {sentinelles.map((e) => (
            <Echeance key={e.id} echeance={e} occupe={occupe === e.id} onTraiter={marquerTraitee} />
          ))}
        </section>
      )}

      {classes.length > 0 && (
        <>
          <h3 className="programme-scolaire__section-titre">Programme par classe</h3>

          <SelecteurClasses classes={classes} actif={courante?.code} onChoisir={setClasse} />

          {courante && (
            courante.matieres.length === 0 ? (
              <p className="etat-vide">
                Aucune notion répertoriée pour cette classe.
              </p>
            ) : (
              courante.matieres.map((m) => (
                <Matiere key={m.matiereId} matiere={m} occupe={occupe} onTraiter={marquerTraitee} />
              ))
            )
          )}
        </>
      )}
    </div>
  );
}
