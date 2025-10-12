'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, ChevronDown, LogOut, LogIn, Home, ListTodo, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const menuItems = [
    { name: '홈', path: '/', icon: Home },
    { name: '할일', path: '/todo', icon: ListTodo },
    { name: '게시판', path: '/board', icon: FileText },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-center relative">

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          {/* Admin Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium',
                    isActive('/admin')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <Shield className="h-4 w-4" />
                  관리자
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/users" className="cursor-pointer">
                    사용자조회
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* User Info & Auth Button */}
        <div className="hidden md:flex items-center gap-4 absolute right-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{user.email}</span>님!
                  </span>
                  <Button onClick={handleSignOut} variant="outline" size="sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    로그아웃
                  </Button>
                </>
              ) : (
                <Link href="/">
                  <Button variant="default" size="sm">
                    <LogIn className="mr-2 h-4 w-4" />
                    로그인
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {/* Mobile Menu Items */}
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        'flex items-center gap-3 text-base font-medium transition-colors hover:text-primary p-2 rounded-md',
                        isActive(item.path)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Mobile Admin Menu */}
                {user && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-3 text-sm font-semibold text-muted-foreground mb-2 p-2">
                      <Shield className="h-5 w-5" />
                      관리자
                    </div>
                    <Link
                      href="/admin/users"
                      className={cn(
                        'flex items-center gap-3 text-base font-medium transition-colors hover:text-primary p-2 pl-10 rounded-md',
                        isActive('/admin/users')
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground'
                      )}
                    >
                      사용자조회
                    </Link>
                  </div>
                )}

                {/* Mobile User Info & Auth */}
                {!loading && (
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3 p-2">
                          <span className="font-medium text-foreground">{user.email}</span>님!
                        </p>
                        <Button onClick={handleSignOut} variant="outline" className="w-full">
                          <LogOut className="mr-2 h-4 w-4" />
                          로그아웃
                        </Button>
                      </>
                    ) : (
                      <Link href="/">
                        <Button variant="default" className="w-full">
                          <LogIn className="mr-2 h-4 w-4" />
                          로그인
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
