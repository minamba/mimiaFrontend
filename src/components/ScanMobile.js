import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { envoyerScanMobile, lireScanMobile, terminerScanMobile } from '../lib/api/scanMobileApi';
import { reduire, PIECES_MAX, TAILLE_MAX, TYPES_ACCEPTES } from './PieceJointe';
import { appliquerBlueSky } from '../lib/storage/styleSite';
import scanPng from '../assets/scan.png';
import cameraPng from '../assets/cam_2.png';
import trombonePng from '../assets/trombone.png';
import galeriePng from '../assets/galerie.png';

/**
 * LA PAGE DU TÉLÉPHONE, APRÈS LE QR CODE.
 *
 * Voulu par Camara le 13/09/2026. L'enfant a visé le QR code affiché sur son
 * ordinateur : il arrive ici, sans compte et sans code.
 *
 * PLUSIEURS PHOTOS, UN SEUL ENVOI — Camara, le 16/09/2026 : « prendre
 * plusieurs photos ou documents et les envoyer en une seule fois pour que le
 * prof ait tout en tête ». Chaque photo ou fichier rejoint une liste, on peut
 * en retirer d'une croix, et un seul bouton envoie tout. Les photos montent
 * une par une ; à la fin, le téléphone dit « terminé », et c'est ce signal
 * qui fait partir le message au professeur — jamais la première photo seule.
 *
 * DEUX GESTES, PAS UN DE PLUS — Camara, le 17/09/2026 : prendre la photo, ou
 * importer ce qui est déjà sur le téléphone. Le second porte le trombone ET le
 * cadre photo, parce qu'il accepte les deux : un PDF de l'énoncé comme une
 * image de la galerie. C'est aussi pour cela qu'il ne s'appelle plus « choisir
 * dans la galerie » — ce nom cachait la moitié de ce qu'il sait faire.
 *
 * TOUT EST GROS ET DIRECT : c'est un téléphone, tenu d'une main, l'autre
 * tenant la feuille.
 *
 * Chaque photo est RÉDUITE AVANT DE PARTIR — le même `reduire` que le
 * trombone : douze mégapixels sur le réseau d'une maison, c'est long pour
 * rien, le professeur n'en lit pas plus.
 */
