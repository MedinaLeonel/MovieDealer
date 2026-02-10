import type { Movie } from '../lib/types';

export const FAKE_MOVIES: Movie[] = [
    // --- LEVEL 1: CHILL (Mainstream Blockbusters) ---
    {
        id: 101,
        title: "Avatar",
        year: 2009,
        rating: 7.5,
        poster: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        genre: ["Sci-Fi", "Action"],
        director: "James Cameron",
        overview: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
        difficulty: 1
    },
    {
        id: 102,
        title: "The Avengers",
        year: 2012,
        rating: 8.0,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Avengers",
        genre: ["Action", "Sci-Fi"],
        director: "Joss Whedon",
        overview: "Earth's mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.",
        difficulty: 1
    },
    {
        id: 103,
        title: "Frozen",
        year: 2013,
        rating: 7.4,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Frozen",
        genre: ["Animation", "Family"],
        director: "Chris Buck, Jennifer Lee",
        overview: "When the newly-crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.",
        difficulty: 1
    },
    {
        id: 104,
        title: "Titanic",
        year: 1997,
        rating: 7.9,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Titanic",
        genre: ["Romance", "Drama"],
        director: "James Cameron",
        overview: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
        difficulty: 1
    },
    {
        id: 105,
        title: "Harry Potter and the Sorcerer's Stone",
        year: 2001,
        rating: 7.6,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Harry+Potter+and+the+Sorcerer's+Stone",
        genre: ["Fantasy", "Family"],
        director: "Chris Columbus",
        overview: "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
        difficulty: 1
    },
    {
        id: 106,
        title: "Barbie",
        year: 2023,
        rating: 7.0,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Barbie",
        genre: ["Comedy", "Adventure"],
        director: "Greta Gerwig",
        overview: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
        difficulty: 1
    },

    // --- LEVEL 2: QUE VER? (Popular but slightly more depth) ---
    {
        id: 201,
        title: "Interstellar",
        year: 2014,
        rating: 8.6,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Interstellar",
        genre: ["Sci-Fi", "Drama"],
        director: "Christopher Nolan",
        overview: "Explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        difficulty: 2
    },
    {
        id: 202,
        title: "Inception",
        year: 2010,
        rating: 8.8,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Inception",
        genre: ["Sci-Fi", "Action"],
        director: "Christopher Nolan",
        overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        difficulty: 2
    },
    {
        id: 203,
        title: "The Wolf of Wall Street",
        year: 2013,
        rating: 8.2,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Wolf+of+Wall+Street",
        genre: ["Biography", "Comedy"],
        director: "Martin Scorsese",
        overview: "Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker living the high life to his fall involving crime, corruption and the federal government.",
        difficulty: 2
    },
    {
        id: 204,
        title: "Dune: Part Two",
        year: 2024,
        rating: 8.5,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Dune:+Part+Two",
        genre: ["Sci-Fi", "Action"],
        director: "Denis Villeneuve",
        overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        difficulty: 2
    },
    {
        id: 205,
        title: "Joker",
        year: 2019,
        rating: 8.4,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Joker",
        genre: ["Crime", "Drama"],
        director: "Todd Phillips",
        overview: "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.",
        difficulty: 2
    },
    {
        id: 206,
        title: "Knives Out",
        year: 2018,
        rating: 7.9,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Knives+Out",
        genre: ["Mystery", "Comedy"],
        director: "Rian Johnson",
        overview: "A detective investigates the death of a patriarch of an eccentric, combative family.",
        difficulty: 2
    },

    // --- LEVEL 3: SORPRENDEME (Critically Acclaimed / Modern Classics) ---
    {
        id: 301,
        title: "Parasite",
        year: 2019,
        rating: 8.5,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Parasite",
        genre: ["Thriller", "Drama"],
        director: "Bong Joon-ho",
        overview: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
        difficulty: 3
    },
    {
        id: 302,
        title: "Whiplash",
        year: 2014,
        rating: 8.5,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Whiplash",
        genre: ["Drama", "Music"],
        director: "Damien Chazelle",
        overview: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
        difficulty: 3
    },
    {
        id: 303,
        title: "Everything Everywhere All At Once",
        year: 2022,
        rating: 8.0,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Everything+Everywhere+All+At+Once",
        genre: ["Sci-Fi", "Adventure"],
        director: "Daniel Kwan",
        overview: "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what's important to her by connecting with the lives she could have led in other universes.",
        difficulty: 3
    },
    {
        id: 304,
        title: "The Grand Budapest Hotel",
        year: 2014,
        rating: 8.1,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Grand+Budapest+Hotel",
        genre: ["Comedy", "Drama"],
        director: "Wes Anderson",
        overview: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
        difficulty: 3
    },
    {
        id: 305,
        title: "Pulp Fiction",
        year: 1994,
        rating: 8.9,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Pulp+Fiction",
        genre: ["Crime", "Drama"],
        director: "Quentin Tarantino",
        overview: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        difficulty: 3
    },
    {
        id: 306,
        title: "Fight Club",
        year: 1999,
        rating: 8.8,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Fight+Club",
        genre: ["Drama"],
        director: "David Fincher",
        overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
        difficulty: 3
    },

    // --- LEVEL 4: ADICTO (Cult / Indie / Intense) ---
    {
        id: 401,
        title: "Oldboy",
        year: 2003,
        rating: 8.4,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Oldboy",
        genre: ["Action", "Drama"],
        director: "Park Chan-wook",
        overview: "After being kidnapped and imprisoned for fifteen years, Oh Dae-Su is released, only to find that he must find his captor in five days.",
        difficulty: 4
    },
    {
        id: 402,
        title: "A Clockwork Orange",
        year: 1971,
        rating: 8.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=A+Clockwork+Orange",
        genre: ["Crime", "Sci-Fi"],
        director: "Stanley Kubrick",
        overview: "In the future, a sadistic gang leader is imprisoned and volunteers for a conduct-aversion experiment, but it doesn't go as planned.",
        difficulty: 4
    },
    {
        id: 403,
        title: "Donnie Darko",
        year: 2001,
        rating: 8.0,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Donnie+Darko",
        genre: ["Drama", "Sci-Fi"],
        director: "Richard Kelly",
        overview: "A troubled teenager is plagued by visions of a man in a large rabbit suit who manipulates him to commit a series of crimes.",
        difficulty: 4
    },
    {
        id: 404,
        title: "The Lighthouse",
        year: 2019,
        rating: 7.4,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Lighthouse",
        genre: ["Drama", "Horror"],
        director: "Robert Eggers",
        overview: "Two lighthouse keepers try to maintain their sanity while living on a remote and mysterious New England island in the 1890s.",
        difficulty: 4
    },
    {
        id: 405,
        title: "Portrait of a Lady on Fire",
        year: 2019,
        rating: 8.1,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Portrait+of+a+Lady+on+Fire",
        genre: ["Drama", "Romance"],
        director: "Céline Sciamma",
        overview: "On an isolated island in Brittany at the end of the eighteenth century, a female painter is obliged to paint a wedding portrait of a young woman.",
        difficulty: 4
    },
    {
        id: 406,
        title: "Midsommar",
        year: 2019,
        rating: 7.1,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Midsommar",
        genre: ["Horror", "Drama"],
        director: "Ari Aster",
        overview: "A couple travels to Scandinavia to visit a rural hometown's fabled Swedish mid-summer festival. What begins as an idyllic retreat quickly devolves into an increasingly violent and bizarre competition at the hands of a pagan cult.",
        difficulty: 4
    },

    // --- LEVEL 5: CINEFILIA EXTREMA (Experimentales) ---
    {
        id: 501,
        title: "Stalker",
        year: 1979,
        rating: 8.1,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Stalker",
        genre: ["Sci-Fi", "Drama"],
        director: "Andrei Tarkovsky",
        overview: "A guide leads two men through an area known as the Zone to find a room that grants wishes.",
        difficulty: 5
    },
    {
        id: 502,
        title: "Eraserhead",
        year: 1977,
        rating: 7.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Eraserhead",
        genre: ["Horror", "Fantasy"],
        director: "David Lynch",
        overview: "Henry Spencer tries to survive his industrial environment, his angry girlfriend, and the unbearable screams of his newly born mutant child.",
        difficulty: 5
    },
    {
        id: 503,
        title: "The Holy Mountain",
        year: 1973,
        rating: 7.8,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Holy+Mountain",
        genre: ["Fantasy", "Drama"],
        director: "Alejandro Jodorowsky",
        overview: "In a corrupt, greed-fueled world, a powerful alchemist leads a Christ-like character and seven materialistic figures to the Holy Mountain, where they hope to achieve enlightenment.",
        difficulty: 5
    },
    {
        id: 504,
        title: "Tetsuo: The Iron Man",
        year: 1989,
        rating: 6.9,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Tetsuo:+The+Iron+Man",
        genre: ["Horror", "Sci-Fi"],
        director: "Shinya Tsukamoto",
        overview: "A regular man begins to transform into nothing but metal.",
        difficulty: 5
    },
    {
        id: 505,
        title: "Salo, or the 120 Days of Sodom",
        year: 1975,
        rating: 5.8,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Salo,+or+the+120+Days+of+Sodom",
        genre: ["Drama", "Horror"],
        director: "Pier Paolo Pasolini",
        overview: "In World War II Italy, four fascist libertines gather nine adolescent boys and girls and subject them to 120 days of physical, mental and sexual torture.",
        difficulty: 5
    },
    {
        id: 506,
        title: "House (Hausu)",
        year: 1977,
        rating: 7.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=House+(Hausu)",
        genre: ["Comedy", "Horror"],
        director: "Nobuhiko Obayashi",
        overview: "A schoolgirl and six of her classmates travel to her aunt's country home, which turns out to be haunted.",
        difficulty: 5
    },

    // --- LEVEL 6: LEYENDA (Legendary, Monumental, Hardcore History) ---
    {
        id: 601,
        title: "Seven Samurai",
        year: 1954,
        rating: 8.6,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Seven+Samurai",
        genre: ["Action", "Drama"],
        director: "Akira Kurosawa",
        overview: "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
        difficulty: 6
    },
    {
        id: 602,
        title: "Metropolis",
        year: 1927,
        rating: 8.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Metropolis",
        genre: ["Sci-Fi", "Drama"],
        director: "Fritz Lang",
        overview: "In a futuristic city sharply divided between the working class and the city planners, the son of the city's mastermind falls in love with a working-class prophet who predicts the coming of a savior to mediate their differences.",
        difficulty: 6
    },
    {
        id: 603,
        title: "Citizen Kane",
        year: 1941,
        rating: 8.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Citizen+Kane",
        genre: ["Drama", "Mystery"],
        director: "Orson Welles",
        overview: "Following the death of publishing tycoon Charles Foster Kane, reporters scramble to uncover the meaning of his final utterance; 'Rosebud'.",
        difficulty: 6
    },
    {
        id: 604,
        title: "2001: A Space Odyssey",
        year: 1968,
        rating: 8.3,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=2001:+A+Space+Odyssey",
        genre: ["Sci-Fi", "Adventure"],
        director: "Stanley Kubrick",
        overview: "After discovering a mysterious artifact buried beneath the Lunar surface, mankind sets off on a quest to find its origins with help from intelligent supercomputer H.A.L. 9000.",
        difficulty: 6
    },
    {
        id: 605,
        title: "Tokyo Story",
        year: 1953,
        rating: 8.2,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=Tokyo+Story",
        genre: ["Drama"],
        director: "Yasujirō Ozu",
        overview: "An old couple visit their children and grandchildren in the city, but receive little attention.",
        difficulty: 6
    },
    {
        id: 606,
        title: "The Seventh Seal",
        year: 1957,
        rating: 8.1,
        poster: "https://dummyimage.com/300x450/000/fff.png?text=The+Seventh+Seal",
        genre: ["Drama", "Fantasy"],
        director: "Ingmar Bergman",
        overview: "A man seeks answers about life, death, and the existence of God as he plays chess against the Grim Reaper during the Black Plague.",
        difficulty: 6
    }
];
