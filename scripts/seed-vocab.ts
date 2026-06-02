import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const sets = [
  { topiccode: 'ES001', topictitle: 'Spanish Essentials 1', description: '40 most common Spanish words', voice: 'es-ES' },
  { topiccode: 'ES002', topictitle: 'Spanish Essentials 2', description: 'Next 40 common words', voice: 'es-ES' },
  { topiccode: 'ES003', topictitle: 'Spanish Essentials 3', description: 'Another 40 essentials', voice: 'es-ES' },
  { topiccode: 'ES004', topictitle: 'Spanish Essentials 4', description: 'Common words 81–160', voice: 'es-ES' },
  { topiccode: 'ES005', topictitle: 'Spanish Essentials 5', description: 'Common words 161–200', voice: 'es-ES' },
  { topiccode: 'ES006', topictitle: 'Spanish Essentials 6', description: 'Common words 201–240', voice: 'es-ES' },
  { topiccode: 'ES007', topictitle: 'Spanish Essentials 7', description: 'Common words 241–280', voice: 'es-ES' },
  { topiccode: 'ES008', topictitle: 'Spanish Essentials 8', description: 'Common words 281–320', voice: 'es-ES' },
  { topiccode: 'ES009', topictitle: 'Spanish Essentials 9', description: 'Common words 321–360', voice: 'es-ES' },
  { topiccode: 'ES010', topictitle: 'Spanish Essentials 10', description: 'Common words 361–400', voice: 'es-ES' },
  { topiccode: 'ES011', topictitle: 'Spanish Verbs 1', description: 'Most common Spanish verbs', voice: 'es-ES' },
  { topiccode: 'ES012', topictitle: 'Spanish Verbs 2', description: 'More common verbs', voice: 'es-ES' },
  { topiccode: 'ES013', topictitle: 'Spanish Food & Drink', description: 'Food and restaurant vocabulary', voice: 'es-ES' },
  { topiccode: 'ES014', topictitle: 'Spanish Travel', description: 'Travel and directions', voice: 'es-ES' },
  { topiccode: 'ES015', topictitle: 'Spanish Family', description: 'Family members and relationships', voice: 'es-ES' },
  { topiccode: 'ES016', topictitle: 'Spanish Numbers & Time', description: 'Numbers, days, months', voice: 'es-ES' },
  { topiccode: 'ES017', topictitle: 'Spanish Adjectives', description: 'Common descriptive words', voice: 'es-ES' },
  { topiccode: 'ES018', topictitle: 'Spanish Clothing', description: 'Clothes and accessories', voice: 'es-ES' },
  { topiccode: 'ES019', topictitle: 'Spanish Body Parts', description: 'Body vocabulary', voice: 'es-ES' },
  { topiccode: 'ES020', topictitle: 'Spanish Emotions', description: 'Feelings and emotions', voice: 'es-ES' },
  { topiccode: 'FR001', topictitle: 'French Essentials 1', description: '40 most common French words', voice: 'fr-FR' },
  { topiccode: 'FR002', topictitle: 'French Essentials 2', description: 'Next 40 common words', voice: 'fr-FR' },
  { topiccode: 'FR003', topictitle: 'French Essentials 3', description: 'Another 40 essentials', voice: 'fr-FR' },
  { topiccode: 'FR004', topictitle: 'French Verbs 1', description: 'Most common French verbs', voice: 'fr-FR' },
  { topiccode: 'FR005', topictitle: 'French Food & Drink', description: 'Food and restaurant vocabulary', voice: 'fr-FR' },
  { topiccode: 'FR006', topictitle: 'French Travel', description: 'Travel and directions', voice: 'fr-FR' },
  { topiccode: 'FR007', topictitle: 'French Family', description: 'Family members', voice: 'fr-FR' },
  { topiccode: 'FR008', topictitle: 'French Numbers & Time', description: 'Numbers, days, months', voice: 'fr-FR' },
  { topiccode: 'IT001', topictitle: 'Italian Essentials 1', description: '40 most common Italian words', voice: 'it-IT' },
  { topiccode: 'DE001', topictitle: 'German Essentials 1', description: '40 most common German words', voice: 'de-DE' },
]

