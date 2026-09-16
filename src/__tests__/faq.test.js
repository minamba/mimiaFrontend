import { render, screen, fireEvent } from '@testing-library/react';
import Faq, { QUESTIONS, schemaFaq } from '../components/Faq';

// Le routeur réel ne se charge pas sous Jest ici : on remplace `Link` par un
// simple lien, comme dans les autres tests (voir calendrierControle.test.js).
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...reste }) => <a href={to} {...reste}>{children}</a>,
}));

const afficher = () => render(<Faq />);

test('toutes les questions sont listées, et aucune réponse n’est ouverte au départ', () => {
  afficher();

  QUESTIONS.forEach(({ question }) => {
    expect(screen.getByRole('button', { name: question })).toHaveAttribute('aria-expanded', 'false');
  });
  expect(screen.queryAllByRole('region')).toHaveLength(0);
});

test('une seule réponse ouverte à la fois', () => {
  afficher();

  const premiere = screen.getByRole('button', { name: QUESTIONS[0].question });
  const deuxieme = screen.getByRole('button', { name: QUESTIONS[1].question });

  fireEvent.click(premiere);
  expect(premiere).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(QUESTIONS[0].reponse)).toBeVisible();

  fireEvent.click(deuxieme);
  expect(premiere).toHaveAttribute('aria-expanded', 'false');
  expect(deuxieme).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(QUESTIONS[0].reponse)).not.toBeVisible();

  // Un second clic sur la question ouverte la referme.
  fireEvent.click(deuxieme);
  expect(deuxieme).toHaveAttribute('aria-expanded', 'false');
});

test('les liens des réponses mènent aux vraies pages', () => {
  afficher();

  fireEvent.click(screen.getByRole('button', { name: /données de mon enfant/ }));
  expect(screen.getByRole('link', { name: /Politique de confidentialité/ }))
    .toHaveAttribute('href', '/confidentialite');
});

test('les moteurs de recherche reçoivent exactement les questions affichées', () => {
  const schema = schemaFaq();

  expect(schema['@type']).toBe('FAQPage');
  expect(schema.mainEntity.map((q) => q.name)).toEqual(QUESTIONS.map((q) => q.question));
});
