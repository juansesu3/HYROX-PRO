'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoHome } from 'react-icons/go';
import { CiUser, CiSettings, CiChat2 } from 'react-icons/ci';

const locales = ['en', 'es', 'fr'] as const;

export default function Navigation() {
  const pathname = usePathname();

  // Detectar locale si existe
  const segments = pathname.split('/').filter(Boolean);
  const maybeLocale = segments[0];
  const hasLocale = locales.includes(maybeLocale as any);
  const localePrefix = hasLocale ? `/${maybeLocale}` : '';

  // Normalizar ruta (sin locale) para calcular active correctamente
  const normalizedPath = hasLocale ? '/' + segments.slice(1).join('/') : pathname;
  const normalized = normalizedPath === '' ? '/' : normalizedPath; // safety

  // Ocultar en login, register y get-started
  const hiddenRoutes = ['/login', '/register', '/get-started', '/invite'];
  if (hiddenRoutes.includes(normalized)) return null;

  // Construye href preservando locale
  const withLocale = (href: string) => {
    if (!localePrefix) return href;
    if (href === '/') return localePrefix; // "/es"
    return `${localePrefix}${href}`; // "/es/profile"
  };

  return (
    <nav
      className="
        fixed z-50 bottom-0 left-0 right-0 pb-4
        border-t shadow-lg
        bg-white/90 border-slate-200 backdrop-blur
        dark:bg-slate-950/80 dark:border-slate-800
      "
    >
      {/* sporty glow */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-14 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-emerald-400/0 dark:via-emerald-400/10 blur-2xl" />

      <div className="relative flex justify-around py-2">
        <NavItem
          href="/"
          linkHref={withLocale('/')}
          currentPath={normalized}
          icon={<GoHome size={24} />}
          label="Inicio"
        />
        <NavItem
          href="/profile"
          linkHref={withLocale('/profile')}
          currentPath={normalized}
          icon={<CiUser size={24} />}
          label="Perfil"
        />
        <NavItem
          href="/chat"
          linkHref={withLocale('/chat')}
          currentPath={normalized}
          icon={<CiChat2 size={24} />}
          label="Chat"
        />
        <NavItem
          href="/settings"
          linkHref={withLocale('/settings')}
          currentPath={normalized}
          icon={<CiSettings size={24} />}
          label="Ajustes"
        />
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;         // ruta normalizada (sin locale)
  linkHref: string;     // ruta real (con locale si aplica)
  currentPath: string;  // pathname normalizado (sin locale)
  icon: React.ReactNode;
  label: string;
};

function NavItem({ href, linkHref, currentPath, icon, label }: NavItemProps) {
  const isActive =
    href === '/'
      ? currentPath === '/' // home exact
      : currentPath === href || currentPath.startsWith(`${href}/`); // evita falsos positivos

  return (
    <Link
      href={linkHref}
      aria-current={isActive ? 'page' : undefined}
      className={`
        group flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition active:scale-[0.98]
        ${isActive
          ? `
            text-blue-700
            dark:text-emerald-300
          `
          : `
            text-slate-700 hover:text-blue-700
            dark:text-slate-300 dark:hover:text-emerald-300
          `
        }
      `}
    >
      <span
        className={`
          relative grid h-10 w-10 place-items-center rounded-2xl transition
          ${isActive
            ? `
              bg-blue-50 border border-blue-100 shadow-sm
              dark:bg-emerald-300/10 dark:border-emerald-300/25
              ring-2 ring-blue-200/40 dark:ring-emerald-300/25
              translate-y-[-1px]
            `
            : `
              bg-transparent border border-transparent
              group-hover:bg-slate-50 group-hover:border-slate-200
              dark:group-hover:bg-slate-900/60 dark:group-hover:border-slate-800
            `
          }
        `}
      >
        {/* glow activo */}
        {isActive && (
          <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-emerald-400/10 dark:from-emerald-300/20 dark:to-cyan-300/10 blur-md" />
        )}

        <span className="relative">{icon}</span>
      </span>

      <span className={`text-[11px] font-black tracking-wide ${isActive ? '' : 'opacity-90'}`}>
        {label}
      </span>

      {/* active underline */}
      <span
        className={`
          mt-0.5 h-1 rounded-full transition-all
          ${isActive
            ? 'w-8 bg-blue-600 dark:bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
            : 'w-1.5 bg-slate-200 dark:bg-slate-800 group-hover:w-4'
          }
        `}
      />
    </Link>
  );
}
