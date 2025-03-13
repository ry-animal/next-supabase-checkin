import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

    // Parse the CSV/TSV content from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          message: 'No file uploaded',
          status: 400,
        },
        { status: 400 }
      );
    }

    // Determine delimiter based on file extension
    const isCSV = file.name.endsWith('.csv');
    const isTSV = file.name.endsWith('.tsv');

    if (!isCSV && !isTSV) {
      return NextResponse.json(
        {
          message: 'Unsupported file format. Please upload a CSV or TSV file.',
          status: 400,
        },
        { status: 400 }
      );
    }

    const delimiter = isCSV ? ',' : '\t';

    // Read the file content
    const fileContent = await file.text();
    const rows = fileContent.split('\n');

    // Parse headers (first row)
    const headers = rows[0].split(delimiter).map((header) => header.trim());

    // Check if any headers contain special characters other than hyphens or underscores
    const invalidHeaders = headers.filter((header) => !/^[a-zA-Z0-9_-]+$/.test(header));
    if (invalidHeaders.length > 0) {
      return NextResponse.json(
        {
          message:
            'Headers contain invalid characters. Only alphanumeric characters, hyphens (-), and underscores (_) are allowed.',
          invalidHeaders,
          status: 400,
        },
        { status: 400 }
      );
    }

    // Parse data rows
    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (row) {
        const values = row.split(delimiter).map((value) => value.trim());

        // Skip if row has fewer values than headers
        if (values.length < headers.length) {
          continue;
        }

        // Create an object for each row
        const rowObject: Record<string, string | number | boolean | null> = {};

        headers.forEach((header, index) => {
          const value = values[index] || null;

          // Process the value based on content
          if (value === null || value === '' || value.toLowerCase() === 'null') {
            rowObject[header] = null;
          }
          // Try to parse datetime values in YYYY-MM-DD HH:mm:ss format
          else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
            rowObject[header] = value; // Keep as string, Supabase will parse it
          }
          // Parse boolean values
          else if (value.toLowerCase() === 'true') {
            rowObject[header] = true;
          } else if (value.toLowerCase() === 'false') {
            rowObject[header] = false;
          }
          // Parse numeric values
          else if (!isNaN(Number(value)) && value !== '') {
            rowObject[header] = Number(value);
          }
          // Keep as string for everything else
          else {
            rowObject[header] = value;
          }
        });

        data.push(rowObject);
      }
    }

    if (data.length === 0) {
      return NextResponse.json(
        {
          message: 'No valid data rows found in the file',
          status: 400,
        },
        { status: 400 }
      );
    }

    // First check if the users table exists
    const { error: tableCheckError } = await supabase.from('users').select('id').limit(1).single();

    // If table doesn't exist, create it based on the schema from the uploaded file
    if (tableCheckError && tableCheckError.code === 'PGRST116') {
      return NextResponse.json(
        {
          message: 'The users table does not exist. Please run the database setup endpoint first.',
          status: 404,
        },
        { status: 404 }
      );
    }

    // Insert the data into the users table
    const { error } = await supabase.from('users').insert(data);

    if (error) {
      return NextResponse.json(
        {
          message: 'Failed to insert data into the database',
          error,
          status: 500,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Data imported successfully',
      rowCount: data.length,
      status: 200,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        message: 'Failed to import data',
        error: JSON.stringify(error),
        status: 500,
      },
      { status: 500 }
    );
  }
}
