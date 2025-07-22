import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  FileText, 
  Lightbulb, 
  Building2, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalDisclosures: number;
  totalProjects: number;
  totalStartups: number;
  totalAgreements: number;
  recentActivity: any[];
  upcomingDeadlines: any[];
  disclosuresByStage: any[];
  trlDistribution: any[];
  startupsByStage: any[];
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDisclosures: 0,
    totalProjects: 0,
    totalStartups: 0,
    totalAgreements: 0,
    recentActivity: [],
    upcomingDeadlines: [],
    disclosuresByStage: [],
    trlDistribution: [],
    startupsByStage: []
  });
  const [loading, setLoading] = useState(true);

  const processDisclosuresByStage = (disclosures: any[]) => {
    const stages = ['Received', 'In Review', 'Approved', 'Filed'];
    return stages.map(stage => ({
      stage,
      count: disclosures.filter(d => d.stage === stage).length
    }));
  };

  const processTRLDistribution = (disclosures: any[]) => {
    const trlCounts: { [key: number]: number } = {};
    disclosures.forEach(d => {
      if (d.trl) {
        trlCounts[d.trl] = (trlCounts[d.trl] || 0) + 1;
      }
    });
    
    return Object.entries(trlCounts).map(([trl, count]) => ({
      trl: `TRL ${trl}`,
      count
    }));
  };

  const processStartupsByStage = (startups: any[]) => {
    const stages = ['Idea', 'Pre-Seed', 'Seed', 'Revenue', 'Exit'];
    return stages.map(stage => ({
      stage,
      count: startups.filter(s => s.stage === stage).length
    }));
  };

  const generateRecentActivity = (disclosures: any[], startups: any[]) => {
    const activities = [
      ...disclosures.slice(0, 3).map(d => ({
        type: 'disclosure',
        title: d.title || 'New Disclosure',
        time: new Date(d.created_at).toLocaleDateString(),
        icon: Lightbulb
      })),
      ...startups.slice(0, 2).map(s => ({
        type: 'startup',
        title: s.name || 'New Startup',
        time: new Date(s.created_at).toLocaleDateString(),
        icon: Building2
      }))
    ];
    
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  };

  const generateUpcomingDeadlines = () => {
    return [
      {
        title: 'Agreement Renewal - Ford Collaboration',
        date: '2025-09-01',
        type: 'agreement',
        priority: 'medium'
      },
      {
        title: 'Project Milestone Review - Smart Sensor Network',
        date: '2025-08-20',
        type: 'project',
        priority: 'high'
      },
      {
        title: 'Startup Pitch Presentation - BioTech Innovations',
        date: '2025-08-25',
        type: 'startup',
        priority: 'medium'
      }
    ];
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch counts for each module
      const [
        disclosuresResult,
        projectsResult,
        startupsResult,
        agreementsResult
      ] = await Promise.all([
        supabase.from('disclosures').select('*', { count: 'exact' }),
        supabase.from('projects').select('*', { count: 'exact' }),
        supabase.from('startups').select('*', { count: 'exact' }),
        supabase.from('agreements').select('*', { count: 'exact' })
      ]);

      // Fetch detailed data for charts
      const { data: disclosures } = await supabase
        .from('disclosures')
        .select('stage, status, trl, created_at')
        .order('created_at', { ascending: false });

      const { data: startups } = await supabase
        .from('startups')
        .select('stage, status, created_at')
        .order('created_at', { ascending: false });

      // Process data for charts
      const disclosuresByStage = processDisclosuresByStage(disclosures || []);
      const trlDistribution = processTRLDistribution(disclosures || []);
      const startupsByStage = processStartupsByStage(startups || []);

      setStats({
        totalDisclosures: disclosuresResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalStartups: startupsResult.count || 0,
        totalAgreements: agreementsResult.count || 0,
        recentActivity: generateRecentActivity(disclosures || [], startups || []),
        upcomingDeadlines: generateUpcomingDeadlines(),
        disclosuresByStage,
        trlDistribution,
        startupsByStage
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Innovation Team'}!
        </h1>
        <p className="text-blue-100">
          Here's your IP portfolio overview for today
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disclosures</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisclosures}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Startups</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStartups}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agreements</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgreements}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="disclosures" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="disclosures">Disclosures</TabsTrigger>
              <TabsTrigger value="trl">TRL Distribution</TabsTrigger>
              <TabsTrigger value="startups">Startups</TabsTrigger>
            </TabsList>

            <TabsContent value="disclosures">
              <Card>
                <CardHeader>
                  <CardTitle>Disclosures by Stage</CardTitle>
                  <CardDescription>
                    Current status of all invention disclosures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.disclosuresByStage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trl">
              <Card>
                <CardHeader>
                  <CardTitle>Technology Readiness Level Distribution</CardTitle>
                  <CardDescription>
                    TRL levels across all technologies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.trlDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ trl, count }) => `${trl}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.trlDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="startups">
              <Card>
                <CardHeader>
                  <CardTitle>Startup Development Stages</CardTitle>
                  <CardDescription>
                    Progress of university spinouts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.startupsByStage}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-full">
                    <activity.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <Badge 
                      variant={deadline.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {deadline.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(deadline.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Lightbulb className="h-4 w-4 mr-2" />
                New Disclosure
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                Add Startup
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;