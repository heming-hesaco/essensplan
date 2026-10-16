import type { Foto } from './typen'

/**
 * Fotos der Startgerichte: frei lizenziert (CC BY, CC BY-SA, CC0 oder gemeinfrei), gefunden
 * über Openverse, gehostet bei Flickr. Jedes ist von Hand angesehen; wo keins zum Gericht
 * passte, steht keins – dann zeigt die App eine farbige Kachel. Urheber und Lizenz werden in
 * der Rezeptansicht genannt, das verlangen die CC-Lizenzen.
 */
export const STARTFOTOS: Record<string, Foto> = {
  'spaghetti-bolognese': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2095/2145112149_11cbd092aa_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/2145112149", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'nudeln-gemuesesauce': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2160/2317236233_aa6999c37f_z.jpg", seite: "https://www.flickr.com/photos/19517696@N00/2317236233", autor: "shawnzrossi", lizenz: "CC BY 2.0" },
  'lachs-spinat-tagliatelle': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/104/286016563_f46aa12521_z.jpg", seite: "https://www.flickr.com/photos/68978695@N00/286016563", autor: "Risager", lizenz: "CC BY-SA 2.0" },
  'lauch-schinken-nudeln': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3340/3504704315_e27a061486_z.jpg", seite: "https://www.flickr.com/photos/15441925@N00/3504704315", autor: "www.theedinburghblog.co.uk", lizenz: "CC BY 2.0" },
  'hackbaellchen-tomatensauce': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6170/6173671382_a508ac3ed5_z.jpg", seite: "https://www.flickr.com/photos/97451431@N00/6173671382", autor: "Allerina & Glen MacLarty", lizenz: "CC BY 2.0" },
  'asia-gemuesenudeln': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2523/4091977889_b668d78072_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4091977889", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'chili-sin-carne': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7003/6734016371_5ab91dac73_z.jpg", seite: "https://www.flickr.com/photos/13470115@N08/6734016371", autor: "EBKauai", lizenz: "CC BY 2.0" },
  'kichererbsen-curry': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4053/4570354815_5fb3d6a7cf_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4570354815", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'bohnen-wraps': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/6047/6247525003_348d094e75_z.jpg", seite: "https://www.flickr.com/photos/7927684@N03/6247525003", autor: "jeffreyw", lizenz: "CC BY 2.0" },
  'fischstaebchen-pueree': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7383/13818299623_25f80771c2_z.jpg", seite: "https://www.flickr.com/photos/10515323@N08/13818299623", autor: "hazelnicholson", lizenz: "CC BY 2.0" },
  'ofenlachs-kartoffeln': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3279/2815891083_bfe49e38b8_z.jpg", seite: "https://www.flickr.com/photos/72897141@N00/2815891083", autor: "nathanborror", lizenz: "CC BY 2.0" },
  'seelachs-reis-moehren': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2714/4199285277_41b089051d_z.jpg", seite: "https://www.flickr.com/photos/26978304@N08/4199285277", autor: "thienzieyung", lizenz: "CC BY 2.0" },
  'thunfisch-nudeln': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2447/3629848377_656be9e212_z.jpg", seite: "https://www.flickr.com/photos/16105436@N00/3629848377", autor: "Kai Hendry", lizenz: "CC BY 2.0" },
  'nudelauflauf-gemuese': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4152/4977586419_83ff5860b1_z.jpg", seite: "https://www.flickr.com/photos/14529257@N03/4977586419", autor: "Steve A Johnson", lizenz: "CC BY 2.0" },
  'lauch-quiche': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/115/308939511_35426ec5c4_z.jpg", seite: "https://www.flickr.com/photos/24987280@N00/308939511", autor: "LoopZilla", lizenz: "CC BY-SA 2.0" },
  'kuerbissuppe': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/123/319266288_54a1594a39_z.jpg", seite: "https://www.flickr.com/photos/35034346243@N01/319266288", autor: "stu_spivack", lizenz: "CC BY-SA 2.0" },
  'minestrone': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/4130/4947558897_90043080c0_z.jpg", seite: "https://www.flickr.com/photos/10559879@N00/4947558897", autor: "avlxyz", lizenz: "CC BY-SA 2.0" },
  'bratkartoffeln-spiegelei': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/1131/1473232665_34dabb989d_z.jpg", seite: "https://www.flickr.com/photos/98178986@N00/1473232665", autor: "@joefoodie", lizenz: "CC BY 2.0" },
  'kartoffelpuffer-apfelmus': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/5525/11016668073_8914447b6b_z.jpg", seite: "https://www.flickr.com/photos/23206546@N04/11016668073", autor: "Rusty Clark ~ 100K Photos", lizenz: "CC BY 2.0" },
  'pizza-selbst-belegen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/2902/14010702703_26dc1491a5_z.jpg", seite: "https://www.flickr.com/photos/96964826@N05/14010702703", autor: "sonstroem", lizenz: "CC BY 2.0" },
  'lasagne': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/5131/5413268570_f85d9fd78d_z.jpg", seite: "https://www.flickr.com/photos/31474531@N00/5413268570", autor: "plasticrevolver", lizenz: "CC BY-SA 2.0" },
  'apfelpfannkuchen': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/109/296655318_27c5ba7baf_z.jpg", seite: "https://www.flickr.com/photos/88583398@N00/296655318", autor: "akeg", lizenz: "CC BY-SA 2.0" },
  'burger-selbstgemacht': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/3769/9755972015_4c3ede1b1e_z.jpg", seite: "https://www.flickr.com/photos/54063325@N07/9755972015", autor: "Ruocaled", lizenz: "CC BY 2.0" },
  'haehnchen-geschnetzeltes': { art: 'frei', quelle: 'Flickr', url: "https://live.staticflickr.com/7134/6968208222_024d8b07b3_z.jpg", seite: "https://www.flickr.com/photos/7927684@N03/6968208222", autor: "jeffreyw", lizenz: "CC BY 2.0" },
}
