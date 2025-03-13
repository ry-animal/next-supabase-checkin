import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseApiKey = process.env.SUPABASE_API_KEY || '';

    if (!supabaseUrl || !supabaseApiKey) {
      return NextResponse.json({
        message: 'Supabase credentials are missing in environment variables',
        status: 500,
        envVars: {
          url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          key: !!process.env.SUPABASE_API_KEY
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseApiKey);

    const { data, error: tableCheckError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      if (tableCheckError.code === '42P01') { // Table doesn't exist error code
        return NextResponse.json({
          message: 'The users table does not exist. Please run the following SQL in your Supabase SQL Editor:',
          sql: `
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  userid TEXT NOT NULL,
  lastcheckin TIMESTAMP WITH TIME ZONE,
  count INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  checkinhistory JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
          `,
          status: 404,
        }, { status: 404 });
      } else {
        return NextResponse.json({
          message: 'Error checking for existing tables',
          error: tableCheckError,
          status: 500,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Database tables already exist',
      tableData: data,
      status: 200,
    });
  } catch (error) {
    console.error('Setup database error:', error);
    return NextResponse.json({
      message: 'Failed to check database setup',
      error: JSON.stringify(error),
      status: 500,
    }, { status: 500 });
  }
}

// Helper SQL function if needed for manual setup in Supabase SQL editor:
/*
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  userid TEXT NOT NULL,
  lastcheckin TIMESTAMP WITH TIME ZONE,
  count INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  checkinhistory JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    userid TEXT NOT NULL,
    lastcheckin TIMESTAMP WITH TIME ZONE,
    count INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    checkinhistory JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
END;
$$ LANGUAGE plpgsql;
*/ 