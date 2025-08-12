import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useUserFeeds } from "@/hooks/useUserFeeds";

export default function FeedsPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const { projects, addProject } = useProjects();
  const { feeds, addFeed, setActive, removeFeed } = useUserFeeds(selectedProject);

  return (
    <div className="p-6 text-sm text-neutral-200">
      <h1 className="text-xl font-bold mb-4">Your Feeds (prototype)</h1>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Projects</h2>
        {projects.isLoading ? "Loading..." : (
          <ul className="space-y-2">
            <li>
              <button className="px-2 py-1 bg-neutral-700 rounded" onClick={() => setSelectedProject(null)}>
                All Projects
              </button>
            </li>
            {projects.data?.map(p => (
              <li key={p.id}>
                <button className={`px-2 py-1 rounded ${selectedProject === p.id ? "bg-blue-600" : "bg-neutral-700"}`}
                        onClick={() => setSelectedProject(p.id)}>
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <button
            className="px-3 py-1 bg-green-600 rounded"
            onClick={() => addProject.mutate({ name: `Project ${Date.now()}`, description: null })}
          >
            + Quick Add Project
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Feeds</h2>
        {feeds.isLoading ? "Loading..." : (
          <ul className="space-y-2">
            {feeds.data?.map(f => (
              <li key={f.id} className="flex items-center gap-2">
                <span className="flex-1">{f.title ?? f.feed_url}</span>
                <button className="px-2 py-1 bg-neutral-700 rounded"
                        onClick={() => setActive.mutate({ id: f.id, isActive: !f.is_active })}>
                  {f.is_active ? "Disable" : "Enable"}
                </button>
                <button className="px-2 py-1 bg-red-700 rounded" onClick={() => removeFeed.mutate(f.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <button
            className="px-3 py-1 bg-green-600 rounded"
            onClick={() => addFeed.mutate({
              feed_url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
              title: "NYT Home",
              project_id: selectedProject,
            })}
          >
            + Quick Add NYT
          </button>
          <button
            className="px-3 py-1 bg-green-600 rounded"
            onClick={() => addFeed.mutate({
              feed_url: "https://feeds.feedburner.com/TechCrunch/",
              title: "TechCrunch",
              project_id: selectedProject,
            })}
          >
            + Quick Add TechCrunch
          </button>
        </div>
      </div>
    </div>
  );
}