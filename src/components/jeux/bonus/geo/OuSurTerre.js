import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { useJeuOuvert } from '../../../../lib/jeux/contexteJeu';
import { phrasesDe } from '../../../../lib/jeux/voix/repliques';
import useVoixJeu from '../../../../lib/jeux/voix/useVoixJeu';
import { bruitage } from '../../../../lib/jeux/bruitages';
import { sessionEleve } from '../../../../lib/storage/sessionEleve';
import { rangDe } from '../../../../lib/jeux/bonus/reglages.js';
import * as ost from '../../../../lib/jeux/bonus/geo/ouSurTerre.js';
import { REGIONS, regionDe, region as regionParCle } from '../../../../lib/jeux/bonus/geo/regions.js';
import { tampons, tamponner } from '../../../../lib/jeux/bonus/geo/passeport.js';
import { IMAGES_HISTOIRE_GEO } from '../../../../lib/jeux/imagesHistoireGeo';
import { EnTeteBonus, FinBonus } from '../CadreBonus';
import BoutonsVoix from '../../BoutonsVoix';
import CarteMonde from './CarteMonde';
import {
  boiteDegres, boitePoints, unionBoites, chargerMonde, useMonde,
} from './monde';
import { Tampon, dureeDefiGeo, useChronoGeo } from './communs';
import portraitSalim from '../../../../assets/profs/p_histoire_geo.png';

const dire = phrasesDe('bonus-ou-sur-terre', ost);
const IMAGES = IMAGES_HISTOIRE_GEO['ou-sur-terre'];
const PAUSE_MONTRE = 1700;
const ZOOM_LOUPE = 2.6;

/** Où poser la pastille de chaque région sur la carte du monde, en degrés (écartées pour ne pas se chevaucher). */
const PASTILLES = {
  europe: [10, 54],
  afrique: [18, -6],
  'moyen-orient': [52, 25],
  asie: [100, 44],
  oceanie: [134, -26],
  'amerique-nord': [-100, 39],
  'amerique-sud': [-60, -14],
};

/**
 * LA LOUPE : promenée sur la preuve (souris ou doigt), elle grossit ce
 * qu'elle survole. Un bouton l'allume et l'éteint.
 */
function Loupe({ src, alt }) {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState(null);
  const zone = useRef(null);
  const viser = (e) => {
    if (!active) return;
    const r = zone.current?.getBoundingClientRect?.();
    if (!r || !r.width) return;
    setPos({
      x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height,
    });
  };
  const rayon = 72;
  return (
    <div className={`hg-ost__loupe${active ? ' est-active' : ''}`}>
      <div
        ref={zone}
        className="hg-ost__preuve-zone"
        onPointerMove={viser}
        onPointerDown={viser}
        onPointerLeave={() => setPos(null)}
      >
        <img className="hg-ost__preuve-image" src={src} alt={alt} />
        {active && pos && (
          <span
            className="hg-ost__verre"
            aria-hidden="true"
            style={{
              left: pos.x,
              top: pos.y,
              backgroundImage: `url(${src})`,
              backgroundSize: `${pos.w * ZOOM_LOUPE}px ${pos.h * ZOOM_LOUPE}px`,
              backgroundPosition: `${-(pos.x * ZOOM_LOUPE - rayon)}px ${-(pos.y * ZOOM_LOUPE - rayon)}px`,
            }}
          />
        )}
      </div>
      <button type="button" className="hg-ost__loupe-bouton" aria-pressed={active} onClick={() => { setActive((a) => !a); setPos(null); }}>
        <span aria-hidden="true">🔍</span>
        {active ? ' Ranger la loupe' : ' Loupe'}
      </button>
    </div>
  );
}

