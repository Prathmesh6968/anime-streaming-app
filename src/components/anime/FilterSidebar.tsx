import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface FilterSidebarProps {
  selectedGenres: string[];
  onGenresChange: (genres: string[]) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  inSheet?: boolean;
}

const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller'
];

const YEARS = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];

export function FilterSidebar({
  selectedGenres,
  onGenresChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  inSheet = false
}: FilterSidebarProps) {
  const handleGenreToggle = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  return (
    <Card className={inSheet ? '' : 'sticky top-4 max-h-[calc(100vh-2rem)] flex flex-col'}>
      <CardHeader className="flex-shrink-0">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <ScrollArea className={inSheet ? 'h-[calc(100vh-12rem)]' : 'flex-1'}>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Status</h3>
            <RadioGroup value={selectedStatus} onValueChange={onStatusChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="cursor-pointer">All</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Ongoing" id="status-ongoing" />
                <Label htmlFor="status-ongoing" className="cursor-pointer">Ongoing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Completed" id="status-completed" />
                <Label htmlFor="status-completed" className="cursor-pointer">Completed</Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Release Year</h3>
            <RadioGroup value={selectedYear} onValueChange={onYearChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="year-all" />
                <Label htmlFor="year-all" className="cursor-pointer">All Years</Label>
              </div>
              {YEARS.map(year => (
                <div key={year} className="flex items-center space-x-2">
                  <RadioGroupItem value={year} id={`year-${year}`} />
                  <Label htmlFor={`year-${year}`} className="cursor-pointer">{year}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Genres</h3>
            <div className="space-y-2 pr-4">
              {GENRES.map(genre => (
                <div key={genre} className="flex items-center space-x-2">
                  <Checkbox
                    id={`genre-${genre}`}
                    checked={selectedGenres.includes(genre)}
                    onCheckedChange={() => handleGenreToggle(genre)}
                  />
                  <Label
                    htmlFor={`genre-${genre}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {genre}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
