
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, Save, Layers, Edit2, LayoutTemplate, Monitor, Plus, Trash2, ChevronDown, ChevronRight, Image as ImageIcon, Link as LinkIcon, Github } from 'lucide-react';
import { GatekeeperState, PortfolioConfig, ProjectItem } from '../types';
import { getPortfolioConfig, savePortfolioConfig } from '../services/contentService';
import { supabase } from '../services/supabaseClient';
import AccessGranted from './AccessGranted';

import { QRCodeSVG } from 'qrcode.react';

interface ProfileBuilderProps {
  onStateChange: (state: GatekeeperState) => void;
}

const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ onStateChange }) => {
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [section, setSection] = useState<'hero' | 'about' | 'stats' | 'projects' | 'github'>('hero');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get current user
    // 2. Fetch THEIR config
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        getPortfolioConfig(user.id).then(setConfig);
      } else {
        // Fallback or redirect? For now, load default.
        getPortfolioConfig().then(setConfig);
      }
    });
  }, []);

  if (!config) return <div className="text-terminal-green">LOADING_BUILDER...</div>;

  const handleSave = () => {
    if (config) {
      savePortfolioConfig(config);
      setLastSaved(new Date());
    }
  };

  const toggleVisibility = (section: keyof PortfolioConfig) => {
    if (!config) return;
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        visible: !config[section].visible
      }
    });
  };

  const updateField = (section: keyof PortfolioConfig, field: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  // --- Project Management Handlers ---

  const addProject = () => {
    if (!config) return;
    const newProject: ProjectItem = {
      id: crypto.randomUUID(),
      title: "New Project",
      description: "Description of your awesome project.",
      tags: ["Tech 1", "Tech 2"],
      imageSeed: Math.floor(Math.random() * 100),
      link: "#"
    };
    const updatedProjects = [...config.projects.items, newProject];
    setConfig({
      ...config,
      projects: { ...config.projects, items: updatedProjects }
    });
    setExpandedProject(newProject.id);
  };

  const removeProject = (id: string) => {
    if (!config) return;
    const updatedProjects = config.projects.items.filter(p => p.id !== id);
    setConfig({
      ...config,
      projects: { ...config.projects, items: updatedProjects }
    });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    if (!config) return;
    const updatedProjects = config.projects.items.map(p => {
      if (p.id === id) {
        if (field === 'tags' && typeof value === 'string') {
          // Handle csv string to array
          return { ...p, tags: value.split(',').map(t => t.trim()).filter(Boolean) };
        }
        return { ...p, [field]: value };
      }
      return p;
    });
    setConfig({
      ...config,
      projects: { ...config.projects, items: updatedProjects }
    });
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans">

      {/* SIDEBAR - ELEMENTOR STYLE (Retro Themed) */}
      <div className="w-80 flex flex-col border-r border-terminal-dim bg-[#0a0a0a] z-30 shadow-2xl">

        {/* Header */}
        <div className="p-4 border-b border-terminal-dim bg-terminal-dim/10">
          <div className="flex items-center gap-2 text-terminal-green font-retro text-xl mb-1">
            <LayoutTemplate size={20} />
            <span>PAGE_BUILDER</span>
          </div>
          <div className="text-[10px] text-terminal-dim font-mono flex justify-between">
            <span>MODE: EDITOR</span>
            <span>V1.0.4</span>
          </div>
        </div>

        {/* Navigator (Section List) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-mono text-terminal-dim uppercase tracking-wider mb-2 flex items-center gap-2">
            <Layers size={12} />
            Navigator
          </div>

          {/* Section Items */}
          {(['hero', 'projects', 'about', 'stats', 'github'] as const).map((section) => (
            <div
              key={section}
              className={`
                group rounded border transition-all duration-200
                ${activeSection === section
                  ? 'bg-terminal-green/10 border-terminal-green'
                  : 'bg-zinc-900 border-terminal-dim/30 hover:border-terminal-dim'}
              `}
            >
              {/* Section Header (Toggle & Select) */}
              <div className="flex items-center justify-between p-3">
                <button
                  onClick={() => setActiveSection(activeSection === section ? null : section)}
                  className="flex items-center gap-3 text-sm font-mono text-zinc-300 hover:text-white flex-1 text-left"
                >
                  <Edit2 size={14} className={activeSection === section ? 'text-terminal-green' : 'opacity-30'} />
                  <span className="capitalize">{section} Section</span>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); toggleVisibility(section); }}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${config[section].visible ? 'text-terminal-green' : 'text-zinc-600'}`}
                  title={config[section].visible ? "Visible" : "Hidden"}
                >
                  {config[section].visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              {/* Edit Panel (Accordion) */}
              {activeSection === section && (
                <div className="p-3 border-t border-terminal-dim/20 bg-black/20 space-y-3 animate-fade-in text-xs font-mono">

                  {/* Hero Fields */}
                  {section === 'hero' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Title</label>
                        <input
                          type="text"
                          value={config.hero.title}
                          onChange={(e) => updateField('hero', 'title', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm"
                          aria-label="Hero Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Subtitle</label>
                        <textarea
                          value={config.hero.subtitle}
                          onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm h-20"
                          aria-label="Hero Subtitle"
                        />
                      </div>
                    </>
                  )}

                  {/* About Fields */}
                  {section === 'about' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Section Title</label>
                        <input
                          type="text"
                          value={config.about.title}
                          onChange={(e) => updateField('about', 'title', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm"
                          aria-label="About Section Title"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Content</label>
                        <textarea
                          value={config.about.content}
                          onChange={(e) => updateField('about', 'content', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm h-32"
                          aria-label="About Content"
                        />
                      </div>
                    </>
                  )}

                  {/* Stats Fields */}
                  {section === 'stats' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Years Exp.</label>
                        <input
                          type="text"
                          value={config.stats.experience}
                          onChange={(e) => updateField('stats', 'experience', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm"
                          aria-label="Years Experience"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Project Count</label>
                        <input
                          type="text"
                          value={config.stats.projects}
                          onChange={(e) => updateField('stats', 'projects', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm"
                          aria-label="Project Count"
                        />
                      </div>
                    </>
                  )}

                  {/* GitHub Fields */}
                  {section === 'github' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-terminal-dim flex items-center gap-1">
                          <Github size={12} /> Username
                        </label>
                        <input
                          type="text"
                          value={config.github.username}
                          onChange={(e) => updateField('github', 'username', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm"
                          placeholder="e.g., torvalds"
                        />
                        <p className="text-[10px] text-terminal-dim pt-1 italic">
                          Note: If OAuth is connected, this field will be auto-populated.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Projects Logic */}
                  {section === 'projects' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-terminal-dim">Section Title</label>
                        <input
                          type="text"
                          value={config.projects.title}
                          onChange={(e) => updateField('projects', 'title', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 p-2 text-zinc-200 focus:border-terminal-green outline-none rounded-sm mb-2"
                          aria-label="Projects Section Title"
                        />
                      </div>

                      {/* Project List */}
                      <div className="space-y-2">
                        {config.projects.items.map((project) => (
                          <div key={project.id} className="border border-zinc-800 rounded bg-zinc-950/50">

                            {/* Project Header */}
                            <div
                              className="p-2 flex items-center justify-between cursor-pointer hover:bg-zinc-900"
                              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {expandedProject === project.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                <span className="truncate max-w-[120px]">{project.title}</span>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); removeProject(project.id); }}
                                className="text-red-900 hover:text-red-500 transition-colors"
                                title="Remove Project"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>

                            {/* Project Editor */}
                            {expandedProject === project.id && (
                              <div className="p-2 space-y-2 border-t border-zinc-800 bg-black/40">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-terminal-dim">Title</label>
                                  <input
                                    type="text"
                                    value={project.title}
                                    onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-200 rounded-sm text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-terminal-dim">Description</label>
                                  <textarea
                                    value={project.description}
                                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-200 rounded-sm text-xs h-16"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-terminal-dim">Tech Stack (Comma separated)</label>
                                  <input
                                    type="text"
                                    value={project.tags.join(', ')}
                                    onChange={(e) => updateProject(project.id, 'tags', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-200 rounded-sm text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-terminal-dim flex items-center gap-1">
                                    <ImageIcon size={10} /> Image URL (Rec: 16:9)
                                  </label>
                                  <input
                                    type="text"
                                    value={project.imageUrl || ''}
                                    placeholder="https://..."
                                    onChange={(e) => updateProject(project.id, 'imageUrl', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-200 rounded-sm text-xs"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-terminal-dim flex items-center gap-1">
                                    <LinkIcon size={10} /> Project Link
                                  </label>
                                  <input
                                    type="text"
                                    value={project.link || ''}
                                    placeholder="https://..."
                                    onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-200 rounded-sm text-xs"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={addProject}
                        className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-700 hover:border-terminal-green hover:text-terminal-green text-zinc-500 py-2 rounded-sm transition-colors mt-2"
                      >
                        <Plus size={12} /> Add Project
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-terminal-dim bg-terminal-dim/5 space-y-2">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-terminal-green text-black py-2 font-bold font-mono text-sm hover:bg-terminal-green/90 transition-all rounded-sm uppercase tracking-wide"
          >
            <Save size={16} />
            Publish Changes
          </button>
          <button
            onClick={() => onStateChange(GatekeeperState.ADMIN)}
            className="w-full flex items-center justify-center gap-2 text-terminal-dim hover:text-zinc-200 py-2 font-mono text-xs transition-colors"
          >
            <ArrowLeft size={14} />
            Exit to Admin
          </button>
          {userId && (
            <div className="bg-white/90 p-3 rounded flex flex-col items-center gap-2 mb-2">
              <QRCodeSVG value={`${window.location.origin}/?target=${userId}`} size={80} />
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold text-black mb-1">Visitor Link</p>
                <a
                  href={`/?target=${userId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-blue-800 hover:underline block max-w-[150px] truncate"
                >
                  {window.location.origin}/?target={userId}
                </a>
              </div>
            </div>
          )}
          {lastSaved && (
            <div className="text-[10px] text-center text-terminal-green/70 font-mono">
              Saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

      </div>

      {/* MAIN CANVAS - LIVE PREVIEW */}
      <div className="flex-1 bg-zinc-900 relative overflow-hidden flex flex-col">

        {/* Canvas Toolbar */}
        <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center text-zinc-500 text-xs font-mono gap-4">
          <span className="flex items-center gap-1"><Monitor size={12} /> Desktop View</span>
          <span className="w-px h-4 bg-zinc-800"></span>
          <span className="opacity-50">1280 x 1024</span>
          <span className="ml-auto mr-4 text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Preview
          </span>
        </div>

        {/* The Actual Site Rendering */}
        <div className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          <div className="min-h-full">
            <AccessGranted previewData={config} />
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfileBuilder;