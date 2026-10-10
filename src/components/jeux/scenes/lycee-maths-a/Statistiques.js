import {
  Reponses, Texte, ecrire, nombre, sur, useDeroule,
} from './commun';

/**
 * L'ORGUE DES STATISTIQUES (09/10/2026). La couverture : au coucher du soleil,
 * sur une terrasse de marbre, un instrument de tubes de laiton de toutes les
 * hauteurs, autour d'un mât doré. Une série, ce sont des tubes : un par valeur.
 *   - LA QUESTION est sur un cartouche doré ; dessous, la série en tubes de
 *     laiton, chacun à la hauteur de sa valeur (les données de l'énoncé, rien
 *     de plus) ;
 *   - LES RÉPONSES sont des carillons suspendus : on frappe le bon (`choix`) ;
 *   - APRÈS LA RÉPONSE, l'orgue montre la mesure : la ligne d'or de la
 *     moyenne, la bande de l'écart type, les tubes qui se rangent et le tube
 *     du milieu qui sonne (médiane), le quartile qui s'allume à son rang,
 *     l'étendue de chaque série pour comparer leur dispersion, ou la chaîne
 *     « × a, + b » d'une transformation.
 */

const P = 'sc-statistiques-seconde';

const m2 = (x) => ecrire(x, 2);
const liste = (s) => String(s).split(';').map((x) => nombre(x.trim())).filter(Number.isFinite);

/** Ce que l'orgue doit jouer pour cette manche (null si la question ne se lit pas). */
export function partitionDe(m) {
  const q = String(m.question);
  const b = nombre(m.bonne);
  let r;
  switch (m.consigne) {
    case 'moyenne':
    case 'mediane':
    case 'ecart-type': {
      r = q.match(/Série : ([^\n]+)/);
      if (!r) return null;
      const valeurs = liste(r[1]);
      if (valeurs.length < 2) return null;
      const moyenne = m.consigne === 'ecart-type' ? nombre((q.match(/Moyenne : ([\d,]+)/) ?? [])[1]) : null;
      return {
        sorte: m.consigne, rangees: [{ valeurs }], valeur: b, moyenne,
      };
    }
    case 'quartile': {
      const lignes = q.split('\n');
      const valeurs = liste(lignes[1] ?? '');
      const q1 = /Premier/.test(q);
      const rang = Math.ceil(((q1 ? 1 : 3) * valeurs.length) / 4);
      if (valeurs[rang - 1] !== b) return null;
      return {
        sorte: 'quartile', rangees: [{ valeurs }], valeur: b, rang, nom: q1 ? 'Q1' : 'Q3',
      };
    }
    case 'moyenne-ponderee': {
      const v = liste((q.match(/Valeurs : ([^\n]+)/) ?? [])[1] ?? '');
      const e = liste((q.match(/Effectifs : ([^\n]+)/) ?? [])[1] ?? '');
      if (v.length === 0 || v.length !== e.length) return null;
      return {
        sorte: 'moyenne', rangees: [{ valeurs: v, effectifs: e }], valeur: b,
      };
    }
    case 'dispersion': {
      const a = liste((q.match(/A : ([^\n]+)/) ?? [])[1] ?? '');
      const c = liste((q.match(/B : ([^\n]+)/) ?? [])[1] ?? '');
      if (!a.length || !c.length) return null;
      const gagnante = /A$/.test(m.bonne) ? 0 : /B$/.test(m.bonne) ? 1 : -1; // eslint-disable-line no-nested-ternary
      return { sorte: 'dispersion', rangees: [{ nom: 'A', valeurs: a }, { nom: 'B', valeurs: c }], gagnante };
    }
    case 'transformation': {
      r = q.match(/moyenne (\d+(?:,\d+)?) et pour écart type (\d+(?:,\d+)?)\.\nOn multiplie chaque valeur par ([−-]?\d+(?:,\d+)?), puis on (ajoute|retire) (\d+(?:,\d+)?)/);
      if (!r) return null;
      const [moy, et, a, sens, k] = [nombre(r[1]), nombre(r[2]), nombre(r[3]), r[4], nombre(r[5])];
      const decale = sens === 'ajoute' ? k : -k;
      if (/moyenne \?/.test(q)) {
        if (a * moy + decale !== b) return null;
        return {
          sorte: 'transformation',
          chaine: [ecrire(moy), `× ${ecrire(a)}`, ecrire(a * moy), `${decale >= 0 ? '+' : '−'} ${ecrire(Math.abs(decale))}`, m.bonne],
        };
      }
      if (Math.abs(a) * et !== b) return null;
      return {
        sorte: 'transformation',
        chaine: [ecrire(et), `× ${ecrire(Math.abs(a))}`, m.bonne, `(${decale >= 0 ? '+' : '−'} ${ecrire(Math.abs(decale))} : l’écart type ne bouge pas)`],
      };
    }
    default:
      return null;
  }
}

