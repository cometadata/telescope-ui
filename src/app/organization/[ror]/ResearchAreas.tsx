"use client";

import Link from "next/link";
import { getSubjectName } from "@/lib/subjects";

interface SubjectData {
  code: string;
  count: number;
}

interface ResearchAreasProps {
  subjects: SubjectData[];
  rorId: string;
  orgName: string;
  limit?: number;
}

export function ResearchAreas({ subjects, rorId, orgName, limit = 6 }: ResearchAreasProps) {
  const displaySubjects = subjects.slice(0, limit);

  if (displaySubjects.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-gray-600 dark:text-neutral-400 mb-4">Research Areas</h2>
      <div className="flex flex-wrap gap-2">
        {displaySubjects.map((subject) => (
          <Link
            key={subject.code}
            href={`/search?filter_by=${encodeURIComponent(`ror_ids:=\`${rorId}\` && subject_codes:=\`${subject.code}\``)}&org_labels=${encodeURIComponent(`${rorId.replace("https://ror.org/", "")}:${orgName}`)}`}
            className="px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 rounded-md text-sm hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {getSubjectName(subject.code)}
            <span className="text-gray-400 dark:text-neutral-500 ml-1">({subject.count})</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
