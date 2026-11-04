import { STARTFOTOS } from './startfotos'
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
    ...(STARTFOTOS[id] ? { foto: STARTFOTOS[id] } : {}),
  }
}

/**
 * Mengen jeweils für vier normale Portionen; die App rechnet auf euren Haushalt um.
 * Grundstock 2 (11/2026): Hausmannskost, Mediterranes, Eintöpfe, Aufläufe, Reis, Brotzeit.
 * Fleisch nur Hähnchen, Nudeln die Ausnahme.
 */
export const STARTREZEPTE: Rezept[] = [
  // Kartoffeln & Gemüse (Markttag)
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
  r('ofenkartoffel-kraeuterquark', 'Ofenkartoffeln mit Kräuterquark', 'gemuese', 45, true, [
    ['Kartoffeln', 1200, 'g'], ['Quark', 500, 'g'], ['Schnittlauch', 1, 'Bund'],
    ['Gurke', 1, 'Stück'], ['Radieschen', 1, 'Bund'], ['Olivenöl', 2, 'EL'],
  ], 'Kartoffeln halbieren, mit Öl und Salz auf dem Blech 40 Minuten bei 200 °C backen. Quark mit etwas Milch, Schnittlauch und Salz verrühren, Gurke und Radieschen dazu.'),
  r('spinat-ei-kartoffeln', 'Rahmspinat mit Spiegelei und Kartoffeln', 'gemuese', 30, true, [
    ['Blattspinat (TK)', 600, 'g'], ['Eier', 6, 'Stück'], ['Kartoffeln', 1000, 'g'],
    ['Sahne', 100, 'ml'], ['Zwiebeln', 1, 'Stück'], ['Muskat', 1, 'Prise'],
  ], 'Salzkartoffeln kochen. Zwiebel anschwitzen, Spinat dazu, mit Sahne und Muskat cremig einkochen. Spiegeleier braten.'),
  r('ratatouille', 'Ratatouille mit Baguette', 'gemuese', 45, false, [
    ['Aubergine', 1, 'Stück'], ['Zucchini', 2, 'Stück'], ['Paprika', 2, 'Stück'],
    ['Tomaten', 4, 'Stück'], ['Zwiebeln', 1, 'Stück'], ['Knoblauch', 2, 'Zehe'],
    ['Olivenöl', 3, 'EL'], ['Baguette', 1, 'Stück'],
  ], 'Gemüse in gleich große Würfel schneiden, nacheinander in Olivenöl anbraten, Tomaten und Knoblauch dazu und 20 Minuten schmoren. Mit Baguette.'),
  r('shakshuka', 'Shakshuka mit Brot', 'gemuese', 30, true, [
    ['Eier', 6, 'Stück'], ['Paprika', 2, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Gehackte Tomaten', 2, 'Dose'], ['Feta', 100, 'g'], ['Kreuzkümmel', 1, 'TL'], ['Bauernbrot', 1, 'Stück'],
  ], 'Zwiebel und Paprika weich braten, Kreuzkümmel und Tomaten dazu, 10 Minuten köcheln. Mulden drücken, Eier hineinschlagen und zugedeckt stocken lassen. Feta darüber.'),
  r('blumenkohl-kaesesauce', 'Blumenkohl mit Käsesauce und Kartoffeln', 'gemuese', 35, true, [
    ['Blumenkohl', 1, 'Stück'], ['Kartoffeln', 800, 'g'], ['Milch', 400, 'ml'],
    ['Butter', 30, 'g'], ['Mehl', 2, 'EL'], ['Reibekäse', 100, 'g'], ['Muskat', 1, 'Prise'],
  ], 'Blumenkohl in Röschen garen, Kartoffeln kochen. Butter und Mehl anschwitzen, Milch einrühren, Käse darin schmelzen, mit Muskat abschmecken.'),

  // Eintopf & Suppe
  r('kuerbissuppe', 'Kürbissuppe mit Brot', 'eintopf', 35, true, [
    ['Hokkaido-Kürbis', 1000, 'g'], ['Kartoffeln', 300, 'g'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Kokosmilch', 1, 'Dose'], ['Gemüsebrühe', 1, 'EL'], ['Baguette', 1, 'Stück'],
  ], 'Gemüse würfeln, in 1 l Brühe 20 Minuten kochen, Kokosmilch dazu und pürieren. Mit frischem Brot vom Markt.'),
  r('minestrone', 'Minestrone mit Suppennudeln', 'eintopf', 40, true, [
    ['Möhren', 2, 'Stück'], ['Zucchini', 1, 'Stück'], ['Kartoffeln', 300, 'g'],
    ['Lauch', 1, 'Stück'], ['Gehackte Tomaten', 1, 'Dose'], ['Kidneybohnen', 1, 'Dose'],
    ['Kleine Suppennudeln', 100, 'g'], ['Gemüsebrühe', 1, 'EL'], ['Parmesan', 30, 'g'],
  ], 'Gemüse würfeln und anschwitzen, Tomaten und 1,2 l Brühe dazu, 20 Minuten köcheln, Nudeln und Bohnen die letzten 8 Minuten mitkochen.'),
  r('wirsing-eintopf', 'Wirsing-Kartoffel-Eintopf', 'eintopf', 40, false, [
    ['Wirsing', 1, 'Stück'], ['Kartoffeln', 600, 'g'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'], ['Schmand', 200, 'g'], ['Muskat', 1, 'Prise'],
  ], 'Wirsing in Streifen, Kartoffeln und Möhren würfeln, in 1,2 l Brühe 25 Minuten köcheln. Mit Muskat würzen, mit einem Klecks Schmand servieren.'),
  r('kartoffelsuppe', 'Kartoffelsuppe', 'eintopf', 40, true, [
    ['Kartoffeln', 1000, 'g'], ['Möhren', 2, 'Stück'], ['Lauch', 1, 'Stück'],
    ['Knollensellerie', 1, 'Stück'], ['Zwiebeln', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'],
    ['Sahne', 100, 'ml'], ['Petersilie', 1, 'Bund'],
  ], 'Gemüse würfeln (vom Sellerie ein Viertel), in 1,5 l Brühe 25 Minuten kochen, die Hälfte pürieren, Sahne dazu. Mit Petersilie bestreuen.'),
  r('erbsensuppe', 'Erbsensuppe', 'eintopf', 75, true, [
    ['Schälerbsen', 400, 'g'], ['Kartoffeln', 400, 'g'], ['Möhren', 2, 'Stück'],
    ['Lauch', 1, 'Stück'], ['Knollensellerie', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'],
  ], 'Erbsen mit 1,8 l Brühe 40 Minuten kochen, Gemüse gewürfelt dazu (vom Sellerie ein Viertel) und weitere 25 Minuten köcheln, bis die Erbsen zerfallen.'),
  r('huehnersuppe', 'Hühnersuppe mit Suppennudeln', 'eintopf', 75, true, [
    ['Hähnchenschenkel', 4, 'Stück'], ['Möhren', 3, 'Stück'], ['Knollensellerie', 1, 'Stück'],
    ['Lauch', 1, 'Stück'], ['Kleine Suppennudeln', 150, 'g'], ['Petersilie', 1, 'Bund'],
  ], 'Hähnchenschenkel mit 2 l Wasser, Salz und dem groben Gemüse eine Stunde leise kochen. Fleisch vom Knochen lösen, Gemüse klein schneiden, Nudeln in der Brühe garen.'),
  r('bohneneintopf', 'Grüner Bohneneintopf', 'eintopf', 35, true, [
    ['Grüne Bohnen (TK)', 450, 'g'], ['Kartoffeln', 600, 'g'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'], ['Petersilie', 1, 'Bund'],
  ], 'Zwiebel anschwitzen, Kartoffeln und Möhren gewürfelt dazu, mit 1,2 l Brühe aufgießen, 10 Minuten kochen, Bohnen dazu und weitere 10 Minuten.'),
  r('tomatensuppe-reis', 'Tomatensuppe mit Reis', 'eintopf', 30, true, [
    ['Gehackte Tomaten', 2, 'Dose'], ['Möhren', 1, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Sahne', 100, 'ml'], ['Gemüsebrühe', 1, 'EL'], ['Reis', 100, 'g'], ['Zucker', 1, 'TL'],
  ], 'Zwiebel und Möhre anschwitzen, Tomaten und 600 ml Brühe dazu, 15 Minuten köcheln, pürieren, mit Sahne und einer Prise Zucker abschmecken. Gekochten Reis einrühren.'),

  // Auflauf & Ofen
  r('ofengemuese-feta', 'Ofengemüse-Blech mit Feta', 'ofen', 45, false, [
    ['Kartoffeln', 600, 'g'], ['Hokkaido-Kürbis', 500, 'g'], ['Rote Bete', 3, 'Stück'],
    ['Möhren', 3, 'Stück'], ['Zwiebeln', 2, 'Stück'], ['Feta', 200, 'g'], ['Olivenöl', 3, 'EL'],
  ], 'Alles in Stücke schneiden, mit Öl und Salz aufs Blech, 35 Minuten bei 200 °C. Feta die letzten 10 Minuten darüberbröseln.'),
  r('haehnchen-blech', 'Hähnchen-Kartoffel-Blech', 'ofen', 55, true, [
    ['Hähnchenschenkel', 4, 'Stück'], ['Kartoffeln', 800, 'g'], ['Möhren', 4, 'Stück'],
    ['Paprika', 2, 'Stück'], ['Paprikapulver', 2, 'TL'], ['Olivenöl', 3, 'EL'],
  ], 'Gemüse grob schneiden, Hähnchen mit Öl und Paprikapulver einreiben, alles aufs Blech, 45 Minuten bei 200 °C.'),
  r('lauch-quiche', 'Lauch-Quiche mit Salat', 'ofen', 60, false, [
    ['Mehl', 250, 'g'], ['Butter', 125, 'g'], ['Eier', 4, 'Stück'], ['Lauch', 2, 'Stück'],
    ['Schmand', 200, 'g'], ['Bergkäse', 100, 'g'], ['Kopfsalat', 1, 'Stück'],
  ], 'Mehl, Butter, 1 Ei und etwas Wasser verkneten, in die Form drücken. Lauch dünsten, mit Schmand, 3 Eiern und Käse darauf, 35 Minuten bei 190 °C.'),
  r('kartoffelgratin', 'Kartoffelgratin mit Feldsalat', 'ofen', 70, true, [
    ['Kartoffeln', 1200, 'g'], ['Sahne', 200, 'ml'], ['Milch', 200, 'ml'],
    ['Knoblauch', 1, 'Zehe'], ['Reibekäse', 100, 'g'], ['Muskat', 1, 'Prise'], ['Feldsalat', 150, 'g'],
  ], 'Kartoffeln in dünne Scheiben hobeln und in eine mit Knoblauch ausgeriebene Form schichten. Sahne und Milch würzen, darübergießen, Käse obenauf, 50 Minuten bei 180 °C.'),
  r('kartoffel-brokkoli-auflauf', 'Kartoffel-Brokkoli-Auflauf', 'ofen', 60, true, [
    ['Brokkoli', 1, 'Stück'], ['Kartoffeln', 800, 'g'], ['Möhren', 2, 'Stück'],
    ['Eier', 3, 'Stück'], ['Milch', 300, 'ml'], ['Reibekäse', 150, 'g'],
  ], 'Kartoffeln vorkochen und in Scheiben schneiden, Brokkoli und Möhren kurz blanchieren. In die Form schichten, Eier mit Milch verquirlen und darübergießen, Käse obenauf, 30 Minuten bei 190 °C.'),
  r('gefuellte-paprika', 'Gefüllte Paprika mit Reis und Feta', 'ofen', 60, false, [
    ['Paprika', 4, 'Stück'], ['Reis', 150, 'g'], ['Feta', 150, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Passierte Tomaten', 500, 'g'], ['Oregano', 1, 'TL'],
  ], 'Reis vorkochen, mit Zwiebelwürfeln, zerbröseltem Feta und Oregano mischen. In die ausgehöhlten Paprika füllen, in Tomatensauce 35 Minuten bei 190 °C schmoren.'),
  r('auberginen-auflauf', 'Auberginen-Auflauf mit Mozzarella', 'ofen', 60, false, [
    ['Aubergine', 2, 'Stück'], ['Passierte Tomaten', 700, 'g'], ['Mozzarella', 250, 'g'],
    ['Parmesan', 40, 'g'], ['Knoblauch', 1, 'Zehe'], ['Olivenöl', 3, 'EL'], ['Baguette', 1, 'Stück'],
  ], 'Auberginenscheiben in Öl braten, abwechselnd mit Tomatensauce und Mozzarella in die Form schichten, Parmesan obenauf, 30 Minuten bei 200 °C. Mit Baguette.'),
  r('gemuese-reis-auflauf', 'Gemüse-Reis-Auflauf', 'ofen', 50, true, [
    ['Reis', 250, 'g'], ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'],
    ['Erbsen (TK)', 200, 'g'], ['Sahne', 200, 'ml'], ['Reibekäse', 150, 'g'],
  ], 'Reis halb gar kochen, mit gewürfeltem Gemüse und Erbsen in die Form, Sahne würzen und darübergießen, Käse obenauf, 25 Minuten bei 200 °C.'),

  // Reis & Pfanne
  r('haehnchen-geschnetzeltes', 'Hähnchen-Geschnetzeltes mit Reis', 'reis', 30, true, [
    ['Hähnchenbrustfilet', 400, 'g'], ['Champignons', 250, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Sahne', 200, 'ml'], ['Reis', 250, 'g'], ['Paprikapulver', 1, 'TL'], ['Petersilie', 1, 'Bund'],
  ], 'Hähnchen in Streifen scharf anbraten, herausnehmen. Zwiebel und Pilze braten, Sahne dazu, Fleisch zurück in die Pfanne. Mit Reis.'),
  r('gemuesereis-ei', 'Gebratener Gemüsereis mit Ei', 'reis', 25, true, [
    ['Reis', 300, 'g'], ['Erbsen (TK)', 200, 'g'], ['Möhren', 2, 'Stück'],
    ['Paprika', 1, 'Stück'], ['Eier', 3, 'Stück'], ['Sojasauce', 3, 'EL'], ['Rapsöl', 2, 'EL'],
  ], 'Reis am Vortag kochen oder Reste nehmen. Gemüse würfeln und scharf anbraten, Reis dazu, Eier darüber stocken lassen und unterrühren, mit Sojasauce würzen.'),
  r('kuerbisrisotto', 'Kürbisrisotto', 'reis', 40, true, [
    ['Risottoreis', 300, 'g'], ['Hokkaido-Kürbis', 500, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Gemüsebrühe', 1, 'EL'], ['Parmesan', 50, 'g'], ['Butter', 20, 'g'],
  ], 'Zwiebel und Reis glasig dünsten, Kürbiswürfel dazu. Nach und nach 1 l heiße Brühe angießen und rühren, bis der Reis cremig ist. Butter und Parmesan unterziehen.'),
  r('haehnchen-curry', 'Hähnchen-Curry mit Reis', 'reis', 30, true, [
    ['Hähnchenbrustfilet', 400, 'g'], ['Kokosmilch', 1, 'Dose'], ['Paprika', 1, 'Stück'],
    ['Möhren', 2, 'Stück'], ['Erbsen (TK)', 150, 'g'], ['Currypulver', 2, 'TL'], ['Reis', 250, 'g'],
  ], 'Hähnchen in Stücken anbraten, Curry kurz mitrösten, Gemüse und Kokosmilch dazu, 15 Minuten köcheln, Erbsen am Ende. Mit Reis.'),
  r('paella', 'Paella mit Hähnchen und Garnelen', 'reis', 45, false, [
    ['Risottoreis', 300, 'g'], ['Hähnchenbrustfilet', 300, 'g'], ['Garnelen (TK)', 200, 'g'],
    ['Paprika', 2, 'Stück'], ['Erbsen (TK)', 150, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Gehackte Tomaten', 1, 'Dose'], ['Paprikapulver', 1, 'TL'], ['Gemüsebrühe', 1, 'EL'],
  ], 'Hähnchen und Paprika in einer großen Pfanne anbraten, Zwiebel, Reis und Paprikapulver dazu, Tomaten und 800 ml Brühe angießen, 20 Minuten ohne Rühren garen. Garnelen und Erbsen die letzten 8 Minuten.'),
  r('bulgur-pfanne', 'Bulgur-Gemüse-Pfanne mit Feta', 'reis', 25, false, [
    ['Bulgur', 250, 'g'], ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'],
    ['Kichererbsen', 1, 'Dose'], ['Feta', 150, 'g'], ['Petersilie', 1, 'Bund'], ['Zitrone', 1, 'Stück'],
  ], 'Bulgur in 500 ml Brühe quellen lassen. Gemüse und Kichererbsen anbraten, Bulgur unterheben, mit Zitrone und Petersilie abschmecken, Feta darüberbröseln.'),
  r('couscous-ofengemuese', 'Couscous mit Ofengemüse und Joghurt', 'reis', 35, true, [
    ['Couscous', 300, 'g'], ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'],
    ['Kirschtomaten', 250, 'g'], ['Joghurt', 300, 'g'], ['Kreuzkümmel', 1, 'TL'], ['Olivenöl', 2, 'EL'],
  ], 'Gemüse mit Öl und Kreuzkümmel 25 Minuten bei 200 °C rösten. Couscous mit heißem Wasser übergießen und quellen lassen. Mit dem Gemüse und einem Klecks Joghurt.'),
  r('milchreis', 'Milchreis mit Apfelmus', 'reis', 40, true, [
    ['Milchreis', 250, 'g'], ['Milch', 1000, 'ml'], ['Zucker', 3, 'EL'],
    ['Butter', 10, 'g'], ['Apfelmus', 1, 'Glas'],
  ], 'Milch mit Zucker und Butter aufkochen, Reis einrühren und bei kleiner Hitze 30 Minuten quellen lassen, dabei ab und zu rühren. Mit Apfelmus und Zimt.'),
  r('spitzkohl-haehnchen-pfanne', 'Spitzkohl-Hähnchen-Pfanne mit Reis', 'reis', 30, true, [
    ['Hähnchenbrustfilet', 300, 'g'], ['Spitzkohl', 600, 'g'], ['Möhren', 2, 'Stück'],
    ['Sojasauce', 3, 'EL'], ['Rapsöl', 2, 'EL'], ['Reis', 250, 'g'],
  ], 'Hähnchen in Streifen anbraten und herausnehmen. Kohl und Möhren in Streifen scharf anbraten, Fleisch zurück, mit Sojasauce würzen. Mit Reis.'),

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
  r('fischfrikadellen', 'Fischfrikadellen mit Kartoffeln und Gurkensalat', 'fisch', 45, true, [
    ['Seelachsfilet (TK)', 500, 'g'], ['Eier', 1, 'Stück'], ['Zwiebeln', 1, 'Stück'],
    ['Haferflocken', 50, 'g'], ['Kartoffeln', 800, 'g'], ['Gurke', 1, 'Stück'],
    ['Dill', 1, 'Bund'], ['Joghurt', 150, 'g'],
  ], 'Aufgetauten Fisch fein hacken, mit Ei, geriebener Zwiebel und Haferflocken verkneten, flache Frikadellen braten. Salzkartoffeln und Gurkensalat mit Joghurt und Dill dazu.'),
  r('fischauflauf-spinat', 'Fischauflauf mit Spinat und Kartoffeln', 'fisch', 55, true, [
    ['Seelachsfilet (TK)', 400, 'g'], ['Blattspinat (TK)', 450, 'g'], ['Kartoffeln', 800, 'g'],
    ['Sahne', 200, 'ml'], ['Reibekäse', 100, 'g'], ['Zitrone', 1, 'Stück'],
  ], 'Kartoffeln vorkochen und in Scheiben in die Form legen, Spinat darauf, Fisch in Stücken mit Zitrone beträufelt obenauf. Sahne darüber, Käse drauf, 30 Minuten bei 190 °C.'),
  r('fisch-mediterran', 'Fisch aus dem Ofen mit Tomaten und Oliven', 'fisch', 40, false, [
    ['Seelachsfilet (TK)', 400, 'g'], ['Kirschtomaten', 250, 'g'], ['Zucchini', 1, 'Stück'],
    ['Oliven', 1, 'Glas'], ['Kartoffeln', 800, 'g'], ['Olivenöl', 3, 'EL'], ['Zitrone', 1, 'Stück'],
  ], 'Kartoffelspalten 20 Minuten bei 200 °C vorbacken. Fisch, Tomaten, Zucchini und Oliven dazulegen, mit Öl und Zitrone beträufeln, weitere 15 Minuten.'),

  // Hülsenfrüchte
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
  r('bohnen-wraps', 'Wraps mit Bohnen und Käse', 'huelsenfruechte', 20, true, [
    ['Tortilla-Wraps', 1, 'Packung'], ['Kidneybohnen', 1, 'Dose'], ['Mais', 1, 'Dose'],
    ['Paprika', 1, 'Stück'], ['Reibekäse', 150, 'g'], ['Schmand', 200, 'g'], ['Gurke', 1, 'Stück'],
  ], 'Bohnen grob zerdrücken, mit Mais und Paprika mischen. Jeder füllt seinen Wrap selbst, mit Käse kurz in der Pfanne anrösten.'),
  r('linsensuppe', 'Linsensuppe', 'huelsenfruechte', 45, true, [
    ['Tellerlinsen', 250, 'g'], ['Kartoffeln', 400, 'g'], ['Möhren', 2, 'Stück'],
    ['Lauch', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'], ['Essig', 1, 'EL'],
  ], 'Gemüse würfeln, mit Linsen und 1,5 l Brühe 35 Minuten kochen. Mit einem Schuss Essig abschmecken. Wird aufgewärmt noch besser.'),
  r('linsen-dal', 'Rotes Linsen-Dal mit Reis', 'huelsenfruechte', 30, true, [
    ['Rote Linsen', 250, 'g'], ['Kokosmilch', 1, 'Dose'], ['Gehackte Tomaten', 1, 'Dose'],
    ['Zwiebeln', 1, 'Stück'], ['Currypulver', 2, 'TL'], ['Reis', 250, 'g'],
  ], 'Zwiebel und Curry anschwitzen, Linsen, Tomaten, Kokosmilch und 300 ml Wasser dazu, 20 Minuten köcheln, bis die Linsen zerfallen. Mit Reis.'),
  r('weisse-bohnen-tomaten', 'Weiße Bohnen in Tomatensauce mit Brot', 'huelsenfruechte', 25, false, [
    ['Weiße Bohnen', 2, 'Dose'], ['Gehackte Tomaten', 1, 'Dose'], ['Zwiebeln', 1, 'Stück'],
    ['Knoblauch', 1, 'Zehe'], ['Oregano', 1, 'TL'], ['Olivenöl', 2, 'EL'], ['Bauernbrot', 1, 'Stück'],
  ], 'Zwiebel und Knoblauch in Olivenöl anschwitzen, Tomaten und Oregano dazu, 10 Minuten köcheln, Bohnen darin erwärmen. Mit kräftigem Brot.'),

  // Nudeln – nur noch ab und zu
  r('nudeln-gemuesesauce', 'Nudeln mit versteckter Gemüsesauce', 'nudeln', 30, true, [
    ['Zucchini', 1, 'Stück'], ['Paprika', 1, 'Stück'], ['Möhren', 2, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Passierte Tomaten', 500, 'g'], ['Fusilli', 500, 'g'],
    ['Parmesan', 40, 'g'], ['Olivenöl', 2, 'EL'],
  ], 'Gemüse klein schneiden, in Öl anbraten, Tomaten dazu, 15 Minuten köcheln und fein pürieren. Das Kind sieht kein Gemüse – isst es aber.'),
  r('kuerbis-sahne-pasta', 'Kürbis-Sahne-Pasta', 'nudeln', 30, true, [
    ['Hokkaido-Kürbis', 600, 'g'], ['Zwiebeln', 1, 'Stück'], ['Sahne', 200, 'ml'],
    ['Penne', 500, 'g'], ['Parmesan', 50, 'g'], ['Muskat', 1, 'Prise'], ['Olivenöl', 1, 'EL'],
  ], 'Kürbis mit Schale würfeln, mit Zwiebel anbraten, mit Sahne und etwas Nudelwasser weich köcheln und pürieren. Mit Nudeln und Parmesan mischen.'),
  r('makkaroni-kaese-brokkoli', 'Makkaroni mit Käsesauce und Brokkoli', 'nudeln', 25, true, [
    ['Makkaroni', 500, 'g'], ['Brokkoli', 1, 'Stück'], ['Milch', 400, 'ml'],
    ['Butter', 30, 'g'], ['Mehl', 2, 'EL'], ['Reibekäse', 150, 'g'],
  ], 'Brokkoliröschen die letzten 4 Minuten mit den Nudeln kochen. Butter und Mehl anschwitzen, Milch einrühren, Käse darin schmelzen. Alles mischen.'),
  r('pesto-nudeln-tomaten', 'Pesto-Nudeln mit Kirschtomaten', 'nudeln', 15, true, [
    ['Fusilli', 500, 'g'], ['Pesto', 1, 'Glas'], ['Kirschtomaten', 250, 'g'], ['Parmesan', 40, 'g'],
  ], 'Nudeln kochen, mit Pesto und etwas Nudelwasser mischen, halbierte Tomaten und Parmesan darüber. Das schnellste Gericht der Woche.'),
  r('lachs-spinat-tagliatelle', 'Tagliatelle mit Lachs und Spinat', 'nudeln', 25, false, [
    ['Lachsfilet (TK)', 250, 'g'], ['Blattspinat (TK)', 450, 'g'], ['Sahne', 200, 'ml'],
    ['Tagliatelle', 500, 'g'], ['Zitrone', 1, 'Stück'], ['Knoblauch', 1, 'Zehe'],
  ], 'Spinat mit Knoblauch und Sahne erhitzen, Lachs in Würfeln darin garziehen lassen. Mit Zitrone abschmecken, Nudeln unterheben.'),

  // Brotzeit
  r('brotzeitplatte', 'Brotzeitplatte mit Käse, Ei und Rohkost', 'brotzeit', 15, true, [
    ['Bauernbrot', 1, 'Stück'], ['Butter', 100, 'g'], ['Gouda', 200, 'g'], ['Bergkäse', 150, 'g'],
    ['Radieschen', 1, 'Bund'], ['Gurke', 1, 'Stück'], ['Tomaten', 3, 'Stück'], ['Eier', 4, 'Stück'],
  ], 'Eier hart kochen. Brot, Käse und Rohkost auf einem Brett anrichten – jeder belegt sich selbst.'),
  r('kraeuterquark-brot', 'Kräuterquark mit Vollkornbrot und Rohkost', 'brotzeit', 15, true, [
    ['Vollkornbrot', 1, 'Stück'], ['Quark', 500, 'g'], ['Schnittlauch', 1, 'Bund'],
    ['Radieschen', 1, 'Bund'], ['Gurke', 1, 'Stück'], ['Möhren', 2, 'Stück'],
  ], 'Quark mit einem Schuss Milch glatt rühren, Schnittlauch, Salz und Pfeffer dazu. Mit Brot und Gemüsesticks.'),
  r('strammer-max', 'Strammer Max mit Käse', 'brotzeit', 20, true, [
    ['Bauernbrot', 1, 'Stück'], ['Eier', 6, 'Stück'], ['Gouda', 150, 'g'],
    ['Tomaten', 3, 'Stück'], ['Butter', 40, 'g'], ['Schnittlauch', 1, 'Bund'],
  ], 'Brotscheiben in Butter anrösten, mit Käse belegen, Spiegelei obenauf. Tomaten und Schnittlauch dazu.'),
  r('bruschetta', 'Bruschetta mit Tomate und Mozzarella', 'brotzeit', 20, true, [
    ['Baguette', 2, 'Stück'], ['Tomaten', 6, 'Stück'], ['Knoblauch', 2, 'Zehe'],
    ['Basilikum', 1, 'Bund'], ['Mozzarella', 250, 'g'], ['Olivenöl', 4, 'EL'],
  ], 'Baguette in Scheiben rösten und mit Knoblauch einreiben. Tomaten würfeln, mit Öl, Salz und Basilikum mischen, mit Mozzarella auf das Brot geben.'),
  r('obatzda', 'Obatzda mit Brot und Radieschen', 'brotzeit', 15, false, [
    ['Camembert', 250, 'g'], ['Frischkäse', 150, 'g'], ['Butter', 30, 'g'], ['Zwiebeln', 1, 'Stück'],
    ['Paprikapulver', 1, 'TL'], ['Bauernbrot', 1, 'Stück'], ['Radieschen', 1, 'Bund'],
  ], 'Camembert mit der Gabel zerdrücken, mit Frischkäse, weicher Butter, fein gewürfelter Zwiebel und Paprikapulver verrühren. Mit Brot und Radieschen.'),
  r('hummus-teller', 'Hummus mit Gemüsesticks und Fladenbrot', 'brotzeit', 20, true, [
    ['Kichererbsen', 2, 'Dose'], ['Zitrone', 1, 'Stück'], ['Knoblauch', 1, 'Zehe'],
    ['Olivenöl', 4, 'EL'], ['Kreuzkümmel', 1, 'TL'], ['Möhren', 3, 'Stück'], ['Gurke', 1, 'Stück'],
    ['Paprika', 1, 'Stück'], ['Fladenbrot', 1, 'Stück'],
  ], 'Kichererbsen mit etwas Kochwasser, Zitronensaft, Knoblauch, Öl und Kreuzkümmel fein pürieren. Gemüse in Sticks schneiden, Fladenbrot kurz aufbacken.'),
  r('ruehrei-vollkornbrot', 'Rührei mit Schnittlauch auf Vollkornbrot', 'brotzeit', 15, true, [
    ['Eier', 8, 'Stück'], ['Milch', 100, 'ml'], ['Schnittlauch', 1, 'Bund'],
    ['Vollkornbrot', 1, 'Stück'], ['Tomaten', 3, 'Stück'], ['Butter', 20, 'g'],
  ], 'Eier mit Milch verquirlen, in Butter bei mittlerer Hitze cremig stocken lassen, Schnittlauch darüber. Auf Brot, Tomaten dazu.'),

  // Etwas Besonderes (Sonntag)
  r('pizza-selbst-belegen', 'Pizza selbst belegen', 'besonders', 75, true, [
    ['Mehl', 500, 'g'], ['Trockenhefe', 1, 'Packung'], ['Passierte Tomaten', 250, 'g'],
    ['Mozzarella', 250, 'g'], ['Paprika', 1, 'Stück'], ['Champignons', 200, 'g'],
    ['Mais', 1, 'Dose'], ['Oregano', 1, 'TL'], ['Olivenöl', 3, 'EL'],
  ], 'Teig aus Mehl, Hefe, Öl und 300 ml lauwarmem Wasser 45 Minuten gehen lassen. Jeder belegt ein Stück selbst, 12 Minuten bei 250 °C.'),
  r('apfelpfannkuchen', 'Apfelpfannkuchen', 'besonders', 30, true, [
    ['Mehl', 250, 'g'], ['Milch', 500, 'ml'], ['Eier', 4, 'Stück'], ['Äpfel', 3, 'Stück'],
    ['Zucker', 2, 'EL'], ['Butter', 30, 'g'],
  ], 'Teig verrühren und kurz quellen lassen. Apfelscheiben in Butter anbraten, Teig darüber, von beiden Seiten goldbraun backen.'),
  r('flammkuchen', 'Flammkuchen mit Lauch und Zwiebeln', 'besonders', 40, true, [
    ['Mehl', 300, 'g'], ['Schmand', 200, 'g'], ['Zwiebeln', 2, 'Stück'],
    ['Lauch', 1, 'Stück'], ['Reibekäse', 100, 'g'], ['Olivenöl', 2, 'EL'],
  ], 'Mehl, Öl, Salz und 150 ml Wasser verkneten, dünn ausrollen. Schmand aufstreichen, Zwiebel- und Lauchringe und etwas Käse darauf, 12 Minuten bei 250 °C.'),
  r('haehnchen-gyros', 'Hähnchen-Gyros mit Tzatziki und Fladenbrot', 'besonders', 35, true, [
    ['Hähnchenbrustfilet', 500, 'g'], ['Joghurt', 300, 'g'], ['Gurke', 1, 'Stück'],
    ['Knoblauch', 1, 'Zehe'], ['Paprikapulver', 2, 'TL'], ['Fladenbrot', 2, 'Stück'],
    ['Tomaten', 3, 'Stück'], ['Zwiebeln', 1, 'Stück'],
  ], 'Hähnchen in Streifen mit Paprikapulver und Öl würzen und kräftig braten. Joghurt mit geriebener Gurke und Knoblauch verrühren. Alles mit Tomaten und Zwiebeln ins Fladenbrot.'),
  r('kaiserschmarrn', 'Kaiserschmarrn mit Apfelmus', 'besonders', 35, true, [
    ['Mehl', 200, 'g'], ['Milch', 400, 'ml'], ['Eier', 4, 'Stück'], ['Zucker', 2, 'EL'],
    ['Butter', 40, 'g'], ['Apfelmus', 1, 'Glas'],
  ], 'Eier trennen, Teig aus Mehl, Milch und Eigelb rühren, Eischnee unterheben. In Butter anbacken, wenden, mit zwei Gabeln zerreißen und mit Zucker karamellisieren.'),
  r('haehnchenschnitzel-kartoffelsalat', 'Hähnchenschnitzel mit Kartoffelsalat', 'besonders', 50, true, [
    ['Hähnchenbrustfilet', 500, 'g'], ['Eier', 2, 'Stück'], ['Mehl', 3, 'EL'],
    ['Paniermehl', 100, 'g'], ['Kartoffeln', 1000, 'g'], ['Gurke', 1, 'Stück'],
    ['Zwiebeln', 1, 'Stück'], ['Gemüsebrühe', 1, 'EL'], ['Essig', 3, 'EL'], ['Rapsöl', 6, 'EL'],
  ], 'Kartoffeln kochen, pellen, in Scheiben schneiden und mit warmer Brühe, Essig, Öl, Zwiebel und Gurke anmachen. Hähnchen flach klopfen, panieren und goldbraun braten.'),
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
