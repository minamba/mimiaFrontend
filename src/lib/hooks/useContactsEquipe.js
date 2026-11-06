import { useEffect, useState } from 'react';
import { getContactsEquipe } from '../api/adminApi';

/**
 * LES ADRESSES DE L'ÉQUIPE, POUR LES COPIES — Camara, le 19/10/2026 : proposées
 * dès qu'on tape dans un champ Cc ou Cci. Lues une fois par page : la liste des
 * administrateurs ne change pas pendant qu'on écrit un courriel.
 *
 * Rend [{ nom, mail, equipe: true }] — vide tant qu'elle n'est pas arrivée, ou
 * si elle n'a pas pu l'être (les champs restent utilisables à la main).
 */
let enCache = null;

export default function useContactsEquipe() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    let vivant = true;
    if (!enCache) {
      enCache = Promise.resolve()
        .then(() => getContactsEquipe())
        .then(({ data }) => (data ?? []).map((c) => ({ nom: c.nom, mail: c.mail, equipe: true })))
        .catch(() => { enCache = null; return []; });
    }
    enCache.then((liste) => { if (vivant) setContacts(liste); });
    return () => { vivant = false; };
  }, []);

  return contacts;
}