/** Le choix du niveau d'enquête, avec le passeport de l'enfant. */
function ChoixNiveau({ conseille, nbTampons, onChoisir }) {
  return (
    <div className="hg-ost__accueil">
      <ul className="hg-ost__niveaux" aria-label="Choisis ton niveau">
        {ost.NIVEAUX.map((n, i) => (
          <li key={n.cle}>
            <button
              type="button"
              className={`hg-ost__niveau hg-ost__niveau--${n.cle}${n.cle === conseille ? ' est-conseille' : ''}`}
              onClick={() => { bruitage('selection'); onChoisir(n.cle); }}
            >
              <span className="hg-ost__niveau-embleme" aria-hidden="true">{['🧭', '🔎', '🕵️'][i]}</span>
              <strong>{n.nom}</strong>
              <span className="hg-ost__niveau-etoiles" aria-hidden="true">{'★'.repeat(i + 1)}</span>
              <span>{n.detail}</span>
              {n.cle === conseille && <em>Conseillé pour ta classe</em>}
            </button>
          </li>
        ))}
      </ul>
      <p className="hg-ost__passeport-resume">
        <span aria-hidden="true">🛂 </span>
        {`Ton passeport : ${nbTampons} tampon${nbTampons > 1 ? 's' : ''} sur ${ost.LIEUX.length}.`}
      </p>
    </div>
  );
}

