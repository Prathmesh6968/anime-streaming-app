import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { Chrome } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = (location.state as any)?.from || '/';

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Email login failed:', error);
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid email or password',
          variant: 'destructive'
        });
        return;
      }

      if (data?.user) {
        toast({
          title: 'Success',
          description: 'Logged in successfully'
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google login failed:', error);
        toast({
          title: 'Login Failed',
          description: error.message || 'Unable to connect to Google. Please try again.',
          variant: 'destructive'
        });
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl gradient-text mb-2">
            AnimeStream Hub
          </CardTitle>
          <CardDescription>
            Sign in to access your watchlist and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPasswordMode ? (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordMode(false);
                  setEmail('');
                  setPassword('');
                }}
                className="w-full"
              >
                Back to Options
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => setIsPasswordMode(true)}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Sign in with Email & Password
              </Button>
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                <Chrome className="w-5 h-5 mr-2" />
                {loading ? 'Connecting...' : 'Sign in with Google'}
              </Button>
            </div>
          )}
          <p className="text-sm text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