export default function ScanMobile() {
  const { jeton } = useParams();

  const [info, setInfo] = useState(null);
  const [etat, setEtat] = useState('chargement');

  // La liste, dans l'ordre du choix : { cle, fichier, apercu, envoye }.
  const [fichiers, setFichiers] = useState([]);
  const [enCours, setEnCours] = useState(null);
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let vivant = true;

    lireScanMobile(jeton)
      .then(({ data }) => {
        if (!vivant) return;

        // LE STYLE AVANT LE CONTENU — Camara, le 17/09/2026 : la page suit
        // Blue Sky comme le reste du site. Posé ICI, à la seconde où la
        // réponse arrive : l'écran ne montre encore que « Chargement… », donc
        // la bascule ne se voit pas. Après l'affichage, elle clignoterait
        // sous les yeux de l'enfant.
        //
        // `appliquerBlueSky` le retient aussi sur l'appareil : au prochain QR
        // code, le style est posé avant même le premier octet de CSS.
        appliquerBlueSky(Boolean(data?.blueSky));

        setInfo(data);
        setEtat(data?.dejaEnvoye ? 'deja' : 'pret');
      })
      .catch((e) => {
        if (!vivant) return;
        setEtat(e?.response?.status === 404 ? 'expire' : 'erreur');
      });

    return () => { vivant = false; };
  }, [jeton]);

  // Les aperçus locaux sont relâchés au démontage.
  useEffect(() => () => {
    fichiers.forEach((f) => { if (f.apercu) URL.revokeObjectURL(f.apercu); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prof = info?.profPrenom ?? 'ton professeur';

  const ajouter = (choisis) => {
    if (!choisis.length) return;
    setErreur(null);

    setFichiers((actuels) => {
      const place = PIECES_MAX - actuels.length;

      if (place <= 0) {
        setErreur(`Au plus ${PIECES_MAX} documents d’un coup. Retires-en un pour en ajouter.`);
        return actuels;
      }

      if (choisis.length > place) {
        setErreur(`Au plus ${PIECES_MAX} documents d’un coup : les ${place} premiers ont été gardés.`);
      }

      return [
        ...actuels,
        ...choisis.slice(0, place).map((fichier) => ({
          cle: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fichier,
          apercu: fichier.type.startsWith('image/') ? URL.createObjectURL(fichier) : null,
          envoye: false,
        })),
      ];
    });
  };

  const retirer = (cle) => {
    setErreur(null);
    setFichiers((actuels) => actuels.filter((f) => {
      if (f.cle !== cle) return true;
      if (f.apercu) URL.revokeObjectURL(f.apercu);
      return false;
    }));
  };

  /**
   * Tout part, dans l'ordre, une photo à la fois — puis « terminé ».
   *
   * Une photo déjà partie n'est pas renvoyée si une suivante échoue : on
   * reprend là où on s'est arrêté, et le professeur ne reçoit rien en double.
   */
  const envoyer = async () => {
    const restantes = fichiers.filter((f) => !f.envoye);
    if (!restantes.length) return;

    setEtat('envoi');
    setErreur(null);

    try {
      for (const entree of restantes) {
        setEnCours(entree.cle);
        setProgression(0);

        // eslint-disable-next-line no-await-in-loop
        const aEnvoyer = await reduire(entree.fichier);

        if (aEnvoyer.size > TAILLE_MAX) {
          setErreur(`« ${entree.fichier.name} » est trop lourd. Retire-le, ou reprends la photo.`);
          setEtat('pret');
          return;
        }

        // eslint-disable-next-line no-await-in-loop
        await envoyerScanMobile(jeton, aEnvoyer, {
          onProgression: (e) => {
            if (e?.total) setProgression(Math.round((e.loaded / e.total) * 100));
          },
        });

        setFichiers((actuels) => actuels.map((f) => (f.cle === entree.cle ? { ...f, envoye: true } : f)));
      }

      await terminerScanMobile(jeton);
      setEtat('envoye');
    } catch (e) {
      if (e?.response?.status === 404) {
        setEtat('expire');
        return;
      }

      setErreur(e?.response?.data?.message ?? 'Le document n’a pas pu partir. Tu peux réessayer ?');
      setEtat('pret');
    } finally {
      setEnCours(null);
    }
  };

  /**
   * Un geste : ses icônes, son nom, et ce qu'il fait en une ligne.
   *
   * Les icônes sont décoratives (`aria-hidden`) — le nom du champ suffit à
   * dire ce qu'on choisit, et deux images annoncées à la suite alourdiraient
   * la lecture vocale sans rien apprendre.
   */
  const champ = (id, libelle, aide, avecCapture) => (
    <label htmlFor={id} className="scan-page__action">
      <span className="scan-page__action-icones" aria-hidden="true">
        {avecCapture ? (
          <img src={cameraPng} alt="" />
        ) : (
          <>
            <img src={trombonePng} alt="" />
            <img src={galeriePng} alt="" />
          </>
        )}
      </span>

      <span className="scan-page__action-texte">
        <strong>{libelle}</strong>
        <small>{aide}</small>
      </span>

      {/* LE CHEVRON DIT « ÇA S'OUVRE », ET RIEN D'AUTRE — Camara, le
          17/09/2026 : « pourquoi Prendre la photo est en surbrillance alors
          que je n'ai rien sélectionné ? ». Le liseré corail que portait ce
          geste voulait dire « le principal » ; sur une page où l'on n'a
          encore rien choisi, il se lisait « celui-ci est choisi ». Les deux
          cartes sont donc identiques, et c'est l'ordre — la photo d'abord —
          qui suffit à dire laquelle on attend. */}
      <span className="scan-page__action-fleche" aria-hidden="true">›</span>

      <input
        id={id}
        type="file"
        hidden
        accept={avecCapture ? 'image/*' : TYPES_ACCEPTES}
        capture={avecCapture ? 'environment' : undefined}
        // L'appareil photo ne rend qu'une image à la fois ; l'import, lui,
        // en laisse choisir plusieurs d'un coup.
        multiple={!avecCapture}
        onChange={(e) => {
          const choisis = Array.from(e.target.files ?? []);
          e.target.value = '';
          ajouter(choisis);
        }}
      />
    </label>
  );

  const nombre = fichiers.length;
  const envoi = etat === 'envoi';
  const rang = enCours ? fichiers.findIndex((f) => f.cle === enCours) + 1 : 0;

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
          <h1>Tes documents sont déjà partis</h1>
          <p>Pour en envoyer d’autres, demande un nouveau QR code sur ton ordinateur.</p>
        </div>
      )}

      {etat === 'envoye' && (
        <div className="scan-page__message" role="status">
          <p className="scan-page__grand" aria-hidden="true">✅</p>
          <h1>C’est envoyé !</h1>
          <p>
            Retourne sur ton ordinateur : {prof} regarde{' '}
            {nombre > 1 ? `tes ${nombre} documents` : 'ton document'}.
          </p>
        </div>
      )}

      {(etat === 'pret' || envoi) && (
        <div className="scan-page__contenu">
          {/* LE BANDEAU D'EN-TÊTE — Camara, le 17/09/2026 : « le titre n'est
              pas mis en valeur ». Posé à plat, il se lisait comme une barre
              d'application au-dessus de deux cartes dessinées, et la page
              semblait commencer aux boutons. C'est pourtant lui qui dit à qui
              l'enfant écrit — et l'emblème dit sur quelle page il vient
              d'arriver, lui qui n'a fait que viser un QR code.

              LE PRÉNOM DU PROFESSEUR EST LA SEULE CHOSE QUI CHANGE d'un QR
              code à l'autre : c'est donc lui qu'on accentue, pas le verbe. */}
          <header className="scan-page__entete">
            <img src={scanPng} alt="" className="scan-page__embleme" />

            <span className="scan-page__entete-texte">
              <h1 className="scan-page__titre">
                Envoie ta copie à <strong>{prof}</strong>
              </h1>
              {info?.matiere && <p className="scan-page__matiere">{info.matiere}</p>}
            </span>
          </header>

          {erreur && <p className="alert">{erreur}</p>}

          {/* LA LISTE, AVEC UNE CROIX SUR CHAQUE DOCUMENT. Elle apparaît dès
              le premier ; les gestes restent en dessous pour en ajouter,
              tant qu'on est sous le plafond. */}
          {nombre > 0 && (
            <ul className="scan-page__liste" aria-label="Les documents à envoyer">
              {fichiers.map((f, i) => (
                <li
                  key={f.cle}
                  className={`scan-page__vignette${f.envoye ? ' scan-page__vignette--envoyee' : ''}${
                    enCours === f.cle ? ' scan-page__vignette--en-cours' : ''}`}
                >
                  <span className="scan-page__rang" aria-hidden="true">{i + 1}</span>

                  {f.apercu ? (
                    <img src={f.apercu} alt={`Page ${i + 1}`} />
                  ) : (
                    <span className="scan-page__doc" aria-hidden="true">📄</span>
                  )}

                  <span className="scan-page__nom">
                    <strong>{f.fichier.name}</strong>
                    {f.envoye && <small>✓ envoyé</small>}
                  </span>

                  {!envoi && !f.envoye && (
                    <button
                      type="button"
                      className="scan-page__retirer"
                      onClick={() => retirer(f.cle)}
                      aria-label={`Retirer ${f.fichier.name}`}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {!envoi && nombre < PIECES_MAX && (
            <div className="scan-page__actions">
              {champ(
                'scan-photo',
                nombre ? 'Ajouter une photo' : 'Prendre la photo',
                'Avec l’appareil de ton téléphone',
                true,
              )}
              {champ(
                'scan-galerie',
                'Importer un document / image',
                'Une photo ou un PDF déjà enregistré',
                false,
              )}
            </div>
          )}

          {nombre > 0 && (
            <div className="scan-page__pied">
              <button
                type="button"
                className="btn scan-page__envoi"
                disabled={envoi}
                onClick={envoyer}
              >
                {envoi
                  ? `Envoi ${rang}/${nombre}… ${progression} %`
                  : `Envoyer à ${prof}`}
              </button>

              {nombre > 1 && !envoi && (
                <p className="scan-page__compte">Les {nombre} documents partiront ensemble.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
