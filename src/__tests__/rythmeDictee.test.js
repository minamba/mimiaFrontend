/**
 * LE TEMPS LAISSÉ POUR ÉCRIRE UNE DICTÉE, CLASSE PAR CLASSE — Camara, le
 * 01/11/2026 : le plus long au CP, puis de moins en moins jusqu'au collège.
 */
import { rythmeDEcriture } from '../lib/storage/voixService';

// Le silence posé après « deux. », audio de 0,8 s déduit — même calcul que
// `silenceDictee`.
const silenceApresDeux = (niveau, age) => {
  const { parSeconde, plancher } = rythmeDEcriture(niveau, age);
  return Math.min(Math.max('deux.'.length / parSeconde - 0.8, plancher), 60);
};

describe('rythmeDEcriture', () => {
  it('laisse le plus de temps au CP, puis raccourcit classe après classe', () => {
    const classes = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e', 'Seconde'];
    const silences = classes.map((c) => silenceApresDeux(c));

    for (let i = 1; i < silences.length; i += 1) {
      expect(silences[i]).toBeLessThanOrEqual(silences[i - 1]);
    }

    // Le CP : 11 s par mot, demandé par Camara le 01/11/2026 (environ 4 s avant).
    expect(silences[0]).toBe(11);
    // Les paliers de Camara (01/11/2026) : 5 s du CE2 au CM2, 3 s au collège,
    // 2 s au lycée, où l'on ne fait que des dictées de phrases.
    ['CE2', 'CM1', 'CM2'].forEach((c) => expect(silenceApresDeux(c)).toBeCloseTo(5, 0));
    ['6e', '5e', '4e', '3e'].forEach((c) => expect(silenceApresDeux(c)).toBe(3));
    expect(silenceApresDeux('Seconde')).toBe(2);
  });

  it('reconnaît les libellés réels des classes', () => {
    expect(rythmeDEcriture('CP').plancher).toBe(11);
    expect(rythmeDEcriture('3e prépa-métiers').parSeconde).toBe(2.4);
    expect(rythmeDEcriture('Première générale').parSeconde).toBe(3.0);
    expect(rythmeDEcriture('Terminale STMG').parSeconde).toBe(3.0);
  });

  it('se replie sur l’âge quand la classe est inconnue', () => {
    expect(rythmeDEcriture('', 6)).toEqual({ parSeconde: 0.5, plancher: 11 });
    expect(rythmeDEcriture(undefined, 14).parSeconde).toBe(2.4);
    expect(rythmeDEcriture(null, 17).parSeconde).toBe(3.0);
  });
});
