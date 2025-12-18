import type { WorkDocument } from "@/lib/typesense";

export const mockWorks: WorkDocument[] = [
  {
    id: "work-1",
    doi: "10.48550/arXiv.2301.00001",
    arxiv_id: "2301.00001",
    arxiv_id_link: "https://arxiv.org/abs/2301.00001",
    title: "Advances in Machine Learning for Scientific Discovery",
    year: 2023,
    authors: ["Alice Smith", "Bob Johnson"],
    affiliations: [
      "Massachusetts Institute of Technology, Cambridge, MA, USA",
      "Harvard University, Cambridge, MA, USA",
    ],
    ror_ids: ["05x2bcf33", "03vek6s52"],
    institution_names: ["Massachusetts Institute of Technology", "Harvard University"],
    searchable_names: [
      "Massachusetts Institute of Technology",
      "MIT",
      "Harvard University",
      "Harvard",
    ],
    countries: ["United States"],
    subjects: ["Machine Learning", "Artificial Intelligence"],
    subject_codes: ["cs.LG", "cs.AI"],
    publication_link: "https://doi.org/10.1234/example",
    has_publication: true,
    author_affiliations: JSON.stringify([
      {
        name: "Alice Smith",
        affiliations: [
          {
            text: "Massachusetts Institute of Technology, Cambridge, MA, USA",
            ror_id: "https://ror.org/05x2bcf33",
            institution_name: "Massachusetts Institute of Technology",
          },
        ],
      },
      {
        name: "Bob Johnson",
        affiliations: [
          {
            text: "Harvard University, Cambridge, MA, USA",
            ror_id: "https://ror.org/03vek6s52",
            institution_name: "Harvard University",
          },
        ],
      },
    ]),
  },
  {
    id: "work-2",
    doi: "10.48550/arXiv.2302.00002",
    arxiv_id: "2302.00002",
    arxiv_id_link: "https://arxiv.org/abs/2302.00002",
    title: "Quantum Computing: Theory and Applications",
    year: 2023,
    authors: ["Carol Williams", "David Brown"],
    affiliations: [
      "Stanford University, Stanford, CA, USA",
      "University of Oxford, Oxford, UK",
    ],
    ror_ids: ["00f54p054", "052gg0110"],
    institution_names: ["Stanford University", "University of Oxford"],
    searchable_names: [
      "Stanford University",
      "Stanford",
      "University of Oxford",
      "Oxford",
    ],
    countries: ["United States", "United Kingdom"],
    subjects: ["Quantum Physics", "Quantum Computation"],
    subject_codes: ["quant-ph", "cs.CC"],
    has_publication: false,
  },
  {
    id: "work-3",
    doi: "10.48550/arXiv.2303.00003",
    arxiv_id: "2303.00003",
    arxiv_id_link: "https://arxiv.org/abs/2303.00003",
    title: "Climate Modeling with Neural Networks",
    year: 2022,
    authors: ["Eve Martinez"],
    affiliations: ["ETH Zurich, Zurich, Switzerland"],
    ror_ids: ["05a28rw58"],
    institution_names: ["ETH Zurich"],
    searchable_names: ["ETH Zurich", "Swiss Federal Institute of Technology"],
    countries: ["Switzerland"],
    subjects: ["Atmospheric Science", "Machine Learning"],
    subject_codes: ["physics.ao-ph", "cs.LG"],
    has_publication: false,
  },
];

export const mockSearchResponse = {
  found: 3,
  hits: mockWorks.map((work) => ({
    document: work,
    highlights: [],
    text_match: 100,
  })),
  facet_counts: [
    {
      field_name: "year",
      counts: [
        { value: "2023", count: 2 },
        { value: "2022", count: 1 },
      ],
    },
    {
      field_name: "subject_codes",
      counts: [
        { value: "cs.LG", count: 2 },
        { value: "cs.AI", count: 1 },
        { value: "quant-ph", count: 1 },
      ],
    },
    {
      field_name: "countries",
      counts: [
        { value: "United States", count: 2 },
        { value: "United Kingdom", count: 1 },
        { value: "Switzerland", count: 1 },
      ],
    },
    {
      field_name: "has_publication",
      counts: [
        { value: "true", count: 1 },
        { value: "false", count: 2 },
      ],
    },
  ],
  page: 1,
  out_of: 3,
  request_params: {
    per_page: 20,
  },
};
