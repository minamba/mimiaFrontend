import { useEffect, useState } from 'react';
import Onglets from './Onglets';
import { getTarifs, modifierTarif } from '../lib/api/adminApi';
import { ilYA } from './FournisseursIA';

/**
 * LA GRILLE TARIFAIRE DES FOURNISSEURS D'IA — voulue par Camara le 19/09/2026,
 * le jour où la facture d'Anthropic a montré que nos coûts comptaient Sonnet 5
 * à 3 $ / 15 $ quand il se paie 2 $ / 10 $.
 *
 * TENUE À JOUR TOUTE SEULE. Une veille lit chaque jour la page de tarifs de
 * chaque fournisseur (voir `VeilleTarifsWorker` côté serveur) : un prix qui
 * change est appliqué à nos calculs, sa date de mise à jour change, et un
 * message part sur Telegram. L'écran n'a donc plus de bouton « appliquer » —
 * seulement une correction à la main, en secours, si la veille décroche.
 *
 * LE STATUT EST UNE DATE — « Mis à jour le 19/09/2026 », voulu ainsi par
 * Camara : c'est le jour où le prix a changé pour la dernière fois. La ligne
 * « Vérifié » dit, elle, quand la veille est passée ; si elle ne passe plus,
 * ça se voit ici.
 *
 * DES CARTES ET NON UN TABLEAU : sept colonnes ne tiennent pas sur un
 * téléphone, et Camara ne veut plus de défilement de côté.
 */

const FOURNISSEURS = [
  {
    cle: 'anthropic',
    libelle: 'Anthropic',
    grille: 'https://docs.claude.com/en/docs/about-claude/pricing',
    facture: 'https://platform.claude.com',
  },
  {
    cle: 'openai',
    libelle: 'OpenAI',
    grille: 'https://developers.openai.com/api/docs/pricing',
    facture: 'https://platform.openai.com/usage',
  },
];

/** « 2 $ », « 0,015 $ » : pas de zéros inutiles, la virgule française. */
export function enDollars(prix) {
  if (prix === null || prix === undefined) return '—';
  return `${Number(prix).toLocaleString('fr-FR', { maximumFractionDigits: 5 })} $`;
}

const date = (iso) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');

/**
 * Les prix d'une ligne, dans l'unité qui la concerne. La voix d'OpenAI a les
 * deux : elle se facture au jeton, et on l'utilise à la minute.
 */
function Prix({ entree, sortie, minute }) {
  const aLaMinute = minute !== null && minute !== undefined;
  const auJeton = entree !== null && entree !== undefined;

  return (
    <span className="prix-ia__prix">
      {aLaMinute && <>{enDollars(minute)} <small>la minute</small></>}
      {aLaMinute && auJeton && <br />}
      {auJeton && (
        <>
          {enDollars(entree)} <small>entrée</small> · {enDollars(sortie)} <small>sortie</small>
          <small className="prix-ia__unite">par million de jetons</small>
        </>
      )}
    </span>
  );
}

/** Un champ de prix : vide = pas de prix. */
const lire = (valeur) => (valeur === '' || valeur === null ? null : Number(String(valeur).replace(',', '.')));

