"use client";

import React, { useState } from 'react';
import { supabase } from "@/lib/supabase/supabaseClient";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LocationImporter() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setResults(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    const locations = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const location = {
        name: values[0] || '',
        slug: values[1] || '',
        city: values[2] || '',
        state_province: values[3] || undefined,
        country: values[4] || '',
        timezone: values[5] || '',
        address_line1: values[6] || undefined,
        postal_code: values[7] || undefined,
        phone: values[8] || undefined,
        email: values[9] || undefined,
        is_active: values[10]?.toLowerCase() === 'true'
      };
      locations.push(location);
    }

    return locations;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      setUploading(false);
      setProcessing(true);

      const fileContent = await file.text();
      const locations = parseCSV(fileContent);
      
      console.log('Parsed locations:', locations);
      console.log('Number of locations to import:', locations.length);

      if (locations.length === 0) {
        setError('No locations found in CSV. Please check the file format.');
        return;
      }

      const results = await Promise.all(
        locations.map(async (loc, index) => {
          console.log(`Inserting location ${index + 1}:`, loc);
          const result = await supabase
            .from('franchise_locations')
            .insert([loc])
            .select();
          console.log(`Result for ${loc.name}:`, result);
          return { loc, result };
        })
      );

      console.log('All results:', results);
      
      const successful = results.filter(r => !r.result.error && r.result.data);
      const failed = results.filter(r => r.result.error || !r.result.data);
      
      console.log('Successful:', successful.length, successful.map(r => r.result.data));
      console.log('Failed:', failed.length, failed.map(r => r.result.error));
      
      setResults({
        count: successful.length,
        locations: successful.map(r => r.result.data?.[0]).filter(Boolean),
        failed: failed.length,
        errors: failed.map(r => r.result.error?.message || 'No data returned')
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to import locations: ' + JSON.stringify(err));
      setResults(null);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const testSupabaseConnection = async () => {
    setUploading(true);
    setError(null);
    
    try {
      console.log('Testing Supabase connection...');
      
      const testLocation = {
        name: 'Test Location ' + Date.now(),
        slug: 'test-' + Date.now(),
        city: 'Test City',
        country: 'Canada',
        timezone: 'America/Toronto',
        is_active: true
      };
      
      console.log('Inserting test location:', testLocation);
      
      const result = await supabase
        .from('franchise_locations')
        .insert([testLocation])
        .select();
      
      console.log('Supabase test result:', result);
      
      if (result.error) {
        setError('Supabase Error: ' + result.error.message);
      } else if (result.data) {
        setResults({
          count: 1,
          locations: [result.data[0]],
          failed: 0,
          errors: []
        });
      } else {
        setError('No data returned from Supabase. Check RLS policies.');
      }
    } catch (err) {
      console.error('Supabase test error:', err);
      setError('Connection Error: ' + err.message);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `name,slug,city,state_province,country,timezone,address_line1,postal_code,phone,email,is_active
Skill Samurai Toronto,toronto,Toronto,Ontario,Canada,America/Toronto,123 Main St,M5H 2N2,416-555-0100,toronto@skillsamurai.com,true`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'locations_template.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Import Locations</h1>
          <p className="text-slate-600">Upload a CSV file to bulk import location data</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload CSV File</span>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <div className="text-lg font-semibold text-slate-900 mb-2">
                  {file ? file.name : 'Choose CSV file'}
                </div>
                <div className="text-sm text-slate-500">
                  or drag and drop your CSV file here
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {file && !results && (
              <div className="space-y-3">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || processing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Import Locations
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={testSupabaseConnection}
                  disabled={uploading || processing}
                  variant="outline"
                  className="w-full"
                >
                  Test Supabase Connection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {results && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-emerald-900">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                Import Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-3xl font-bold text-emerald-900">{results.count}</div>
                  <div className="text-sm text-emerald-700">Locations imported</div>
                </div>
                {results.failed > 0 && (
                  <div>
                    <div className="text-3xl font-bold text-red-600">{results.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                )}
              </div>

              {/* Show errors if any */}
              {results.errors && results.errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-semibold text-red-900 mb-2">Import Errors:</div>
                  {results.errors.map((err, i) => (
                    <div key={i} className="text-sm text-red-700 font-mono">
                      {err}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {results.locations && results.locations.map((loc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                    <div>
                      <div className="font-semibold text-slate-900">{loc.name}</div>
                      <div className="text-sm text-slate-600">
                        {loc.city}, {loc.country}
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">
                      Imported
                    </Badge>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  setFile(null);
                  setResults(null);
                }}
                variant="outline"
                className="w-full"
              >
                Import Another File
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-lg bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg">CSV Format Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <p>Your CSV should include the following columns:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>name</strong> - Location name (required)</li>
              <li><strong>slug</strong> - URL-friendly identifier (required)</li>
              <li><strong>city</strong> - City name</li>
              <li><strong>state_province</strong> - State or Province</li>
              <li><strong>country</strong> - Country</li>
              <li><strong>timezone</strong> - Timezone identifier (required)</li>
              <li><strong>address_line1</strong> - Street address</li>
              <li><strong>postal_code</strong> - ZIP or postal code</li>
              <li><strong>phone</strong> - Contact phone</li>
              <li><strong>email</strong> - Contact email</li>
              <li><strong>is_active</strong> - Active status (true/false)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}