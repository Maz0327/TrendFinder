import { useQuery } from '@tanstack/react-query';
import { Database } from '@shared/database.types';
import { FLAGS } from '@/flags';
import { useState } from 'react';

type Capture = Database['public']['Tables']['captures']['Row'];

export default function CapturesInbox() {
  if (!FLAGS.PHASE5_CAPTURE_ASSIST) {
    return null;
  }

  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: captures, isLoading } = useQuery<Capture[]>({
    queryKey: ['/api/captures'],
  });

  // Client-side filtering and pagination
  const filteredCaptures = captures?.filter(capture => {
    const platformMatch = !platformFilter || capture.platform === platformFilter;
    const tagMatch = !tagFilter || capture.tags?.some(tag => 
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
    return platformMatch && tagMatch;
  }) || [];

  const totalPages = Math.ceil(filteredCaptures.length / pageSize);
  const paginatedCaptures = filteredCaptures.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const platforms = [...new Set(captures?.map(c => c.platform).filter((p): p is string => Boolean(p)))];

  if (isLoading) {
    return (
      <div className="p-6" data-testid="captures-loading">
        <h1 className="text-2xl font-bold mb-4">Captures Inbox</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="captures-inbox">
      <h1 className="text-2xl font-bold mb-4">Captures Inbox</h1>
      
      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Platform</label>
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded"
            data-testid="platform-filter"
          >
            <option value="">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tag</label>
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter by tag..."
            className="p-2 border border-gray-300 dark:border-gray-600 rounded"
            data-testid="tag-filter"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300" data-testid="results-count">
        Showing {paginatedCaptures.length} of {filteredCaptures.length} captures
      </div>

      {/* Captures List */}
      <div className="space-y-4">
        {paginatedCaptures.map((capture) => (
          <div 
            key={capture.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            data-testid={`capture-card-${capture.id}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg" data-testid={`capture-title-${capture.id}`}>
                {capture.title}
              </h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {capture.platform}
                </span>
                {capture.viral_score && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                    Score: {capture.viral_score}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-3" data-testid={`capture-content-${capture.id}`}>
              {capture.content}
            </p>
            
            {capture.tags && capture.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {capture.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    data-testid={`capture-tag-${capture.id}-${index}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500" data-testid={`capture-date-${capture.id}`}>
                {new Date(capture.created_at).toLocaleDateString()}
              </span>
              {capture.url && (
                <a
                  href={capture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  data-testid={`capture-source-${capture.id}`}
                >
                  Open Source
                </a>
              )}
            </div>
          </div>
        ))}
        
        {paginatedCaptures.length === 0 && (
          <div className="text-center py-8 text-gray-500" data-testid="captures-empty">
            No captures match your filters
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6" data-testid="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            data-testid="prev-page"
          >
            Previous
          </button>
          <span className="px-3 py-1" data-testid="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
            data-testid="next-page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}