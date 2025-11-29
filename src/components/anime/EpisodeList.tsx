import { Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { EpisodeWithProgress } from '@/types';

interface EpisodeListProps {
  episodes: EpisodeWithProgress[];
  currentEpisodeId?: string;
  onEpisodeSelect: (episodeId: string) => void;
  onMarkWatched?: (episodeId: string, watched: boolean) => void;
}

export function EpisodeList({
  episodes,
  currentEpisodeId,
  onEpisodeSelect,
  onMarkWatched
}: EpisodeListProps) {
  return (
    <Card>
      <CardContent className="p-3 xl:p-4">
        <h3 className="font-semibold text-base xl:text-lg mb-3 xl:mb-4">Episodes</h3>
        <ScrollArea className="h-[400px] xl:h-[600px] pr-2 xl:pr-4">
          <div className="space-y-2">
            {episodes.map((episode) => (
              <div
                key={episode.id}
                className={cn(
                  "flex items-center gap-2 xl:gap-3 p-2 xl:p-3 rounded-lg border transition-colors",
                  currentEpisodeId === episode.id
                    ? "bg-primary/10 border-primary"
                    : "hover:bg-muted/50"
                )}
              >
                <Button
                  size="icon"
                  variant={currentEpisodeId === episode.id ? "default" : "outline"}
                  onClick={() => onEpisodeSelect(episode.id)}
                  className="shrink-0 h-8 w-8 xl:h-10 xl:w-10"
                >
                  <Play className="w-3 h-3 xl:w-4 xl:h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs xl:text-sm">
                    Episode {episode.episode_number}
                  </div>
                  {episode.title && (
                    <div className="text-xs xl:text-sm text-muted-foreground line-clamp-1">
                      {episode.title}
                    </div>
                  )}
                </div>
                {onMarkWatched && (
                  <Button
                    size="icon"
                    variant={episode.watched ? "default" : "ghost"}
                    onClick={() => onMarkWatched(episode.id, !episode.watched)}
                    className="shrink-0 h-8 w-8 xl:h-10 xl:w-10"
                  >
                    <Check className="w-3 h-3 xl:w-4 xl:h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
