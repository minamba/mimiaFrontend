import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { envoyerScanMobile, lireScanMobile } from '../lib/api/scanMobileApi';
import { reduire, TAILLE_MAX, TYPES_ACCEPTES } from './PieceJointe';

/**
 * LA PAGE DU TÉLÉPHONE, APRÈS LE QR CODE.
 *
 * Voulu par Camara le 13/09/2026. L'enfant a visé le QR code affiché sur son
 * ordinateur : il arrive ici, sans compte et sans code. Un seul geste
 * possible — prendre sa copie en photo et l'envoyer.
 *
 * TOUT EST GROS ET DIRECT : c'est un téléphone, tenu d'une main, l'autre
 * tenant la feuille. Deux boutons au plus à l'écran à la fois.
 *
 * La photo est RÉDUITE AVANT DE PARTIR — le même `reduire` que le trombone :
 * douze mégapixels sur le réseau d'une maison, c'est long pour rien, le
 * professeur n'en lit pas plus.
 */
export default function ScanMobile() {
  const { jeton } = useParams();

  const [info, setInfo] = useState(null);
  const [etat, setEtat] = useState('chargement');
  const [fichier, setFichier] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    lireScanMobile(jeton)
      .then(({ data }) => {
        if (!vivant) return;
        setInfo(data);
        setEtat(data?.dejaEnvoye ? 'deja' : 'pret');
      })
      .catch((e) => {
        if (!vivant) return;
        setEtat(e?.response?.status === 404 ? 'expire' : 'erreur');
      });

    return () => { vivant = false; };
  }, [jeton]);

  // L'aperçu local est relâché dès qu'on n'en a plus besoin.
  useEffect(() => () => { if (apercu) URL.revokeObjectURL(apercu); }, [apercu]);

  const prof = info?.profPrenom ?? 'ton professeur';

  const choisir = (choisi) => {
    if (!choisi) return;
    setErreur(null);
    setFichier(choisi);
    setApercu(choisi.type.startsWith('image/') ? URL.createObjectURL(choisi) : null);
  };

  const envoyer = async () => {
    if (!fichier) return;

    setEtat('envoi');
    setErreur(null);
    setProgression(0);

    try {
      const aEnvoyer = await reduire(fichier);

      if (aEnvoyer.size > TAILLE_MAX) {
        setErreur('Cette photo est trop lourde. Essaie de la reprendre.');
        setEtat('pret');
        return;
      }

      await envoyerScanMobile(jeton, aEnvoyer, {
        onProgression: (e) => {
          if (e?.total) setProgression(Math.round((e.loaded / e.total) * 100));
        },
      });

      setEtat('envoye');
    } catch (e) {
      if (e?.response?.status === 404) {
        setEtat('expire');
        return;
      }

      setErreur(e?.response?.data?.message ?? 'La photo n’a pas pu partir. Tu peux réessayer ?');
      setEtat('pret');
    }
  };

  const champ = (id, libelle, avecCapture) => (
    <label htmlFor={id} className={`btn scan-page__bouton${avecCapture ? '' : ' btn--fantome'}`}>
      {avecCapture ? '📷 ' : '🖼️ '}{libelle}
      <input
        id={id}
        type="file"
        hidden
        accept={avecCapture ? 'image/*' : TYPES_ACCEPTES}
        capture={avecCapture ? 'environment' : undefined}
        onChange={(e) => {
          const choisi = e.target.files?.[0];
          e.target.value = '';
          choisir(choisi);
        }}
      />
    </label>
  );

  return (
    <section className="scan-page">
      {etat === 'chargement' && <p className="etat-vide">Chargement…</p>}

      {etat === 'expire' && (
        <div className="scan-page__message">
          <p className="scan-page__grand" aria-hidden="true">⏱️</p>
          <h1>Ce QR code a expiré</h1>
          <p>Sur ton ordinateur, clique à nouveau sur le bouton scanner pour en avoir un nouveau.</p>
        </div>
      )}

      {etat === 'erreur' && (
        <div className="scan-page__message">
          <h1>Oups, la page n’a pas pu se charger</h1>
          <p>Vérifie que ton téléphone est bien connecté à internet, puis vise à nouveau le QR code.</p>
        </div>
      )}

      {etat === 'deja' && (
        <div className="scan-page__message">
          <p className="scan-page__grand" aria-hidden="true">✅</p>
          <h1>Ta photo est déjà partie</h1>
          <p>Pour envoyer une autre page, demande un nouveau QR code sur ton ordinateur.</p>
        </div>
      )}

      {etat === 'envoye' && (
        <div className="scan-page__message" role="status">
          <p className="scan-page__grand" aria-hidden="true">✅</p>
          <h1>C’est envoyé !</h1>
          <p>Retourne sur ton ordinateur : {prof} regarde ta photo.</p>
        </div>
      )}

      {(etat === 'pret' || etat === 'envoi') && (
        <div className="scan-page__contenu">
          <h1 className="scan-page__titre">Envoie ta copie à {prof}</h1>
          {info?.matiere && <p className="scan-page__matiere">{info.matiere}</p>}

          {erreur && <p className="alert">{erreur}</p>}

          {!fichier ? (
            <div className="scan-page__boutons">
              {champ('scan-photo', 'Prendre la photo', true)}
              {champ('scan-galerie', 'Choisir dans la galerie', false)}
            </div>
          ) : (
            <>
              <div className="scan-page__apercu">
                {apercu ? (
                  <img src={apercu} alt="Ta copie, avant envoi" />
                ) : (
                  <p>📄 {fichier.name}</p>
                )}
              </div>

              <div className="scan-page__boutons">
                <button
                  type="button"
                  className="btn scan-page__bouton"
                  disabled={etat === 'envoi'}
                  onClick={envoyer}
                >
                  {etat === 'envoi' ? `Envoi… ${progression} %` : `Envoyer à ${prof}`}
                </button>

                <button
                  type="button"
                  className="btn btn--fantome scan-page__bouton"
                  disabled={etat === 'envoi'}
                  onClick={() => { setFichier(null); setApercu(null); }}
                >
                  Reprendre la photo
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
