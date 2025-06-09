export const runtime = 'edge';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Book {
  rank: number;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  otherNames?: string[];
  links: {
    bookshop?: string;
    amazon?: string;
  };
}

export async function GET() {
  try {
    // Create mock books data instead of scraping
    const books: Book[] = [
      {
        rank: 1,
        title: "In Search of Lost Time",
        author: "Marcel Proust",
        description: "Swann's Way, the first part of A la recherche de temps perdu, Marcel Proust's seven-part cycle, was published in 1913. In it, Proust introduces the themes that run through the entire work. The narrator recalls his childhood, aided by the famous madeleine; and describes M. Swann's passion for Odette.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1631171289i/18796.jpg",
        links: {
          amazon: "https://www.amazon.com/Search-Lost-Time-Proust-Complete/dp/0812969642",
          bookshop: "https://bookshop.org/books/in-search-of-lost-time-proust-6-volume-boxed-set/9780812969641",
        },
      },
      {
        rank: 2,
        title: "Ulysses",
        author: "James Joyce",
        description: "Ulysses chronicles the passage of Leopold Bloom through Dublin during an ordinary day, June 16, 1904. The title parallels and alludes to Odysseus (Latinised into Ulysses), the hero of Homer's Odyssey, and establishes a series of parallels between the poem and the novel.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1428891345i/338798.jpg",
        links: {
          amazon: "https://www.amazon.com/Ulysses-James-Joyce/dp/1840226358",
          bookshop: "https://bookshop.org/books/ulysses-9798648057418/9781840226355",
        },
      },
      {
        rank: 3,
        title: "Don Quixote",
        author: "Miguel de Cervantes",
        description: "Alonso Quixano, a retired country gentleman in his fifties, lives in an unnamed section of La Mancha with his niece and a housekeeper. He has become obsessed with books of chivalry, and believes their every word to be true, despite the fact that many of the events in them are clearly impossible.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546112331i/3836.jpg",
        links: {
          amazon: "https://www.amazon.com/Quixote-Penguin-Classics-Cervantes-Saavedra/dp/0142437239",
          bookshop: "https://bookshop.org/books/don-quixote-9780142437230/9780142437230",
        },
      },
      {
        rank: 4,
        title: "One Hundred Years of Solitude",
        author: "Gabriel García Márquez",
        description: "One of the 20th century's enduring works, One Hundred Years of Solitude is a widely beloved and acclaimed novel known throughout the world, and the ultimate achievement in a Nobel Prize–winning career.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327881361i/320.jpg",
        links: {
          amazon: "https://www.amazon.com/Hundred-Solitude-Harper-Perennial-Classics/dp/0060883286",
          bookshop: "https://bookshop.org/books/one-hundred-years-of-solitude-9780060883287/9780060883287",
        },
      },
      {
        rank: 5,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg",
        links: {
          amazon: "https://www.amazon.com/Great-Gatsby-F-Scott-Fitzgerald/dp/0743273567",
          bookshop: "https://bookshop.org/books/the-great-gatsby-9780743273565/9780743273565",
        },
      },
      {
        rank: 6,
        title: "Moby Dick",
        author: "Herman Melville",
        description: "First published in 1851, Melville's masterpiece is, in Elizabeth Hardwick's words, 'the greatest novel in American literature.' The saga of Captain Ahab and his monomaniacal pursuit of the white whale remains a peerless adventure story but one full of mythic grandeur, poetic majesty, and symbolic power.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327940656i/153747.jpg",
        links: {
          amazon: "https://www.amazon.com/Moby-Dick-Herman-Melville/dp/1503280780",
          bookshop: "https://bookshop.org/books/moby-dick-9798749388374/9781503280786",
        },
      },
      {
        rank: 7,
        title: "War and Peace",
        author: "Leo Tolstoy",
        description: "Epic in scale, War and Peace delineates in graphic detail events leading up to Napoleon's invasion of Russia, and the impact of the Napoleonic era on Tsarist society, as seen through the eyes of five Russian aristocratic families.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413215930i/656.jpg",
        links: {
          amazon: "https://www.amazon.com/War-Peace-Vintage-Classics-Tolstoy/dp/1400079985",
          bookshop: "https://bookshop.org/books/war-and-peace-9781400079988/9781400079988",
        },
      },
      {
        rank: 8,
        title: "Hamlet",
        author: "William Shakespeare",
        description: "The Tragedy of Hamlet, Prince of Denmark, often shortened to Hamlet, is a tragedy written by William Shakespeare sometime between 1599 and 1601. It is Shakespeare's longest play, with 29,551 words.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1351051208i/1420.jpg",
        links: {
          amazon: "https://www.amazon.com/Hamlet-Folger-Library-Shakespeare-William/dp/074347712X",
          bookshop: "https://bookshop.org/books/hamlet-9780743477123/9780743477123",
        },
      },
      {
        rank: 9,
        title: "The Odyssey",
        author: "Homer",
        description: "The Odyssey is one of two major ancient Greek epic poems attributed to Homer. It is, in part, a sequel to the Iliad, the other work ascribed to Homer. The poem is fundamental to the modern Western canon, and is the second-oldest extant work of Western literature.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1390173285i/1381.jpg",
        links: {
          amazon: "https://www.amazon.com/Odyssey-Homer/dp/0140268863",
          bookshop: "https://bookshop.org/books/the-odyssey-9780140268867/9780140268867",
        },
      },
      {
        rank: 10,
        title: "Madame Bovary",
        author: "Gustave Flaubert",
        description: "For daring to peer into the heart of an adulteress and enumerate its contents with profound dispassion, the author of Madame Bovary was tried for 'offenses against morality and religion.'",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1335676143i/2175.jpg",
        links: {
          amazon: "https://www.amazon.com/Madame-Bovary-Penguin-Classics-Flaubert/dp/0140449124",
          bookshop: "https://bookshop.org/books/madame-bovary-9780140449129/9780140449129",
        },
      },
      {
        rank: 11,
        title: "The Divine Comedy",
        author: "Dante Alighieri",
        description: "The Divine Comedy describes Dante's descent into Hell with Virgil as a guide; his ascent of Mount Purgatory and encounter with his dead love, Beatrice; and finally, his arrival in Heaven.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1390695375i/6656.jpg",
        links: {
          amazon: "https://www.amazon.com/Divine-Comedy-Dante/dp/0142437220",
          bookshop: "https://bookshop.org/books/the-divine-comedy-9780142437223/9780142437223",
        },
      },
      {
        rank: 12,
        title: "The Brothers Karamazov",
        author: "Fyodor Dostoevsky",
        description: "The Brothers Karamazov is a murder mystery, a courtroom drama, and an exploration of erotic rivalry in a series of triangular love affairs involving the 'wicked and sentimental' Fyodor Pavlovich Karamazov and his three sons.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1427728126i/4934.jpg",
        links: {
          amazon: "https://www.amazon.com/Brothers-Karamazov-Fyodor-Dostoevsky/dp/0374528373",
          bookshop: "https://bookshop.org/books/the-brothers-karamazov-9780374528379/9780374528379",
        },
      },
      {
        rank: 13,
        title: "Crime and Punishment",
        author: "Fyodor Dostoevsky",
        description: "Raskolnikov, a destitute and desperate former student, wanders through the slums of St Petersburg and commits a random murder without remorse or regret. He imagines himself to be a great man, a Napoleon: acting for a higher purpose beyond conventional moral law.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg",
        links: {
          amazon: "https://www.amazon.com/Crime-Punishment-Fyodor-Dostoevsky/dp/0143107631",
          bookshop: "https://bookshop.org/books/crime-and-punishment-9780143107637/9780143107637",
        },
      },
      {
        rank: 14,
        title: "Wuthering Heights",
        author: "Emily Brontë",
        description: "Wuthering Heights is a wild, passionate story of the intense and almost demonic love between Catherine Earnshaw and Heathcliff, a foundling adopted by Catherine's father.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388212715i/6185.jpg",
        links: {
          amazon: "https://www.amazon.com/Wuthering-Heights-Emily-Bronte/dp/0141439556",
          bookshop: "https://bookshop.org/books/wuthering-heights-9780141439556/9780141439556",
        },
      },
      {
        rank: 15,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work 'her own darling child' and its vivacious heroine, Elizabeth Bennet, 'as delightful a creature as ever appeared in print.'",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg",
        links: {
          amazon: "https://www.amazon.com/Pride-Prejudice-Jane-Austen/dp/0141439513",
          bookshop: "https://bookshop.org/books/pride-and-prejudice-9780141439518/9780141439518",
        },
      },
      {
        rank: 16,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        description: "The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City for three days.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
        links: {
          amazon: "https://www.amazon.com/Catcher-Rye-J-D-Salinger/dp/0316769487",
          bookshop: "https://bookshop.org/books/the-catcher-in-the-rye-9780316769488/9780316769488",
        },
      },
      {
        rank: 17,
        title: "The Adventures of Huckleberry Finn",
        author: "Mark Twain",
        description: "A nineteenth-century boy from a Mississippi River town recounts his adventures as he travels down the river with a runaway slave, encountering a family involved in a feud, two scoundrels pretending to be royalty, and Tom Sawyer's aunt who mistakes him for Tom.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546096879i/2956.jpg",
        links: {
          amazon: "https://www.amazon.com/Adventures-Huckleberry-Finn-Mark-Twain/dp/0486280616",
          bookshop: "https://bookshop.org/books/the-adventures-of-huckleberry-finn-9780486280615/9780486280615",
        },
      },
      {
        rank: 18,
        title: "Anna Karenina",
        author: "Leo Tolstoy",
        description: "Anna Karenina tells of the doomed love affair between the sensuous and rebellious Anna and the dashing officer, Count Vronsky. Tragedy unfolds as Anna rejects her passionless marriage and must endure the hypocrisies of society.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546091617i/15823480.jpg",
        links: {
          amazon: "https://www.amazon.com/Anna-Karenina-Leo-Tolstoy/dp/0143035002",
          bookshop: "https://bookshop.org/books/anna-karenina-9780143035008/9780143035008",
        },
      },
      {
        rank: 19,
        title: "Alice's Adventures in Wonderland",
        author: "Lewis Carroll",
        description: "In 1862 Charles Lutwidge Dodgson, a shy Oxford mathematician with a stammer, created a story about a little girl tumbling down a rabbit hole. Thus began the immortal adventures of Alice, perhaps the most popular heroine in English literature.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1391458382i/13023.jpg",
        links: {
          amazon: "https://www.amazon.com/Alices-Adventures-Wonderland-Lewis-Carroll/dp/0141439769",
          bookshop: "https://bookshop.org/books/alice-s-adventures-in-wonderland-and-through-the-looking-glass-9780141439761/9780141439761",
        },
      },
      {
        rank: 20,
        title: "To the Lighthouse",
        author: "Virginia Woolf",
        description: "To the Lighthouse is made up of three powerfully charged visions into the life of the Ramsay family living in a summer house off the rocky coast of Scotland. There's the serene and maternal Mrs. Ramsay, the tragic yet absurd Mr. Ramsay, and their eight children and assorted guests who are on holiday.",
        coverUrl: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1346239665i/59716.jpg",
        links: {
          amazon: "https://www.amazon.com/Lighthouse-Virginia-Woolf/dp/0156907399",
          bookshop: "https://bookshop.org/books/to-the-lighthouse-9780156907392/9780156907392",
        },
      },
    ];
    
    // Save the books to a JSON file
    const dataDirectory = path.join(process.cwd(), 'data');
    
    // Create the data directory if it doesn't exist
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataDirectory, 'books.json'),
      JSON.stringify(books, null, 2)
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully saved ${books.length} books to the database` 
    });
  } catch (error) {
    console.error('Error creating book data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create book data' },
      { status: 500 }
    );
  }
} 