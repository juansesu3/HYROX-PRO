'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoHome } from "react-icons/go";
import { CiUser, CiSettings, CiChat2 } from "react-icons/ci";

export default function Navigation() {
  const pathname = usePathname();

  // Ocultar en login o register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200">
      <div className="flex justify-around py-2">
        <NavItem href="/" pathname={pathname} icon={<GoHome size={24} />} label="Inicio" />
        <NavItem href="/profile" pathname={pathname} icon={<CiUser size={24} />} label="Perfil" />
        <NavItem href="/chat" pathname={pathname} icon={<CiChat2 size={24} />} label="Chat" />
        <NavItem href="/settings" pathname={pathname} icon={<CiSettings size={24} />} label="Ajustes" />
      </div>
    </nav>
  );
}

type NavItemProps = {
  href: string;
  pathname: string;
  icon: React.ReactNode;
  label: string;
};

function NavItem({ href, pathname, icon, label }: NavItemProps) {
  const isActive = href === '/'
    ? pathname === '/'
    : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`flex flex-col items-center ${
        isActive ? 'text-blue-600' : 'text-gray-700'
      } hover:text-blue-600`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}