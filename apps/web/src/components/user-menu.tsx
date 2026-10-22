import { Button } from "@capstone-src/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@capstone-src/ui/components/dropdown-menu";
import { Skeleton } from "@capstone-src/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, UserCircle, ChevronDown } from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-10 w-32 rounded-xl" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline" className="rounded-xl">Iniciar sesión</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 px-4 rounded-xl h-10" />}>
        <UserCircle className="h-5 w-5 text-blue-500" />
        <span className="font-medium text-base">{session.user.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-card rounded-2xl p-2" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-base font-semibold leading-none">{session.user.name}</p>
              <p className="text-sm leading-none text-muted-foreground mt-2">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            className="text-red-500 focus:text-red-600 focus:bg-red-500/10 flex items-center gap-3 cursor-pointer rounded-xl p-3 text-base font-medium"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
