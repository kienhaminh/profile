'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Technology {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

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
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTechnologies();
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

  const fetchTechnologies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/technologies');
      if (!response.ok) throw new Error('Failed to fetch technologies');
      const data = await response.json();
      setTechnologies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTechnology = async (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/technologies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ name, slug }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create technology');
      }

      const newTechnology = await response.json();
      setTechnologies((prev) => [...prev, newTechnology]);
      onChange([...value, newTechnology.id]);
      setSearchQuery('');
      return newTechnology;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
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

  const selectedTechnologies = technologies.filter((t) => value.includes(t.id));
  const unselectedTechnologies = filteredTechnologies.filter(
    (t) => !value.includes(t.id)
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
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
          placeholder={value.length === 0 ? 'Search or create technologies...' : ''}
          className="flex-1 min-w-[120px] outline-none text-sm"
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
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
