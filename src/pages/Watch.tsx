import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { EpisodeList } from '@/components/anime/EpisodeList';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { episodeApi, animeApi, progressApi } from '@/db/api';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { Episode, Anime, EpisodeWithProgress } from '@/types';
import { ArrowLeft, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

export default function Watch() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNextEpisodePrompt, setShowNextEpisodePrompt] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(10);
  const [savedPosition, setSavedPosition] = useState(0);

  useEffect(() => {
    if (!episodeId) return;

    setShowNextEpisodePrompt(false);
    setAutoPlayCountdown(10);
    setSavedPosition(0);

    const loadData = async () => {
      try {
        const episodeData = await episodeApi.getById(episodeId);
        if (!episodeData) {
          toast({
            title: 'Error',
            description: 'Episode not found',
            variant: 'destructive'
          });
          navigate('/browse');
          return;
        }

        setEpisode(episodeData);

        const [animeData, episodesData] = await Promise.all([
          animeApi.getById(episodeData.anime_id),
          episodeApi.getByAnimeId(episodeData.anime_id)
        ]);

        setAnime(animeData);

        if (user) {
          // Fetch saved progress for this episode
          const currentProgress = await progressApi.getByEpisodeId(user.id, episodeId);
          if (currentProgress?.last_position) {
            setSavedPosition(currentProgress.last_position);
          }

          const progressData = await progressApi.getByUserId(user.id, episodeData.anime_id);
          const progressMap = new Map(progressData.map(p => [p.episode_id, p]));

          const episodesWithProgress = episodesData.map(ep => ({
            ...ep,
            watched: progressMap.get(ep.id)?.watched || false,
            last_position: progressMap.get(ep.id)?.last_position || 0
          }));

          setEpisodes(episodesWithProgress);
        } else {
          setEpisodes(episodesData);
        }
      } catch (error) {
        console.error('Error loading episode:', error);
        toast({
          title: 'Error',
          description: 'Failed to load episode',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [episodeId, user]);

  useEffect(() => {
    if (!episode || !episodes.length) return;

    const currentIndex = episodes.findIndex(ep => ep.id === episode.id);
    const hasNextEpisode = currentIndex < episodes.length - 1;

    if (!hasNextEpisode) return;

    const duration = episode.duration || 1440;
    const timer = setTimeout(() => {
      setShowNextEpisodePrompt(true);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [episode, episodes]);

  useEffect(() => {
    if (!showNextEpisodePrompt || autoPlayCountdown <= 0) return;

    const interval = setInterval(() => {
      setAutoPlayCountdown(prev => {
        if (prev <= 1) {
          handlePlayNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showNextEpisodePrompt, autoPlayCountdown]);

  const handleEpisodeSelect = (newEpisodeId: string) => {
    navigate(`/watch/${newEpisodeId}`);
  };

  const handleMarkWatched = async (epId: string, watched: boolean) => {
    if (!user || !anime) return;

    try {
      await progressApi.markWatched(user.id, epId, anime.id, watched);
      
      setEpisodes(prev =>
        prev.map(ep =>
          ep.id === epId ? { ...ep, watched } : ep
        )
      );

      toast({
        title: watched ? 'Marked as watched' : 'Marked as unwatched'
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const getCurrentEpisodeIndex = () => {
    if (!episode) return -1;
    return episodes.findIndex(ep => ep.id === episode.id);
  };

  const handlePreviousEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex > 0) {
      navigate(`/watch/${episodes[currentIndex - 1].id}`);
    }
  };

  const handleNextEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex < episodes.length - 1) {
      navigate(`/watch/${episodes[currentIndex + 1].id}`);
    }
  };

  const handlePlayNextEpisode = () => {
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex < episodes.length - 1) {
      navigate(`/watch/${episodes[currentIndex + 1].id}`);
    }
  };

  const handleCancelAutoPlay = () => {
    setShowNextEpisodePrompt(false);
    setAutoPlayCountdown(10);
  };

  const handleProgressUpdate = async (position: number) => {
    if (!user || !episodeId || !anime) return;

    try {
      await progressApi.updatePosition(user.id, episodeId, anime.id, position);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleVideoEnd = () => {
    if (!user || !episodeId || !anime) return;

    // Mark episode as watched when video ends
    progressApi.markWatched(user.id, episodeId, anime.id, true).catch(error => {
      console.error('Error marking as watched:', error);
    });

    // Show next episode prompt
    const currentIndex = getCurrentEpisodeIndex();
    if (currentIndex < episodes.length - 1) {
      setShowNextEpisodePrompt(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="container mx-auto">
          <Skeleton className="aspect-video w-full mb-8 bg-muted" />
          <Skeleton className="h-8 w-1/3 mb-4 bg-muted" />
        </div>
      </div>
    );
  }

  if (!episode || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Episode not found</h2>
          <Button onClick={() => navigate('/browse')}>
            Browse Anime
          </Button>
        </div>
      </div>
    );
  }

  const currentIndex = getCurrentEpisodeIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < episodes.length - 1;

  return (
    <div className="min-h-screen py-4 xl:py-8 px-2 xl:px-4">
      <div className="container mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate(`/anime/${anime.id}`)}
          className="mb-3 xl:mb-4"
          size="default"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6 xl:space-y-8">
          <div className="w-full max-w-[1400px] mx-auto">
            <div className="relative">
              <div className="mb-4 xl:mb-6">
                <VideoPlayer
                  src={episode.video_url}
                  episodeId={episode.id}
                  title={`Episode ${episode.episode_number}`}
                  savedPosition={savedPosition}
                  onProgressUpdate={user ? handleProgressUpdate : undefined}
                  onVideoEnd={user ? handleVideoEnd : undefined}
                />
              </div>

              {showNextEpisodePrompt && hasNext && (
                <Card className="absolute bottom-4 xl:bottom-8 right-2 xl:right-8 w-[calc(100%-1rem)] xl:w-80 shadow-2xl border-accent">
                  <CardContent className="p-4 xl:p-6">
                    <div className="flex items-start gap-2 xl:gap-3">
                      <SkipForward className="w-5 h-5 xl:w-6 xl:h-6 text-accent flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-2 text-sm xl:text-base">Next Episode</h3>
                        <p className="text-xs xl:text-sm text-muted-foreground mb-3 xl:mb-4 truncate">
                          Episode {episodes[currentIndex + 1].episode_number}
                          {episodes[currentIndex + 1].title && `: ${episodes[currentIndex + 1].title}`}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handlePlayNextEpisode}
                            size="sm"
                            className="flex-1 text-xs xl:text-sm"
                          >
                            Play ({autoPlayCountdown}s)
                          </Button>
                          <Button 
                            onClick={handleCancelAutoPlay}
                            size="sm"
                            variant="outline"
                            className="text-xs xl:text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 xl:gap-4 mb-4 xl:mb-6">
                <Button
                  onClick={handlePreviousEpisode}
                  disabled={!hasPrevious}
                  variant="outline"
                  size="lg"
                  className="w-full xl:w-auto text-sm xl:text-base"
                >
                  <ChevronLeft className="w-4 h-4 xl:w-5 xl:h-5 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={handleNextEpisode}
                  disabled={!hasNext}
                  variant="outline"
                  size="lg"
                  className="w-full xl:w-auto text-sm xl:text-base"
                >
                  Next
                  <ChevronRight className="w-4 h-4 xl:w-5 xl:h-5 ml-2" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 xl:space-y-3 px-2 xl:px-0">
              <h1 className="text-xl xl:text-3xl font-bold">
                {anime.title} - Episode {episode.episode_number}
              </h1>
              {episode.title && (
                <h2 className="text-base xl:text-xl text-muted-foreground">
                  {episode.title}
                </h2>
              )}
              {episode.description && (
                <p className="text-sm xl:text-base text-muted-foreground mt-3 xl:mt-4 leading-relaxed">
                  {episode.description}
                </p>
              )}
            </div>
          </div>

          <div className="max-w-[1400px] mx-auto">
            <EpisodeList
              episodes={episodes}
              currentEpisodeId={episode.id}
              onEpisodeSelect={handleEpisodeSelect}
              onMarkWatched={user ? handleMarkWatched : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
