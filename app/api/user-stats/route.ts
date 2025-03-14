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

    // In a real app, you'd get the userId from the request/auth context
    const userId = '123';

    // Get user record if it exists
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('userid', userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user data:', fetchError);
      return NextResponse.json(
        {
          message: 'Failed to fetch user data',
          error: JSON.stringify(fetchError),
          status: 500,
        },
        { status: 500 }
      );
    }

    // If no user was found, return empty stats
    if (!userData) {
      return NextResponse.json({
        totalCheckins: 0,
        streak: 0,
        lastCheckin: null,
        status: 200,
      });
    }

    // Check if the user has already checked in today
    let alreadyCheckedIn = false;

    if (userData.lastcheckin) {
      const lastCheckin = new Date(userData.lastcheckin);
      const lastCheckinDate = new Date(
        Date.UTC(lastCheckin.getUTCFullYear(), lastCheckin.getUTCMonth(), lastCheckin.getUTCDate())
      );

      const currentUTCDate = new Date(
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
      );

      alreadyCheckedIn = lastCheckinDate.getTime() === currentUTCDate.getTime();
    }

    return NextResponse.json({
      totalCheckins: userData.count || 0,
      streak: userData.streak || 0,
      lastCheckin: userData.lastcheckin,
      alreadyCheckedIn,
      status: 200,
    });
  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch user stats',
        error: JSON.stringify(error),
        status: 500,
      },
      { status: 500 }
    );
  }
}
