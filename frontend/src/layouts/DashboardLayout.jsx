import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SystemStatusStrip from './SystemStatusStrip';

export default function DashboardLayout({
  children,
  activePage,
  onSelectPage,
  onRefresh,
  refreshing,
  autoRefreshInterval,
  onChangeInterval,
  activeAlertCount,
  mockMode,
  onToggleMockMode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          activePage={activePage}
          onSelectPage={onSelectPage}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeAlertCount={activeAlertCount}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950">
            <Sidebar
              activePage={activePage}
              onSelectPage={(page) => {
                onSelectPage(page);
                setIsMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              activeAlertCount={activeAlertCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          activePage={activePage}
          onRefresh={onRefresh}
          refreshing={refreshing}
          autoRefreshInterval={autoRefreshInterval}
          onChangeInterval={onChangeInterval}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          mockMode={mockMode}
          onToggleMockMode={onToggleMockMode}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>

        <SystemStatusStrip
          mockMode={mockMode}
        />
      </div>
    </div>
  );
}
