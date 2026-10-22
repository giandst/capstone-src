import { Button } from "@capstone-src/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@capstone-src/ui/components/card";
import { Skeleton } from "@capstone-src/ui/components/skeleton";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Activity,
	ArrowRight,
	CheckCircle,
	Clock,
	FileSpreadsheet,
	ShieldAlert,
	UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	type Alerta,
	type Caso,
	DomainStore,
	type Evento,
} from "@/lib/domain-store";

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardPage,
});

function DashboardPage() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [eventos, setEventos] = useState<Evento[]>([]);
	const [alertas, setAlertas] = useState<Alerta[]>([]);
	const [casos, setCasos] = useState<Caso[]>([]);

	const loadData = useCallback(() => {
		setEventos(DomainStore.getEventos());
		setAlertas(DomainStore.getAlertas());
		setCasos(DomainStore.getCasos());
	}, []);

	useEffect(() => {
		loadData();
		const timer = setTimeout(() => setIsLoading(false), 500);

		const handleUpdate = () => {
			loadData();
		};

		window.addEventListener("mpd_store_updated", handleUpdate);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("mpd_store_updated", handleUpdate);
		};
	}, [loadData]);

	const alertasActivas = alertas.filter(
		(a) => a.estado === "abierta" || a.estado === "en_revision",
	);
	const casosInvestigacion = casos.filter((c) => c.estado === "investigacion");
	const casosCerrados = casos.filter((c) => c.estado === "cerrado");

	return (
		<div className="fade-in mx-auto h-full w-full animate-in space-y-6 overflow-x-hidden p-2 pb-12 duration-500">
			<div className="mb-2 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">
						Bienvenido, {session.data?.user.name?.split(" ")[0]}
					</h1>
					<p className="text-muted-foreground text-sm">
						Panel de supervisión del Modelo de Prevención del Delito (Leyes
						20.393 / 21.595).
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						onClick={() => navigate({ to: "/ingesta" })}
						className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-4 font-medium text-white text-xs shadow-sm hover:from-yellow-500 hover:to-amber-600"
					>
						<UploadCloud className="h-4 w-4" />
						<span>Ingestar Nuevo Lote</span>
					</Button>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 xl:grid-cols-4">
				{isLoading ? (
					<>
						<Skeleton className="h-[140px] w-full rounded-3xl" />
						<Skeleton className="h-[140px] w-full rounded-3xl" />
						<Skeleton className="h-[140px] w-full rounded-3xl" />
						<Skeleton className="h-[140px] w-full rounded-3xl" />
					</>
				) : (
					<>
						<Card className="relative flex h-[140px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm transition-all hover:scale-[1.02] hover:border-amber-700/50 hover:shadow-lg">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="pt-5 pb-2">
								<CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-sm">
									Eventos Procesados
									<Activity className="h-5 w-5 text-muted-foreground" />
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-1 items-center pb-6">
								<div className="font-bold font-mono text-4xl tracking-tight">
									{eventos.length}
								</div>
							</CardContent>
						</Card>

						<Card className="relative flex h-[140px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm transition-all hover:scale-[1.02] hover:border-amber-700/50 hover:shadow-lg">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="pt-5 pb-2">
								<CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-sm">
									Alertas Activas
									<ShieldAlert className="h-5 w-5 text-amber-500" />
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-1 items-center pb-6">
								<div className="font-bold font-mono text-4xl text-amber-500 tracking-tight">
									{alertasActivas.length}
								</div>
							</CardContent>
						</Card>

						<Card className="relative flex h-[140px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm transition-all hover:scale-[1.02] hover:border-amber-700/50 hover:shadow-lg">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="pt-5 pb-2">
								<CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-sm">
									Casos en Investigación
									<Clock className="h-5 w-5 text-blue-500" />
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-1 items-center pb-6">
								<div className="font-bold font-mono text-4xl text-blue-400 tracking-tight">
									{casosInvestigacion.length}
								</div>
							</CardContent>
						</Card>

						<Card className="relative flex h-[140px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm transition-all hover:scale-[1.02] hover:border-amber-700/50 hover:shadow-lg">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="pt-5 pb-2">
								<CardTitle className="flex items-center justify-between font-medium text-muted-foreground text-sm">
									Casos Cerrados (Evidencia)
									<CheckCircle className="h-5 w-5 text-green-500" />
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-1 items-center pb-6">
								<div className="font-bold font-mono text-4xl text-green-500 tracking-tight">
									{casosCerrados.length}
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Main Grid: Alertas Recientes & Casos */}
			<div className="grid grid-cols-1 gap-6 px-2 lg:grid-cols-2">
				{isLoading ? (
					<>
						<Skeleton className="h-[380px] w-full rounded-3xl" />
						<Skeleton className="h-[380px] w-full rounded-3xl" />
					</>
				) : (
					<>
						{/* Alertas Recientes */}
						<Card className="relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="flex flex-row items-center justify-between pt-6 pb-4">
								<div>
									<CardTitle className="flex items-center gap-2 text-lg">
										<ShieldAlert className="h-5 w-5 text-amber-500" />
										Alertas Recientes
									</CardTitle>
									<CardDescription className="text-xs">
										Transacciones que superaron los umbrales de alerta del
										motor.
									</CardDescription>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/alertas" })}
									className="rounded-xl text-amber-500 text-xs hover:text-amber-400"
								>
									Ver todas ({alertas.length})
									<ArrowRight className="ml-1 h-3.5 w-3.5" />
								</Button>
							</CardHeader>
							<CardContent className="flex flex-1 flex-col">
								{alertas.length === 0 ? (
									<div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-muted-foreground">
										<ShieldAlert className="mb-3 h-12 w-12 opacity-20" />
										<p className="font-medium text-sm">
											No hay alertas registradas
										</p>
										<p className="mt-1 max-w-xs text-muted-foreground text-xs">
											Carga un lote de datos en la sección de Ingesta para
											ejecutar las reglas de detección.
										</p>
										<Button
											onClick={() => navigate({ to: "/ingesta" })}
											variant="outline"
											size="sm"
											className="mt-4 rounded-xl text-xs"
										>
											<FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
											Ir a Ingesta
										</Button>
									</div>
								) : (
									<div className="space-y-3">
										{alertas.slice(0, 4).map((alt) => (
											<button
												type="button"
												key={alt.id}
												onClick={() => navigate({ to: "/alertas" })}
												className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/10 p-3.5 text-left transition-all hover:bg-muted/30"
											>
												<div className="min-w-0 space-y-1">
													<div className="flex items-center gap-2">
														<span className="truncate font-semibold text-xs">
															{alt.evento.nombreProveedor}
														</span>
														<span
															className={`rounded-full px-2 py-0.5 font-bold font-mono text-[10px] uppercase ${
																alt.banda === "alta"
																	? "border border-red-500/30 bg-red-500/10 text-red-400"
																	: "border border-amber-500/30 bg-amber-500/10 text-amber-400"
															}`}
														>
															{alt.banda} ({alt.score})
														</span>
													</div>
													<p className="truncate text-muted-foreground text-xs">
														{alt.delito} • $
														{alt.evento.monto.toLocaleString("es-CL")}
													</p>
												</div>
												<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
											</button>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Últimos Casos */}
						<Card className="relative flex min-h-[380px] flex-col overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm">
							<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
							<CardHeader className="flex flex-row items-center justify-between pt-6 pb-4">
								<div>
									<CardTitle className="flex items-center gap-2 text-lg">
										<Clock className="h-5 w-5 text-blue-500" />
										Casos de Investigación
									</CardTitle>
									<CardDescription className="text-xs">
										Expedientes promovidos para dictamen del Encargado de
										Cumplimiento.
									</CardDescription>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/casos" })}
									className="rounded-xl text-blue-500 text-xs hover:text-blue-400"
								>
									Gestionar Casos
									<ArrowRight className="ml-1 h-3.5 w-3.5" />
								</Button>
							</CardHeader>
							<CardContent className="flex flex-1 flex-col">
								{casos.length === 0 ? (
									<div className="flex flex-1 flex-col items-center justify-center py-8 text-center text-muted-foreground">
										<Clock className="mb-3 h-12 w-12 opacity-20" />
										<p className="font-medium text-sm">No hay casos abiertos</p>
										<p className="mt-1 max-w-xs text-muted-foreground text-xs">
											Al revisar una alerta en la bandeja, puedes promoverla a
											caso de investigación.
										</p>
									</div>
								) : (
									<div className="space-y-3">
										{casos.slice(0, 4).map((c) => (
											<button
												type="button"
												key={c.id}
												onClick={() => navigate({ to: "/casos" })}
												className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border/80 bg-muted/10 p-3.5 text-left transition-all hover:bg-muted/30"
											>
												<div className="min-w-0 space-y-1">
													<div className="flex items-center gap-2">
														<span className="font-mono text-muted-foreground text-xs">
															{c.id}
														</span>
														<span className="truncate font-medium text-xs">
															{c.alerta.evento.nombreProveedor}
														</span>
														<span
															className={`rounded-full px-2 py-0.5 font-medium font-mono text-[10px] ${
																c.estado === "cerrado"
																	? "border border-green-500/30 bg-green-500/10 text-green-400"
																	: "border border-blue-500/30 bg-blue-500/10 text-blue-400"
															}`}
														>
															{c.estado === "cerrado"
																? "Cerrado"
																: "En Investigación"}
														</span>
													</div>
													<p className="truncate text-muted-foreground text-xs">
														{c.alerta.delito} • Creado el{" "}
														{new Date(c.createdAt).toLocaleDateString("es-CL")}
													</p>
												</div>
												<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
											</button>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
