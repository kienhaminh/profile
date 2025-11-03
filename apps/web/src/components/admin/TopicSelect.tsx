'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/lib/slug';
import { authFetch, authPost } from '@/lib/auth';
import type { Tag } from '@/types/tag';

interface TopicSelectProps {
  value: string[];
  onChange: (topicIds: string[]) => void;
  className?: string;
}

export function TopicSelect({
  value,
  onChange,
  className = '',
}: TopicSelectProps) {
  const [topics, setTopics] = useState<Tag[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTopics();
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

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authFetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch topics');
      const data = await response.json();
      setTopics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const createTopic = async (name: string) => {
    const slug = generateSlug(name);

    // Validate slug before sending to backend
    if (!isValidSlug(slug)) {
      throw new Error(
        `Unable to generate a valid slug for "${name}". Please use a different name.`
      );
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await authPost('/api/tags', { label: name, slug });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create topic');
      }

      const newTopic = await response.json();
      setTopics((prev) => [...prev, newTopic]);
      onChange([...value, newTopic.id]);
      setSearchQuery('');
      return newTopic;
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

      const existingTopic = filteredTopics.find(
        (t) => t.label?.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingTopic) {
        if (!value.includes(existingTopic.id)) {
          onChange([...value, existingTopic.id]);
        }
      } else {
        try {
          await createTopic(searchQuery.trim());
        } catch (err) {
          console.error('Failed to create topic:', err);
        }
      }
      setSearchQuery('');
    } else if (e.key === 'Backspace' && !searchQuery && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (topicId: string) => {
    if (value.includes(topicId)) {
      onChange(value.filter((id) => id !== topicId));
    } else {
      onChange([...value, topicId]);
    }
  };

  const handleRemove = (topicId: string) => {
    onChange(value.filter((id) => id !== topicId));
  };

  const filteredTopics = topics.filter((topic) =>
    topic.label?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTopics = topics.filter((t) => value.includes(t.id));
  const unselectedTopics = filteredTopics.filter((t) => !value.includes(t.id));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[42px]">
        {selectedTopics.map((topic) => (
          <span
            key={topic.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-purple-100 text-purple-800 rounded"
          >
            {topic.label}
            <button
              type="button"
              onClick={() => handleRemove(topic.id)}
              className="hover:text-purple-600"
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
          placeholder={value.length === 0 ? 'Search or create topics...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : unselectedTopics.length > 0 ? (
            <ul>
              {unselectedTopics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(topic.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex flex-col"
                  >
                    <span className="font-medium">{topic.label}</span>
                    {topic.description && (
                      <span className="text-xs text-gray-500">
                        {topic.description}
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
              {topics.length === 0
                ? 'No topics available. Type to create one.'
                : 'All topics selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
