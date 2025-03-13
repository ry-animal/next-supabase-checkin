import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
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

    // In a real app, you'd get the userId from the request/auth
    const userId = '123';
    const currentDate = new Date().toISOString();

    // Get user record if it exists
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('userid', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 error

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

    // If user doesn't exist, create a new record
    if (!userData) {
      const newUser = {
        id: crypto.randomUUID(), // Generate a unique ID
        userid: userId,
        lastcheckin: currentDate,
        count: 1,
        streak: 1,
        checkinhistory: JSON.stringify([currentDate]),
      };

      const { error: insertError } = await supabase.from('users').insert(newUser);

      if (insertError) {
        console.error('Error creating user record:', insertError);
        return NextResponse.json(
          {
            message: 'Failed to create user record',
            error: JSON.stringify(insertError),
            status: 500,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'First checkin successful',
        count: 1,
        streak: 1,
        status: 200,
      });
    }

    // When using Supabase, handle date serialization
    const lastCheckin = userData.lastcheckin ? new Date(userData.lastcheckin) : null;

    if (!lastCheckin) {
      // User exists but has never checked in (should not normally happen)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          lastcheckin: currentDate,
          count: 1,
          streak: 1,
          checkinhistory: JSON.stringify([currentDate]),
        })
        .eq('userid', userId);

      if (updateError) {
        console.error('Error updating user record:', updateError);
        return NextResponse.json(
          {
            message: 'Failed to update user record',
            error: JSON.stringify(updateError),
            status: 500,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'First checkin successful',
        count: 1,
        streak: 1,
        status: 200,
      });
    }

    // Check if the last check-in was on a different UTC day
    const lastCheckinDate = new Date(
      Date.UTC(lastCheckin.getUTCFullYear(), lastCheckin.getUTCMonth(), lastCheckin.getUTCDate())
    );

    const currentUTCDate = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate())
    );

    // Get yesterday's date in UTC
    const yesterdayUTCDate = new Date(currentUTCDate);
    yesterdayUTCDate.setUTCDate(yesterdayUTCDate.getUTCDate() - 1);

    // Calculate streak
    let streak = userData.streak || 0;

    // Parse checkinhistory
    let checkInHistory: Array<string> = [];
    try {
      if (typeof userData.checkinhistory === 'string') {
        checkInHistory = JSON.parse(userData.checkinhistory);
      } else if (Array.isArray(userData.checkinhistory)) {
        checkInHistory = userData.checkinhistory;
      }
    } catch (error) {
      checkInHistory = [];
      console.error('Error parsing check-in history:', error);
    }

    // Ensure it's an array
    if (!Array.isArray(checkInHistory)) {
      checkInHistory = [];
    }

    // Compare UTC dates - if they're the same, the user already checked in today
    if (lastCheckinDate.getTime() === currentUTCDate.getTime()) {
      // Already checked in today, just update history if needed
      checkInHistory.push(currentDate);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          checkinhistory: JSON.stringify(checkInHistory),
        })
        .eq('userid', userId);

      if (updateError) {
        console.error('Error updating check-in history:', updateError);
      }

      return NextResponse.json({
        message: 'You have already checked in today',
        count: userData.count || 1,
        streak,
        status: 200,
        alreadyCheckedIn: true,
      });
    }

    // Update streak calculation:
    // If the last check-in was yesterday, increment streak
    // If the last check-in was before yesterday, reset streak to 1
    if (lastCheckinDate.getTime() === yesterdayUTCDate.getTime()) {
      streak += 1;
    } else if (lastCheckinDate.getTime() < yesterdayUTCDate.getTime()) {
      streak = 1; // Streak broken, reset to 1 for today's check-in
    }

    // Add current check-in to history
    checkInHistory.push(currentDate);

    // Update the user's checkin data - new day, new check-in
    const { error: updateError } = await supabase
      .from('users')
      .update({
        lastcheckin: currentDate,
        count: (userData.count || 0) + 1,
        streak,
        checkinhistory: JSON.stringify(checkInHistory),
      })
      .eq('userid', userId);

    if (updateError) {
      console.error('Error updating user record:', updateError);
      return NextResponse.json(
        {
          message: 'Failed to update user record',
          error: JSON.stringify(updateError),
          status: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Checkin successful',
      totalCheckins: (userData.count || 0) + 1,
      streak,
      status: 200,
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return NextResponse.json(
      {
        message: 'Failed to process checkin',
        error: JSON.stringify(error),
        status: 500,
      },
      { status: 500 }
    );
  }
}
