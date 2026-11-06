import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import logo from '../assets/logo-fond-clair.png';
import { nomDocument } from '../lib/impression';
import {
  dateLisible, jourLisible, libelleSection, libelleStatut, lignesDuTest, STATUTS_JEU,
} from '../lib/jeuxTests';

/**
 * UN JEU DE TEST EN PDF — Camara, le 04/11/2026 : un vrai fichier téléchargé, par la même
 * bibliothèque que le bilan hebdomadaire (`FenetreBilan`), chargée au clic seulement.
 *
 * TOUT EST EN STYLES EN LIGNE ET EN COULEURS FIXES : le papier reste clair quel que soit le
 * thème de l'écran, et aucune règle d'App.css ne vient s'y glisser.
 *
 * DES LIGNES ET NON UN <table> : pour ne pas couper une ligne entre deux pages, la
 * bibliothèque glisse une cale devant elle, et une cale n'a pas sa place dans un tableau.
 */
const ENCRE = '#14213d';
const DOUX = '#5f6c81';
const TRAIT = '#d9dee8';
const BANDE = '#f1f4f9';
const CORAIL = '#d9482a';

const COULEURS = {
  ok: { texte: '#2f7d32', fond: '#e4f3e5' },
  en_cours: { texte: '#a65f06', fond: '#fbefdc' },
  ko: { texte: '#c0392b', fond: '#fbe5e2' },
  a_tester: { texte: DOUX, fond: '#eceff4' },
  non_demarre: { texte: DOUX, fond: '#eceff4' },
};

/** La part de chaque colonne : le commentaire est le plus long à lire. */
const COLONNES = [
  { titre: 'Compétence / test à réaliser', largeur: '33%' },
  { titre: 'Statut', largeur: '12%' },
  { titre: 'Créé le', largeur: '9%' },
  { titre: 'Effectué le', largeur: '9%' },
  { titre: 'Commentaire', largeur: '37%' },
];

const cellule = (largeur) => ({
  boxSizing: 'border-box',
  width: largeur,
  padding: '7px 9px',
  overflowWrap: 'anywhere',
  whiteSpace: 'pre-wrap',
});

function Pastille({ statut, libelle }) {
  const couleur = COULEURS[statut] ?? COULEURS.a_tester;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 9px 3px',
        borderRadius: 999,
        background: couleur.fond,
        color: couleur.texte,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      {libelle}
    </span>
  );
}

function Rangee({ ligne }) {
  return (
    <div className="jeu-pdf__ligne" style={{ display: 'flex', borderBottom: `1px solid ${TRAIT}` }}>
      <div style={cellule(COLONNES[0].largeur)}>
        {ligne.competence || <em style={{ color: DOUX }}>À renseigner</em>}
      </div>
      <div style={cellule(COLONNES[1].largeur)}>
        <Pastille statut={ligne.statut} libelle={libelleStatut(ligne.statut)} />
      </div>
      <div style={cellule(COLONNES[2].largeur)}>{dateLisible(ligne.dateCreation)}</div>
      <div style={cellule(COLONNES[3].largeur)}>{jourLisible(ligne.dateEffectuee)}</div>
      <div style={{ ...cellule(COLONNES[4].largeur), color: DOUX }}>{ligne.commentaire}</div>
    </div>
  );
}

function BlocTest({ test }) {
  const [premiere, ...suite] = test.lignes;

  return (
    <div style={{ marginTop: 18 }}>
      {/* LE TITRE NE RESTE JAMAIS SEUL EN BAS DE PAGE : il part avec sa première ligne. */}
      <div className="jeu-pdf__debut">
        <div style={{ paddingLeft: 10, borderLeft: `4px solid ${CORAIL}`, marginBottom: 8 }}>
          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 17, fontWeight: 700 }}>
            {test.titre}
          </div>
          <div style={{ marginTop: 2, color: DOUX }}>
            <strong style={{ color: CORAIL }}>{test.matiere}</strong> · {lignesDuTest(test.lignes.length)}
          </div>
        </div>

        <div style={{ display: 'flex', background: BANDE, borderBottom: `1px solid ${TRAIT}`, fontWeight: 700 }}>
          {COLONNES.map((c) => <div key={c.titre} style={cellule(c.largeur)}>{c.titre}</div>)}
        </div>

        {premiere && <Rangee ligne={premiere} />}
      </div>

      {suite.map((ligne) => <Rangee key={ligne.id} ligne={ligne} />)}
    </div>
  );
}

/** La feuille elle-même. `maintenant` : la date d'export, écrite sur le document. */
export function DocumentJeuTest({ jeu, maintenant }) {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        padding: 2,
        background: '#ffffff',
        color: ENCRE,
        fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
        fontSize: 11.5,
        lineHeight: 1.4,
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ color: DOUX, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Jeu de test
          </div>
          <div style={{ marginTop: 2, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 24, fontWeight: 700 }}>
            {jeu.titre?.trim() || `${libelleSection(jeu.section)} · ${jeu.classe}`}
          </div>
          {jeu.titre?.trim() && (
            <div style={{ marginTop: 2, color: DOUX, fontSize: 13 }}>{libelleSection(jeu.section)} · {jeu.classe}</div>
          )}
        </div>
        <img src={logo} alt="Mimia" style={{ display: 'block', height: 38, width: 'auto' }} />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '4px 14px',
          marginTop: 10,
          paddingBottom: 10,
          borderBottom: `2px solid ${CORAIL}`,
          color: DOUX,
        }}
      >
        <Pastille statut={jeu.statut} libelle={STATUTS_JEU[jeu.statut] ?? jeu.statut} />
        <span>{jeu.nombreOk} sur {lignesDuTest(jeu.nombreLignes)} OK</span>
        <span>Auteur : {jeu.auteur}</span>
        <span>Créé le {dateLisible(jeu.dateCreation)}</span>
        <span>Exporté le {maintenant.toLocaleDateString('fr-FR')}</span>
      </div>

      {jeu.tests.map((test) => <BlocTest key={test.id} test={test} />)}
    </div>
  );
}

/** `Mimia--Elementaire-CP_2026-11-04_Jeu-de-test.pdf` : mêmes règles que les autres documents. */
export const nomDuPdfJeuTest = (jeu, maintenant = new Date()) => `${nomDocument({
  matiere: `${libelleSection(jeu.section)} ${jeu.classe}`,
  date: maintenant,
  suffixe: 'Jeu de test',
})}.pdf`;

/** Paysage : cinq colonnes, dont deux de texte, ne tiennent pas dans la largeur d'un A4 debout. */
export const OPTIONS_PDF = {
  margin: [8, 8, 8, 8],
  image: { type: 'jpeg', quality: 0.95 },
  html2canvas: { scale: 2, backgroundColor: '#ffffff' },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  pagebreak: { mode: ['css'], avoid: ['.jeu-pdf__ligne', '.jeu-pdf__debut'] },
};

export async function exporterJeuTestEnPdf(jeu, maintenant = new Date()) {
  const { default: html2pdf } = await import('html2pdf.js');

  const page = document.createElement('div');
  const racine = createRoot(page);
  flushSync(() => racine.render(<DocumentJeuTest jeu={jeu} maintenant={maintenant} />));

  try {
    await html2pdf()
      .set({ ...OPTIONS_PDF, filename: nomDuPdfJeuTest(jeu, maintenant) })
      .from(page)
      .save();
  } finally {
    racine.unmount();
  }
}
