import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEpreuve, getMatieresEleve } from '../lib/api/elevesApi';
import { styleMatiere } from '../lib/couleurMatiere';
import { useVueIllustree } from '../lib/vueIllustree';
import Avatar from './Avatar';
import BarrePreparation, { palierPreparation } from './BarrePreparation';
import { LIBELLE_ETAT } from './ControleFiche';
import JustificationProfesseur from './JustificationProfesseur';
import Loader from './Loader';
import PastillePret from './PastillePret';
import { jourControle } from './MesControles';
import { iconeEpreuve, libellePreparation } from './PreparationExamen';
import fujiCerisiers from '../assets/controles-illustre/fuji-cerisiers.webp';
import toriiCerisiers from '../assets/controles-illustre/torii-cerisiers.webp';
import './epreuveIllustre.css';

/**
 * La fiche d'une épreuve d'examen — le pendant de la fiche d'un contrôle.
 *
 * Toutes les notions de l'épreuve, regroupées par domaine du programme, avec
 * leur barre et leur état en toutes lettres ; puis le statut et la
 * justification de CHAQUE professeur de l'épreuve, signés et datés.
 *
 * LES DOMAINES SE REPLIENT, SAUF LE PREMIER : une épreuve de brevet compte des
 * dizaines de notions, et une liste de soixante lignes ne se lit pas. L'enfant
 * ouvre le domaine qu'il cherche.
 */
function grouperParDomaine(notions) {
  const groupes = new Map();

  notions.forEach((notion) => {
    const domaine = notion.domaine || 'Autres notions';
    if (!groupes.has(domaine)) groupes.set(domaine, []);
    groupes.get(domaine).push(notion);
  });

  return [...groupes.entries()].map(([domaine, liste]) => ({ domaine, notions: liste }));
}

