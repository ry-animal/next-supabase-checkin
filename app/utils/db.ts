import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_API_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define a generic type for document data
interface DocumentData {
  id?: string;
  [key: string]: unknown; // Using unknown instead of any for better type safety
}

const db = {
  collection: (table: string) => ({
    doc: (id: string) => ({
      get: async () => {
        const { data, error } = await supabase.from(table).select('*').eq('id', id).single();

        if (error) throw error;

        return {
          exists: !!data,
          data: () => data as DocumentData,
        };
      },
      create: async (document: DocumentData) => {
        const { data, error } = await supabase
          .from(table)
          .insert([{ id, ...document }])
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      update: async (updates: DocumentData) => {
        const { data, error } = await supabase
          .from(table)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
    }),
  }),
};

export default db;
