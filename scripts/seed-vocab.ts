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
    'el|the', 'de|of', 'que|that', 'y|and', 'a|to', 'en|in', 'ser|to be', 'se|oneself', 'un|a', 'una|a',
    'por|for', 'con|with', 'no|no', 'sí|yes', 'como|like', 'pero|but', 'su|his', 'su|her', 'él|he', 'ella|she',
    'lo|it', 'más|more', 'todo|all', 'ya|already', 'muy|very', 'tener|to have', 'hacer|to do', 'poder|can', 'decir|to say', 'ir|to go',
    'ver|to see', 'dar|to give', 'saber|to know', 'querer|to want', 'llamar|to call', 'venir|to come', 'traer|to bring', 'oir|to hear', 'poner|to put', 'salir|to leave',
  ],
  ES002: [
    'estar|to be', 'hay|there is', 'este|this', 'ese|that', 'darse|to give oneself', 'creer|to believe', 'ver|to see', 'parecer|to seem', 'encontrar|to find', 'dejar|to leave',
    'conocer|to know', 'seguir|to follow', 'existir|to exist', 'esperar|to wait', 'tener que|must', 'pasar|to pass', 'quedar|to stay', 'llevar|to carry', 'volver|to return', 'encontrar|to find',
    'buscar|to search', 'llegar|to arrive', 'salir|to exit', 'entrar|to enter', 'venir|to come', 'caer|to fall', 'sentar|to sit', 'dormir|to sleep', 'escribir|to write', 'leer|to read',
    'hablar|to speak', 'escuchar|to listen', 'comer|to eat', 'beber|to drink', 'vivir|to live', 'morir|to die', 'nacer|to be born', 'crecer|to grow', 'trabajar|to work', 'jugar|to play',
  ],
  ES003: [
    'tiempo|time', 'vida|life', 'hombre|man', 'mujer|woman', 'niño|child', 'mundo|world', 'lugar|place', 'parte|part', 'día|day', 'mano|hand',
    'gente|people', 'casa|house', 'ciudad|city', 'noche|night', 'año|year', 'forma|form', 'medio|medium', 'sr|Señor|Mr', 'manera|way', 'ejemplo|example',
    'problema|problem', 'parte|part', 'punto|point', 'palabra|word', 'cosa|thing', 'momento|moment', 'lado|side', 'calle|street', 'campo|countryside', 'trabajo|work',
    'familia|family', 'amigo|friend', 'agua|water', 'aire|air', 'fuego|fire', 'tierra|earth', 'mar|sea', 'cielo|sky', 'sol|sun', 'luna|moon',
  ],
  ES004: [
    'primero|first', 'después|after', 'ahora|now', 'antes|before', 'siempre|always', 'nunca|never', 'también|also', 'solo|only', 'bien|well', 'mal|bad',
    'grande|large', 'pequeño|small', 'bueno|good', 'malo|bad', 'nuevo|new', 'viejo|old', 'largo|long', 'corto|short', 'fácil|easy', 'dificil|difficult',
    'blanco|white', 'negro|black', 'rojo|red', 'azul|blue', 'verde|green', 'amarillo|yellow', 'feliz|happy', 'triste|sad', 'lleno|full', 'vacío|empty',
    'abierto|open', 'cerrado|closed', 'alto|high', 'bajo|low', 'fuerte|strong', 'débil|weak', 'listo|ready', 'contento|happy', 'seguro|sure', 'posible|possible',
  ],
  ES005: [
    'dormir|to sleep', 'despertar|to wake up', 'desayunar|to have breakfast', 'almorzar|to have lunch', 'cenar|to have dinner', 'bañarse|to bathe', 'vestirse|to get dressed', 'desnudarse|to get undressed', 'sentarse|to sit down', 'levantarse|to stand up',
    'acostarse|to lie down', 'quedarse|to stay', 'marcharse|to leave', 'llegar|to arrive', 'salir|to go out', 'entrar|to come in', 'subir|to go up', 'bajar|to go down', 'andar|to walk', 'correr|to run',
    'nadar|to swim', 'volar|to fly', 'saltar|to jump', 'caer|to fall', 'subir|to climb', 'bajar|to descend', 'abrazar|to embrace', 'besar|to kiss', 'ayudar|to help', 'mirar|to look',
    'ver|to see', 'observar|to observe', 'esperar|to wait', 'buscar|to look for', 'encontrar|to find', 'perder|to lose', 'ganar|to win', 'comprar|to buy', 'vender|to sell', 'pagar|to pay',
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
    'comer|to eat', 'beber|to drink', 'dormir|to sleep', 'correr|to run', 'hablar|to speak', 'escuchar|to listen', 'leer|to read', 'escribir|to write', 'caminar|to walk', 'mirar|to look',
    'saber|to know', 'conocer|to know', 'entender|to understand', 'aprender|to learn', 'enseñar|to teach', 'recordar|to remember', 'olvidar|to forget', 'pensar|to think', 'creer|to believe', 'imaginar|to imagine',
    'comer|to eat', 'cocinar|to cook', 'servir|to serve', 'pedir|to ask for', 'dar|to give', 'tomar|to take', 'traer|to bring', 'llevar|to carry', 'abrir|to open', 'cerrar|to close',
    'empezar|to start', 'terminar|to finish', 'continuar|to continue', 'parar|to stop', 'quedar|to remain', 'aparecer|to appear', 'desaparecer|to disappear', 'crecer|to grow', 'menguar|to decrease', 'aumentar|to increase',
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
  FR001: [
    'le|the', 'la|the', 'un|a', 'une|a', 'de|of', 'et|and', 'est|is', 'en|in', 'être|to be', 'avoir|to have',
    'je|I', 'tu|you', 'il|he', 'elle|she', 'nous|we', 'vous|you', 'ils|they', 'elles|they', 'on|one', 'qui|who',
    'que|that', 'quoi|what', 'où|where', 'quand|when', 'comment|how', 'pourquoi|why', 'oui|yes', 'non|no', 'mais|but', 'ou|or',
    'plus|more', 'moins|less', 'très|very', 'bien|well', 'mal|bad', 'tout|all', 'rien|nothing', 'autre|other', 'même|same', 'chaque|each',
  ],
  FR002: [
    'avoir|to have', 'être|to be', 'faire|to do', 'pouvoir|can', 'vouloir|to want', 'devoir|must', 'savoir|to know', 'venir|to come', 'aller|to go', 'voir|to see',
    'prendre|to take', 'donner|to give', 'dire|to say', 'parler|to speak', 'mettre|to put', 'trouver|to find', 'croire|to believe', 'laisser|to leave', 'appeler|to call', 'tenir|to hold',
    'courir|to run', 'manger|to eat', 'boire|to drink', 'dormir|to sleep', 'lire|to read', 'écrire|to write', 'acheter|to buy', 'vendre|to sell', 'apprendre|to learn', 'comprendre|to understand',
    'temps|time', 'homme|man', 'femme|woman', 'enfant|child', 'jour|day', 'an|year', 'monde|world', 'pays|country', 'ville|city', 'vie|life',
  ],
  FR003: [
    'maison|house', 'rue|street', 'travail|work', 'amour|love', 'ami|friend', 'argent|money', 'voiture|car', 'téléphone|phone', 'bureau|office', 'gouvernement|government',
    'problème|problem', 'endroit|place', 'chose|thing', 'yeux|eyes', 'tête|head', 'corps|body', 'main|hand', 'nuit|night', 'matin|morning', 'soir|evening',
    'lundi|Monday', 'mardi|Tuesday', 'mercredi|Wednesday', 'jeudi|Thursday', 'vendredi|Friday', 'samedi|Saturday', 'dimanche|Sunday', 'janvier|January', 'février|February', 'mars|March',
    'grands|large', 'petit|small', 'bon|good', 'mauvais|bad', 'nouveau|new', 'vieux|old', 'jeune|young', 'long|long', 'court|short', 'riche|rich',
  ],
  FR004: [
    'avoir|to have', 'être|to be', 'faire|to do', 'aller|to go', 'venir|to come', 'pouvoir|can', 'vouloir|to want', 'devoir|must', 'savoir|to know', 'voir|to see',
    'dire|to say', 'parler|to speak', 'prendre|to take', 'mettre|to put', 'donner|to give', 'trouver|to find', 'croire|to believe', 'appeler|to call', 'tenir|to hold', 'mourir|to die',
    'naître|to be born', 'vivre|to live', 'grandir|to grow', 'travailler|to work', 'jouer|to play', 'répondre|to answer', 'poser|to place', 'revenir|to come back', 'passer|to pass', 'manquer|to miss',
    'porter|to carry', 'compter|to count', 'chercher|to look for', 'regarder|to look', 'entendre|to hear', 'écouter|to listen', 'sentir|to feel', 'toucher|to touch', 'aimer|to love', 'détester|to hate',
  ],
  IT001: [
    'il|the', 'la|the', 'un|a', 'di|of', 'e|and', 'è|is', 'in|in', 'essere|to be', 'avere|to have', 'io|I',
    'tu|you', 'lui|he', 'lei|she', 'noi|we', 'voi|you', 'loro|they', 'chi|who', 'che|that', 'cosa|what', 'dove|where',
    'quando|when', 'come|how', 'perché|why', 'sì|yes', 'no|no', 'ma|but', 'o|or', 'più|more', 'molto|very', 'bene|well',
    'male|bad', 'tutto|all', 'buono|good', 'cattivo|bad', 'grande|large', 'piccolo|small', 'nuovo|new', 'vecchio|old', 'bello|beautiful', 'brutto|ugly',
  ],
  DE001: [
    'der|the', 'die|the', 'das|the', 'ein|a', 'eine|a', 'und|and', 'ist|is', 'ich|I', 'du|you', 'er|he',
    'sie|she', 'es|it', 'wir|we', 'ihr|you', 'sie|they', 'haben|to have', 'sein|to be', 'werden|to become', 'können|can', 'müssen|must',
    'sagen|to say', 'geben|to give', 'nehmen|to take', 'kommen|to come', 'gehen|to go', 'wissen|to know', 'finden|to find', 'glauben|to believe', 'sehen|to see', 'hören|to hear',
    'schreiben|to write', 'lesen|to read', 'kaufen|to buy', 'verkaufen|to sell', 'sprechen|to speak', 'arbeiten|to work', 'leben|to live', 'sterben|to die', 'brauchen|to need', 'heißen|to be called',
  ],
}

async function main() {
  console.log('🌱 Seeding vocabulary...')

  for (const set of sets) {
    const existing = await prisma.tblTopics.findUnique({ where: { topiccode: set.topiccode } })
    if (!existing) {
      await prisma.tblTopics.create({ data: set })
    } else {
      await prisma.tblTopics.update({
        where: { topiccode: set.topiccode },
        data: set,
      })
    }

    if (vocabulary[set.topiccode]) {
      await prisma.tblContent.deleteMany({ where: { topiccode: set.topiccode } })
      const items = vocabulary[set.topiccode].map((line, i) => {
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

  console.log(`✅ Seeded ${sets.length} topics`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
