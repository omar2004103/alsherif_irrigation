import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PROJECTS_DATA, ProjectItem } from '@/data/projectsData';

const STORAGE_KEY = 'alsherif_projects_cache';
const SETTING_KEY = 'projects_list';

// Helper to get initial cached data from localStorage
function getLocalCache(): ProjectItem[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading projects cache:', e);
  }
  return PROJECTS_DATA;
}

// Helper to write to local cache
function setLocalCache(projects: ProjectItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects cache:', e);
  }
}

export function useProjectsData() {
  const queryClient = useQueryClient();

  const { data: projects = getLocalCache(), isLoading, error } = useQuery<ProjectItem[]>({
    queryKey: ['projects_data'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', SETTING_KEY)
          .maybeSingle();

        if (error) {
          console.warn('Could not fetch projects_list from site_settings:', error.message);
          return getLocalCache();
        }

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocalCache(parsed);
              return parsed;
            }
          } catch (pe) {
            console.error('Error parsing projects_list JSON:', pe);
          }
        }

        // If no custom projects saved yet in database, seed with baseline PROJECTS_DATA
        return getLocalCache();
      } catch (err) {
        console.error('Unexpected error in useProjectsData query:', err);
        return getLocalCache();
      }
    },
    staleTime: 30_000,
    initialData: getLocalCache,
  });

  // Mutation to persist entire projects array to Supabase site_settings
  const saveMutation = useMutation({
    mutationFn: async (updatedProjects: ProjectItem[]) => {
      // 1. Update local cache immediately
      setLocalCache(updatedProjects);

      // 2. Persist to Supabase site_settings
      const { error } = await supabase.from('site_settings').upsert(
        {
          key: SETTING_KEY,
          value: JSON.stringify(updatedProjects),
        },
        { onConflict: 'key' }
      );

      if (error) {
        console.error('Failed to persist projects to site_settings:', error);
        throw error;
      }

      return updatedProjects;
    },
    onSuccess: (updatedProjects) => {
      queryClient.setQueryData(['projects_data'], updatedProjects);
      queryClient.invalidateQueries({ queryKey: ['projects_data'] });
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
    },
  });

  const addProject = async (newProject: ProjectItem) => {
    const updated = [newProject, ...projects];
    await saveMutation.mutateAsync(updated);
  };

  const updateProject = async (id: string, partial: Partial<ProjectItem>) => {
    const updated = projects.map((p) => (p.id === id ? { ...p, ...partial } : p));
    await saveMutation.mutateAsync(updated);
  };

  const deleteProject = async (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    await saveMutation.mutateAsync(updated);
  };

  return {
    projects,
    isLoading,
    error,
    saveProjects: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    addProject,
    updateProject,
    deleteProject,
  };
}
