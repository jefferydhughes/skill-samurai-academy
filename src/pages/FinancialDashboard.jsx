import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export default function FinancialDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const queryClient = useQueryClient();

  // Revenue data
  const { data: revenueData = [], isLoading: revenueLoading } = useQuery({
    queryKey: ['financial-revenue', timeRange],
    queryFn: async () => {
      // Mock data for now - would be real API call
      return [
        { date: '2024-01-01', revenue: 12000, fees: 1200, net: 10800 },
        { date: '2024-01-08', revenue: 15000, fees: 1500, net: 13500 },
        { date: '2024-01-15', revenue: 18000, fees: 1800, net: 16200 },
        { date: '2024-01-22', revenue: 16500, fees: 1650, net: 14850 },
        { date: '2024-01-29', revenue: 22000, fees: 2200, net: 19800 },
      ];
    },
  });

  // Platform fees data
  const { data: platformFees = [], isLoading: feesLoading } = useQuery({
    queryKey: ['platform-fees'],
    queryFn: async () => {
      // Mock data - would be real API call
      return [
        { 
          id: 1,
          transfer_id: 'tr_xxx',
          location_name: 'Skill Samurai Moncton',
          total_amount: 12000,
          platform_fee_amount: 1200,
          net_amount_to_location: 10800,
          status: 'completed',
          transfer_date: '2024-01-15T10:00:00Z',
          product_type: 'class',
        },
        {
          id: 2,
          transfer_id: 'tr_yyy',
          location_name: 'Skill Samurai Toronto',
          total_amount: 18000,
          platform_fee_amount: 1800,
          net_amount_to_location: 16200,
          status: 'pending',
          transfer_date: '2024-01-16T14:30:00Z',
          product_type: 'camp',
        },
      ];
    },
  });

  // Location performance data
  const { data: locationPerformance = [] } = useQuery({
    queryKey: ['location-performance'],
    queryFn: async () => {
      // Mock data
      return [
        { name: 'Moncton', revenue: 45000, growth: 12.5, students: 85, classes: 120 },
        { name: 'Toronto', revenue: 62000, growth: -3.2, students: 120, classes: 180 },
        { name: 'Vancouver', revenue: 38000, growth: 8.7, students: 65, classes: 95 },
        { name: 'Calgary', revenue: 28000, growth: 15.3, students: 45, classes: 70 },
      ];
    },
  });

  // Summary metrics
  const summaryMetrics = {
    totalRevenue: revenueData.reduce((sum, day) => sum + day.revenue, 0),
    platformFees: revenueData.reduce((sum, day) => sum + day.fees, 0),
    netToLocations: revenueData.reduce((sum, day) => sum + day.net, 0),
    totalTransfers: platformFees.length,
    pendingTransfers: platformFees.filter(f => f.status === 'pending').length,
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['financial-revenue'] });
    queryClient.invalidateQueries({ queryKey: ['platform-fees'] });
    queryClient.invalidateQueries({ queryKey: ['location-performance'] });
  };

  const exportData = (type) => {
    // Export functionality would be implemented here
    console.log(`Exporting ${type} data...`);
  };

  if (revenueLoading || feesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
          <p className="text-gray-600">Revenue tracking and platform fee management</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => exportData('financial')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summaryMetrics.totalRevenue / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summaryMetrics.platformFees / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              10% average rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net to Locations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(summaryMetrics.netToLocations / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +18.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalTransfers}</div>
            <p className="text-xs text-muted-foreground">
              {summaryMetrics.pendingTransfers} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="transfers">Platform Fees</TabsTrigger>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tickFormatter={(value) => `$${value / 100}`} />
                  <Tooltip 
                    formatter={(value) => [`$${value / 100}`, '']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Fees Tab */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Fees & Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fee.location_name}</span>
                        <Badge variant="outline">{fee.product_type}</Badge>
                        {fee.status === 'completed' ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Transfer ID: {fee.transfer_id} • {new Date(fee.transfer_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(fee.total_amount / 100).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">
                        Platform Fee: ${(fee.platform_fee_amount / 100).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">
                        Net: ${(fee.net_amount_to_location / 100).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Performance Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`$${value / 1000}k`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {locationPerformance.map((location) => (
                  <div key={location.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{location.name}</h3>
                      <div className="flex items-center gap-1">
                        {location.growth > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`text-sm ${location.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(location.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div>
                        <div className="text-gray-600">Revenue</div>
                        <div className="font-medium">${(location.revenue / 1000).toFixed(1)}k</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Students</div>
                        <div className="font-medium">{location.students}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Classes</div>
                        <div className="font-medium">{location.classes}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}