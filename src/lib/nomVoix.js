/**
 * LE NOM D'UN MODÈLE DE VOIX, TEL QU'ON LE LIT — Camara, le 28/09/2026 : « il
 * faut préciser OpenAI GPT ou Gemini pour qu'on puisse voir la différence ».
 * Un identifiant inconnu s'affiche tel quel : mieux vaut un nom brut qu'un nom
 * inventé.
 */
export function nomVoix({ fournisseur, modele } = {}) {
  const id = (modele ?? '').toLowerCase();

  if (id.startsWith('gemini')) {
    const version = id.includes('flash-lite') ? 'Flash-Lite' : id.includes('flash') ? 'Flash' : '';
    return `Google Gemini${version ? ` ${version}` : ''}`;
  }
  if (id === 'tts-1') return 'OpenAI TTS-1 (secours)';
  if (id.startsWith('gpt-4o-mini')) return 'OpenAI GPT-4o-mini';
  if (fournisseur === 'openai') return `OpenAI ${modele}`;

  return modele || 'Voix';
}
