'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/lib/slug';
import { trpc } from '@/trpc/react';

interface TagSelectProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function TagSelect({
  value,
  onChange,
  className = '',
  placeholder = 'Search or create tags...',
}: TagSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const {
    data: tags = [],
    isLoading: isFetchingTags,
  } = trpc.tags.list.useQuery(undefined, {
    staleTime: 60_000,
    onError: (err) => setError(err.message),
  });

  const createTagMutation = trpc.tags.create.useMutation({
    onError: (err) => {
      setError(err.message);
    },
  });

  const isLoading = isFetchingTags || createTagMutation.isPending;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createTag = async (name: string) => {
    const slug = generateSlug(name);

    // Validate slug before sending to backend
    if (!isValidSlug(slug)) {
      throw new Error(
        `Unable to generate a valid slug for "${name}". Please use a different name.`
      );
    }

    try {
      setError(null);
      const newTag = await createTagMutation.mutateAsync({
        label: name,
        slug,
      });
      utils.tags.list.setData(undefined, (prev) => [
        ...(prev ?? []),
        newTag,
      ]);
      onChange([...value, newTag.id]);
      setSearchQuery('');
      return newTag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();

      const existingTag = filteredTags.find(
        (t) => t.label.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingTag) {
        if (!value.includes(existingTag.id)) {
          onChange([...value, existingTag.id]);
        }
      } else {
        try {
          await createTag(searchQuery.trim());
        } catch (err) {
          console.error('Failed to create tag:', err);
        }
      }
      setSearchQuery('');
    } else if (e.key === 'Backspace' && !searchQuery && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  const handleRemove = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  const filteredTags = tags.filter((tag) =>
    tag.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTags = tags.filter((tag) =>
    value.includes(tag.id)
  );

  const unselectedTags = filteredTags.filter(
    (tag) => !value.includes(tag.id)
  );

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="tag-dropdown"
      aria-haspopup="listbox"
      aria-label="Select tags"
    >
      <div className="flex flex-wrap gap-2 p-3 border border-input rounded-md bg-background text-foreground min-h-[42px]">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary border border-primary/20 rounded"
          >
            {tag.label}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="hover:text-primary/80 transition-colors"
              aria-label={`Remove ${tag.label}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length === 0 ? placeholder : ''
          }
          className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-destructive mt-1">{error}</p>}

      {isOpen && (
        <div
          id="tag-dropdown"
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading...</div>
          ) : unselectedTags.length > 0 ? (
            <ul>
              {unselectedTags.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(tag.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex flex-col text-foreground"
                  >
                    <span className="font-medium">{tag.label}</span>
                    {tag.description && (
                      <span className="text-xs text-muted-foreground">
                        {tag.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() ? (
            <div className="p-3 text-sm text-muted-foreground">
              Press Enter to create &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground">
              {tags.length === 0
                ? 'No tags available. Type to create one.'
                : 'All tags selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
