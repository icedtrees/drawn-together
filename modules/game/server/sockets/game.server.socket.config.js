'use strict';

var ChatSettings = require('../../shared/config/game.shared.chat.config.js');
var GameLogic = require('../../shared/helpers/game.shared.gamelogic.js');
var GameSettings = require('../../shared/config/game.shared.game.config.js');
var Utils = require('../../shared/helpers/game.shared.utils.js');
var ServerUtils = require('../helpers/game.server.utils.js');

// cln_fuzzy library (for calculating distance between words)
var clj_fuzzy = require('clj-fuzzy');
var jaro_winkler = clj_fuzzy.metrics.jaro_winkler;
var porter = clj_fuzzy.stemmers.porter;
var levenshtein = clj_fuzzy.metrics.levenshtein;

// A timeout created to end the round seconds when someone guesses the prompt
var roundTimeout;
// Game object encapsulating game logic
var Game =  new GameLogic.Game({
  numRounds: 5,
  numDrawers: 1,
  roundTime: 90,
  timeToEnd: 20
}); // parameters: numRounds, numDrawers, timeToEnd

// Dictionary counting number of connects made by each user
var userConnects = {};

/* Array of draw actions
 * drawHistory = [
 *   {
 *     type: 'line'
 *     x1: last x pos
 *     y1: last y pos
 *     x2: cur x pos
 *     y2: cur y pos
 *     strokeStyle: colour code
 *   },
 *   {
 *     type: 'rect'
 *     x: last x pos
 *     y: last y pos
 *     width: cur x pos
 *     height: cur y pos
 *     fill: colour code
 *     strokeStyle: colour code
 *   },
 *   {
 *     type: 'clear'
 *   }
 * ]
 */
var drawHistory = [];

// Every chat message sent
var gameMessages = [];

