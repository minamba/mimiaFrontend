// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom ne sait pas jouer un son : sans ces bouchons, chaque jeu qui parle
// écrirait « Not implemented: HTMLMediaElement.prototype.play » dans la
// console des tests. Un test qui veut vérifier CE QUI est dit les espionne.
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  configurable: true, writable: true, value: () => Promise.resolve(),
});
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  configurable: true, writable: true, value: () => {},
});
