console.log('content.js loaded');

const SCROLLS = [
  {
    id: "intro",
    title: "Chapter I - The Letter Begins",
    body: `Hello weary traveler! You have uncovered the first scroll in the Xmas Letter Chronicles. You are wise beyond your years, but…not by much. 

David, Sarah, and Booker had a FULL year. The big news was Booker graduated from Pre-K and has now moved to Carnation Elementary. He loves legos, World War II, Roman soldiers, and weapons. My favorite moments are when he’s hanging out with other kids and warns them about the dangers of high fructose corn syrup and fake food. He got lots of time to hang out with Bapa(Sarah’s dad), and Grandma & Grandpa(my dad and stepmom). 

Most importantly of all, Booker’s now seen the original trilogy of Star Wars. So we’ve done our job. Please venture on, as each scroll you discover represents a chapter of our story...`,
    images: [
      {
        src: "/images/booker-1.gif",
        alt: "If we loved him less, we'd have him model",
        enhancedSrc: "/images/booker-1-enhanced.jpg",

        visible: true
      },{
        src: "/images/booker-4.gif",
        alt: "Booker has graduated from Pre-K!",
        enhancedSrc: "/images/booker-4-enhanced.jpg",

        visible: true
      },{
        src: "/images/booker-9.gif",
        alt: "Booker & Bapa!",
        enhancedSrc: "/images/booker-9-enhanced.jpg",
        visible: true
      },{
        src: "/images/booker-11.gif",
        alt: "Booker with Grandma & Grandpa",
        enhancedSrc: "/images/booker-11-enhanced.jpg",
        visible: true
      },{
        src: "/images/star-wars.gif",
        alt: "Of course we dressed up to see Star Wars!",
        enhancedSrc: "/images/star-wars-enhanced.jpg",
        visible: true
      }
    ]
  },
  {
    id: "spring",
    title: "Chapter II - Booker's 6th Birthday at the Cowboy Corral",
    body: `Continuing our tradition of accidentally raising a kid in the 1950’s, Booker’s birthday was Cowboy themed. Mommy *blew everyone away* with the setup. There were 6 stations of activities and every kid got a handmade hobby horse(by Sarah), a hand sewn vest(by Sarah), a sheriff’s badge, a cowboy hat, pistols and holsters, and plenty of ways to decorate. The preparation time was 2 months and continues to blow my mind. It was so awesome, the venue asked if we could send them photos of our party so they could use them in their marketing material.`,
    images: [
      {
        src: "/images/booker-6.gif",
        alt: "Booker, at his birthday party, looking dapper in his cowboy attire",
        enhancedSrc: "/images/booker-6-enhanced.jpg",
        visible: true
      },
      {
        src: "/images/booker-5.gif",
        alt: "Hobby horses galore at Booker's cowboy party",
        enhancedSrc: "/images/booker-5-enhanced.jpg",
        visible: true
      },
      {
        src: "/images/booker-7.gif",
        alt: "Customized cornhole game, Snake in the Hole",
        enhancedSrc: "/images/booker-7-enhanced.jpg",
        visible: true
      },
      {
        src: "/images/booker-8.gif",
        alt: "Utter cowboy chaos! Remarkably, no tears were shed.",
        enhancedSrc: "/images/booker-8-enhanced.jpg",
        visible: true
      }
    ]
  },
  {
    id: "summer",
    title: "Chapter III - Sarah's Summer Adventures",
    body: `Sarah has been shouldering all the parenting duties this year, ranging from kid get togethers, cub scouts, to rebuilding the deck of the house. There is often a new cardboard helmet…or tank sitting in the living room. She traveled to California to care for her mom when she had open heart sugery. Meanwhile, she’s kept everything running on the home front with the efficiency of a small city government. At this point, we’re fairly sure she could build a functioning battleship out of cardboard if someone asked. There is no way that I could do what I do without her, uncomfortably so, so I’m endlessly grateful.`,
    images: [
      {
        src: "/images/sarah-1.gif",
        alt: "Sarah looking baller",
        enhancedSrc: "/images/Sarah-1-enhanced.jpg",
        visible: true
      },{
        src: "/images/sarah-2.gif",
        alt: "The 3 of us at the incredible party Sarah put together",
        enhancedSrc: "/images/sarah-2-enhanced.jpg",
        visible: true
      },{
        src: "/images/sarah-3.gif",
        alt: "Jeering the opposing jouster at the Renaissance Faire",
        enhancedSrc: "/images/sarah-3-enhanced.jpg",
        visible: true
      }
    ]
  },
  {
    id: "autumn",
    title: "Chapter IV - David's Travels & Holiday Reflections",
    body: `David still loves working at Microsoft and has now moved to the Microsoft AI division, where he is working on both Copilot and GroupMe, the chat app(If you haven’t heard of it, that means your kid isn’t in youth sports OR you’re not in college ;) ). Work travel is slowly returning to normal, and he was fortunate enough flew to New York and San Francisco to meet with coworkers.
    \n\n
    Of all the years, this may be the longest. Through all the health challenges, raising Booker, and work stress, I feel incredibly grateful for the stability and love in our lives. I know we're doing something right, since Sarah and Booker are the best improv partners I've ever had. I hope you and yours have a wonderful holiday season, a happy new year, and find that perfect improv partner in your life!
    
    Cheers, David, Sarah, and Booker`,
    images: [
      {
        src: "/images/david-1.gif",
        alt: "David and Booker in some random coffee shop",
        enhancedSrc: "/images/david-1-enhanced.jpg",
        visible: true
      },{
        src: "/images/david-2.gif",
        alt: "David at the Hiller Aviation Museum",
        enhancedSrc: "/images/david-2-enhanced.jpg",
        visible: true
      },
      {
        src: "/images/david-3.gif",
        alt: "The Microsoft offices in NYC were awesome!",
        enhancedSrc: "/images/david-3-enhanced.jpg",
        visible: true
      },
      {
        src: "/images/david-4.gif",
        alt: "David with Oma, Opa, and Uncle Eric",
        enhancedSrc: "/images/david-4-enhanced.jpg",
        visible: true
      }
    ]
  }
];

