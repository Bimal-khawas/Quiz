import React from 'react';

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      <div className="relative border-b border-white/20">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative pb-4 px-6 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.name
                  ? 'text-emerald-400'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-400 to-teal-400 rounded-full shadow-lg shadow-emerald-500/25" />
              )}
              {activeTab === tab.name && (
                <div className="absolute inset-0 bg-linear-to-b from-emerald-400/10 to-transparent rounded-t-xl -z-10" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div
                key={tab.name}
                className="animate-fade-in duration-300 text-white"
              >
                {typeof tab.component === 'function'
                  ? tab.component()
                  : tab.component}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Tabs;