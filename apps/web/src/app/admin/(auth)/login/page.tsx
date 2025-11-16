'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { authPost } from '@/lib/auth';
import { Loader2, User, Lock, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await authPost('/api/admin/login', {
        username,
        password,
      });

      if (response.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        try {
          const data = await response.json();
          setError(data.error || 'Invalid credentials');
        } catch {
          setError('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-6">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg dark:shadow-primary/30">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <p className="text-sm text-center text-muted-foreground">
            Sign in to access the admin dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-5"
            aria-label="Admin login form"
          >
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-foreground"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  disabled={loading}
                  autoComplete="username"
                  aria-required="true"
                  className="mt-1 block w-full pl-10 pr-3 py-2.5 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-primary disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200 hover:border-primary/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  aria-required="true"
                  className="mt-1 block w-full pl-10 pr-3 py-2.5 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-primary disabled:bg-muted disabled:cursor-not-allowed transition-all duration-200 hover:border-primary/50"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6 h-11 stellar-button bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="Submit login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
