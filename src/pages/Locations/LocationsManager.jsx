import React, { useState } from 'react';
import { api } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Building2, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export default function LocationsManager() {
  const [editingLocation, setEditingLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['academies'],
    queryFn: () => api.entities.Academy.list('-created_date'),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (editingLocation?.id) {
        return api.entities.Academy.update(editingLocation.id, data);
      }
      return api.entities.Academy.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academies'] });
      setShowForm(false);
      setEditingLocation(null);
    },
  });

  const handleEdit = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  // Stripe Connect functions
  const setupStripeConnect = async (locationId) => {
    try {
      const response = await fetch(`${window.location.origin}/functions/createConnectedAccount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await api.auth.getToken()}`,
        },
        body: JSON.stringify({ locationId }),
      });
      const data = await response.json();
      
      if (data.accountLinkUrl) {
        window.open(data.accountLinkUrl, '_blank');
      }
    } catch (error) {
      console.error('Error setting up Stripe Connect:', error);
    }
  };

  const refreshStripeStatus = async (accountId, locationId) => {
    try {
      const response = await fetch(`${window.location.origin}/functions/getAccountStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await api.auth.getToken()}`,
        },
        body: JSON.stringify({ accountId }),
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['academies'] });
      }
    } catch (error) {
      console.error('Error refreshing Stripe status:', error);
    }
  };

  // Helper function for Stripe status badges
  const getStripeStatusBadge = (status, hasAccount) => {
    if (!hasAccount) {
      return (
        <Badge variant="outline" className="text-xs">
          <CreditCard className="w-3 h-3 mr-1" />
          No Payment Setup
        </Badge>
      );
    }

    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'needs_attention':
        return (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Needs Attention
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Unknown Status
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations</h1>
          <p className="text-gray-600">Manage your academy locations</p>
        </div>
        <Button onClick={handleNew} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl mb-1">{location.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {location.city}, {location.country}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStripeStatusBadge(location.stripe_status, location.stripe_connect_account_id)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={location.active ? 'default' : 'secondary'}>
                    {location.active ? 'Active' : 'Inactive'}
                  </Badge>
                  {location.stripe_connect_account_id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => refreshStripeStatus(location.stripe_connect_account_id, location.id)}
                      className="h-7 px-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {location.timezone && (
                  <div className="text-gray-600">
                    <span className="font-medium">Timezone:</span> {location.timezone}
                  </div>
                )}
                {location.contactEmail && (
                  <div className="text-gray-600">
                    <span className="font-medium">Email:</span> {location.contactEmail}
                  </div>
                )}
                {location.address && (
                  <div className="text-gray-600">
                    <span className="font-medium">Address:</span> {location.address}
                  </div>
                )}
               </div>
              <div className="space-y-2 mt-4">
                {!location.stripe_connect_account_id ? (
                  <Button
                    onClick={() => setupStripeConnect(location.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Setup Stripe Connect
                  </Button>
                ) : (
                  <Button
                    onClick={() => setupStripeConnect(location.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Stripe Account
                  </Button>
                )}
                <Button
                  onClick={() => handleEdit(location)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Location
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <LocationForm
          location={editingLocation}
          onSave={(data) => saveMutation.mutate(data)}
          onClose={() => {
            setShowForm(false);
            setEditingLocation(null);
          }}
          isSaving={saveMutation.isPending}
        />
      )}
    </div>
  );
}

function LocationForm({ location, onSave, onClose, isSaving }) {
  const [form, setForm] = useState({
    name: location?.name || '',
    city: location?.city || '',
    country: location?.country || '',
    timezone: location?.timezone || '',
    address: location?.address || '',
    contactEmail: location?.contactEmail || '',
    contactPhone: location?.contactPhone || '',
    active: location?.active ?? true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {location ? 'Edit Location' : 'Add New Location'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Skill Samurai Moncton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <input
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input"
                placeholder="Moncton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <input
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="input"
                placeholder="Canada"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <input
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="input"
                placeholder="America/Moncton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="input"
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Phone</label>
              <input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="input"
                placeholder="+1 555-1234"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
              placeholder="123 Main St, Suite 100"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {isSaving ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}