import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../../lib/jeux/bruitages';
import * as enq from '../../../../lib/jeux/bonus/geo/enquete.js';
import { IMAGES_HISTOIRE_GEO } from '../../../../lib/jeux/imagesHistoireGeo';
import { EnTeteBonus, FinBonus } from '../CadreBonus';
import BoutonsVoix from '../../BoutonsVoix';
import CarteMonde from './CarteMonde';
import {
  BOITE_FRANCE, boiteDegres, chargerMonde, useMonde,
} from './monde';
import {
  Boussole, BulleSalim, dureeDefiGeo, useChronoGeo,
} from './communs';

const dire = phrasesDe('bonus-enquete-carte', enq);
const IMAGES = IMAGES_HISTOIRE_GEO['enquete-carte'];

/**
 * LE ZOOM QUI SE RESSERRE : autour du dernier clic, assez large pour
 * contenir le lieu — plus le clic est proche, plus la carte zoome. Le lieu
 * n'est jamais au centre : la carte aide, elle ne répond pas.
 */
function boiteAutour([lon, lat], km, carte) {
  const min = carte === 'france' ? 1.2 : 7;
  const max = carte === 'france' ? 6 : 70;
  const dLat = Math.min(max, Math.max(min, (km / 111) * 1.35));
  const dLon = Math.min(170, dLat / Math.max(0.25, Math.cos((lat * Math.PI) / 180)));
  return boiteDegres([
    [Math.max(-180, lon - dLon), Math.max(-85, lat - dLat)],
    [Math.min(180, lon + dLon), Math.min(85, lat + dLat)],
  ]);
}

