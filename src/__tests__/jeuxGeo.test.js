/**
 * « CAP SUR LE MONDE » — les trois jeux bonus de géographie (10/10/2026) :
 * « Où sur Terre ? », « Enquête sur la carte », « Le grand jeu de géo ».
 * D'abord les données (chaque lieu dans son pays, chaque distance écrite
 * dans un indice recalculée), puis les moteurs, puis les écrans.
 */
import {
  act, fireEvent, render, screen,
} from '@testing-library/react';
import { geoContains } from 'd3-geo';
import { feature } from 'topojson-client';
import monde from '../lib/jeux/bonus/geo/monde.json';
import * as ost from '../lib/jeux/bonus/geo/ouSurTerre.js';
import * as enq from '../lib/jeux/bonus/geo/enquete.js';
import * as gjg from '../lib/jeux/bonus/geo/grandJeu.js';
import {
  REGIONS, regionDe, continentDuClic, paysDeLaRegion,
} from '../lib/jeux/bonus/geo/regions.js';
import {
  cap, direction, distanceKm, enDegres, enKm, temperature,
} from '../lib/jeux/bonus/geo/geodesie.js';
import { tampons, tamponner } from '../lib/jeux/bonus/geo/passeport.js';
import { IMAGES_HISTOIRE_GEO } from '../lib/jeux/imagesHistoireGeo';
import { ECRANS_BONUS } from '../components/jeux/bonus';
import { ECRANS, APERCUS } from '../components/jeux/bonus/geo';
import { chargerMonde } from '../components/jeux/bonus/geo/monde';
import { FournirJeu } from '../lib/jeux/contexteJeu';
import { TRANQUILLE } from '../lib/jeux/coeurs';

const ANNEES = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'SIXIEME', 'CINQUIEME', 'QUATRIEME', 'TROISIEME', 'SECONDE', 'PREMIERE', 'TERMINALE'];
const GRAINES = Array.from({ length: 20 }, (_, i) => i * 7919 + 11);

const PAYS = feature(monde, monde.objects.countries).features;
const CODES = new Set(PAYS.map((f) => String(f.id)));

/**
 * Le point est-il dans le pays ? Les villes du bord de mer (Venise, Rio, Le
 * Cap…) tombent parfois dans l'eau d'une carte simplifiée : on accepte un
 * point à moins de 25 km de la côte.
 */
function dansLePays(code, lon, lat) {
  const formes = PAYS.filter((f) => String(f.id) === code);
  const essais = [[lon, lat]];
  [10, 25].forEach((km) => {
    for (let a = 0; a < 360; a += 45) {
      const r = (a * Math.PI) / 180;
      essais.push([lon + ((km / 111) * Math.sin(r)) / Math.cos((lat * Math.PI) / 180), lat + (km / 111) * Math.cos(r)]);
    }
  });
  return formes.some((f) => essais.some((p) => geoContains(f, p)));
}

describe('la carte du monde', () => {
  it('chaque pays de la carte a sa région, et chaque région a des pays de la carte', () => {
    CODES.forEach((code) => expect([code, regionDe(code)]).toEqual([code, expect.any(String)]));
    REGIONS.forEach((r) => expect(paysDeLaRegion(r.cle).some((c) => CODES.has(c))).toBe(true));
  });

  it('les continents suivent le point touché pour les pays à cheval', () => {
    expect(continentDuClic('RU', 37.6)).toBe('europe');
    expect(continentDuClic('RU', 131.9)).toBe('asie');
    expect(continentDuClic('TR', 28.97)).toBe('europe');
    expect(continentDuClic('TR', 32.86)).toBe('asie');
    expect(continentDuClic('MX', -99)).toBe('amerique-nord');
    expect(continentDuClic('BR', -47)).toBe('amerique-sud');
    expect(continentDuClic('EG', 31)).toBe('afrique');
    expect(continentDuClic('SA', 46)).toBe('asie');
  });

  it('les tracés se construisent, et Paris est en France', async () => {
    const m = await chargerMonde();
    expect(m.pays.length).toBeGreaterThan(200);
    expect(m.paysSous([2.35, 48.86])).toBe('FR');
    expect(m.paysSous([-30, 0])).toBeNull();
    expect(m.pays_.FR.d.length).toBeGreaterThan(100);
  });
});

