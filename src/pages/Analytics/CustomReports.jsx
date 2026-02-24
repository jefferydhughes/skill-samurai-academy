import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function CustomReports() {
  const [filters, setFilters] = useState({
    reportType: 'enrollments',
    programId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [reportGenerated, setReportGenerated] = useState(false);

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => api.entities.Program.list(),
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => api.entities.Academy.list(),
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => api.entities.Enrollment.list(),
    enabled: reportGenerated && filters.reportType === 'enrollments',
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.entities.StudentProfile.list(),
    enabled: reportGenerated && filters.reportType === 'students',
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.entities.Booking.list(),
    enabled: reportGenerated && filters.reportType === 'revenue',
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.entities.ClassSession.list(),
    enabled: reportGenerated,
  });

  const generateReport = () => {
    setReportGenerated(true);
  };

  const filterData = () => {
    let data = [];
    
    if (filters.reportType === 'enrollments') {
      data = enrollments.filter(item => {
        let matches = true;
        if (filters.programId) matches = matches && item.programId === filters.programId;
        if (filters.locationId) matches = matches && item.academyId === filters.locationId;
        if (filters.status) matches = matches && item.status === filters.status;
        if (filters.startDate) matches = matches && new Date(item.created_date) >= new Date(filters.startDate);
        if (filters.endDate) matches = matches && new Date(item.created_date) <= new Date(filters.endDate);
        return matches;
      });
    } else if (filters.reportType === 'students') {
      data = students.filter(item => {
        let matches = true;
        if (filters.locationId) matches = matches && item.academyId === filters.locationId;
        if (filters.startDate) matches = matches && new Date(item.created_date) >= new Date(filters.startDate);
        if (filters.endDate) matches = matches && new Date(item.created_date) <= new Date(filters.endDate);
        return matches;
      });
    } else if (filters.reportType === 'revenue') {
      data = bookings.filter(item => {
        let matches = true;
        if (filters.programId) matches = matches && item.programId === filters.programId;
        if (filters.locationId) matches = matches && item.academyId === filters.locationId;
        if (filters.startDate) matches = matches && new Date(item.created_date) >= new Date(filters.startDate);
        if (filters.endDate) matches = matches && new Date(item.created_date) <= new Date(filters.endDate);
        return matches;
      });
    }
    
    return data;
  };

  const exportToCSV = () => {
    const data = filterData();
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${filters.reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredData = reportGenerated ? filterData() : [];

  const getProgram = (id) => programs.find(p => p.id === id);
  const getLocation = (id) => locations.find(l => l.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Custom Reports</h1>
        <p className="text-slate-600 mt-1">Generate reports based on custom criteria</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={filters.reportType} onValueChange={(value) => setFilters({ ...filters, reportType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrollments">Enrollments</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Program</Label>
              <Select value={filters.programId} onValueChange={(value) => setFilters({ ...filters, programId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Programs</SelectItem>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select value={filters.locationId} onValueChange={(value) => setFilters({ ...filters, locationId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location.id} value={location.id}>{location.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            {filters.reportType === 'enrollments' && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>All Statuses</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={generateReport} className="bg-indigo-600 hover:bg-indigo-700">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            {reportGenerated && filteredData.length > 0 && (
              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportGenerated && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Results</CardTitle>
              <Badge variant="secondary">{filteredData.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No data matches your criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {filters.reportType === 'enrollments' && (
                        <>
                          <TableHead>Program</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Payment Status</TableHead>
                        </>
                      )}
                      {filters.reportType === 'students' && (
                        <>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Enrolled</TableHead>
                        </>
                      )}
                      {filters.reportType === 'revenue' && (
                        <>
                          <TableHead>Program</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.slice(0, 50).map((item, index) => (
                      <TableRow key={index}>
                        {filters.reportType === 'enrollments' && (
                          <>
                            <TableCell>{getProgram(item.programId)?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{item.status}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(item.created_date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>{item.paymentStatus}</TableCell>
                          </>
                        )}
                        {filters.reportType === 'students' && (
                          <>
                            <TableCell>{item.displayName}</TableCell>
                            <TableCell>{item.age}</TableCell>
                            <TableCell>{item.gradeRange}</TableCell>
                            <TableCell>{format(new Date(item.created_date), 'MMM d, yyyy')}</TableCell>
                          </>
                        )}
                        {filters.reportType === 'revenue' && (
                          <>
                            <TableCell>{getProgram(item.programId)?.name || 'N/A'}</TableCell>
                            <TableCell>${((item.amount || 0) / 100).toFixed(2)}</TableCell>
                            <TableCell>{item.paymentStatus}</TableCell>
                            <TableCell>{format(new Date(item.created_date), 'MMM d, yyyy')}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredData.length > 50 && (
                  <p className="text-sm text-slate-500 text-center mt-4">
                    Showing first 50 of {filteredData.length} records. Export to CSV to see all.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}