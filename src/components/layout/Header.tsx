"use client";

interface HeaderProps {
  workspaceName: string;
  pageTitle: string;
}

export function Header({ workspaceName, pageTitle }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">{workspaceName}</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-gray-900">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {/* Unread dot */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#DEF58A' }} />
        </button>

        {/* User avatar */}
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-[#DEF58A]" style={{ backgroundColor: '#26BB85' }}>
          FA
        </button>
      </div>
    </header>
  );
}