describe('les distances et la boussole', () => {
  it('par le grand cercle', () => {
    expect(distanceKm([2.3522, 48.8566], [-0.1278, 51.5074])).toBeGreaterThan(335);
    expect(distanceKm([2.3522, 48.8566], [-0.1278, 51.5074])).toBeLessThan(350);
    expect(distanceKm([0, 0], [180, 0])).toBeCloseTo(Math.PI * 6371, 0);
  });

  it('la direction, la température, les écritures', () => {
    expect(direction(cap([2.35, 48.86], [16.37, 48.21])).nom).toBe('l’est');
    expect(direction(cap([2.35, 48.86], [13.4, 52.52])).nom).toBe('le nord-est');
    expect(direction(cap([2.35, 48.86], [2.35, 60])).nom).toBe('le nord');
    expect(direction(350).nom).toBe('le nord');
    expect(direction(225).nom).toBe('le sud-ouest');
    expect(temperature(500)).toBe('chaud');
    expect(temperature(2000)).toBe('tiede');
    expect(temperature(5000)).toBe('froid');
    expect(temperature(80, 'france')).toBe('chaud');
    expect(temperature(300, 'france')).toBe('froid');
    expect(enKm(1234)).toBe('1 230 km');
    expect(enKm(42.4)).toBe('42 km');
    expect(enDegres([2.35, 48.86])).toBe('48,9° N · 2,4° E');
    expect(enDegres([-43.2, -22.9])).toBe('22,9° S · 43,2° O');
  });
});

describe('Où sur Terre ?', () => {
  it('vingt lieux, trois preuves en image chacun, et des phrases pour Salim', () => {
    expect(ost.LIEUX).toHaveLength(20);
    ost.LIEUX.forEach((l) => {
      ost.PREUVES.forEach((p) => {
        expect([l.id, p.cle, IMAGES_HISTOIRE_GEO['ou-sur-terre'][ost.cleImage(l, p.cle)]]).toEqual([l.id, p.cle, expect.anything()]);
        expect(l.alts[p.cle].length).toBeGreaterThan(20);
        expect(l.alts[p.cle]).not.toContain(l.ville);
      });
      expect(ost.PHRASES[`aide-${l.id}`]).toMatch(/^Un indice/);
      expect(ost.PHRASES[`revele-${l.id}`]).toContain(l.ville);
      expect(l.autres.length).toBeGreaterThanOrEqual(5);
    });
    Object.values(ost.PHRASES).forEach((t) => expect(typeof t === 'string' && t.length > 3).toBe(true));
  });

  it('chaque ville, et chaque ville proposée à côté, est dans le bon pays et dans sa région', () => {
    ost.LIEUX.forEach((l) => {
      expect(CODES.has(l.pays)).toBe(true);
      expect(l.regions).toContain(regionDe(l.pays));
      expect([l.ville, dansLePays(l.pays, l.lon, l.lat)]).toEqual([l.ville, true]);
      l.autres.forEach(([nom, lon, lat]) => expect([l.ville, nom, dansLePays(l.pays, lon, lat)]).toEqual([l.ville, nom, true]));
    });
  });

  it.each(ANNEES)('%s : cinq dossiers, la bonne ville une seule fois parmi les propositions', (annee) => {
    GRAINES.forEach((g) => {
      const dossiers = ost.serie(g, annee);
      expect(dossiers).toHaveLength(ost.DOSSIERS);
      expect(new Set(dossiers.map((d) => d.id)).size).toBe(ost.DOSSIERS);
      dossiers.forEach((d) => {
        expect(d.villes).toHaveLength(ost.nombreDeVilles(annee));
        expect(d.villes.filter((v) => v.juste)).toHaveLength(1);
        expect(new Set(d.villes.map((v) => v.nom)).size).toBe(d.villes.length);
        expect(ost.lieuxDeLaClasse(annee)).toContain(ost.LIEUX.find((l) => l.id === d.id));
      });
    });
  });

  it('les plus connus pour les petits, plus de villes pour les grands', () => {
    expect(ost.lieuxDeLaClasse('CP').every((l) => l.niveau === 1)).toBe(true);
    expect(ost.lieuxDeLaClasse('TERMINALE')).toHaveLength(20);
    expect(ost.nombreDeVilles('CP')).toBe(3);
    expect(ost.nombreDeVilles('TERMINALE')).toBe(6);
    expect(ost.niveauConseille('CE1')).toBe('facile');
    expect(ost.niveauConseille('QUATRIEME')).toBe('normal');
    expect(ost.niveauConseille('PREMIERE')).toBe('expert');
  });

  it('les points : les preuves payées, les faux pas, le plancher, le bonus expert', () => {
    expect(ost.pointsDuDossier({ preuvesOuvertes: 1, erreurs: 0 }, 'normal')).toBe(100);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 3, erreurs: 0 }, 'normal')).toBe(50);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 2, erreurs: 0 }, 'facile')).toBe(100);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 3, erreurs: 1 }, 'facile')).toBe(60);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 3, erreurs: 9 }, 'normal')).toBe(10);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 1, erreurs: 0 }, 'expert')).toBe(130);
    expect(ost.pointsDuDossier({ preuvesOuvertes: 1, erreurs: 0, montre: true }, 'expert')).toBe(0);
    const istanbul = ost.LIEUX.find((l) => l.id === '11-istanbul');
    expect(ost.jugerRegion(istanbul, 'europe')).toBe(true);
    expect(ost.jugerRegion(istanbul, 'moyen-orient')).toBe(true);
    expect(ost.jugerRegion(istanbul, 'asie')).toBe(false);
  });
});