// First one is the current topic
var topicList = ['abba', 'acdc', 'ace', 'acorn', 'add', 'adele', 'africa', 'afro', 'airbag', 'airplane', 'airport', 'aladdin', 'alarm', 'alf', 'alien', 'align', 'alone', 'alphabet', 'amazon', 'america', 'anchor', 'android', 'angel', 'angelina', 'anger', 'animals', 'ankle', 'ant', 'antenna', 'antlers', 'ants', 'ape', 'apple', 'apron', 'aquaman', 'aquarium', 'arcade', 'archery', 'arm', 'armor', 'armpit', 'army', 'arnold', 'arrow', 'art', 'artist', 'ash', 'asia', 'assassin', 'asteroid', 'atlantis', 'attack', 'attic', 'audience', 'autobots', 'avatar', 'avengers', 'avocado', 'avril', 'awake', 'award', 'axe', 'baby', 'back', 'backache', 'backbone', 'backflip', 'backpack', 'bacon', 'badge', 'bag', 'bagpipes', 'bahamas', 'bait', 'bake', 'baking', 'balance', 'balcony', 'bald', 'ball', 'balloon', 'bamboo', 'banana', 'band', 'bandaid', 'bandana', 'bank', 'barber', 'barbie', 'barcode', 'bark', 'barn', 'barrel', 'bart', 'base', 'baseball', 'basket', 'bat', 'bathtub', 'batman', 'battery', 'bay', 'beach', 'beak', 'beans', 'bear', 'beard', 'beatles', 'beckham', 'bed', 'bee', 'beef', 'beehive', 'beer', 'bell', 'belt', 'bench', 'beyonce', 'bib', 'bicycle', 'bieber', 'bigfoot', 'bike', 'bikini', 'bill', 'bingo', 'bird', 'birdcage', 'birthday', 'black', 'blade', 'blanket', 'blender', 'blimp', 'blind', 'blonde', 'blondie', 'blood', 'blow', 'blue', 'blush', 'boat', 'bobdylan', 'bomb', 'bone', 'bones', 'bonfire', 'bonjovi', 'booger', 'book', 'bookcase', 'bookmark', 'boombox', 'boot', 'boots', 'border', 'bottle', 'bottom', 'bounce', 'bow', 'bowl', 'bowling', 'bowser', 'bowtie', 'box', 'boxing', 'bracelet', 'braces', 'bradpitt', 'brain', 'brakes', 'branches', 'brazil', 'bread', 'breath', 'brick', 'bride', 'bridge', 'briefs', 'britney', 'broccoli', 'broncos', 'broom', 'brownie', 'brush', 'bubble', 'bubbles', 'bucket', 'buckle', 'buffalo', 'bug', 'building', 'bulb', 'bull', 'bullet', 'bullseye', 'bum', 'bumper', 'bunkbed', 'bunny', 'burger', 'burn', 'burp', 'burrito', 'bus', 'butcher', 'butt', 'butter', 'button', 'cabin', 'cabinet', 'cable', 'cactus', 'caddy', 'cage', 'cake', 'calendar', 'calf', 'camel', 'camera', 'campfire', 'camping', 'can', 'canada', 'candle', 'candy', 'cane', 'cannon', 'canoe', 'cap', 'cape', 'captain', 'car', 'card', 'cards', 'carnival', 'carpet', 'carpool', 'carrot', 'carseat', 'carwash', 'cashier', 'casino', 'castle', 'cat', 'catapult', 'catfish', 'cattail', 'catwoman', 'cave', 'caveman', 'cd', 'ceiling', 'celery', 'cemetery', 'centaur', 'center', 'cereal', 'chain', 'chainsaw', 'chair', 'chalk', 'champ', 'chart', 'check', 'checkers', 'cheek', 'cheese', 'chef', 'cherry', 'chess', 'chest', 'chew', 'chicken', 'children', 'chimney', 'chin', 'china', 'chips', 'church', 'cigar', 'circle', 'circus', 'city', 'clam', 'clap', 'class', 'claw', 'clay', 'cliff', 'climb', 'clock', 'closet', 'cloud', 'clown', 'club', 'coach', 'coal', 'coat', 'coconut', 'cocoon', 'coffee', 'coffin', 'coin', 'cold', 'collar', 'college', 'comb', 'comet', 'comic', 'compass', 'computer', 'conan', 'concert', 'cone', 'cook', 'cookie', 'cookies', 'cork', 'corn', 'corndog', 'corner', 'couch', 'court', 'cover', 'cow', 'cowboy', 'cowgirl', 'crab', 'crack', 'crane', 'crash', 'crawl', 'crayon', 'crescent', 'crib', 'crossbow', 'crowbar', 'crown', 'crush', 'crust', 'crutches', 'cry', 'crystal', 'cuba', 'cuddle', 'cueball', 'cup', 'cupcake', 'cupid', 'curl', 'curtain', 'customer', 'cut', 'cute', 'cyclops', 'daftpunk', 'dallas', 'dance', 'dandruff', 'danger', 'dart', 'dead', 'deaf', 'death', 'deck', 'deep', 'deer', 'defender', 'delta', 'dentist', 'dentures', 'desert', 'desk', 'devil', 'devo', 'diamond', 'diaper', 'dice', 'die', 'dig', 'dimples', 'dinner', 'dinosaur', 'diploma', 'director', 'dirt', 'disco', 'disease', 'dishes', 'diva', 'dive', 'divorce', 'dizzy', 'dj', 'dna', 'dock', 'doctor', 'dog', 'dogfish', 'dogsled', 'doll', 'dollar', 'dolphin', 'domino', 'donkey', 'donut', 'door', 'doorbell', 'doorknob', 'doormat', 'doors', 'doorstep', 'dots', 'dove', 'down', 'dracula', 'dragon', 'drain', 'drake', 'drapes', 'draw', 'drawer', 'dream', 'dreidel', 'dress', 'dresser', 'dribble', 'drill', 'drink', 'drip', 'drive', 'drum', 'drummer', 'drums', 'drumset', 'drunk', 'dubstep', 'duck', 'duel', 'dumbbell', 'dumbo', 'dunk', 'duster', 'dustpan', 'dynamite', 'eagle', 'ear', 'earmuffs', 'earring', 'earth', 'earwax', 'east', 'easter', 'eat', 'echo', 'eclipse', 'edge', 'eel', 'egg', 'eggplant', 'eggroll', 'elbow', 'election', 'elephant', 'elevator', 'ellen', 'elmo', 'elton', 'elvis', 'emerald', 'eminem', 'empty', 'end', 'engine', 'england', 'envelope', 'eraser', 'escape', 'eskimo', 'espresso', 'europe', 'evil', 'ewok', 'explode', 'eye', 'eyeball', 'eyebrow', 'eyelash', 'eyelid', 'eyepatch', 'eyes', 'face', 'facebook', 'factory', 'fairy', 'fall', 'family', 'fan', 'fangs', 'fanmail', 'fans', 'farm', 'farmer', 'fart', 'fastfood', 'father', 'faucet', 'fear', 'feather', 'feet', 'female', 'fence', 'fencing', 'fern', 'ferry', 'festivus', 'fever', 'field', 'fight', 'fin', 'finger', 'finland', 'fire', 'fireball', 'firefly', 'firefox', 'firewall', 'firewood', 'firework', 'first', 'firstaid', 'fish', 'fishing', 'fist', 'flag', 'flame', 'flamingo', 'flash', 'flat', 'flea', 'flight', 'flood', 'floor', 'florida', 'floss', 'flour', 'flower', 'flu', 'flush', 'fly', 'fog', 'folder', 'fool', 'foot', 'football', 'force', 'forehead', 'forest', 'fork', 'forklift', 'fort', 'forward', 'foul', 'fountain', 'fox', 'fraction', 'frame', 'france', 'freezing', 'fridge', 'friend', 'frisbee', 'frodo', 'frog', 'frosting', 'frown', 'fruit', 'funeral', 'funnel', 'fur', 'furby', 'galaxy', 'gameboy', 'gandalf', 'gangster', 'garage', 'garden', 'gardener', 'garlic', 'gas', 'gasmask', 'gate', 'gears', 'gem', 'germ', 'germany', 'geronimo', 'ghost', 'giftwrap', 'giraffe', 'girl', 'glass', 'glasses', 'glee', 'globe', 'glove', 'glue', 'goal', 'goalie', 'goalpost', 'goat', 'goggles', 'gold', 'goldfish', 'golem', 'golf', 'golfcart', 'golfclub', 'goofy', 'google', 'goose', 'gorilla', 'grade', 'graduate', 'grammy', 'grandma', 'grandpa', 'grapes', 'graph', 'grass', 'grave', 'gravy', 'green', 'grenade', 'grid', 'griffin', 'grill', 'grin', 'groom', 'gross', 'guitar', 'gum', 'gun', 'gymnast', 'gza', 'hail', 'hair', 'haircut', 'hairdye', 'hairgel', 'hairtie', 'hairy', 'halo', 'ham', 'hambone', 'hammer', 'hammock', 'hamster', 'hamwich', 'hand', 'handbag', 'handball', 'handcuff', 'handgun', 'handle', 'hanger', 'hangman', 'hanukkah', 'happy', 'harbor', 'hare', 'harp', 'hat', 'hawaii', 'hawkeye', 'head', 'headache', 'headband', 'headset', 'hear', 'heart', 'heat', 'heaven', 'heel', 'heidi', 'helmet', 'hercules', 'highfive', 'hiking', 'hill', 'hiphop', 'hippo', 'hobbit', 'hobo', 'hockey', 'holiday', 'holland', 'home', 'homeless', 'homer', 'homerun', 'homework', 'honey', 'hongkong', 'hood', 'hook', 'hoop', 'hop', 'horn', 'horse', 'horton', 'hose', 'hospital', 'hot', 'hotdog', 'hotel', 'hotsauce', 'hottub', 'house', 'hug', 'hulahoop', 'hulk', 'hummer', 'hungry', 'hunt', 'hurt', 'husband', 'hustle', 'hut', 'ice', 'iceberg', 'icebox', 'icecube', 'icepop', 'iceskate', 'icicle', 'icing', 'idea', 'igloo', 'ikea', 'ink', 'inn', 'insect', 'insomnia', 'ipad', 'iphone', 'ireland', 'iron', 'ironchef', 'ironman', 'island', 'jacket', 'jaguar', 'jail', 'jam', 'jamaica', 'japan', 'jar', 'javelin', 'jaw', 'jaws', 'jayleno', 'jayz', 'jazz', 'jeans', 'jeep', 'jello', 'jelly', 'jenga', 'jersey', 'jet', 'jeter', 'jetski', 'jewelry', 'jigsaw', 'jlo', 'joker', 'jonas', 'jordan', 'journey', 'joystick', 'judge', 'jug', 'juggle', 'juice', 'jukebox', 'jump', 'jumpball', 'jumprope', 'jungle', 'junkfood', 'jupiter', 'justice', 'kangaroo', 'kansas', 'kanye', 'karate', 'katemoss', 'katniss', 'ketchup', 'key', 'keyboard', 'keychain', 'kfc', 'kick', 'kidney', 'killer', 'kilt', 'king', 'kirby', 'kiss', 'kitchen', 'kite', 'kitten', 'knee', 'kneecap', 'kneepads', 'knife', 'knitting', 'knives', 'knock', 'knot', 'knuckle', 'koala', 'kobe', 'koopa', 'korea', 'kraken', 'kwanzaa', 'lab', 'ladder', 'lady', 'ladybug', 'ladygaga', 'lake', 'lamb', 'lamp', 'lamprey', 'lap', 'laptop', 'laser', 'lasso', 'latrine', 'laugh', 'laughing', 'lava', 'lavalamp', 'lawyer', 'lead', 'leaf', 'leak', 'leash', 'leather', 'lebron', 'left', 'leg', 'lemon', 'lemonade', 'lemons', 'lens', 'leopard', 'letter', 'library', 'lick', 'lid', 'lift', 'light', 'lighter', 'lilwayne', 'limbo', 'lime', 'limo', 'lin', 'line', 'link', 'lion', 'lionking', 'lip', 'lips', 'lipstick', 'liquid', 'lisa', 'list', 'lizard', 'lobster', 'lock', 'locket', 'log', 'london', 'long', 'longjump', 'loop', 'lost', 'lotion', 'love', 'lovebird', 'low', 'ludacris', 'luge', 'luggage', 'luigi', 'luke', 'lumber', 'lunch', 'lung', 'lyrics', 'macarena', 'macaroni', 'macbook', 'magazine', 'magic', 'magician', 'magnet', 'mail', 'mailbox', 'mailman', 'makeup', 'mall', 'mammoth', 'mango', 'manicure', 'mansion', 'map', 'marble', 'marge', 'mariah', 'marine', 'mario', 'markers', 'marriage', 'marry', 'mars', 'martini', 'mask', 'massage', 'mat', 'mattress', 'maze', 'mchammer', 'meal', 'meat', 'meatball', 'meathead', 'medal', 'medicine', 'medusa', 'melt', 'melting', 'menorah', 'meow', 'mercury', 'mermaid', 'messy', 'meteor', 'meter', 'metroid', 'mexico', 'miami', 'middle', 'miley', 'milk', 'milkman', 'minivan', 'minotaur', 'mint', 'mirror', 'missile', 'mittens', 'model', 'mohawk', 'money', 'monkey', 'monopoly', 'monster', 'moo', 'moon', 'moose', 'mop', 'morning', 'mosquito', 'mother', 'motor', 'mountain', 'mouse', 'mouth', 'mud', 'muffin', 'mug', 'multiply', 'mummy', 'muscle', 'muse', 'museum', 'mushroom', 'music', 'musicbox', 'mustache', 'mustard', 'nachos', 'nail', 'nailfile', 'name', 'napkin', 'nascar', 'navy', 'neck', 'necklace', 'needle', 'neptune', 'nerd', 'nest', 'net', 'news', 'newyork', 'nickel', 'nicki', 'night', 'nike', 'ninja', 'no', 'noodle', 'noodles', 'noose', 'north', 'norway', 'nose', 'nosehair', 'nosering', 'nostril', 'notebook', 'notepad', 'novel', 'number', 'nun', 'nurse', 'nut', 'oaktree', 'oar', 'oars', 'oatmeal', 'obama', 'ocean', 'octagon', 'octopus', 'odor', 'off', 'oil', 'oilfield', 'olympics', 'omelet', 'onion', 'online', 'open', 'opera', 'oprah', 'orange', 'orbit', 'organ', 'origami', 'ornament', 'ostrich', 'outkast', 'outlet', 'oval', 'oven', 'overalls', 'overflow', 'overtime', 'owl', 'pacifier', 'pacman', 'paddle', 'padlock', 'paella', 'page', 'paint', 'paintcan', 'painter', 'painting', 'pajamas', 'palace', 'palm', 'palmtree', 'pancake', 'pancakes', 'panda', 'pants', 'paper', 'paperbag', 'papercut', 'parade', 'parents', 'paris', 'park', 'parrot', 'partyhat', 'pass', 'password', 'patch', 'path', 'patriots', 'paulyd', 'paw', 'pdiddy', 'peace', 'peach', 'peaches', 'peacock', 'peanut', 'pear', 'pearl', 'peas', 'pedal', 'pee', 'pegasus', 'pen', 'pencil', 'penguin', 'penguins', 'penny', 'pepper', 'pepsi', 'perez', 'perfume', 'person', 'pet', 'petal', 'petfood', 'petshop', 'phoenix', 'phone', 'piano', 'pickle', 'picnic', 'picture', 'pie', 'piechart', 'pig', 'pigeon', 'pikachu', 'pill', 'pillow', 'pilot', 'pimple', 'pin', 'pinecone', 'pinetree', 'pingpong', 'pink', 'pinky', 'pinwheel', 'pipe', 'pirate', 'pistol', 'pitbull', 'pitcher', 'pitfall', 'pizza', 'plane', 'planet', 'plant', 'plate', 'plug', 'plum', 'plumber', 'plunger', 'pluto', 'pocket', 'poison', 'poke', 'poker', 'polaroid', 'police', 'polkadot', 'polo', 'pong', 'pony', 'ponytail', 'poodle', 'pool', 'poop', 'poor', 'popcorn', 'popsicle', 'pork', 'porsche', 'portrait', 'poseidon', 'positive', 'postcard', 'poster', 'pot', 'potato', 'pouch', 'pounce', 'powder', 'power', 'pray', 'pregnant', 'presents', 'pretty', 'pretzel', 'pricetag', 'prince', 'princess', 'print', 'prism', 'prison', 'prius', 'puddles', 'puke', 'pull', 'pumpkin', 'punch', 'puppet', 'puppy', 'purse', 'push', 'pushup', 'puzzle', 'pyramid', 'quack', 'quarter', 'queen', 'quiet', 'quilt', 'rabbit', 'raccoon', 'race', 'racecar', 'radar', 'radio', 'raekwon', 'raft', 'rag', 'raiders', 'railroad', 'rain', 'rainbow', 'raincoat', 'raindrop', 'raisin', 'rake', 'ramp', 'rap', 'rapture', 'rat', 'rattle', 'razor', 'rebound', 'record', 'recycle', 'red', 'reddit', 'redhead', 'referee', 'reindeer', 'reptile', 'rest', 'rhino', 'ribbon', 'ribs', 'rice', 'riddler', 'ride', 'rifle', 'rihanna', 'rim', 'ring', 'ringtone', 'ripple', 'risk', 'river', 'road', 'roadkill', 'roast', 'robber', 'robe', 'robot', 'rock', 'rocket', 'rockstar', 'roll', 'roof', 'rooster', 'root', 'rope', 'rose', 'round', 'row', 'rowboat', 'ruby', 'rug', 'rugrats', 'ruler', 'runway', 'russia', 'rza', 'sack', 'sad', 'saddle', 'safari', 'sail', 'sailboat', 'sailor', 'salad', 'salami', 'salsa', 'salt', 'samba', 'sand', 'sandals', 'sandbox', 'sandwich', 'santa', 'sapphire', 'saturn', 'sausage', 'saw', 'scale', 'scar', 'scarf', 'school', 'science', 'scissors', 'scooter', 'scorpion', 'scotland', 'scrabble', 'scratch', 'scream', 'screen', 'screw', 'sea', 'seafood', 'seagull', 'seahorse', 'seal', 'seashell', 'seasick', 'seat', 'seatbelt', 'seaweed', 'seed', 'seesaw', 'selena', 'sew', 'shade', 'shadow', 'shakira', 'shampoo', 'shape', 'shaq', 'shark', 'sharp', 'shave', 'sheep', 'sheets', 'shelf', 'shell', 'sheriff', 'shield', 'shin', 'ship', 'shirt', 'shoe', 'shoebox', 'shoelace', 'shoes', 'shoot', 'shore', 'short', 'shorts', 'shot', 'shotgun', 'shoulder', 'shovel', 'shower', 'shrek', 'shrimp', 'shuttle', 'shy', 'sideburn', 'sidewalk', 'simon', 'sing', 'singer', 'sink', 'sister', 'sit', 'sith', 'sixpack', 'skate', 'skater', 'skeleton', 'ski', 'skiing', 'skin', 'skinny', 'skirt', 'skis', 'skrillex', 'skull', 'skunk', 'sky', 'skyline', 'skyrim', 'slam', 'slamdunk', 'slap', 'sled', 'sledding', 'sleep', 'sleigh', 'slide', 'slimy', 'slip', 'slippers', 'slope', 'small', 'smell', 'smile', 'smoke', 'smoking', 'smoothie', 'smores', 'snail', 'snake', 'snakepit', 'sneakers', 'sneeze', 'sniper', 'snooki', 'snoop', 'snoopy', 'snore', 'snorkel', 'snow', 'snowball', 'snowcone', 'snowman', 'soap', 'soccer', 'sock', 'socket', 'socks', 'soda', 'sofa', 'soil', 'soldier', 'sombrero', 'son', 'song', 'sonic', 'sorry', 'soup', 'south', 'soysauce', 'spain', 'sparkles', 'speak', 'speaker', 'spear', 'spider', 'spin', 'spinach', 'spine', 'spiral', 'spit', 'splinter', 'sponge', 'spoon', 'spray', 'spring', 'sprite', 'square', 'squid', 'squirrel', 'stab', 'stable', 'stadium', 'stage', 'stain', 'stairs', 'stamp', 'stapler', 'star', 'stare', 'starfish', 'startrek', 'starwars', 'statue', 'steak', 'steal', 'steam', 'steelers', 'steep', 'step', 'stereo', 'stern', 'stilts', 'sting', 'stomach', 'stone', 'stool', 'stop', 'stork', 'storm', 'stove', 'straight', 'straw', 'strawman', 'stream', 'street', 'strike', 'string', 'stripe', 'stroller', 'students', 'stump', 'subway', 'sudoku', 'sugar', 'suitcase', 'summer', 'sun', 'sunblock', 'sunburn', 'sunny', 'sunset', 'sunshine', 'superman', 'surf', 'surfing', 'surgeon', 'survivor', 'sushi', 'swan', 'sweat', 'sweater', 'sweaty', 'sweden', 'sweet', 'swim', 'swimming', 'swimsuit', 'swing', 'swings', 'swingset', 'switch', 'swoosh', 'sword', 'syrup', 'table', 'taco', 'tacos', 'tadpole', 'tag', 'tail', 'taiwan', 'takeoff', 'tall', 'tango', 'tank', 'tape', 'target', 'tattoo', 'taxi', 'tea', 'teabag', 'teacher', 'teacup', 'teapot', 'teardrop', 'tears', 'teaspoon', 'tebowing', 'techno', 'teenager', 'teepee', 'teeth', 'tempest', 'tennis', 'tent', 'tentacle', 'test', 'tetris', 'theater', 'thelorax', 'theonion', 'thief', 'thigh', 'thin', 'thorn', 'throat', 'throne', 'throw', 'thumb', 'thunder', 'ticket', 'tickle', 'tie', 'tiger', 'tiles', 'time', 'timebomb', 'timeline', 'timeout', 'timezone', 'tinafey', 'tire', 'tissue', 'titanic', 'toad', 'toast', 'toaster', 'toe', 'toenail', 'toga', 'toilet', 'tomato', 'tomb', 'tombrady', 'tomhanks', 'tongue', 'tool', 'toolbox', 'tools', 'tooth', 'torch', 'tornado', 'torpedo', 'tortoise', 'tower', 'towtruck', 'toys', 'tractor', 'traffic', 'train', 'trapdoor', 'trash', 'trashcan', 'tray', 'tree', 'triangle', 'tricycle', 'triplets', 'tripod', 'troll', 'trombone', 'trophy', 'tropical', 'trouble', 'truck', 'trump', 'trumpet', 'trunk', 'tshirt', 'tuba', 'tuesday', 'tug', 'tugboat', 'tumblr', 'tummy', 'tuna', 'tune', 'tunnel', 'tupac', 'turbo', 'turkey', 'turtle', 'tusk', 'tuxedo', 'tv', 'tweed', 'tweezers', 'twig', 'twilight', 'twinkie', 'twins', 'twist', 'twitter', 'twoface', 'tyra', 'udder', 'ufo', 'ugly', 'ukulele', 'umbrella', 'under', 'unibrow', 'unicorn', 'unicycle', 'union', 'uno', 'unzip', 'uppercut', 'upstairs', 'uranus', 'urchin', 'usa', 'usb', 'usher', 'vacation', 'vaccine', 'vacuum', 'vader', 'valley', 'vampire', 'van', 'vanish', 'vase', 'vault', 'vegas', 'veil', 'vein', 'velcro', 'venom', 'vent', 'venus', 'vertical', 'vest', 'vet', 'vice', 'victim', 'video', 'viking', 'vikings', 'village', 'vine', 'vineyard', 'viola', 'violin', 'virus', 'visine', 'vitamin', 'voice', 'volcano', 'volume', 'vomit', 'voodoo', 'vortex', 'vote', 'waffle', 'wagon', 'waist', 'waiter', 'waitress', 'wakeup', 'waldo', 'walk', 'wall', 'wallet', 'walrus', 'wand', 'war', 'warcraft', 'wardrobe', 'warhol', 'warrior', 'wart', 'wash', 'wasp', 'waste', 'watch', 'water', 'waterbed', 'watergun', 'wattle', 'wave', 'waves', 'waving', 'wax', 'weak', 'weave', 'wedding', 'wedge', 'wedgie', 'weed', 'week', 'weep', 'weezer', 'weights', 'weird', 'well', 'werewolf', 'west', 'wet', 'whale', 'wheat', 'wheel', 'whip', 'whiskers', 'whiskey', 'whisper', 'whistle', 'white', 'whopper', 'wicked', 'widget', 'widow', 'wife', 'wig', 'wiggle', 'wigwam', 'wildfire', 'willow', 'wimp', 'winch', 'wind', 'windmill', 'window', 'windows', 'wine', 'wing', 'wingman', 'wingnut', 'wink', 'winner', 'winter', 'wire', 'wireless', 'wires', 'wise', 'witch', 'witness', 'wizard', 'wolf', 'woman', 'wonder', 'wood', 'wool', 'work', 'workshop', 'worldcup', 'worm', 'wormhole', 'worry', 'worship', 'wound', 'wow', 'wreck', 'wrench', 'wrestler', 'wrinkles', 'wrist', 'writing', 'wutang', 'xerox', 'xray', 'yacht', 'yahtzee', 'yankees', 'yardsale', 'yarn', 'yawn', 'yearbook', 'yellow', 'yeti', 'yield', 'ymca', 'yoda', 'yoga', 'yogurt', 'young', 'youtube', 'yoyo', 'zebra', 'zelda', 'zeppelin', 'zeus', 'zigzag', 'zipline', 'zipper', 'zombie', 'zoo', 'zoom', 'zumba', 'zygote'];
// Shuffle the topic list in-place using Knuth shuffle
for (var i = topicList.length - 2; i > 0; i--) {
  var j = Math.floor(Math.random() * i);
  var temp = topicList[j];
  topicList[j] = topicList[i];
  topicList[i] = temp;
}

