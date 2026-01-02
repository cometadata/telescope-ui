"use client";

import Link from "next/link";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { WorkDetailModal } from "./WorkDetailModal";
import { getSubjectName } from "@/lib/subjects";

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M4.72 3.22a.75.75 0 011.06 1.06L2.06 8l3.72 3.72a.75.75 0 11-1.06 1.06L.47 8.53a.75.75 0 010-1.06l4.25-4.25zm6.56 0a.75.75 0 10-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 101.06 1.06l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25z"
      />
    </svg>
  );
}

interface WorkCardProps {
  work: {
    id: string;
    doi: string;
    arxiv_id: string;
    arxiv_id_link: string;
    title: string;
    year: number;
    authors: string[];
    affiliations: string[];
    ror_ids: string[];
    institution_names: string[];
    searchable_names: string[];
    countries: string[];
    subjects: string[];
    subject_codes: string[];
    author_affiliations?: string;
    publication_link?: string;
    software_repository?: string;
    software_references?: string[];
    has_software?: boolean;
  };
}

function WorkCardContent({ work, onTitleClick }: WorkCardProps & { onTitleClick?: () => void }) {
  const displayAuthors = work.authors.slice(0, 5);
  const moreAuthors = work.authors.length - 5;

  return (
    <>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
        <button
          onClick={onTitleClick}
          className="text-left hover:text-gray-600 dark:hover:text-neutral-300 cursor-pointer"
        >
          {work.title}
        </button>
      </h3>

      <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
        {displayAuthors.join(", ")}
        {moreAuthors > 0 && (
          <span className="text-gray-400 dark:text-neutral-500"> +{moreAuthors} more</span>
        )}
      </p>

      <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
        <span className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded text-gray-600 dark:text-neutral-400">
          {work.year}
        </span>

        <a
          href={
            work.arxiv_id_link ||
            `https://arxiv.org/abs/${work.arxiv_id.replace(/^arXiv:/i, "")}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 dark:text-neutral-300 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {work.arxiv_id.startsWith("arXiv:")
            ? work.arxiv_id
            : `arXiv:${work.arxiv_id}`}
        </a>

        {work.doi && (
          <a
            href={work.doi.startsWith("http") ? work.doi : `https://doi.org/${work.doi.replace(/^doi:/i, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-neutral-300 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            DOI
          </a>
        )}

        {work.software_repository && (
          <a
            href={work.software_repository}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
            title="View repository"
          >
            <CodeIcon className="w-4 h-4" />
          </a>
        )}

        {work.subject_codes.slice(0, 2).map((code) => (
          <span
            key={code}
            className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded text-xs"
          >
            {getSubjectName(code)}
          </span>
        ))}
        {work.subject_codes.length > 2 && (
          <span className="text-xs text-gray-400 dark:text-neutral-500">
            +{work.subject_codes.length - 2} more
          </span>
        )}
      </div>

      {work.institution_names.length > 0 && (
        <div className="border-t border-gray-100 dark:border-neutral-800 pt-3">
          <p className="text-xs text-gray-500 dark:text-neutral-400 mb-2">Organizations:</p>
          <div className="flex flex-wrap gap-2">
            {work.institution_names.slice(0, 5).map((name, idx) => {
              const rorId = work.ror_ids[idx];
              const rorHash = rorId?.replace("https://ror.org/", "");

              if (rorHash) {
                return (
                  <Link
                    key={`${name}-${idx}`}
                    href={`/organization/${rorHash}`}
                    className="px-2 py-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-sm text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-100 hover:border-gray-300 dark:hover:border-neutral-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {name}
                  </Link>
                );
              }

              return (
                <span key={`${name}-${idx}`} className="px-2 py-1 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded text-sm text-gray-600 dark:text-neutral-400">
                  {name}
                </span>
              );
            })}
            {work.institution_names.length > 5 && (
              <span className="text-sm text-gray-400 dark:text-neutral-500">
                +{work.institution_names.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function WorkCard({ work }: WorkCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const arxivLink = work.arxiv_id_link || `https://arxiv.org/abs/${work.arxiv_id.replace(/^arXiv:/i, "")}`;

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-neutral-700">
        <WorkCardContent work={work} onTitleClick={() => setDialogOpen(true)} />
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-2">
          {work.software_repository && (
            <a
              href={work.software_repository}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Software
            </a>
          )}
          {work.publication_link && (
            <a
              href={work.publication_link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Related Work
            </a>
          )}
          <a
            href={arxivLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            View on arXiv
          </a>
          <a
            href={arxivLink.replace("/abs/", "/pdf/") + ".pdf"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm text-gray-700 dark:text-neutral-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            View PDF
          </a>
        </div>
      </div>
      <Dialog.Portal>
        {/* Use div instead of Dialog.Overlay for non-modal - Overlay doesn't render with modal={false} */}
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDialogOpen(false)} />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[700px] max-h-[85vh] overflow-y-auto scrollbar-thin bg-white dark:bg-neutral-900 rounded-lg shadow-2xl p-4 sm:p-6 z-50">
          <VisuallyHidden.Root>
            <Dialog.Title>{work.title}</Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300"
              aria-label="Close"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </Dialog.Close>
          <WorkDetailModal work={work} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
