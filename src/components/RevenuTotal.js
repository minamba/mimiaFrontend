import { useEffect, useState } from 'react';
import { getRevenu } from '../lib/api/adminApi';

/** Des euros à la française : « 1 234,50 € ». */
export function enEuros(montant) {
  return (montant ?? 0).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

/**
 * Ce que le produit rapporte, sous ce qu'il coûte — voulu par Camara le
 * 19/09/2026 : « comme ça je pourrais voir au mois si je suis en bénéfice ou
 * totalement en perte ».
 *
 * LA MÊME FENÊTRE QUE LE COÛT, et elle n'a pas ses propres boutons : deux
 * jeux de chevrons finiraient par montrer un coût d'août en face d'un revenu
 * de septembre. Ce bloc lit la période choisie au-dessus.
 *
 * AU MOIS ET À L'ANNÉE SEULEMENT. Un abonnement se paie au mois ou à l'année ;
 * au jour, le bloc le dit au lieu d'inventer un chiffre.
 *
 * LES ANNUELS SONT DIVISÉS PAR DOUZE, ET ÇA SE VOIT : le nombre d'abonnements
 * annuels ajoutés et la division sont écrits en toutes lettres, pour qu'on
 * sache toujours que ce chiffre est un étalement et non un encaissement.
 *
 * @param coutEuros ce que le produit a coûté sur la même période, en euros ;
 *                  null tant qu'il n'est pas connu.
 * @param visible   faux pour un administrateur sans le droit « revenu » : le
 *                  bloc est caché, pas retiré.
 * @param entete    le choix de la période, quand le bloc du coût est caché.
 * @param afficherResultat faux sans le droit « cout » : le bénéfice ou la
 *                  perte, et le coût écrit dessous, laisseraient lire ce que
 *                  le bloc caché ne montre pas.
 */
export default function RevenuTotal({
  periode, decalage, coutEuros, visible = true, entete = null, afficherResultat = true,
}) {
  const [revenu, setRevenu] = useState(null);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;
    setErreur(null);

    getRevenu(periode, decalage)
      .then(({ data }) => { if (vivant) setRevenu(data); })
      .catch(() => { if (vivant) setErreur("Le revenu n'a pas pu être calculé."); });

    return () => { vivant = false; };
  }, [periode, decalage]);

  const surLAnnee = periode === 'annee';
  const libelleMois = surLAnnee ? "de l'année" : 'du mois';

  const mensuels = (revenu?.lignes ?? []).filter((l) => l.periodicite === 'Mensuel');
  const annuels = (revenu?.lignes ?? []).filter((l) => l.periodicite === 'Annuel');

  const total = revenu?.totalEuros ?? 0;
  const resultat = coutEuros === null || coutEuros === undefined ? null : total - coutEuros;

  return (
    <section className="cout-total revenu-total" aria-label="Ce que le produit me rapporte" hidden={!visible}>
      {entete}

      <h3 className="cout-total__titre">Ce que le produit me rapporte</h3>

      {erreur && <div className="alert">{erreur}</div>}

      {!erreur && revenu && !revenu.disponible && (
        <p className="revenu-total__indisponible">
          Les abonnements se paient au mois ou à l'année : choisissez <strong>Mois</strong> ou
          <strong> Année</strong> pour voir ce que le produit rapporte, et le bénéfice ou la perte.
        </p>
      )}

      {!erreur && revenu?.disponible && (
        <>
          <div className="cout-total__corps">
            <div className="cout-total__montant revenu-total__montant">
              <span>{enEuros(total)}</span>
            </div>

            <div className="cout-total__groupes">
              <section className="cout-bulle">
                <header className="cout-bulle__entete">
                  <div className="cout-bulle__nom">
                    Abonnements mensuels
                    <small>
                      {revenu.mensualites} échéance{revenu.mensualites > 1 ? 's' : ''} prélevée
                      {revenu.mensualites > 1 ? 's' : ''} sur la période
                    </small>
                  </div>
                  <strong className="cout-bulle__somme revenu-bulle__somme">
                    {enEuros(revenu.mensuelsEuros)}
                  </strong>
                </header>

                <ul className="cout-bulle__lignes">
                  {mensuels.length === 0 && (
                    <li className="cout-bulle__vide">Aucune échéance mensuelle sur la période.</li>
                  )}
                  {mensuels.map((l) => (
                    <li key={`m-${l.code}`}>
                      <span>
                        {l.libelle ?? l.code}
                        <small>
                          {l.nombre} × {enEuros(l.prixCentimes / 100)}
                          {' · '}{l.abonnements} famille{l.abonnements > 1 ? 's' : ''}
                        </small>
                      </span>
                      <strong>{enEuros(l.euros)}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="cout-bulle">
                <header className="cout-bulle__entete">
                  <div className="cout-bulle__nom">
                    Abonnements annuels
                    <small>
                      {revenu.annuelsAbonnements} abonnement{revenu.annuelsAbonnements > 1 ? 's' : ''} annuel
                      {revenu.annuelsAbonnements > 1 ? 's' : ''} ajouté{revenu.annuelsAbonnements > 1 ? 's' : ''} au
                      calcul — prix annuel divisé par 12
                      {surLAnnee ? `, compté pour ${revenu.annuelsMois} mois` : ''}
                    </small>
                  </div>
                  <strong className="cout-bulle__somme revenu-bulle__somme">
                    {enEuros(revenu.annuelsEuros)}
                  </strong>
                </header>

                <ul className="cout-bulle__lignes">
                  {annuels.length === 0 && (
                    <li className="cout-bulle__vide">Aucun abonnement annuel sur la période.</li>
                  )}
                  {annuels.map((l) => (
                    <li key={`a-${l.code}`}>
                      <span>
                        {l.libelle ?? l.code}
                        <small>
                          {enEuros(l.prixCentimes / 100)} ÷ 12 = {enEuros(l.prixCentimes / 1200)} par mois
                          {' · '}{l.abonnements} famille{l.abonnements > 1 ? 's' : ''}
                          {surLAnnee ? ` · ${l.nombre} mois` : ''}
                        </small>
                      </span>
                      <strong>{enEuros(l.euros)}</strong>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="cout-bulle">
                <header className="cout-bulle__entete">
                  <div className="cout-bulle__nom">
                    Packs d'heures
                    <small>achetés sur la période, remboursés exclus</small>
                  </div>
                  <strong className="cout-bulle__somme revenu-bulle__somme">
                    {enEuros(revenu.packsEuros)}
                  </strong>
                </header>

                <ul className="cout-bulle__lignes">
                  <li>
                    <span>{revenu.packs} pack{revenu.packs > 1 ? 's' : ''} vendu{revenu.packs > 1 ? 's' : ''}</span>
                    <strong>{enEuros(revenu.packsEuros)}</strong>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          {/* LE CHIFFRE QUI RÉPOND À LA QUESTION : bénéfice ou perte. Le coût
              est celui du bloc du dessus, frais de fond compris, converti en
              euros au même taux. */}
          {afficherResultat && resultat !== null && (
            <div className={`revenu-total__resultat ${resultat >= 0 ? 'revenu-total__resultat--benefice' : 'revenu-total__resultat--perte'}`}>
              <span className="revenu-total__resultat-libelle">
                {resultat >= 0 ? `Bénéfice ${libelleMois}` : `Perte ${libelleMois}`}
              </span>
              <strong className="revenu-total__resultat-valeur">
                {resultat >= 0 ? '+' : '−'}{enEuros(Math.abs(resultat))}
              </strong>
              <span className="revenu-total__resultat-note">
                {enEuros(total)} rapportés − {enEuros(coutEuros)} coûtés.
                Prix TTC du catalogue, avant frais Stripe et TVA.
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}
