import db from "@/app/utils/db";
import { NextResponse } from "next/server";

interface UserData {
    userid: string;
    lastcheckin: Date | string;
    count: number;
    streak: number;
    checkinhistory: Array<Date | string> | string;
    [key: string]: unknown;
}

export async function POST() {
    try {
        // In a real app, you'd get the userId from the request/auth
        const userId = '123';
        const currentDate = new Date();
        
        // get last checkin if it exists
        const doc = await db.collection("User").doc(userId).get();
        
        if (!doc.exists) {
            // First time user is checking in
            await db.collection("User").doc(userId).create({
                userid: userId,
                lastcheckin: currentDate,
                count: 1,
                streak: 1,
                checkinhistory: [currentDate]
            });
            
            return NextResponse.json({
                message: "First checkin successful",
                count: 1,
                streak: 1,
                status: 200,
            });
        }
        
        const userData = doc.data() as UserData;
        // When using Supabase, we need to handle date serialization differently
        // Supabase stores dates as strings in ISO format
        const lastCheckin = userData.lastcheckin instanceof Date 
            ? userData.lastcheckin 
            : new Date(userData.lastcheckin as string);
            
        // Check if the last check-in was on a different UTC day
        const lastCheckinDate = new Date(Date.UTC(
            lastCheckin.getUTCFullYear(),
            lastCheckin.getUTCMonth(),
            lastCheckin.getUTCDate()
        ));
        
        const currentUTCDate = new Date(Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth(),
            currentDate.getUTCDate()
        ));
        
        // Get yesterday's date in UTC
        const yesterdayUTCDate = new Date(currentUTCDate);
        yesterdayUTCDate.setUTCDate(yesterdayUTCDate.getUTCDate() - 1);
        
        // Calculate streak
        let streak = userData.streak || 0;
        
        // Compare UTC dates - if they're the same, the user already checked in today
        if (lastCheckinDate.getTime() === currentUTCDate.getTime()) {
            // Track this attempt in history even though it's a duplicate
            // Handle the case where checkinhistory might be stored differently in Supabase
            let checkInHistory: Array<Date | string> = [];
            
            // If checkinhistory is a string (JSON), parse it
            if (typeof userData.checkinhistory === 'string') {
                try {
                    checkInHistory = JSON.parse(userData.checkinhistory) as Array<Date | string>;
                } catch {
                    checkInHistory = [];
                }
            } else if (Array.isArray(userData.checkinhistory)) {
                checkInHistory = userData.checkinhistory;
            }
            
            if (!Array.isArray(checkInHistory)) {
                // Handle case where checkinhistory exists but isn't an array
                await db.collection("User").doc(userId).update({
                    checkinhistory: [currentDate]
                });
            } else {
                await db.collection("User").doc(userId).update({
                    checkinhistory: [...checkInHistory, currentDate]
                });
            }

            return NextResponse.json({
                message: "You have already checked in today",
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
        
        // Get existing check-in history or initialize empty array
        let checkInHistory: Array<Date | string> = [];
        
        // If checkinhistory is a string (JSON), parse it
        if (typeof userData.checkinhistory === 'string') {
            try {
                checkInHistory = JSON.parse(userData.checkinhistory) as Array<Date | string>;
            } catch {
                checkInHistory = [];
            }
        } else if (Array.isArray(userData.checkinhistory)) {
            checkInHistory = userData.checkinhistory;
        }
        
        if (!Array.isArray(checkInHistory)) {
            // Handle case where checkinhistory exists but isn't an array
            await db.collection("User").doc(userId).update({
                lastcheckin: currentDate,
                count: (userData.count || 0) + 1,
                streak,
                checkinhistory: [currentDate]
            });
        } else {
            // Update the user's checkin data - new day, new check-in
            await db.collection("User").doc(userId).update({
                lastcheckin: currentDate,
                count: (userData.count || 0) + 1,
                streak,
                checkinhistory: [...checkInHistory, currentDate]
            });
        }
        
        return NextResponse.json({
            message: "Checkin successful",
            totalCheckins: (userData.count || 0) + 1,
            streak,
            status: 200,
        });
    } catch (error) {
        console.error("Checkin error:", error);
        return NextResponse.json({
            message: "Failed to process checkin",
            error: JSON.stringify(error),
            status: 500,
        }, { status: 500 });
    }
} 