import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Edit, 
  Save, 
  Settings, 
  Bell, 
  Shield, 
  Key,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  Activity,
  Download,
  Upload,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export function ProfileModule() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    role: user?.user_metadata?.role || 'Innovation Admin',
    department: user?.user_metadata?.department || '',
    phone: user?.user_metadata?.phone || '',
    bio: user?.user_metadata?.bio || '',
    timezone: user?.user_metadata?.timezone || 'America/Toronto',
    language: user?.user_metadata?.language || 'en'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_alerts: true,
    push_notifications: true,
    annuity_reminders: true,
    agreement_expiry: true,
    new_disclosures: true,
    comment_replies: true,
    weekly_digest: true
  })

  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    session_timeout: '8h',
    login_notifications: true
  })

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          department: profileData.department,
          phone: profileData.phone,
          bio: profileData.bio,
          timezone: profileData.timezone,
          language: profileData.language
        }
      })

      if (error) throw error
      
      setIsEditing(false)
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Director': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Innovation Admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'BDC Officer': return 'bg-green-100 text-green-800 border-green-200'
      case 'Contract Manager': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'IP Systems Analyst': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-xl">
            <User className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-semibold">
                {getInitials(profileData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
                <Badge className={getRoleBadgeColor(profileData.role)}>
                  {profileData.role}
                </Badge>
              </div>
              <div className="space-y-1 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                {profileData.department && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{profileData.department}</span>
                  </div>
                )}
                {profileData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profileData.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="font-medium">{new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-0">
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="profile" 
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="profile" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={profileData.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-gray-500">Email cannot be changed here. Contact your administrator.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="e.g., Engineering, Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!isEditing}
                          placeholder="e.g., +1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Role & Permissions</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Current Role</p>
                          <p className="text-sm text-gray-600">Your access level and permissions</p>
                        </div>
                        <Badge className={getRoleBadgeColor(profileData.role)}>
                          {profileData.role}
                        </Badge>
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Permissions:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">View All Modules</Badge>
                          <Badge variant="outline">Edit Records</Badge>
                          <Badge variant="outline">Create Reports</Badge>
                          {profileData.role === 'Director' && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              User Management
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    <p className="text-gray-600 mb-6">Choose how you want to be notified about important events.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">General Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Email Alerts</p>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                          <Switch
                            checked={notificationSettings.email_alerts}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, email_alerts: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-gray-600">Receive browser notifications</p>
                          </div>
                          <Switch
                            checked={notificationSettings.push_notifications}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, push_notifications: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">IP Management Alerts</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Annuity Reminders</p>
                            <p className="text-sm text-gray-600">Patent annuity payment deadlines</p>
                          </div>
                          <Switch
                            checked={notificationSettings.annuity_reminders}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, annuity_reminders: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Agreement Expiry</p>
                            <p className="text-sm text-gray-600">Contract and agreement renewals</p>
                          </div>
                          <Switch
                            checked={notificationSettings.agreement_expiry}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, agreement_expiry: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">New Disclosures</p>
                            <p className="text-sm text-gray-600">When new invention disclosures are submitted</p>
                          </div>
                          <Switch
                            checked={notificationSettings.new_disclosures}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, new_disclosures: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Comment Replies</p>
                            <p className="text-sm text-gray-600">When someone replies to your comments</p>
                          </div>
                          <Switch
                            checked={notificationSettings.comment_replies}
                            onCheckedChange={(checked) => 
                              setNotificationSettings(prev => ({ ...prev, comment_replies: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Digest & Reports</h4>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Weekly Digest</p>
                          <p className="text-sm text-gray-600">Summary of weekly activity and updates</p>
                        </div>
                        <Switch
                          checked={notificationSettings.weekly_digest}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({ ...prev, weekly_digest: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                    <p className="text-gray-600 mb-6">Manage your account security and access controls.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Authentication</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={securitySettings.two_factor_enabled}
                              onCheckedChange={(checked) => 
                                setSecuritySettings(prev => ({ ...prev, two_factor_enabled: checked }))
                              }
                            />
                            {securitySettings.two_factor_enabled && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Enabled
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Session Timeout</p>
                            <Select
                              value={securitySettings.session_timeout}
                              onValueChange={(value) => 
                                setSecuritySettings(prev => ({ ...prev, session_timeout: value }))
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1 hour</SelectItem>
                                <SelectItem value="4h">4 hours</SelectItem>
                                <SelectItem value="8h">8 hours</SelectItem>
                                <SelectItem value="24h">24 hours</SelectItem>
                                <SelectItem value="never">Never</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <p className="text-sm text-gray-600">Automatically log out after period of inactivity</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Login Activity</h4>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Login Notifications</p>
                          <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                        </div>
                        <Switch
                          checked={securitySettings.login_notifications}
                          onCheckedChange={(checked) => 
                            setSecuritySettings(prev => ({ ...prev, login_notifications: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Password</h4>
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                          </div>
                          <Button variant="outline">
                            <Key className="h-4 w-4 mr-2" />
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-red-700">Danger Zone</h4>
                      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">Delete Account</p>
                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                          </div>
                          <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preferences" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Application Preferences</h3>
                    <p className="text-gray-600 mb-6">Customize your experience with the IP Management system.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Localization</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select
                            value={profileData.timezone}
                            onValueChange={(value) => 
                              setProfileData(prev => ({ ...prev, timezone: value }))
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Toronto">Eastern Time (Toronto)</SelectItem>
                              <SelectItem value="America/Vancouver">Pacific Time (Vancouver)</SelectItem>
                              <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                              <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                              <SelectItem value="Europe/London">GMT (London)</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select
                            value={profileData.language}
                            onValueChange={(value) => 
                              setProfileData(prev => ({ ...prev, language: value }))
                            }
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Data & Privacy</h4>
                      <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Export Data</p>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">Download a copy of all your data</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">Activity Log</p>
                            <Button variant="outline">
                              <Activity className="h-4 w-4 mr-2" />
                              View Log
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">See your recent activity and login history</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Dashboard Preferences</h4>
                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-2">Default Dashboard View</p>
                        <p className="text-sm text-gray-600 mb-4">Choose which widgets appear on your dashboard by default</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="disclosure-summary" defaultChecked />
                            <label htmlFor="disclosure-summary" className="text-sm">Disclosure Summary</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="upcoming-annuities" defaultChecked />
                            <label htmlFor="upcoming-annuities" className="text-sm">Upcoming Annuities</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="recent-activity" defaultChecked />
                            <label htmlFor="recent-activity" className="text-sm">Recent Activity</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="startup-funnel" />
                            <label htmlFor="startup-funnel" className="text-sm">Startup Funnel</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}