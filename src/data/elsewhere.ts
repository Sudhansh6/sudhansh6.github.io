// Writing published on other sites, shown at the top of /writing.
export interface Elsewhere { title: string; url: string; venue: string; date: string; blurb: string }

export const ELSEWHERE: Elsewhere[] = [
  {
    title: 'OpenAI GPT-5 outperforms o3 with 83% correctness',
    url: 'https://www.glean.com/blog/open-ai-gpt-5',
    venue: 'Glean blog',
    date: '2025-08-07',
    blurb: 'Launch-day evaluation of GPT-5 against o3 on Glean’s production agents, scored by 25+ LLM judges for correctness, completeness, and alignment with human feedback, and what changed in tool use, planning, and formatting.',
  },
  {
    title: 'How Digital Twins Accelerate AI Model Deployment',
    url: 'https://www.research.autodesk.com/blog/how-digital-twins-accelerate-ai-model-deployment/',
    venue: 'Autodesk Research',
    date: '2025-05-07',
    blurb: 'Digital twins of skateboard parts built with photogrammetry and with Gaussian splatting, used as synthetic training data for a robotic-assembly vision model (Duality AI × Autodesk Research Residency).',
  },
];
