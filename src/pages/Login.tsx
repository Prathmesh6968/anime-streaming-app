import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { Chrome } from 'lucide-react';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = (location.state as any)?.from || '/';

  const handleGoogleSSO = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithSSO({
        domain: 'miaoda-gg.com',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('SSO login failed:', error);
        toast({
          title: 'Login Failed',
          description: 'Unable to connect to authentication service. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      if (data?.url) {
        window.open(data.url, '_self');
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
          <Button
            onClick={handleGoogleSSO}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            <Chrome className="w-5 h-5 mr-2" />
            {loading ? 'Connecting...' : 'Sign in with Google'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
