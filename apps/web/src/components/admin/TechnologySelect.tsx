'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { generateSlug, isValidSlug } from '@/lib/slug';
import { trpc } from '@/trpc/react';

interface TechnologySelectProps {
  value: string[];
  onChange: (technologyIds: string[]) => void;
  className?: string;
}

export function TechnologySelect({
  value,
  onChange,
  className = '',
}: TechnologySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const {
    data: technologies = [],
    isLoading: isFetchingTechnologies,
  } = trpc.technologies.list.useQuery(undefined, {
    staleTime: 60_000,
    onError: (err) => setError(err.message),
  });

  const createTechnologyMutation = trpc.technologies.create.useMutation({
    onError: (err) => {
      setError(err.message);
    },
  });

  const isLoading = isFetchingTechnologies || createTechnologyMutation.isPending;

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

  const createTechnology = async (name: string) => {
    const slug = generateSlug(name);

    // Validate slug before sending to backend
    if (!isValidSlug(slug)) {
      throw new Error(
        `Unable to generate a valid slug for "${name}". Please use a different name.`
      );
    }

    try {
      setError(null);
      const newTechnology = await createTechnologyMutation.mutateAsync({
        name,
        slug,
      });
      utils.technologies.list.setData(undefined, (prev) => [
        ...(prev ?? []),
        newTechnology,
      ]);
      onChange([...value, newTechnology.id]);
      setSearchQuery('');
      return newTechnology;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();

      const existingTechnology = filteredTechnologies.find(
        (t) => t.name.toLowerCase() === searchQuery.toLowerCase()
      );

      if (existingTechnology) {
        if (!value.includes(existingTechnology.id)) {
          onChange([...value, existingTechnology.id]);
        }
      } else {
        try {
          await createTechnology(searchQuery.trim());
        } catch (err) {
          console.error('Failed to create technology:', err);
        }
      }
      setSearchQuery('');
    } else if (e.key === 'Backspace' && !searchQuery && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (technologyId: string) => {
    if (value.includes(technologyId)) {
      onChange(value.filter((id) => id !== technologyId));
    } else {
      onChange([...value, technologyId]);
    }
  };

  const handleRemove = (technologyId: string) => {
    onChange(value.filter((id) => id !== technologyId));
  };

  const filteredTechnologies = technologies.filter((technology) =>
    technology.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTechnologies = technologies.filter((technology) =>
    value.includes(technology.id)
  );

  const unselectedTechnologies = filteredTechnologies.filter(
    (technology) => !value.includes(technology.id)
  );
  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="technology-dropdown"
      aria-haspopup="listbox"
      aria-label="Select technologies"
    >
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md bg-white min-h-[42px]">
        {selectedTechnologies.map((technology) => (
          <span
            key={technology.id}
            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-800 rounded"
          >
            {technology.name}
            <button
              type="button"
              onClick={() => handleRemove(technology.id)}
              className="hover:text-green-600"
              aria-label={`Remove ${technology.name}`}
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
            value.length === 0 ? 'Search or create technologies...' : ''
          }
          className="flex-1 min-w-[120px] outline-none text-sm"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

      {isOpen && (
        <div
          id="technology-dropdown"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          ) : unselectedTechnologies.length > 0 ? (
            <ul>
              {unselectedTechnologies.map((technology) => (
                <li key={technology.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(technology.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex flex-col"
                  >
                    <span className="font-medium">{technology.name}</span>
                    {technology.description && (
                      <span className="text-xs text-gray-500">
                        {technology.description}
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
              {technologies.length === 0
                ? 'No technologies available. Type to create one.'
                : 'All technologies selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
