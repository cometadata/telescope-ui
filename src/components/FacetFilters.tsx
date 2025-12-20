"use client";

import { useState } from "react";

interface FacetCount {
  value: string;
  count: number;
}

interface Facet {
  field_name: string;
  counts: FacetCount[];
}

interface FacetFiltersProps {
  facets: Facet[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const FACET_LABELS: Record<string, string> = {
  year: "Year",
  subject_codes: "Subject",
  countries: "Country",
  country: "Country",
  types: "Organization Type",
  has_publication: "Related Work",
  has_software: "Software",
};

const BOOLEAN_LABELS: Record<string, Record<string, string>> = {
  has_publication: {
    true: "Has related work",
    false: "No related work",
  },
  has_software: {
    true: "Has software",
    false: "No software",
  },
};

const COLLAPSED_COUNT = 5;

const ARXIV_SUBJECTS: Record<string, string> = {
  "cs.AI": "Artificial Intelligence",
  "cs.AR": "Hardware Architecture",
  "cs.CC": "Computational Complexity",
  "cs.CE": "Computational Engineering",
  "cs.CG": "Computational Geometry",
  "cs.CL": "Computation and Language",
  "cs.CR": "Cryptography and Security",
  "cs.CV": "Computer Vision",
  "cs.CY": "Computers and Society",
  "cs.DB": "Databases",
  "cs.DC": "Distributed Computing",
  "cs.DL": "Digital Libraries",
  "cs.DM": "Discrete Mathematics",
  "cs.DS": "Data Structures and Algorithms",
  "cs.ET": "Emerging Technologies",
  "cs.FL": "Formal Languages",
  "cs.GL": "General Literature",
  "cs.GR": "Graphics",
  "cs.GT": "Game Theory",
  "cs.HC": "Human-Computer Interaction",
  "cs.IR": "Information Retrieval",
  "cs.IT": "Information Theory",
  "cs.LG": "Machine Learning",
  "cs.LO": "Logic in Computer Science",
  "cs.MA": "Multiagent Systems",
  "cs.MM": "Multimedia",
  "cs.MS": "Mathematical Software",
  "cs.NA": "Numerical Analysis",
  "cs.NE": "Neural and Evolutionary Computing",
  "cs.NI": "Networking and Internet Architecture",
  "cs.OH": "Other Computer Science",
  "cs.OS": "Operating Systems",
  "cs.PF": "Performance",
  "cs.PL": "Programming Languages",
  "cs.RO": "Robotics",
  "cs.SC": "Symbolic Computation",
  "cs.SD": "Sound",
  "cs.SE": "Software Engineering",
  "cs.SI": "Social and Information Networks",
  "cs.SY": "Systems and Control",
  "stat.AP": "Applications",
  "stat.CO": "Computation",
  "stat.ME": "Methodology",
  "stat.ML": "Machine Learning",
  "stat.OT": "Other Statistics",
  "stat.TH": "Theory",
  "math.AC": "Commutative Algebra",
  "math.AG": "Algebraic Geometry",
  "math.AP": "Analysis of PDEs",
  "math.AT": "Algebraic Topology",
  "math.CA": "Classical Analysis",
  "math.CO": "Combinatorics",
  "math.CT": "Category Theory",
  "math.CV": "Complex Variables",
  "math.DG": "Differential Geometry",
  "math.DS": "Dynamical Systems",
  "math.FA": "Functional Analysis",
  "math.GM": "General Mathematics",
  "math.GN": "General Topology",
  "math.GR": "Group Theory",
  "math.GT": "Geometric Topology",
  "math.HO": "History and Overview",
  "math.IT": "Information Theory",
  "math.KT": "K-Theory and Homology",
  "math.LO": "Logic",
  "math.MG": "Metric Geometry",
  "math.MP": "Mathematical Physics",
  "math.NA": "Numerical Analysis",
  "math.NT": "Number Theory",
  "math.OA": "Operator Algebras",
  "math.OC": "Optimization and Control",
  "math.PR": "Probability",
  "math.QA": "Quantum Algebra",
  "math.RA": "Rings and Algebras",
  "math.RT": "Representation Theory",
  "math.SG": "Symplectic Geometry",
  "math.SP": "Spectral Theory",
  "math.ST": "Statistics Theory",
  "astro-ph": "Astrophysics",
  "astro-ph.CO": "Cosmology",
  "astro-ph.EP": "Earth and Planetary",
  "astro-ph.GA": "Galaxies",
  "astro-ph.HE": "High Energy Astrophysics",
  "astro-ph.IM": "Instrumentation",
  "astro-ph.SR": "Solar and Stellar",
  "cond-mat": "Condensed Matter",
  "cond-mat.dis-nn": "Disordered Systems",
  "cond-mat.mes-hall": "Mesoscale and Nanoscale",
  "cond-mat.mtrl-sci": "Materials Science",
  "cond-mat.other": "Other Condensed Matter",
  "cond-mat.quant-gas": "Quantum Gases",
  "cond-mat.soft": "Soft Condensed Matter",
  "cond-mat.stat-mech": "Statistical Mechanics",
  "cond-mat.str-el": "Strongly Correlated",
  "cond-mat.supr-con": "Superconductivity",
  "gr-qc": "General Relativity",
  "hep-ex": "High Energy Physics - Experiment",
  "hep-lat": "High Energy Physics - Lattice",
  "hep-ph": "High Energy Physics - Phenomenology",
  "hep-th": "High Energy Physics - Theory",
  "math-ph": "Mathematical Physics",
  "nlin.AO": "Adaptation and Self-Organizing",
  "nlin.CD": "Chaotic Dynamics",
  "nlin.CG": "Cellular Automata",
  "nlin.PS": "Pattern Formation",
  "nlin.SI": "Exactly Solvable",
  "nucl-ex": "Nuclear Experiment",
  "nucl-th": "Nuclear Theory",
  "physics.acc-ph": "Accelerator Physics",
  "physics.ao-ph": "Atmospheric and Oceanic",
  "physics.app-ph": "Applied Physics",
  "physics.atm-clus": "Atomic and Molecular Clusters",
  "physics.atom-ph": "Atomic Physics",
  "physics.bio-ph": "Biological Physics",
  "physics.chem-ph": "Chemical Physics",
  "physics.class-ph": "Classical Physics",
  "physics.comp-ph": "Computational Physics",
  "physics.data-an": "Data Analysis",
  "physics.ed-ph": "Physics Education",
  "physics.flu-dyn": "Fluid Dynamics",
  "physics.gen-ph": "General Physics",
  "physics.geo-ph": "Geophysics",
  "physics.hist-ph": "History of Physics",
  "physics.ins-det": "Instrumentation",
  "physics.med-ph": "Medical Physics",
  "physics.optics": "Optics",
  "physics.plasm-ph": "Plasma Physics",
  "physics.pop-ph": "Popular Physics",
  "physics.soc-ph": "Physics and Society",
  "physics.space-ph": "Space Physics",
  "quant-ph": "Quantum Physics",
  "econ.EM": "Econometrics",
  "econ.GN": "General Economics",
  "econ.TH": "Theoretical Economics",
  "eess.AS": "Audio and Speech Processing",
  "eess.IV": "Image and Video Processing",
  "eess.SP": "Signal Processing",
  "eess.SY": "Systems and Control",
  "q-bio.BM": "Biomolecules",
  "q-bio.CB": "Cell Behavior",
  "q-bio.GN": "Genomics",
  "q-bio.MN": "Molecular Networks",
  "q-bio.NC": "Neurons and Cognition",
  "q-bio.OT": "Other Quantitative Biology",
  "q-bio.PE": "Populations and Evolution",
  "q-bio.QM": "Quantitative Methods",
  "q-bio.SC": "Subcellular Processes",
  "q-bio.TO": "Tissues and Organs",
  "q-fin.CP": "Computational Finance",
  "q-fin.EC": "Economics",
  "q-fin.GN": "General Finance",
  "q-fin.MF": "Mathematical Finance",
  "q-fin.PM": "Portfolio Management",
  "q-fin.PR": "Pricing of Securities",
  "q-fin.RM": "Risk Management",
  "q-fin.ST": "Statistical Finance",
  "q-fin.TR": "Trading and Microstructure",
};

function getSubjectDisplayName(code: string): string {
  const name = ARXIV_SUBJECTS[code];
  return name ? `${name} (${code})` : code;
}

function getFacetValueDisplayName(fieldName: string, value: string): string {
  if (BOOLEAN_LABELS[fieldName]?.[value]) {
    return BOOLEAN_LABELS[fieldName][value];
  }
  if (fieldName === "subject_codes") {
    return getSubjectDisplayName(value);
  }
  return value;
}

export function FacetFilters({
  facets,
  currentFilter,
  onFilterChange,
}: FacetFiltersProps) {
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({
    year: true,
    subject_codes: true,
    countries: true,
    country: true,
    types: true,
    has_publication: true,
    has_software: true,
  });

  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  const activeFilters: Record<string, Set<string>> = {};
  // Fields appearing multiple times use AND logic (e.g., ror_ids for collaborations)
  const andFields = new Set<string>();

  if (currentFilter) {
    const parts = currentFilter.split(" && ");
    for (const part of parts) {
      const match = part.match(/^(\w+):=?\[?([^\]]+)\]?$/);
      if (match) {
        const [, field, valuesStr] = match;
        const values = valuesStr.split(",").map((v) => v.replace(/`/g, "").trim());

        if (activeFilters[field]) {
          andFields.add(field);
        } else {
          activeFilters[field] = new Set();
        }

        for (const v of values) {
          activeFilters[field].add(v);
        }
      }
    }
  }

  const toggleFilter = (field: string, value: string) => {
    const newFilters = { ...activeFilters };

    if (!newFilters[field]) {
      newFilters[field] = new Set();
    }

    if (newFilters[field].has(value)) {
      newFilters[field].delete(value);
      if (newFilters[field].size === 0) {
        delete newFilters[field];
      }
    } else {
      newFilters[field].add(value);
    }

    const filterParts: string[] = [];
    for (const [f, values] of Object.entries(newFilters)) {
      if (values.size === 0) continue;

      const valuesArray = [...values];
      // Numeric and boolean fields don't need backticks in Typesense filter syntax
      const isUnquoted = f === "year" || f === "has_publication" || f === "has_software";

      // Preserve AND logic for fields like ror_ids (collaboration queries)
      if (andFields.has(f)) {
        for (const val of valuesArray) {
          filterParts.push(isUnquoted ? `${f}:=${val}` : `${f}:=\`${val}\``);
        }
      } else if (values.size === 1) {
        const val = valuesArray[0];
        filterParts.push(isUnquoted ? `${f}:=${val}` : `${f}:=\`${val}\``);
      } else {
        if (isUnquoted) {
          filterParts.push(`${f}:=[${valuesArray.join(",")}]`);
        } else {
          filterParts.push(`${f}:=[${valuesArray.map((v) => `\`${v}\``).join(",")}]`);
        }
      }
    }

    onFilterChange(filterParts.join(" && "));
  };

  const clearFilters = () => {
    onFilterChange("");
  };

  if (facets.length === 0) {
    return null;
  }

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-neutral-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 dark:text-neutral-400 hover:text-black dark:hover:text-neutral-100"
          >
            Clear all
          </button>
        )}
      </div>

      {facets.map((facet) => {
        const label = FACET_LABELS[facet.field_name] || facet.field_name;
        const isSectionOpen = sectionOpen[facet.field_name];
        const isShowingAll = showAll[facet.field_name] || false;
        const searchQuery = searchQueries[facet.field_name] || "";
        const activeFacetFilters = activeFilters[facet.field_name] || new Set();

        // Year "0" represents works without dates - hide from UI
        const baseCounts = facet.field_name === "year"
          ? facet.counts.filter(({ value }) => value !== "0")
          : facet.counts;

        const filteredCounts = searchQuery
          ? baseCounts.filter(({ value }) => {
              const displayValue = getFacetValueDisplayName(facet.field_name, value);
              return displayValue.toLowerCase().includes(searchQuery.toLowerCase());
            })
          : baseCounts;

        const hasMany = baseCounts.length > COLLAPSED_COUNT;
        const displayCounts = isShowingAll || searchQuery
          ? filteredCounts
          : filteredCounts.slice(0, COLLAPSED_COUNT);
        const hiddenCount = filteredCounts.length - COLLAPSED_COUNT;

        return (
          <div key={facet.field_name} className="mb-4">
            <button
              onClick={() =>
                setSectionOpen((prev) => ({
                  ...prev,
                  [facet.field_name]: !prev[facet.field_name],
                }))
              }
              className="flex items-center justify-between w-full text-left py-2 text-sm font-medium text-gray-700 dark:text-neutral-300"
            >
              {label}
              <span className="text-gray-400 dark:text-neutral-500">{isSectionOpen ? "−" : "+"}</span>
            </button>

            {isSectionOpen && (
              <div className="mt-1">
                {hasMany && facet.field_name !== "year" && facet.field_name !== "types" && (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQueries((prev) => ({
                          ...prev,
                          [facet.field_name]: e.target.value,
                        }))
                      }
                      placeholder={`Search ${label.toLowerCase()}...`}
                      className="w-full px-2 py-1.5 text-sm border border-gray-200 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800 text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-neutral-600"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  {displayCounts.map(({ value, count }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={activeFacetFilters.has(value.toString())}
                        onChange={() => toggleFilter(facet.field_name, value.toString())}
                        className="rounded border-gray-300 dark:border-neutral-600 text-black dark:text-white focus:ring-gray-500 dark:focus:ring-neutral-400 dark:bg-neutral-700"
                      />
                      <span
                        className="flex-1 text-gray-600 dark:text-neutral-400 truncate"
                        title={getFacetValueDisplayName(facet.field_name, value)}
                      >
                        {getFacetValueDisplayName(facet.field_name, value)}
                      </span>
                      <span className="text-gray-400 dark:text-neutral-500 text-xs">
                        {count.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>

                {hasMany && !searchQuery && hiddenCount > 0 && (
                  <button
                    onClick={() =>
                      setShowAll((prev) => ({
                        ...prev,
                        [facet.field_name]: !prev[facet.field_name],
                      }))
                    }
                    className="mt-2 px-2 text-sm text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
                  >
                    {isShowingAll
                      ? "Show less"
                      : `Show ${hiddenCount} more`}
                  </button>
                )}

                {searchQuery && filteredCounts.length === 0 && (
                  <p className="px-2 py-1 text-sm text-gray-400 dark:text-neutral-500">No matches</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