const MAP = {
  vestibule: {
    id: "vestibule",
    name: "Snowy Vestibule",
    description: `You stand in a grand vestibule, its floor covered with freshly fallen snow that somehow remains perfectly pristine. You get the sense that Mariah Carey is thawing nearby, humming a festive tune.

Fun fact: Part of why I wanted to make this an interactive card this year is the open sourcing of the game ZORK. ZORK was one of the first text adventure game for the personal computer. Ernie, my stepdad, was their first program manager and is one of the creatures in the game, the brogmoid. So, in a way, this game is a tribute to him and all the fun I had playing ZORK as a kid.

A PRIMER FOR NEW TRAVELERS: type LOOK to re-read the room, EXAMINE anything curious, TAKE items, and INVENTORY to check your pockets. Use N/S/E/W to move, and type HELP or G for more commands.

To the NORTH, a corridor lined with red and white striped pillars beckons. To the EAST, you see a heavy oak door bound with iron. To the SOUTH, warm candlelight spills from a holly-strung cavern where a friendly brogmoid jingles with a golden key.`,
    exits: {
      north: "corridor",
      east: "vault",
      south: "grotto"
    },
    examined: {
      snow: "The snow sparkles with an otherworldly light, as if each flake contains a tiny star.",
      icicles: "The icicles chime softly, creating an ethereal melody."
    },
    clue: "A gopher suddenly pops their head out from the ground, wearing a Santa hat. The gopher stares blankly at you and then speaks, 'Head SOUTH to meet the brogmoid, and his golden key will open that oak door EAST. Literally type 'use key'. Type HELP if you blank on the commands.' After a pregnant pause, he scurries back into his snowy burrow.",
  },

  corridor: {
    id: "corridor",
    name: "Candy Cane Corridor",
    descriptionSections: {
      intro: `The ancient corridor stretches before you, its vaunted walls adorned with massive red and white striped pillars that spiral toward the ceiling. The air smells of peppermint and pine. A marble pedestal gleams at the center of the room.`,
      directions: `You can go SOUTH to return to the vestibule, or continue NORTH toward a green glow.`
    },
    exits: {
      south: "vestibule",
      north: "altar"
    },
    items: ["scroll_intro"],
    examined: {
      scroll_intro: "An ancient scroll sealed with red wax bearing a snowflake emblem.",
      pillars: "The striped pillars are smooth and cold to the touch, spiraling upward like candy canes. You think about licking them, but you saw A Christmas Story once.",
      candles: "The candles flicker but their wax never drips. Magic sustains them."
    },
    clue: "The Ghost of Christmas Letters You Never Read floats by and moans, 'Examine the pedestal and read what you find.'",
    dynamicDescription: function(gameState) {
      const items = gameState.roomItems?.[this.id] || [];
      const hasScroll = items.includes('scroll_intro');

      const intro = this.descriptionSections?.intro || this.description;
      const pedestal = this.descriptionSections?.pedestal || '';
      const directions = this.descriptionSections?.directions || '';

      const lines = [intro];
      if (pedestal) lines.push(pedestal);

      if (hasScroll) {
        lines.push("An ancient scroll rests upon the pedestal, waiting to be claimed.");
      } else {
        lines.push("The pedestal stands empty now, dusted with a faint shimmer of frost.");
      }

      if (directions) lines.push(directions);

      return lines.join('\n\n');
    }
  },

  grotto: {
    id: "grotto",
    name: "Candlelit Carol Grotto",
    description: `You step into a low cavern trimmed with holly and evergreen boughs. A brogmoid lounges on a pile of gift sacks. Brogmoids are squat creatures that in rare cases can achieve the intelligence level of a three-year-old human. He shrugs and says, 'Hey, uhh, sorry, my Santa costume is at the cleaners.' He jingles idly and eyes you with curiosity. He claims the golden key he found opens every lock in this place.

The NORTH passage returns to the vestibule.`,
    exits: {
      north: "vestibule"
    },
    items: ["gold_key"],
    examined: {
      gold_key: "A golden key carved with snowflakes and tiny bells. The brogmoid holds it out to you with a knowing grin. He insists it opens both the oak door and whatever treasure waits beyond.",
      brogmoid: "Plump and furry with tufts, the brogmoid loves swapping shiny things for stories. He offers you the key without asking for payment—holiday generosity, perhaps."
    },
    dynamicDescription: function(gameState) {
      const items = gameState.roomItems?.[this.id] || [];
      const hasKey = items.includes('gold_key');
      const lines = [this.description];

      if (hasKey) {
        lines.push("The brogmoid jingles merrily and offers you the golden key, no strings attached.");
      } else {
        lines.push("The brogmoid waves cheerfully, his paws now free of the key he shared.");
      }

      return lines.join('\n\n');
    }
  },

  vault: {
    id: "vault",
    name: "Gift-Wrapped Vault",
    description: `You enter a circular chamber whose walls are covered in shimmering wrapping paper—golds, silvers, and deep reds reflecting the soft glow of hanging lanterns. It is, indeed, a holly, jolly Christmas.

In the center sits an ornate chest bound with a golden ribbon. The WEST leads back to the vestibule.`,
    exits: {
      west: "vestibule"
    },
    items: ["scroll_summer"],
    examined: {
      chest: "The chest is made of dark wood inlaid with mother-of-pearl snowflakes. It's sealed with a golden ribbon and a delicate golden lock shaped like a snowflake.",
      scroll_summer: "A scroll that feels warm to the touch, sealed with golden wax.",
      ribbons: "The ribbons shimmer and flow like water, never quite still."
    },
    clue: "Unlock the vault, then use the golden key to open the chest and claim the summer heat and autumn hush awaiting inside.",
    dynamicDescription: function(gameState) {
      const items = gameState.roomItems?.[this.id] || [];
      const hasSummer = items.includes('scroll_summer');
      const hasAutumn = items.includes('scroll_autumn');
      const parts = [this.description];

      if (gameState.chestUnlocked) {
        parts.push("The chest stands open, its ribbon slack. A soft golden light spills from within.");
      } else {
        parts.push("The chest's golden lock glints, clearly awaiting a matching key.");
      }

      const visibleScrolls = [];
      if (hasSummer) visibleScrolls.push('a summer scroll');
      if (hasAutumn) visibleScrolls.push('an autumn scroll');
      if (visibleScrolls.length) {
        parts.push(`You spot ${visibleScrolls.join(' and ')} nestled among the ribbons.`);
      }

      return parts.join('\n\n');
    },
    locked: true,
    lockDescription: "The vault door is sealed tight. You'll need to find a way to open it."
  },

  altar: {
    id: "altar",
    name: "Evergreen Altar",
    description: `You stand in a sacred chamber dominated by an enormous evergreen tree that seems to grow directly from the stone floor. Its branches reach toward a star-shaped opening in the ceiling, through which moonlight pours like liquid silver.

At the base of the tree is a stone altar covered in holly and ivy.

The SOUTH passage returns to the corridor.`,
    exits: {
      south: "corridor"
    },
    items: ["scroll_spring"],
    examined: {
      tree: "The evergreen is ancient and majestic, its needles shimmering with frost. Small lights dance among its branches—whether fireflies or magic, you cannot tell.",
      altar: "The stone altar is carved with intricate patterns of leaves and berries. Words in an ancient script read: 'Here ends one journey, and begins another.'",
      scroll_spring: "A scroll decorated with pressed flowers and tied with a green ribbon, exuding the scent of thawing earth.",
      star: "Through the star-shaped opening, you can see the night sky filled with more stars than you've ever seen before."
    },
    clue: "Gather all four scrolls, read them, and the holiday surprise will reveal itself no matter where you stand.",
    dynamicDescription: function(gameState) {
      const items = gameState.roomItems?.[this.id] || [];
      const hasScroll = items.includes('scroll_spring');
      const parts = [this.description];

      if (hasScroll) {
        parts.push("A verdant scroll glows softly upon the altar.");
      }

      return parts.join('\n\n');
    },
    onEnter: function(gameState) {
      if (gameState.scrollsRead.length === 4 && !gameState.completedGame) {
        return "As you enter, the evergreen tree begins to glow with soft light. The scrolls you've collected resonate with power—READ them whenever you're ready to finish the tale.";
      }
      return null;
    }
  }
};