const vocabulary: Record<string, string[]> = {
  ES001: [
    'el|the', 'de|of', 'que|that', 'y|and', 'a|to', 'en|in', 'soy|I am', 'se|oneself', 'un|a', 'una|a',
    'por|for', 'con|with', 'no|no', 'sí|yes', 'como|like', 'pero|but', 'su|his', 'su|her', 'él|he', 'ella|she',
    'lo|it', 'más|more', 'todo|all', 'ya|already', 'muy|very', 'tengo|I have', 'hace|he does', 'puede|he can', 'dice|he says', 'va|he goes',
    've|he sees', 'da|he gives', 'sabe|he knows', 'quiere|he wants', 'llama|he calls', 'viene|he comes', 'trae|he brings', 'oye|he hears', 'pone|he puts', 'sale|he leaves',
  ],
  ES002: [
    'está|he is', 'hay|there is', 'este|this', 'ese|that', 'darse|to give oneself', 'cree|he believes', 've|he sees', 'parece|it seems', 'encuentra|he finds', 'deja|he leaves',
    'conoce|he knows', 'sigue|he follows', 'existe|he exists', 'espera|he waits', 'tiene que|he must', 'pasa|he passes', 'queda|he stays', 'lleva|he carries', 'vuelve|he returns', 'encuentra|he finds',
    'busca|he searches', 'llega|he arrives', 'sale|he exits', 'entra|he enters', 'viene|he comes', 'cae|he falls', 'sienta|he sits', 'duerme|he sleeps', 'escribe|he writes', 'lee|he reads',
    'habla|he speaks', 'escucha|he listens', 'come|he eats', 'bebe|he drinks', 'vive|he lives', 'muere|he dies', 'nace|he is born', 'crece|he grows', 'trabaja|he works', 'juega|he plays',
  ],
  ES003: [
    'tiempo|time', 'vida|life', 'hombre|man', 'mujer|woman', 'niño|child', 'mundo|world', 'lugar|place', 'parte|part', 'día|day', 'mano|hand',
    'gente|people', 'casa|house', 'ciudad|city', 'noche|night', 'año|year', 'forma|form', 'medio|medium', 'sr|Señor|Mr', 'manera|way', 'ejemplo|example',
    'problema|problem', 'parte|part', 'punto|point', 'palabra|word', 'cosa|thing', 'momento|moment', 'lado|side', 'calle|street', 'campo|countryside', 'trabajo|work',
    'familia|family', 'amigo|friend', 'agua|water', 'aire|air', 'fuego|fire', 'tierra|earth', 'mar|sea', 'cielo|sky', 'sol|sun', 'luna|moon',
  ],
  ES004: [
    'primero|first', 'después|after', 'ahora|now', 'antes|before', 'siempre|always', 'nunca|never', 'también|also', 'solo|only', 'bien|well', 'mal|bad',
    'grande|large', 'pequeño|small', 'bueno|good', 'malo|bad', 'nuevo|new', 'viejo|old', 'largo|long', 'corto|short', 'fácil|easy', 'difícil|difficult',
    'blanco|white', 'negro|black', 'rojo|red', 'azul|blue', 'verde|green', 'amarillo|yellow', 'feliz|happy', 'triste|sad', 'lleno|full', 'vacío|empty',
    'abierto|open', 'cerrado|closed', 'alto|high', 'bajo|low', 'fuerte|strong', 'débil|weak', 'listo|ready', 'contento|happy', 'seguro|sure', 'posible|possible',
  ],
  ES005: [
    'duerme|he sleeps', 'despierta|he wakes up', 'desayuna|he has breakfast', 'almuerza|he has lunch', 'cena|he has dinner', 'baña|he bathes', 'viste|he gets dressed', 'desnuda|he gets undressed', 'sienta|he sits down', 'levanta|he stands up',
    'acuesta|he lies down', 'queda|he stays', 'marcha|he leaves', 'llega|he arrives', 'sale|he goes out', 'entra|he comes in', 'sube|he goes up', 'baja|he goes down', 'anda|he walks', 'corre|he runs',
    'nada|he swims', 'vuela|he flies', 'salta|he jumps', 'cae|he falls', 'sube|he climbs', 'baja|he descends', 'abraza|he embraces', 'besa|he kisses', 'ayuda|he helps', 'mira|he looks',
    've|he sees', 'observa|he observes', 'espera|he waits', 'busca|he looks for', 'encuentra|he finds', 'pierde|he loses', 'gana|he wins', 'compra|he buys', 'vende|he sells', 'paga|he pays',
  ],
  ES006: [
    'hermano|brother', 'hermana|sister', 'madre|mother', 'padre|father', 'abuelo|grandfather', 'abuela|grandmother', 'hijo|son', 'hija|daughter', 'tío|uncle', 'tía|aunt',
    'primo|cousin', 'sobrino|nephew', 'sobrina|niece', 'esposo|husband', 'esposa|wife', 'novio|boyfriend', 'novia|girlfriend', 'amigo|friend', 'enemigo|enemy', 'vecino|neighbor',
    'médico|doctor', 'enfermero|nurse', 'profesor|teacher', 'alumno|student', 'jefe|boss', 'empleado|employee', 'abogado|lawyer', 'ingeniero|engineer', 'artista|artist', 'científico|scientist',
    'rey|king', 'reina|queen', 'príncipe|prince', 'princesa|princess', 'soldado|soldier', 'policía|police', 'juez|judge', 'escritor|writer', 'poeta|poet', 'músico|musician',
  ],
  ES007: [
    'uno|one', 'dos|two', 'tres|three', 'cuatro|four', 'cinco|five', 'seis|six', 'siete|seven', 'ocho|eight', 'nueve|nine', 'diez|ten',
    'veinte|twenty', 'treinta|thirty', 'cien|one hundred', 'mil|one thousand', 'primero|first', 'segundo|second', 'tercero|third', 'último|last', 'mitad|half', 'doble|double',
    'lunes|Monday', 'martes|Tuesday', 'miércoles|Wednesday', 'jueves|Thursday', 'viernes|Friday', 'sábado|Saturday', 'domingo|Sunday', 'enero|January', 'febrero|February', 'marzo|March',
    'ahora|now', 'después|after', 'antes|before', 'mañana|tomorrow', 'ayer|yesterday', 'hoy|today', 'siempre|always', 'nunca|never', 'pronto|soon', 'tarde|late',
  ],
  ES008: [
    'come|he eats', 'bebe|he drinks', 'duerme|he sleeps', 'corre|he runs', 'habla|he speaks', 'escucha|he listens', 'lee|he reads', 'escribe|he writes', 'camina|he walks', 'mira|he looks',
    'sabe|he knows', 'conoce|he knows', 'entiende|he understands', 'aprende|he learns', 'enseña|he teaches', 'recuerda|he remembers', 'olvida|he forgets', 'piensa|he thinks', 'cree|he believes', 'imagina|he imagines',
    'come|he eats', 'cocina|he cooks', 'sirve|he serves', 'pide|he asks for', 'da|he gives', 'toma|he takes', 'trae|he brings', 'lleva|he carries', 'abre|he opens', 'cierra|he closes',
    'empieza|he starts', 'termina|he finishes', 'continúa|he continues', 'para|he stops', 'queda|he remains', 'aparece|he appears', 'desaparece|he disappears', 'crece|he grows', 'mengua|he decreases', 'aumenta|he increases',
  ],
  ES009: [
    'cabeza|head', 'ojo|eye', 'nariz|nose', 'boca|mouth', 'diente|tooth', 'lengua|tongue', 'oreja|ear', 'pelo|hair', 'cara|face', 'cuello|neck',
    'hombro|shoulder', 'brazo|arm', 'mano|hand', 'dedo|finger', 'pierna|leg', 'pie|foot', 'rodilla|knee', 'codo|elbow', 'espalda|back', 'pecho|chest',
    'corazón|heart', 'estómago|stomach', 'intestino|intestine', 'hígado|liver', 'riñón|kidney', 'pulmón|lung', 'cerebro|brain', 'sangre|blood', 'hueso|bone', 'piel|skin',
    'enfermo|sick', 'sano|healthy', 'fuerte|strong', 'débil|weak', 'herido|injured', 'cansado|tired', 'contento|happy', 'triste|sad', 'enfermo|ill', 'herido|wounded',
  ],
  ES010: [
    'casa|house', 'edificio|building', 'calle|street', 'ciudad|city', 'pueblo|village', 'país|country', 'mundo|world', 'continente|continent', 'provincia|province', 'barrio|neighborhood',
    'puerta|door', 'ventana|window', 'techo|roof', 'pared|wall', 'suelo|floor', 'escalera|stairs', 'ascensor|elevator', 'habitación|room', 'cocina|kitchen', 'baño|bathroom',
    'dormitorio|bedroom', 'sala|living room', 'comedor|dining room', 'oficina|office', 'tienda|shop', 'fábrica|factory', 'hospital|hospital', 'escuela|school', 'universidad|university', 'iglesia|church',
    'puente|bridge', 'río|river', 'montaña|mountain', 'valle|valley', 'playa|beach', 'bosque|forest', 'desierto|desert', 'isla|island', 'mar|sea', 'lago|lake',
  ],
  ES011: [
    'es|he is', 'está|he is', 'tiene|he has', 'hace|he does', 'va|he goes', 'viene|he comes', 'dice|he says', 've|he sees', 'sabe|he knows', 'quiere|he wants',
    'puede|he can', 'debe|he must', 'da|he gives', 'toma|he takes', 'llama|he calls', 'saca|he takes out', 'pone|he puts', 'vuelve|he returns', 'llega|he arrives', 'sale|he leaves',
    'habla|he speaks', 'escucha|he listens', 'mira|he looks', 'piensa|he thinks', 'cree|he believes', 'trabaja|he works', 'vive|he lives', 'juega|he plays', 'come|he eats', 'bebe|he drinks',
    'duerme|he sleeps', 'camina|he walks', 'corre|he runs', 'lee|he reads', 'escribe|he writes', 'abre|he opens', 'cierra|he closes', 'entra|he enters', 'sale|he exits', 'busca|he searches',
  ],
  ES012: [
    'ser|to be', 'tener|to have', 'hacer|to do', 'ir|to go', 'poder|can', 'querer|to want', 'saber|to know', 'decir|to say', 'ver|to see', 'dar|to give',
    'estar|to be', 'tener|to have', 'hacer|to do', 'poder|can', 'querer|to want', 'deber|must', 'llamar|to call', 'poner|to put', 'creer|to believe', 'hablar|to speak',
    'comer|to eat', 'beber|to drink', 'dormir|to sleep', 'caminar|to walk', 'correr|to run', 'leer|to read', 'escribir|to write', 'vivir|to live', 'trabajar|to work', 'jugar|to play',
    'llevar|to carry', 'traer|to bring', 'buscar|to look for', 'encontrar|to find', 'dejar|to leave', 'volver|to return', 'seguir|to follow', 'conocer|to know', 'esperar|to wait', 'existir|to exist',
  ],
  ES013: [
    'agua|water', 'vino|wine', 'pan|bread', 'carne|meat', 'pollo|chicken', 'pescado|fish', 'arroz|rice', 'verdura|vegetable', 'fruta|fruit', 'ensalada|salad',
    'huevo|egg', 'queso|cheese', 'leche|milk', 'mantequilla|butter', 'aceite|oil', 'sal|salt', 'café|coffee', 'té|tea', 'refresco|soda', 'cerveza|beer',
    'restaurante|restaurant', 'mesa|table', 'cuchara|spoon', 'tenedor|fork', 'cuchillo|knife', 'plato|plate', 'vaso|glass', 'servilleta|napkin', 'cocina|kitchen', 'camarero|waiter',
    'desayuno|breakfast', 'almuerzo|lunch', 'cena|dinner', 'cocinar|to cook', 'comer|to eat', 'beber|to drink', 'pedir|to order', 'pagar|to pay', 'gustar|to like',
  ],
  ES014: [
    'aeropuerto|airport', 'hotel|hotel', 'pasaporte|passport', 'maleta|suitcase', 'vuelo|flight', 'billete|ticket', 'tren|train', 'autobús|bus', 'taxi|taxi', 'coche|car',
    'calle|street', 'plaza|square', 'mapa|map', 'dirección|address', 'izquierda|left', 'derecha|right', 'recto|straight', 'cerca|near', 'lejos|far', 'aquí|here',
    'allí|there', 'dónde|where', 'cuándo|when', 'cómo|how', 'por qué|why', 'cuánto|how much', 'ahora|now', 'después|after', 'antes|before', 'mañana|tomorrow',
    'viajar|to travel', 'llegar|to arrive', 'salir|to leave', 'quedarse|to stay', 'visitar|to visit', 'explorar|to explore', 'perderse|to get lost', 'encontrar|to find', 'reservar|to book', 'empacar|to pack',
  ],
  ES015: [
    'madre|mother', 'padre|father', 'hermano|brother', 'hermana|sister', 'hijo|son', 'hija|daughter', 'abuelo|grandfather', 'abuela|grandmother', 'familia|family', 'padres|parents',
    'esposo|husband', 'esposa|wife', 'novio|boyfriend', 'novia|girlfriend', 'primo|cousin', 'tío|uncle', 'tía|aunt', 'sobrino|nephew', 'sobrina|niece', 'hijo|child',
    'bebé|baby', 'niño|child', 'joven|young person', 'adulto|adult', 'anciano|elderly person', 'vecino|neighbor', 'amigo|friend', 'compañero|companion', 'pareja|couple', 'matrimonio|marriage',
    'amar|to love', 'querer|to love', 'casarse|to marry', 'divorciarse|to divorce', 'nacer|to be born', 'crecer|to grow', 'envejecer|to age', 'vivir|to live', 'cuidar|to care for', 'visitar|to visit',
  ],
  ES016: [
    'uno|one', 'dos|two', 'tres|three', 'cuatro|four', 'cinco|five', 'seis|six', 'siete|seven', 'ocho|eight', 'nueve|nine', 'diez|ten',
    'veinte|twenty', 'treinta|thirty', 'cuarenta|forty', 'cincuenta|fifty', 'cien|one hundred', 'mil|one thousand', 'millón|million', 'medio|half', 'doble|double', 'tercero|third',
    'lunes|Monday', 'martes|Tuesday', 'miércoles|Wednesday', 'jueves|Thursday', 'viernes|Friday', 'sábado|Saturday', 'domingo|Sunday', 'hoy|today', 'mañana|tomorrow', 'ayer|yesterday',
    'ahora|now', 'siempre|always', 'nunca|never', 'pronto|soon', 'tarde|late', 'temprano|early', 'anoche|last night', 'mediodía|noon', 'medianoche|midnight', 'hora|hour',
  ],
  ES017: [
    'grande|large', 'pequeño|small', 'bueno|good', 'malo|bad', 'nuevo|new', 'viejo|old', 'largo|long', 'corto|short', 'alto|high', 'bajo|low',
    'blanco|white', 'negro|black', 'rojo|red', 'azul|blue', 'verde|green', 'amarillo|yellow', 'feliz|happy', 'triste|sad', 'fuerte|strong', 'débil|weak',
    'bonito|beautiful', 'feo|ugly', 'joven|young', 'rico|rich', 'pobre|poor', 'fácil|easy', 'difícil|difficult', 'rápido|fast', 'lento|slow', 'limpio|clean',
    'sucio|dirty', 'caliente|hot', 'frío|cold', 'seco|dry', 'húmedo|humid', 'lleno|full', 'vacío|empty', 'abierto|open', 'cerrado|closed',
  ],
  ES018: [
    'camisa|shirt', 'pantalón|pants', 'zapato|shoe', 'vestido|dress', 'chaqueta|jacket', 'abrigo|coat', 'gorra|cap', 'bufanda|scarf', 'guante|glove', 'calcetín|sock',
    'abrigo|coat', 'traje|suit', 'corbata|necktie', 'zapato|shoe', 'sandalia|sandal', 'botín|boot', 'sombrero|hat', 'gafas|glasses', 'reloj|watch', 'anillo|ring',
    'bolso|handbag', 'mochila|backpack', 'cartera|wallet', 'cinturón|belt', 'botón|button', 'cremallera|zipper', 'tela|fabric', 'talla|size', 'color|color', 'moda|fashion',
    'llevar|to wear', 'quitar|to remove', 'vestir|to dress', 'comprar|to buy', 'vender|to sell', 'elegir|to choose', 'probar|to try on', 'lavar|to wash', 'planchar|to iron', 'guardar|to store',
  ],
  ES019: [
    'cabeza|head', 'ojo|eye', 'nariz|nose', 'boca|mouth', 'diente|tooth', 'lengua|tongue', 'oreja|ear', 'pelo|hair', 'cara|face', 'cuello|neck',
    'hombro|shoulder', 'brazo|arm', 'codo|elbow', 'muñeca|wrist', 'mano|hand', 'dedo|finger', 'pierna|leg', 'rodilla|knee', 'tobillo|ankle', 'pie|foot',
    'pecho|chest', 'espalda|back', 'estómago|stomach', 'corazón|heart', 'cerebro|brain', 'hueso|bone', 'piel|skin', 'sangre|blood', 'músculo|muscle', 'nervio|nerve',
    'doler|to hurt', 'sanar|to heal', 'herir|to injure', 'enfermarse|to get sick', 'recuperar|to recover', 'respirar|to breathe', 'parpadear|to blink', 'sonreír|to smile', 'llorar|to cry', 'bostezar|to yawn',
  ],
  ES020: [
    'feliz|happy', 'triste|sad', 'enojado|angry', 'asustado|scared', 'sorprendido|surprised', 'cansado|tired', 'emocionado|excited', 'nervioso|nervous', 'tranquilo|calm', 'orgulloso|proud',
    'celoso|jealous', 'confundido|confused', 'frustrado|frustrated', 'aburrido|bored', 'esperanzado|hopeful', 'agradecido|grateful', 'vergonzoso|embarrassed', 'satisfecho|satisfied', 'inseguro|insecure', 'seguro|confident',
    'amar|to love', 'odiar|to hate', 'extrañar|to miss', 'admirar|to admire', 'respetar|to respect', 'temer|to fear', 'esperar|to hope', 'envidiar|to envy', 'lamentar|to regret', 'disfrutar|to enjoy',
  ],
  FR001: [
    'le|the', 'la|the', 'un|a', 'une|a', 'de|of', 'et|and', 'est|is', 'en|in', 'suis|I am', 'ai|I have',
    'je|I', 'tu|you', 'il|he', 'elle|she', 'nous|we', 'vous|you', 'ils|they', 'elles|they', 'on|one', 'qui|who',
    'que|that', 'quoi|what', 'où|where', 'quand|when', 'comment|how', 'pourquoi|why', 'oui|yes', 'non|no', 'mais|but', 'ou|or',
    'plus|more', 'moins|less', 'très|very', 'bien|well', 'mal|bad', 'tout|all', 'rien|nothing', 'autre|other', 'même|same', 'chaque|each',
  ],
  FR002: [
    'ai|I have', 'suis|I am', 'fait|he does', 'peut|he can', 'veut|he wants', 'doit|he must', 'sait|he knows', 'vient|he comes', 'va|he goes', 'voit|he sees',
    'prend|he takes', 'donne|he gives', 'dit|he says', 'parle|he speaks', 'met|he puts', 'trouve|he finds', 'croit|he believes', 'laisse|he leaves', 'appelle|he calls', 'tient|he holds',
    'court|he runs', 'mange|he eats', 'boit|he drinks', 'dort|he sleeps', 'lit|he reads', 'écrit|he writes', 'achète|he buys', 'vend|he sells', 'apprend|he learns', 'comprend|he understands',
    'temps|time', 'homme|man', 'femme|woman', 'enfant|child', 'jour|day', 'an|year', 'monde|world', 'pays|country', 'ville|city', 'vie|life',
  ],
  FR003: [
    'maison|house', 'rue|street', 'travail|work', 'amour|love', 'ami|friend', 'argent|money', 'voiture|car', 'téléphone|phone', 'bureau|office', 'gouvernement|government',
    'problème|problem', 'endroit|place', 'chose|thing', 'yeux|eyes', 'tête|head', 'corps|body', 'main|hand', 'nuit|night', 'matin|morning', 'soir|evening',
    'lundi|Monday', 'mardi|Tuesday', 'mercredi|Wednesday', 'jeudi|Thursday', 'vendredi|Friday', 'samedi|Saturday', 'dimanche|Sunday', 'janvier|January', 'février|February', 'mars|March',
    'grands|large', 'petit|small', 'bon|good', 'mauvais|bad', 'nouveau|new', 'vieux|old', 'jeune|young', 'long|long', 'court|short', 'riche|rich',
  ],
  FR004: [
    'ai|I have', 'suis|I am', 'fait|he does', 'va|he goes', 'vient|he comes', 'peut|he can', 'veut|he wants', 'doit|he must', 'sait|he knows', 'voit|he sees',
    'dit|he says', 'parle|he speaks', 'prend|he takes', 'met|he puts', 'donne|he gives', 'trouve|he finds', 'croit|he believes', 'appelle|he calls', 'tient|he holds', 'meurt|he dies',
    'naît|he is born', 'vit|he lives', 'grandit|he grows', 'travaille|he works', 'joue|he plays', 'répond|he answers', 'pose|he places', 'revient|he comes back', 'passe|he passes', 'manque|he misses',
    'porte|he carries', 'compte|he counts', 'cherche|he looks for', 'regarde|he looks', 'entend|he hears', 'écoute|he listens', 'sent|he feels', 'touche|he touches', 'aime|he loves', 'déteste|he hates',
  ],
  FR005: [
    'eau|water', 'vin|wine', 'pain|bread', 'viande|meat', 'poulet|chicken', 'poisson|fish', 'riz|rice', 'légume|vegetable', 'fruit|fruit', 'salade|salad',
    'œuf|egg', 'fromage|cheese', 'lait|milk', 'beurre|butter', 'huile|oil', 'sel|salt', 'café|coffee', 'thé|tea', 'soda|soda', 'bière|beer',
    'restaurant|restaurant', 'table|table', 'cuillère|spoon', 'fourchette|fork', 'couteau|knife', 'assiette|plate', 'verre|glass', 'serviette|napkin', 'cuisine|kitchen', 'serveur|waiter',
    'déjeuner|lunch', 'dîner|dinner', 'cuisiner|to cook', 'manger|to eat', 'boire|to drink', 'commander|to order', 'payer|to pay', 'aimer|to like', 'goûter|to taste', 'préparer|to prepare',
  ],
  FR006: [
    'aéroport|airport', 'hôtel|hotel', 'passeport|passport', 'valise|suitcase', 'vol|flight', 'billet|ticket', 'train|train', 'autobus|bus', 'taxi|taxi', 'voiture|car',
    'rue|street', 'place|square', 'carte|map', 'adresse|address', 'gauche|left', 'droite|right', 'tout droit|straight', 'près|near', 'loin|far', 'ici|here',
    'là|there', 'où|where', 'quand|when', 'comment|how', 'pourquoi|why', 'combien|how much', 'maintenant|now', 'après|after', 'avant|before', 'demain|tomorrow',
    'voyager|to travel', 'arriver|to arrive', 'partir|to leave', 'rester|to stay', 'visiter|to visit', 'explorer|to explore', 'se perdre|to get lost', 'trouver|to find', 'réserver|to book', 'faire la valise|to pack',
  ],
  FR007: [
    'mère|mother', 'père|father', 'frère|brother', 'sœur|sister', 'fils|son', 'fille|daughter', 'grand-père|grandfather', 'grand-mère|grandmother', 'famille|family', 'parents|parents',
    'mari|husband', 'femme|wife', 'copain|boyfriend', 'copine|girlfriend', 'cousin|cousin', 'oncle|uncle', 'tante|aunt', 'neveu|nephew', 'nièce|niece', 'enfant|child',
    'bébé|baby', 'enfant|child', 'jeune|young person', 'adulte|adult', 'vieux|elderly person', 'voisin|neighbor', 'ami|friend', 'copain|buddy', 'couple|couple', 'mariage|marriage',
    'aimer|to love', 'se marier|to marry', 'divorcer|to divorce', 'naître|to be born', 'grandir|to grow', 'vieillir|to age', 'vivre|to live', 'soigner|to care for', 'rendre visite|to visit', 'habiter|to live in',
  ],
  FR008: [
    'un|one', 'deux|two', 'trois|three', 'quatre|four', 'cinq|five', 'six|six', 'sept|seven', 'huit|eight', 'neuf|nine', 'dix|ten',
    'vingt|twenty', 'trente|thirty', 'quarante|forty', 'cinquante|fifty', 'cent|one hundred', 'mille|one thousand', 'million|million', 'demi|half', 'double|double', 'tiers|third',
    'lundi|Monday', 'mardi|Tuesday', 'mercredi|Wednesday', 'jeudi|Thursday', 'vendredi|Friday', 'samedi|Saturday', 'dimanche|Sunday', 'aujourd\'hui|today', 'demain|tomorrow', 'hier|yesterday',
    'maintenant|now', 'toujours|always', 'jamais|never', 'bientôt|soon', 'tard|late', 'tôt|early', 'hier soir|last night', 'midi|noon', 'minuit|midnight', 'heure|hour',
  ],
  IT001: [
    'il|the', 'la|the', 'un|a', 'di|of', 'e|and', 'è|is', 'in|in', 'sono|I am', 'ho|I have', 'io|I',
    'tu|you', 'lui|he', 'lei|she', 'noi|we', 'voi|you', 'loro|they', 'chi|who', 'che|that', 'cosa|what', 'dove|where',
    'quando|when', 'come|how', 'perché|why', 'sì|yes', 'no|no', 'ma|but', 'o|or', 'più|more', 'molto|very', 'bene|well',
    'male|bad', 'tutto|all', 'buono|good', 'cattivo|bad', 'grande|large', 'piccolo|small', 'nuovo|new', 'vecchio|old', 'bello|beautiful', 'brutto|ugly',
  ],
  DE001: [
    'der|the', 'die|the', 'das|the', 'ein|a', 'eine|a', 'und|and', 'ist|is', 'ich bin|I am', 'du|you', 'er|he',
    'sie|she', 'es|it', 'wir|we', 'ihr|you', 'sie|they', 'hat|he has', 'bin|I am', 'wird|he becomes', 'kann|he can', 'muss|he must',
    'sagt|he says', 'gibt|he gives', 'nimmt|he takes', 'kommt|he comes', 'geht|he goes', 'weiß|he knows', 'findet|he finds', 'glaubt|he believes', 'sieht|he sees', 'hört|he hears',
    'schreibt|he writes', 'liest|he reads', 'kauft|he buys', 'verkauft|he sells', 'spricht|he speaks', 'arbeitet|he works', 'lebt|he lives', 'stirbt|he dies', 'braucht|he needs', 'heißt|he is called',
  ],
}

