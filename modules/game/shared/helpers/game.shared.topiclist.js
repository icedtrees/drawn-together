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
      ['ace', 'acorn', 'add', 'Africa', 'afro', 'airbag', 'airplane', 'airport', 'alarm', 'alien', 'align', 'alone', 'alphabet', 'Amazon', 'America', 'anchor', 'android', 'angel', 'anger', 'animals', 'ankle', 'ant', 'antenna', 'antlers', 'ants', 'ape', 'apple', 'apron', 'aquarium', 'arcade', 'archery', 'arm', 'armor', 'armpit', 'army', 'arrow', 'art', 'artist', 'ash', 'Asia', 'assassin', 'asteroid', 'attack', 'attic', 'audience', 'avatar', 'avocado', 'awake', 'award', 'axe', 'baby', 'back', 'backache', 'backbone', 'back flip', 'backpack', 'bacon', 'badge', 'bag', 'bagpipes', 'bait', 'bake', 'baking', 'balance', 'balcony', 'bald', 'ball', 'balloon', 'bamboo', 'banana', 'band', 'bandaid', 'bandana', 'bank', 'barber', 'Barbie', 'barcode', 'bark', 'barn', 'barrel', 'bart', 'base', 'baseball', 'basket', 'bat', 'bathtub', 'batman', 'battery', 'bay', 'beach', 'beak', 'beans', 'bear', 'beard', 'bed', 'bee', 'beef', 'beehive', 'beer', 'bell', 'belt', 'bench','bib', 'bicycle', 'Bigfoot', 'bike', 'bill', 'bingo', 'bird', 'birdcage', 'birthday', 'black', 'blade', 'blanket', 'blender', 'blimp', 'blind', 'blonde', 'blood', 'blue', 'blush', 'boat', 'bomb', 'bone', 'bonfire', 'booger', 'book', 'bookcase', 'bookmark', 'boot', 'boots', 'border', 'bottle', 'bottom', 'bounce', 'bow', 'bowl', 'bowling', 'bow tie', 'box', 'boxing', 'bracelet', 'braces', 'brain', 'brakes', 'branches', 'bread', 'breath', 'brick', 'bride', 'bridge', 'briefs', 'broccoli', 'broom', 'brownie', 'brush', 'bubble', 'bubbles', 'bucket', 'buckle', 'buffalo', 'bug', 'building', 'bulb', 'bull', 'bullet', 'bullseye', 'bum', 'bumper', 'bunk bed', 'bunny', 'burger', 'burn', 'burp', 'burrito', 'bus', 'butcher', 'butter', 'button', 'cabin', 'cabinet', 'cable', 'cactus', 'caddy', 'cage', 'cake', 'calendar', 'calf', 'camel', 'camera', 'campfire', 'camping', 'can', 'Canada', 'candle', 'candy', 'cane', 'cannon', 'canoe', 'cap', 'cape', 'captain', 'car', 'card', 'cards', 'carnival', 'carpet', 'carpool', 'carrot', 'carwash', 'cashier', 'casino', 'castle', 'cat', 'catapult', 'catfish', 'cave', 'caveman', 'CD', 'ceiling', 'celery', 'cemetery', 'centaur', 'center', 'cereal', 'chain', 'chainsaw', 'chair', 'chalk', 'champ', 'chart', 'check', 'checkers', 'cheek', 'cheese', 'chef', 'cherry', 'chess', 'chest', 'chew', 'chicken', 'children', 'chimney', 'chin', 'China', 'chips', 'church', 'cigar', 'circle', 'circus', 'city', 'clam', 'clap', 'class', 'claw', 'clay', 'cliff', 'climb', 'clock', 'closet', 'cloud', 'clown', 'club', 'coach', 'coal', 'coat', 'coconut', 'cocoon', 'coffee', 'coffin', 'coin', 'cold', 'collar', 'college', 'comb', 'comet', 'comic', 'compass', 'computer', 'concert', 'cone', 'cook', 'cookie', 'cookies', 'cork', 'corn', 'corner', 'couch', 'court', 'cover', 'cow', 'cowboy', 'crab', 'crack', 'crane', 'crash', 'crawl', 'crayon', 'crescent', 'crib', 'crossbow', 'crowbar', 'crown', 'crush', 'crust', 'crutches', 'cry', 'crystal', 'cuba', 'cuddle', 'cup', 'cupcake', 'Cupid', 'curl', 'curtain', 'customer', 'cut', 'cute', 'cyclops', 'dance', 'dandruff', 'danger', 'dart', 'dead', 'deaf', 'death', 'deck', 'deep', 'deer', 'defender', 'dentist', 'dentures', 'desert', 'desk', 'devil', 'diamond', 'diaper', 'dice', 'die', 'dig', 'dimples', 'dinner', 'dinosaur', 'diploma', 'director', 'dirt', 'disco', 'disease', 'dishes', 'diva', 'dive', 'divorce', 'dizzy', 'DJ', 'DNA', 'dock', 'doctor', 'dog', 'dogfish', 'dogsled', 'doll', 'dollar', 'dolphin', 'domino', 'donkey', 'door', 'doorbell', 'doorknob', 'doormat', 'doorstep', 'dots', 'doughnut', 'dove', 'down', 'dracula', 'dragon', 'drain', 'drake', 'drapes', 'draw', 'drawer', 'dream', 'dress', 'dresser', 'dribble', 'drill', 'drink', 'drip', 'drive', 'drum', 'drummer', 'drum set', 'drunk', 'dubstep', 'duck', 'duel', 'dumbbell', 'dumbo', 'dunk', 'duster', 'dustpan', 'dynamite', 'eagle', 'ear', 'earmuffs', 'earring', 'Earth', 'earwax', 'east', 'Easter', 'eat', 'echo', 'eclipse', 'edge', 'eel', 'egg', 'eggplant', 'egg roll', 'elbow', 'election', 'elephant', 'elevator', 'elmo', 'elvis', 'emerald', 'empty', 'end', 'engine', 'England', 'envelope', 'eraser', 'escape', 'eskimo', 'espresso', 'Europe', 'evil', 'explode', 'eye', 'eyeball', 'eyebrow', 'eyelash', 'eyelid', 'eyepatch', 'face', 'Facebook', 'factory', 'fairy', 'fall', 'family', 'fan', 'fangs', 'farm', 'farmer', 'fart', 'fast food', 'father', 'faucet', 'fear', 'feather', 'feet', 'female', 'fence', 'fencing', 'fern', 'ferry', 'fever', 'field', 'fight', 'fin', 'finger', 'fire', 'fireball', 'Firefox', 'firewall', 'firewood', 'firework', 'first', 'first-aid', 'fish', 'fishing', 'fist', 'flag', 'flame', 'flamingo', 'flash', 'flat', 'flea', 'flight', 'flood', 'floor', 'floss', 'flour', 'flower', 'flu', 'flush', 'fly', 'fog', 'folder', 'fool', 'foot', 'football', 'force', 'forehead', 'forest', 'fork', 'forklift', 'fort', 'forward', 'foul', 'fountain', 'fox', 'fraction', 'frame', 'france', 'freezing', 'fridge', 'friend', 'frisbee', 'frog', 'frosting', 'frown', 'fruit', 'funeral', 'funnel', 'fur', 'galaxy', 'game-boy', 'gangster', 'garage', 'garden', 'gardener', 'garlic', 'gas', 'gas mask', 'gate', 'gears', 'gem', 'germ', 'Germany', 'ghost', 'gift wrap', 'giraffe', 'girl', 'glass', 'glasses', 'glee', 'globe', 'glove', 'glue', 'goal', 'goalie', 'goal post', 'goat', 'goggles', 'gold', 'goldfish', 'golem', 'golf', 'golf cart', 'golf club', 'goofy', 'Google', 'goose', 'gorilla', 'grade', 'graduate', 'grandmother', 'grandfather', 'grapes', 'graph', 'grass', 'grave', 'gravy', 'green', 'grenade', 'grid', 'griffin', 'grill', 'grin', 'groom', 'gross', 'guitar', 'gum', 'gun', 'hail', 'hair', 'haircut', 'hair dye', 'hair gel', 'hair tie', 'hairy', 'halo', 'ham', 'hammer', 'hammock', 'hamster', 'hand', 'handbag', 'handball', 'handcuff', 'handgun', 'handle', 'hanger', 'hangman', 'happy', 'harbor', 'hare', 'harp', 'hat', 'hawaii', 'head', 'headache', 'head band', 'headset', 'hear', 'heart', 'heat', 'heaven', 'heel', 'helmet', 'high five', 'hiking', 'hill', 'hip-hop', 'hippo', 'hobbit', 'hobo', 'hockey', 'holiday', 'home', 'homeless', 'Homer', 'home run', 'homework', 'honey', 'Hong Kong', 'hood', 'hook', 'hoop', 'hop', 'horn', 'horse', 'hose', 'hospital', 'hot', 'hot dog', 'hotel', 'hot sauce', 'hot tub', 'house', 'hug', 'hula hoop', 'hulk', 'hummer', 'hungry', 'hunt', 'hurt', 'husband', 'hustle', 'hut', 'ice', 'iceberg', 'icebox', 'ice cube', 'ice skate', 'icicle', 'icing', 'idea', 'igloo', 'ink', 'inn', 'insect', 'insomnia', 'iPad', 'iPhone', 'ireland', 'iron', 'island'],
      ['jacket', 'jail', 'jam', 'Japan', 'jar', 'javelin', 'jaw', 'jaws', 'jazz', 'jeans', 'jeep', 'jello', 'jelly', 'Jenga', 'jersey', 'jet', 'jet-ski', 'jewelry', 'jigsaw', 'joker', 'journey', 'joy stick', 'judge', 'jug', 'juggle', 'juice', 'jump', 'jungle', 'junk food', 'Jupiter', 'justice', 'kangaroo', 'karate', 'ketchup', 'key', 'keyboard', 'keychain', 'KFC', 'kick', 'kidney', 'killer', 'kilt', 'king', 'kiss', 'kitchen', 'kite', 'kitten', 'knee', 'kneecap', 'knee-pad', 'knife', 'knitting', 'knives', 'knock', 'knot', 'knuckle', 'koala', 'Korea', 'lab', 'ladder', 'lady', 'ladybug', 'lake', 'lamb', 'lamp', 'lamprey', 'lap', 'laptop', 'laser', 'lasso', 'latrine', 'laugh', 'laughing', 'lava', 'lawyer', 'lead', 'leaf', 'leak', 'leash', 'leather', 'left', 'leg', 'lemon', 'lemonade', 'lemons', 'lens', 'leopard', 'letter', 'library', 'lick', 'lid', 'lift', 'light', 'lighter', 'limbo', 'lime', 'line', 'link', 'lion', 'Lion King', 'lip', 'lips', 'lipstick', 'liquid', 'lisa', 'list', 'lizard', 'lobster', 'lock', 'locket', 'log', 'London', 'long', 'long-jump', 'loop', 'lost', 'lotion', 'love', 'lovebird', 'low', 'luge', 'luggage', 'lumber', 'lunch', 'lung', 'lyrics', 'macaroni', 'magazine', 'magic', 'magician', 'magnet', 'mail', 'mailbox', 'mailman', 'makeup', 'mall', 'mammoth', 'mango', 'manicure', 'mansion', 'map', 'marble', 'marine', 'mario', 'markers', 'marriage', 'marry', 'Mars', 'martini', 'mask', 'massage', 'mat', 'mattress', 'maze', 'meal', 'meat', 'meatball', 'medal', 'medicine', 'melt', 'melting', 'meow', 'Mercury', 'mermaid', 'messy', 'meteor', 'meter', 'middle', 'milk', 'milkman', 'minivan', 'minotaur', 'mint', 'mirror', 'missile', 'mittens', 'model', 'mohawk', 'money', 'monkey', 'monopoly', 'monster', 'moo', 'moon', 'moose', 'mop', 'morning', 'mosquito', 'mother', 'motor', 'mountain', 'mouse', 'mouth', 'mud', 'muffin', 'mug', 'multiply', 'mummy', 'muscle', 'museum', 'mushroom', 'music', 'music box', 'mustache', 'mustard', 'nachos', 'nail', 'nail file', 'name', 'napkin', 'navy', 'neck', 'necklace', 'needle', 'Neptune', 'nerd', 'nest', 'net', 'news', 'New York', 'nickel', 'night', 'nike', 'ninja', 'no', 'noodle', 'noose', 'north', 'nose', 'nose hair', 'nose-ring', 'nostril', 'notebook', 'notepad', 'novel', 'number', 'nun', 'nurse', 'nut', 'oar', 'oars', 'oatmeal', 'ocean', 'octagon', 'octopus', 'odor', 'off', 'oil', 'oilfield', 'olympics', 'omelet', 'onion', 'online', 'open', 'opera', 'orange', 'orbit', 'organ', 'origami', 'ornament', 'ostrich', 'outlet', 'oval', 'oven', 'overflow', 'overtime', 'owl', 'pacifier', 'Pacman', 'paddle', 'padlock', 'page', 'paint', 'paint can', 'painter', 'painting', 'pajamas', 'palace', 'palm', 'palm tree', 'pancake', 'panda', 'pants', 'paper', 'paper bag', 'paper-cut', 'parade', 'parents', 'Paris', 'park', 'parrot', 'party-hat', 'pass', 'password', 'patch', 'path', 'patriots', 'paw', 'peace', 'peach', 'peaches', 'peacock', 'peanut', 'pear', 'pearl', 'peas', 'pedal', 'pee', 'pegasus', 'pen', 'pencil', 'penguin', 'penny', 'pepper', 'perfume', 'person', 'pet', 'petal', 'pet food', 'phoenix', 'phone', 'piano', 'pickle', 'picnic', 'picture', 'pie', 'pie-chart', 'pig', 'pigeon', 'Pikachu', 'pill', 'pillow', 'pilot', 'pimple', 'pin', 'ping-pong', 'pink', 'pinwheel', 'pipe', 'pirate', 'pistol', 'pitcher', 'pitfall', 'pizza', 'plane', 'planet', 'plant', 'plate', 'plug', 'plum', 'plumber', 'plunger', 'Pluto', 'pocket', 'poison', 'poke', 'poker', 'polaroid', 'police', 'polka-dot', 'polo', 'pong', 'pony', 'ponytail', 'poodle', 'pool', 'poop', 'poor', 'popcorn', 'popsicle', 'pork', 'porsche', 'portrait', 'positive', 'post card', 'poster', 'pot', 'potato', 'pouch', 'pounce', 'powder', 'power', 'pray', 'pregnant', 'presents', 'pretty', 'pretzel', 'price tag', 'prince', 'princess', 'print', 'prism', 'prison', 'puddles', 'puke', 'pull', 'pumpkin', 'punch', 'puppet', 'puppy', 'purse', 'push', 'push up', 'puzzle', 'pyramid', 'quack', 'quarter', 'queen', 'quiet', 'quilt', 'rabbit', 'raccoon', 'race', 'racecar', 'radar', 'radio', 'raft', 'rag', 'raider', 'railroad', 'rain', 'rainbow', 'raincoat', 'rain drop', 'raisin', 'rake', 'ramp', 'rap', 'rapture', 'rat', 'rattle', 'razor', 'rebound', 'record', 'recycle', 'red', 'Reddit', 'red-head', 'referee', 'reindeer', 'reptile', 'rest', 'rhino', 'ribbon', 'ribs', 'rice', 'ride', 'rifle', 'rim', 'ring', 'ring-tone', 'ripple', 'risk', 'river', 'road', 'roadkill', 'roast', 'robber', 'robe', 'robot', 'rock', 'rocket', 'rock star', 'roll', 'roof', 'rooster', 'root', 'rope', 'rose', 'round', 'row', 'rowboat', 'ruby', 'rug', 'ruler', 'runway', 'Russia', 'sack', 'sad', 'saddle', 'safari', 'sail', 'sailor', 'salad', 'salami', 'salsa', 'salt', 'samba', 'sand', 'sandals', 'sandbox', 'sandwich', 'santa', 'sapphire', 'Saturn', 'sausage', 'saw', 'scale', 'scar', 'scarf', 'school', 'science', 'scissors', 'scooter', 'scorpion', 'Scotland', 'scrabble', 'scratch', 'scream', 'screen', 'screw', 'sea', 'seafood', 'seagull', 'seahorse', 'seal', 'sea shell', 'sea sick', 'seat', 'seat belt', 'seaweed', 'seed', 'seesaw', 'sew', 'shade', 'shadow', 'shampoo', 'shape', 'shark', 'sharp', 'shave', 'sheep', 'sheets', 'shelf', 'shell', 'sheriff', 'shield', 'shin', 'ship', 'shirt', 'shoe', 'shoe box', 'shoelace', 'shoes', 'shoot', 'shore', 'short', 'shorts', 'shot', 'shotgun', 'shoulder', 'shovel', 'shower', 'shrimp', 'shuttle', 'shy', 'sideburn', 'sidewalk', 'simon', 'sing', 'singer', 'sink', 'sister', 'sit', 'six-pack', 'skate', 'skater', 'skeleton', 'ski', 'skiing', 'skin', 'skinny', 'skipping rope', 'skirt', 'skis', 'skull', 'skunk', 'sky', 'skyline', 'slam', 'slam-dunk', 'slap', 'sled', 'sledding', 'sleep', 'sleigh', 'slide', 'slimy', 'slip', 'slippers','slope', 'small', 'smell', 'smile', 'smoke', 'smoking', 'smoothie', 'snail', 'snake', 'sneakers', 'sneeze', 'sniper', 'snoopy', 'snore', 'snorkel', 'snow', 'snowball', 'snowman', 'soap', 'soccer', 'sock', 'socket', 'socks', 'soda', 'sofa', 'soil', 'soldier', 'sombrero', 'son', 'song', 'sonic', 'sorry', 'soup', 'south', 'soysauce', 'spain', 'sparkles', 'speak', 'speaker', 'spear', 'spider', 'spin', 'spinach', 'spine', 'spiral', 'spit', 'splinter', 'sponge', 'spoon', 'spray', 'spring', 'sprite', 'square', 'squid', 'squirrel', 'stable', 'stadium', 'stage', 'stain', 'stairs', 'stamp', 'stapler', 'star', 'stare', 'starfish', 'Star Wars', 'statue', 'steak', 'steal', 'steam',  'steep', 'step', 'stereo', 'stern', 'stilts', 'sting', 'stomach', 'stone', 'stool', 'stop', 'stork', 'storm', 'stove', 'straight', 'straw', 'straw-man', 'stream', 'street', 'strike', 'string', 'stripe', 'stroller', 'students', 'stump', 'sudoku', 'sugar', 'suitcase', 'summer', 'sun', 'sunblock', 'sunburn', 'sunny', 'sunset', 'sunshine', 'surf', 'surfing', 'surgeon', 'survivor', 'sushi', 'swan', 'sweat', 'sweater', 'sweaty', 'sweet', 'swim', 'swimming', 'swimsuit', 'swing', 'swings', 'switch', 'sword', 'syrup'],
      ['table', 'taco', 'tacos', 'tadpole', 'tag', 'tail', 'take-off', 'tall', 'tango', 'tank', 'tape', 'target', 'tattoo', 'taxi', 'tea', 'teabag', 'teacher', 'teapot', 'teardrop', 'tears', 'teaspoon', 'teenager', 'teepee', 'teeth', 'tempest', 'tennis', 'tent', 'tentacle', 'test', 'Tetris', 'theater', 'thief', 'thigh', 'thin', 'thorn', 'throat', 'throne', 'throw', 'thumb', 'thunder', 'ticket', 'tickle', 'tie', 'tiger', 'tiles', 'time', 'time-line', 'timeout', 'timezone', 'tire', 'tissue', 'titanic', 'toad', 'toast', 'toaster', 'toe', 'toe-nail', 'toga', 'toilet', 'tomato', 'tomb', 'tongue', 'tool', 'toolbox', 'tools', 'tooth', 'torch', 'tornado', 'torpedo', 'tortoise', 'tower', 'toys', 'tractor', 'traffic', 'train', 'trapdoor', 'trash', 'trashcan', 'tray', 'tree', 'triangle', 'tricycle', 'triplets', 'tripod', 'troll', 'trombone', 'trophy', 'tropical', 'trouble', 'truck', 'trump', 'trumpet', 'trunk', 't-shirt', 'tuba', 'tuesday', 'tug', 'tugboat', 'tummy', 'tuna', 'tune', 'tunnel', 'turbo', 'turkey', 'turtle', 'tusk', 'tuxedo', 'TV', 'tweezers', 'twig', 'twilight', 'twinkle', 'twins', 'twist', 'Twitter', 'udder', 'UFO', 'ugly', 'ukulele', 'umbrella', 'under', 'unicorn', 'unicycle', 'union', 'unzip', 'uppercut', 'upstairs', 'urchin', 'USA', 'usb', 'vacation', 'vaccine', 'vacuum', 'vader', 'valley', 'vampire', 'van', 'vanish', 'vase', 'vault', 'veil', 'vein', 'velcro', 'venom', 'vent', 'vertical', 'vest', 'vet', 'vice', 'victim', 'video', 'viking', 'village', 'vine', 'vineyard', 'viola', 'violin', 'virus', 'vitamin', 'voice', 'volcano', 'volume', 'vomit', 'voodoo', 'vortex', 'vote', 'waffle', 'wagon', 'waist', 'waiter', 'waitress', 'wake up', 'walk', 'wall', 'wallet', 'walrus', 'wand', 'war', 'wardrobe', 'warrior', 'wart', 'wash', 'wasp', 'waste', 'watch', 'water', 'water bed', 'water-gun', 'wattle', 'wave', 'wax', 'weak', 'weave', 'wedding', 'wedge', 'wedgie', 'weed', 'week', 'weep', 'weights', 'weird', 'well', 'werewolf', 'west', 'wet', 'whale', 'wheat', 'wheel', 'whip', 'whiskers', 'whiskey', 'whisper', 'whistle', 'white', 'wicked', 'widget', 'widow', 'wife', 'wig', 'wiggle', 'wild-fire', 'willow', 'wimp', 'winch', 'wind', 'windmill', 'window', 'windows', 'wine', 'wing', 'wink', 'winner', 'winter', 'wire', 'wireless', 'wires', 'wise', 'witch', 'witness', 'wizard', 'wolf', 'woman', 'wonder', 'wood', 'wool', 'work', 'workshop', 'World Cup', 'worm', 'wormhole', 'worry', 'worship', 'wound', 'wow', 'wreck', 'wrench', 'wrestler', 'wrinkles', 'wrist', 'writing', 'x-ray', 'yacht', 'yarn', 'yawn', 'yellow', 'yield', 'yoga', 'yogurt', 'young', 'YouTube', 'yo-yo', 'zebra', 'zeppelin', 'Zeus', 'zigzag', 'zip-line', 'zipper', 'zombie', 'zoo', 'zoom', 'zygote']
    );

    this.addTopicList('agile',
      ['waterfall', 'test', 'sprint', 'stand-up', 'story', 'cross', 'delivery', 'integration', 'improvement', 'time-box', 'user', 'product', 'review', 'spike', 'acceptance', 'block', 'chart', 'burn-down'],
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