function checkGuess(guess, topic) {
  // STAGE 1 - basic JW distance
  var score = jaro_winkler(guess, topic);
  var t = Math.max(0.90, 0.96 - guess.length / 130); // starts at 0.96 and moves towards 0.9 for longer guesses
  if (score < 0.8 || score > t) {
    return {score : score, close : score > t, stage : 1};
  }

  // STAGE 2 - JW distance on the word root
  var guessRoot = porter(guess);
  var topicRoot = porter(topic);
  score = jaro_winkler(guessRoot, topicRoot);
  score -= levenshtein(guessRoot, topicRoot) / 60;
  if (score < 0.8 || score > t) {
    return {score : score, close : score > t, stage : 2};
  }

  // STAGE 3 - check levenshtein distance of entire words
  var lev = levenshtein(guess, topic);
  return {score : score, close : lev <= (guess.length - 5)/3.5 + 1, stage : 3};
}

/*
 * returns a list of matching words from the guess and topic
 * punctuation is ignored when finding matches
 * common grammatical words like "the" and "a" are ignored
 */
function matchingWords(guess, topic) {
  // uses the original guess and topic to preserve punctuation so we can split on spaces/dash
  // keep punctuation for topic words, so we can tell the guesser the prompt contains "fire's" rather than "fires"
  var guessWords = ServerUtils.importantWords(guess, true); // true => remove punctuation from guess words
  var topicWords = ServerUtils.importantWords(topic, false); // false => keep punctuation

  if (!guessWords || !topicWords) {
    return [];
  }

  var matches = [];
  for (var i = 0; i < guessWords.length; i++) {
    for (var j = 0; j < topicWords.length; j++) {
      if (guessWords[i] === topicWords[j].replace(/[\W_]/g, '')) {
        matches.push(topicWords[j]); // topicWords[j] has correct punctuation, guessWords[i] has no punctuation
      }
    }
  }
  return matches;
}

