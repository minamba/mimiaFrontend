import { estUneRedite } from '../lib/storage/redite';

const maintenant = 1_000_000;

describe('estUneRedite — la même phrase transcrite deux fois', () => {
  it('écarte le double du dernier message, arrivé 17 s plus tard (séance du 19/09)', () => {
    expect(estUneRedite("J'ai vu qu'en dessous de la peinture se cachait un bouton.", {
      dernierEnvoi: {
        texte: "J'ai vu qu'en dessous de la peinture se cachait un bouton. J'ai vu qu'en dessus de la peinture se cachait un bouton.",
        le: maintenant - 17000,
      },
      maintenant,
    })).toBe(true);
  });

  it('écarte la même phrase rendue deux fois dans le même tour', () => {
    expect(estUneRedite("J'ai vu qu'en dessus de la peinture se cachait un bouton.", {
      assemble: "J'ai vu qu'en dessous de la peinture se cachait un bouton.",
      maintenant,
    })).toBe(true);
  });

  it('laisse partir une redite demandée par le professeur', () => {
    expect(estUneRedite('Porte, c’est féminin, du coup encastré prend un E', {
      dernierEnvoi: { texte: 'Porte, c’est féminin, du coup encastré prend un E', le: maintenant - 20000 },
      demandeProf: 'Je n’ai pas bien compris, tu peux répéter ?',
      maintenant,
    })).toBe(false);
  });

  it('laisse partir une réponse courte, même identique', () => {
    expect(estUneRedite("J'ai gratté.", {
      dernierEnvoi: { texte: "J'ai gratté.", le: maintenant - 5000 },
      maintenant,
    })).toBe(false);
  });

  it('laisse partir après une minute', () => {
    expect(estUneRedite('la porte s’est ouverte au fond du salon', {
      dernierEnvoi: { texte: 'la porte s’est ouverte au fond du salon', le: maintenant - 90000 },
      maintenant,
    })).toBe(false);
  });

  it('laisse partir une phrase nouvelle', () => {
    expect(estUneRedite('et là j’ai vu un trésor dans la pièce', {
      dernierEnvoi: { texte: 'une porte s’est ouverte au fin fond de mon salon', le: maintenant - 10000 },
      maintenant,
    })).toBe(false);
  });
});
