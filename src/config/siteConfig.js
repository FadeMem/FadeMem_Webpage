export const siteConfig = {
  methodName: 'FadeMem',
  title: 'Distance-Aware Memory Consolidation for Autoregressive Video Diffusion',
  tagline: 'Long-horizon autoregressive video generation under a fixed KV cache budget',
  authors: ['Yu Lu*', 'Junjie Yang*', 'Piotr Koniusz', 'YuXin Song', 'Yi Yang'],
  affiliation: 'Zhejiang University · UNSW · Data61/CSIRO · Baidu Inc. · * Equal contribution',
  venue: '',
  links: {
    paper: 'https://arxiv.org/abs/2606.10671',
    code: 'https://github.com/aniki-ly/FadeMem',
    model: 'https://huggingface.co/sanity2025/FadeMem-FT',
    demo: '#results',
  },
  abstract: [
    'Autoregressive video generators synthesize long videos in successive temporal segments, but retaining the full historical KV cache makes storage and attention computation grow with video length.',
    'FadeMem keeps a single bounded memory: recent KV blocks remain fine-grained, while older adjacent entries are progressively merged into coarser span-level anchors for identity and scene coherence.',
    'The mechanism requires no architectural modification and supports both inference-time use and light fine-tuning.',
  ],
  metrics: {
    caption: 'VBench-Long on 128 MovieGenBench prompts in the 60-second single-prompt setting. Average uses half weight on Dynamic Degree.',
    columns: ['Method', 'Subject', 'Background', 'Motion', 'Dynamic', 'Aesthetic', 'Imaging', 'Average'],
    rows: [
      ['Self Forcing', '97.08', '96.32', '98.37', '33.88', '56.87', '66.92', '78.64'],
      ['MemFlow', '97.44', '96.27', '98.72', '40.42', '60.61', '69.98', '80.59'],
      ['LongLive', '97.39', '96.32', '98.78', '41.17', '61.16', '68.81', '80.55'],
      ['Deep Forcing', '96.70', '95.93', '98.20', '46.93', '59.80', '68.81', '80.53'],
      ['MemRoPE', '97.74', '96.32', '98.90', '42.53', '59.54', '68.40', '80.39'],
      ['FadeMem-TF', '97.86', '96.55', '99.03', '42.19', '60.98', '69.62', '80.93'],
      ['FadeMem-FT', '97.73', '96.50', '98.85', '47.06', '61.41', '70.70', '81.59'],
    ],
  },
  citation: `@article{lu2026fademem,
  title   = {FadeMem: Distance-Aware Memory Consolidation for Autoregressive Video Diffusion},
  author  = {Yu Lu and Junjie Yang and Piotr Koniusz and YuXin Song and Yi Yang},
  journal = {arXiv preprint arXiv:2606.10671},
  year    = {2026}
}`,
}
