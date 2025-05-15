# AP Literature Book Matchmaker

A personality quiz that recommends books based on user preferences using gpt-4.1-nano.

## Features

- Interactive quiz with multiple-choice and free-response questions
- Book recommendations based on user preferences
- Dynamic book information display with covers and descriptions
- Links to purchase recommended books

## Getting Started

### Prerequisites

- Node.js 18.x or later
- An OpenAI API key with access to the gpt-4.1-nano model

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ap-lit-book-matchmaker.git
cd ap-lit-book-matchmaker
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Scrape book data (this only needs to be done once)
```bash
npm run dev
```
Then visit `http://localhost:3000/api/scrape-books` in your browser to initialize the book database.

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## How It Works

1. Users take a personality quiz with both multiple-choice and free-response questions
2. Their answers are sent to gpt-4.1-nano along with a list of 200 great books
3. The AI recommends books the user is likely to enjoy and books that might expand their horizons
4. Results are displayed with book covers, descriptions, and purchase links

## Technology Stack

- Next.js - React framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- OpenAI API - For personalized book recommendations
- Axios - HTTP client for API requests
- Cheerio - For scraping book data

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
