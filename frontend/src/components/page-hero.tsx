import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
};

export function PageHero({ eyebrow, title, description, children, className, icon }: PageHeroProps) {
  return (
    <div
      className={cn(
        "page-hero relative mb-8 overflow-hidden rounded-2xl p-6 text-white shadow-xl shadow-indigo-950/30 md:p-8",
        className
      )}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="text-sm font-medium text-indigo-200">{eyebrow}</p>}
          <h2 className={cn("font-bold tracking-tight text-white", eyebrow ? "mt-1 text-2xl md:text-3xl" : "text-2xl md:text-3xl")}>
            {title}
          </h2>
          {description && <p className="mt-2 text-sm text-indigo-100/90 md:text-base">{description}</p>}
          {children}
        </div>
        {icon && <div className="hidden shrink-0 md:block">{icon}</div>}
      </div>
    </div>
  );
}