describe('Enquête sur la carte', () => {
  const PAYS_DU_LIEU = {
    'monument-01-tour-eiffel': ['FR'],
    'monument-02-colisee': ['IT'],
    'monument-03-taj-mahal': ['IN'],
    'monument-04-muraille': ['CN'],
    'monument-05-pyramides': ['EG'],
    'monument-06-liberte': ['US'],
    'monument-07-machu-picchu': ['PE'],
    'monument-08-christ': ['BR'],
    'monument-09-opera-sydney': ['AU'],
    'monument-10-angkor': ['KH'],
    'nature-01-grand-canyon': ['US'],
    'nature-02-everest': ['NP', 'CN'],
    'nature-03-victoria': ['ZM', 'ZW'],
    'nature-04-amazonie': ['BR'],
    'nature-05-sahara': ['DZ'],
    'nature-07-fuji': ['JP'],
    'nature-08-niagara': ['CA', 'US'],
    'nature-09-kilimandjaro': ['TZ'],
    'nature-10-fjords': ['NO'],
  };

  it('trois enquêtes de dix lieux, chacun avec son image, quatre indices et sa phrase', () => {
    expect(enq.ENQUETES).toHaveLength(3);
    enq.ENQUETES.forEach((e) => {
      expect(e.lieux).toHaveLength(10);
      expect(IMAGES_HISTOIRE_GEO['enquete-carte'][e.image]).toBeTruthy();
      e.lieux.forEach((l) => {
        expect([l.id, IMAGES_HISTOIRE_GEO['enquete-carte'][l.id]]).toEqual([l.id, expect.anything()]);
        expect(l.indices).toHaveLength(enq.INDICES);
        l.indices.forEach((t, i) => expect(enq.PHRASES[`indice-${l.id}-${i + 1}`]).toBe(t));
        expect(enq.PHRASES[`revele-${l.id}`]).toBe(l.revele);
      });
    });
  });

  it('chaque lieu est dans son pays (la Grande Barrière, en mer, au large de l’Australie)', () => {
    const placeJuste = (l) => {
      if (l.id.startsWith('france-')) return dansLePays('FR', l.lon, l.lat);
      if (l.id === 'nature-06-barriere-corail') return distanceKm([l.lon, l.lat], [146.0, -18.6]) < 250;
      return PAYS_DU_LIEU[l.id].some((c) => dansLePays(c, l.lon, l.lat));
    };
    enq.ENQUETES.flatMap((e) => e.lieux).forEach((l) => expect([l.id, placeJuste(l)]).toEqual([l.id, true]));
    enq.AUTRES_VILLES_DE_FRANCE.forEach((v) => expect([v.nom, dansLePays('FR', v.lon, v.lat)]).toEqual([v.nom, true]));
  });

  it('les distances écrites dans les indices sont justes', () => {
    const lieu = (id) => enq.ENQUETES.flatMap((e) => e.lieux).find((l) => l.id === id);
    const d = (id, lon, lat) => distanceKm([lieu(id).lon, lieu(id).lat], [lon, lat]);
    expect(d('monument-03-taj-mahal', 77.209, 28.614)).toBeLessThan(200); // New Delhi
    expect(Math.abs(d('monument-07-machu-picchu', -71.968, -13.532) - 75)).toBeLessThan(12); // Cuzco
    expect(Math.abs(d('nature-02-everest', 85.324, 27.717) - 160)).toBeLessThan(15); // Katmandou
    expect(d('nature-01-grand-canyon', -115.14, 36.17)).toBeLessThan(300); // Las Vegas
    expect(Math.abs(d('nature-07-fuji', 139.759, 35.682) - 100)).toBeLessThan(15); // Tokyo
    expect(d('nature-08-niagara', -79.383, 43.653)).toBeLessThan(70); // Toronto
    expect(Math.abs(d('nature-09-kilimandjaro', 36.822, -1.292) - 200)).toBeLessThan(20); // Nairobi
    expect(d('nature-05-sahara', 5.523, 22.785)).toBeLessThan(60); // Tamanrasset
    expect(d('france-09-nantes', -2.2, 47.27)).toBeLessThan(60); // Saint-Nazaire, l'océan
    // Les directions aussi : Agra au sud-est de New Delhi, Machu Picchu au nord-ouest de Cuzco.
    expect(direction(cap([77.209, 28.614], [lieu('monument-03-taj-mahal').lon, lieu('monument-03-taj-mahal').lat])).cle).toBe('se');
    expect(direction(cap([-71.968, -13.532], [lieu('monument-07-machu-picchu').lon, lieu('monument-07-machu-picchu').lat])).cle).toBe('no');
  });

  it('le verdict : trouvé sur place, froid de l’autre côté du monde, et la boussole juste', () => {
    const tour = enq.ENQUETES[0].lieux[0];
    expect(enq.verdict([tour.lon, tour.lat], tour).trouve).toBe(true);
    const loin = enq.verdict([-74, 40.7], tour);
    expect(loin.trouve).toBe(false);
    expect(loin.temperature).toBe('froid');
    expect(loin.direction.cle).toBe('ne');
    const lyon = enq.ENQUETES[2].lieux[2];
    expect(enq.verdict([4.85, 45.75], lyon, { carte: 'france' }).trouve).toBe(true);
    expect(enq.verdict([5.37, 43.3], lyon, { carte: 'france', niveau: 'TROISIEME' }).trouve).toBe(false);
    expect(enq.pointsDuLieu(0)).toBe(100);
    expect(enq.pointsDuLieu(2)).toBe(70);
    expect(enq.pointsDuLieu(9)).toBe(10);
    expect(enq.pointsDuLieu(1, true)).toBe(0);
  });

  it('six lieux par partie, tous différents', () => {
    enq.ENQUETES.forEach((e) => GRAINES.forEach((g) => {
      const lieux = enq.serie(g, e.cle);
      expect(lieux).toHaveLength(6);
      expect(new Set(lieux.map((l) => l.id)).size).toBe(6);
    }));
  });
});

