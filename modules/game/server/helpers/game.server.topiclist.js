'use strict';


var topicLists = {
  default : {
    easy: ['acorn', 'add', 'alarm', 'anchor', 'angel', 'animals', 'ankle', 'ant', 'antenna', 'antlers', 'apple', 'apron',  'archery', 'arrow', 'awake', 'axe', 'baby', 'back', 'backpack', 'badge', 'bag', 'bald', 'ball', 'balloon', 'bamboo', 'banana', 'bandaid', 'bank', 'barcode', 'bark', 'barrel', 'base', 'basket', 'bat', 'bathtub', 'beach', 'beak', 'beard', 'bed', 'bee', 'beer', 'bell', 'belt', 'bicycle', 'bird', 'birdcage', 'birthday', 'blade', 'blanket', 'blood', 'blush', 'boat', 'bomb', 'bone', 'book', 'boots', 'bottle', 'bottom', 'bounce', 'bow', 'bowl', 'bowling', 'box', 'branches', 'bread', 'breath', 'brick', 'bridge', 'broom', 'brush', 'bubble', 'bucket', 'building', 'bullet', 'bullseye', 'bunk bed', 'burger', 'bus', 'button', 'cable', 'cactus', 'cage', 'cake', 'can', 'Canada', 'candle', 'candy', 'cannon', 'cap', 'cape', 'carrot', 'castle', 'cat', 'cemetery', 'cereal', 'chainsaw', 'chair', 'chalk', 'checkers', 'cheese', 'chef', 'cherry', 'chess', 'chest', 'chicken', 'chimney', 'China', 'chips', 'church', 'cigar', 'circus', 'clam', 'claw', 'clock', 'cloud', 'clown', 'coat', 'coconut', 'coffee', 'coffin', 'coin', 'collar', 'comb', 'comet', 'compass', 'computer', 'cone', 'cookie', 'cookies', 'cork', 'corn', 'couch', 'cow', 'crab', 'crack', 'crawl', 'crayon', 'crescent', 'crown', 'crust', 'cry', 'cup', 'cupcake', 'curtain', 'cut', 'dead', 'death', 'deep', 'desert', 'desk', 'diamond', 'dice', 'die', 'dig', 'dimples', 'dirt', 'dishes', 'dive', 'dog', 'dollar', 'domino', 'door', 'doorknob', 'dots', 'doughnut', 'down', 'draw', 'dress', 'drill', 'drink', 'drip', 'drum', 'drummer', 'ear', 'Earth', 'eat', 'echo', 'edge', 'egg', 'eggplant', 'elbow', 'elephant', 'emerald', 'empty', 'end', 'envelope', 'eraser', 'explode', 'eye', 'eyebrow', 'eyepatch', 'face', 'fall', 'family', 'fan', 'fangs', 'farm', 'feather', 'feet', 'fence', 'fight', 'fin', 'finger', 'fire', 'fireball', 'firework', 'first', 'fish', 'fishing', 'fist', 'flag', 'flame', 'flat', 'floor', 'flower', 'fly', 'foot', 'football', 'forest', 'fork', 'forward', 'frame', 'freeze', 'frisbee', 'frown', 'fruit', 'funnel', 'fur', 'gate', 'gears', 'gem', 'ghost', 'gift', 'giraffe', 'girl', 'glass', 'glasses', 'globe', 'glove', 'goal', 'goalie', 'gold', 'goldfish', 'golf', 'grapes', 'graph', 'grass', 'grave', 'grenade', 'grin', 'guitar', 'gun', 'hair', 'haircut', 'halo', 'ham', 'hammer', 'hammock', 'hand', 'handbag', 'handcuff', 'happy', 'harp', 'hat', 'hear', 'heart', 'heat', 'heel', 'helmet', 'high five', 'hill', 'home', 'honey', 'hook', 'hoop', 'hop', 'horn', 'horse', 'hose', 'hospital', 'hot', 'hot dog', 'house', 'hug', 'hula hoop', 'ice', 'iceberg', 'ice skate', 'icicle', 'igloo', 'island', 'Japan', 'jar', 'jigsaw', 'jug', 'juggle', 'juice', 'jump', 'key', 'keyboard', 'kick', 'king', 'kiss', 'kite', 'kitten', 'knee', 'knife', 'knitting', 'knock', 'knot', 'koala', 'ladder', 'lady', 'ladybug', 'lake', 'lamb', 'lamp', 'laptop', 'laser', 'laugh', 'lava', 'leaf', 'leak', 'leash', 'left', 'leg', 'lemon', 'lemonade', 'letter', 'lick', 'lid', 'lift', 'light', 'lime', 'lip', 'lock', 'log', 'long', 'long jump', 'loop', 'love', 'low', 'magnet', 'mango', 'map', 'martini', 'mat', 'maze', 'meat', 'medal', 'meow', 'mermaid', 'meteor', 'middle', 'milk', 'money', 'monkey', 'moon', 'mop', 'mountain', 'mouse', 'moustache', 'mouth', 'mug', 'muscle', 'mushroom', 'music', 'nail', 'nail file', 'neck', 'necklace', 'needle', 'nest', 'net', 'ninja', 'nut', 'oar', 'ocean', 'orange', 'orbit', 'oval', 'overflow', 'Pacman', 'paddle', 'page', 'paint', 'painter', 'panda', 'pants', 'paper', 'paper cut', 'party hat', 'path', 'peace', 'peach', 'pear', 'peas', 'pen', 'pencil', 'penguin', 'pepper', 'petal', 'phone', 'pie', 'pig', 'pill', 'pillow', 'pirate', 'pizza', 'plane', 'planet', 'pocket', 'ponytail', 'pot', 'potato', 'price tag', 'punch', 'puppy', 'push', 'push up', 'pyramid', 'rabbit', 'radar', 'rain', 'rainbow', 'rice', 'ring', 'river', 'road', 'robber', 'rocket', 'roll', 'roof', 'root', 'rope', 'rose', 'ruby', 'sad', 'saddle', 'salad', 'salami', 'salt', 'sand', 'sandals', 'sandwich', 'santa', 'sapphire', 'Saturn', 'saw', 'scissors', 'screen', 'sea', 'seahorse', 'sea shell', 'seesaw', 'shade', 'shadow', 'shark', 'sheep', 'ship', 'shirt', 'shoe', 'shoelace', 'shoot', 'short', 'sing', 'sit', 'skiing', 'sky', 'slide', 'small', 'smile', 'smoke', 'snail', 'snake', 'sneeze', 'snow', 'snowball', 'snowman', 'soap', 'soccer', 'sock', 'solar panel', 'speak', 'spear', 'spider', 'spin', 'spiral', 'sponge', 'spoon', 'spray', 'spring', 'stage', 'stairs', 'starfish', 'straw', 'string', 'stripe', 'stump', 'sun', 'sushi', 'sweat', 'swing', 'switch', 'sword', 'table', 'tail', 'tall', 'target', 'teapot', 'teeth', 'tetris', 'thorn', 'throw', 'thunder', 'tickle', 'tie', 'tiger', 'time', 'toast', 'toe-nail', 'tomato', 'tongue', 'torch', 'train', 'trapdoor', 'tree', 'trophy', 'truck', 'trunk', 'tunnel', 'turtle', 'tusk', 'TV', 'UFO', 'umbrella', 'under', 'unicorn', 'unicycle', 'van', 'vase', 'vest', 'vine', 'volcano', 'walk', 'wall', 'wallet', 'wand', 'watch', 'water', 'water-gun', 'wave', 'weak', 'well', 'wheel', 'whip', 'whiskers', 'wind', 'windmill', 'window', 'wine', 'wing', 'wink', 'wires', 'wizard', 'wood', 'wool', 'wrist', 'yo-yo', 'zebra', 'zigzag'],
    medium: ['America', 'Barbie', 'CD', 'Cupid', 'DJ', 'DNA', 'Easter', 'Eiffel Tower', 'England', 'Homer', 'Jenga', 'KFC', 'Lion King', 'Pikachu', 'Reddit', 'Star Wars', 'World Cup', 'Zeus', 'ace', 'afro', 'airbag', 'airport', 'alien', 'alone', 'android', 'anger', 'aquarium', 'armor', 'armpit', 'army', 'art', 'artist', 'asteroid', 'attack', 'attic', 'audience', 'avocado', 'award', 'back flip', 'backache', 'backbone', 'bacon', 'bagpipes', 'bait', 'bake', 'balance', 'balcony', 'band', 'bandana', 'barber', 'barn', 'baseball', 'batman', 'battery', 'bay', 'beans', 'bear', 'beef', 'beehive', 'bench', 'bib', 'blender', 'blimp', 'blind', 'bonfire', 'bookcase', 'bookmark', 'border', 'bow tie', 'boxing', 'bracelet', 'braces', 'brain', 'brakes', 'bride', 'broccoli', 'brownie', 'buckle', 'bug', 'bull', 'bumper', 'bunny', 'burn', 'burp', 'butcher', 'butter', 'cabin', 'cabinet', 'calf', 'camel', 'camera', 'campfire', 'cane', 'canoe', 'captain', 'car', 'card', 'carnival', 'carpet', 'carwash', 'cashier', 'catapult', 'catfish', 'cave', 'caveman', 'ceiling', 'celery', 'centre', 'chain', 'cheek', 'chew', 'children', 'chin', 'city', 'clap', 'class', 'cliff', 'climb', 'closet', 'club', 'coal', 'cocoon', 'cold', 'comic', 'cook', 'corner', 'cover', 'cowboy', 'crane', 'crash', 'crib', 'crossbow', 'crowbar', 'crush', 'crutches', 'crystal', 'cuddle', 'curl', 'customer', 'cute', 'cyclops', 'dance', 'dandruff', 'danger', 'dart', 'deaf', 'deck', 'deer', 'defend', 'dentist', 'dentures', 'devil', 'diaper', 'dinosaur', 'diploma', 'disco', 'disease', 'divorce', 'dizzy', 'dock', 'doctor', 'doll', 'dolphin', 'donkey', 'doorbell', 'dove', 'dracula', 'dragon', 'drain', 'dream', 'drench', 'dribble', 'drive', 'drunk', 'duck', 'duel', 'dunk', 'duster', 'dynamite', 'eagle', 'earmuffs', 'earring', 'earwax', 'eclipse', 'eel', 'election', 'elmo', 'engine', 'escape', 'eskimo', 'espresso', 'evil', 'factory', 'fairy', 'farmer', 'fast food', 'father', 'faucet', 'fear', 'fencing', 'fern', 'ferry', 'fever', 'field', 'firewall', 'fireworks', 'first aid', 'flamingo', 'flash', 'flea', 'flight', 'flood', 'floss', 'flour', 'flu', 'flush', 'fog', 'folder', 'fool', 'force', 'forklift', 'fort', 'fountain', 'fox', 'fridge', 'friend', 'frog', 'frosting', 'funeral', 'galaxy', 'gameboy', 'gangster', 'garage', 'garden', 'gardener', 'garlic', 'gas', 'gas mask', 'glee', 'glue', 'goat', 'goggles', 'golem', 'golf cart', 'goose', 'gorilla', 'graduate', 'gravy', 'grill', 'groom', 'gum', 'hail', 'hamster', 'handle', 'harbor', 'headache', 'headset', 'heaven', 'hiking', 'hippo', 'hobo', 'holiday', 'homeless', 'hood', 'hotel', 'hungry', 'hunt', 'hurt', 'hut', 'ink', 'inn', 'insect', 'insomnia', 'iron', 'jacket', 'jail', 'jam', 'javelin', 'jaw', 'jazz', 'jeans', 'jeep', 'jelly', 'jet', 'jetski', 'jewelry', 'joker', 'judge', 'jungle', 'junk food', 'kangaroo', 'karate', 'keychain', 'kidney', 'kilt', 'kitchen', 'lab', 'lawyer', 'lead', 'leather', 'lens', 'leopard', 'library', 'limbo', 'link', 'lion', 'lipstick', 'liquid', 'list', 'lizard', 'lobster', 'lost', 'lotion', 'lovebird', 'luggage', 'lumber', 'lunch', 'lung', 'macaroni', 'magazine', 'magic', 'mailbox', 'mammoth', 'manicure', 'mansion', 'marble', 'marine', 'mario', 'mask', 'meal', 'medicine', 'melt', 'messy', 'minivan', 'minotaur', 'mint', 'mirror', 'missile', 'mittens', 'model', 'mohawk', 'monopoly', 'moo', 'moose', 'morning', 'mosquito', 'motor', 'mud', 'muffin', 'mummy', 'museum', 'music box', 'mustard', 'nachos', 'name', 'napkin', 'navy', 'nerd', 'news', 'night', 'noodle', 'noose', 'nose hair', 'notepad', 'novel', 'nun', 'nurse', 'octopus', 'odor', 'off', 'oil', 'olympics', 'onion', 'online', 'open', 'opera', 'organ', 'origami', 'ostrich', 'outlet', 'oven', 'owl', 'palace', 'palm tree', 'pancake', 'paper bag', 'parade', 'park', 'parrot', 'pass', 'patch', 'paw', 'peacock', 'peanut', 'pearl', 'pegasus', 'perfume', 'pet food', 'phoenix', 'piano', 'pickle', 'picnic', 'picture', 'pigeon', 'pilot', 'ping-pong', 'pitcher', 'plug', 'plum', 'plumber', 'poison', 'poke', 'poker', 'polaroid', 'police', 'polka-dot', 'polo', 'pony', 'poor', 'popcorn', 'pork', 'post card', 'poster', 'pounce', 'powder', 'power', 'pray', 'pregnant', 'pretty', 'pretzel', 'princess', 'pumpkin', 'puppet', 'quack', 'quiet', 'racecar', 'rag', 'rattle', 'rebound', 'record', 'referee', 'reindeer', 'renewable energy', 'rhino', 'rice farmer', 'rifle', 'ringtone', 'ripple', 'roadkill', 'roast', 'robot', 'rock star', 'runway', 'safari', 'sailor', 'scale', 'scar', 'school', 'science', 'scorpion', 'scrabble', 'scratch', 'sea sick', 'seafood', 'seagull', 'seal', 'seat belt', 'seaweed', 'seed', 'sew', 'shampoo', 'shave', 'sheriff', 'shrimp', 'shuttle', 'shy', 'sink', 'sister', 'skeleton', 'skinny', 'skipping rope', 'slam-dunk', 'smartphone', 'smell', 'smoothie', 'snore', 'snorkel', 'sofa', 'soil', 'soldier', 'sombrero', 'soup', 'soy sauce', 'sparkles', 'spinach', 'spine', 'splinter', 'squid', 'squirrel', 'stable', 'stadium', 'stain', 'stamp', 'stapler', 'stare', 'statue', 'steak', 'steal', 'steep', 'stereo', 'stilts', 'sting', 'stop', 'storm', 'strike', 'students', 'sugar', 'suitcase', 'summer', 'sunburn', 'sunset', 'surf', 'surgeon', 'swan', 'sweet', 'taco', 'tadpole', 'takeoff', 'tango', 'tank', 'tattoo', 'taxi', 'teabag', 'teacher', 'teepee', 'tennis', 'tent', 'tentacle', 'theater', 'thief', 'throne', 'ticket', 'titanic', 'toad', 'toaster', 'toga', 'toilet', 'tomb', 'toolbox', 'tornado', 'torpedo', 'toys', 'tractor', 'traffic', 'tricycle', 'triplets', 'troll', 'tropical', 'trumpet', 'tug', 'tuna', 'turbo', 'turkey', 'tuxedo', 'tweezers', 'twinkle', 'twist', 'ukulele', 'union', 'uppercut', 'urchin', 'usb', 'vacation', 'vaccine', 'vacuum', 'valley', 'vampire', 'vanish', 'vault', 'veil', 'vein', 'velcro', 'venom', 'vent', 'vet', 'victim', 'video', 'viking', 'village', 'vineyard', 'violin', 'virus', 'vitamin', 'voodoo', 'vortex', 'vote', 'waffle', 'wagon', 'waist', 'waiter', 'wake up', 'walrus', 'war', 'wardrobe', 'warrior', 'wart', 'wash', 'wasp', 'waste', 'water bed', 'wattle', 'wax', 'weave', 'wedge', 'weep', 'werewolf', 'whale', 'wheat', 'whiskey', 'whisper', 'whistle', 'wig', 'wiggle', 'wild-fire', 'willow', 'winner', 'winter', 'wireless', 'witch', 'witness', 'wolf', 'wonder', 'work', 'worm', 'wormhole', 'worry', 'worship', 'wound', 'wreck', 'wrestler', 'wrinkles', 'x-ray', 'yacht', 'yawn', 'yoga', 'young', 'zeppelin', 'zombie', 'zoo', 'zoom'],
    hard: ['Africa', 'Asia', 'ability', 'acre', 'addendum', 'adore', 'adventure', 'align', 'amaze', 'animation', 'anxiety', 'apprehensive', 'arcade', 'archaeologist', 'archive', 'aristocrat', 'armada', 'ash', 'assassin', 'avatar', 'awe', 'beauty', 'belief', 'bingo', 'blacksmith', 'brave', 'brilliant', 'brutal', 'budget', 'buffalo', 'burrito', 'calm', 'carpool', 'cartography', 'casino', 'centaur', 'century', 'champion', 'chaos', 'charity', 'chart', 'check', 'clarity', 'clay', 'clue', 'coach', 'college', 'comfort', 'communicate', 'compassion', 'competition', 'concert', 'confidence', 'considerate', 'content', 'courage', 'court', 'coward', 'craftsmanship', 'crisp', 'culture', 'curious', 'customer service', 'deceit', 'dedication', 'defeat', 'delight', 'democracy', 'despair', 'determination', 'dexterity', 'dictatorship', 'director', 'disappointed', 'disbelief', 'disquiet', 'disturbance', 'divide and conquer', 'drake', 'dubstep', 'effectiveness', 'ego', 'elegant', 'empathy', 'energy', 'enhance', 'enthusiastic', 'envy', 'eureka', 'evil', 'excited', 'exotic', 'fail', 'faith', 'faithful', 'faithless', 'fascinated', 'favourite', 'fear', 'figment', 'flight of the bumblebee', 'flotsam', 'flutter', 'forgive', 'foul', 'frail', 'gallop', 'generous', 'goofy', 'gossip', 'grace', 'gracious', 'grief', 'gross', 'hate', 'hearsay', 'helpful', 'helpless', 'hobbit', 'honest', 'honor', 'hope', 'humble', 'humour', 'hustle', 'idiosyncrasy', 'illegal maritime arrival', 'imagine', 'implode', 'impress', 'improve', 'infatuated', 'information', 'inquisition', 'insane', 'integrity', 'intelligent', 'international relations', 'intimidating', 'ironic', 'jealous', 'journey', 'joyful', 'justice', 'kilogram', 'kind', 'knowledge', 'landfill', 'latrine', 'law', 'legal', 'ligament', 'loiterer', 'loss', 'loyal', 'luck', 'luxury', 'mature', 'mercy', 'misery', 'monster', 'mooch', 'motivate', 'movement', 'national broadband network', 'need', 'network externalities', 'neutron', 'nostalgia', 'obscure', 'observatory', 'omen', 'opaque', 'opinion', 'opportunity', 'opportunity cost', 'ornament', 'overture', 'paradigm shift', 'parody', 'pastry', 'patient', 'patriot', 'peace', 'peculiarity', 'persevere', 'philosopher', 'pleasure', 'pompous', 'positive', 'potential', 'power', 'pride', 'principle', 'protestant', 'psychologist', 'quarantine', 'raider', 'rainwater', 'random', 'reality', 'redemption', 'relaxed', 'relief', 'renovation', 'reptile', 'resilience', 'ringleader', 'risk', 'romance', 'rumor', 'sane', 'sarcasm', 'satisfied', 'self-control', 'sensitive', 'service', 'shocked', 'siesta', 'silly', 'skill', 'slimy', 'slump', 'sophisticated', 'sorrow', 'sorry', 'speculation', 'stern', 'stockholder', 'stout', 'stowaway', 'strict', 'stupid', 'submission', 'success', 'survivor', 'sustainability', 'sympathy', 'talent', 'tempest', 'therapy', 'thrilled', 'tinting', 'tolerant', 'tournament', 'tragedy of the commons', 'trouble', 'trump', 'trust', 'truth', 'tutor', 'twang', 'uncertain', 'unemployment', 'unreal', 'upgrade', 'vision', 'wary', 'weary', 'weird', 'wicked', 'wise', 'wit', 'workshop', 'worry', 'zeitgeist', 'zygote']
  },

  agile : {
      easy: ['waterfall', 'test', 'sprint', 'stand-up', 'story', 'cross', 'delivery', 'integration', 'time-box', 'product', 'review', 'spike', 'block', 'chart', 'burn-down'],
      medium: ['manager', 'scope', 'organise', 'continuous', 'manifesto', 'management', 'planning poker', 'refactor', 'criteria', 'backlog', 'showcase', 'improvement', 'user'],
      hard: ['agile', 'pair programming', 'extreme', 'epic', 'functional', 'retrospective', 'Kanban', 'lean', 'scrum', 'adapt', 'iteration', 'prototype', 'acceptance']
  }

  // NOTE: if adding new preset topic, add it as an option in game.shared.topic.config.js as well
};

// Get all the words with specified difficulty from the topicList called topicListName
exports.getTopicWords = function (topicListName, difficulty) {
    var topicList = topicListName ? topicLists[topicListName] : topicLists.default;
    var words = [];
    if (difficulty === 'random') {
        words = words.concat(topicList.easy);
        words = words.concat(topicList.medium);
        words = words.concat(topicList.hard);
    } else {
        words = words.concat(topicList[difficulty]);
    }

    return words;
};
