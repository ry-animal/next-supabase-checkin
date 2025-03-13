'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    message: string;
    details?: {
      rowCount?: number;
      status?: number;
      error?: unknown;
      [key: string]: unknown;
    };
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResponse(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setResponse({
        success: false,
        message: 'Please select a file to upload',
      });
      return;
    }

    // Check if file is CSV or TSV
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv')) {
      setResponse({
        success: false,
        message: 'Please upload a CSV or TSV file',
      });
      return;
    }

    setIsUploading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResponse({
          success: true,
          message: data.message,
          details: data,
        });
      } else {
        setResponse({
          success: false,
          message: data.message,
          details: data,
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: 'An error occurred while uploading the file',
        details: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-10">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Upload a CSV or TSV file. The first row should be the headers of the table, and your
            headers should not include any special characters other than hyphens (-) or underscores
            (_).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.tsv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Tip: Datetime columns should be formatted as YYYY-MM-DD HH:mm:ss
                </p>
              </div>
              <Button type="submit" disabled={!file || isUploading} className="w-full">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
        {response && (
          <CardFooter>
            <Alert variant={response.success ? 'default' : 'destructive'}>
              {response.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{response.success ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>
                {response.message}
                {response.details && response.details.rowCount && (
                  <p className="mt-2">Imported {response.details.rowCount} rows.</p>
                )}
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