async function main() {
  console.log('🌱 Seeding vocabulary...')

  // Create system Project Sets
  const PROJECT_SETS: Array<{ language: string; name: string }> = [
    { language: 'ES', name: 'Spanish' },
    { language: 'FR', name: 'French' },
    { language: 'IT', name: 'Italian' },
    { language: 'DE', name: 'German' },
  ]

  const projectSetMap = new Map<string, number>()
  for (const ps of PROJECT_SETS) {
    const existing = await prisma.tblProjectSets.findFirst({ where: { language: ps.language, createdBy: null } })
    if (existing) {
      projectSetMap.set(ps.language, existing.id)
      await prisma.tblProjectSets.update({ where: { id: existing.id }, data: { name: ps.name } })
    } else {
      const created = await prisma.tblProjectSets.create({ data: { name: ps.name, language: ps.language } })
      projectSetMap.set(ps.language, created.id)
    }
  }

  for (const set of sets) {
    const lang = set.topiccode.slice(0, 2)
    const sortOrder = parseInt(set.topiccode.slice(2), 10) || 0
    const existing = await prisma.tblTopics.findUnique({ where: { topiccode: set.topiccode } })
    if (!existing) {
      await prisma.tblTopics.create({
        data: { ...set, projectSetId: projectSetMap.get(lang) ?? null, sortOrder, createdBy: null },
      })
    } else {
      await prisma.tblTopics.update({
        where: { topiccode: set.topiccode },
        data: { ...set, projectSetId: projectSetMap.get(lang) ?? null, sortOrder, createdBy: null },
      })
    }

    if (vocabulary[set.topiccode]) {
      await prisma.tblContent.deleteMany({ where: { topiccode: set.topiccode } })
      const items = vocabulary[set.topiccode].map((line) => {
        const [question, answer] = line.split('|')
        return {
          topiccode: set.topiccode,
          questiontype: 'cram',
          question: question.trim(),
          answer: answer.trim(),
        }
      })
      await prisma.tblContent.createMany({ data: items })
    }
  }

  console.log(`✅ Seeded ${sets.length} topics across ${PROJECT_SETS.length} project sets`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
