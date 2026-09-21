export const providers = ['VERCEL', 'RENDER', 'RAILWAY', 'FLY.IO', 'AWS LAMBDA']

export const steps = [
  {
    number: '01',
    title: 'Add your service',
    description:
      'Point Emberline at any public endpoint. No SDK or infrastructure changes required.',
  },
  {
    number: '02',
    title: 'Set a warm policy',
    description:
      'Choose when your service should be ready and when it can safely sleep.',
  },
  {
    number: '03',
    title: 'We monitor readiness',
    description:
      'Lightweight requests track latency, health, and likely cold starts in real time.',
  },
  {
    number: '04',
    title: 'Users arrive faster',
    description:
      'Your application is awake and ready before the first real request arrives.',
  },
] as const

export const latencyBars = [
  22, 34, 28, 38, 31, 35, 88, 42, 32, 29, 34, 30, 27, 32, 25, 29,
]
