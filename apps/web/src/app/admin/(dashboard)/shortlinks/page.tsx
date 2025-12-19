/**
 * Shortlinks Admin Page
 *
 * Admin interface for managing URL shortlinks. Features:
 * - Table view of all shortlinks with copy, edit, delete actions
 * - Create/edit dialog with slug generation
 * - Status toggle, click tracking, and expiration display
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Link2,
  Plus,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MousePointerClick,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getShortlinks,
  createShortlink,
  updateShortlink,
  deleteShortlink,
  toggleShortlinkStatus,
  generateSlug,
  type Shortlink,
} from '@/actions/shortlinks';

export default function ShortlinksPage() {
  const [shortlinks, setShortlinks] = useState<Shortlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Shortlink | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    destinationUrl: '',
    title: '',
    isActive: true,
    expiresAt: '',
    password: '',
  });

  // Load shortlinks on mount
  useEffect(() => {
    fetchShortlinks();
  }, []);

  const fetchShortlinks = async () => {
    try {
      setLoading(true);
      const data = await getShortlinks();
      setShortlinks(data);
    } catch (error) {
      console.error('Error fetching shortlinks:', error);
      toast.error('Failed to load shortlinks');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = async () => {
    const slug = await generateSlug();
    setFormData({
      slug,
      destinationUrl: '',
      title: '',
      isActive: true,
      expiresAt: '',
      password: '',
    });
    setEditingLink(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (link: Shortlink) => {
    setFormData({
      slug: link.slug,
      destinationUrl: link.destinationUrl,
      title: link.title || '',
      isActive: link.isActive,
      expiresAt: link.expiresAt
        ? new Date(link.expiresAt).toISOString().slice(0, 16)
        : '',
      password: '',
    });
    setEditingLink(link);
    setDialogOpen(true);
  };

  const handleGenerateSlug = async () => {
    const slug = await generateSlug();
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destinationUrl.trim()) {
      toast.error('Destination URL is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        slug: formData.slug,
        destinationUrl: formData.destinationUrl,
        title: formData.title || null,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        password: formData.password || null,
      };

      if (editingLink) {
        const result = await updateShortlink(editingLink.id, payload);
        if (result.success) {
          toast.success('Shortlink updated successfully');
          setDialogOpen(false);
          await fetchShortlinks();
        } else {
          toast.error(result.error || 'Failed to update shortlink');
        }
      } else {
        const result = await createShortlink(payload);
        if (result.success) {
          toast.success('Shortlink created successfully');
          setDialogOpen(false);
          await fetchShortlinks();
        } else {
          toast.error(result.error || 'Failed to create shortlink');
        }
      }
    } catch (error) {
      console.error('Error saving shortlink:', error);
      toast.error('Failed to save shortlink');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const result = await deleteShortlink(deleteId);
      if (result.success) {
        toast.success('Shortlink deleted successfully');
        await fetchShortlinks();
      } else {
        toast.error(result.error || 'Failed to delete shortlink');
      }
    } catch (error) {
      console.error('Error deleting shortlink:', error);
      toast.error('Failed to delete shortlink');
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleShortlinkStatus(id);
      if (result.success) {
        toast.success(
          `Shortlink ${result.isActive ? 'activated' : 'deactivated'}`
        );
        await fetchShortlinks();
      } else {
        toast.error(result.error || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const copyToClipboard = async (slug: string) => {
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Short URL copied to clipboard');
    } catch {
      toast.error('Failed to copy URL');
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpired = (expiresAt: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shortlinks</h1>
          <p className="text-muted-foreground">
            Create and manage short URLs for easy sharing
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Shortlink
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Shortlinks
            </CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlinks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                shortlinks.filter((l) => l.isActive && !isExpired(l.expiresAt))
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shortlinks.reduce((acc, l) => acc + l.clickCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shortlinks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Shortlinks</CardTitle>
          <CardDescription>
            Manage your short URLs and track their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : shortlinks.length === 0 ? (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No shortlinks yet. Create your first one!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-center">Clicks</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shortlinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          /s/{link.slug}
                        </code>
                        {link.title && (
                          <span className="text-xs text-muted-foreground">
                            {link.title}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline truncate max-w-[200px] block"
                      >
                        {link.destinationUrl}
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{link.clickCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {isExpired(link.expiresAt) ? (
                        <Badge variant="outline" className="text-amber-600">
                          <Clock className="h-3 w-3 mr-1" />
                          Expired
                        </Badge>
                      ) : link.isActive ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(link.expiresAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(link.slug)}
                          title="Copy short URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/s/${link.slug}`, '_blank')
                          }
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(link.id)}
                          title={link.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {link.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(link)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(link.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete"
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? 'Edit Shortlink' : 'Create Shortlink'}
            </DialogTitle>
            <DialogDescription>
              {editingLink
                ? 'Update the shortlink details below.'
                : 'Create a new short URL for easy sharing.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Destination URL */}
              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL *</Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  placeholder="https://example.com/long-url"
                  value={formData.destinationUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      destinationUrl: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Short Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    placeholder="my-link"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL will be: {window.location.origin}/s/{formData.slug}
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="My Resume"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password Protection (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Leave empty for no password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-xs text-muted-foreground">
                    Inactive links will return a 404
                  </p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingLink ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shortlink?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The short URL will stop working
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