/** Une rangée de tubes de laiton, chacun à la hauteur de sa valeur. */
function Tubes({
  valeurs, effectifs, max, allumes = [], rangees = 1, nom, etendue,
}) {
  return (
    <div className={`${P}__rangee${rangees > 1 ? ` ${P}__rangee--double` : ''}${etendue ? ' est-etendue' : ''}`}>
      {nom && <span className={`${P}__nom-serie`}>{nom}</span>}
      <ol className={`${P}__tubes`} aria-label={nom ? `La série ${nom}` : 'La série'}>
        {valeurs.map((v, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`${i}-${v}`} className={`${P}__tube${allumes.includes(i) ? ' est-allume' : ''}`} style={{ '--h': Math.max(0.08, v / max), '--i': i }}>
            <span className={`${P}__cylindre`} aria-hidden="true" />
            <span className={`${P}__valeur`}>{ecrire(v)}</span>
            {effectifs && <span className={`${P}__effectif`}>{`× ${effectifs[i]}`}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** La ligne d'or (moyenne, médiane) et la bande de l'écart type, posées sur l'orgue. */
function Ligne({ valeur, max, texte, bande }) {
  return (
    <>
      {bande && <span className={`${P}__bande`} style={{ '--bas': Math.max(0, (valeur - bande) / max), '--haut': Math.min(1.05, (valeur + bande) / max) }} aria-hidden="true" />}
      <span className={`${P}__ligne`} style={{ '--y': valeur / max }}>
        <span>{texte}</span>
      </span>
    </>
  );
}

function OrgueApres({ partition }) {
  const { sorte, rangees, valeur } = partition;
  const n = useDeroule(2, 900);
  if (sorte === 'transformation') {
    return (
      <ol className={`${P}__chaine`} aria-label="La transformation, pas à pas">
        {partition.chaine.map((c, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={i <= n * 2 ? 'est-allume' : ''}>{c}</li>
        ))}
      </ol>
    );
  }
  const toutes = rangees.flatMap((r) => r.valeurs);
  const max = Math.max(...toutes, Number.isFinite(valeur) ? valeur : 0) * 1.12;
  if (sorte === 'dispersion') {
    return (
      <div className={`${P}__orgue ${P}__orgue--double`}>
        {rangees.map((r, i) => (
          <Tubes key={r.nom} {...r} max={max} rangees={2} etendue={n >= 1 && (partition.gagnante === i || partition.gagnante === -1)} />
        ))}
      </div>
    );
  }
  const [{ valeurs, effectifs }] = rangees;
  if (sorte === 'mediane') {
    const tries = [...valeurs].sort((x, y) => x - y);
    const k = tries.length;
    const milieu = k % 2 ? [(k - 1) / 2] : [k / 2 - 1, k / 2];
    return (
      <div className={`${P}__orgue`}>
        <Tubes valeurs={n >= 1 ? tries : valeurs} max={max} allumes={n >= 1 ? milieu : []} />
        {n >= 2 && Number.isFinite(valeur) && <Ligne valeur={valeur} max={max} texte={`médiane : ${m2(valeur)}`} />}
      </div>
    );
  }
  if (sorte === 'quartile') {
    return (
      <div className={`${P}__orgue`}>
        <Tubes valeurs={valeurs} max={max} allumes={n >= 1 ? [partition.rang - 1] : []} />
        {n >= 1 && <p className={`${P}__rang`}>{`${partition.nom} : la ${partition.rang}ᵉ valeur sur ${valeurs.length}`}</p>}
      </div>
    );
  }
  const moyenne = sorte === 'ecart-type' ? partition.moyenne : valeur;
  return (
    <div className={`${P}__orgue`}>
      <Tubes valeurs={valeurs} effectifs={effectifs} max={max} />
      {n >= 1 && Number.isFinite(moyenne) && (
        <Ligne
          valeur={moyenne}
          max={max}
          texte={`moyenne : ${ecrire(moyenne)}`}
          bande={sorte === 'ecart-type' && n >= 2 ? valeur : null}
        />
      )}
      {sorte === 'ecart-type' && n >= 2 && <p className={`${P}__rang`}>{`moyenne ± écart type : de ${ecrire(moyenne - valeur)} à ${ecrire(moyenne + valeur)}`}</p>}
    </div>
  );
}

function Soleil() {
  return (
    <svg className={`${P}__mat`} viewBox="0 0 90 140" aria-hidden="true" focusable="false">
      <circle cx="45" cy="34" r="22" className={`${P}__soleil`} />
      <ellipse cx="45" cy="40" rx="40" ry="10" className={`${P}__cercle`} />
      <line x1="45" y1="10" x2="45" y2="132" className={`${P}__fut`} />
      <path d="M45 4 l5 8 h-10 Z" className={`${P}__fut`} />
      {[12, 26, 64, 78].map((x, i) => (
        <rect key={x} x={x - 4} y={44 + (i % 2) * 10} width="8" height={60 - (i % 2) * 16} rx="3" className={`${P}__tube-decor`} style={{ '--i': i }} />
      ))}
      <rect x="10" y="128" width="70" height="8" rx="3" className={`${P}__socle`} />
    </svg>
  );
}

export function QuestionStatistiques({ m, termine }) {
  const partition = sur(() => partitionDe(m));
  const avant = partition && partition.sorte !== 'transformation' ? partition : null;
  const max = avant ? Math.max(...avant.rangees.flatMap((r) => r.valeurs)) * 1.12 : 1;
  return (
    <div className={`${P}${termine ? ' est-termine' : ''}`}>
      <div className={`${P}__terrasse`}>
        <Soleil />
        <div className={`${P}__cartouche`}>
          <Texte m={m} classe={`${P}__texte`} />
        </div>
      </div>
      {termine && partition && <OrgueApres partition={partition} />}
      {!termine && avant && (
        <div className={`${P}__orgue${avant.rangees.length > 1 ? ` ${P}__orgue--double` : ''}`}>
          {avant.rangees.map((r) => <Tubes key={r.nom ?? 'serie'} {...r} max={max} rangees={avant.rangees.length} />)}
        </div>
      )}
    </div>
  );
}

/** Les carillons suspendus : on frappe le bon. */
export function CarillonsStatistiques({ choix, fautes, choisir }) {
  return (
    <div className={`${P}__portique`}>
      <Reponses
        choix={choix}
        fautes={fautes}
        choisir={choisir}
        prefixe={P}
        etiquette="Frappe le bon carillon"
        decor={(i) => <span className={`${P}__carillon`} style={{ '--long': `${46 + (i % 3) * 12}px` }} aria-hidden="true" />}
      />
    </div>
  );
}
