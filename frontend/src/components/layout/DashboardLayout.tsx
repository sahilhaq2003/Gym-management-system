import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
    return (
        <div className="relative flex min-h-screen text-foreground bg-background">
            <div className="pointer-events-none absolute inset-0 bg-mesh opacity-70" aria-hidden="true" />
            <Sidebar />
            <div className="relative z-[1] flex min-w-0 flex-1 flex-col">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="mx-auto w-full max-w-7xl flex flex-col gap-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
