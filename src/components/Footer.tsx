export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-neutral-700 mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 dark:text-neutral-400 text-xs sm:text-sm">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          Part of{" "}
          <a
            href="https://cometadata.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            COMET
          </a>
          , organized by{" "}
          <a
            href="https://cdlib.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            CDL
          </a>
          ,{" "}
          <a
            href="https://datacite.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            DataCite
          </a>
          ,{" "}
          <a
            href="https://pkp.sfu.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            PKP
          </a>
          ,{" "}
          <a
            href="https://www.universiteitleiden.nl/en/social-behavioural-sciences/cwts"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            CWTS
          </a>
          . Funded in part by{" "}
          <a
            href="https://www.navigation.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 dark:hover:text-neutral-200"
          >
            The Navigation Fund
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
