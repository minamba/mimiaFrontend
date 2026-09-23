const React = require('react');
"use strict";

var _interopRequireDefault = require("C:/Users/daryu/Documents/React-projects/school_ia/node_modules/@babel/runtime/helpers/interopRequireDefault.js").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = jeuSimple;
var _repliques = require("../../lib/jeux/voix/repliques");
var _JeuDeChoix = _interopRequireDefault(require("./JeuDeChoix"));
var _jsxFileName = "C:\\Users\\daryu\\Documents\\React-projects\\school_ia\\components\\jeux\\JeuSimple.js";
/**
 * LES JEUX DU CM1, D'UNE SEULE FAÇON — Camara, le 21/09/2026 : « fais tout ».
 *
 * Un jeu du CM1 est un MODULE qui décrit ses manches, et rien d'autre :
 *   - `MANCHES`, `serie(graine, niveau)`, `bilan(n)` ;
 *   - chaque manche porte `consigne` (la clé de sa phrase dans `PHRASES`),
 *     `choix` ([{ cle, libelle }]) et, s'il le faut, `aide` (une clé) ;
 *   - `verdict(manche, cle)` rend 'juste' ou la clé de la phrase d'erreur ;
 *   - `PHRASES` porte TOUTES ses phrases dites : c'est ce que le registre des
 *     voix enregistre, sans liste à tenir à la main.
 *
 * L'écran est celui des jeux à choix ; le jeu n'apporte que le dessin de sa
 * question (`rendreQuestion`) et ce qu'il montre une fois la réponse trouvée.
 *
 * UNE CLASSE PEUT AVOIR SON MODULE : `parNiveau: { CM2: { module, prefixe } }`.
 * L'écran reste le même ; les dessins lisent la sorte de manche (`consigne`).
 */
function jeuSimple({
  module: moduleCM1,
  prefixe: prefixeCM1,
  classe,
  rendreQuestion,
  rendreApres,
  rendreChoix,
  niveau: niveauFixe,
  parNiveau = {}
}) {
  const regles = {};
  const regle = niveau => {
    if (!regles[niveau]) {
      var _parNiveau$niveau;
      // Le CM2 a son propre module, et donc ses propres voix : `parNiveau.CM2`.
      const {
        module,
        prefixe
      } = (_parNiveau$niveau = parNiveau[niveau]) !== null && _parNiveau$niveau !== void 0 ? _parNiveau$niveau : {
        module: moduleCM1,
        prefixe: prefixeCM1
      };
      const dire = (0, _repliques.phrasesDe)(prefixe, module);
      regles[niveau] = {
        MANCHES: module.MANCHES,
        serie: graine => module.serie(graine, niveau),
        bilan: n => module.bilan(n, module.MANCHES),
        consigne: m => dire(m.consigne),
        // Un choix peut être un dessin : le module garde la donnée, l'écran la dessine.
        choix: m => rendreChoix ? m.choix.map(c => ({
          ...c,
          libelle: rendreChoix(c, m)
        })) : m.choix,
        verdict: module.verdict,
        erreur: (m, sens) => dire(sens),
        aide: m => m.aide ? dire(m.aide) : null
      };
    }
    return regles[niveau];
  };

  /** Une fois la manche finie, la bonne réponse reste montrée — surtout quand on l'a donnée. */
  const laBonneReponse = niveau => m => {
    const bonne = regle(niveau).choix(m).find(c => String(c.cle) === String(m.bonne));
    return bonne ? /*#__PURE__*/React.createElement("div", {
      className: "scene__reponse",
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 49,
        columnNumber: 20
      }
    }, bonne.libelle) : null;
  };
  function Jeu({
    niveau = niveauFixe !== null && niveauFixe !== void 0 ? niveauFixe : 'CM1',
    ...props
  }) {
    return /*#__PURE__*/React.createElement(_JeuDeChoix.default, Object.assign({}, props, {
      regle: regle(niveau)
      // La classe de l'enfant marque la scène : chaque niveau peut avoir son
      // décor (`.jeu--niv-cm1`), sur le même écran.
      ,
      classe: `${classe} jeu--niv-${niveau.toLowerCase()}`,
      rendreQuestion: rendreQuestion !== null && rendreQuestion !== void 0 ? rendreQuestion : m => /*#__PURE__*/React.createElement("p", {
        className: "phrase-a-trou",
        __self: this,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 60,
          columnNumber: 51
        }
      }, m.question),
      rendreApres: rendreApres !== null && rendreApres !== void 0 ? rendreApres : laBonneReponse(niveau),
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 54,
        columnNumber: 7
      }
    }));
  }
  return Jeu;
}