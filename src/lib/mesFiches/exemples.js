/**
 * DES FICHES D'EXEMPLE, ÉCRITES À LA MAIN — pour valider le dessin des six
 * types avant de brancher la génération (Camara, le 14/10/2026 : « les
 * fiches visuelles doivent être belles »).
 *
 * C'est aussi le FORMAT que le modèle devra rendre : un type, un titre, et
 * une suite de briques. Les exemples d'Antigone viennent du modèle de fiche
 * donné par Camara ; ceux marqués `ajoute` montrent le cas d'un exemple que
 * le cours ne donnait pas.
 */

const FRANCAIS = 'Français';
const MATHS = 'Mathématiques';
const COURS_FIGURES = 'Les figures de style';
const COURS_THALES = 'Le théorème de Thalès';

export const EXEMPLES_FICHES = [
  {
    id: 'fr-classique',
    type: 'classique',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    position: { rang: 1, total: 4 },
    titre: 'Les figures de ressemblance',
    blocs: [
      {
        type: 'encadre',
        ton: 'definition',
        texte: 'Une **figure de ressemblance** rapproche deux éléments qui ont un point commun, pour créer une image dans l’esprit du lecteur.',
      },
      {
        type: 'tableau',
        colonnes: ['Figure', 'Définition', 'Exemple'],
        lignes: [
          ['Comparaison', 'Rapproche un **comparé** et un **comparant** grâce à un **outil de comparaison** (*comme, tel, pareil à, semblable à*).', '*Tu défends ton bonheur comme un os !* (Antigone)'],
          ['Métaphore', 'Rapproche un comparé et un comparant **sans outil de comparaison**.', '*Allons, ma vieille bonne pomme rouge.* (Antigone)'],
          ['Personnification', 'Attribue des **qualités humaines** à un animal, un objet ou une idée.', '*Le jardin dormait encore.* (Antigone)'],
          ['Allégorie', 'Représente une **idée abstraite** par une image concrète, souvent un personnage.', { texte: '*La Justice est représentée par une femme aux yeux bandés.*', ajoute: true }],
        ],
      },
      {
        type: 'liste',
        titre: 'À retenir',
        elements: [
          'Le **comparé** est ce dont on parle ; le **comparant** est l’image qu’on lui associe.',
          'Pour reconnaître une personnification, cherche un **verbe d’action humaine** appliqué à une chose ou à un animal.',
        ],
      },
      {
        type: 'encadre',
        ton: 'piege',
        texte: 'S’il y a un **outil de comparaison** (*comme, tel…*), c’est une **comparaison**. Sans outil, c’est une **métaphore**.',
      },
    ],
  },
  {
    id: 'fr-express',
    type: 'express',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    titre: 'Les figures de style',
    blocs: [
      {
        type: 'arbre',
        centre: 'Figures de style',
        branches: [
          { titre: 'figures de la **ressemblance**', feuilles: ['Comparaison', 'Métaphore', 'Personnification', 'Allégorie'] },
          { titre: 'figures de l’**opposition**', feuilles: ['Antithèse', 'Oxymore', 'Antiphrase'] },
          { titre: 'figures de l’**exagération** ou de l’**atténuation**', feuilles: ['Hyperbole', 'Litote', 'Euphémisme'] },
          { titre: 'figures de la **répétition**', feuilles: ['Anaphore', 'Énumération', 'Gradation'] },
          { titre: 'figures de la **substitution**', feuilles: ['Périphrase', 'Métonymie'] },
        ],
      },
    ],
  },
  {
    id: 'fr-visuelle',
    type: 'visuelle',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    position: { rang: 3, total: 4 },
    titre: 'Les figures d’insistance et d’atténuation',
    blocs: [
      {
        type: 'carte',
        centre: 'Insister ou atténuer',
        sousTitre: 'pour donner de la force à une idée, ou l’adoucir',
        branches: [
          { titre: 'Hyperbole', texte: 'Exagérer une idée pour la mettre en valeur.', exemple: 'Je meurs de soif !' },
          { titre: 'Gradation', texte: 'Une suite de termes d’intensité croissante ou décroissante.', exemple: 'Va, cours, vole, et nous venge. (Corneille)' },
          { titre: 'Anaphore', texte: 'Répéter un mot au début de plusieurs phrases ou vers.', exemple: 'Paris ! Paris outragé ! Paris brisé !' },
          { titre: 'Énumération', texte: 'Une suite de termes de même nature.', exemple: 'Il achète du pain, du lait, des pommes et du fromage.', ajoute: true },
          { titre: 'Litote', texte: 'Dire moins pour faire entendre plus.', exemple: 'Va, je ne te hais point. (Corneille)' },
          { titre: 'Euphémisme', texte: 'Adoucir une réalité pénible ou choquante.', exemple: 'Il nous a quittés.' },
        ],
      },
    ],
  },
  {
    id: 'fr-questions',
    type: 'questions',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    position: { rang: 2, total: 4 },
    titre: 'Les figures d’opposition',
    blocs: [
      {
        type: 'questions',
        titre: 'Les questions à connaître',
        questions: [
          { question: 'Qu’est-ce qu’une antithèse ?', reponse: 'Elle rapproche deux **idées opposées** dans une même phrase.', exemple: '*Tu as choisi la vie et moi la mort.* (Antigone)' },
          { question: 'Qu’est-ce qu’un oxymore ?', reponse: 'Il réunit **deux mots de sens contraire** placés côte à côte.', exemple: '*Cette obscure clarté qui tombe des étoiles* (Corneille)' },
          { question: 'Quelle différence entre une antithèse et un oxymore ?', reponse: 'L’antithèse oppose deux **idées** dans la phrase ; l’oxymore colle deux **mots** contraires l’un à l’autre.', exemple: '*Certains rient, d’autres pleurent* / *un silence assourdissant*', ajoute: true },
          { question: 'Qu’est-ce qu’une antiphrase ?', reponse: 'Dire **le contraire** de ce que l’on pense, souvent pour se moquer : c’est une forme d’**ironie**.', exemple: '*C’est du joli, c’est du propre !* (Antigone)' },
          { question: 'Comment reconnaître une antiphrase ?', reponse: 'Le **contexte** montre que le sens est inversé : le ton, la situation, la ponctuation.', exemple: '*Surtout, ne te presse pas !* — dit à quelqu’un qui traîne', ajoute: true },
          { question: 'À quoi servent les figures d’opposition ?', reponse: 'À faire ressortir un **contraste**, à surprendre le lecteur ou à se moquer.' },
        ],
      },
    ],
  },
  {
    id: 'fr-controle',
    type: 'controle',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    titre: 'Synthèse : les figures de style',
    blocs: [
      {
        type: 'encadre',
        ton: 'definition',
        texte: 'Une **figure de style** est un procédé d’écriture qui rend un texte plus expressif : elle crée une image, insiste sur une idée ou produit un effet sur le lecteur.',
      },
      {
        type: 'tableau',
        titre: '1. Les figures de ressemblance',
        colonnes: ['Figure', 'À reconnaître', 'Exemple'],
        lignes: [
          ['Comparaison', 'Un **outil de comparaison** relie deux éléments.', '*Tu défends ton bonheur comme un os !*'],
          ['Métaphore', 'Une image **sans outil** de comparaison.', '*Allons, ma vieille bonne pomme rouge.*'],
          ['Personnification', 'Une chose ou un animal agit **comme un humain**.', '*Le jardin dormait encore.*'],
        ],
      },
      {
        type: 'tableau',
        titre: '2. Les figures d’opposition',
        colonnes: ['Figure', 'À reconnaître', 'Exemple'],
        lignes: [
          ['Antithèse', 'Deux **idées** opposées dans une phrase.', '*Tu as choisi la vie et moi la mort.*'],
          ['Oxymore', 'Deux **mots** contraires côte à côte.', '*Cette obscure clarté*'],
          ['Antiphrase', 'Dire **le contraire** de ce qu’on pense.', '*C’est du joli, c’est du propre !*'],
        ],
      },
      {
        type: 'tableau',
        titre: '3. Les figures d’insistance et d’atténuation',
        colonnes: ['Figure', 'À reconnaître', 'Exemple'],
        lignes: [
          ['Hyperbole', 'Une **exagération**.', '*Je meurs de soif !*'],
          ['Gradation', 'Des termes de plus en plus **forts** (ou faibles).', '*Va, cours, vole, et nous venge.*'],
          ['Anaphore', 'Un mot répété **en début** de phrase ou de vers.', '*Paris ! Paris outragé ! Paris brisé !*'],
          ['Litote', 'Dire **moins** pour faire entendre plus.', '*Va, je ne te hais point.*'],
        ],
      },
      {
        type: 'liste',
        style: 'coches',
        titre: 'À savoir par cœur',
        elements: [
          'Les **5 figures** les plus demandées : comparaison, métaphore, personnification, hyperbole, anaphore.',
          'La différence **comparaison / métaphore** : l’outil de comparaison.',
          'La différence **antithèse / oxymore** : deux idées, ou deux mots collés.',
          'Toujours **citer les mots** du texte et **expliquer l’effet** produit.',
        ],
      },
      {
        type: 'encadre',
        ton: 'piege',
        titre: 'Les pièges fréquents',
        elements: [
          'Nommer la figure sans **expliquer son effet** : c’est la moitié des points seulement.',
          'Prendre une simple répétition pour une anaphore : l’anaphore se répète **en début** de phrase ou de vers.',
          'Voir une métaphore dans une phrase avec « comme » : avec un outil, c’est une **comparaison**.',
        ],
      },
      {
        type: 'encadre',
        ton: 'souvent',
        elements: [
          'Relever une figure dans un extrait et **la nommer**.',
          'Expliquer **l’effet produit** sur le lecteur.',
          'Distinguer **comparaison et métaphore** dans deux phrases proches.',
        ],
      },
    ],
  },
  {
    id: 'fr-methode',
    type: 'methode',
    matiere: FRANCAIS,
    cours: COURS_FIGURES,
    position: { rang: 4, total: 4 },
    titre: 'Identifier une figure de style et expliquer son effet',
    blocs: [
      {
        type: 'tableau',
        titre: 'Reconnaître la figure',
        colonnes: ['Si tu repères…', 'Pense à…', 'Exemple'],
        lignes: [
          ['« comme », « tel », « pareil à »', 'Comparaison', '*Fort comme un lion*'],
          ['Une image sans outil de comparaison', 'Métaphore', '*Cet homme est un lion*'],
          ['Une chose qui agit comme un humain', 'Personnification', '*Le soleil sourit*'],
          ['Une exagération', 'Hyperbole', '*Je t’ai appelé mille fois*'],
          ['Un mot répété en début de phrase', 'Anaphore', '*Toujours aimer, toujours espérer*'],
          ['Deux mots contraires côte à côte', 'Oxymore', '*Un silence assourdissant*'],
          ['Une idée atténuée qui en suggère une plus forte', 'Litote', '*Ce n’est pas mal*'],
        ],
      },
      {
        type: 'etapes',
        titre: 'La méthode en 3 étapes',
        etapes: [
          { titre: 'Identifier', texte: 'Repère les mots importants et cherche la figure qui leur correspond.' },
          { titre: 'Justifier', texte: 'Recopie les mots précis qui te permettent de la reconnaître.' },
          { titre: 'Expliquer l’effet', texte: 'Dis ce que la figure permet de montrer, de faire ressentir ou de souligner.' },
        ],
      },
      {
        type: 'encadre',
        ton: 'modele',
        texte: 'Dans l’expression « [[citation]] », l’auteur utilise [[une figure de style]]. On la reconnaît grâce à [[l’indice du texte]]. Elle permet de [[l’effet produit]].',
      },
      {
        type: 'encadre',
        ton: 'exemple',
        texte: 'Dans l’expression « *Je meurs de faim* », l’auteur utilise une **hyperbole**. On la reconnaît grâce à l’exagération « *je meurs* ». Elle permet d’insister sur l’intensité de la faim.',
      },
    ],
  },
  {
    id: 'ma-classique',
    type: 'classique',
    matiere: MATHS,
    cours: COURS_THALES,
    position: { rang: 2, total: 4 },
    titre: 'Calculer une longueur avec le théorème de Thalès',
    blocs: [
      {
        type: 'encadre',
        ton: 'definition',
        titre: 'Le théorème de Thalès',
        texte: 'Si les droites (BM) et (CN) sont **sécantes en A** et si les droites (MN) et (BC) sont **parallèles**, alors : {AM/AB} = {AN/AC} = {MN/BC}',
      },
      {
        type: 'liste',
        titre: 'À vérifier avant de l’utiliser',
        elements: [
          'Deux droites **sécantes** en un point (ici A).',
          'Deux droites **parallèles** qui les coupent (ici (MN) et (BC)).',
          'Les longueurs du **petit triangle** AMN en haut des fractions, celles du **grand triangle** ABC en bas.',
        ],
      },
      {
        type: 'encadre',
        ton: 'exemple',
        texte: 'AM = 3 cm, AB = 5 cm et AC = 7 cm. D’après le théorème de Thalès, {AM/AB} = {AN/AC}, donc {3/5} = {AN/7}, d’où AN = {3 × 7/5} = **4,2 cm**.',
      },
      {
        type: 'encadre',
        ton: 'piege',
        texte: 'Le théorème sert à **calculer une longueur**. Pour **prouver** que deux droites sont parallèles, on utilise la **réciproque**.',
      },
    ],
  },
  {
    id: 'ma-visuelle',
    type: 'visuelle',
    matiere: MATHS,
    cours: COURS_THALES,
    position: { rang: 1, total: 4 },
    titre: 'Le théorème de Thalès, en un coup d’œil',
    blocs: [
      {
        type: 'carte',
        centre: 'Thalès',
        sousTitre: 'deux droites parallèles, deux droites sécantes',
        branches: [
          { titre: 'La configuration', texte: 'Deux droites **sécantes** coupées par deux droites **parallèles**.', exemple: 'Triangles emboîtés, ou en « papillon ».' },
          { titre: 'Le théorème', texte: 'Il sert à **calculer une longueur**.', exemple: '{AM/AB} = {AN/AC} = {MN/BC}' },
          { titre: 'La réciproque', texte: 'Elle sert à **prouver que deux droites sont parallèles**.', exemple: 'Si {AM/AB} = {AN/AC}, points dans le même ordre.' },
          { titre: 'La contraposée', texte: 'Elle sert à **prouver que deux droites ne sont pas parallèles**.', exemple: 'Si {AM/AB} ≠ {AN/AC}.' },
        ],
      },
    ],
  },
  {
    id: 'ma-express',
    type: 'express',
    matiere: MATHS,
    cours: COURS_THALES,
    titre: 'Le théorème de Thalès',
    blocs: [
      {
        type: 'arbre',
        centre: 'Thalès',
        branches: [
          { titre: 'la **configuration**', feuilles: ['Deux droites sécantes', 'Deux droites parallèles', 'Triangles emboîtés', 'En « papillon »'] },
          { titre: 'le **théorème**', feuilles: ['Calculer une longueur', '{AM/AB} = {AN/AC} = {MN/BC}', 'Produit en croix'] },
          { titre: 'la **réciproque**', feuilles: ['Prouver le parallélisme', 'Rapports égaux', 'Points dans le même ordre'] },
          { titre: 'la **contraposée**', feuilles: ['Prouver le non-parallélisme', 'Rapports différents'] },
        ],
      },
    ],
  },
  {
    id: 'ma-questions',
    type: 'questions',
    matiere: MATHS,
    cours: COURS_THALES,
    position: { rang: 2, total: 4 },
    titre: 'Calculer une longueur avec le théorème de Thalès',
    blocs: [
      {
        type: 'questions',
        titre: 'Les questions à connaître',
        questions: [
          { question: 'Quand peut-on utiliser le théorème de Thalès ?', reponse: 'Quand deux droites **sécantes** sont coupées par deux droites **parallèles**.' },
          { question: 'Quelle égalité donne le théorème ?', reponse: '{AM/AB} = {AN/AC} = {MN/BC} : le **petit triangle** en haut, le **grand** en bas.' },
          { question: 'Comment calcule-t-on la longueur cherchée ?', reponse: 'Avec le **produit en croix**, en gardant les deux rapports utiles.', exemple: '{3/5} = {AN/7}, donc AN = {3 × 7/5} = **4,2 cm**.' },
          { question: 'À quoi sert la réciproque ?', reponse: 'À **prouver** que deux droites sont parallèles.' },
          { question: 'Que faut-il vérifier pour utiliser la réciproque ?', reponse: 'Que les rapports sont égaux **et** que les points sont alignés **dans le même ordre**.' },
          { question: 'À quoi sert la contraposée ?', reponse: 'À prouver que deux droites **ne sont pas** parallèles, quand les rapports sont **différents**.' },
        ],
      },
    ],
  },
  {
    id: 'ma-controle',
    type: 'controle',
    matiere: MATHS,
    cours: COURS_THALES,
    titre: 'Synthèse : le théorème de Thalès',
    blocs: [
      {
        type: 'encadre',
        ton: 'definition',
        texte: 'Le théorème de Thalès relie les longueurs de deux triangles formés par deux droites **sécantes** coupées par deux droites **parallèles**.',
      },
      {
        type: 'tableau',
        titre: 'Quel outil pour quelle question ?',
        colonnes: ['Outil', 'Il sert à…', 'Ce qu’on écrit'],
        lignes: [
          ['Le théorème', '**Calculer** une longueur.', '(MN) et (BC) sont parallèles, donc {AM/AB} = {AN/AC} = {MN/BC}.'],
          ['La réciproque', '**Prouver** que deux droites sont parallèles.', '{AM/AB} = {AN/AC} et les points sont dans le même ordre, donc (MN) et (BC) sont parallèles.'],
          ['La contraposée', 'Prouver que deux droites **ne sont pas** parallèles.', '{AM/AB} ≠ {AN/AC}, donc (MN) et (BC) ne sont pas parallèles.'],
        ],
      },
      {
        type: 'liste',
        style: 'coches',
        titre: 'À savoir par cœur',
        elements: [
          'L’égalité des **trois rapports** : {AM/AB} = {AN/AC} = {MN/BC}.',
          'Le **petit triangle en haut**, le **grand en bas**.',
          'Le **produit en croix** pour trouver la longueur cherchée.',
          'Quel outil choisir : **calculer**, **prouver parallèles** ou **prouver non parallèles**.',
        ],
      },
      {
        type: 'encadre',
        ton: 'piege',
        titre: 'Les pièges fréquents',
        elements: [
          'Utiliser le théorème pour **prouver** un parallélisme : c’est la **réciproque** qu’il faut.',
          'Mélanger les côtés : chaque rapport compare deux côtés **qui se correspondent**.',
          'Oublier de vérifier l’**ordre des points** avant la réciproque.',
          'Comparer des rapports **arrondis** : compare les fractions exactes, ou utilise le produit en croix.',
        ],
      },
      {
        type: 'encadre',
        ton: 'souvent',
        elements: [
          'Calculer une longueur dans une figure en « papillon ».',
          'Démontrer que deux droites sont parallèles avec la **réciproque**.',
          'Rédiger la démonstration complète, **conditions comprises**.',
        ],
      },
    ],
  },
  {
    id: 'ma-methode',
    type: 'methode',
    matiere: MATHS,
    cours: COURS_THALES,
    position: { rang: 2, total: 4 },
    titre: 'Calculer une longueur avec le théorème de Thalès',
    blocs: [
      {
        type: 'tableau',
        titre: 'Quel outil choisir ?',
        colonnes: ['On te demande de…', 'Utilise…', 'Indice'],
        lignes: [
          ['Calculer une longueur', 'Le théorème de Thalès', 'L’énoncé dit que deux droites sont **parallèles**.'],
          ['Prouver que deux droites sont parallèles', 'La réciproque', 'On te donne les longueurs, pas le parallélisme.'],
          ['Prouver que deux droites ne sont pas parallèles', 'La contraposée', 'Les deux rapports sont **différents**.'],
        ],
      },
      {
        type: 'etapes',
        titre: 'La méthode en 5 étapes',
        etapes: [
          { titre: 'Repérer la configuration', texte: 'Nomme le point où les droites se coupent, et les deux droites parallèles.' },
          { titre: 'Écrire l’égalité des rapports', texte: 'Petit triangle en haut, grand triangle en bas : {AM/AB} = {AN/AC} = {MN/BC}' },
          { titre: 'Remplacer par les valeurs connues', texte: 'Garde seulement les deux rapports qui contiennent la longueur cherchée.' },
          { titre: 'Calculer avec le produit en croix', texte: 'AN = {AM × AC/AB}' },
          { titre: 'Conclure', texte: 'Une phrase, avec l’unité.' },
        ],
      },
      {
        type: 'encadre',
        ton: 'modele',
        texte: 'Les droites [[(BM)]] et [[(CN)]] sont sécantes en [[A]], et les droites [[(MN)]] et [[(BC)]] sont parallèles. D’après le théorème de Thalès : {AM/AB} = {AN/AC} = {MN/BC}.',
      },
      {
        type: 'encadre',
        ton: 'exemple',
        texte: 'AM = 3 cm, AB = 5 cm, AC = 7 cm. {3/5} = {AN/7}, donc AN = {3 × 7/5} = **4,2 cm**.',
      },
    ],
  },
];

/**
 * L'exemple d'un type, pour l'aperçu de la page de création (15/10/2026) :
 * celui de maths quand la matière choisie est les mathématiques, celui de
 * français sinon — les deux matières pour lesquelles un exemple est écrit.
 */
export function exemplePour(type, matiereCode) {
  const maths = matiereCode === 'MATHS' ? EXEMPLES_FICHES.find((f) => f.type === type && f.matiere === MATHS) : null;
  return maths ?? EXEMPLES_FICHES.find((f) => f.type === type && f.matiere === FRANCAIS) ?? null;
}
