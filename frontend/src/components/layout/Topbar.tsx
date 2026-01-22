import { Bell, Search, User } from 'lucide-react';

export function Topbar() {
    return (
        <header className="sticky top-0 z-10 flex h-16 sm:h-20 items-center justify-between border-b border-border/70 bg-card/80 px-3 sm:px-6 backdrop-blur-xl lg:px-10">
            <div className="flex flex-1 items-center gap-2 sm:gap-4">
                <div className="hidden text-left md:block">
                    <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/70">Dashboard</p>
                    <h2 className="text-base sm:text-xl font-semibold">Welcome back, Admin</h2>
                </div>
                <div className="relative ml-auto w-full max-w-[160px] sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Quick search"
                        className="h-9 sm:h-11 w-full rounded-lg border border-input/70 bg-background/70 pl-10 pr-4 text-xs sm:text-sm shadow-sm outline-none transition focus:border-ring/60 focus:ring-2 focus:ring-ring/60"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 pl-2 sm:pl-6">
                <button className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-2 top-2 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-primary shadow-[0_0_0_3px] shadow-card" />
                </button>

                <div className="flex items-center gap-2 sm:gap-3 rounded-full border border-border/60 bg-card px-2 py-1 sm:px-3 sm:py-2 shadow-sm">
                    <div className="hidden text-right sm:block">
                        <p className="text-xs sm:text-sm font-semibold leading-none">Admin User</p>
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">admin@gym.com</p>
                    </div>
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-indigo-400/30 text-primary">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