// Create the game configuration
module.exports = function (io, socket) {
  function broadcastMessage(message) {
    message.created = Date.now();
    gameMessages.push(message);
    if (gameMessages.length > ChatSettings.MAX_MESSAGES) {
      gameMessages.shift();
    }
    io.emit('gameMessage', message);
  }
  function sendTopic() {
    // Select a new topic and send it to the new drawer
    topicList.push(topicList.shift());
    Game.getDrawers().forEach(function (drawer) {
      io.to(drawer).emit('topic', topicList[0]);
    });

    // Announce the new drawers
    var newDrawersAre = Utils.toCommaListIs(Utils.boldList(Game.getDrawers()));
    broadcastMessage({
      class: 'status',
      text: newDrawersAre + ' now drawing.'
    });
  }

  function advanceRound() {
    var gameFinished = Game.advanceRound();

    // Send user list with updated drawers
    io.emit('advanceRound');

    io.emit('canvasMessage', {type: 'clear'});
    drawHistory = [];

    // Explain what the word was
    broadcastMessage({
      class: 'status',
      text: 'Round over! The topic was "' + topicList[0] + '"'
    });

    if (gameFinished) {
      var winners = Game.getWinners();
      broadcastMessage({
        class: 'status',
        text: Utils.toCommaList(Utils.boldList(winners)) + ' won the game on ' +
              Game.users[winners[0]].score + ' points! A new game will start ' +
              'in ' + Game.timeToEnd + ' seconds.'
      });
      setTimeout(function () {
        gameMessages = [];
        drawHistory = [];
        Game.resetGame();
        io.emit('resetGame');
      }, Game.timeToEnd * 1000);
    } else {
      sendTopic();
    }
  }

  function giveUp() {
    broadcastMessage({
      class: 'status',
      text: '<b>'+username+'</b>' + ' has given up'
    });
    advanceRound();
  }

  var username = socket.request.user.username;
  var profileImageURL = socket.request.user.profileImageURL;
  socket.join(username);

  // Add user to in-memory store if necessary, or simply increment counter
  // to account for multiple windows open
  if (username in userConnects) {
    userConnects[username]++;
  } else {
    userConnects[username] = 1;
    Game.addUser(username, profileImageURL);

    // Emit the status event when a new socket client is connected
    broadcastMessage({
      class: 'status',
      text: '<b>'+username+'</b>' + ' is now connected'
    });

    // Notify everyone about the new joined user (not the sender though)
    socket.broadcast.emit('userConnect', {
      username: username,
      image: profileImageURL
    });
  }

  // Start the game
  socket.on('startGame', function () {
    if (!Game.started && username === Game.getHost()) {
      Game.startGame();
      // tell all clients that the game has started
      io.emit('startGame');
      io.emit('gameMessage', {
        class: 'status',
        text: 'The game has started!'
      });
      sendTopic();
    }
  });

  // Change a setting as the host
  socket.on('changeSetting', function (change) {
    if (!Game.started && username === Game.getHost()) {
      // make sure change uses one of the options given
      if (GameSettings[change.setting].options.indexOf(change.option) === -1) {
        return;
      }

      // apply settings selected by host
      Game[change.setting] = change.option;

      // tell all clients about the new setting
      io.emit('updateSetting', change);
    }
  });

  // Send an updated version of the userlist whenever a user requests an update of the
  // current server state.
  socket.on('requestState', function () {
    // Send current game state
    socket.emit('gameState', Game);

    // Send the chat message history to the user
    socket.emit('gameMessage', gameMessages);

    // Send the draw history to the user
    socket.emit('canvasMessage', drawHistory);

    // Send current topic if they are the drawer
    if (Game.isDrawer(username)) {
      socket.emit('topic', topicList[0]);
    }

  });
  
  // Handle chat messages
  socket.on('gameMessage', function (message) {
    // Don't trust user data - create a new object from expected user fields
    message = {
      class: 'user-message',
      text: message.text.toString(),
      username: username
    };

    // Disallow messages that are empty or longer than MAX_MSG_LEN characters
    if (message.text.length > ChatSettings.MAX_MSG_LEN || /^\s*$/.test(message.text)) {
      return;
    }

    // If game hasn't started, or ended, don't check any guesses
    if (!Game.started || Game.currentRound >= Game.numRounds) {
      broadcastMessage(message);
      return;
    }

    // The current drawer cannot chat
    if (Game.isDrawer(username)) {
      return;
    }

    // Compare the lower-cased versions
    var guess = message.text.toLowerCase();
    var topic = topicList[0].toLowerCase();
    var filteredGuess = guess.replace(/[\W_]/g, ''); // only keep letters and numbers
    var filteredTopic = topic.replace(/[\W_]/g, '');
    if (filteredGuess === filteredTopic) {
      // Correct guess
      message.created = Date.now();
      message.class = 'correct-guess';

      // Send user's guess to the drawer/s
      message.addon = 'This guess is correct!';
      Game.getDrawers().forEach(function (drawer) {
        io.to(drawer).emit('gameMessage', message);
      });

      // Send the user's guess to themselves
      message.addon = 'Your guess is correct!';
      socket.emit('gameMessage', message);

      // Don't update game state if user has already guessed the prompt
      if (Game.userHasGuessed(username)) {
        return;
      }

      // Mark user as correct and increase their score
      Game.markCorrectGuess(username);
      io.emit('markCorrectGuess', username); // tell clients to update the score too

      // Alert everyone in the room that the guesser was correct
      broadcastMessage({
        class: 'status',
        text: '<b>'+username+'</b>' + ' has guessed the prompt!'
      });

      // End round if everyone has guessed
      if (Game.allGuessed()) {
        clearTimeout(roundTimeout);
        advanceRound();
      } else if (Game.correctGuesses === 1) {
        // Start timer to end round if this is the first correct guess
        broadcastMessage({
          class: 'status',
          text: "The round will end in " + Game.timeToEnd + " seconds."
        });
        roundTimeout = setTimeout(function () {
          advanceRound();
        }, Game.timeToEnd * 1000);
      }

    } else {
      var guessResult = checkGuess(filteredGuess, filteredTopic);
      var matches = matchingWords(guess, topic);

      if (!guessResult.close && matches.length === 0) {
        // Incorrect guess: emit message to everyone
        broadcastMessage(message);
      } else {
        message.created = Date.now();
        message.class = 'close-guess';
        message.addon = guessResult.close ? 'This guess is close! ' : '';

        if (guessResult.close) {
          message.debug = guess + " has score " + guessResult.score.toFixed(2) + ". At stage " + guessResult.stage;
        }

        if (matches.length > 0) {
          message.addon += 'The prompt contains: ' + Utils.toCommaList(matches);
        }

        // Send message to drawers
        Game.getDrawers().forEach(function (drawer) {
          io.to(drawer).emit('gameMessage', message);
        });

        // Send message to guesser
        if (guessResult.close) {
          message.addon = message.addon.replace('This', 'Your');
        }

        socket.emit('gameMessage', message);
      }
    }
  });

  // Send a canvas drawing command to all connected sockets when a message is received
  socket.on('canvasMessage', function (message) {
    if (!Game.started) {
      return;
    }

    if (Game.isDrawer(username)) {
      if (message.type === 'clear') {
        drawHistory = [];
      } else {
        drawHistory.push(message);
      }

      // Emit the 'canvasMessage' event
      socket.broadcast.emit('canvasMessage', message);
    }
  });

  // Current drawer has finished drawing
  socket.on('finishDrawing', function () {
    if (!Game.started) {
      return;
    }

    // If the user who submitted this message actually is a drawer
    // And prevent round ending prematurely when prompt has been guessed
    if (Game.isDrawer(username) && Game.correctGuesses === 0) {
      giveUp();
    }
  });

  // Decrement user reference count, and remove from in-memory store if it hits 0
  socket.on('disconnect', function () {
    userConnects[username]--;
    if (userConnects[username] === 0) {
      // Emit the status event when a socket client is disconnected
      broadcastMessage({
        class: 'status',
        text: '<b>'+username+'</b>' + ' is now disconnected',
      });

      // If the disconnecting user is a drawer, this is equivalent to
      // 'giving up' or passing
      if (Game.started && Game.isDrawer(username)) {
        giveUp();
      }
      delete userConnects[username];
      Game.removeUser(username);

      // Notify all users that this user has disconnected
      io.emit('userDisconnect', username);
    }
  });
};