const SCROLL_MAP = {
  scroll_intro: "intro",
  scroll_spring: "spring",
  scroll_summer: "summer",
  scroll_autumn: "autumn"
};

const END_IMAGES = [
  {
    src: "/images/winner-pix-1.gif",
    alt: "Game time",
    enhancedSrc: "/images/winner-pix-1-enhanced.jpg"
  },
  {
    src: "/images/winner-2.gif",
    alt: "Cub scouts",
    enhancedSrc: "/images/winner-2-enhanced.jpg"
  },
  {
    src: "/images/winner-3.gif",
    alt: "First day of kindergarten",
    enhancedSrc: "/images/winner-3-enhanced.jpg"
  },
  {
    src: "/images/winner-4.gif",
    alt: "Just a random shot of the fam",
    enhancedSrc: "/images/winner-4-enhanced.jpg"
  }
];

const HAPPY_HOLIDAYS_ASCII = `
 _    , __  _ __  _ __  _    ,   _   , _ _ _   __  ()  
' )  / /  )' )  )' )  )' )  /   ' \\ / ' ) ) ) /  ) /\\  
 /--/ /--/  /--'  /--'  /  /       X   / / / /--/ /  ) 
/  (_/  (_ /     /     (__/_      / \\_/ ' (_/  (_/__/__
                        //                             
                       (/                              
`;
