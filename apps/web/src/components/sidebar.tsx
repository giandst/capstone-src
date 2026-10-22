import { Button } from "@capstone-src/ui/components/button";
import { Link } from "@tanstack/react-router";
import {
	Briefcase,
	ChevronLeft,
	ChevronRight,
	FileSpreadsheet,
	LayoutDashboard,
	Settings,
	ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function Sidebar() {
	const [width, setWidth] = useState(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("mpd-sidebar-width");
			if (saved) return Number.parseInt(saved, 10);
		}
		return 288; // 288px por defecto
	});
	const [isResizing, setIsResizing] = useState(false);
	const sidebarRef = useRef<HTMLDivElement>(null);

	const collapsed = width < 150;

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizing) return;

			let newWidth = e.clientX;
			if (newWidth < 96) newWidth = 96; // Mínimo 96px (colapsado)
			if (newWidth > 480) newWidth = 480; // Máximo 480px

			setWidth(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
		};

		if (isResizing) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing]);

	// Persistir en localStorage cuando el usuario suelta el click o cambia el estado
	useEffect(() => {
		if (!isResizing) {
			localStorage.setItem("mpd-sidebar-width", width.toString());
		}
	}, [width, isResizing]);

	const toggleCollapse = () => {
		if (collapsed) {
			setWidth(288);
		} else {
			setWidth(96);
		}
	};

	const links = [
		{ icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
		{ icon: FileSpreadsheet, label: "Ingesta", to: "/ingesta" },
		{ icon: ShieldAlert, label: "Alertas", to: "/alertas" },
		{ icon: Briefcase, label: "Casos", to: "/casos" },
		{ icon: Settings, label: "Controles", to: "/controles" },
	];

	const GavelIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="shrink-0 text-white"
		>
			<title>Logo MPD</title>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M13 10l7.383 7.418c.823 .82 .823 2.148 0 2.967a2.11 2.11 0 0 1 -2.976 0l-7.407 -7.385" />
			<path d="M6 9l4 4" />
			<path d="M13 10l-4 -4" />
			<path d="M3 21h7" />
			<path d="M6.793 15.793l-3.586 -3.586a1 1 0 0 1 0 -1.414l2.293 -2.293l.5 .5l3 -3l-.5 -.5l2.293 -2.293a1 1 0 0 1 1.414 0l3.586 3.586a1 1 0 0 1 0 1.414l-2.293 2.293l-.5 -.5l-3 3l.5 .5l-2.293 2.293a1 1 0 0 1 -1.414 0" />
		</svg>
	);

	return (
		<div
			ref={sidebarRef}
			style={{ width: `${width}px` }}
			className={`relative flex shrink-0 flex-col border-border border-r bg-background/50 backdrop-blur ${isResizing ? "select-none transition-none" : "transition-[width] duration-300 ease-in-out"}`}
		>
			<div className="flex h-20 shrink-0 items-center justify-center overflow-hidden border-border border-b px-4">
				{!collapsed && (
					<div className="fade-in flex w-full animate-in items-center justify-center gap-3 duration-300">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-600 to-amber-900 shadow-amber-900/20 shadow-lg">
							<GavelIcon />
						</div>
						<span className="whitespace-nowrap font-bold text-lg tracking-widest">
							MPD
						</span>
					</div>
				)}
				{collapsed && (
					<div className="fade-in mx-auto flex h-10 w-10 shrink-0 animate-in items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-600 to-amber-900 shadow-amber-900/20 shadow-lg duration-300">
						<GavelIcon />
					</div>
				)}
			</div>

			{/* Resizer Handle */}
			<div
				role="slider"
				aria-label="Ajustar ancho de barra lateral"
				aria-valuenow={width}
				aria-valuemin={96}
				aria-valuemax={480}
				tabIndex={0}
				className="group absolute top-0 -right-2 z-20 flex h-full w-4 cursor-col-resize items-center justify-center focus:outline-none"
				onMouseDown={(e) => {
					e.preventDefault();
					setIsResizing(true);
				}}
			>
				<div
					className={`h-12 w-0.5 rounded-full transition-colors ${isResizing ? "bg-amber-600" : "bg-transparent group-hover:bg-amber-600/40"}`}
				/>
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="absolute top-24 -right-3 z-30 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-accent"
				onClick={toggleCollapse}
			>
				{collapsed ? (
					<ChevronRight className="h-3 w-3" />
				) : (
					<ChevronLeft className="h-3 w-3" />
				)}
			</Button>

			<nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-6">
				{links.map((link) => (
					<Link
						key={link.to}
						to={link.to}
						className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-all hover:bg-accent hover:text-foreground [&.active]:bg-accent/50 [&.active]:text-foreground ${collapsed ? "justify-center px-0" : ""}`}
						title={collapsed ? link.label : undefined}
					>
						<link.icon className="h-5 w-5 shrink-0" />
						{!collapsed && <span className="font-medium">{link.label}</span>}
					</Link>
				))}
			</nav>
		</div>
	);
}
