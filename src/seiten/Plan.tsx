import { useMemo, useState } from 'react'
import type { SeitenProps } from '../App'
import { merkmale, schlageWocheVor, tauscheTag, ueberblick, zufallAus, type PlanKontext } from '../lib/planer'
import { FELDER, KATEGORIEN, WOCHENTAGE, type Kategorie, type Plan, type Tag } from '../lib/typen'
import { heuteIso, kurzDatum, monatVon, plusTage } from '../lib/woche'
import type { Katalog } from '../lib/zutaten'
import { gerichtKosten, wochenKosten, zeigeEuro } from '../lib/kosten'
import { aktuelleWuensche, kindAus } from '../lib/wuensche'
import { Bewertungsleiste, BewertungKurz, GerichtBild } from './Bausteine'
import { WochenKopf } from './WochenKopf'

interface Props extends SeitenProps {
  katalog: Katalog
  woche: string
  setWoche: (w: string) => void
  zumEinkauf: () => void
}

export function PlanSeite({ z, aendere, katalog, woche, setWoche, zumEinkauf }: Props) {
  const plan = z.plaene[woche]
  const monat = monatVon(woche)
  const heute = heuteIso()
  const wuensche = useMemo(() => aktuelleWuensche(z.wuensche, z.plaene, heute), [z.wuensche, z.plaene, heute])
  const kind = kindAus(z.einstellungen.personen)
  const offeneWuensche = [...wuensche].filter(([, s]) => s.art === 'offen')
    .map(([id]) => z.rezepte.find((r) => r.id === id)?.name).filter((n): n is string => !!n)

  const kontext = (): PlanKontext => ({
    rezepte: z.rezepte,
    katalog,
    raster: z.raster,
    monat,
    kuerzlich: new Set(
      [plusTage(woche, -7), plusTage(woche, -14)].flatMap((w) =>
        (z.plaene[w]?.tage ?? []).flatMap((t) => (t.typ === 'rezept' ? [t.rezeptId] : [])),
      ),
    ),
    zufall: zufallAus(Date.now()),
    bewertungen: z.bewertungen,
    wuensche: new Set(wuensche.keys()),
  })

  const setzePlan = (p: Plan) => aendere((alt) => ({ ...alt, plaene: { ...alt.plaene, [woche]: p } }))
  const setzeTag = (i: number, tag: Tag) => {
    if (!plan) return
    const tage = [...plan.tage]
    tage[i] = tag
    setzePlan({ ...plan, tage })
  }

  const u = useMemo(() => (plan ? ueberblick(plan, z.rezepte, katalog, monat) : null), [plan, z.rezepte, katalog, monat])
  const k = useMemo(
    () => (plan ? wochenKosten(plan, z.rezepte, katalog, z.einstellungen, z.fruehstueck) : null),
    [plan, z.rezepte, katalog, z.einstellungen, z.fruehstueck],
  )

  return (
    <>
      <WochenKopf titel="Wochenplan" woche={woche} setWoche={setWoche} />

      {offeneWuensche.length > 0 && (
        <p className="hinweis wunsch-hinweis">
          ⭐ {kind?.name ?? 'Das Kind'} wünscht sich: {offeneWuensche.join(', ')}. Beim nächsten Vorschlag kommen die Wünsche zuerst.
        </p>
      )}

      {!plan ? (
        <section className="karte leerzustand">
          <p>Für diese Woche gibt es noch keinen Plan.</p>
          <p className="klein">
            Der Vorschlag folgt eurem Wochenraster, nimmt Saisonware, verteilt Zutaten auf mehrere
            Gerichte und legt Empfindliches an den Anfang der Woche. Danach könnt ihr jeden Tag tauschen.
          </p>
          <button className="haupt" onClick={() => setzePlan(schlageWocheVor(woche, null, kontext()))}>
            Woche vorschlagen
          </button>
        </section>
      ) : (
        <>
          <div className="aktionen">
            <button className="haupt" onClick={() => setzePlan(schlageWocheVor(woche, plan, kontext()))}>
              Neu vorschlagen
            </button>
            <button onClick={zumEinkauf}>Zur Einkaufsliste →</button>
          </div>
          <p className="klein">Neu vorschlagen ersetzt alle Tage außer den angehefteten 📌 und den Restetagen.</p>

          <ol className="tage">
            {plan.tage.map((tag, i) => (
              <TagKarte
                key={i}
                index={i}
                tag={tag}
                datum={plusTage(woche, i)}
                z={z}
                aendere={aendere}
                katalog={katalog}
                monat={monat}
                setze={(t) => setzeTag(i, t)}
                tausche={() => setzePlan(tauscheTag(plan, i, kontext()))}
              />
            ))}
          </ol>

          {u && u.gerichte > 0 && (
            <section className="karte">
              <h2>Die Woche im Blick</h2>
              <ul className="kennzahlen">
                <li><strong>{u.vegetarisch}</strong> vegetarisch</li>
                <li><strong>{u.fisch}</strong> mit Fisch</li>
                <li><strong>{u.fleisch}</strong> mit Fleisch</li>
                {u.saisonAnteil !== null && <li><strong>{Math.round(u.saisonAnteil * 100)} %</strong> Saisonware</li>}
                {k && <li><strong>{zeigeEuro(k.gesamt.euro).replace('ca. ', '')}</strong> Lebensmittel, grob</li>}
              </ul>
              {k && k.abende > 0 && (
                <p className="klein">
                  Abendessen {zeigeEuro(k.abendessen)}, im Schnitt {zeigeEuro(k.abendessen / k.abende)} pro Abend für alle,
                  Reste fürs Mittagessen eingerechnet. Der Rest ist Frühstück. Geschätzte Preise, ohne Grundvorrat.
                  {k.gesamt.ohnePreis.length > 0 && ` Ohne Preis und deshalb nicht dabei: ${k.gesamt.ohnePreis.join(', ')}.`}
                </p>
              )}
              {u.fisch === 0 && <p className="hinweis">Diese Woche ist kein Fisch dabei – empfohlen sind ein- bis zweimal pro Woche.</p>}
              {u.fleisch > 3 && <p className="hinweis">Mehr als dreimal Fleisch – ein Tag mit Hülsenfrüchten wäre günstiger und ausgewogener.</p>}
              {u.gemeinsam.length > 0 && (
                <p className="klein">
                  Wird mehrfach verwendet: {u.gemeinsam.map((g) => `${g.name} (${g.anzahl}×)`).join(', ')}.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </>
  )
}

interface TagProps {
  index: number
  tag: Tag
  datum: string
  z: SeitenProps['z']
  aendere: SeitenProps['aendere']
  katalog: Katalog
  monat: number
  setze: (t: Tag) => void
  tausche: () => void
}

function TagKarte({ index, tag, datum, z, aendere, katalog, monat, setze, tausche }: TagProps) {
  const feld = z.raster[index]
  const rezept = tag.typ === 'rezept' ? z.rezepte.find((r) => r.id === tag.rezeptId) : undefined
  const m = rezept ? merkmale(rezept, katalog, monat) : null
  const heute = heuteIso()
  const gegessen = datum <= heute
  const bewertet = rezept ? Object.keys(z.bewertungen[rezept.id] ?? {}).length > 0 : false
  const [bewerten, setBewerten] = useState(false)
  const kosten = rezept ? gerichtKosten(rezept, katalog, z.einstellungen, tag.typ === 'rezept' && tag.mitResten) : null
  const seit = rezept ? z.wuensche[rezept.id] : undefined
  const gewuenscht = seit !== undefined && seit <= datum
  const kind = kindAus(z.einstellungen.personen)

  const waehle = (id: string) => {
    if (id === '__reste') setze({ typ: 'restetag' })
    else if (id) setze({ typ: 'rezept', rezeptId: id, mitResten: tag.typ === 'rezept' ? tag.mitResten : true, fixiert: true })
  }

  return (
    <li className={`karte tag${tag.typ === 'rezept' && tag.fixiert ? ' fixiert' : ''}`}>
      {tag.typ === 'rezept' && <GerichtBild rezept={rezept} klasse="tag-bild" />}
      <div className="tag-kopf">
        <span className="tag-name">{WOCHENTAGE[index]}</span>
        <span className="klein">{kurzDatum(datum).slice(4)} · {FELDER[feld]}</span>
      </div>

      {tag.typ === 'restetag' && <p className="gericht">Resteessen oder Brotzeit</p>}
      {tag.typ === 'leer' && <p className="gericht gedaempft">Noch nichts geplant</p>}
      {tag.typ === 'rezept' && (
        <>
          <p className="gericht">{rezept?.name ?? 'Gericht wurde gelöscht'}</p>
          {rezept && (
            <p className="marken">
              <span>{rezept.minuten} Min.</span>
              {m && m.saisonAnteil !== null && m.saisonAnteil >= 0.75 && <span className="marke saison">Saison</span>}
              {m?.fisch && <span className="marke">Fisch</span>}
              {m?.fleisch && !m.fisch && <span className="marke">Fleisch</span>}
              {gewuenscht && <span className="marke wunsch">⭐ Wunsch von {kind?.name ?? 'Kind'}</span>}
              {!gewuenscht && rezept.kinderfreundlich && <span className="marke">Kind mag’s</span>}
              {kosten && kosten.euro > 0 && <span>{zeigeEuro(kosten.euro)}</span>}
              <BewertungKurz rezeptId={rezept.id} z={z} />
            </p>
          )}
          {rezept && gegessen && (
            bewerten ? (
              <>
                <Bewertungsleiste rezeptId={rezept.id} z={z} aendere={aendere} datum={datum} kompakt />
                <button className="still" onClick={() => setBewerten(false)}>Fertig</button>
              </>
            ) : (
              <button className="wie-wars" onClick={() => setBewerten(true)}>
                {bewertet ? 'Bewertung ändern' : 'Wie war’s? Jetzt bewerten'}
              </button>
            )
          )}
          <label className="schalter">
            <input
              type="checkbox"
              checked={tag.mitResten}
              onChange={(e) => setze({ ...tag, mitResten: e.target.checked })}
            />
            Mehr kochen für Mittag morgen
          </label>
        </>
      )}

      <div className="tag-aktionen">
        {tag.typ === 'rezept' && (
          <button
            aria-pressed={tag.fixiert}
            title="Anheften: bleibt beim Neu-Vorschlagen stehen"
            onClick={() => setze({ ...tag, fixiert: !tag.fixiert })}
          >
            📌 {tag.fixiert ? 'Angeheftet' : 'Anheften'}
          </button>
        )}
        <button onClick={tausche}>🔄 Tauschen</button>
        <select aria-label={`Gericht für ${WOCHENTAGE[index]} wählen`} value="" onChange={(e) => waehle(e.target.value)}>
          <option value="">Selbst wählen …</option>
          <option value="__reste">Resteessen / Brotzeit</option>
          {(Object.keys(KATEGORIEN) as Kategorie[]).map((k) => (
            <optgroup key={k} label={KATEGORIEN[k] + (feld === k ? ' ★' : '')}>
              {z.rezepte
                .filter((r) => r.kategorie === k)
                .sort((a, b) => a.name.localeCompare(b.name, 'de'))
                .map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
    </li>
  )
}
