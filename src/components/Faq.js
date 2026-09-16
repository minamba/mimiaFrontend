import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * LES QUESTIONS FRÉQUENTES DE LA PAGE D'ACCUEIL — Camara, le 15/09/2026.
 *
 * ELLES RÉPONDENT À CE QUI RETIENT UN PARENT JUSTE AVANT DE S'INSCRIRE : la
 * triche, le sérieux, les données, l'engagement. D'où leur place, entre les
 * avis et l'appel final.
 *
 * RIEN N'EST AFFIRMÉ ICI QUI NE SOIT DÉJÀ VRAI AILLEURS : l'hébergement et la
 * suppression reprennent le bloc « La confiance », l'engagement et la
 * résiliation les conditions de vente (article 5), le prix le bloc des tarifs.
 * Une réponse qui contredirait les CGV serait pire que pas de réponse.
 *
 * ⚠️ La liste des matières (question 6) est écrite à la main : à relire le jour
 * où une matière ouvre ou ferme. Elle renvoie à l'équipe, qui, elle, vient de
 * la base.
 *
 * UNE SEULE QUESTION OUVERTE À LA FOIS : ouvrir la suivante referme la
 * précédente, et la liste reste lisible sur un téléphone.
 */
export const QUESTIONS = [
  {
    question: 'Pourquoi le professeur ne donne-t-il pas directement la réponse ?',
    reponse:
      "Parce qu'une réponse recopiée ne s'apprend pas. Avant d'expliquer, le professeur demande à votre enfant ce qu'il a déjà essayé, une question à la fois, puis l'amène à trouver par lui-même. C'est ce qui lui permet de refaire l'exercice seul, le jour du contrôle.",
  },
  {
    question: 'Mon enfant peut-il s’en servir pour faire ses devoirs à sa place ?',
    reponse:
      "Non, et c'est voulu. Le professeur guide, reformule, donne des pistes et vérifie ce que votre enfant propose, mais il ne fait jamais le devoir à sa place.",
  },
  {
    question: 'Comment le professeur aide-t-il à préparer un contrôle ?',
    reponse:
      "Votre enfant ajoute son contrôle dans son calendrier, ou l'annonce simplement à son professeur pendant le cours. Le professeur le lui rappelle ensuite et lui propose de s'y entraîner ; une jauge montre où il en est dans ses révisions, à mesure qu'il travaille les notions du contrôle.",
  },
  {
    question: 'Et pour le brevet et le bac ?',
    reponse:
      "Mimia prépare au brevet, aux épreuves anticipées de français et de mathématiques en première, et au bac général et technologique. Pour chaque épreuve écrite, votre enfant voit où il en est. Au lycée général, vous cochez ses spécialités dans son profil : leurs épreuves s'ajoutent d'elles-mêmes.",
  },
  {
    question: 'Comment le professeur se souvient-il de mon enfant ?',
    reponse:
      "Chaque séance enrichit le profil de votre enfant : ce qu'il maîtrise, ce qui reste fragile, ce qu'il a déjà travaillé. Le professeur reprend là où ils s'étaient arrêtés, et quand un blocage vient d'une notion plus ancienne, il remonte jusqu'à elle, même si elle date du primaire.",
  },
  {
    question: 'Quelles matières et quelles classes ?',
    reponse:
      "Du CP à la Terminale : mathématiques, français, histoire-géographie, anglais, sciences puis physique-chimie et SVT, espagnol en LV2 et philosophie. Au lycée s'ajoutent les spécialités de la voie générale et celles des séries STMG, ST2S et STL. Chaque matière a son professeur : vous les retrouvez tous dans l'équipe pédagogique, plus haut sur cette page.",
  },
  {
    question: 'Mon enfant parle-t-il vraiment avec son professeur ?',
    reponse:
      "Oui. Le professeur parle à voix haute, en temps réel, et votre enfant lui répond au micro, ou par écrit s'il préfère. Ce qui doit être écrit, un calcul ou un énoncé, s'affiche au tableau pendant qu'il continue d'expliquer.",
  },
  {
    question: 'Comment mon enfant se connecte-t-il ?',
    reponse:
      "Vous créez son profil depuis votre compte, et il reçoit un code personnel. Il le saisit sur mimia.fr avec le bouton « J'ai un code », et retrouve directement ses matières, sans passer par votre compte ni connaître votre mot de passe.",
  },
  {
    question: 'Combien ça coûte, et puis-je arrêter quand je veux ?',
    reponse:
      "Les formules commencent à 39,90 € par mois ; avec Duo et Famille, plusieurs enfants partagent un même pot d'heures. L'abonnement est sans engagement : vous le résiliez depuis votre espace, sans avoir à nous écrire, et il s'arrête à la fin de la période en cours.",
    liens: [
      { to: '/tarifs', libelle: 'Voir les formules' },
      { to: '/cgv', libelle: 'Conditions de vente' },
    ],
  },
  {
    question: 'Les données de mon enfant sont-elles protégées ?',
    reponse:
      'Oui. Elles sont hébergées en Europe, conservées pour une durée limitée, et supprimées sur simple demande.',
    liens: [{ to: '/confidentialite', libelle: 'Politique de confidentialité' }],
  },
];

/**
 * Les mêmes questions, lisibles par les moteurs de recherche : Google peut les
 * afficher directement sous le résultat. Construit depuis `QUESTIONS`, jamais
 * recopié — sinon la page et ce qu'on déclare finiraient par diverger.
 */
export const schemaFaq = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: QUESTIONS.map(({ question, reponse }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: reponse },
  })),
});

export default function Faq() {
  const [ouverte, setOuverte] = useState(null);

  return (
    <section className="faq" id="faq">
      <header className="section__entete">
        <span className="etiquette">Questions fréquentes</span>
        <h2>
          Ce que les parents <em className="titre-accent">nous demandent</em>
        </h2>
      </header>

      <ul className="faq__liste">
        {QUESTIONS.map(({ question, reponse, liens }, index) => {
          const estOuverte = ouverte === index;
          const idQuestion = `faq-question-${index}`;
          const idReponse = `faq-reponse-${index}`;

          return (
            <li key={question} className={`faq__item${estOuverte ? ' faq__item--ouverte' : ''}`}>
              <h3 className="faq__question">
                <button
                  type="button"
                  id={idQuestion}
                  aria-expanded={estOuverte}
                  aria-controls={idReponse}
                  onClick={() => setOuverte(estOuverte ? null : index)}
                >
                  <span>{question}</span>
                  <span className="faq__signe" aria-hidden="true" />
                </button>
              </h3>

              <div
                id={idReponse}
                role="region"
                aria-labelledby={idQuestion}
                className="faq__reponse"
                hidden={!estOuverte}
              >
                <p>{reponse}</p>
                {liens && (
                  <p className="faq__liens">
                    {liens.map((lien) => (
                      <Link key={lien.to} to={lien.to}>
                        {lien.libelle} <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <script
        type="application/ld+json"
        // Du JSON produit par `JSON.stringify` sur nos propres textes : aucune
        // donnée venue d'un visiteur n'y passe.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq()) }}
      />
    </section>
  );
}