/** Le choix de l'enquête : trois cartes illustrées. */
function ChoixEnquete({ onChoisir }) {
  return (
    <ul className="hg-enquete__choix" aria-label="Choisis ton enquête">
      {enq.ENQUETES.map((e) => (
        <li key={e.cle}>
          <button type="button" className={`hg-enquete__carte-choix hg-enquete__carte-choix--${e.cle}`} onClick={() => { bruitage('selection'); onChoisir(e.cle); }}>
            <img src={IMAGES[e.image]} alt="" />
            <strong>{e.titre}</strong>
            <span>{e.carte === 'france' ? 'Sur la carte de France' : 'Sur la carte du monde'}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Partie({ niveau, cleEnquete, onQuitter }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const monde = useMonde();
  const e = enq.enquete(cleEnquete);
  const { carte } = e;
  const [graine] = useState(() => Date.now());
  const lieux = useMemo(() => enq.serie(graine, cleEnquete), [graine, cleEnquete]);
  const [index, setIndex] = useState(0);
  const lieu = lieux[index];
  const [indicesVus, setIndicesVus] = useState(1);
  const [manques, setManques] = useState(0);
  const [clics, setClics] = useState([]);
  const [verdict, setVerdict] = useState(null);
  const [etat, setEtat] = useState('cherche');
  const [vue, setVue] = useState(carte === 'france' ? { boite: boiteDegres(BOITE_FRANCE) } : null);
  const [score, setScore] = useState(0);
  const [trouves, setTrouves] = useState(0);
  const [gain, setGain] = useState(0);
  const [annonce, setAnnonce] = useState('');
  const [fini, setFini] = useState(false);
  const vueDeDepart = useRef(vue);

  const compte = { trouves, total: lieux.length, unite: 'lieu trouvé' };
  const chrono = useChronoGeo('enquete-carte', niveau, fini, compte, dureeDefiGeo('enquete-carte', niveau));
  const voix = useVoixJeu('HISTOIRE_GEO');
  const consigne = dire('consigne');
  const indice = (i) => dire(`indice-${lieu.id}-${i}`);

  // Au début de chaque lieu, Salim lit le premier indice.
  useEffect(() => { voix.dire(index === 0 ? [consigne, indice(1)] : indice(1)); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const conclure = (estTrouve, point) => {
    const points = enq.pointsDuLieu(manques, !estTrouve);
    setGain(points);
    setScore((s) => s + points);
    if (estTrouve) {
      setTrouves((t) => t + 1);
      bruitage('bonne');
    }
    setEtat(estTrouve ? 'trouve' : 'montre');
    const revele = dire(`revele-${lieu.id}`);
    setAnnonce(estTrouve ? `Trouvé ! ${revele.texte}` : `${dire('montre').texte} ${revele.texte}`);
    voix.dire(estTrouve ? revele : [dire('montre'), revele]);
    const zoom = carte === 'france' ? 1.2 : 6;
    setVue({
      boite: boiteDegres([[lieu.lon - zoom * 1.4, lieu.lat - zoom], [lieu.lon + zoom * 1.4, lieu.lat + zoom]]),
      point,
    });
  };

  const toucher = ({ lon, lat }) => {
    if (etat !== 'cherche') return;
    const point = [lon, lat];
    const v = enq.verdict(point, lieu, { carte, niveau });
    setClics((c) => [...c, { id: `${lieu.id}-${c.length}`, lon, lat, temperature: v.trouve ? 'trouve' : v.temperature }]);
    setVerdict(v);
    if (v.trouve) {
      conclure(true, point);
      return;
    }
    bruitage('mauvaise');
    const n = manques + 1;
    setManques(n);
    if (n >= enq.ESSAIS_MAX) {
      conclure(false, point);
      return;
    }
    const temp = dire(v.temperature);
    if (indicesVus < enq.INDICES) {
      const suivant = indicesVus + 1;
      setIndicesVus(suivant);
      setAnnonce(`${temp.texte} ${indice(suivant).texte}`);
      voix.dire([temp, indice(suivant)]);
    } else {
      setAnnonce(temp.texte);
      voix.dire(temp);
    }
    setVue({ boite: boiteAutour(point, v.km, carte) });
  };

  const lieuSuivant = () => {
    if (index + 1 >= lieux.length) {
      setFini(true);
      return;
    }
    setIndex((i) => i + 1);
    setIndicesVus(1);
    setManques(0);
    setClics([]);
    setVerdict(null);
    setEtat('cherche');
    setAnnonce('');
    setVue(vueDeDepart.current);
  };

  if (fini) {
    return (
      <>
        <FinBonus
          jeu="bonus-enquete-carte"
          niveau={niveau}
          ecoule={chrono.ecoule}
          trouves={trouves}
          total={lieux.length}
          unite="lieu trouvé"
          onRejouer={() => rejouerPartie(mode)}
          onQuitter={onQuitter}
        />
        <div className="hg-ost__bilan">
          <p>
            <span aria-hidden="true">⭐ </span>
            {`${score} points — ${e.titre}`}
          </p>
        </div>
      </>
    );
  }

  const cherche = etat === 'cherche';
  const dernier = clics[clics.length - 1];
  const marques = [
    ...clics.map((c) => ({
      id: c.id, sorte: 'clic', lon: c.lon, lat: c.lat, classe: `est-${c.temperature}`,
    })),
    ...(!cherche ? [{
      id: `lieu-${lieu.id}`, sorte: 'epingle', lon: lieu.lon, lat: lieu.lat, libelle: lieu.nom,
    }] : []),
  ];
  const villes = carte === 'france' ? [...e.lieux, ...enq.AUTRES_VILLES_DE_FRANCE] : [];
  const noms = enq.nomsDesVilles(niveau);
  const boutons = villes.map((v, i) => ({
    id: v.id,
    lon: v.lon,
    lat: v.lat,
    libelle: noms ? v.nom : `Ville ${i + 1}`,
    etiquette: noms ? v.nom : null,
    classe: 'est-petit',
    desactive: !cherche,
    onClic: () => toucher({ lon: v.lon, lat: v.lat }),
  }));

  return (
    <div className="jeu bonus bonus--enquete-carte hg-enquete">
      {/* Le son du lieu ne part qu'à la révélation : avant, des mouettes souffleraient « Marseille ». */}
      <EnTeteBonus titre="Enquête sur la carte" sousTitre={`${e.titre} · lieu ${index + 1} sur ${lieux.length}`} chrono={chrono} onQuitter={onQuitter} ambiance={etat === 'cherche' ? null : lieu.id}>
        <p className="bonus__compte">
          <span aria-hidden="true">⭐</span>
          {` ${score}`}
        </p>
      </EnTeteBonus>
      <p className="jeu__consigne">
        {consigne.texte}
        <BoutonsVoix voix={voix} consigne={consigne} />
      </p>

      <div className="hg-enquete__table">
        <section className="hg-enquete__indices" aria-label={cherche ? 'Les indices' : 'Le lieu dévoilé'}>
          {cherche ? (
            <>
              <BulleSalim
                titre={`Indice ${indicesVus} sur ${enq.INDICES}`}
                texte={indice(indicesVus).texte}
                voix={voix}
                phrase={indice(indicesVus)}
              />
              {indicesVus > 1 && (
                <ol className="hg-enquete__deja">
                  {Array.from({ length: indicesVus - 1 }, (_, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i}>{indice(i + 1).texte}</li>
                  ))}
                </ol>
              )}
              <Boussole verdict={verdict} essais={`Essais : ${manques} sur ${enq.ESSAIS_MAX}`} />
            </>
          ) : (
            <div className={`hg-enquete__revelation est-${etat}`}>
              <img src={IMAGES[lieu.id]} alt={lieu.nom} className="hg-enquete__revelation-image" />
              <div className="hg-enquete__revelation-texte">
                <p className="hg-enquete__revelation-titre">
                  {etat === 'trouve' ? `Trouvé ! +${gain} points` : 'C’était ici !'}
                </p>
                <h3>{lieu.nom}</h3>
                <p>{lieu.revele}</p>
                <button type="button" className="hg-geo__bouton hg-geo__bouton--suite" onClick={lieuSuivant}>
                  {index + 1 >= lieux.length ? 'Voir mon bilan' : 'Lieu suivant →'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="hg-enquete__carte" aria-label="La carte">
          <CarteMonde
            monde={monde}
            vue={vue}
            onClic={toucher}
            marques={marques}
            boutons={boutons}
            ligne={!cherche && dernier && etat === 'montre' ? { de: [dernier.lon, dernier.lat], vers: [lieu.lon, lieu.lat] } : null}
            desactive={!cherche}
            point={cherche ? null : [lieu.lon, lieu.lat]}
            etiquette={carte === 'france' ? 'Carte de France : touche la ville que tu cherches' : 'Carte du monde : touche le lieu que tu cherches'}
          />
        </section>
      </div>
      <p className="hg-geo__annonce" role="status">{annonce}</p>
    </div>
  );
}

/**
 * ENQUÊTE SUR LA CARTE — voir `lib/jeux/bonus/geo/enquete.js`. D'abord
 * l'enquête, puis la partie, avec son propre chrono.
 */
export default function EnqueteCarte({ onQuitter, niveau = 'CP' }) {
  const [cle, setCle] = useState(null);
  const chrono = useChronoGeo('enquete-carte', niveau, Boolean(cle), { trouves: 0, total: enq.LIEUX_PAR_PARTIE, unite: 'lieu trouvé' }, dureeDefiGeo('enquete-carte', niveau));
  const voix = useVoixJeu('HISTOIRE_GEO');
  const choix = dire('choix-enquete');
  // La carte se télécharge pendant le choix : elle sera prête au premier dossier.
  useEffect(() => { chargerMonde().catch(() => {}); }, []);

  if (cle) return <Partie niveau={niveau} cleEnquete={cle} onQuitter={onQuitter} />;

  return (
    <div className="jeu bonus bonus--enquete-carte hg-enquete">
      <EnTeteBonus titre="Enquête sur la carte" sousTitre="Choisis ton enquête" chrono={chrono} onQuitter={onQuitter} />
      <p className="jeu__consigne">
        {choix.texte}
        <BoutonsVoix voix={voix} consigne={choix} />
      </p>
      <ChoixEnquete onChoisir={setCle} />
    </div>
  );
}
