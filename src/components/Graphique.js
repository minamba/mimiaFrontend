import { useMemo, useState } from 'react';

/**
 * Graphique temporel : barres pour des volumes par période, lignes pour un
 * cumul. Rendu en SVG, sans librairie.
 *
 * Palette validée : les deux teintes ont été passées au vérificateur de la
 * skill dataviz (bande de clarté, plancher de chroma, séparation daltonienne,
 * contraste). Le mode sombre a sa propre palette — ce n'est pas une inversion,
 * la bande de clarté n'est pas la même.
 */
/** Lues depuis le CSS : le thème change sans rechargement, et la palette
 * reste définie au même endroit que le reste du système de couleurs. */
// TROIS, PARCE QUE LES ABONNEMENTS SE LISENT À TROIS : ce qui entre, ce qui
// est demandé, ce qui sort. Avec deux couleurs, la troisième série recevait
// `undefined` — un trait sans couleur, donc invisible, et rien pour le dire.
const COULEURS = ['var(--serie-1)', 'var(--serie-2)', 'var(--serie-3)'];

const MARGE = { haut: 16, droite: 14, bas: 30, gauche: 44 };

/** Libellé d'axe adapté au découpage interne de la période affichée. */
function formaterPeriode(iso, granularite) {
  const d = new Date(iso);
  switch (granularite) {
    case 'heure':
      return `${String(d.getHours()).padStart(2, '0')}h`;
    case 'annee':
      return String(d.getFullYear());
    case 'mois':
      return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    case 'semaine':
      return `sem. ${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
    default:
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}

/** Graduations rondes : 0, 5, 10… plutôt que 0, 3.7, 7.4… */
function echelle(max) {
  if (max <= 0) return { haut: 4, pas: 1 };
  const brut = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const pas = [1, 2, 5, 10].map((m) => m * magnitude).find((p) => p >= brut) ?? magnitude * 10;
  return { haut: Math.ceil(max / pas) * pas, pas };
}

/**
 * « 30 jours », « 12 mois » — la fenêtre réellement affichée.
 *
 * DITE EN TOUTES LETTRES, ET C'EST TOUT L'INTÉRÊT. « Total : 412 » ne veut
 * rien dire sans son étendue : le même nombre est excellent sur une journée et
 * inquiétant sur une année. Le filtre est en haut de l'écran, le graphique
 * peut être plus bas — on ne doit pas avoir à remonter pour interpréter.
 */
function libelleFenetre(nombre, granularite) {
  const noms = {
    heure: ['heure', 'heures'],
    jour: ['jour', 'jours'],
    semaine: ['semaine', 'semaines'],
    mois: ['mois', 'mois'],
    annee: ['année', 'années'],
  };

  const [singulier, pluriel] = noms[granularite] ?? noms.jour;
  return `${nombre} ${nombre > 1 ? pluriel : singulier}`;
}

export default function Graphique({
  titre,
  description,
  granularite,
  series,          // [{ nom, cle }]
  donnees,         // [{ periode, [cle]: number }]
  type = 'barres', // 'barres' | 'lignes'
  hauteur = 260,

  // COMMENT RÉSUMER LA SÉRIE EN UN CHIFFRE — et il n'y a pas de réponse
  // unique, d'où ce réglage.
  //
  //   'somme'   : additionne les périodes. Juste pour un FLUX — des requêtes,
  //               des inscriptions, des résiliations. « 412 sur 30 jours ».
  //   'dernier' : prend le dernier point. Juste pour un STOCK — des
  //               abonnements actifs, un cumul. Les additionner compterait le
  //               même abonnement autant de fois qu'il traverse de périodes,
  //               et rendrait un nombre qui ne veut rien dire.
  //   'aucun'   : n'en affiche pas. Pour un DÉCOMPTE DISTINCT, où aucune des
  //               deux réponses n'est juste : additionner les visiteurs
  //               uniques de chaque heure compte trois fois celui qui est
  //               revenu trois fois. Le bandeau affichait « TOTAL 3 » à côté
  //               de « 1 visiteur unique » — deux chiffres vrais, côte à côte,
  //               qui se contredisent à la lecture.
  //
  // Le défaut suit le type parce qu'ils vont ensemble dans cet écran : on
  // dessine les flux en barres et les stocks en lignes.
  agregat = type === 'lignes' ? 'dernier' : 'somme',
}) {
  const [survol, setSurvol] = useState(null);
  const [tableau, setTableau] = useState(false);

  const couleurs = COULEURS;
  const largeur = 760;
  const l = largeur - MARGE.gauche - MARGE.droite;
  const h = hauteur - MARGE.haut - MARGE.bas;

  const { haut, pas } = useMemo(() => {
    const max = Math.max(0, ...donnees.flatMap((d) => series.map((s) => d[s.cle] ?? 0)));
    return echelle(max);
  }, [donnees, series]);

  const graduations = useMemo(() => {
    const valeurs = [];
    for (let v = 0; v <= haut; v += pas) valeurs.push(v);
    return valeurs;
  }, [haut, pas]);

  const x = (i) => (donnees.length <= 1 ? l / 2 : (i / (donnees.length - 1)) * l);
  const y = (v) => h - (v / haut) * h;

  // Un libellé sur deux ou sur cinq selon la densité : au-delà, ils se chevauchent.
  const pasLibelle = Math.max(1, Math.ceil(donnees.length / 8));

  const totaux = useMemo(
    () => series.map((s) => ({
      nom: s.nom,
      valeur: agregat === 'dernier'
        ? donnees[donnees.length - 1]?.[s.cle] ?? 0
        : donnees.reduce((n, d) => n + (d[s.cle] ?? 0), 0),
    })),
    [donnees, series, agregat],
  );

  if (donnees.length === 0) {
    return (
      <figure className="graphique">
        <figcaption>
          <h3>{titre}</h3>
          {description && <p>{description}</p>}
        </figcaption>
        <div className="graphique__vide">Aucune donnée sur cette période.</div>
      </figure>
    );
  }

  const largeurBande = l / donnees.length;
  const largeurBarre = Math.max(2, (largeurBande - 2) / series.length - 2);

  return (
    <figure className="graphique">
      <figcaption className="graphique__entete">
        <div>
          <h3>{titre}</h3>

          {/* LE TOTAL AVANT LA DESCRIPTION, ET AVANT LE DESSIN.
              C'est le chiffre qu'on vient chercher ; la courbe explique
              ensuite comment on y est arrivé. Le mettre sous le graphique
              obligerait à le parcourir des yeux pour lire une addition que la
              machine sait faire. */}
          <p className="graphique__totaux" hidden={agregat === 'aucun'}>
            <span className="graphique__totaux-libelle">
              {agregat === 'dernier' ? 'À la fin de' : 'Total sur'}{' '}
              {libelleFenetre(donnees.length, granularite)}
            </span>

            {totaux.map((t, i) => (
              <span key={t.nom} className="graphique__total">
                {/* La pastille de couleur ne sert qu'à plusieurs séries : sur
                    une seule, elle désignerait quelque chose qui n'a pas de
                    concurrent. */}
                {totaux.length > 1 && (
                  <span className="graphique__total-puce" style={{ background: couleurs[i] }} />
                )}
                {totaux.length > 1 && <span className="graphique__total-nom">{t.nom}</span>}
                <strong>{t.valeur.toLocaleString('fr-FR')}</strong>
              </span>
            ))}
          </p>

          {description && <p>{description}</p>}
        </div>

        <div className="graphique__outils">
          {/* Une légende est toujours présente à partir de deux séries :
              l'identité ne doit jamais reposer sur la seule couleur. */}
          {series.length > 1 && (
            <ul className="legende">
              {series.map((s, i) => (
                <li key={s.cle}>
                  <span className="legende__puce" style={{ background: couleurs[i] }} />
                  {s.nom}
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            className="btn-ghost btn-ghost--mini"
            onClick={() => setTableau((v) => !v)}
          >
            {tableau ? 'Graphique' : 'Tableau'}
          </button>
        </div>
      </figcaption>

      {tableau ? (
        <div className="graphique__tableau">
          <table>
            <thead>
              <tr>
                <th scope="col">Période</th>
                {series.map((s) => (
                  <th key={s.cle} scope="col">{s.nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donnees.map((d) => (
                <tr key={d.periode}>
                  <th scope="row">{formaterPeriode(d.periode, granularite)}</th>
                  {series.map((s) => (
                    <td key={s.cle}>{(d[s.cle] ?? 0).toLocaleString('fr-FR')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="graphique__zone">
          <svg viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label={titre}>
            <g transform={`translate(${MARGE.gauche} ${MARGE.haut})`}>
              {/* Grille en retrait : elle situe, elle n'attire pas l'œil. */}
              {graduations.map((v) => (
                <g key={v}>
                  <line className="graphique__grille" x1={0} y1={y(v)} x2={l} y2={y(v)} />
                  <text className="graphique__gradation" x={-8} y={y(v) + 4} textAnchor="end">
                    {v.toLocaleString('fr-FR')}
                  </text>
                </g>
              ))}

              {type === 'barres'
                ? donnees.map((d, i) =>
                    series.map((s, j) => {
                      const valeur = d[s.cle] ?? 0;
                      const hb = h - y(valeur);
                      // Décalage de 2px entre barres adjacentes : le fond doit
                      // rester visible entre deux aplats, sinon ils fusionnent.
                      const bx = i * largeurBande + 1 + j * (largeurBarre + 2);

                      return (
                        <rect
                          key={s.cle}
                          x={bx}
                          y={y(valeur)}
                          width={largeurBarre}
                          height={Math.max(valeur > 0 ? 2 : 0, hb)}
                          rx={4}
                          fill={couleurs[j]}
                          opacity={survol === null || survol === i ? 1 : 0.4}
                        />
                      );
                    }),
                  )
                : series.map((s, j) => (
                    <g key={s.cle}>
                      <path
                        className="graphique__ligne"
                        d={donnees
                          .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[s.cle] ?? 0)}`)
                          .join(' ')}
                        stroke={couleurs[j]}
                      />
                      {donnees.map((d, i) =>
                        survol === i ? (
                          <circle
                            key={d.periode}
                            cx={x(i)}
                            cy={y(d[s.cle] ?? 0)}
                            r={5}
                            fill={couleurs[j]}
                            className="graphique__point"
                          />
                        ) : null,
                      )}
                    </g>
                  ))}

              {/* Repère vertical de survol */}
              {survol !== null && type === 'lignes' && (
                <line
                  className="graphique__repere"
                  x1={x(survol)}
                  y1={0}
                  x2={x(survol)}
                  y2={h}
                />
              )}

              {donnees.map((d, i) =>
                i % pasLibelle === 0 ? (
                  <text
                    key={d.periode}
                    className="graphique__libelle"
                    x={type === 'barres' ? i * largeurBande + largeurBande / 2 : x(i)}
                    y={h + 20}
                    textAnchor="middle"
                  >
                    {formaterPeriode(d.periode, granularite)}
                  </text>
                ) : null,
              )}

              {/* Bandes de capture : la cible de survol est plus large que la
                  marque, sinon viser une barre de 3px est impossible. */}
              {donnees.map((d, i) => (
                <rect
                  key={d.periode}
                  x={type === 'barres' ? i * largeurBande : x(i) - largeurBande / 2}
                  y={0}
                  width={largeurBande}
                  height={h}
                  fill="transparent"
                  onMouseEnter={() => setSurvol(i)}
                  onMouseLeave={() => setSurvol(null)}
                />
              ))}
            </g>
          </svg>

          {survol !== null && (
            <div
              className="infobulle"
              style={{
                left: `${((MARGE.gauche + (type === 'barres' ? survol * largeurBande + largeurBande / 2 : x(survol))) / largeur) * 100}%`,
              }}
            >
              <strong>{formaterPeriode(donnees[survol].periode, granularite)}</strong>
              {series.map((s, j) => (
                <span key={s.cle}>
                  <i style={{ background: couleurs[j] }} />
                  {s.nom} : {(donnees[survol][s.cle] ?? 0).toLocaleString('fr-FR')}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </figure>
  );
}
