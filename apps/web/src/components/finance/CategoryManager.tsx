'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { FinanceCategory } from '@/types/finance';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/app/actions/finance';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';

interface CategoryManagerProps {
  categories: FinanceCategory[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsCreating(true);
    startTransition(async () => {
      try {
        await createCategory(newCategoryName.trim());
        setNewCategoryName('');
        toast.success('Category created');
      } catch (error) {
        toast.error('Failed to create category');
        console.error(error);
      } finally {
        setIsCreating(false);
      }
    });
  };

  const handleEdit = (category: FinanceCategory) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const handleSave = (id: string) => {
    if (!editValue.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSavingId(id);
    startTransition(async () => {
      try {
        await updateCategory(id, editValue.trim());
        setEditingId(null);
        toast.success('Category updated');
      } catch (error) {
        toast.error('Failed to update category');
        console.error(error);
      } finally {
        setSavingId(null);
      }
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted');
    } catch (error) {
      toast.error(
        'Failed to delete category. It may be in use by transactions.'
      );
      console.error(error);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Add, edit, or remove spending categories.
        </p>

        {/* Add new category */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="New category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            disabled={isCreating}
          />
          <Button
            onClick={handleCreate}
            disabled={isCreating || !newCategoryName.trim()}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Category list */}
        <div className="grid gap-2">
          {categories.map((category) => {
            const isEditing = editingId === category.id;
            const isLoading = savingId === category.id;

            return (
              <div
                key={category.id}
                className="flex items-center gap-2 p-3 border rounded-lg"
              >
                {isEditing ? (
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave(category.id);
                        if (e.key === 'Escape') handleCancel();
                      }}
                      className="flex-1"
                      autoFocus
                      disabled={isLoading}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSave(category.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium">{category.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No categories yet. Add one above.
          </p>
        )}

        <ConfirmDeleteDialog
          isOpen={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          title="Delete Category"
          description="Are you sure you want to delete this category? Transactions using this category will become uncategorized."
        />
      </CardContent>
    </Card>
  );
}
