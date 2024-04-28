import { ChevronDown, LogOut, Server } from 'lucide-react';
import Link from 'next/link';
import type { Session } from 'next-auth';
import React from 'react';
import { ModeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenuTrigger,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function NavBar({ session }: { readonly session: Session | null }) {
	return (
		<div className="h-1/10 flex w-full items-center justify-between p-1">
			<div>
				<Link className="flex items-center justify-center align-middle" href="/">
					<Avatar className="mr-2">
						<AvatarImage src="https://github.com/sleepymaidbot.png" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<div className="align-baseline text-sm font-medium">Sleepy Maid</div>
				</Link>
			</div>
			<div className="flex flex-grow-0 items-center">
				<ModeToggle />
				{session ? (
					<div className="ml-2 flex align-middle">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost">
									<Avatar>
										<AvatarImage src={session.user?.image ?? 'https://github.com/sleepymaidbot.png'} />
										<AvatarFallback>{session.user?.name?.split(' ').map((name) => name[0])}</AvatarFallback>
									</Avatar>
									<div className="ml-2 align-middle">{session.user?.name}</div>
									<ChevronDown />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem asChild>
									<Link className="flex" href="/dashboard" passHref>
										<Server className="pr-2" /> Servers
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Link className="flex" href="/api/auth/signout">
										<LogOut className="pr-2" />
										Sign out
									</Link>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<div className="flex">
						<Button className="ml-2" variant="outline">
							<Link href="/api/auth/signin">Login</Link>
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