/** UNE PARTIE : cinq dossiers, au niveau choisi. Son chrono part au premier dossier. */
function Partie({ niveau, cleNiveau, onQuitter }) {
  const { mode, rejouerPartie } = useJeuOuvert();
  const monde = useMonde();
  const n = ost.niveauJeu(cleNiveau);
  const [graine] = useState(() => Date.now());
  const dossiers = useMemo(() => ost.serie(graine, niveau), [graine, niveau]);
  const [index, setIndex] = useState(0);
  const lieu = dossiers[index];
  const [etape, setEtape] = useState('region');
  const [ouvertes, setOuvertes] = useState(n.offertes);
  const [preuveVue, setPreuveVue] = useState(0);
  const [erreurs, setErreurs] = useState(0);
  const [erreursEtape, setErreursEtape] = useState(0);
  const [montre, setMontre] = useState(false);
  const [aideVue, setAideVue] = useState(false);
  const [regionChoisie, setRegionChoisie] = useState(null);
  const [flash, setFlash] = useState(null);
  const [villesFausses, setVillesFausses] = useState([]);
  const [message, setMessage] = useState(null);
  const [score, setScore] = useState(0);
  const [resolus, setResolus] = useState(0);
  const [gain, setGain] = useState(0);
  const [nouveauTampon, setNouveauTampon] = useState(false);
  const [fini, setFini] = useState(false);
  const minuteries = useRef([]);
  const plusTard = (f, ms) => { minuteries.current.push(setTimeout(f, ms)); };
  useEffect(() => () => minuteries.current.forEach(clearTimeout), []);

  const compte = { trouves: resolus, total: dossiers.length, unite: 'dossier résolu' };
  const chrono = useChronoGeo('ou-sur-terre', niveau, fini, compte, dureeDefiGeo('ou-sur-terre', niveau));
  const voix = useVoixJeu('HISTOIRE_GEO');
  const consigne = dire('consigne');
  const nomsVilles = rangDe(niveau) <= 5;

  useEffect(() => { voix.dire(consigne); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (fini) voix.dire(dire('bravo')); }, [fini]); // eslint-disable-line react-hooks/exhaustive-deps

  const annoncer = (cle, ton = 'info', texte = null) => {
    const phrase = dire(cle);
    setMessage({ texte: texte ?? phrase.texte, ton, phrase });
    voix.dire(phrase);
  };

  const flasher = (f) => {
    setFlash(f);
    plusTard(() => setFlash(null), 900);
  };

  // --- Les étapes.
  const etapeSuivante = (suivante) => {
    setErreursEtape(0);
    setEtape(suivante);
  };

  const resoudre = (estMontre) => {
    const points = ost.pointsDuDossier({ preuvesOuvertes: ouvertes, erreurs, montre: estMontre }, cleNiveau);
    setGain(points);
    setScore((s) => s + points);
    setOuvertes(3);
    setPreuveVue(2);
    setEtape('resolu');
    if (!estMontre) {
      setResolus((r) => r + 1);
      setNouveauTampon(tamponner(sessionEleve()?.eleveId, lieu.id));
      bruitage('bonne');
    }
    const phrase = dire(`revele-${lieu.id}`);
    setMessage({ texte: phrase.texte, ton: estMontre ? 'info' : 'bon', phrase });
    voix.dire(phrase);
  };

  const faute = (cleMessage, montrer) => {
    bruitage('mauvaise');
    setErreurs((e) => e + 1);
    const essais = erreursEtape + 1;
    setErreursEtape(essais);
    if (essais >= ost.ESSAIS) {
      setMontre(true);
      annoncer('montre', 'faux');
      montrer();
      return;
    }
    annoncer(cleMessage, 'faux');
  };

  const toucherCarte = ({ pays }) => {
    if (etape === 'region') {
      if (!pays) { annoncer('mer'); return; }
      choisirRegion(regionDe(pays) ?? 'antarctique');
      return;
    }
    if (etape === 'pays') {
      if (!pays) { annoncer('mer'); return; }
      if (ost.jugerPays(lieu, pays)) {
        bruitage('bonne');
        annoncer('etape-ville', 'bon');
        etapeSuivante('ville');
        return;
      }
      flasher({ sorte: 'pays', code: pays });
      faute('pas-le-pays', () => plusTard(() => etapeSuivante('ville'), PAUSE_MONTRE));
    }
  };

  function choisirRegion(cle) {
    if (etape !== 'region') return;
    if (ost.jugerRegion(lieu, cle)) {
      bruitage('bonne');
      setRegionChoisie(cle);
      annoncer('etape-pays', 'bon');
      etapeSuivante('pays');
      return;
    }
    flasher({ sorte: 'region', cle });
    faute('pas-la-region', () => plusTard(() => {
      setRegionChoisie(lieu.regions[0]);
      etapeSuivante('pays');
    }, PAUSE_MONTRE));
  }

  const choisirVille = (ville) => {
    if (etape !== 'ville' || villesFausses.includes(ville.id)) return;
    if (ost.jugerVille(lieu, ville.id)) {
      resoudre(montre);
      return;
    }
    setVillesFausses((v) => [...v, ville.id]);
    faute('pas-la-ville', () => plusTard(() => resoudre(true), PAUSE_MONTRE));
  };

  const ouvrirPreuve = () => {
    if (ouvertes >= 3) return;
    bruitage('selection');
    setOuvertes((o) => o + 1);
    setPreuveVue(ouvertes);
    annoncer('preuve-ouverte');
  };

  const demanderAide = () => {
    if (aideVue) return;
    setAideVue(true);
    annoncer(`aide-${lieu.id}`, 'info');
  };

  const dossierSuivant = () => {
    if (index + 1 >= dossiers.length) {
      setFini(true);
      return;
    }
    setIndex((i) => i + 1);
    setEtape('region');
    setOuvertes(n.offertes);
    setPreuveVue(0);
    setErreurs(0);
    setErreursEtape(0);
    setMontre(false);
    setAideVue(false);
    setRegionChoisie(null);
    setVillesFausses([]);
    setNouveauTampon(false);
    annoncer('etape-region');
  };

  // --- La carte : ce qu'elle montre à chaque étape.
  const regionMontree = montre && etape === 'region' ? lieu.regions[0] : null;
  const classes = useMemo(() => {
    if (!monde) return null;
    const c = {};
    monde.pays.forEach((p) => {
      const liste = [];
      // Istanbul est en Europe ET au Moyen-Orient : la Turquie ne s'éteint pas quand on a choisi l'Europe.
      if (etape === 'pays' && regionChoisie && p.region !== regionChoisie && !lieu.regions.includes(p.region)) liste.push('est-pale');
      if ((etape === 'ville' || etape === 'resolu') && p.code !== lieu.pays) liste.push('est-pale');
      if ((etape === 'ville' || etape === 'resolu') && p.code === lieu.pays) liste.push('est-choisi');
      if (flash?.sorte === 'region' && p.region === flash.cle) liste.push('est-faux');
      if (flash?.sorte === 'pays' && p.code === flash.code) liste.push('est-faux');
      if (regionMontree && p.region === regionMontree) liste.push('est-montre');
      if (montre && etape === 'pays' && erreursEtape >= ost.ESSAIS && p.code === lieu.pays) liste.push('est-montre');
      if (liste.length) c[p.code] = liste.join(' ');
    });
    return c;
  }, [monde, etape, regionChoisie, lieu, flash, regionMontree, montre, erreursEtape]);

  const vue = useMemo(() => {
    if (!monde) return null;
    if (etape === 'pays' && regionChoisie) return { boite: boiteDegres(regionParCle(regionChoisie).boite) };
    if (etape === 'ville') {
      const pays = monde.pays_[lieu.pays];
      const villes = boitePoints(lieu.villes.map((v) => [v.lon, v.lat]), 1);
      return { boite: pays ? unionBoites(pays.boite, villes) : villes };
    }
    if (etape === 'resolu') return { boite: boitePoints([[lieu.lon, lieu.lat]], 6) };
    return null;
  }, [monde, etape, regionChoisie, lieu]);

  const montrerVille = etape === 'ville' && montre && erreursEtape >= ost.ESSAIS;
  const boutons = etape === 'ville' ? lieu.villes.map((v, i) => ({
    id: v.id,
    lon: v.lon,
    lat: v.lat,
    libelle: nomsVilles ? v.nom : `Ville ${i + 1}`,
    etiquette: nomsVilles ? v.nom : null,
    classe: `${villesFausses.includes(v.id) ? 'est-faux' : ''}${montrerVille && v.juste ? ' est-montre' : ''}`,
    desactive: villesFausses.includes(v.id),
    onClic: () => choisirVille(v),
  })) : [];
  const marques = etape === 'resolu' ? [{
    id: `epingle-${lieu.id}`, sorte: 'epingle', lon: lieu.lon, lat: lieu.lat, libelle: lieu.ville,
  }] : [];

  if (fini) {
    const nb = Object.keys(tampons(sessionEleve()?.eleveId)).length;
    return (
      <>
        <FinBonus
          jeu="bonus-ou-sur-terre"
          niveau={niveau}
          ecoule={chrono.ecoule}
          trouves={resolus}
          total={dossiers.length}
          unite="dossier résolu"
          onRejouer={() => rejouerPartie(mode)}
          onQuitter={onQuitter}
        />
        <div className="hg-ost__bilan">
          <p>
            <span aria-hidden="true">⭐ </span>
            {`${score} points — niveau ${n.nom}`}
          </p>
          <p>
            <span aria-hidden="true">🛂 </span>
            {`Ton passeport : ${nb} tampon${nb > 1 ? 's' : ''} sur ${ost.LIEUX.length}.`}
          </p>
        </div>
      </>
    );
  }

  const preuveCle = ost.PREUVES[preuveVue]?.cle ?? 'paysage';
  const enJeu = ost.pointsDuDossier({ preuvesOuvertes: ouvertes, erreurs, montre: false }, cleNiveau);
  // LA LIGNE DE SALIM, à la place de la consigne : une ligne, qui suit l'étape
  // (10/10/2026, Camara : « ça déborde » — la bulle sous le dossier poussait
  // la page sous le bas de l'écran). La révélation, plus longue, se lit sur la preuve.
  const resolu = etape === 'resolu';
  const revelation = dire(`revele-${lieu.id}`);
  const phraseEtape = resolu ? revelation : (message?.phrase ?? dire(`etape-${etape}`));
  const ligne = resolu
    ? (montre ? 'Dossier classé : 0 point, la carte a dû montrer la réponse.' : `Trouvé ! +${gain} points.${nouveauTampon ? ` ${dire('passeport').texte}` : ''}`)
    : (message?.texte ?? phraseEtape.texte);
  const ton = resolu ? (montre ? 'info' : 'bon') : (message?.ton ?? 'info');
  const pastilles = etape === 'region' ? REGIONS.filter((r) => r.cle !== 'antarctique').map((r) => ({
    id: r.cle,
    lon: PASTILLES[r.cle][0],
    lat: PASTILLES[r.cle][1],
    texte: r.nom,
    libelle: `Région : ${r.nom}`,
    classe: `${flash?.sorte === 'region' && flash.cle === r.cle ? 'est-faux' : ''}${regionMontree === r.cle ? ' est-montre' : ''}`,
    style: { '--hg-geo-region': r.couleur },
    onClic: () => choisirRegion(r.cle),
  })) : [];

  return (
    <div className="jeu bonus bonus--ou-sur-terre hg-ost">
      <EnTeteBonus titre="Où sur Terre ?" sousTitre={`Dossier ${index + 1} sur ${dossiers.length} · ${n.nom}`} chrono={chrono} onQuitter={onQuitter}>
        <p className="bonus__compte">
          <span aria-hidden="true">⭐</span>
          {` ${score}`}
        </p>
      </EnTeteBonus>
      <p className={`jeu__consigne hg-geo__consigne est-${ton}`}>
        <img className="hg-geo__salim-mini" src={portraitSalim} alt="" width="32" height="32" />
        <span>{ligne}</span>
        <BoutonsVoix voix={voix} consigne={phraseEtape} />
      </p>

      <div className="hg-ost__table">
        <section className="hg-ost__dossier" aria-label={`Dossier secret n° ${index + 1}`}>
          <div className="hg-ost__chemise">
            <p className="hg-ost__chemise-titre">
              <span>
                <span aria-hidden="true">🗂️ </span>
                {`Dossier n° ${index + 1}`}
              </span>
              {!resolu && <span className="hg-ost__en-jeu">{`${enJeu} points en jeu`}</span>}
            </p>
            <Loupe key={`${lieu.id}-${preuveCle}`} src={IMAGES[ost.cleImage(lieu, preuveCle)]} alt={`${ost.PREUVES[preuveVue].nom} : ${lieu.alts[preuveCle]}`} />
            {n.aide && !resolu && (
              <button type="button" className="hg-ost__aide" onClick={demanderAide} disabled={aideVue} aria-label={aideVue ? 'Aide utilisée' : 'Un indice de Salim'}>
                <span aria-hidden="true">💡</span>
                {aideVue ? ' Aide utilisée' : ' Indice'}
              </button>
            )}
            {resolu && (
              <>
                <Tampon texte={lieu.ville} sousTexte={montre ? 'Dossier classé' : 'Passeport'} couleur={montre ? 'bleu' : 'rouge'} />
                <div className="hg-ost__revelation">
                  <p>{revelation.texte}</p>
                  <button type="button" className="hg-geo__bouton hg-geo__bouton--suite" onClick={dossierSuivant}>
                    {index + 1 >= dossiers.length ? 'Voir mon bilan' : 'Dossier suivant →'}
                  </button>
                </div>
              </>
            )}
          </div>
          <ul className="hg-ost__preuves" aria-label="Les preuves">
            {ost.PREUVES.map((p, i) => {
              const ouverte = i < ouvertes;
              const cout = i >= n.offertes ? p.cout : 0;
              return (
                <li key={p.cle}>
                  {ouverte ? (
                    <button
                      type="button"
                      className={`hg-ost__vignette${i === preuveVue ? ' est-vue' : ''}`}
                      onClick={() => setPreuveVue(i)}
                      aria-pressed={i === preuveVue}
                    >
                      <img src={IMAGES[ost.cleImage(lieu, p.cle)]} alt="" />
                      <span>{p.nom}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="hg-ost__vignette est-fermee"
                      onClick={ouvrirPreuve}
                      disabled={i !== ouvertes || resolu}
                      aria-label={cout ? `Ouvrir ${p.nom.toLowerCase()} : moins ${cout} points` : `Ouvrir ${p.nom.toLowerCase()}`}
                    >
                      <span aria-hidden="true">{`🔒 ${p.nom}`}</span>
                      <small aria-hidden="true">{cout ? `−${cout} points` : 'Ouvrir'}</small>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="hg-ost__enquete" aria-label="La carte">
          <CarteMonde
            monde={monde}
            vue={vue}
            classes={classes}
            onClic={toucherCarte}
            boutons={boutons}
            pastilles={pastilles}
            marques={marques}
            desactive={etape === 'ville' || resolu}
            point={resolu ? [lieu.lon, lieu.lat] : null}
            etiquette={resolu ? `Carte du monde : ${lieu.ville}` : 'Carte du monde : touche la bonne région, puis le bon pays'}
            dessus={(
              <div className="hg-ost__etapes" aria-hidden="true">
                {ost.ETAPES.map((e, i) => (
                  <span key={e} className={`hg-ost__etape${etape === e ? ' est-active' : ''}${ost.ETAPES.indexOf(etape) > i || resolu ? ' est-faite' : ''}`}>
                    {['Région', 'Pays', 'Ville'][i]}
                  </span>
                ))}
              </div>
            )}
          />
          {etape === 'region' && (
            <ul className="hg-ost__legende" aria-label="Les régions du monde">
              {pastilles.map((p) => (
                <li key={p.id}>
                  <button type="button" className={`hg-ost__region ${p.classe}`} style={p.style} onClick={p.onClic}>
                    {p.texte}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="hg-geo__annonce" role="status">{resolu ? `${ligne} ${revelation.texte}` : (message?.texte ?? '')}</p>
    </div>
  );
}

/**
 * OÙ SUR TERRE ? — voir `lib/jeux/bonus/geo/ouSurTerre.js`. D'abord le
 * niveau (celui de la classe mis en avant), puis la partie, qui a son propre
 * chrono : le temps du choix ne compte pas dans le record.
 */
export default function OuSurTerre({ onQuitter, niveau = 'CP' }) {
  const [cleNiveau, setCleNiveau] = useState(null);
  const chrono = useChronoGeo('ou-sur-terre', niveau, Boolean(cleNiveau), { trouves: 0, total: ost.DOSSIERS, unite: 'dossier résolu' }, dureeDefiGeo('ou-sur-terre', niveau));
  const voix = useVoixJeu('HISTOIRE_GEO');
  const choix = dire('choix-niveau');
  const [nbTampons] = useState(() => Object.keys(tampons(sessionEleve()?.eleveId)).length);
  // La carte se télécharge pendant le choix : elle sera prête au premier dossier.
  useEffect(() => { chargerMonde().catch(() => {}); }, []);

  if (cleNiveau) return <Partie niveau={niveau} cleNiveau={cleNiveau} onQuitter={onQuitter} />;

  return (
    <div className="jeu bonus bonus--ou-sur-terre hg-ost">
      <EnTeteBonus titre="Où sur Terre ?" sousTitre="Choisis ton niveau d’enquête" chrono={chrono} onQuitter={onQuitter} />
      <p className="jeu__consigne">
        {choix.texte}
        <BoutonsVoix voix={voix} consigne={choix} />
      </p>
      <ChoixNiveau conseille={ost.niveauConseille(niveau)} nbTampons={nbTampons} onChoisir={setCleNiveau} />
    </div>
  );
}
