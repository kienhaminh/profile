'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Hashtag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

interface HashtagSelectProps {
  value: string[];
  onChange: (hashtagIds: string[]) => void;
  className?: string;
}

export function HashtagSelect({
  value,
  onChange,
  className = '',
}: HashtagSelectProps) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHashtags();
  }, []);

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

  const fetchHashtags = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/hashtags');
      if (!response.ok) throw new Error('Failed to fetch hashtags');
      const data = await response.json();
      setHashtags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createHashtag = async (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/hashtags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ name, slug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create hashtag');
      }

      const newHashtag = await response.json();
      setHashtags((prev) => [...prev, newHashtag]);
      onChange([...value, newHashtag.id]);
      setSearchQuery('');
      return newHashtag;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();

      const existingHashtag = filteredHashtags.find(
        (h) => h.name.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingHashtag) {
        if (!value.includes(existingHashtag.id)) {
          onChange([...value, existingHashtag.id]);
        }
      } else {
        try {
          await createHashtag(searchQuery.trim());
        } catch (err) {
          console.error('Failed to create hashtag:', err);
        }
      }
      setSearchQuery('');
    } else if (e.key === 'Backspace' && !searchQuery && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (hashtagId: string) => {
    if (value.includes(hashtagId)) {
      onChange(value.filter((id) => id !== hashtagId));
    } else {
      onChange([...value, hashtagId]);
    }
  };

  const handleRemove = (hashtagId: string) => {
    onChange(value.filter((id) => id !== hashtagId));
  };

  const filteredHashtags = hashtags.filter((hashtag) =>
    hashtag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedHashtags = hashtags.filter((h) => value.includes(h.id));
  const unselectedHashtags = filteredHashtags.filter(
    (h) => !value.includes(h.id)
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[42px]">
        {selectedHashtags.map((hashtag) => (
          <span
            key={hashtag.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
          >
            {hashtag.name}
            <button
              type="button"
              onClick={() => handleRemove(hashtag.id)}
              className="hover:text-blue-600"
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
          placeholder={value.length === 0 ? 'Search or create hashtags...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : unselectedHashtags.length > 0 ? (
            <ul>
              {unselectedHashtags.map((hashtag) => (
                <li key={hashtag.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(hashtag.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex flex-col"
                  >
                    <span className="font-medium">{hashtag.name}</span>
                    {hashtag.description && (
                      <span className="text-xs text-gray-500">
                        {hashtag.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchQuery.trim() ? (
            <div className="p-3 text-sm text-gray-500">
              Press Enter to create &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="p-3 text-sm text-gray-500">
              {hashtags.length === 0
                ? 'No hashtags available. Type to create one.'
                : 'All hashtags selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
