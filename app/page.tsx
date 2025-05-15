import Quiz from "@/app/components/Quiz";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-lw-text dark:text-lw-dark-text mb-6">
          Discover Your Next Great Read
        </h1>
        <p className="font-sans text-xl sm:text-2xl text-lw-text dark:text-lw-dark-text leading-relaxed">
          Welcome to the AP Literature Book Matchmaker. Answer a few questions about your reading preferences, and we'll recommend books tailored to your taste and perhaps even help you discover something new and unexpected.
        </p>
      </div>
      <div className="w-full">
        <Quiz />
      </div>
      <footer className="mt-16 text-center">
        <p className="font-sans text-sm text-lw-muted-text dark:text-lw-dark-muted-text">
          &copy; {new Date().getFullYear()} Book Matchmaker. All rights reserved.
        </p>
        <p className="font-sans text-xs text-lw-muted-text dark:text-lw-dark-muted-text opacity-70 mt-1">
          Powered by sophisticated AI and a love for literature.
        </p>
      </footer>
    </main>
  );
}
