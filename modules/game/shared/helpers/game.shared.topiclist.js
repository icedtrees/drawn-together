'use strict';

// name -> [{
//   wordName: ____,
//   difficulty: 'easy', 'medium', 'hard'
// }]
(function (exports) {
  exports.TopicLists = function () {
    this.topicLists = {};
  };

  // For custom word lists, we would have to check if the topicListName already exists
  exports.TopicLists.prototype.addTopicList = function (topicListName, easyWordNames, mediumWordNames, hardWordNames) {
    var newTopicList = [];
    for (var i = 0; i < easyWordNames.length; i++) {
      newTopicList.push({
        wordName: easyWordNames[i],
        difficulty: 'easy'
      });
    }
    for (i = 0; i < mediumWordNames.length; i++) {
      newTopicList.push({
        wordName: mediumWordNames[i],
        difficulty: 'medium'
      });
    }
    for (i = 0; i < hardWordNames.length; i++) {
      newTopicList.push({
        wordName: hardWordNames[i],
        difficulty: 'hard'
      });
    }
    this.topicLists[topicListName] = newTopicList;
  };

// Get all the words with specified difficulty from the topicList called topicListName
  exports.TopicLists.prototype.getTopicListWordNames = function (topicListName, difficulty) {
    var words = [];
    var topicList = topicListName ? this.topicLists[topicListName] : this.topicLists['default'];
    for (var i = 0; i < topicList.length; i++) {
      var word = topicList[i];
      if (difficulty === 'all' || difficulty === word.difficulty) {
        words.push(word.wordName);
      }
    }
    return words;
  };

  exports.TopicLists.prototype.getAllTopicListNames = function () {
    var topicListNames = [];
    for (var topicListName in this.topicLists) {
      topicListNames.push(topicListName);
    }
    return topicListNames;
  };

  // Shuffle the topic list in-place using Knuth shuffle
  exports.TopicLists.prototype.shuffleWords = function (topicListWords) {
    for (var i = topicListWords.length - 2; i > 0; i--) {
      var j = Math.floor(Math.random() * i);
      var temp = topicListWords[j];
      topicListWords[j] = topicListWords[i];
      topicListWords[i] = temp;
    }
    return topicListWords;
  };


  exports.TopicLists.prototype.loadTopicLists = function () {
    // Add all of our word lists
    this.addTopicList('default',
      ['acorn', 'add', 'alarm', 'anchor', 'angel', 'animals', 'ankle', 'ant', 'antenna', 'antlers', 'apple', 'apron',  'archery', 'arrow', 'awake', 'axe', 'baby', 'back', 'backpack', 'badge', 'bag', 'bald', 'ball', 'balloon', 'bamboo', 'banana', 'bandaid', 'bank', 'barcode', 'bark', 'barrel', 'base', 'basket', 'bat', 'bathtub', 'beach', 'beak', 'beard', 'bed', 'bee', 'beer', 'bell', 'belt', 'bicycle', 'bird', 'birdcage', 'birthday', 'blade', 'blanket', 'blood', 'blush', 'boat', 'bomb', 'bone', 'book', 'boots', 'bottle', 'bottom', 'bounce', 'bow', 'bowl', 'bowling', 'box', 'branches', 'bread', 'breath', 'brick', 'bridge', 'broom', 'brush', 'bubble', 'bucket', 'building', 'bullet', 'bullseye', 'bunk bed', 'burger', 'bus', 'button', 'cable', 'cactus', 'cage', 'cake', 'can', 'Canada', 'candle', 'candy', 'cannon', 'cap', 'cape', 'carrot', 'castle', 'cat', 'cemetery', 'cereal', 'chainsaw', 'chair', 'chalk', 'checkers', 'cheese', 'chef', 'cherry', 'chess', 'chest', 'chicken', 'chimney', 'China', 'chips', 'church', 'cigar', 'circle', 'circus', 'clam', 'claw', 'clock', 'cloud', 'clown', 'coat', 'coconut', 'coffee', 'coffin', 'coin', 'collar', 'comb', 'comet', 'compass', 'computer', 'cone', 'cookie', 'cookies', 'cork', 'corn', 'couch', 'cow', 'crab', 'crack', 'crawl', 'crayon', 'crescent', 'crown', 'crust', 'cry', 'cup', 'cupcake', 'curtain', 'cut', 'dead', 'death', 'deep', 'desert', 'desk', 'diamond', 'dice', 'die', 'dig', 'dimples', 'dirt', 'dishes', 'dive', 'dog', 'dollar', 'domino', 'door', 'doorknob', 'dots', 'doughnut', 'down', 'draw', 'dress', 'drill', 'drink', 'drip', 'drum', 'drummer', 'ear', 'Earth', 'eat', 'echo', 'edge', 'egg', 'eggplant', 'elbow', 'elephant', 'emerald', 'empty', 'end', 'envelope', 'eraser', 'explode', 'eye', 'eyebrow', 'eyepatch', 'face', 'fall', 'family', 'fan', 'fangs', 'farm', 'feather', 'feet', 'fence', 'fight', 'fin', 'finger', 'fire', 'fireball', 'firework', 'first', 'fish', 'fishing', 'fist', 'flag', 'flame', 'flat', 'floor', 'flower', 'fly', 'foot', 'football', 'forest', 'fork', 'forward', 'frame', 'freeze', 'frisbee', 'frown', 'fruit', 'funnel', 'fur', 'gate', 'gears', 'gem', 'ghost', 'gift', 'giraffe', 'girl', 'glass', 'glasses', 'globe', 'glove', 'goal', 'goalie', 'gold', 'goldfish', 'golf', 'grapes', 'graph', 'grass', 'grave', 'grenade', 'grin', 'guitar', 'gun', 'hair', 'haircut', 'halo', 'ham', 'hammer', 'hammock', 'hand', 'handbag', 'handcuff', 'happy', 'harp', 'hat', 'hear', 'heart', 'heat', 'heel', 'helmet', 'high five', 'hill', 'home', 'honey', 'hook', 'hoop', 'hop', 'horn', 'horse', 'hose', 'hospital', 'hot', 'hot dog', 'house', 'hug', 'hula hoop', 'ice', 'iceberg', 'ice skate', 'icicle', 'igloo', 'island', 'Japan', 'jar', 'jigsaw', 'jug', 'juggle', 'juice', 'jump', 'key', 'keyboard', 'kick', 'king', 'kiss', 'kite', 'kitten', 'knee', 'knife', 'knitting', 'knock', 'knot', 'koala', 'ladder', 'lady', 'ladybug', 'lake', 'lamb', 'lamp', 'laptop', 'laser', 'laugh', 'lava', 'leaf', 'leak', 'leash', 'left', 'leg', 'lemon', 'lemonade', 'letter', 'lick', 'lid', 'lift', 'light', 'lime', 'lip', 'lock', 'log', 'long', 'long jump', 'loop', 'love', 'low', 'magnet', 'mango', 'map', 'martini', 'mat', 'maze', 'meat', 'medal', 'meow', 'mermaid', 'meteor', 'middle', 'milk', 'money', 'monkey', 'moon', 'mop', 'mountain', 'mouse', 'moustache', 'mouth', 'mug', 'muscle', 'mushroom', 'music', 'nail', 'nail file', 'neck', 'necklace', 'needle', 'nest', 'net', 'ninja', 'nut', 'oar', 'ocean', 'orange', 'orbit', 'oval', 'overflow', 'Pacman', 'paddle', 'page', 'paint', 'painter', 'panda', 'pants', 'paper', 'paper cut', 'party hat', 'path', 'peace', 'peach', 'pear', 'peas', 'pen', 'pencil', 'penguin', 'pepper', 'petal', 'phone', 'pie', 'pig', 'pill', 'pillow', 'pirate', 'pizza', 'plane', 'planet', 'pocket', 'ponytail', 'pot', 'potato', 'powder', 'price tag', 'punch', 'puppy', 'push', 'push up', 'pyramid', 'rabbit', 'radar', 'rain', 'rainbow', 'rice', 'ring', 'river', 'road', 'robber', 'rocket', 'roll', 'roof', 'root', 'rope', 'rose', 'ruby', 'sad', 'saddle', 'salad', 'salami', 'salt', 'sand', 'sandals', 'sandwich', 'santa', 'sapphire', 'Saturn', 'saw', 'scissors', 'screen', 'sea', 'seahorse', 'sea shell', 'seesaw', 'shade', 'shadow', 'shark', 'sheep', 'ship', 'shirt', 'shoe', 'shoelace', 'shoot', 'short', 'sing', 'sit', 'skiing', 'sky', 'slide', 'small', 'smile', 'smoke', 'snail', 'snake', 'sneeze', 'snow', 'snowball', 'snowman', 'soap', 'soccer', 'sock', 'speak', 'spear', 'spider', 'spin', 'spiral', 'sponge', 'spoon', 'spray', 'spring', 'stage', 'stairs', 'starfish', 'straw', 'string', 'stripe', 'stump', 'sun', 'sushi', 'sweat', 'swing', 'switch', 'sword', 'table', 'tail', 'tall', 'target', 'teapot', 'teeth', 'tetris', 'thorn', 'throw', 'thunder', 'tickle', 'tie', 'tiger', 'time', 'toast', 'toe-nail', 'tomato', 'tongue', 'torch', 'train', 'trapdoor', 'tree', 'trophy', 'truck', 'trunk', 'tunnel', 'turtle', 'tusk', 'TV', 'UFO', 'umbrella', 'under', 'unicorn', 'unicycle', 'van', 'vase', 'vest', 'vine', 'volcano', 'walk', 'wall', 'wallet', 'wand', 'watch', 'water', 'water-gun', 'wave', 'weak', 'well', 'wheel', 'whip', 'whiskers', 'wind', 'windmill', 'window', 'wine', 'wing', 'wink', 'wires', 'wizard', 'wood', 'wool', 'wrist', 'yo-yo', 'zebra', 'zigzag'],
      ['ace', 'afro', 'airbag', 'airport', 'alien', 'alone', 'America', 'android', 'anger', 'aquarium', 'armor', 'armpit', 'army', 'art', 'artist', 'asteroid', 'attack', 'attic', 'audience', 'avocado', 'award', 'backache', 'backbone', 'back flip', 'bandana', 'bacon', 'bagpipes', 'bait', 'bake', 'balcony', 'band', 'barber', 'barn', 'baseball', 'batman', 'battery', 'bay', 'beans', 'bear', 'beef', 'beehive', 'bench', 'bib', 'blender', 'blimp', 'blind', 'bonfire', 'bookcase', 'bookmark', 'border', 'bow tie', 'boxing', 'bracelet', 'braces', 'brain', 'brakes', 'bride', 'broccoli', 'brownie', 'buckle', 'bug', 'bull', 'bumper', 'bunny', 'burn', 'burp', 'butcher', 'butter', 'cabin', 'cabinet', 'calf', 'camel', 'camera', 'campfire', 'cane', 'canoe', 'captain', 'car', 'card', 'carnival', 'carpet', 'alien', 'balance', 'Barbie', 'carwash', 'cashier', 'catapult', 'catfish', 'cave', 'caveman', 'CD', 'ceiling', 'celery', 'center', 'chain', 'cheek', 'children', 'chin', 'city', 'clap', 'class', 'cliff', 'climb', 'closet', 'coal', 'cocoon', 'comic', 'cook', 'corner', 'chew', 'club', 'cold', 'cover', 'cowboy', 'crane', 'crash', 'crib', 'crossbow', 'crowbar', 'crush', 'crutches', 'crystal', 'cuddle', 'Cupid', 'curl', 'customer', 'cute', 'cyclops', 'dance', 'dandruff', 'danger', 'dart', 'deaf', 'deck', 'deer', 'defend', 'dentist', 'dentures', 'devil', 'diaper', 'dinosaur', 'diploma', 'disco', 'disease', 'divorce', 'dizzy', 'DJ', 'DNA', 'dock', 'doctor', 'doll', 'dolphin', 'donkey', 'doorbell', 'dove', 'dracula', 'dragon', 'drain', 'dream', 'drench', 'dribble', 'drive', 'drunk', 'duck', 'duel', 'dunk', 'duster', 'dynamite', 'eagle', 'earmuffs', 'earring', 'earwax', 'Easter', 'eclipse', 'eel', 'Eiffel Tower', 'election', 'elmo', 'engine', 'England', 'escape', 'eskimo', 'espresso', 'evil', 'factory', 'fairy', 'farmer', 'fast food', 'father', 'faucet', 'fear', 'fencing', 'fern', 'ferry', 'fever', 'field', 'firewall', 'fireworks', 'first aid', 'flamingo', 'flash', 'flea', 'flight', 'flood', 'floss', 'flour', 'flu', 'flush', 'fog', 'folder', 'fool', 'force', 'forklift', 'fort', 'fountain', 'fox', 'fridge', 'friend', 'frog', 'frosting', 'funeral', 'galaxy', 'gameboy', 'gangster', 'garage', 'garden', 'gardener', 'garlic', 'gas', 'gas mask', 'glee', 'glue', 'goat', 'goggles', 'golem', 'golf cart', 'goose', 'gorilla', 'graduate', 'gravy', 'grill', 'groom', 'gum', 'hail', 'hamster', 'handle', 'harbor', 'headache', 'headset', 'heaven', 'hiking', 'hippo', 'hobo', 'holiday', 'homeless', 'Homer', 'hood', 'hotel', 'hungry', 'hunt', 'hurt', 'hut', 'ink', 'inn', 'insect', 'insomnia', 'iron', 'jacket', 'jail', 'jam', 'javelin', 'jaw', 'jazz', 'jeans', 'jeep', 'jelly', 'Jenga', 'jet', 'jetski', 'jewelry', 'joker', 'judge', 'jungle','junk food', 'kangaroo', 'karate', 'keychain', 'KFC', 'kidney', 'kilt', 'kitchen', 'lab', 'lawyer', 'lead', 'leather', 'lens', 'leopard', 'library', 'limbo', 'link', 'lion', 'Lion King', 'lipstick', 'liquid', 'list', 'lizard', 'lobster', 'lost', 'lotion', 'lovebird', 'luggage', 'lumber', 'lunch', 'lung', 'macaroni', 'magazine', 'magic', 'mailbox', 'mammoth', 'manicure', 'mansion', 'marble', 'marine', 'mario', 'mask', 'meal', 'medicine', 'melt', 'messy', 'minivan', 'minotaur', 'mint', 'mirror', 'missile', 'mittens', 'model', 'mohawk', 'monopoly', 'moo', 'moose', 'morning', 'mosquito', 'motor', 'mud', 'muffin', 'mummy', 'museum', 'music box', 'mustard', 'nachos', 'name', 'napkin', 'navy', 'nerd', 'news', 'night', 'noodle', 'noose', 'nose hair', 'notepad', 'novel', 'nun', 'nurse', 'octopus', 'odor', 'off', 'oil', 'olympics', 'onion', 'online', 'open', 'opera', 'organ', 'origami', 'ostrich', 'outlet', 'oven', 'owl', 'palace', 'palm tree', 'pancake', 'paper bag', 'parade', 'park', 'parrot', 'pass', 'patch', 'paw', 'peacock', 'peanut', 'pearl', 'pegasus', 'perfume', 'pet food', 'phoenix', 'piano', 'pickle', 'picnic', 'picture', 'pigeon', 'Pikachu', 'pilot', 'ping-pong', 'pitcher', 'plug', 'plum', 'plumber', 'poison', 'poke', 'poker', 'polaroid', 'police', 'polka-dot', 'polo', 'pony', 'poor', 'popcorn', 'pork', 'post card', 'poster', 'pounce', 'power', 'pray', 'pregnant', 'pretty', 'pretzel', 'princess', 'pumpkin', 'puppet', 'quack', 'quiet', 'racecar', 'rag', 'rattle', 'rebound', 'record', 'Reddit', 'referee', 'reindeer', 'rhino', 'rifle', 'ringtone', 'ripple', 'roadkill', 'roast', 'robot', 'rock star', 'runway', 'safari', 'sailor', 'scale', 'scar', 'school', 'science', 'scorpion', 'scrabble', 'scratch', 'seafood', 'seagull', 'seal', 'sea sick', 'seat belt', 'seaweed', 'seed', 'sew', 'shampoo', 'shave', 'sheriff', 'shrimp', 'shuttle', 'shy', 'sink', 'sister', 'skeleton', 'skinny', 'skipping rope', 'slam-dunk', 'smartphone', 'smell', 'smoothie', 'snore', 'snorkel', 'sofa', 'soil', 'soldier', 'sombrero', 'soup', 'soysauce', 'sparkles', 'spinach', 'spine', 'splinter', 'squid', 'squirrel', 'stable', 'stadium', 'stain', 'stamp', 'stapler', 'stare', 'Star Wars', 'statue', 'steak', 'steal', 'steep', 'stereo', 'stilts', 'sting', 'stop', 'storm', 'strike', 'students', 'sugar', 'suitcase', 'summer', 'sunburn', 'sunset', 'surf', 'surgeon', 'swan', 'sweet', 'taco', 'tadpole', 'takeoff', 'tango', 'tank', 'tattoo', 'taxi', 'teabag', 'teacher', 'teepee', 'tennis', 'tent', 'tentacle', 'theater', 'thief', 'throne', 'ticket', 'titanic', 'toad', 'toaster', 'toga', 'toilet', 'tomb', 'toolbox', 'tornado', 'torpedo', 'toys', 'tractor', 'traffic', 'tricycle', 'triplets', 'troll', 'tropical', 'trumpet', 'tug', 'tuna', 'turbo', 'turkey', 'tuxedo', 'tweezers', 'twinkle', 'twist', 'ukulele', 'union', 'uppercut', 'urchin', 'usb', 'vacation', 'vaccine', 'vacuum', 'valley', 'vampire', 'vanish', 'vault', 'veil', 'vein', 'velcro', 'venom', 'vent', 'vet', 'victim', 'video', 'viking', 'village', 'vineyard', 'violin', 'virus', 'vitamin', 'voodoo', 'vortex', 'vote', 'waffle', 'wagon', 'waist', 'waiter', 'wake up', 'walrus', 'war', 'wardrobe', 'warrior', 'wart', 'wash', 'wasp', 'waste', 'water bed', 'wattle', 'wax', 'weave', 'wedge', 'weep', 'werewolf', 'whale', 'wheat', 'whiskey', 'whisper', 'whistle', 'wig', 'wiggle', 'wild-fire', 'willow', 'winner', 'winter', 'wireless', 'witch', 'witness', 'wolf', 'wonder', 'work', 'workshop', 'World Cup', 'worm', 'wormhole', 'worry', 'worship', 'wound', 'wreck', 'wrestler', 'wrinkles', 'x-ray', 'yacht', 'yawn', 'yoga', 'young', 'zeppelin', 'Zeus', 'zombie', 'zoo', 'zoom' ],
        ['Africa', 'align', 'arcade', 'ash', 'Asia', 'assassin', 'avatar', 'bingo', 'buffalo', 'burrito', 'carpool', 'casino', 'centaur', 'chart', 'check', 'clay', 'coach',  'concert', 'college', 'court', 'director', 'drake', 'dubstep', 'coward', 'foul', 'goofy', 'gross', 'hobbit', 'hustle', 'journey', 'justice', 'latrine', 'monster', 'ornament', 'reptile', 'risk', 'slimy', 'sorry', 'stern', 'survivor', 'tempest', 'trouble', 'trump', 'weird', 'wicked', 'wise', 'zygote', 'vision', 'loiterer', 'observatory', 'century', 'kilogram', 'neutron', 'stowaway', 'psychologist', 'aristocrat', 'eureka', 'parody', 'cartography', 'figment', 'philosopher', 'tinting', 'overture', 'opaque', 'ironic', 'zero', 'landfill', 'implode', 'armada', 'crisp', 'stockholder', 'inquisition', 'mooch', 'gallop', 'archaeologist', 'blacksmith', 'addendum', 'upgrade', 'acre', 'twang', 'protestant', 'stout', 'quarantine', 'tutor', 'positive', 'champion', 'pastry', 'tournament', 'rainwater', 'random', 'clue', 'flutter', 'slump', 'ligament', 'flotsam', 'siesta', 'pompous', 'raider']);

    this.addTopicList('agile',
      ['waterfall', 'test', 'sprint', 'stand-up', 'story', 'cross', 'delivery', 'integration', 'improvement', 'time-box', 'user', 'product', 'review', 'spike', 'acceptance', 'block', 'chart', 'burndown'],
      ['manager', 'scope', 'organise', 'continuous', 'manifesto', 'management', 'planning poker', 'refactor', 'criteria', 'backlog'],
      ['agile', 'pair programming', 'extreme', 'epic', 'functional', 'retrospective', 'Kanban', 'lean', 'scrum', 'adapt', 'iteration']
    );

    this.addTopicList('food',
      ['Avocados', 'Beetroot', 'Bell peppers', 'Broccoli', 'Cabbage', 'Carrots', 'Cauliflower', 'Corn', 'Cucumbers', 'Eggplant', 'Garlic', 'Green beans', 'Green peas', 'Mushrooms', 'Olive oil', 'Olives', 'Onions', 'Potatoes', 'Spinach', 'Tomatoes', 'Apples', 'Bananas', 'Blueberries', 'Grapefruit', 'Grapes', 'Kiwifruit', 'Lemon', 'Limes', 'Oranges', 'Pears', 'Pineapple', 'Plums', 'Strawberries', 'Watermelon', 'Tuna', 'Almonds', 'Peanuts', 'Walnuts', 'Black beans', 'Dried peas', 'Soy sauce', 'Soybeans', 'Tofu', 'Beef', 'Chicken', 'Lamb', 'Turkey', 'Cheese', 'Milk', 'Eggs', 'Yogurt', 'Barley', 'Brown rice', 'Buckwheat', 'Millet', 'Oats', 'Basil', 'Black pepper', 'Chili pepper', 'Burger', 'Chips', 'Potatoes', 'Cereal', 'spaghetti'],
      ['Asparagus', ' Beet greens', 'Bok choy', ' Brussels sprouts', 'Celery', ' Collard greens', 'Fennel', 'Kale', 'Mustard greens', 'Squash', 'Sweet potatoes', 'Turnip greens', 'Apricots', 'Cantaloupe', 'Cranberries', ' Figs', ' Papaya', ' Prunes', 'Raspberries', '  Cod', ' Salmon', ' Sardines', ' Scallops', ' Shrimp', 'Cilantro', ' Coriander seeds', ' Cinnamon', ' Cloves', ' Cumin seeds', ' Dill', ' Ginger', ' Pumpkin seeds', ' Sunflower seeds', ' Chickpeas', ' Kidney beans', ' Lentils', ' Cashews', 'Flaxseeds', 'Leeks'],
      ['Romaine lettuce', ' Sea vegetables', 'Swiss chard', ' Lima beans', ' Miso', ' Navy beans', ' Pinto beans', 'Quinoa', ' Rye', ' Whole wheat', 'Parsley', ' Peppermint', ' Rosemary', 'Mustard seeds', ' Oregano', '  Sage', ' Thyme', ' Turmeric', ' Sesame seeds', 'Tempeh']
    );
  };

})((typeof process === 'undefined' || !process.versions) ? // Not a node.js environment
  (window.topicList = window.topicList || {})
  : exports);

