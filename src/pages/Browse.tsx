import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { FilterSidebar } from '@/components/anime/FilterSidebar';
import { animeApi } from '@/db/api';
import { useSEO } from '@/hooks/use-seo';
import type { Anime, ContentType } from '@/types';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [contentType, setContentType] = useState<ContentType>(
    (searchParams.get('type') as ContentType) || 'anime'
  );

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Dynamic SEO based on filters and content type
  const contentLabel = contentType === 'cartoon' ? 'Cartoon' : 'Anime';
  useSEO({
    title: searchQuery 
      ? `Search: ${searchQuery}` 
      : selectedGenres.length > 0 
        ? `${selectedGenres.join(', ')} ${contentLabel} - Free Hindi Dubbed` 
        : `Browse ${contentLabel} - Free Hindi Dubbed ${contentLabel}`,
    description: `Browse and discover free Hindi dubbed ${contentType === 'cartoon' ? 'cartoons' : 'anime series'} and movies. ${selectedGenres.length > 0 ? `Filter by ${selectedGenres.join(', ')} genres.` : ''} Watch ${contentType === 'cartoon' ? 'cartoons' : 'anime'} in multiple languages including Hindi dub, English sub, and Japanese. Best free ${contentType === 'cartoon' ? 'cartoon' : 'anime'} streaming website with no registration required.`,
    keywords: `free hindi dubbed ${contentType === 'cartoon' ? 'cartoons' : 'anime'}, hindi dub ${contentType === 'cartoon' ? 'cartoons' : 'anime'}, browse ${contentType === 'cartoon' ? 'cartoons' : 'anime'}, ${selectedGenres.join(', ')}, ${contentType === 'cartoon' ? 'cartoon' : 'anime'} catalog, ${contentType === 'cartoon' ? 'cartoon' : 'anime'} list, watch ${contentType === 'cartoon' ? 'cartoons' : 'anime'} online free, free ${contentType === 'cartoon' ? 'cartoon' : 'anime'} website, ${contentType === 'cartoon' ? 'cartoons' : 'anime'} in hindi, hindi ${contentType === 'cartoon' ? 'cartoons' : 'anime'}, ${selectedGenres.map(g => `${g} ${contentType === 'cartoon' ? 'cartoons' : 'anime'} in hindi`).join(', ')}, ${contentType === 'cartoon' ? 'cartoon' : 'anime'} streaming free, no registration ${contentType === 'cartoon' ? 'cartoons' : 'anime'}`,
    url: 'https://animestreamhub.com/browse'
  });

  useEffect(() => {
    const loadAnime = async () => {
      setLoading(true);
      try {
        const filters: any = {};
        
        if (debouncedSearch) {
          filters.search = debouncedSearch;
        }
        
        if (selectedGenres.length > 0) {
          filters.genres = selectedGenres;
        }
        
        if (selectedStatus !== 'all') {
          filters.status = selectedStatus;
        }
        
        if (selectedYear !== 'all') {
          filters.year = Number.parseInt(selectedYear);
        }

        // Always filter by content type
        filters.content_type = contentType;

        const data = await animeApi.getAll(filters);
        setAnime(data);
      } catch (error) {
        console.error('Error loading anime:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnime();
  }, [debouncedSearch, selectedGenres, selectedStatus, selectedYear, contentType]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleContentTypeChange = (type: string) => {
    const newType = type as ContentType;
    setContentType(newType);
    setSearchParams({ type: newType });
  };

  return (
    <div className="min-h-screen py-6 xl:py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-4xl font-bold mb-3 xl:mb-4">
            Browse {contentType === 'cartoon' ? 'Cartoons' : 'Anime'}
          </h1>
          
          {/* Content Type Tabs */}
          <div className="mb-4">
            <Tabs value={contentType} onValueChange={handleContentTypeChange}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="anime">Anime</TabsTrigger>
                <TabsTrigger value="cartoon">Cartoons</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xl:w-5 xl:h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${contentType === 'cartoon' ? 'cartoons' : 'anime'}...`}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 xl:pl-10 h-10 xl:h-11 text-sm xl:text-base"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="xl:hidden h-10 w-10">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar
                    selectedGenres={selectedGenres}
                    onGenresChange={setSelectedGenres}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    inSheet={true}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 xl:gap-8">
          <aside className="hidden xl:block">
            <FilterSidebar
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </aside>

          <main>
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-2 xl:space-y-3">
                    <Skeleton className="aspect-[2/3] w-full bg-muted" />
                    <Skeleton className="h-3 xl:h-4 w-3/4 bg-muted" />
                    <Skeleton className="h-2 xl:h-3 w-1/2 bg-muted" />
                  </div>
                ))}
              </div>
            ) : anime.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base xl:text-xl text-muted-foreground">
                  No {contentType === 'cartoon' ? 'cartoons' : 'anime'} found matching your criteria
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-6">
                {anime.map((item) => (
                  <AnimeCard key={item.id} anime={item} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
