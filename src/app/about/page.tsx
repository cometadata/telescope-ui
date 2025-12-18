import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const partners = [
  {
    name: "California Digital Library",
    url: "https://cdlib.org",
  },
  {
    name: "DataCite",
    url: "https://datacite.org",
  },
  {
    name: "PKP",
    url: "https://pkp.sfu.ca",
  },
  {
    name: "CWTS",
    url: "https://www.universiteitleiden.nl/en/social-behavioural-sciences/cwts",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header activeTab="about" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
            About
          </h1>
          <p className="text-lg text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Telescope is a demonstration app for showcasing{" "}
            <a
              href="https://cometadata.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-neutral-100 underline hover:no-underline"
            >
              COMET
            </a>
            &apos;s enrichment of DataCite metadata from arXiv.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 sm:p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            The COMET Initiative
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
            Telescope is part of the{" "}
            <a
              href="https://cometadata.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-neutral-100 underline hover:no-underline"
            >
              COMET
            </a>{" "}
            initiative, a collaborative effort to improve the quality and
            completeness of persistent identifier metadata.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 sm:p-8 mb-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-6">
            COMET Organizers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-center"
              >
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                  {partner.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Funding Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-4">
            Funding
          </h2>
          <p className="text-gray-600 dark:text-neutral-400 leading-relaxed">
            Support for COMET&apos;s enrichment projects, which leverage DataCite metadata, has been provided to DataCite by{" "}
            <a
              href="https://www.navigation.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-neutral-100 underline hover:no-underline"
            >
              The Navigation Fund
            </a>
            .
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700 flex justify-center">
            <a
              href="https://doi.org/10.71707/yj21-5d60"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              doi.org/10.71707/yj21-5d60
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