describe('Le grand jeu de géo', () => {
  it('chaque pays demandé est sur la carte, chaque capitale a son pays', () => {
    gjg.PAYS.forEach((p) => expect([p.code, CODES.has(p.code)]).toEqual([p.code, true]));
    expect(new Set(gjg.PAYS.map((p) => p.code)).size).toBe(gjg.PAYS.length);
    [...gjg.CAPITALES, ...gjg.VILLES].forEach((c) => {
      expect([c.nom, gjg.nomDuPays(c.pays)]).toEqual([c.nom, expect.any(String)]);
      // Hong Kong est un territoire à part sur la carte, mais chinois.
      expect([c.nom, dansLePays(c.pays === 'CN' && c.nom === 'Hong Kong' ? 'HK' : c.pays, c.lon, c.lat)]).toEqual([c.nom, true]);
    });
  });

  it('les intitulés et leurs articles', () => {
    const cap = (nom) => gjg.CAPITALES.find((c) => c.nom === nom);
    expect(gjg.intitule(cap('Madrid'))).toBe('Madrid, capitale de l’Espagne');
    expect(gjg.intitule(cap('Brasilia'))).toBe('Brasilia, capitale du Brésil');
    expect(gjg.intitule(cap('Washington'))).toBe('Washington, capitale des États-Unis');
    expect(gjg.intitule(cap('La Havane'))).toBe('La Havane, capitale de Cuba');
    expect(gjg.intitule(cap('Port-au-Prince'))).toBe('Port-au-Prince, capitale d’Haïti');
    expect(gjg.intitule(gjg.VILLES.find((v) => v.nom === 'Venise'))).toBe('Venise (Italie)');
    expect(gjg.PHRASES['trouve-pays-br']).toBe('Trouve le Brésil.');
    expect(gjg.PHRASES['trouve-continent-afrique']).toBe('Trouve l’Afrique.');
  });

  it.each(ANNEES)('%s : les bonnes sortes de questions, sans doublon', (annee) => {
    GRAINES.forEach((g) => {
      const q = gjg.serie(g, annee);
      expect(q).toHaveLength(gjg.manchesDe(annee));
      expect(new Set(q.map((x) => x.id)).size).toBe(q.length);
      const sortes = new Set(q.map((x) => x.type));
      const petits = ['CP', 'CE1'].includes(annee);
      const lycee = ['SECONDE', 'PREMIERE', 'TERMINALE'].includes(annee);
      expect(!petits || [...sortes].sort().join(',') === 'continent,pays').toBe(true);
      expect(!lycee || !sortes.has('continent')).toBe(true);
      expect(!lycee || q.filter((x) => x.type === 'pays').every((x) => x.palier >= 3)).toBe(true);
      q.filter((x) => x.type === 'capitale' || x.type === 'ville').forEach((x) => {
        expect(gjg.pointsVisibles(annee)).toContain(x);
      });
    });
  });

  it('le jugement : le pays touché, le continent, la mer, le point le plus proche', () => {
    const france = gjg.PAYS.find((p) => p.code === 'FR');
    expect(gjg.juger({ ...france, id: 'pays-FR' }, { lon: 2, lat: 47, pays: 'FR' })).toMatchObject({ juste: true });
    expect(gjg.juger({ ...france, id: 'pays-FR' }, { lon: 4, lat: 50.5, pays: 'BE' })).toMatchObject({ juste: false, mer: false });
    expect(gjg.juger({ ...france, id: 'pays-FR' }, { lon: -30, lat: 40, pays: null })).toMatchObject({ mer: true });
    expect(gjg.juger({ type: 'continent', cle: 'europe' }, { lon: 37.6, lat: 55.7, pays: 'RU' }).juste).toBe(true);
    expect(gjg.juger({ type: 'continent', cle: 'europe' }, { lon: 100, lat: 60, pays: 'RU' }).juste).toBe(false);
    const bratislava = gjg.CAPITALES.find((c) => c.nom === 'Bratislava');
    expect(gjg.juger(bratislava, { lon: 17.1, lat: 48.15, pays: 'SK' }, 'TERMINALE').juste).toBe(true);
    // Vienne est à 55 km : un clic sur Vienne n'est pas Bratislava.
    expect(gjg.juger(bratislava, { lon: 16.37, lat: 48.21, pays: 'AT' }, 'TERMINALE').juste).toBe(false);
    const paris = gjg.CAPITALES.find((c) => c.nom === 'Paris');
    expect(gjg.juger(paris, { lon: 2.4, lat: 48.8, pays: 'FR' }, 'CM1').juste).toBe(true);
    expect(gjg.juger(paris, { lon: -40, lat: 30, pays: null }, 'CM1').juste).toBe(false);
  });

  it('moins de temps en grandissant et en défi ; plus de points quand on est rapide', () => {
    expect(gjg.secondesParQuestion('CP')).toBeGreaterThan(gjg.secondesParQuestion('TERMINALE'));
    expect(gjg.secondesParQuestion('CM1', true)).toBeLessThan(gjg.secondesParQuestion('CM1'));
    expect(gjg.pointsDuClic(10)).toBeGreaterThan(gjg.pointsDuClic(2));
  });
});

