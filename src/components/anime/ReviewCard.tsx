import { Star, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ReviewWithUser } from '@/types';

interface ReviewCardProps {
  review: ReviewWithUser;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.avatar_url || undefined} />
            <AvatarFallback>
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">{review.username || 'Anonymous'}</div>
                <div className="text-sm text-muted-foreground">{formattedDate}</div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-semibold">{review.rating}/10</span>
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
