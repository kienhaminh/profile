'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  Tag,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { FinanceCategory, FinanceTransactionType } from '@/types/finance';
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
  const [editType, setEditType] = useState<FinanceTransactionType>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] =
    useState<FinanceTransactionType>('expense');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Group categories by type
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' || !c.type
  );

  const handleCreate = () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsCreating(true);
    startTransition(async () => {
      try {
        await createCategory(newCategoryName.trim(), newCategoryType);
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
    setEditType((category.type as FinanceTransactionType) || 'expense');
  };

  const handleSave = (id: string) => {
    if (!editValue.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSavingId(id);
    startTransition(async () => {
      try {
        await updateCategory(id, editValue.trim(), editType);
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

  const renderCategoryItem = (category: FinanceCategory) => {
    const isEditing = editingId === category.id;
    const isLoading = savingId === category.id;
    const typeColor = category.type === 'income' ? 'emerald' : 'rose';

    return (
      <div
        key={category.id}
        className="group relative flex items-center justify-between p-2 pl-3 rounded-lg bg-card/50 border border-border/50 hover:border-border transition-all"
      >
        {isEditing ? (
          <div className="flex-1 flex gap-2 items-center">
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave(category.id);
                if (e.key === 'Escape') handleCancel();
              }}
              className="h-8 flex-1"
              autoFocus
              disabled={isLoading}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => handleSave(category.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Save className="h-4 w-4 text-primary" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-md bg-${typeColor}-500/10`}>
                <Tag className={`h-3 w-3 text-${typeColor}-500`} />
              </div>
              <span className="text-sm font-medium">{category.name}</span>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-[10px] uppercase font-bold"
                onClick={() => handleEdit(category)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setDeleteId(category.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Card */}
      <Card className="bg-card/50">
        <CardContent className="p-4 pt-4">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <div className="flex-1 w-full relative">
              <Input
                placeholder="Name your new category..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                disabled={isCreating}
                className="pl-9"
              />
              <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <Select
              value={newCategoryType}
              onValueChange={(v) =>
                setNewCategoryType(v as FinanceTransactionType)
              }
            >
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                    <span>Income</span>
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                    <span>Expense</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full md:w-auto px-6 h-10"
              onClick={handleCreate}
              disabled={isCreating || !newCategoryName.trim()}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="bg-card/50 overflow-hidden">
          <CardHeader className="p-4 border-b border-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-emerald-500">
                  Income Categories
                </CardTitle>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                {incomeCategories.length} Total
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-emerald-500/[0.02]">
            {incomeCategories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Plus className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">
                  No income categories found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {incomeCategories.map(renderCategoryItem)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="bg-card/50 overflow-hidden">
          <CardHeader className="p-4 border-b border-rose-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 text-rose-500" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-rose-500">
                  Expense Categories
                </CardTitle>
              </div>
              <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                {expenseCategories.length} Total
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-rose-500/[0.02]">
            {expenseCategories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                <Plus className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-medium">
                  No expense categories found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {expenseCategories.map(renderCategoryItem)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category"
        description="Are you sure you want to delete this category? Transactions using this category will become uncategorized."
      />
    </div>
  );
}