function CarteTarif({ ligne, onMisAJour, maintenant }) {
  const [edition, setEdition] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  const nonCompte = ligne.statut === 'non_compte';
  const aLaMinute = ligne.prixMinute !== null && ligne.prixMinute !== undefined;
  const auJeton = ligne.prixEntree !== null && ligne.prixEntree !== undefined;

  const enregistrer = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      const { data } = await modifierTarif(ligne.id, {
        prixEntree: auJeton ? lire(edition.entree) : null,
        prixSortie: auJeton ? lire(edition.sortie) : null,
        prixMinute: aLaMinute ? lire(edition.minute) : null,
      });
      onMisAJour(data);
      setEdition(null);
    } catch (e) {
      setErreur(e?.response?.data?.message ?? 'Le prix n’a pas pu être enregistré.');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <article className="prix-ia prix-ia--ok" aria-label={`Tarif de ${ligne.modele}`}>
      <header className="prix-ia__entete">
        <code className="prix-ia__modele">{ligne.modele}</code>
        <span className="prix-ia__statut">Mis à jour le {date(ligne.dateMiseAJour)}</span>
      </header>

      {ligne.usage && <p className="prix-ia__usage">{ligne.usage}</p>}

      {erreur && <div className="alert">{erreur}</div>}

      {edition ? (
        <div className="prix-ia__edition">
          {aLaMinute && (
            <label>
              <span>Prix par minute ($)</span>
              <input
                inputMode="decimal"
                value={edition.minute}
                onChange={(e) => setEdition({ ...edition, minute: e.target.value })}
              />
            </label>
          )}
          {auJeton && (
            <>
              <label>
                <span>Entrée ($ / million)</span>
                <input
                  inputMode="decimal"
                  value={edition.entree}
                  onChange={(e) => setEdition({ ...edition, entree: e.target.value })}
                />
              </label>
              <label>
                <span>Sortie ($ / million)</span>
                <input
                  inputMode="decimal"
                  value={edition.sortie}
                  onChange={(e) => setEdition({ ...edition, sortie: e.target.value })}
                />
              </label>
            </>
          )}
          <div className="prix-ia__actions">
            <button type="button" className="btn btn--compact" disabled={envoi} onClick={enregistrer}>
              {envoi ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEdition(null)}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <dl className="prix-ia__lignes">
          <div>
            <dt>Prix</dt>
            <dd><Prix entree={ligne.prixEntree} sortie={ligne.prixSortie} minute={ligne.prixMinute} /></dd>
          </div>
          <div>
            <dt>Vérifié</dt>
            <dd>{ligne.derniereVerification ? ilYA(ligne.derniereVerification, maintenant) : 'pas encore'}</dd>
          </div>
          {nonCompte && (
            <div>
              <dt>Nos coûts</dt>
              <dd className="prix-ia__prix--vide">non compté</dd>
            </div>
          )}
        </dl>
      )}

      {!edition && (
        <div className="prix-ia__actions">
          <button
            type="button"
            className="btn-ghost btn-ghost--mini"
            title="En secours, si la veille automatique n'arrive plus à lire la page du fournisseur."
            onClick={() => setEdition({
              entree: ligne.prixEntree ?? '',
              sortie: ligne.prixSortie ?? '',
              minute: ligne.prixMinute ?? '',
            })}
          >
            Corriger à la main
          </button>
        </div>
      )}
    </article>
  );
}

export default function TarifsFournisseurs() {
  const [lignes, setLignes] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [fournisseur, setFournisseur] = useState('anthropic');
  const [maintenant] = useState(() => Date.now());

  useEffect(() => {
    let vivant = true;
    getTarifs()
      .then(({ data }) => { if (vivant) setLignes(Array.isArray(data) ? data : []); })
      .catch(() => { if (vivant) setErreur('La grille tarifaire n’a pas pu être chargée.'); });
    return () => { vivant = false; };
  }, []);

  const remplacer = (nouvelle) =>
    setLignes((l) => l.map((x) => (x.id === nouvelle.id ? nouvelle : x)));

  const choisi = FOURNISSEURS.find((f) => f.cle === fournisseur);
  const visibles = (lignes ?? []).filter((l) => l.fournisseur === fournisseur);

  return (
    <div className="grille-tarifs">
      <Onglets
        mini
        etiquette="Fournisseur"
        actif={fournisseur}
        onChoisir={setFournisseur}
        items={FOURNISSEURS.map((f) => ({ cle: f.cle, libelle: f.libelle }))}
      />

      {erreur && <div className="alert">{erreur}</div>}
      {!erreur && lignes === null && <p className="etat-vide">Chargement…</p>}

      {lignes !== null && (
        <>
          <p className="grille-tarifs__aide">
            Les prix sont relus chaque jour sur{' '}
            <a href={choisi.grille} target="_blank" rel="noreferrer">la grille de {choisi.libelle}</a>
            {' '}et appliqués tout de suite à nos coûts ; un changement est annoncé sur Telegram.
            La facture réelle se lit sur{' '}
            <a href={choisi.facture} target="_blank" rel="noreferrer">la console {choisi.libelle}</a>.
            {fournisseur === 'anthropic' && (
              <> Le cache se paie en multiple du prix d’entrée : 1,25× pour une écriture de
                cinq minutes, 2× pour une heure, 0,1× pour une relecture.</>
            )}
          </p>

          <div className="grille-tarifs__cartes">
            {visibles.map((l) => (
              <CarteTarif key={l.id} ligne={l} onMisAJour={remplacer} maintenant={maintenant} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
