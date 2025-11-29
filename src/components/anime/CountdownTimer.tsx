import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeRemaining.isExpired) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-3 text-accent" />
          <p className="text-lg font-semibold text-accent">
            New episode should be available now!
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back soon for the latest episode
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-accent" />
          Next Episode Countdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-accent">
              {timeRemaining.days}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {timeRemaining.days === 1 ? 'Day' : 'Days'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-accent">
              {String(timeRemaining.hours).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {timeRemaining.hours === 1 ? 'Hour' : 'Hours'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-accent">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {timeRemaining.minutes === 1 ? 'Min' : 'Mins'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-accent">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {timeRemaining.seconds === 1 ? 'Sec' : 'Secs'}
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Estimated next episode release
        </p>
      </CardContent>
    </Card>
  );
}
