'use client';

import { useEffect, useState } from 'react';
import { User, Edit3, MapPin, Phone, Mail, Briefcase, Calendar, Save, X } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profile: {
    role: string;
    responsibilities: string;
    grade: string;
    employmentType: string;
    status: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    joiningDate: string;
    lastPromotionDate?: string;
    promotionNotes?: string;
  } | null;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get current user
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();

      if (userData.success) {
        // Get detailed profile
        const profileResponse = await fetch(`/api/employees/${userData.user.id}`);
        const profileData = await profileResponse.json();

        if (profileData.success) {
          setProfile(profileData.employee);
          setEditData({
            phone: profileData.employee.phone,
            address: profileData.employee.address,
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/employees/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: editData,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProfile(data.employee);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(`Failed to update profile: ${data.error}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Unable to load profile</p>
      </div>
    );
  }

  const netSalary = profile.profile 
    ? profile.profile.basicSalary + profile.profile.allowances - profile.profile.deductions
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and edit your personal information</p>
        </div>
        {!editing && (
          <Button 
            onClick={() => setEditing(true)}
            className="flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Contact Info</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900 mt-1">{profile.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-gray-900 mt-1">{profile.username}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="flex items-center mt-1">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <p className="text-gray-900">{profile.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              {editing ? (
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="flex items-center mt-1">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              {editing ? (
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 mt-1"
                  placeholder="Enter complete address"
                />
              ) : (
                <div className="flex items-start mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <p className="text-gray-900">{profile.address}</p>
                </div>
              )}
            </div>

            {editing && (
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={handleSave}
                  loading={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.profile ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Job Title</label>
                  <p className="text-gray-900 mt-1">{profile.profile.role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Grade</label>
                  <p className="text-gray-900 mt-1">{profile.profile.grade}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Employment Type</label>
                  <p className="text-gray-900 mt-1">{profile.profile.employmentType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    profile.profile.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.profile.status}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Joining Date</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {new Date(profile.profile.joiningDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {profile.profile.lastPromotionDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Promotion</label>
                    <div className="flex items-center mt-1">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {new Date(profile.profile.lastPromotionDate).toLocaleDateString()}
                      </p>
                    </div>
                    {profile.profile.promotionNotes && (
                      <p className="text-sm text-gray-600 mt-1">{profile.profile.promotionNotes}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No job information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salary Information & Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.profile ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-medium">₹{profile.profile.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-medium text-green-600">+₹{profile.profile.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-medium text-red-600">-₹{profile.profile.deductions.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Net Salary:</span>
                  <span className="font-bold text-blue-600">₹{netSalary.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No salary information available</p>
            )}
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>Job Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            {profile.profile?.responsibilities ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {profile.profile.responsibilities}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No responsibilities defined</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
