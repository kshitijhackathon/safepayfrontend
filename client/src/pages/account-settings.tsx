import React from 'react';
import { useLocation } from 'wouter';
import { useAuthState } from '@/hooks/use-auth-state';
import PageHeader from '@/components/ui/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Smartphone, KeyRound, Trash2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const [, setLocation] = useLocation();
  const { authState } = useAuthState();
  
  if (!authState.isLoggedIn || !authState.user) {
    // Optionally, redirect to login if not authenticated
    // setLocation('/login'); 
    return (
        <div className="min-h-screen bg-background text-foreground p-4">
            <PageHeader title="Account Settings" onBack={() => setLocation('/settings')} />
            <div className="flex items-center justify-center h-64">
                <p>Please log in to view your account settings.</p>
            </div>
        </div>
    );
  }
  
  const { user } = authState;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl p-4">
        <PageHeader title="Account Settings" onBack={() => setLocation('/settings')} />
        
        <main className="space-y-8 mt-6">
          {/* Profile Information */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePicture || ''} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="fullName" value={user.fullName} readOnly className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={user.email} readOnly className="pl-9" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" value={user.phoneNumber || 'Not provided'} readOnly className="pl-9" />
                </div>
              </div>
            </div>
          </section>

          {/* Security Settings */}
          <section className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <KeyRound className="h-5 w-5 mr-2 text-primary" />
              Security
            </h2>
            <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start text-left">
                    Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start text-left" onClick={() => setLocation('/security-settings')}>
                    Advanced Security Settings
                </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-card p-6 rounded-lg shadow-sm border border-destructive/50">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-destructive">
              <Trash2 className="h-5 w-5 mr-2" />
              Danger Zone
            </h2>
            <p className="text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive">
              Delete My Account
            </Button>
          </section>
        </main>
      </div>
    </div>
  );
} 