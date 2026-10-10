/**
 * LE PROGRAMME PYTHON, PAS À PAS — pour l'usine du jeu « Python : que vaut la
 * variable ? » (09/10/2026). Une fois la réponse donnée, l'usine REJOUE le
 * programme sous les yeux de l'élève : la ligne qui s'exécute s'allume, chaque
 * variable change dans son tube, l'affichage tombe à la fin.
 *
 * Il lit le texte de la question (le même Python que le module) : entiers,
 * variables, + − * // % **, comparaisons, print, for … in range(…), while,
 * if / elif / else, def / return. Le test du module a son PROPRE interpréteur,
 * écrit à part : celui-ci ne sert qu'à montrer, jamais à juger.
 *
 * `pasAPas(source)` → { etapes: [{ ligne, variables, sorties }], sorties }.
 * `ligne` est l'indice de la ligne du texte ; `variables`, l'état visible à ce
 * moment (les variables locales d'une fonction, préfixées de son nom).
 */

const MAX_ETAPES = 400;

export function pasAPas(source) {
  const brutes = String(source ?? '').split('\n');
  const lignes = brutes
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
      const corps = () => sousBloc(retrait);
      let r = texte.match(/^for (\w+) in range\((.*)\):$/);
      if (r) {
        instructions.push({
          sorte: 'for', numero, variable: r[1], args: r[2], corps: corps(),
        });
      } else if ((r = texte.match(/^while (.+):$/))) { // eslint-disable-line no-cond-assign
        instructions.push({ sorte: 'while', numero, condition: r[1], corps: corps() });
      } else if ((r = texte.match(/^if (.+):$/))) { // eslint-disable-line no-cond-assign
        const branches = [{ condition: r[1], numero, corps: corps() }];
        let sinon = null;
        while (pos < lignes.length && lignes[pos].retrait === retrait && /^(elif .+|else):$/.test(lignes[pos].texte)) {
          const t = lignes[pos].texte;
          const n = lignes[pos].numero;
          pos += 1;
          if (t === 'else:') sinon = { numero: n, corps: corps() };
          else branches.push({ condition: t.slice(5, -1), numero: n, corps: corps() });
        }
        instructions.push({ sorte: 'if', numero, branches, sinon });
      } else if ((r = texte.match(/^def (\w+)\((.*)\):$/))) { // eslint-disable-line no-cond-assign
        instructions.push({
          sorte: 'def', numero, nom: r[1], parametres: r[2].split(',').map((p) => p.trim()).filter(Boolean), corps: corps(),
        });
      } else {
        instructions.push({ sorte: 'simple', numero, texte });
      }
    }
    return instructions;
  }

  const programme = bloc(0);
  const globaux = {};
  const fonctions = {};
  const sorties = [];
  const etapes = [];
  const pile = [];

  const photo = (numero, env) => {
    if (etapes.length >= MAX_ETAPES) throw new Error('trop long');
    const variables = { ...globaux };
    if (env !== globaux) {
      Object.entries(env).forEach(([k, v]) => {
        if (globaux[k] !== v || !(k in globaux)) variables[`${pile[pile.length - 1]}.${k}`] = v;
      });
    }
    etapes.push({ ligne: numero, variables, sorties: [...sorties] });
  };

  function decouper(s) {
    const liste = [];
    let profondeur = 0;
    let courant = '';
    [...s].forEach((c) => {
      if (c === '(') profondeur += 1;
      if (c === ')') profondeur -= 1;
      if (c === ',' && profondeur === 0) {
        liste.push(courant);
        courant = '';
      } else courant += c;
    });
    if (courant.trim()) liste.push(courant);
    return liste.map((x) => x.trim());
  }

  function evaluer(expression, env) {
    const jetons = expression.match(/\d+|\w+|\*\*|\/\/|==|!=|<=|>=|[-+*%<>(),]/g) ?? [];
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
      const base = atome();
      if (voir() === '**') { prendre(); return base ** unaire(); }
      return base;
    }
    function atome() {
      const j = prendre();
      if (/^\d+$/.test(j)) return Number(j);
      if (j === '(') {
        const v = comparaison();
        prendre();
        return v;
      }
      if (voir() === '(') {
        prendre();
        const args = [];
        while (voir() !== ')') {
          args.push(comparaison());
          if (voir() === ',') prendre();
        }
        prendre();
        return appeler(j, args);
      }
      if (!(j in env)) throw new Error(`variable inconnue : ${j}`);
      return env[j];
    }
    /* eslint-enable no-use-before-define */
    return comparaison();
  }

  function appeler(nom, args) {
    const f = fonctions[nom];
    if (!f) throw new Error(`fonction inconnue : ${nom}`);
    const local = {};
    f.parametres.forEach((p, k) => { local[p] = args[k]; });
    pile.push(nom);
    const env = new Proxy(local, {
      has: (cible, k) => k in cible || k in globaux,
      get: (cible, k) => (k in cible ? cible[k] : globaux[k]),
    });
    photo(f.numero, local);
    // eslint-disable-next-line no-use-before-define
    const r = executer(f.corps, env, local);
    pile.pop();
    return r ? r.valeur : null;
  }

  function executer(instructions, env, cible = env) {
    for (let k = 0; k < instructions.length; k += 1) {
      const ins = instructions[k];
      let r;
      if (ins.sorte === 'for') {
        const a = decouper(ins.args).map((x) => evaluer(x, env));
        const [debut, fin, saut] = a.length === 1 ? [0, a[0], 1] : [a[0], a[1], a[2] ?? 1];
        for (let v = debut; saut > 0 ? v < fin : v > fin; v += saut) {
          cible[ins.variable] = v; // eslint-disable-line no-param-reassign
          photo(ins.numero, cible);
          r = executer(ins.corps, env, cible);
          if (r) return r;
        }
      } else if (ins.sorte === 'while') {
        for (;;) {
          photo(ins.numero, cible);
          if (!evaluer(ins.condition, env)) break;
          r = executer(ins.corps, env, cible);
          if (r) return r;
        }
      } else if (ins.sorte === 'if') {
        photo(ins.numero, cible);
        const branche = ins.branches.find((b) => evaluer(b.condition, env));
        const suite = branche ?? ins.sinon;
        if (suite) {
          if (suite.numero !== ins.numero) photo(suite.numero, cible);
          r = executer(suite.corps, env, cible);
          if (r) return r;
        }
      } else if (ins.sorte === 'def') {
        fonctions[ins.nom] = ins;
      } else {
        const t = ins.texte;
        let m = t.match(/^print\((.*)\)$/);
        if (m) {
          sorties.push(decouper(m[1]).map((x) => String(evaluer(x, env))).join(' '));
        } else if ((m = t.match(/^return (.+)$/))) { // eslint-disable-line no-cond-assign
          const valeur = evaluer(m[1], env);
          photo(ins.numero, cible);
          return { valeur };
        } else if ((m = t.match(/^(\w+) ([-+*])= (.+)$/))) { // eslint-disable-line no-cond-assign
          const d = evaluer(m[3], env);
          const avant = env[m[1]];
          cible[m[1]] = { '+': avant + d, '-': avant - d, '*': avant * d }[m[2]]; // eslint-disable-line no-param-reassign
        } else if ((m = t.match(/^(\w+) = (.+)$/))) { // eslint-disable-line no-cond-assign
          cible[m[1]] = evaluer(m[2], env); // eslint-disable-line no-param-reassign
        } else {
          throw new Error(`instruction inconnue : ${t}`);
        }
        photo(ins.numero, cible);
      }
    }
    return null;
  }

  try {
    executer(programme, globaux);
  } catch {
    // Un programme qu'on ne sait pas rejouer : pas d'animation, rien de cassé.
    return { etapes: [], sorties: [] };
  }
  return { etapes, sorties };
}
