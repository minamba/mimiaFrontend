/**
 * LES LISTES EN PYTHON, PAS À PAS — pour l'étal du jeu « Les listes en
 * Python » (09/10/2026). Le pas-à-pas de l'usine (`lib/jeux/pythonPasAPas`)
 * ne connaît pas les listes : celui-ci, écrit pour elles, lit le texte de la
 * question et rejoue le programme ligne par ligne.
 *
 * Il connaît : les entiers, les variables, + − * // %, les comparaisons,
 * `L = [...]`, `L[i]` (indices négatifs compris), `len(L)`, `L.append(…)`,
 * `L.pop()`, `L.pop(i)`, `L.remove(v)`, `L[i] = v`, les listes en
 * compréhension (`[expr for k in range(…) if …]`), `for … in range(…)`,
 * `for x in L`, `if`, `print`. Un indice hors de la liste arrête tout sur
 * « IndexError », comme Python.
 *
 * `listesPasAPas(source)` → { etapes: [{ ligne, listes, variables, sorties,
 * regarde }], sorties } ; `regarde` = { liste, indice } quand une case de la
 * liste est lue ou écrite à ce pas. Il sert à MONTRER, jamais à juger.
 */

const MAX_ETAPES = 300;

class ErreurIndice extends Error {}

export function listesPasAPas(source) {
  const lignes = String(source ?? '').split('\n')
    .map((l, numero) => ({ numero, retrait: l.match(/^ */)[0].length, texte: l.trim() }))
    .filter((l) => l.texte !== '');
  let pos = 0;

  /** Le bloc indenté qui suit (vide s'il n'y en a pas). */
  function sousBloc(retrait) {
    // eslint-disable-next-line no-use-before-define
    return pos < lignes.length && lignes[pos].retrait > retrait ? bloc(lignes[pos].retrait) : [];
  }

  function bloc(retrait) {
    const instructions = [];
    while (pos < lignes.length && lignes[pos].retrait === retrait) {
      const { texte, numero } = lignes[pos];
      pos += 1;
      let r = texte.match(/^for (\w+) in (.+):$/);
      if (r) instructions.push({ sorte: 'for', numero, variable: r[1], iterable: r[2], corps: sousBloc(retrait) });
      else if ((r = texte.match(/^if (.+):$/))) instructions.push({ sorte: 'if', numero, condition: r[1], corps: sousBloc(retrait) }); // eslint-disable-line no-cond-assign
      else instructions.push({ sorte: 'simple', numero, texte });
    }
    return instructions;
  }

  const programme = bloc(0);
  const env = {};
  const sorties = [];
  const etapes = [];
  let regarde = null;
  let enCours = 0;

  const photo = (numero) => {
    if (etapes.length >= MAX_ETAPES) throw new Error('trop long');
    const listes = {};
    const variables = {};
    Object.entries(env).forEach(([k, v]) => {
      if (Array.isArray(v)) listes[k] = [...v];
      else variables[k] = v;
    });
    etapes.push({
      ligne: numero, listes, variables, sorties: [...sorties], regarde,
    });
    regarde = null;
  };

  const indiceReel = (liste, i) => {
    const j = i < 0 ? liste.length + i : i;
    if (!Number.isInteger(j) || j < 0 || j >= liste.length) throw new ErreurIndice('IndexError');
    return j;
  };

  function evaluer(expression, local = env) {
    const jetons = expression.match(/\d+|\w+|\/\/|==|!=|<=|>=|[-+*%<>()[\],]/g) ?? [];
    let i = 0;
    const voir = () => jetons[i];
    const prendre = () => { i += 1; return jetons[i - 1]; };
    /* eslint-disable no-use-before-define */
    function comparaison() {
      let g = additif();
      while (['<', '>', '<=', '>=', '==', '!='].includes(voir())) {
        const op = prendre();
        const d = additif();
        g = {
          '<': g < d, '>': g > d, '<=': g <= d, '>=': g >= d, '==': g === d, '!=': g !== d,
        }[op];
      }
      return g;
    }
    function additif() {
      let v = multiplicatif();
      while (voir() === '+' || voir() === '-') {
        const op = prendre();
        const d = multiplicatif();
        v = op === '+' ? v + d : v - d;
      }
      return v;
    }
    function multiplicatif() {
      let v = unaire();
      while (['*', '//', '%'].includes(voir())) {
        const op = prendre();
        const d = unaire();
        if (op === '*') v *= d;
        else if (op === '//') v = Math.floor(v / d);
        else v = ((v % d) + d) % d;
      }
      return v;
    }
    function unaire() {
      if (voir() === '-') { prendre(); return -unaire(); }
      return suffixe(atome());
    }
    function suffixe(base) {
      let v = base;
      while (voir() === '[') {
        prendre();
        const k = comparaison();
        prendre();
        if (!Array.isArray(v.valeur)) throw new Error('pas une liste');
        const j = indiceReel(v.valeur, k);
        regarde = { liste: v.nom, indice: j };
        v = { valeur: v.valeur[j] };
      }
      return v.valeur;
    }
    function atome() {
      const j = prendre();
      if (/^\d+$/.test(j)) return { valeur: Number(j) };
      if (j === '(') {
        const v = comparaison();
        prendre();
        return { valeur: v };
      }
      if (j === 'len' && voir() === '(') {
        prendre();
        const v = comparaison();
        prendre();
        return { valeur: v.length };
      }
      if (!(j in local)) throw new Error(`variable inconnue : ${j}`);
      return { valeur: local[j], nom: j };
    }
    /* eslint-enable no-use-before-define */
    const v = comparaison();
    if (i !== jetons.length) throw new Error('expression mal lue');
    return v;
  }

  /** Les valeurs d'un « range(…) » ou d'une liste. */
  function parcours(iterable) {
    const r = iterable.match(/^range\((.*)\)$/);
    if (r) {
      const args = r[1].split(',').map((x) => evaluer(x.trim()));
      const [a, b] = args.length === 1 ? [0, args[0]] : args;
      return Array.from({ length: Math.max(0, b - a) }, (_, k) => a + k);
    }
    const v = evaluer(iterable);
    if (!Array.isArray(v)) throw new Error('pas itérable');
    return [...v];
  }

  /** Une liste écrite : « [3, 5] », « [] », ou en compréhension. */
  function liste(texte) {
    const t = texte.trim();
    const r = t.match(/^\[(.+) for (\w+) in (.+?)(?: if (.+))?\]$/);
    if (r) {
      const sortie = [];
      parcours(r[3]).forEach((k) => {
        const local = { ...env, [r[2]]: k };
        if (!r[4] || evaluer(r[4], local)) sortie.push(evaluer(r[1], local));
      });
      return sortie;
    }
    if (/^\[\s*\]$/.test(t)) return [];
    const s = t.match(/^\[(.*)\]$/);
    if (!s) return null;
    return s[1].split(',').map((x) => evaluer(x.trim()));
  }

  const ecrire = (v) => (Array.isArray(v) ? `[${v.join(', ')}]` : String(v));

  function simple(t) {
    let r;
    if ((r = t.match(/^print\((.*)\)$/))) { // eslint-disable-line no-cond-assign
      sorties.push(ecrire(evaluer(r[1])));
    } else if ((r = t.match(/^(\w+)\.append\((.*)\)$/))) { // eslint-disable-line no-cond-assign
      const v = evaluer(r[2]);
      env[r[1]].push(v);
      regarde = { liste: r[1], indice: env[r[1]].length - 1 };
    } else if ((r = t.match(/^(?:(\w+) = )?(\w+)\.pop\((.*)\)$/))) { // eslint-disable-line no-cond-assign
      const l = env[r[2]];
      const j = r[3].trim() === '' ? l.length - 1 : indiceReel(l, evaluer(r[3]));
      if (l.length === 0) throw new ErreurIndice('IndexError');
      const [v] = l.splice(j, 1);
      if (r[1]) env[r[1]] = v;
    } else if ((r = t.match(/^(\w+)\.remove\((.*)\)$/))) { // eslint-disable-line no-cond-assign
      const l = env[r[1]];
      const j = l.indexOf(evaluer(r[2]));
      if (j === -1) throw new Error('ValueError');
      l.splice(j, 1);
    } else if ((r = t.match(/^(\w+)\[(.+)\] = (.+)$/))) { // eslint-disable-line no-cond-assign
      const l = env[r[1]];
      const j = indiceReel(l, evaluer(r[2]));
      l[j] = evaluer(r[3]);
      regarde = { liste: r[1], indice: j };
    } else if ((r = t.match(/^(\w+) = (\[.*\])$/))) { // eslint-disable-line no-cond-assign
      const v = liste(r[2]);
      if (v === null) throw new Error('liste mal lue');
      env[r[1]] = v;
    } else if ((r = t.match(/^(\w+) = (.+)$/))) { // eslint-disable-line no-cond-assign
      env[r[1]] = evaluer(r[2]);
    } else {
      throw new Error(`instruction inconnue : ${t}`);
    }
  }

  function executer(instructions) {
    instructions.forEach((ins) => {
      enCours = ins.numero;
      if (ins.sorte === 'for') {
        const valeurs = parcours(ins.iterable);
        const source = /^range/.test(ins.iterable) ? null : ins.iterable;
        valeurs.forEach((v, k) => {
          env[ins.variable] = v;
          if (source) regarde = { liste: source, indice: k };
          photo(ins.numero);
          executer(ins.corps);
          enCours = ins.numero;
        });
      } else if (ins.sorte === 'if') {
        const oui = evaluer(ins.condition);
        photo(ins.numero);
        if (oui) executer(ins.corps);
      } else {
        simple(ins.texte);
        photo(ins.numero);
      }
    });
  }

  try {
    executer(programme);
  } catch (e) {
    if (e instanceof ErreurIndice) {
      sorties.push('IndexError');
      photo(enCours);
      etapes[etapes.length - 1].erreur = true;
      return { etapes, sorties };
    }
    // Un programme qu'on ne sait pas rejouer : pas d'animation, rien de cassé.
    return { etapes: [], sorties: [] };
  }
  return { etapes, sorties };
}
