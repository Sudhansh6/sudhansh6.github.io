// Articles published on other sites: listed under Publications, on the home page, and on /writing.
export interface Elsewhere { title: string; authors: string[]; url: string; venue: string; date: string; blurb: string }

export const ELSEWHERE: Elsewhere[] = [
  {
    title: 'OpenAI GPT-5 outperforms o3 with 83% correctness, and Glean customers can put it to work today',
    authors: ['Xinyu Zhao', 'Sudhansh Peddabomma', 'Seema Jethani', 'Julie Mills'],
    url: 'https://www.glean.com/blog/open-ai-gpt-5',
    venue: 'Glean Blog',
    date: '2025-08-07',
    blurb: 'Launch-day evaluation of GPT-5 against o3 on Glean’s production agents, scored by 25+ LLM judges for correctness, completeness, and alignment with human feedback, and what changed in tool use, planning, and formatting.',
  },
  {
    title: 'How Digital Twins Accelerate AI Model Deployment',
    authors: ['Apurva Shah', 'Felipe Mejia', 'Sudhansh Peddabomma', 'Mish Sukharev'],
    url: 'https://www.research.autodesk.com/blog/how-digital-twins-accelerate-ai-model-deployment/',
    venue: 'Autodesk Research',
    date: '2025-05-07',
    blurb: 'Digital twins of skateboard parts built with photogrammetry and with Gaussian splatting, used as synthetic training data for a robotic-assembly vision model (Duality AI × Autodesk Research Residency).',
  },
];
