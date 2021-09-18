export interface ProductInput {
  title: string;
  price: number;
  description?: string;
  count?: number;
}

export default {
    type: "object",
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      count: { type: 'number' }
    },
    required: ['title', 'price']
  } as const;
