/**
 * Favorites Admin Page
 *
 * Admin interface for managing favorite items (restaurants, movies, etc.)
 * Features:
 * - Category management (Add/Edit/Delete categories)
 * - Favorites management (Add/Edit/Delete items)
 * - Filtering by category
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import {
  Search,
  X,
  Heart,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Star,
  ExternalLink,
  Settings2,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getFavoriteCategories,
  createFavoriteCategory,
  updateFavoriteCategory,
  deleteFavoriteCategory,
  getFavorites,
  createFavorite,
  updateFavorite,
  deleteFavorite,
  getAllTags,
  type Favorite,
  type FavoriteCategory,
  type FavoriteWithCategory,
  type Tag,
} from '@/actions/favorites';

export default function FavoritesPage() {
  const [categories, setCategories] = useState<FavoriteCategory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteWithCategory[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Favorite | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<FavoriteCategory | null>(null);
  const [deleteItemData, setDeleteItemData] = useState<{
    id: string;
    type: 'item' | 'category';
  } | null>(null);

  // Form states
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    rating: 5,
    categoryId: '',
    externalUrl: '',
    imageUrl: '',
    selectedTagIds: [] as string[],
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    icon: '',
    color: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, favs, allTags] = await Promise.all([
        getFavoriteCategories(),
        getFavorites(),
        getAllTags(),
      ]);
      setCategories(cats);
      setFavorites(favs);
      setTags(allTags);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateItem = () => {
    setItemFormData({
      name: '',
      description: '',
      rating: 5,
      categoryId: categories[0]?.id || '',
      externalUrl: '',
      imageUrl: '',
      selectedTagIds: [],
    });
    setEditingItem(null);
    setItemDialogOpen(true);
  };

  const handleOpenEditItem = (item: FavoriteWithCategory) => {
    setItemFormData({
      name: item.name,
      description: item.description || '',
      rating: item.rating || 5,
      categoryId: item.categoryId,
      externalUrl: item.externalUrl || '',
      imageUrl: item.imageUrl || '',
      selectedTagIds: item.tags?.map((t) => t.id) || [],
    });
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  const handleOpenCategories = () => {
    setCategoryDialogOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name.trim() || !itemFormData.categoryId) {
      toast.error('Name and Category are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: itemFormData.name,
        description: itemFormData.description || null,
        rating: itemFormData.rating,
        categoryId: itemFormData.categoryId,
        externalUrl: itemFormData.externalUrl || null,
        imageUrl: itemFormData.imageUrl || null,
        metadata: {},
        tagIds: itemFormData.selectedTagIds,
      };

      if (editingItem) {
        const result = await updateFavorite(editingItem.id, payload);
        if (result.success) {
          toast.success('Favorite updated successfully');
          setItemDialogOpen(false);
          await fetchData();
        } else {
          toast.error(result.error || 'Failed to update favorite');
        }
      } else {
        const result = await createFavorite(payload);
        if (result.success) {
          toast.success('Favorite created successfully');
          setItemDialogOpen(false);
          await fetchData();
        } else {
          toast.error(result.error || 'Failed to create favorite');
        }
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      toast.error('Failed to save favorite');
    } finally {
      setSaving(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    try {
      setSaving(true);
      if (editingCategory) {
        const result = await updateFavoriteCategory(
          editingCategory.id,
          categoryFormData
        );
        if (result.success) {
          toast.success('Category updated');
          setEditingCategory(null);
          setCategoryFormData({ name: '', icon: '', color: '' });
          await fetchData();
        }
      } else {
        const result = await createFavoriteCategory(categoryFormData);
        if (result.success) {
          toast.success('Category created');
          setCategoryFormData({ name: '', icon: '', color: '' });
          await fetchData();
        }
      }
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemData) return;
    try {
      if (deleteItemData.type === 'item') {
        const result = await deleteFavorite(deleteItemData.id);
        if (result.success) {
          toast.success('Favorite deleted');
          await fetchData();
        }
      } else {
        const result = await deleteFavoriteCategory(deleteItemData.id);
        if (result.success) {
          toast.success('Category deleted');
          await fetchData();
        }
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleteItemData(null);
    }
  };

  const filteredFavorites = favorites.filter((f) => {
    const matchesCategory =
      selectedCategoryId === 'all' || f.categoryId === selectedCategoryId;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Favorites
            </h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              <span className="text-[10px] font-medium text-rose-500 uppercase tracking-wide">
                Collections
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your favorite restaurants, movies, songs, and more.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenCategories}>
            <Settings2 className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={handleOpenCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Favorite
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="flex-1 relative w-full max-w-md group">
          <Input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-10"
            aria-label="Search favorites"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategoryId === 'all' ? 'default' : 'outline'}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedCategoryId('all')}
            >
              All
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.id}
                variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Favorites</CardTitle>
          <CardDescription>
            {selectedCategoryId === 'all'
              ? 'Showing all items'
              : `Showing items in category`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No favorites found. Add your first one!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFavorites.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {item.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags && item.tags.length > 0 ? (
                          item.tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                            >
                              #{tag.label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < (item.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.externalUrl && (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteItemData({ id: item.id, type: 'item' })
                          }
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Favorite' : 'Add Favorite'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-name">Name *</Label>
                <Input
                  id="item-name"
                  value={itemFormData.name}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-category">Category *</Label>
                <Select
                  value={itemFormData.categoryId}
                  onValueChange={(val) =>
                    setItemFormData({ ...itemFormData, categoryId: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-description">Description</Label>
                <Textarea
                  id="item-description"
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-rating">Rating (1-5)</Label>
                <Select
                  value={itemFormData.rating.toString()}
                  onValueChange={(val) =>
                    setItemFormData({ ...itemFormData, rating: parseInt(val) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {r} Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-url">External URL</Label>
                <Input
                  id="item-url"
                  type="url"
                  value={itemFormData.externalUrl}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      externalUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tags (Hashtags)</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px]">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={
                        itemFormData.selectedTagIds.includes(tag.id)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer"
                      onClick={() => {
                        const isSelected = itemFormData.selectedTagIds.includes(
                          tag.id
                        );
                        setItemFormData({
                          ...itemFormData,
                          selectedTagIds: isSelected
                            ? itemFormData.selectedTagIds.filter(
                                (id) => id !== tag.id
                              )
                            : [...itemFormData.selectedTagIds, tag.id],
                        });
                      }}
                    >
                      #{tag.label}
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-sm text-muted-foreground">
                      No tags available. Create tags in Posts/Projects first.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <form
              onSubmit={handleCategorySubmit}
              className="flex items-end gap-2 p-4 border rounded-lg bg-muted/30"
            >
              <div className="grid flex-1 gap-2">
                <Label htmlFor="cat-name">New Category Name</Label>
                <Input
                  id="cat-name"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Restaurants"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {editingCategory ? 'Update' : 'Add'}
              </Button>
            </form>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Existing Categories</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <span>{cat.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryFormData({
                            name: cat.name,
                            icon: cat.icon || '',
                            color: cat.color || '',
                          });
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteItemData({ id: cat.id, type: 'category' })
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={!!deleteItemData}
        onOpenChange={(open) => !open && setDeleteItemData(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteItemData?.type === 'item' ? 'Favorite' : 'Category'}?`}
        description={
          deleteItemData?.type === 'category'
            ? 'This will also delete all items in this category. This action cannot be undone.'
            : 'This action cannot be undone.'
        }
      />
    </div>
  );
}
