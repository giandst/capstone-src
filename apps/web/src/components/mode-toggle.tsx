import { Button } from "@capstone-src/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@capstone-src/ui/components/dropdown-menu";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="gap-2 px-3 rounded-xl h-10" />}>
        <div className="relative flex items-center justify-center w-[1.2rem] h-[1.2rem]">
          <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-amber-500" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-blue-400" />
        </div>
        <span className="sr-only">Cambiar tema</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[180px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-3 cursor-pointer rounded-xl p-3 text-base whitespace-nowrap">
          <Sun className="h-5 w-5 text-amber-500" /> Tema Claro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-3 cursor-pointer rounded-xl p-3 text-base whitespace-nowrap">
          <Moon className="h-5 w-5 text-blue-400" /> Tema Oscuro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-3 cursor-pointer rounded-xl p-3 text-base whitespace-nowrap">
          <Monitor className="h-5 w-5 text-muted-foreground" /> Automático
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
