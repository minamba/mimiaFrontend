import { useCallback, useEffect, useState } from 'react';
import {
  getSignatures, creerSignature, modifierSignature, supprimerSignature, apercuSignature, attribuerSignature,
  apercuSignatureCompte,
} from '../lib/api/adminApi';

/**
 * LES SIGNATURES DE COURRIEL — Camara, le 17/10/2026 : « un sous-onglet pour
 * créer des templates de signature qui apparaîtront à la fin du mail, et les
 * attribuer aux utilisateurs ; le modèle de base prend les informations et le
 * rôle de la personne connectée, dans le thème du site ».
 *
 * DES CHOIX, PAS DU CODE : formule, ligne libre, ce qu'on affiche, une couleur
 * du site. La mise en page est celle du site ; le nom, le rôle et l'adresse sont
 * ceux de l'expéditeur au moment de l'envoi. L'aperçu se fait à VOTRE nom.
 *
 * Réservé au super-administrateur, comme le serveur le vérifie.
 */
const COULEURS = [
  { valeur: '#d63f1c', nom: 'Corail' },
  { valeur: '#2f6fd6', nom: 'Bleu' },
  { valeur: '#0e7c7b', nom: 'Sarcelle' },
  { valeur: '#6d28d9', nom: 'Violet' },
  { valeur: '#b45309', nom: 'Ambre' },
  { valeur: '#16233a', nom: 'Marine' },
];

const VIDE = {
  id: null,
  nom: '',
  formule: '',
  ligneLibre: '',
  telephone: '',
  afficherRole: true,
  afficherAdresse: true,
  afficherSite: true,
  couleur: '#16233a',
  parDefaut: false,
};

/**
 * L'aperçu, isolé dans un cadre : le HTML vient du serveur, déjà échappé.
 * SUR TÉLÉPHONE (Camara, le 18/10/2026 : « le modèle par défaut, je le vois
 * mal ») : la même règle que dans le courriel — logo plus petit, marges
 * resserrées, adresse insécable — pour que la carte tienne dans la largeur.
 */
const STYLE_APERCU = '<meta name="viewport" content="width=device-width,initial-scale=1">'
  + '<style>@media only screen and (max-width:520px){'
  + '.sig-logo{padding-right:10px!important}.sig-logo img{width:64px!important}'
  + '.sig-texte{padding-left:10px!important;word-break:normal!important}'
  + '.sig-texte div:first-child{font-size:18px!important}'
  + '}</style>';

function Apercu({ html, grand = false }) {
  const page = `<!doctype html><html><head><meta charset="utf-8">${STYLE_APERCU}</head><body style="margin:0;padding:14px 16px;background:#fff;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">${html ?? ''}</body></html>`;
  return (
    <iframe
      className={`signatures__apercu${grand ? ' signatures__apercu--grand' : ''}`}
      title="Aperçu de la signature"
      sandbox=""
      srcDoc={page}
    />
  );
}

