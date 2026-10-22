import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <div className="h-20 border-b border-border bg-background/50 backdrop-blur flex items-center justify-end px-6 shrink-0">
      <div className="flex items-center gap-4">
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
  );
}
