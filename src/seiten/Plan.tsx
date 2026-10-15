import { useMemo } from 'react'
import type { SeitenProps } from '../App'
import { merkmale, schlageWocheVor, tauscheTag, ueberblick, zufallAus, type PlanKontext } from '../lib/planer'
import { FELDER, KATEGORIEN, WOCHENTAGE, type Kategorie, type Plan, type Tag } from '../lib/typen'
import { kurzDatum, monatVon, plusTage } from '../lib/woche'
import type { Katalog } from '../lib/zutaten'
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
  })

  const setzePlan = (p: Plan) => aendere((alt) => ({ ...alt, plaene: { ...alt.plaene, [woche]: p } }))
  const setzeTag = (i: number, tag: Tag) => {
    if (!plan) return
    const tage = [...plan.tage]
    tage[i] = tag
    setzePlan({ ...plan, tage })
  }

  const u = useMemo(() => (plan ? ueberblick(plan, z.rezepte, katalog, monat) : null), [plan, z.rezepte, katalog, monat])

  return (
    <>
      <WochenKopf titel="Wochenplan" woche={woche} setWoche={setWoche} />

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
              </ul>
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
  katalog: Katalog
  monat: number
  setze: (t: Tag) => void
  tausche: () => void
}

function TagKarte({ index, tag, datum, z, katalog, monat, setze, tausche }: TagProps) {
  const feld = z.raster[index]
  const rezept = tag.typ === 'rezept' ? z.rezepte.find((r) => r.id === tag.rezeptId) : undefined
  const m = rezept ? merkmale(rezept, katalog, monat) : null

  const waehle = (id: string) => {
    if (id === '__reste') setze({ typ: 'restetag' })
    else if (id) setze({ typ: 'rezept', rezeptId: id, mitResten: tag.typ === 'rezept' ? tag.mitResten : true, fixiert: true })
  }

  return (
    <li className={`karte tag${tag.typ === 'rezept' && tag.fixiert ? ' fixiert' : ''}`}>
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
              {rezept.kinderfreundlich && <span className="marke">Kind mag’s</span>}
            </p>
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
