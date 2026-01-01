'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { authFetch, authPost, authPut, authDelete } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Tag } from '@/types/tag';
import { Search, Plus, Pencil, Trash2, X, RotateCcw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TagManagerProps {
  type: 'hashtags' | 'topics';
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TagFormData {
  label: string;
  slug: string;
  description: string;
}

export interface TagManagerHandle {
  handleAdd: () => void;
}

export const TagManager = forwardRef<TagManagerHandle, TagManagerProps>(
  ({ type, icon }, ref) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<{
      id: string;
      label: string;
    } | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState<TagFormData>({
      label: '',
      slug: '',
      description: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const fetchTags = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await authFetch(`/api/${type}`);
        if (!response.ok) throw new Error(`Failed to fetch ${type}`);
        const data = await response.json();
        setTags(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }, [type]);

    useEffect(() => {
      fetchTags();
    }, [fetchTags]);

    useEffect(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        setDebouncedSearch(searchInput);
      }, 300);
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }
      };
    }, [searchInput]);

    const filteredTags = tags.filter(
      (tag) =>
        tag.label.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tag.slug.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    const handleDelete = (id: string, label: string) => {
      setTagToDelete({ id, label });
      setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
      if (!tagToDelete) return;
      try {
        const response = await authDelete(`/api/${type}/${tagToDelete.id}`);
        if (!response.ok)
          throw new Error(`Failed to delete ${type.slice(0, -1)}`);
        setTags((prev) => prev.filter((tag) => tag.id !== tagToDelete.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setDeleteDialogOpen(false);
        setTagToDelete(null);
      }
    };

    const handleAdd = () => {
      setEditingTag(null);
      setFormData({ label: '', slug: '', description: '' });
      setEditDialogOpen(true);
    };

    useImperativeHandle(ref, () => ({
      handleAdd,
    }));

    const handleEdit = (tag: Tag) => {
      setEditingTag(tag);
      setFormData({
        label: tag.label,
        slug: tag.slug,
        description: tag.description || '',
      });
      setEditDialogOpen(true);
    };

    const handleSave = async () => {
      if (!formData.label.trim()) {
        setError('Label is required');
        return;
      }

      setIsSaving(true);
      try {
        if (editingTag) {
          const response = await authPut(
            `/api/${type}/${editingTag.id}`,
            formData
          );
          if (!response.ok)
            throw new Error(`Failed to update ${type.slice(0, -1)}`);
          const updated = await response.json();
          setTags((prev) =>
            prev.map((t) => (t.id === editingTag.id ? updated : t))
          );
        } else {
          const slug =
            formData.slug.trim() ||
            formData.label.toLowerCase().replace(/\s+/g, '-');
          const response = await authPost(`/api/${type}/POST`, {
            ...formData,
            slug,
          });
          if (!response.ok)
            throw new Error(`Failed to create ${type.slice(0, -1)}`);
          const created = await response.json();
          setTags((prev) => [...prev, created]);
        }
        setEditDialogOpen(false);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsSaving(false);
      }
    };

    const LoadingSkeleton = () => (
      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 border-b">
                  <TableHead className="font-semibold">Label</TableHead>
                  <TableHead className="font-semibold">Slug</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, index) => (
                  <TableRow key={index} className="border-b">
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell className="py-4">
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );

    const isFiltered = searchInput !== '';

    return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative max-w-md group">
            <Input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-11 pr-10 transition-all duration-200 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              aria-label={`Search ${type}`}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => setSearchInput('')}
              className="flex items-center gap-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
        </div>

        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredTags.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="text-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center">
                  {icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No {type} found
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {searchInput
                      ? `No ${type} match your search`
                      : `Get started by adding your first ${type.slice(0, -1)}`}
                  </p>
                </div>
                {!searchInput && (
                  <Button
                    onClick={handleAdd}
                    className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first {type.slice(0, -1)}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b">
                      <TableHead className="font-semibold">Label</TableHead>
                      <TableHead className="font-semibold">Slug</TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map((tag) => (
                      <TableRow
                        key={tag.id}
                        className="border-b hover:bg-muted/50 transition-all duration-200 group"
                      >
                        <TableCell className="py-4 font-medium">
                          {tag.label}
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground font-mono text-sm">
                          {tag.slug}
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground max-w-xs truncate">
                          {tag.description || '-'}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(tag)}
                              className="hover:bg-primary/10 hover:border-primary hover:text-primary shadow-sm transition-all"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(tag.id, tag.label)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive shadow-sm transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTag
                  ? `Edit ${type.slice(0, -1)}`
                  : `Add ${type.slice(0, -1)}`}
              </DialogTitle>
              <DialogDescription>
                {editingTag
                  ? `Update the ${type.slice(0, -1)} details below.`
                  : `Fill in the details to create a new ${type.slice(0, -1)}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="Enter label"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="Auto-generated from label if empty"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : editingTag ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ConfirmDeleteDialog
          isOpen={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          title="Are you absolutely sure?"
          description={`This action cannot be undone. This will permanently delete "${tagToDelete?.label}" and remove it from the server.`}
        />
      </div>
    );
  }
);

TagManager.displayName = 'TagManager';
