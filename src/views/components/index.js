import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Navbar,
  Accueil,
  Callback,
  ListeEleves,
  FormulaireEleve,
  GrilleMatieres,
  Chat,
  Fiches,
  Fiche,
  Evaluations,
  PageEleve,
  Admin,
  MonProfil,
  Tarifs,
  Contact,
  MentionsLegales,
  Confidentialite,
  ConditionsVente,
  TousLesAvis,
  Footer,
  RouteProtegee,
  VerrouEleve,
  VerrouMaintenance,
  EntreeEleve,
  BandeauInfo,
} from '../../components';
import { initAuth } from '../../lib/actions/authActions';
import { authService } from '../../lib/storage/authService';

/**
 * Page servie dans l'iframe de renouvellement silencieux du jeton.
 * Ne rend rien : elle transmet le résultat à la fenêtre parente.
 */
function SilentRenew() {
  useEffect(() => {
    authService.completeSilentRenew().catch(() => {});
  }, []);

  return null;
}

export const BaseApp = () => {
  const dispatch = useDispatch();

  // Restaure la session avant tout rendu de route protégée.
  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      {/* LE RIDEAU ENVELOPPE TOUT, BARRE ET PIED DE PAGE COMPRIS.

          Le placer plus bas laisserait la navigation autour de la page
          d'attente : un visiteur cliquerait « Tarifs » et retomberait sur la
          même page, ce qui se lit comme un site cassé plutôt qu'un site en
          travaux. */}
      <VerrouMaintenance>
      {/* AU-DESSUS DE LA BARRE, ET DANS LE FLUX.

          Au-dessus, parce qu'un avis de service passe avant la navigation :
          savoir que le site ferme à 8h change ce qu'on vient y faire. Dans le
          flux et non fixé, parce que la barre est déjà collante — deux
          bandeaux superposés en permanence, c'est un tiers d'écran de
          téléphone perdu pour une phrase déjà lue. */}
      <BandeauInfo />
      <Navbar />
      {/* Le verrou enveloppe TOUTES les routes, y compris les publiques : un
          enfant qui atterrit sur la page des tarifs doit revenir à ses cours,
          pas y rester. */}
      <VerrouEleve>
      <main className="conteneur">
        <Routes>
          <Route path="/" element={<Accueil />} />

          {/* Publique : demander de créer un compte pour connaître le prix
              fait fuir avant même la première page. */}
          <Route path="/tarifs" element={<Tarifs />} />

          {/* Publique elle aussi : ceux qui ont le plus besoin d écrire sont
              souvent ceux qui n arrivent pas à entrer. */}
          <Route path="/contact" element={<Contact />} />

          {/* Obligatoires, et toujours accessibles sans compte. */}
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgv" element={<ConditionsVente />} />

          {/* PUBLIQUE, comme la page d'accueil dont elle est le
              prolongement : un visiteur qui hésite est exactement celui
              qui vient lire les avis. */}
          <Route path="/avis" element={<TousLesAvis />} />

          {/* Publique, comme la connexion d'un parent : c'est la porte des enfants. */}
          <Route path="/code" element={<EntreeEleve />} />

          <Route path="/callback" element={<Callback />} />
          <Route path="/silent-renew" element={<SilentRenew />} />

          <Route
            path="/eleves"
            element={
              <RouteProtegee>
                <ListeEleves />
              </RouteProtegee>
            }
          />
          <Route
            path="/eleves/nouveau"
            element={
              <RouteProtegee>
                <FormulaireEleve />
              </RouteProtegee>
            }
          />
          <Route
            path="/eleves/:eleveId/matieres"
            element={
              <RouteProtegee>
                <GrilleMatieres />
              </RouteProtegee>
            }
          />
          <Route
            path="/eleves/:eleveId/matieres/:matiereId/chat"
            element={
              <RouteProtegee>
                <Chat />
              </RouteProtegee>
            }
          />

          {/* La fiche d'un enfant a sa propre adresse : elle porte trop
              d'informations pour une fenêtre, et un parent doit pouvoir y
              revenir directement. */}
          <Route
            path="/eleves/:eleveId/fiche"
            element={
              <RouteProtegee>
                <PageEleve />
              </RouteProtegee>
            }
          />

          {/* Les fiches sont rangées par matière — c'est la matière qu'on a en
              tête quand on va réviser — mais une fiche donnée a son adresse à
              elle, sous l'élève : elle se partage et se met en favori. */}
          <Route
            path="/eleves/:eleveId/matieres/:matiereId/fiches"
            element={
              <RouteProtegee>
                <Fiches />
              </RouteProtegee>
            }
          />
          {/* Les évaluations suivent le même rangement que les fiches : par
              matière, parce que c'est la matière qu'on a en tête quand on veut
              revoir ce qu'on a raté. */}
          <Route
            path="/eleves/:eleveId/matieres/:matiereId/evaluations"
            element={
              <RouteProtegee>
                <Evaluations />
              </RouteProtegee>
            }
          />

          <Route
            path="/eleves/:eleveId/fiches/:ficheId"
            element={
              <RouteProtegee>
                <Fiche />
              </RouteProtegee>
            }
          />

          <Route
            path="/profil"
            element={
              <RouteProtegee>
                <MonProfil />
              </RouteProtegee>
            }
          />

          <Route
            path="/admin"
            element={
              <RouteProtegee admin>
                <Admin />
              </RouteProtegee>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </VerrouEleve>
      <Footer />
      </VerrouMaintenance>
    </BrowserRouter>
  );
};

export default BaseApp;
