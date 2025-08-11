import { useQuery } from '@tanstack/react-query';
import { Database } from '@shared/database.types';
import { FLAGS } from '@/flags';

type CulturalMoment = Database['public']['Tables']['cultural_moments']['Row'];

export default function MomentsRadar() {
  if (!FLAGS.PHASE5_MOMENTS_RADAR) {
    return null;
  }

  const { data: moments, isLoading } = useQuery<CulturalMoment[]>({
    queryKey: ['/api/cultural-moments'],
  });

  if (isLoading) {
    return (
      <div className="p-6" data-testid="moments-loading">
        <h1 className="text-2xl font-bold mb-4">Cultural Moments Radar</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="moments-radar">
      <h1 className="text-2xl font-bold mb-4">Cultural Moments Radar</h1>
      <div className="space-y-4">
        {moments?.map((moment) => (
          <div 
            key={moment.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            data-testid={`moment-card-${moment.id}`}
          >
            <h3 className="font-semibold text-lg" data-testid={`moment-title-${moment.id}`}>
              {moment.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2" data-testid={`moment-description-${moment.id}`}>
              {moment.description}
            </p>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-4">
                <span className="text-sm font-medium" data-testid={`moment-intensity-${moment.id}`}>
                  Intensity: {moment.intensity}/10
                </span>
                <span className="text-sm font-medium" data-testid={`moment-demographics-${moment.id}`}>
                  Demographics: {moment.demographics?.join(', ') || 'All'}
                </span>
              </div>
              <span className="text-xs text-gray-500" data-testid={`moment-updated-${moment.id}`}>
                Updated: {new Date(moment.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {(!moments || moments.length === 0) && (
          <div className="text-center py-8 text-gray-500" data-testid="moments-empty">
            No cultural moments detected yet
          </div>
        )}
      </div>
    </div>
  );
}