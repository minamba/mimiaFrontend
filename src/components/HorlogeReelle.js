import { useEffect, useState } from 'react';

/**
 * L'heure qu'il est, au-dessus du cours.
 *
 * POURQUOI ELLE A SA PLACE ICI
 * ----------------------------
 * Le décompte dit combien de temps il reste ; il ne dit pas s'il est l'heure
 * d'aller dîner. Un enfant qui travaille dans sa chambre n'a souvent rien
 * d'autre sous les yeux que cet écran — et un parent qui passe derrière lui
 * regarde l'heure avant toute chose.
 *
 * POURQUOI UN CADRAN, APRÈS DEUX TENTATIVES RATÉES
 * ------------------------------------------------
 * Deux versions ont été essayées et écartées avant celle-ci. Une pastille
 * bordée : elle ressemblait au décompte, donc à un second compteur. Un cadran
 * dessiné à vingt-quatre pixels : une tache grise, illisible.
 *
 * La forme actuelle évite les deux pièges. Elle est ASSEZ GRANDE pour se lire
 * — un cercle de quatre-vingt-six pixels — et elle porte quatre repères
 * d'heure à midi, trois, six et neuf. Ce sont eux qui font la différence entre
 * une horloge et un badge, et c'est ce qui manquait à la pastille.
 *
 * Aucune confusion possible avec le décompte : il est resté un rectangle
 * arrondi, les deux formes n'ont rien en commun.
 *
 * La police à empattements est celle des titres — « Le tableau », « Une
 * matière, un professeur » — donc l'heure appartient visiblement à la même
 * maison.
 *
 * ELLE SE MET À JOUR À LA MINUTE, PAS À LA SECONDE
 * ------------------------------------------------
 * Un affichage en heures et minutes n'a rien à montrer entre deux minutes. Un
 * battement d'une seconde ferait travailler la page soixante fois plus pour le
 * même résultat, et sur un téléphone ça se paie en batterie.
 *
 * Le premier réveil est calé sur le CHANGEMENT DE MINUTE, pas soixante
 * secondes plus tard : sans ça, une horloge ouverte à 15 h 03 min 59 s
 * afficherait 15:03 pendant presque une minute entière alors qu'il est déjà
 * 15 h 04. Le décalage serait constant et différent à chaque ouverture.
 */
export default function HorlogeReelle() {
  const [maintenant, setMaintenant] = useState(() => new Date());

  useEffect(() => {
    let intervalle;

    const versLaMinuteSuivante = 60000 - (Date.now() % 60000);

    const amorce = setTimeout(() => {
      setMaintenant(new Date());
      intervalle = setInterval(() => setMaintenant(new Date()), 60000);
    }, versLaMinuteSuivante);

    return () => {
      clearTimeout(amorce);
      if (intervalle) clearInterval(intervalle);
    };
  }, []);

  const heure = maintenant.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <span className="horloge" aria-label={`Il est ${heure}`}>
      {heure}
    </span>
  );
}
