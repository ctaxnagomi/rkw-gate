
import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Github, Linkedin, Mail, CheckCircle, Activity } from 'lucide-react';
import { getPortfolioConfig } from '../services/contentService';
import { PortfolioConfig, VisitorSessionData } from '../types';

declare global {
  interface Window {
    GitHubCalendar: any;
  }
}

interface AccessGrantedProps {
  previewData?: PortfolioConfig; // If provided, acts as a controlled component (Preview Mode)
  sessionData?: VisitorSessionData; // Optional data from the gatekeeper session
}

const AccessGranted: React.FC<AccessGrantedProps> = ({ previewData, sessionData }) => {
  const [data, setData] = useState<PortfolioConfig | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewData) {
      setData(previewData);
    } else {
      getPortfolioConfig().then(setData);
    }
  }, [previewData]);

  // Initializing GitHub Calendar with Debounce and Ref Safety
  useEffect(() => {
    // Only run if we have visibility, a username, and the library is loaded
    if (data?.github?.visible && data?.github?.username && window.GitHubCalendar) {

      const timer = setTimeout(() => {
        if (calendarRef.current) {
          try {
            // Reset content safely manually before library takes over
            calendarRef.current.innerHTML = `<div class="text-xs text-zinc-500 font-mono p-4">Loading graph for ${data.github.username}...</div>`;

            // Initialize library on the specific DOM element using REF (not querySelector)
            window.GitHubCalendar(calendarRef.current, data.github.username, { responsive: true });
          } catch (e) {
            console.error("Failed to load GitHub calendar", e);
            if (calendarRef.current) {
              calendarRef.current.innerHTML = `<div class="text-xs text-red-500 font-mono p-4">Error loading GitHub data.</div>`;
            }
          }
        }
      }, 500); // 500ms debounce to prevent rapid-fire API calls/DOM updates during typing

      return () => clearTimeout(timer);
    }
  }, [data?.github?.visible, data?.github?.username]);

  if (!data) return <div className="min-h-screen bg-zinc-950"></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8 overflow-y-auto z-20 relative selection:bg-green-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">

        {/* Header / Hero */}
        {data.hero.visible && (
          <header className="border-b border-zinc-800 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 group relative">
            <div>
              <div className="text-green-500 font-mono text-sm mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                ACCESS GRANTED via GATEKEEPER
              </div>

              {/* Dynamic Salary Badge - Only visible if recruiter offered valid salary */}
              {sessionData?.offeredSalary && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-green-900/30 border border-green-800 text-green-400 rounded-full text-xs font-mono">
                  <CheckCircle size={12} />
                  <span>OFFERED: ${sessionData.offeredSalary.toLocaleString()}/mo</span>
                </div>
              )}

              <h1 className="text-5xl font-bold tracking-tighter mb-2">{data.hero.title}</h1>
              <p className="text-zinc-400 max-w-lg leading-relaxed">
                {data.hero.subtitle}
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
                <Github size={20} />
              </a>
              <a href="#" className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
                <Linkedin size={20} />
              </a>
              <a href="#" className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors border border-zinc-800">
                <Mail size={20} />
              </a>
            </div>
          </header>
        )}

        {/* Projects Grid */}
        {data.projects.visible && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-green-500 font-mono">01.</span> {data.projects.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.items.map((project, i) => (
                <div key={project.id} className="group relative border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-all rounded-lg overflow-hidden flex flex-col">

                  {/* Image Container with Link */}
                  <a
                    href={project.link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`aspect-video bg-zinc-800 w-full relative overflow-hidden block ${!project.link ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <img
                      src={project.imageUrl || `https://picsum.photos/seed/${project.imageSeed || i + 50}/800/600`}
                      alt={project.title}
                      className="object-cover w-full h-full opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    {project.link && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="bg-zinc-900 text-green-500 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 border border-zinc-700">
                          View Project <ExternalLink size={12} />
                        </span>
                      </div>
                    )}
                  </a>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                      {project.title}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} className="text-zinc-600 hover:text-green-500 transition-colors" />
                        </a>
                      )}
                    </h3>
                    <p className="text-zinc-400 text-sm mb-4 flex-1 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {project.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300 font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About & Stats */}
        {(data.about.visible || data.stats.visible) && (
          <section className="border-t border-zinc-800 pt-12">
            <div className="grid md:grid-cols-3 gap-12">

              {data.stats.visible && (
                <div className="md:col-span-1">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-green-500 font-mono">02.</span> Stats
                  </h2>
                  <div className="space-y-4 font-mono text-sm text-zinc-400">
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Experience</span>
                      <span className="text-zinc-100">{data.stats.experience}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Projects</span>
                      <span className="text-zinc-100">{data.stats.projects}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Coffee</span>
                      <span className="text-zinc-100">{data.stats.coffee}</span>
                    </div>
                  </div>
                </div>
              )}

              {data.about.visible && (
                <div className={data.stats.visible ? "md:col-span-2" : "md:col-span-3"}>
                  <h2 className="text-2xl font-bold mb-4">{data.about.title}</h2>
                  <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                    {data.about.content}
                  </p>
                </div>
              )}

            </div>
          </section>
        )}

        {/* GitHub Stats */}
        {data.github.visible && (
          <section className="border-t border-zinc-800 pt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-green-500 font-mono">03.</span> Open Source Activity
              <Activity size={16} className="text-zinc-500" />
            </h2>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 overflow-hidden">
              {/* Empty div for library to take over - prevents React reconciliation errors */}
              <div ref={calendarRef} className="calendar min-h-[150px]"></div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default AccessGranted;
