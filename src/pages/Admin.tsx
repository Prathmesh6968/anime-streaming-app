import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { animeApi, episodeApi, profileApi } from '@/db/api';
import type { Anime, Profile } from '@/types';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';

export default function Admin() {
  const {} = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [anime, setAnime] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [episodeDialogOpen, setEpisodeDialogOpen] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any | null>(null);
  const [animeForm, setAnimeForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    banner_url: '',
    genres: '',
    languages: '',
    season: '',
    release_year: '',
    status: 'Ongoing' as 'Ongoing' | 'Completed',
    content_type: 'anime' as 'anime' | 'cartoon',
    total_episodes: '',
    next_episode_date: '',
    series_name: '',
    season_number: '1'
  });
  const [episodeForm, setEpisodeForm] = useState({
    anime_id: '',
    episode_number: '',
    season_number: '1',
    title: '',
    description: '',
    video_url: '',
    duration: '',
    thumbnail_url: ''
  });

  useEffect(() => {
    const isAdminAuth = localStorage.getItem('adminAuth') === 'true';
    
    if (!isAdminAuth) {
      navigate('/admin-login', { replace: true });
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [animeData, usersData] = await Promise.all([
        animeApi.getAll(),
        profileApi.getAll()
      ]);
      setAnime(animeData);
      setUsers(usersData);
      
      // Load all episodes
      const allEpisodes: any[] = [];
      for (const item of animeData) {
        try {
          const eps = await episodeApi.getByAnimeId(item.id);
          allEpisodes.push(...eps);
        } catch (e) {
          console.error('Error loading episodes for anime:', e);
        }
      }
      setEpisodes(allEpisodes);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAnimeSubmit = async () => {
    try {
      const data = {
        ...animeForm,
        genres: animeForm.genres.split(',').map(g => g.trim()).filter(Boolean),
        languages: animeForm.languages ? animeForm.languages.split(',').map(l => l.trim()).filter(Boolean) : null,
        release_year: animeForm.release_year ? Number.parseInt(animeForm.release_year) : null,
        total_episodes: animeForm.total_episodes ? Number.parseInt(animeForm.total_episodes) : 0,
        next_episode_date: animeForm.next_episode_date || null,
        series_name: animeForm.series_name || animeForm.title,
        season_number: animeForm.season_number ? Number.parseInt(animeForm.season_number) : 1
      };

      if (selectedAnime) {
        await animeApi.update(selectedAnime.id, data);
        toast({ title: 'Anime updated successfully' });
      } else {
        await animeApi.create(data);
        toast({ title: 'Anime created successfully' });
      }

      setDialogOpen(false);
      setSelectedAnime(null);
      setAnimeForm({
        title: '',
        description: '',
        thumbnail_url: '',
        banner_url: '',
        genres: '',
        languages: '',
        season: '',
        release_year: '',
        status: 'Ongoing',
        content_type: 'anime',
        total_episodes: '',
        next_episode_date: '',
        series_name: '',
        season_number: '1'
      });
      loadData();
    } catch (error) {
      console.error('Error saving anime:', error);
      toast({
        title: 'Error',
        description: 'Failed to save anime',
        variant: 'destructive'
      });
    }
  };

  const handleAnimeEdit = (anime: Anime) => {
    setSelectedAnime(anime);
    setAnimeForm({
      title: anime.title,
      description: anime.description || '',
      thumbnail_url: anime.thumbnail_url || '',
      banner_url: anime.banner_url || '',
      genres: anime.genres?.join(', ') || '',
      languages: anime.languages?.join(', ') || '',
      season: anime.season || '',
      release_year: anime.release_year?.toString() || '',
      status: anime.status,
      content_type: anime.content_type || 'anime',
      total_episodes: anime.total_episodes?.toString() || '',
      next_episode_date: anime.next_episode_date ? new Date(anime.next_episode_date).toISOString().slice(0, 16) : '',
      series_name: anime.series_name || '',
      season_number: anime.season_number?.toString() || '1'
    });
    setDialogOpen(true);
  };

  const handleAnimeDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this anime?')) return;

    try {
      await animeApi.delete(id);
      toast({ title: 'Anime deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting anime:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete anime',
        variant: 'destructive'
      });
    }
  };

  const handleEpisodeSubmit = async () => {
    try {
      const data = {
        anime_id: episodeForm.anime_id,
        episode_number: Number.parseInt(episodeForm.episode_number),
        season_number: Number.parseInt(episodeForm.season_number),
        title: episodeForm.title || null,
        description: episodeForm.description || null,
        video_url: episodeForm.video_url,
        duration: episodeForm.duration ? Number.parseInt(episodeForm.duration) : null,
        thumbnail_url: episodeForm.thumbnail_url || null
      };

      if (selectedEpisode) {
        await episodeApi.update(selectedEpisode.id, data);
        toast({ title: 'Episode updated successfully' });
      } else {
        await episodeApi.create(data);
        toast({ title: 'Episode created successfully' });
      }

      setEpisodeDialogOpen(false);
      setSelectedEpisode(null);
      setEpisodeForm({
        anime_id: '',
        episode_number: '',
        season_number: '1',
        title: '',
        description: '',
        video_url: '',
        duration: '',
        thumbnail_url: ''
      });
      loadData();
    } catch (error) {
      console.error('Error saving episode:', error);
      toast({
        title: 'Error',
        description: 'Failed to save episode',
        variant: 'destructive'
      });
    }
  };

  const handleEpisodeEdit = (episode: any) => {
    setSelectedEpisode(episode);
    setEpisodeForm({
      anime_id: episode.anime_id,
      episode_number: episode.episode_number.toString(),
      season_number: episode.season_number?.toString() || '1',
      title: episode.title || '',
      description: episode.description || '',
      video_url: episode.video_url,
      duration: episode.duration?.toString() || '',
      thumbnail_url: episode.thumbnail_url || ''
    });
    setEpisodeDialogOpen(true);
  };

  const handleEpisodeDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this episode?')) return;

    try {
      await episodeApi.delete(id);
      toast({ title: 'Episode deleted successfully' });
      loadData();
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete episode',
        variant: 'destructive'
      });
    }
  };

  const handleUserRoleUpdate = async (userId: string, role: 'user' | 'admin') => {
    try {
      await profileApi.updateRole(userId, role);
      toast({ title: 'User role updated successfully' });
      loadData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-accent" />
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="anime" className="space-y-6">
          <TabsList>
            <TabsTrigger value="anime">Anime Management</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="anime">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Anime List</CardTitle>
                    <CardDescription>Manage anime series</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setSelectedAnime(null);
                        setAnimeForm({
                          title: '',
                          description: '',
                          thumbnail_url: '',
                          banner_url: '',
                          genres: '',
                          languages: '',
                          season: '',
                          release_year: '',
                          status: 'Ongoing',
                          content_type: 'anime',
                          total_episodes: '',
                          next_episode_date: '',
                          series_name: '',
                          season_number: '1'
                        });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Anime
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedAnime ? 'Edit' : 'Add'} Anime</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={animeForm.title}
                            onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={animeForm.description}
                            onChange={(e) => setAnimeForm({ ...animeForm, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                            <Input
                              id="thumbnail_url"
                              value={animeForm.thumbnail_url}
                              onChange={(e) => setAnimeForm({ ...animeForm, thumbnail_url: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="banner_url">Banner URL</Label>
                            <Input
                              id="banner_url"
                              value={animeForm.banner_url}
                              onChange={(e) => setAnimeForm({ ...animeForm, banner_url: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="genres">Genres (comma-separated)</Label>
                          <Input
                            id="genres"
                            value={animeForm.genres}
                            onChange={(e) => setAnimeForm({ ...animeForm, genres: e.target.value })}
                            placeholder="Action, Fantasy, Adventure"
                          />
                        </div>
                        <div>
                          <Label htmlFor="languages">Available Languages (comma-separated)</Label>
                          <Input
                            id="languages"
                            value={animeForm.languages}
                            onChange={(e) => setAnimeForm({ ...animeForm, languages: e.target.value })}
                            placeholder="Hindi, English, Japanese, Tamil"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Specify available audio languages/dubs (e.g., Hindi, English, Japanese, Tamil, Telugu)
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="season">Season</Label>
                            <Input
                              id="season"
                              value={animeForm.season}
                              onChange={(e) => setAnimeForm({ ...animeForm, season: e.target.value })}
                              placeholder="Spring 2024"
                            />
                          </div>
                          <div>
                            <Label htmlFor="release_year">Year</Label>
                            <Input
                              id="release_year"
                              type="number"
                              value={animeForm.release_year}
                              onChange={(e) => setAnimeForm({ ...animeForm, release_year: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="total_episodes">Total Episodes</Label>
                            <Input
                              id="total_episodes"
                              type="number"
                              value={animeForm.total_episodes}
                              onChange={(e) => setAnimeForm({ ...animeForm, total_episodes: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={animeForm.status}
                              onValueChange={(value: 'Ongoing' | 'Completed') =>
                                setAnimeForm({ ...animeForm, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ongoing">Ongoing</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="content_type">Content Type</Label>
                            <Select
                              value={animeForm.content_type}
                              onValueChange={(value: 'anime' | 'cartoon') =>
                                setAnimeForm({ ...animeForm, content_type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="anime">Anime</SelectItem>
                                <SelectItem value="cartoon">Cartoon</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {animeForm.status === 'Ongoing' && (
                          <div>
                            <Label htmlFor="next_episode_date">Next Episode Date (Optional)</Label>
                            <Input
                              id="next_episode_date"
                              type="datetime-local"
                              value={animeForm.next_episode_date}
                              onChange={(e) => setAnimeForm({ ...animeForm, next_episode_date: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Set the estimated release date for the next episode to show a countdown timer
                            </p>
                          </div>
                        )}
                        <Button onClick={handleAnimeSubmit} className="w-full">
                          {selectedAnime ? 'Update' : 'Create'} Anime
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anime.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'Ongoing' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.release_year || 'N/A'}</TableCell>
                        <TableCell>{item.rating?.toFixed(1) || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnimeEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAnimeDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="episodes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Episodes</CardTitle>
                    <CardDescription>Add episodes to anime series</CardDescription>
                  </div>
                  <Dialog open={episodeDialogOpen} onOpenChange={setEpisodeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setSelectedEpisode(null);
                        setEpisodeForm({
                          anime_id: '',
                          episode_number: '',
                          season_number: '1',
                          title: '',
                          description: '',
                          video_url: '',
                          duration: '',
                          thumbnail_url: ''
                        });
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Episode
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedEpisode ? 'Edit' : 'Add'} Episode</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="anime_select">Anime *</Label>
                          <Select
                            value={episodeForm.anime_id}
                            onValueChange={(value) => setEpisodeForm({ ...episodeForm, anime_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select anime" />
                            </SelectTrigger>
                            <SelectContent>
                              {anime.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="episode_number">Episode Number *</Label>
                            <Input
                              id="episode_number"
                              type="number"
                              value={episodeForm.episode_number}
                              onChange={(e) => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="season_number">Season Number *</Label>
                            <Input
                              id="season_number"
                              type="number"
                              value={episodeForm.season_number}
                              onChange={(e) => setEpisodeForm({ ...episodeForm, season_number: e.target.value })}
                              min="1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="episode_title">Title</Label>
                          <Input
                            id="episode_title"
                            value={episodeForm.title}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="video_url">Video URL *</Label>
                          <Input
                            id="video_url"
                            value={episodeForm.video_url}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, video_url: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode_description">Description</Label>
                          <Textarea
                            id="episode_description"
                            value={episodeForm.description}
                            onChange={(e) => setEpisodeForm({ ...episodeForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration">Duration (seconds)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={episodeForm.duration}
                              onChange={(e) => setEpisodeForm({ ...episodeForm, duration: e.target.value })}
                              placeholder="1440"
                            />
                          </div>
                          <div>
                            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                            <Input
                              id="thumbnail_url"
                              value={episodeForm.thumbnail_url}
                              onChange={(e) => setEpisodeForm({ ...episodeForm, thumbnail_url: e.target.value })}
                            />
                          </div>
                        </div>
                        <Button onClick={handleEpisodeSubmit} className="w-full">
                          {selectedEpisode ? 'Update' : 'Create'} Episode
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Anime</TableHead>
                      <TableHead>Episode</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {episodes.map((ep: any) => {
                      const animeItem = anime.find(a => a.id === ep.anime_id);
                      return (
                        <TableRow key={ep.id}>
                          <TableCell className="font-medium">{animeItem?.title || 'Unknown'}</TableCell>
                          <TableCell>{ep.episode_number}</TableCell>
                          <TableCell>{ep.season_number || 1}</TableCell>
                          <TableCell>{ep.title || '-'}</TableCell>
                          <TableCell>{ep.duration ? `${ep.duration}s` : '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEpisodeEdit(ep)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleEpisodeDelete(ep.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username || 'N/A'}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: 'user' | 'admin') =>
                              handleUserRoleUpdate(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
