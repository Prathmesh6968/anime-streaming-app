import { Link } from 'react-router-dom';
import { Star, Play, Languages } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Anime } from '@/types';
import { cn } from '@/lib/utils';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

export function AnimeCard({ anime, className }: AnimeCardProps) {
  return (
    <Link to={`/anime/${anime.id}`}>
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-glow hover:scale-105",
        className
      )}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={anime.thumbnail_url || 'https://placehold.co/300x450/1a202c/6b46c1?text=No+Image'}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-3 xl:p-4">
              <div className="flex items-center gap-2 text-white">
                <Play className="w-4 h-4 xl:w-5 xl:h-5" />
                <span className="text-xs xl:text-sm font-medium">Watch Now</span>
              </div>
            </div>
          </div>
          {anime.status === 'Ongoing' && (
            <Badge className="absolute top-1.5 right-1.5 xl:top-2 xl:right-2 bg-accent text-accent-foreground text-[10px] xl:text-xs px-1.5 xl:px-2 py-0.5">
              Ongoing
            </Badge>
          )}
          {anime.content_type === 'cartoon' && (
            <Badge className="absolute top-1.5 left-1.5 xl:top-2 xl:left-2 bg-primary text-primary-foreground text-[10px] xl:text-xs px-1.5 xl:px-2 py-0.5">
              Cartoon
            </Badge>
          )}
        </div>
        <CardContent className="p-2.5 xl:p-4">
          <h3 className="font-semibold text-xs xl:text-base line-clamp-1 mb-1.5 xl:mb-2">
            {anime.title}
          </h3>
          <div className="flex items-center justify-between text-[10px] xl:text-sm text-muted-foreground mb-1.5 xl:mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 xl:w-4 xl:h-4 fill-accent text-accent" />
              <span>{anime.rating?.toFixed(1) || 'N/A'}</span>
            </div>
            <span>{anime.release_year || 'TBA'}</span>
          </div>
          {anime.languages && anime.languages.length > 0 && (
            <div className="flex items-center gap-1 mb-1.5 xl:mb-2">
              <Languages className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-primary" />
              <div className="flex flex-wrap gap-1">
                {anime.languages.slice(0, 3).map((language) => (
                  <Badge 
                    key={language} 
                    variant="outline" 
                    className="text-[9px] xl:text-[10px] px-1 xl:px-1.5 py-0 border-primary/50 text-primary"
                  >
                    {language}
                  </Badge>
                ))}
                {anime.languages.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-[9px] xl:text-[10px] px-1 xl:px-1.5 py-0 border-primary/50 text-primary"
                  >
                    +{anime.languages.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="secondary" className="text-[9px] xl:text-xs px-1.5 xl:px-2 py-0 xl:py-0.5">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
