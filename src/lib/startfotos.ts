import type { Foto } from './typen'

/**
 * Fotos der Startgerichte: frei lizenziert (CC BY, CC BY-SA, CC0 oder gemeinfrei), gefunden
 * über Openverse, gehostet bei Flickr. Jedes ist von Hand angesehen; wo keins zum Gericht
 * passte, steht keins – dann zeigt die App eine farbige Kachel. Urheber und Lizenz werden in
 * der Rezeptansicht genannt, das verlangen die CC-Lizenzen.
 */
export const STARTFOTOS: Record<string, Foto> = {
  'nudeln-gemuesesauce': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2160/2317236233_aa6999c37f_z.jpg", seite: "https://www.flickr.com/photos/19517696@N00/2317236233", autor: "shawnzrossi", lizenz: "CC BY 2.0" },
  'lachs-spinat-tagliatelle': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/104/286016563_f46aa12521_z.jpg", seite: "https://www.flickr.com/photos/68978695@N00/286016563", autor: "Risager", lizenz: "CC BY-SA 2.0" },
  'chili-sin-carne': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7003/6734016371_5ab91dac73_z.jpg", seite: "https://www.flickr.com/photos/13470115@N08/6734016371", autor: "EBKauai", lizenz: "CC BY 2.0" },
  'kichererbsen-curry': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4053/4570354815_5fb3d6a7cf_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4570354815", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'bohnen-wraps': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6047/6247525003_348d094e75_z.jpg", seite: "https://www.flickr.com/photos/7927684@N03/6247525003", autor: "jeffreyw", lizenz: "CC BY 2.0" },
  'fischstaebchen-pueree': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7383/13818299623_25f80771c2_z.jpg", seite: "https://www.flickr.com/photos/10515323@N08/13818299623", autor: "hazelnicholson", lizenz: "CC BY 2.0" },
  'ofenlachs-kartoffeln': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3279/2815891083_bfe49e38b8_z.jpg", seite: "https://www.flickr.com/photos/72897141@N00/2815891083", autor: "nathanborror", lizenz: "CC BY 2.0" },
  'seelachs-reis-moehren': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2714/4199285277_41b089051d_z.jpg", seite: "https://www.flickr.com/photos/26978304@N08/4199285277", autor: "thienzieyung", lizenz: "CC BY 2.0" },
  'lauch-quiche': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/115/308939511_35426ec5c4_z.jpg", seite: "https://www.flickr.com/photos/24987280@N00/308939511", autor: "LoopZilla", lizenz: "CC BY-SA 2.0" },
  'kuerbissuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/123/319266288_54a1594a39_z.jpg", seite: "https://www.flickr.com/photos/35034346243@N01/319266288", autor: "stu_spivack", lizenz: "CC BY-SA 2.0" },
  'minestrone': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4130/4947558897_90043080c0_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4947558897", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'bratkartoffeln-spiegelei': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/1131/1473232665_34dabb989d_z.jpg", seite: "https://www.flickr.com/photos/98178986@N00/1473232665", autor: "@joefoodie", lizenz: "CC BY 2.0" },
  'kartoffelpuffer-apfelmus': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/5525/11016668073_8914447b6b_z.jpg", seite: "https://www.flickr.com/photos/23206546@N04/11016668073", autor: "Rusty Clark ~ 100K Photos", lizenz: "CC BY 2.0" },
  'pizza-selbst-belegen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2902/14010702703_26dc1491a5_z.jpg", seite: "https://www.flickr.com/photos/96964826@N05/14010702703", autor: "sonstroem", lizenz: "CC BY 2.0" },
  'apfelpfannkuchen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/109/296655318_27c5ba7baf_z.jpg", seite: "https://www.flickr.com/photos/88583398@N00/296655318", autor: "akeg", lizenz: "CC BY-SA 2.0" },
  'haehnchen-geschnetzeltes': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7134/6968208222_024d8b07b3_z.jpg", seite: "https://www.flickr.com/photos/7927684@N03/6968208222", autor: "jeffreyw", lizenz: "CC BY 2.0" },
  'ratatouille': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6205/6031855501_04a5aff55c_z.jpg", seite: "https://www.flickr.com/photos/22722986@N08/6031855501", autor: "balise42", lizenz: "CC BY-SA 2.0" },
  'shakshuka': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3368/13037224413_52bdd8e517_z.jpg", seite: "https://www.flickr.com/photos/23178876@N03/13037224413", autor: "cyclonebill", lizenz: "CC BY-SA 2.0" },
  'kartoffelsuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2318/2238550149_18112793a3_z.jpg", seite: "https://www.flickr.com/photos/64401168@N00/2238550149", autor: "Average Jane", lizenz: "CC BY 2.0" },
  'erbsensuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2016/2213950065_bfa668c132_z.jpg", seite: "https://www.flickr.com/photos/98545783@N00/2213950065", autor: "Qfamily", lizenz: "CC BY 2.0" },
  'huehnersuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3162/3079682439_351f008b11_z.jpg", seite: "https://www.flickr.com/photos/8286199@N08/3079682439", autor: "bobjudge", lizenz: "CC BY 2.0" },
  'kartoffel-brokkoli-auflauf': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/179/379175770_8d868b0715_z.jpg", seite: "https://www.flickr.com/photos/85936780@N00/379175770", autor: "pelican", lizenz: "CC BY-SA 2.0" },
  'gefuellte-paprika': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3241/5697759851_f9f60ef14c_z.jpg", seite: "https://www.flickr.com/photos/9020344@N02/5697759851", autor: "andrusdevelopment", lizenz: "CC BY 2.0" },
  'auberginen-auflauf': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4067/4416789518_77e409f353_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4416789518", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'gemuesereis-ei': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3371/3177377867_99f2e0147f_z.jpg", seite: "https://www.flickr.com/photos/40933543@N00/3177377867", autor: "fakelvis", lizenz: "CC BY-SA 2.0" },
  'kuerbisrisotto': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7208/6865187647_c5b9ea947c_z.jpg", seite: "https://www.flickr.com/photos/10372764@N03/6865187647", autor: "lsbardel", lizenz: "CC BY 2.0" },
  'haehnchen-curry': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/388/19034391230_20d7f56dac_z.jpg", seite: "https://www.flickr.com/photos/123529748@N03/19034391230", autor: "Cole Kennedy", lizenz: "Public Domain 1.0" },
  'paella': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/1032/1158217645_b7181246ff_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/1158217645", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'milchreis': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/150/428297650_7813fc8344_z.jpg", seite: "https://www.flickr.com/photos/96463101@N00/428297650", autor: "randomduck", lizenz: "CC BY-SA 2.0" },
  'fischfrikadellen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2165/2205655646_b20c56da85_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/2205655646", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'linsensuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/8186/8414696386_0a4759e285_z.jpg", seite: "https://www.flickr.com/photos/69668444@N03/8414696386", autor: "Migle Seikyte", lizenz: "CC BY-SA 2.0" },
  'bruschetta': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6125/5922705584_11d4f78ba1_z.jpg", seite: "https://www.flickr.com/photos/15511507@N00/5922705584", autor: "hepp", lizenz: "CC BY 2.0" },
  'hummus-teller': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/163/429535622_7b4f82b2a6_z.jpg", seite: "https://www.flickr.com/photos/39326934@N00/429535622", autor: "extended.epiphany", lizenz: "CC BY 2.0" },
  'ruehrei-vollkornbrot': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6016/5971373890_262cbe1605_z.jpg", seite: "https://www.flickr.com/photos/56846157@N00/5971373890", autor: "Christine Rondeau", lizenz: "CC BY 2.0" },
  'flammkuchen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4051/4538379821_d1a0f7029f_z.jpg", seite: "https://www.flickr.com/photos/27513492@N00/4538379821", autor: "ugod", lizenz: "CC BY 2.0" },
  'haehnchen-gyros': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7057/6860413577_01a9ef6127_z.jpg", seite: "https://www.flickr.com/photos/7927684@N03/6860413577", autor: "jeffreyw", lizenz: "CC BY 2.0" },
  'kaiserschmarrn': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3309/3274584733_5e89062053_z.jpg", seite: "https://www.flickr.com/photos/29850859@N05/3274584733", autor: "homecooked by deedee", lizenz: "CC BY 2.0" },
  'haehnchenschnitzel-kartoffelsalat': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7104/27067360691_c64936943d_z.jpg", seite: "https://www.flickr.com/photos/27454212@N00/27067360691", autor: "Kent Wang", lizenz: "CC BY-SA 2.0" },
}