describe('le passeport', () => {
  beforeEach(() => window.localStorage.clear());

  it('un tampon par lieu, une seule fois, par enfant', () => {
    expect(tamponner('e1', '01-londres')).toBe(true);
    expect(tamponner('e1', '01-londres')).toBe(false);
    expect(tamponner('e2', '02-tokyo')).toBe(true);
    expect(Object.keys(tampons('e1'))).toEqual(['01-londres']);
  });

  it('sans stockage, le jeu continue', () => {
    const espion = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('plein'); });
    expect(() => tamponner('e3', '03-rio')).not.toThrow();
    espion.mockRestore();
    const lecture = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqué'); });
    expect(tampons('e3')).toEqual({});
    lecture.mockRestore();
  });
});

describe('à l’écran', () => {
  beforeAll(() => chargerMonde());

  const jouer = (cle, niveau = 'CM1') => {
    const Ecran = ECRANS_BONUS[cle];
    return render(
      <FournirJeu value={{
        jeuCle: cle, niveau, mode: TRANQUILLE, coeursMax: 0, rejouerPartie: jest.fn(), terminerDefi: jest.fn(),
      }}
      >
        <Ecran onQuitter={jest.fn()} niveau={niveau} />
      </FournirJeu>,
    );
  };

  it('les trois écrans sont enregistrés, avec leur aperçu', () => {
    expect(Object.keys(ECRANS).sort()).toEqual(['bonus-enquete-carte', 'bonus-grand-jeu-de-geo', 'bonus-ou-sur-terre']);
    Object.keys(ECRANS).forEach((cle) => expect(APERCUS[cle]).toBeTruthy());
  });

  it('Où sur Terre : on choisit son niveau, puis la bonne région fait passer au pays', async () => {
    jouer('bonus-ou-sur-terre', 'CM1');
    fireEvent.click(screen.getByRole('button', { name: /Facile/ }));
    expect(screen.getByRole('region', { name: 'Dossier secret n° 1' })).toBeInTheDocument();
    // En facile, deux preuves sont ouvertes, la troisième se paie.
    expect(screen.getByRole('button', { name: 'Ouvrir le repère : moins 30 points' })).toBeEnabled();
    const image = screen.getByRole('img', { name: /^Le paysage :/ });
    const lieu = ost.LIEUX.find((l) => image.getAttribute('alt').includes(l.alts.paysage));
    const nom = REGIONS.find((r) => r.cle === lieu.regions[0]).nom;
    fireEvent.click(screen.getByRole('button', { name: nom }));
    expect(screen.getByRole('status')).toHaveTextContent(ost.PHRASES['etape-pays']);
    await screen.findByRole('application', { name: /Carte du monde/ });
  });

  it('Où sur Terre : une mauvaise région coûte un faux pas', () => {
    jouer('bonus-ou-sur-terre', 'CM1');
    fireEvent.click(screen.getByRole('button', { name: /Normal/ }));
    const image = screen.getByRole('img', { name: /^Le paysage :/ });
    const lieu = ost.LIEUX.find((l) => image.getAttribute('alt').includes(l.alts.paysage));
    const fausse = REGIONS.find((r) => r.cle !== 'antarctique' && !lieu.regions.includes(r.cle));
    fireEvent.click(screen.getByRole('button', { name: fausse.nom }));
    expect(screen.getByRole('status')).toHaveTextContent(ost.PHRASES['pas-la-region']);
    expect(screen.getByText('90 points en jeu')).toBeInTheDocument();
  });

  it('Enquête : on choisit les monuments, Salim donne le premier indice, la boussole répond au clic', async () => {
    jouer('bonus-enquete-carte', 'CM1');
    fireEvent.click(screen.getByRole('button', { name: /Monuments du monde/ }));
    expect(screen.getByText('Indice 1 sur 4')).toBeInTheDocument();
    const carte = await screen.findByRole('application', { name: /Carte du monde/ });
    // Le centre de la carte : 0° de longitude, 0° de latitude, dans le golfe de Guinée.
    fireEvent.pointerDown(carte, { pointerId: 1, clientX: 0, clientY: 0, button: 0 });
    fireEvent.pointerUp(carte, { pointerId: 1, clientX: 0, clientY: 0, button: 0 });
    expect(screen.getByText(/km, vers/)).toBeInTheDocument();
    expect(screen.getByText('Indice 2 sur 4')).toBeInTheDocument();
    expect(screen.getByText(/0,0° N · 0,0° E/)).toBeInTheDocument();
  });

  it('Enquête : les villes de France sont des points à toucher', async () => {
    jouer('bonus-enquete-carte', 'CM1');
    fireEvent.click(screen.getByRole('button', { name: /Villes de France/ }));
    await screen.findByRole('application', { name: /Carte de France/ });
    // En primaire, les villes portent leur nom.
    expect(screen.getAllByRole('button', { name: 'Lyon' })).toHaveLength(1);
  });

  it('Le grand jeu : une question, un sablier, et le clavier touche le centre', async () => {
    jest.useFakeTimers();
    jouer('bonus-grand-jeu-de-geo', 'CP');
    expect(screen.getAllByRole('timer')).toHaveLength(2);
    expect(screen.getByText(/^(Un pays|Un continent)$/)).toBeInTheDocument();
    await act(async () => { await chargerMonde(); });
    const carte = screen.getByRole('application');
    fireEvent.keyDown(carte, { key: 'Enter' });
    act(() => { jest.advanceTimersByTime(30000); });
    jest.useRealTimers();
  });
});
