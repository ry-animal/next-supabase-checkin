import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseApiKey = process.env.SUPABASE_API_KEY || '';

    if (!supabaseUrl || !supabaseApiKey) {
      return NextResponse.json(
        {
          message: 'Supabase credentials are missing in environment variables',
          status: 500,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseApiKey);

    // Fetch all users from the database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('lastcheckin', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        {
          message: 'Failed to fetch users',
          error: JSON.stringify(error),
          status: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: data,
      status: 200,
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch users',
        error: JSON.stringify(error),
        status: 500,
      },
      { status: 500 }
    );
  }
}
