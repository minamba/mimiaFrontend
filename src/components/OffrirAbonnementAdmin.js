import { useEffect, useState } from 'react';
import { getOffres } from '../lib/api/abonnementApi';
import { offrirAbonnement } from '../lib/api/adminApi';

/**
 * OFFRIR UN ABONNEMENT À UN PARENT — Camara, le 13/11/2026 : « je voudrais pouvoir offrir un abonnement, associer un
 * abonnement à un parent sans le faire payer ». Choix validés : la durée se choisit à chaque fois (ou sans fin) ;
 * refusé si le parent a un abonnement payant en cours (le serveur le dit) ; le courriel ne part que si la case est
 * cochée. Le motif est obligatoire, comme pour les heures : six mois plus tard, il dit pourquoi.
 */
export const DUREES_OFFERTES = [
  { valeur: '1', libelle: '1 mois' },
  { valeur: '3', libelle: '3 mois' },
  { valeur: '6', libelle: '6 mois' },
  { valeur: '12', libelle: '1 an' },
  { valeur: '', libelle: 'Sans fin (jusqu’à ce que je l’arrête)' },
];

function messageDErreur(ex) {
  const corps = ex?.response?.data;
  if (corps?.message) return corps.message;
  const champs = corps?.errors ? Object.values(corps.errors).flat().filter(Boolean) : [];
  if (champs.length > 0) return champs.join(' ');
  if (!ex?.response) return 'Le serveur ne répond pas. Vérifiez votre connexion et réessayez.';
  return 'L’abonnement n’a pas pu être offert. Réessayez.';
}

export default function OffrirAbonnementAdmin({ parent, onFermer, onOffert }) {
  const [offres, setOffres] = useState(null);
  const [codeOffre, setCodeOffre] = useState('');
  const [duree, setDuree] = useState('1');
  const [motif, setMotif] = useState('');
  const [prevenir, setPrevenir] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;
    getOffres()
      .then(({ data }) => {
        if (!vivant) return;
        // La route répond `{ formules, recharges }` (comme pour Tarifs.js), pas une liste nue.
        const payantes = (data?.formules ?? []).filter((o) => !o.estEssai);
        setOffres(payantes);
        if (payantes[0]) setCodeOffre(payantes[0].code);
      })
      .catch(() => { if (vivant) setOffres([]); });
    return () => { vivant = false; };
  }, []);

  const nomParent = [parent?.prenom, parent?.nom].filter(Boolean).join(' ') || parent?.mail;

  const valider = async (evenement) => {
    evenement.preventDefault();
    if (!codeOffre || !motif.trim()) return;
    setEnvoi(true);
    setErreur(null);
    try {
      await offrirAbonnement(parent.id, {
        codeOffre,
        mois: duree ? Number(duree) : null,
        motif: motif.trim(),
        prevenirLeParent: prevenir,
      });
      onOffert?.();
      onFermer?.();
    } catch (ex) {
      setErreur(messageDErreur(ex));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="modale" role="dialog" aria-modal="true" aria-labelledby="offrir-abonnement-titre">
      <form className="modale__boite" onSubmit={valider}>
        <h2 id="offrir-abonnement-titre">Offrir un abonnement</h2>

        <div className="modale__corps">
          <p className="modale__texte">
            À <strong>{nomParent}</strong>, sans paiement. Les heures de la formule se renouvellent chaque mois, et
            l’abonnement s’arrête seul à la fin de la durée choisie.
          </p>

          <div className="champ">
            <label htmlFor="offrir-formule">Formule</label>
            {offres === null ? (
              <p className="champ__aide">Chargement des formules…</p>
            ) : offres.length === 0 ? (
              <p className="champ__aide">Aucune formule n’a pu être chargée. Fermez et réessayez.</p>
            ) : (
              <select id="offrir-formule" value={codeOffre} onChange={(e) => setCodeOffre(e.target.value)} required>
                {offres.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.libelle} — {o.nombreEnfantsMax} enfant{o.nombreEnfantsMax > 1 ? 's' : ''}, {o.heuresPot} h / mois
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="champ">
            <label htmlFor="offrir-duree">Durée</label>
            <select id="offrir-duree" value={duree} onChange={(e) => setDuree(e.target.value)}>
              {DUREES_OFFERTES.map((d) => <option key={d.libelle} value={d.valeur}>{d.libelle}</option>)}
            </select>
          </div>

          <div className="champ">
            <label htmlFor="offrir-motif">Motif (obligatoire)</label>
            <textarea
              id="offrir-motif"
              rows={3}
              maxLength={500}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex. : partenariat avec l’école, geste commercial, ambassadeur…"
              required
            />
            <span className="champ__aide">
              {prevenir ? 'Le parent lira ce motif dans le courriel : écrivez-le pour lui.' : 'Gardé pour l’historique.'}
            </span>
          </div>

          <label className="champ case-offrir">
            <input type="checkbox" checked={prevenir} onChange={(e) => setPrevenir(e.target.checked)} />
            {' '}Prévenir le parent par courriel
          </label>

          {erreur && <div className="alert" role="alert">{erreur}</div>}
        </div>

        <div className="modale__actions">
          <button type="button" className="btn btn--fantome" onClick={onFermer} disabled={envoi}>Annuler</button>
          <button type="submit" className="btn" disabled={envoi || !codeOffre || !motif.trim()}>
            {envoi ? 'Envoi…' : 'Offrir'}
          </button>
        </div>
      </form>
    </div>
  );
}
