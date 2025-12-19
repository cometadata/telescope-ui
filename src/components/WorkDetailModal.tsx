import Link from "next/link";
import { AuthorAffiliation, parseAuthorAffiliations } from "@/lib/typesense";
import { RORBadge } from "./RORBadge";

interface WorkDetailModalProps {
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

function AuthorAffiliationList({ authors }: { authors: AuthorAffiliation[] }) {
  if (authors.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-neutral-400 italic">No author affiliation data available</p>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
      {authors.map((author, idx) => (
        <div key={idx} className="text-sm">
          <p className="font-medium text-gray-900 dark:text-neutral-100">{author.name}</p>
          {author.affiliations.length > 0 ? (
            author.affiliations.map((aff, affIdx) => (
              <div
                key={affIdx}
                className="flex items-start gap-2 mt-1 ml-3 text-gray-600 dark:text-neutral-400"
              >
                <span className="flex-1 text-sm leading-relaxed">
                  {aff.text || "Unknown affiliation"}
                </span>
                {aff.ror_id && <RORBadge rorId={aff.ror_id} />}
              </div>
            ))
          ) : (
            <p className="mt-1 ml-3 text-gray-400 dark:text-neutral-500 text-xs italic">
              No affiliation
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function WorkDetailModal({ work }: WorkDetailModalProps) {
  const authorAffiliations = parseAuthorAffiliations(work);
  const arxivLink =
    work.arxiv_id_link ||
    `https://arxiv.org/abs/${work.arxiv_id.replace(/^arXiv:/i, "")}`;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 pr-6">{work.title}</h3>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
            arXiv ID
          </span>
          <p>
            <a
              href={arxivLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-neutral-100 hover:underline"
            >
              {work.arxiv_id.startsWith("arXiv:")
                ? work.arxiv_id
                : `arXiv:${work.arxiv_id}`}
            </a>
          </p>
        </div>

        {work.doi && (
          <div>
            <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
              DOI
            </span>
            <p>
              <a
                href={work.doi.startsWith("http") ? work.doi : `https://doi.org/${work.doi.replace(/^doi:/i, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-neutral-100 hover:underline"
              >
                {work.doi.startsWith("http") ? work.doi : `https://doi.org/${work.doi.replace(/^doi:/i, "")}`}
              </a>
            </p>
          </div>
        )}

        {work.software_repository && (
          <div>
            <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
              Repository
            </span>
            <p>
              <a
                href={work.software_repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-neutral-100 hover:underline"
              >
                {work.software_repository}
              </a>
            </p>
          </div>
        )}

        {work.publication_link && (
          <div>
            <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
              Related Work
            </span>
            <p>
              <a
                href={work.publication_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 dark:text-neutral-100 hover:underline"
              >
                {work.publication_link}
              </a>
            </p>
          </div>
        )}

        <div>
          <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
            Year
          </span>
          <p className="text-gray-900 dark:text-neutral-100">{work.year}</p>
        </div>

        {work.subjects.length > 0 && (
          <div>
            <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
              Subjects
            </span>
            <p className="text-gray-900 dark:text-neutral-100">
              {work.subjects.join(", ")}
            </p>
          </div>
        )}
      </div>

      {work.institution_names.length > 0 && (
        <div>
          <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
            Organizations ({work.institution_names.length})
          </span>
          <div className="max-h-[150px] overflow-y-auto pr-2 mt-1 space-y-1 scrollbar-thin">
            {work.institution_names.map((name, idx) => {
              const rorId = work.ror_ids[idx];
              const rorHash = rorId?.replace("https://ror.org/", "");

              return (
                <div key={`${name}-${idx}`} className="text-sm">
                  {rorHash ? (
                    <Link
                      href={`/organization/${rorHash}`}
                      className="text-gray-900 dark:text-neutral-100 hover:text-gray-600 dark:hover:text-neutral-300 hover:underline"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="text-gray-600 dark:text-neutral-400">{name}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(work.software_repository || (work.software_references && work.software_references.length > 0)) && (
        <div>
          <span className="text-gray-500 dark:text-neutral-400 uppercase text-xs tracking-wide">
            Software
          </span>
          <div className="mt-1 space-y-1">
            {work.software_repository && (
              <p className="text-sm">
                <a
                  href={work.software_repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-neutral-100 hover:underline"
                >
                  {work.software_repository.replace(/^https?:\/\//, "")}
                </a>
              </p>
            )}
            {work.software_references?.map((url, idx) => (
              <p key={idx} className="text-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 dark:text-neutral-100 hover:underline"
                >
                  {url.replace(/^https?:\/\//, "")}
                </a>
              </p>
            ))}
          </div>
        </div>
      )}

      <hr className="border-gray-200 dark:border-neutral-700" />

      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
          Authors & Affiliations
        </h4>
        <AuthorAffiliationList authors={authorAffiliations} />
      </div>
    </div>
  );
}