function NotionEpreuve({ notion }) {
  const etat = LIBELLE_ETAT[notion.etat] ?? notion.etat;

  return (
    <li className="controle-notion">
      <div className="controle-notion__ligne">
        <span className="controle-notion__libelle">{notion.libelle}</span>

        <span className="controle-notion__etat">
          {etat}
          <span className="controle-notion__pourcent">{notion.pourcent} %</span>
        </span>
      </div>

      <div
        className="controle-notion__jauge"
        role="progressbar"
        aria-valuenow={notion.pourcent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${notion.libelle} : ${etat}`}
      >
        <span
          className={`est-${palierPreparation(notion.pourcent)}`}
          style={{ width: `${notion.pourcent}%` }}
        />
      </div>

      {notion.valideeParMesure && (
        <span className="controle-notion__resultat est-reussie">✓ validée par une note</span>
      )}
    </li>
  );
}

function MatiereEpreuve({ matiere, plusieurs, onPreparer }) {
  const preparation = matiere.preparation ?? { notions: [] };
  const domaines = grouperParDomaine(preparation.notions ?? []);

  return (
    <section className="epreuve-fiche__matiere">
      <h2 className="epreuve-fiche__titre">
        {matiere.libelle}
        {matiere.profPrenom && <span className="epreuve-fiche__prof"> avec {matiere.profPrenom}</span>}
      </h2>

      <section className="controle-fiche__resume">
        <BarrePreparation
          pourcent={preparation.pourcent}
          perimetreConnu={preparation.perimetreConnu ?? false}
        />

        {/* LE VERDICT EST CELUI DU PROFESSEUR, ET RIEN D'AUTRE — même règle
            que pour un contrôle : on ne devine pas. */}
        <div className="controle-pret">
          <PastillePret statut={preparation.pretStatut} cible="epreuve" />

          {/* EN PARAGRAPHES, un par domaine — voir JustificationProfesseur. */}
          {preparation.pretObservation && (
            <JustificationProfesseur
              texte={preparation.pretObservation}
              signature={preparation.pretLe
                ? ` — ${matiere.profPrenom ?? 'ton professeur'}, le ${jourControle(preparation.pretLe)}`
                : null}
            />
          )}
        </div>
      </section>

      {domaines.map((groupe, index) => (
        <details key={groupe.domaine} className="epreuve-fiche__domaine" open={index === 0}>
          <summary>
            <span>{groupe.domaine}</span>
            <span className="controle-fiche__compte">
              {groupe.notions.filter((n) => n.etat === 'acquise').length} acquise
              {groupe.notions.filter((n) => n.etat === 'acquise').length > 1 ? 's' : ''}
              {' '}sur {groupe.notions.length}
            </span>
          </summary>

          <ul className="controle-notions">
            {groupe.notions.map((notion) => <NotionEpreuve key={notion.id} notion={notion} />)}
          </ul>
        </details>
      ))}

      <div className="controle-fiche__actions">
        <button type="button" className="btn" onClick={() => onPreparer(matiere)}>
          {libellePreparation(matiere, plusieurs)}
        </button>
      </div>
    </section>
  );
}

/* ======================================================================================================
   LA FICHE D'UNE ÉPREUVE, VUE DE L'ENFANT — Camara, le 15/11/2026 : « pour la page de préparation aux examens je
   veux ça (maquette), mais garde la tête des vrais professeurs, il faut que ça s'adapte à chaque matière en
   examen ». Une bannière, puis un bloc par matière : son icône, « avec … », le VRAI portrait de son professeur
   (Avatar), la préparation, une rangée par domaine (dépliable, comme avant), le bouton qui ouvre la séance.
   Tout vient des données ; les couleurs d'un bloc sont celles de sa matière. Le parent garde l'ancienne vue.
   ====================================================================================================== */

/** Une icône au trait pour un domaine du programme, d'après son nom ; une étoile sinon. */
const TRAITS = [
  [/energie|electri|puissance/, 'M13 2 4 14h7l-1 8 9-12h-7z'],
  [/methode|competence|demarche|outil/, 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1'],
  [/mouvement|interaction|force|atome|mecani/, 'M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 3c2.5 0 4.5 4 4.5 9s-2 9-4.5 9-4.5-4-4.5-9 2-9 4.5-9zM4.2 7.5c1.2-2.2 5.7-1.4 10 1.1s7 6.3 5.6 8.4-5.7 1.4-10-1.1-7-6.3-5.6-8.4zM19.8 7.5c1.2 2.1-1.3 5.9-5.6 8.4s-8.8 3.3-10 1.1 1.3-5.9 5.6-8.4 8.8-3.3 10-1.1z'],
  [/matiere|organisation|chimi|molecul/, 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10'],
  [/vivant|evolution|biodiversite|cellule|genet/, 'M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM4 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm16 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-8 1c-3 0-5 3-5 5s2 3 5 3 5-1 5-3-2-5-5-5z'],
  [/signa|onde|sonore|lumiere/, 'M2 12h4l2-6 4 12 3-9 2 3h5'],
  [/planete|terre|climat|geolog|environ/, 'M4 20c8 0 14-6 16-16-10 2-16 8-16 16zm0 0 8-8'],
  [/corps|sante|humain|nutrition/, 'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11zM7 12h3l1-2 2 4 1-2h3'],
  [/nombre|calcul|algebr|fonction|arithm|statist|probab/, 'M4 4h16v16H4zM7 8h4M9 6v4M14 8h4M7 15l3 3M10 15l-3 3M14 16h4'],
  [/geometr|grandeur|mesure/, 'M3 20 12 4l9 16zM7.5 20 12 12l4.5 8'],
  [/histoire|siecle|guerre|revolution|empire|antiqu|moyen/, 'M6 2h12M6 22h12M7 2c0 5 10 5 10 10S7 17 7 22M17 2c0 5-10 5-10 10s10 5 10 10'],
  [/geograph|territoire|monde|carte|espace|mondialis/, 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18'],
  [/lecture|ecriture|langue|grammaire|texte|litter|lexique|orthograph|roman|poesie|theatre/, 'M2 5c3-1 7-1 10 1v14c-3-2-7-2-10-1zM22 5c-3-1-7-1-10 1v14c3-2 7-2 10-1z'],
  [/citoyen|emc|droit|moral|philo|politi/, 'M12 3v18M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z'],
];
const ETOILE = 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z';

export function traitDuDomaine(domaine) {
  const texte = (domaine ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return TRAITS.find(([motif]) => motif.test(texte))?.[1] ?? ETOILE;
}

function IconeTrait({ chemin }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={chemin} />
    </svg>
  );
}

function MatiereEpreuveIllustree({ matiere, plusieurs, onPreparer, portrait }) {
  const preparation = matiere.preparation ?? { notions: [] };
  const domaines = grouperParDomaine(preparation.notions ?? []);

  return (
    <section className="epv-matiere" style={styleMatiere({ matiereLibelle: matiere.libelle })}>
      <div className="epv-matiere__entete">
        <span className="epv-matiere__icone" aria-hidden="true">
          {iconeEpreuve({ matieres: [{ libelle: matiere.libelle }], libelle: '' })}
        </span>
        <h2 className="epv-matiere__titre">
          {matiere.libelle}
          {matiere.profPrenom && <em className="epv-matiere__prof"> avec {matiere.profPrenom}</em>}
        </h2>
        {/* LE VRAI PORTRAIT DU PROFESSEUR (« garde la tête des vrais professeurs ») — absent si on ne le connaît pas. */}
        {portrait && (
          <span className="epv-matiere__portrait" aria-hidden="true">
            <Avatar nom={portrait.profAvatar} couleur={portrait.profCouleur ?? matiere.profCouleur} taille={92} />
          </span>
        )}
      </div>

      <div className="epv-matiere__prepa">
        <BarrePreparation pourcent={preparation.pourcent} perimetreConnu={preparation.perimetreConnu ?? false} />
        <div className="controle-pret">
          <PastillePret statut={preparation.pretStatut} cible="epreuve" />
          {preparation.pretObservation && (
            <JustificationProfesseur
              texte={preparation.pretObservation}
              signature={preparation.pretLe
                ? ` — ${matiere.profPrenom ?? 'ton professeur'}, le ${jourControle(preparation.pretLe)}`
                : null}
            />
          )}
        </div>
      </div>

      {domaines.map((groupe, index) => {
        const acquises = groupe.notions.filter((n) => n.etat === 'acquise').length;
        return (
          <details key={groupe.domaine} className="epv-domaine" open={index === 0}>
            <summary>
              <span className="epv-domaine__icone"><IconeTrait chemin={traitDuDomaine(groupe.domaine)} /></span>
              <span className="epv-domaine__nom">{groupe.domaine}</span>
              <span className="epv-domaine__compte">
                {acquises} acquise{acquises > 1 ? 's' : ''} sur {groupe.notions.length}
              </span>
              <span className="epv-domaine__chevron" aria-hidden="true">›</span>
            </summary>
            <ul className="controle-notions">
              {groupe.notions.map((notion) => <NotionEpreuve key={notion.id} notion={notion} />)}
            </ul>
          </details>
        );
      })}

      <button type="button" className="epv-matiere__bouton" onClick={() => onPreparer(matiere)}>
        <span aria-hidden="true">✏️</span>
        <span>{libellePreparation(matiere, plusieurs)}</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

export default function EpreuveFiche() {
  const { eleveId, epreuveCode } = useParams();
  const navigate = useNavigate();

  const [epreuve, setEpreuve] = useState(null);
  const [erreur, setErreur] = useState(null);
  // La vue illustrée (et les portraits des professeurs qu'elle affiche) : pour l'enfant, et pour le parent dans
  // l'espace de son enfant (16/11/2026, lib/vueIllustree.js). La route des matières de l'élève sert aussi au parent.
  const enfant = useVueIllustree();
  // matiereId → { profAvatar, profCouleur } : l'épreuve ne porte pas l'avatar, la liste des matières de l'enfant si.
  const [portraits, setPortraits] = useState({});

  useEffect(() => {
    if (!enfant) return undefined;
    let vivant = true;
    getMatieresEleve(eleveId)
      .then(({ data }) => {
        if (!vivant) return;
        setPortraits(Object.fromEntries((data ?? []).map((m) => [m.id, { profAvatar: m.profAvatar, profCouleur: m.profCouleur }])));
      })
      .catch(() => {});
    return () => { vivant = false; };
  }, [eleveId, enfant]);

  useEffect(() => {
    let vivant = true;

    getEpreuve(eleveId, epreuveCode)
      .then(({ data }) => { if (vivant) setEpreuve(data); })
      .catch(() => { if (vivant) setErreur("Cette épreuve n'a pas pu être chargée."); });

    return () => { vivant = false; };
  }, [eleveId, epreuveCode]);

  if (erreur) return <div className="alert">{erreur}</div>;
  if (!epreuve) return <Loader texte="Chargement…" />;

  const plusieurs = epreuve.matieres.length > 1;

  // LE MODE VOYAGE DANS L'ADRESSE : c'est lui qui dit au professeur qu'on
  // prépare CETTE épreuve, et qu'il ne doit parler d'aucun contrôle.
  const preparer = (matiere) => navigate(
    `/eleves/${eleveId}/matieres/${matiere.matiereId}/chat?mode=examen&epreuve=${encodeURIComponent(epreuve.code)}`,
  );

  if (enfant) {
    return (
      <section
        className="page controle-page page-decor-enfant epv-illu"
        style={styleMatiere({ matiereLibelle: epreuve.matieres[0]?.libelle })}
      >
        <Link to={`/eleves/${eleveId}/matieres#preparation-examen`} className="lien-retour">← Mes cours</Link>

        <header className="epv-banniere">
          <img className="epv-banniere__decor" src={fujiCerisiers} alt="" aria-hidden="true" />
          <div className="epv-banniere__haut">
            <span className="epv-banniere__examen">
              <span aria-hidden="true">🎓</span> {epreuve.examenLibelle} {epreuve.session}
            </span>
            <span className="epv-banniere__pourcent">{epreuve.pourcent} %</span>
          </div>
          <h1 className="epv-banniere__titre">{epreuve.libelle}</h1>
          {epreuve.description && (
            <p className="epv-banniere__desc"><span aria-hidden="true">🕒</span> {epreuve.description}</p>
          )}
          {epreuve.remarque && <p className="epv-banniere__remarque">{epreuve.remarque}</p>}
        </header>

        {epreuve.matieres.map((matiere, i) => (
          <div key={matiere.matiereId} className="epv-bloc">
            {i > 0 && <div className="epv-separateur" aria-hidden="true">✦</div>}
            <MatiereEpreuveIllustree
              matiere={matiere}
              plusieurs={plusieurs}
              onPreparer={preparer}
              portrait={portraits[matiere.matiereId]?.profAvatar ? portraits[matiere.matiereId] : null}
            />
          </div>
        ))}

        <img className="epv-pied" src={toriiCerisiers} alt="" aria-hidden="true" />
      </section>
    );
  }

  return (
    <section
      className="page controle-page"
      style={styleMatiere({ matiereLibelle: epreuve.matieres[0]?.libelle })}
    >
      <Link to={`/eleves/${eleveId}/matieres#preparation-examen`} className="lien-retour">← Mes cours</Link>

      <article className="controle-fiche">
        <header className="controle-fiche__entete">
          <div className="controle-fiche__haut">
            <span className="controle-fiche__matiere">
              <span className="controle-fiche__point" aria-hidden="true" />
              {epreuve.examenLibelle} {epreuve.session}
            </span>

            <span className="controle-fiche__badge">{epreuve.pourcent} %</span>
          </div>

          <h1>{epreuve.libelle}</h1>

          {epreuve.description && <p className="controle-fiche__quand">{epreuve.description}</p>}
          {epreuve.remarque && <p className="epreuve-fiche__remarque">{epreuve.remarque}</p>}
        </header>

        <div className="controle-fiche__corps">
          {epreuve.matieres.map((matiere) => (
            <MatiereEpreuve
              key={matiere.matiereId}
              matiere={matiere}
              plusieurs={plusieurs}
              onPreparer={preparer}
            />
          ))}
        </div>
      </article>
    </section>
  );
}
