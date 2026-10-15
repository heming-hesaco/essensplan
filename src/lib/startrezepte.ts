import type { Einheit, Kategorie, Rezept } from './typen'

type Z = [string, number, Einheit]

function r(
  id: string,
  name: string,
  kategorie: Kategorie,
  minuten: number,
  kinderfreundlich: boolean,
  zutaten: Z[],
  anleitung: string,
): Rezept {
  return {
    id,
    name,
    kategorie,
    minuten,
    portionen: 4,
    kinderfreundlich,
    zutaten: zutaten.map(([name, menge, einheit]) => ({ name, menge, einheit })),
    anleitung,
  }
}

/** Mengen jeweils für vier normale Portionen; die App rechnet auf euren Haushalt um. */
export const STARTREZEPTE: Rezept[] = [
  // Nudeln – gehen immer
  r('spaghetti-bolognese', 'Spaghetti Bolognese', 'nudeln', 40, true, [
    ['Rinderhack', 400, 'g'], ['Zwiebeln', 1, 'Stück'], ['Möhren', 2, 'Stück'],
    ['Knoblauch', 1, 'Zehe'], ['Passierte Tomaten', 500, 'g'], ['Tomatenmark', 2, 'EL'],
    ['Spaghetti', 500, 'g'], ['Parmesan', 50, 'g'], ['Olivenöl', 2, 'EL'],
  ], 'Zwiebel und Möhren fein würfeln, mit dem Hack anbraten. Tomatenmark kurz mitrösten, passierte Tomaten dazu und 20 Minuten köcheln. Mit Nudeln und Parmesan servieren.'),
  r('nudeln-gemuesesauce', 'Nudeln mit versteckter Gemüsesauce', 'nudeln', 30, true, [
    ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Passierte Tomaten', 500, 'g'], ['Fusilli', 500, 'g'],
    ['Parmesan', 40, 'g'], ['Olivenöl', 2, 'EL'],
  ], 'Gemüse klein schneiden, in Öl anbraten, Tomaten dazu, 15 Minuten köcheln und fein pürieren. Das Kind sieht kein Gemüse – isst es aber.'),
  r('kuerbis-sahne-pasta', 'Kürbis-Sahne-Pasta', 'nudeln', 30, true, [
    ['Hokkaido-Kürbis', 600, 'g'], ['Zwiebeln', 1, 'Stück'], ['Sahne', 200, 'ml'],
    ['Penne', 500, 'g'], ['Parmesan', 50, 'g'], ['Muskat', 1, 'Prise'], ['Olivenöl', 1, 'EL'],
  ], 'Kürbis mit Schale würfeln, mit Zwiebel anbraten, mit Sahne und etwas Nudelwasser weich köcheln und pürieren. Mit Nudeln und Parmesan mischen.'),
  r('lachs-spinat-tagliatelle', 'Tagliatelle mit Lachs und Spinat', 'nudeln', 25, false, [
    ['Lachsfilet (TK)', 250, 'g'], ['Blattspinat (TK)', 450, 'g'], ['Sahne', 200, 'ml'],
    ['Tagliatelle', 500, 'g'], ['Zitrone', 1, 'Stück'], ['Knoblauch', 1, 'Zehe'],
  ], 'Spinat mit Knoblauch und Sahne erhitzen, Lachs in Würfeln darin garziehen lassen. Mit Zitrone abschmecken, Nudeln unterheben.'),
  r('makkaroni-kaese-brokkoli', 'Makkaroni mit Käsesauce und Brokkoli', 'nudeln', 25, true, [
    ['Makkaroni', 500, 'g'], ['Brokkoli', 1, 'Stück'], ['Milch', 400, 'ml'],
    ['Butter', 30, 'g'], ['Mehl', 2, 'EL'], ['Reibekäse', 150, 'g'],
  ], 'Brokkoliröschen die letzten 4 Minuten mit den Nudeln kochen. Butter und Mehl anschwitzen, Milch einrühren, Käse darin schmelzen. Alles mischen.'),
  r('pesto-nudeln-tomaten', 'Pesto-Nudeln mit Kirschtomaten', 'nudeln', 15, true, [
    ['Fusilli', 500, 'g'], ['Pesto', 1, 'Glas'], ['Kirschtomaten', 250, 'g'], ['Parmesan', 40, 'g'],
  ], 'Nudeln kochen, mit Pesto und etwas Nudelwasser mischen, halbierte Tomaten und Parmesan darüber. Das schnellste Gericht der Woche.'),
  r('lauch-schinken-nudeln', 'Lauch-Schinken-Nudeln', 'nudeln', 25, true, [
    ['Lauch', 2, 'Stück'], ['Kochschinken', 150, 'g'], ['Sahne', 200, 'ml'],
    ['Penne', 500, 'g'], ['Reibekäse', 50, 'g'],
  ], 'Lauch in Ringe schneiden und andünsten, Schinkenwürfel und Sahne dazu, kurz einkochen und mit den Nudeln mischen.'),
  r('hackbaellchen-tomatensauce', 'Hackbällchen in Tomatensauce mit Spaghetti', 'nudeln', 40, true, [
    ['Rinderhack', 400, 'g'], ['Eier', 1, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Passierte Tomaten', 700, 'g'], ['Spaghetti', 500, 'g'], ['Oregano', 1, 'TL'],
    ['Parmesan', 40, 'g'],
  ], 'Hack mit Ei und fein geriebener Zwiebel verkneten, kleine Bällchen formen und in der Tomatensauce 15 Minuten garen. Das Kind kann beim Formen helfen.'),
  r('asia-gemuesenudeln', 'Gebratene Gemüsenudeln mit Ei', 'nudeln', 25, true, [
    ['Mie-Nudeln', 250, 'g'], ['Möhren', 2, 'Stück'], ['Paprika', 1, 'Stück'],
    ['Spitzkohl', 300, 'g'], ['Eier', 3, 'Stück'], ['Sojasauce', 4, 'EL'], ['Rapsöl', 2, 'EL'],
  ], 'Gemüse in feine Streifen schneiden und scharf anbraten, gekochte Nudeln dazu, Eier darüber stocken lassen, mit Sojasauce würzen.'),

  // Hülsenfrüchte
  r('linsen-bolognese', 'Linsen-Bolognese', 'huelsenfruechte', 35, true, [
    ['Rote Linsen', 200, 'g'], ['Zwiebeln', 1, 'Stück'], ['Möhren', 2, 'Stück'],
    ['Passierte Tomaten', 700, 'g'], ['Tomatenmark', 2, 'EL'], ['Vollkornspaghetti', 500, 'g'],
    ['Parmesan', 40, 'g'], ['Olivenöl', 2, 'EL'],
  ], 'Zwiebel und Möhren anbraten, Linsen, Tomaten und 300 ml Wasser dazu, 20 Minuten köcheln. Schmeckt wie Bolognese, kostet die Hälfte.'),
  r('chili-sin-carne', 'Chili sin Carne mit Reis', 'huelsenfruechte', 35, true, [
    ['Kidneybohnen', 2, 'Dose'], ['Mais', 1, 'Dose'], ['Paprika', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Gehackte Tomaten', 2, 'Dose'], ['Reis', 250, 'g'],
    ['Kreuzkümmel', 1, 'TL'], ['Paprikapulver', 1, 'TL'], ['Schmand', 200, 'g'],
  ], 'Zwiebel und Paprika anbraten, Gewürze kurz mitrösten, Tomaten, Bohnen und Mais dazu, 20 Minuten köcheln. Mit Reis und einem Klecks Schmand.'),
  r('kichererbsen-curry', 'Kichererbsen-Curry mit Süßkartoffel', 'huelsenfruechte', 35, false, [
    ['Kichererbsen', 2, 'Dose'], ['Süßkartoffeln', 500, 'g'], ['Kokosmilch', 1, 'Dose'],
    ['Zwiebeln', 1, 'Stück'], ['Blattspinat (TK)', 300, 'g'], ['Currypulver', 2, 'TL'],
    ['Reis', 250, 'g'],
  ], 'Zwiebel und Curry anschwitzen, Süßkartoffelwürfel und Kokosmilch dazu, 15 Minuten köcheln, Kichererbsen und Spinat unterrühren. Mit Reis.'),
  r('linsensuppe-wuerstchen', 'Linsensuppe mit Würstchen', 'huelsenfruechte', 45, true, [
    ['Tellerlinsen', 250, 'g'], ['Kartoffeln', 400, 'g'], ['Möhren', 2, 'Stück'],
    ['Lauch', 1, 'Stück'], ['Wiener Würstchen', 4, 'Stück'], ['Gemüsebrühe', 1, 'EL'],
  ], 'Gemüse würfeln, mit Linsen und 1,5 l Brühe 35 Minuten kochen. Würstchen in Scheiben darin erwärmen. Wird aufgewärmt noch besser.'),
  r('bohnen-wraps', 'Wraps mit Bohnen und Käse', 'huelsenfruechte', 20, true, [
    ['Tortilla-Wraps', 1, 'Packung'], ['Kidneybohnen', 1, 'Dose'], ['Mais', 1, 'Dose'],
    ['Paprika', 1, 'Stück'], ['Reibekäse', 150, 'g'], ['Schmand', 200, 'g'], ['Gurke', 1, 'Stück'],
  ], 'Bohnen grob zerdrücken, mit Mais und Paprika mischen. Jeder füllt seinen Wrap selbst, mit Käse kurz in der Pfanne anrösten.'),

  // Fisch
  r('fischstaebchen-pueree', 'Fischstäbchen mit Kartoffelpüree und Erbsen', 'fisch', 30, true, [
    ['Fischstäbchen', 450, 'g'], ['Kartoffeln', 1000, 'g'], ['Milch', 200, 'ml'],
    ['Butter', 30, 'g'], ['Erbsen (TK)', 300, 'g'],
  ], 'Kartoffeln kochen und mit warmer Milch und Butter stampfen. Fischstäbchen im Ofen backen, Erbsen kurz kochen.'),
  r('ofenlachs-kartoffeln', 'Ofenlachs mit Kartoffeln und Brokkoli', 'fisch', 40, true, [
    ['Lachsfilet (TK)', 400, 'g'], ['Kartoffeln', 800, 'g'], ['Brokkoli', 1, 'Stück'],
    ['Zitrone', 1, 'Stück'], ['Olivenöl', 2, 'EL'],
  ], 'Kartoffelspalten mit Öl 20 Minuten bei 200 °C vorbacken, Lachs und Brokkoli dazulegen, weitere 15 Minuten. Zitrone darüber.'),
  r('seelachs-reis-moehren', 'Seelachs mit Reis und Möhrengemüse', 'fisch', 30, true, [
    ['Seelachsfilet (TK)', 400, 'g'], ['Reis', 250, 'g'], ['Möhren', 500, 'g'],
    ['Butter', 20, 'g'], ['Mehl', 2, 'EL'], ['Zitrone', 1, 'Stück'],
  ], 'Fisch leicht mehlieren und in Butter braten. Möhren in Scheiben mit etwas Butter und Wasser dünsten. Mit Reis.'),
  r('thunfisch-nudeln', 'Nudeln mit Thunfisch-Tomatensauce', 'fisch', 20, true, [
    ['Thunfisch', 2, 'Dose'], ['Passierte Tomaten', 500, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Spaghetti', 500, 'g'], ['Olivenöl', 1, 'EL'],
  ], 'Zwiebel anschwitzen, Tomaten dazu, 10 Minuten köcheln, Thunfisch unterziehen. Fisch und Nudeln in einem – zählt als Fischtag.'),

  // Ofen & Blech
  r('ofengemuese-feta', 'Ofengemüse-Blech mit Feta', 'ofen', 45, false, [
    ['Kartoffeln', 600, 'g'], ['Hokkaido-Kürbis', 500, 'g'], ['Rote Bete', 3, 'Stück'],
    ['Möhren', 3, 'Stück'], ['Zwiebeln', 2, 'Stück'], ['Feta', 200, 'g'], ['Olivenöl', 3, 'EL'],
  ], 'Alles in Stücke schneiden, mit Öl und Salz aufs Blech, 35 Minuten bei 200 °C. Feta die letzten 10 Minuten darüberbröseln.'),
  r('nudelauflauf-gemuese', 'Nudelauflauf mit Gemüse', 'ofen', 45, true, [
    ['Penne', 400, 'g'], ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'],
    ['Passierte Tomaten', 500, 'g'], ['Mozzarella', 125, 'g'], ['Reibekäse', 100, 'g'],
  ], 'Nudeln knapp bissfest kochen, mit Gemüse und Tomaten in die Form, Käse darüber, 25 Minuten bei 200 °C.'),
  r('haehnchen-blech', 'Hähnchen-Kartoffel-Blech', 'ofen', 55, true, [
    ['Hähnchenschenkel', 4, 'Stück'], ['Kartoffeln', 800, 'g'], ['Möhren', 4, 'Stück'],
    ['Paprika', 2, 'Stück'], ['Paprikapulver', 2, 'TL'], ['Olivenöl', 3, 'EL'],
  ], 'Gemüse grob schneiden, Hähnchen mit Öl und Paprikapulver einreiben, alles aufs Blech, 45 Minuten bei 200 °C.'),
  r('lauch-quiche', 'Lauch-Quiche mit Salat', 'ofen', 60, false, [
    ['Mehl', 250, 'g'], ['Butter', 125, 'g'], ['Eier', 4, 'Stück'], ['Lauch', 2, 'Stück'],
    ['Schmand', 200, 'g'], ['Bergkäse', 100, 'g'], ['Kopfsalat', 1, 'Stück'],
  ], 'Mehl, Butter, 1 Ei und etwas Wasser verkneten, in die Form drücken. Lauch dünsten, mit Schmand, 3 Eiern und Käse darauf, 35 Minuten bei 190 °C.'),

  // Gemüse & Kartoffeln (Markttag)
  r('kuerbissuppe', 'Kürbissuppe mit Brot', 'gemuese', 35, true, [
    ['Hokkaido-Kürbis', 1000, 'g'], ['Kartoffeln', 300, 'g'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Kokosmilch', 1, 'Dose'], ['Gemüsebrühe', 1, 'EL'], ['Baguette', 1, 'Stück'],
  ], 'Gemüse würfeln, in 1 l Brühe 20 Minuten kochen, Kokosmilch dazu und pürieren. Mit frischem Brot vom Markt.'),
  r('minestrone', 'Minestrone mit Suppennudeln', 'gemuese', 40, true, [
    ['Möhren', 2, 'Stück'], ['Zucchini', 1, 'Stück'], ['Kartoffeln', 300, 'g'],
    ['Lauch', 1, 'Stück'], ['Gehackte Tomaten', 1, 'Dose'], ['Kidneybohnen', 1, 'Dose'],
    ['Kleine Suppennudeln', 100, 'g'], ['Gemüsebrühe', 1, 'EL'], ['Parmesan', 30, 'g'],
  ], 'Gemüse würfeln und anschwitzen, Tomaten und 1,2 l Brühe dazu, 20 Minuten köcheln, Nudeln und Bohnen die letzten 8 Minuten mitkochen.'),
  r('bratkartoffeln-spiegelei', 'Bratkartoffeln mit Spiegelei und Gurkensalat', 'gemuese', 35, true, [
    ['Kartoffeln', 1000, 'g'], ['Eier', 6, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Gurke', 1, 'Stück'], ['Joghurt', 150, 'g'], ['Rapsöl', 3, 'EL'],
  ], 'Kartoffeln am Vortag kochen (oder Reste nehmen), in Scheiben mit Zwiebel knusprig braten. Spiegeleier dazu, Gurke mit Joghurt anmachen.'),
  r('kartoffelpuffer-apfelmus', 'Kartoffelpuffer mit Apfelmus', 'gemuese', 40, true, [
    ['Kartoffeln', 1200, 'g'], ['Eier', 2, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Mehl', 2, 'EL'], ['Apfelmus', 1, 'Glas'], ['Rapsöl', 6, 'EL'],
  ], 'Kartoffeln und Zwiebel reiben, gut ausdrücken, mit Ei und Mehl mischen, flache Puffer in reichlich Öl ausbacken.'),
  r('kohlrabi-rahm', 'Kohlrabi in Rahmsauce mit Kartoffeln', 'gemuese', 30, true, [
    ['Kohlrabi', 2, 'Stück'], ['Kartoffeln', 800, 'g'], ['Sahne', 150, 'ml'],
    ['Butter', 20, 'g'], ['Mehl', 1, 'EL'], ['Petersilie', 1, 'Bund'], ['Muskat', 1, 'Prise'],
  ], 'Kohlrabi in Stifte schneiden und in wenig Wasser garen. Butter und Mehl anschwitzen, mit Kochwasser und Sahne aufgießen, Kohlrabi hinein. Mit Salzkartoffeln.'),
  r('wirsing-eintopf', 'Wirsing-Kartoffel-Eintopf', 'gemuese', 40, false, [
    ['Wirsing', 1, 'Stück'], ['Kartoffeln', 600, 'g'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Wiener Würstchen', 4, 'Stück'], ['Gemüsebrühe', 1, 'EL'],
  ], 'Wirsing in Streifen, Kartoffeln und Möhren würfeln, in 1,2 l Brühe 25 Minuten köcheln, Würstchen darin erwärmen.'),

  // Etwas Besonderes (Sonntag)
  r('pizza-selbst-belegen', 'Pizza selbst belegen', 'besonders', 75, true, [
    ['Mehl', 500, 'g'], ['Trockenhefe', 1, 'Packung'], ['Passierte Tomaten', 250, 'g'],
    ['Mozzarella', 250, 'g'], ['Kochschinken', 150, 'g'], ['Paprika', 1, 'Stück'],
    ['Champignons', 200, 'g'], ['Oregano', 1, 'TL'], ['Olivenöl', 3, 'EL'],
  ], 'Teig aus Mehl, Hefe, Öl und 300 ml lauwarmem Wasser 45 Minuten gehen lassen. Jeder belegt ein Stück selbst, 12 Minuten bei 250 °C.'),
  r('lasagne', 'Lasagne', 'besonders', 90, true, [
    ['Rinderhack', 400, 'g'], ['Lasagneplatten', 250, 'g'], ['Passierte Tomaten', 700, 'g'],
    ['Zwiebeln', 1, 'Stück'], ['Möhren', 1, 'Stück'], ['Milch', 500, 'ml'], ['Butter', 40, 'g'],
    ['Mehl', 3, 'EL'], ['Reibekäse', 150, 'g'],
  ], 'Bolognese kochen, Béchamel aus Butter, Mehl und Milch. Schichten, Käse obenauf, 40 Minuten bei 180 °C. Reste lassen sich gut einfrieren.'),
  r('apfelpfannkuchen', 'Apfelpfannkuchen', 'besonders', 30, true, [
    ['Mehl', 250, 'g'], ['Milch', 500, 'ml'], ['Eier', 4, 'Stück'], ['Äpfel', 3, 'Stück'],
    ['Zucker', 2, 'EL'], ['Butter', 30, 'g'],
  ], 'Teig verrühren und kurz quellen lassen. Apfelscheiben in Butter anbraten, Teig darüber, von beiden Seiten goldbraun backen.'),
  r('burger-selbstgemacht', 'Burger selbst gemacht', 'besonders', 40, true, [
    ['Rinderhack', 500, 'g'], ['Burgerbrötchen', 4, 'Stück'], ['Tomaten', 2, 'Stück'],
    ['Kopfsalat', 1, 'Stück'], ['Gouda', 100, 'g'], ['Gurke', 1, 'Stück'], ['Kartoffeln', 800, 'g'],
  ], 'Hack würzen, vier Patties formen und braten. Kartoffelspalten im Ofen. Jeder baut seinen Burger selbst.'),
  r('haehnchen-geschnetzeltes', 'Hähnchen-Geschnetzeltes mit Reis', 'besonders', 30, true, [
    ['Hähnchenbrustfilet', 400, 'g'], ['Champignons', 250, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Sahne', 200, 'ml'], ['Reis', 250, 'g'], ['Paprikapulver', 1, 'TL'], ['Petersilie', 1, 'Bund'],
  ], 'Hähnchen in Streifen scharf anbraten, herausnehmen. Zwiebel und Pilze braten, Sahne dazu, Fleisch zurück in die Pfanne. Mit Reis.'),
]

/** Frühstück ist ein Baukasten: feste Mengen für die Woche, keine Rezepte. */
export const START_FRUEHSTUECK = [
  { name: 'Haferflocken', menge: 500, einheit: 'g' as const },
  { name: 'Milch', menge: 3000, einheit: 'ml' as const },
  { name: 'Joghurt', menge: 1000, einheit: 'g' as const },
  { name: 'Bauernbrot', menge: 2, einheit: 'Stück' as const },
  { name: 'Bergkäse', menge: 250, einheit: 'g' as const },
  { name: 'Butter', menge: 250, einheit: 'g' as const },
  { name: 'Eier', menge: 6, einheit: 'Stück' as const },
  { name: 'Äpfel', menge: 8, einheit: 'Stück' as const },
  { name: 'Bananen', menge: 6, einheit: 'Stück' as const },
  { name: 'Marmelade', menge: 1, einheit: 'Glas' as const },
]
