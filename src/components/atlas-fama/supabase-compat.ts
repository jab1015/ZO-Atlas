type ChainResult = { data: unknown[]; error: Error | null };
type Chain = {
  data?: unknown[];
  error: Error | null;
  select: (...args: unknown[]) => Chain;
  order: (...args: unknown[]) => Promise<ChainResult>;
  eq: (...args: unknown[]) => Chain;
  update: (...args: unknown[]) => Chain;
  in: (...args: unknown[]) => Promise<ChainResult>;
};

const chain = (): Chain => ({
  data: [],
  error: null,
  select: () => chain(),
  order: async () => ({ data: [], error: null }),
  eq: () => chain(),
  update: () => chain(),
  in: async () => ({ data: [], error: null }),
});

export const supabase = {
  from: (_table: string): Chain => chain(),
  functions: {
    invoke: async (_name: string, _options?: unknown): Promise<{ data: { reply: string; error?: string } | null; error: Error | null }> => ({
      data: { reply: "Atlas is connected to the Convex runtime. This department action is queued for its backend implementation." }, error: null,
    }),
  },
};