export default function SignaturesMail() {
  const [donnees, setDonnees] = useState(null);
  const [apercus, setApercus] = useState({});
  const [edition, setEdition] = useState(null);
  const [apercuEdition, setApercuEdition] = useState('');
  const [erreur, setErreur] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  // L'aperçu de la signature d'un compte, en fenêtre (17/10/2026).
  const [apercuCompte, setApercuCompte] = useState(null);

  const voirSignature = async (s) => {
    setApercuCompte({ qui: s, html: null });
    try {
      const { data } = await apercuSignatureCompte(s.parentId);
      setApercuCompte({ qui: s, html: data });
    } catch {
      setApercuCompte(null);
      setErreur('L’aperçu de cette signature n’a pas pu être chargé.');
    }
  };

  useEffect(() => {
    if (!apercuCompte) return undefined;
    const surTouche = (e) => { if (e.key === 'Escape') setApercuCompte(null); };
    document.addEventListener('keydown', surTouche);
    return () => document.removeEventListener('keydown', surTouche);
  }, [apercuCompte]);

  const charger = useCallback(async () => {
    try {
      const { data } = await getSignatures();
      setDonnees(data);
      // Un aperçu par modèle, à votre nom.
      const paires = await Promise.all((data.modeles ?? []).map(async (m) => {
        try {
          const r = await apercuSignature(m);
          return [m.id, r.data];
        } catch {
          return [m.id, ''];
        }
      }));
      setApercus(Object.fromEntries(paires));
    } catch {
      setErreur('Les signatures n’ont pas pu être chargées.');
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // L'aperçu de la saisie suit la frappe, un instant après.
  useEffect(() => {
    if (!edition) return undefined;
    const minuteur = setTimeout(async () => {
      try {
        const { data } = await apercuSignature(edition);
        setApercuEdition(data);
      } catch {
        setApercuEdition('');
      }
    }, 300);
    return () => clearTimeout(minuteur);
  }, [edition]);

  const enregistrer = async (e) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      if (edition.id) await modifierSignature(edition.id, edition);
      else await creerSignature(edition);
      setEdition(null);
      await charger();
    } catch (ex) {
      setErreur(ex?.response?.data?.message ?? 'Le modèle n’a pas pu être enregistré.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (m) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Supprimer le modèle « ${m.nom} » ? Ses comptes reprendront le modèle par défaut.`)) return;
    setErreur(null);
    try {
      await supprimerSignature(m.id);
      await charger();
    } catch (ex) {
      setErreur(ex?.response?.data?.message ?? 'Le modèle n’a pas pu être supprimé.');
    }
  };

  const attribuer = async (parentId, valeur) => {
    setErreur(null);
    try {
      await attribuerSignature(parentId, valeur ? Number(valeur) : null);
      await charger();
    } catch {
      setErreur('Le modèle n’a pas pu être attribué.');
    }
  };

  if (!donnees) return erreur ? <div className="alert">{erreur}</div> : <p className="roles__attente">Lecture des signatures…</p>;

  const parDefaut = donnees.modeles.find((m) => m.parDefaut);
  const set = (cle) => (e) => setEdition({ ...edition, [cle]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <section className="signatures">
      <header className="roles__entete">
        <div>
          <h2>Les signatures</h2>
          <p>
            Elles terminent les messages envoyés depuis la messagerie et « Écrire à un parent », au
            nom de celui qui écrit : son prénom, son rôle, son adresse. Les aperçus sont à votre nom.
          </p>
        </div>
        {!edition && (
          <button type="button" className="btn btn--compact" onClick={() => setEdition(VIDE)}>
            + Nouveau modèle
          </button>
        )}
      </header>

      {erreur && <div className="alert" role="alert">{erreur}</div>}

      {edition && (
        <form className="roles__edition signatures__edition" onSubmit={enregistrer}>
          <h3>{edition.id ? `Modifier « ${edition.nom || 'le modèle'} »` : 'Nouveau modèle'}</h3>
          <div className="signatures__grille">
            <div>
              <div className="champ">
                <label htmlFor="sig-nom">Nom du modèle</label>
                <input id="sig-nom" value={edition.nom} onChange={set('nom')} maxLength={60} required
                  placeholder="Signature commerciale" />
              </div>
              <div className="champ">
                <label htmlFor="sig-formule">Formule de politesse</label>
                <input id="sig-formule" value={edition.formule ?? ''} onChange={set('formule')} maxLength={80}
                  placeholder="Bien à vous, (facultatif)" />
              </div>
              <div className="champ">
                <label htmlFor="sig-ligne">Ligne libre</label>
                <input id="sig-ligne" value={edition.ligneLibre ?? ''} onChange={set('ligneLibre')} maxLength={160}
                  placeholder="Un slogan…" />
              </div>
              {/* LE TÉLÉPHONE (Camara, le 17/10/2026) : sa ligne, sous l'adresse mail. */}
              <div className="champ">
                <label htmlFor="sig-tel">Téléphone</label>
                <input id="sig-tel" type="tel" value={edition.telephone ?? ''} onChange={set('telephone')} maxLength={30}
                  placeholder="06 12 34 56 78 (facultatif)" />
              </div>

              <fieldset className="signatures__options">
                <legend>Afficher</legend>
                <label className="case"><input type="checkbox" checked={edition.afficherRole} onChange={set('afficherRole')} /> Le rôle</label>
                <label className="case"><input type="checkbox" checked={edition.afficherAdresse} onChange={set('afficherAdresse')} /> L’adresse mail</label>
                <label className="case"><input type="checkbox" checked={edition.afficherSite} onChange={set('afficherSite')} /> Le lien mimia.fr</label>
              </fieldset>

              <fieldset className="signatures__options">
                <legend>Couleur du nom</legend>
                <div className="signatures__couleurs">
                  {COULEURS.map((c) => (
                    <label
                      key={c.valeur}
                      className={`signatures__couleur${edition.couleur === c.valeur ? ' est-choisie' : ''}`}
                      style={{ '--pastille': c.valeur }}
                      title={c.nom}
                    >
                      <input type="radio" name="sig-couleur" value={c.valeur} checked={edition.couleur === c.valeur}
                        onChange={set('couleur')} aria-label={c.nom} />
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="case">
                <input type="checkbox" checked={edition.parDefaut} onChange={set('parDefaut')} />
                Modèle par défaut (pour qui n’en a pas reçu d’autre)
              </label>
            </div>

            <div className="signatures__apercu-zone">
              <span className="signatures__apercu-titre">Aperçu à votre nom</span>
              <Apercu html={apercuEdition} />
            </div>
          </div>

          <div className="modale__actions">
            <button type="button" className="btn-ghost" onClick={() => setEdition(null)}>Annuler</button>
            <button type="submit" className="btn btn--compact" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      <ul className="signatures__liste">
        {donnees.modeles.map((m) => (
          <li key={m.id} className="roles__carte">
            <div className="roles__tete">
              <strong className="roles__nom">{m.nom}</strong>
              {m.parDefaut && <span className="roles__badge roles__badge--acces">Par défaut</span>}
              <span className="roles__compte">{m.nombreComptes} compte{m.nombreComptes > 1 ? 's' : ''}</span>
            </div>
            <Apercu html={apercus[m.id]} />
            <div className="roles__actions">
              <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => setEdition({ ...m })}>Modifier</button>
              {donnees.modeles.length > 1 && (
                <button type="button" className="btn-ghost btn-ghost--mini btn-ghost--accent" onClick={() => supprimer(m)}>Supprimer</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="signatures__attribution">
        <h3>Qui signe avec quoi</h3>
        <p className="champ__aide">Les comptes qui ouvrent l’administration. « Par défaut » suit le modèle par défaut s’il change.</p>
        {/* SUR TÉLÉPHONE (18/10/2026) : chaque ligne devient une carte, les
            en-têtes de colonnes passent en libellés (`data-libelle`), et le
            bouton Aperçu reste visible. Sur ordinateur, le tableau ne change pas. */}
        <table className="signatures__table">
          <thead>
            <tr><th scope="col">Compte</th><th scope="col">Rôle</th><th scope="col">Boîte</th><th scope="col">Signature</th><th scope="col">Aperçu</th></tr>
          </thead>
          <tbody>
            {donnees.signataires.map((s) => (
              <tr key={s.parentId}>
                <td data-libelle="Compte">
                  <strong>{[s.prenom, s.nom].filter(Boolean).join(' ') || s.mail}</strong>
                  <span className="signatures__mail">{s.mail}</span>
                </td>
                <td data-libelle="Rôle">{s.role ?? '—'}</td>
                <td data-libelle="Boîte">{s.adresseBoite ?? <span className="signatures__non">non connectée</span>}</td>
                <td data-libelle="Signature">
                  <select value={s.signatureId ?? ''} onChange={(e) => attribuer(s.parentId, e.target.value)}
                    aria-label={`Signature de ${s.mail}`} className="role-parent">
                    <option value="">Par défaut{parDefaut ? ` (${parDefaut.nom})` : ''}</option>
                    {donnees.modeles.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
                  </select>
                </td>
                <td data-libelle="Aperçu" className="signatures__cellule-apercu">
                  <button type="button" className="btn-ghost btn-ghost--mini" onClick={() => voirSignature(s)}>
                    Aperçu
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* LA SIGNATURE D'UN COMPTE, TELLE QUE SES DESTINATAIRES LA VERRONT. */}
      {apercuCompte && (
        <div className="modale signatures-modale" onMouseDown={(e) => { if (e.target === e.currentTarget) setApercuCompte(null); }}>
          <div
            className="modale__boite signatures__fenetre"
            role="dialog"
            aria-modal="true"
            aria-label={`Signature de ${apercuCompte.qui.mail}`}
          >
            <header className="signatures__fenetre-tete">
              <div>
                <h3>Signature de {[apercuCompte.qui.prenom, apercuCompte.qui.nom].filter(Boolean).join(' ') || apercuCompte.qui.mail}</h3>
                <p>Telle que ses destinataires la verront.</p>
              </div>
              <button type="button" className="messagerie-grand__fermer" aria-label="Fermer" onClick={() => setApercuCompte(null)}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            {apercuCompte.html === null
              ? <p className="roles__attente">Un instant…</p>
              : <Apercu html={apercuCompte.html} grand />}
            <div className="signatures__fenetre-pied">
              <button type="button" className="btn btn--compact" onClick={() => setApercuCompte(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
