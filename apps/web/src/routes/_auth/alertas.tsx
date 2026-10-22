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
	AlertTriangle,
	ArrowRight,
	Briefcase,
	CheckCircle2,
	Eye,
	FileSpreadsheet,
	Info,
	Scale,
	Search,
	ShieldAlert,
	X,
	XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type Alerta, DomainStore } from "@/lib/domain-store";

export const Route = createFileRoute("/_auth/alertas")({
	component: AlertasPage,
});

function AlertasPage() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);

	// Domain Store Data
	const [alertas, setAlertas] = useState<Alerta[]>([]);
	const [selectedAlertaId, setSelectedAlertaId] = useState<string | null>(null);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [filterEstado, setFilterEstado] = useState<string>("todas");
	const [filterBanda, setFilterBanda] = useState<string>("todas");

	// Action Modals
	const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
	const [dismissReason, setDismissReason] = useState("");
	const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
	const [escalateReason, setEscalateReason] = useState("");
	const [actionError, setActionError] = useState<string | null>(null);

	const loadAlertas = useCallback(() => {
		const loadedAlertas = DomainStore.getAlertas();
		setAlertas(loadedAlertas);

		// Auto-select first item if none selected
		if (loadedAlertas.length > 0 && !selectedAlertaId) {
			setSelectedAlertaId(loadedAlertas[0].id);
		}
	}, [selectedAlertaId]);

	useEffect(() => {
		loadAlertas();
		const timer = setTimeout(() => setIsLoading(false), 500);

		const handleUpdate = () => {
			loadAlertas();
		};

		window.addEventListener("mpd_store_updated", handleUpdate);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("mpd_store_updated", handleUpdate);
		};
	}, [loadAlertas]);

	const selectedAlerta =
		alertas.find((a) => a.id === selectedAlertaId) || alertas[0] || null;

	// Filtered Alerts
	const filteredAlertas = alertas.filter((alt) => {
		if (filterEstado !== "todas" && alt.estado !== filterEstado) return false;
		if (filterBanda !== "todas" && alt.banda !== filterBanda) return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return (
				alt.evento.nombreProveedor.toLowerCase().includes(q) ||
				alt.evento.rutProveedor.toLowerCase().includes(q) ||
				alt.evento.nombreSolicitante.toLowerCase().includes(q) ||
				alt.delito.toLowerCase().includes(q)
			);
		}
		return true;
	});

	// Actions
	const handleMarkInReview = (alertaId: string) => {
		DomainStore.updateAlerta(alertaId, {
			estado: "en_revision",
			revisadoPor: session.data?.user.name || "Encargado de Cumplimiento",
			fechaRevision: new Date().toISOString(),
		});
	};

	const handleConfirmDismiss = () => {
		if (!selectedAlerta) return;
		if (!dismissReason.trim()) {
			setActionError("Es obligatorio justificar el motivo del descarte.");
			return;
		}

		DomainStore.updateAlerta(selectedAlerta.id, {
			estado: "descartada",
			motivoDescarte: dismissReason.trim(),
			revisadoPor: session.data?.user.name || "Encargado de Cumplimiento",
			fechaRevision: new Date().toISOString(),
		});

		setIsDismissModalOpen(false);
		setDismissReason("");
		setActionError(null);
	};

	const handleConfirmEscalate = () => {
		if (!selectedAlerta) return;

		DomainStore.updateAlerta(selectedAlerta.id, {
			estado: "escalada",
			motivoEscalamiento:
				escalateReason.trim() || "Escalado a Comité de Ética / Directorio",
			revisadoPor: session.data?.user.name || "Encargado de Cumplimiento",
			fechaRevision: new Date().toISOString(),
		});

		setIsEscalateModalOpen(false);
		setEscalateReason("");
		setActionError(null);
	};

	const handlePromoteToCase = (alertaId: string) => {
		const actorName = session.data?.user.name || "Encargado de Cumplimiento";
		const newCase = DomainStore.promoverACaso(alertaId, actorName);
		if (newCase) {
			navigate({ to: "/casos" });
		}
	};

	const getBandaColor = (banda: "baja" | "media" | "alta") => {
		switch (banda) {
			case "alta":
				return "bg-red-500/10 text-red-400 border-red-500/30";
			case "media":
				return "bg-amber-500/10 text-amber-400 border-amber-500/30";
			default:
				return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
		}
	};

	const getEstadoBadge = (estado: Alerta["estado"]) => {
		switch (estado) {
			case "abierta":
				return (
					<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-500">
						Abierta
					</span>
				);
			case "en_revision":
				return (
					<span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] text-blue-400">
						En Revisión
					</span>
				);
			case "descartada":
				return (
					<span className="rounded-full border border-zinc-500/30 bg-zinc-500/10 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
						Descartada
					</span>
				);
			case "escalada":
				return (
					<span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 font-mono text-[10px] text-purple-400">
						Escalada
					</span>
				);
			case "promovida_a_caso":
				return (
					<span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-mono text-[10px] text-green-400">
						En Caso
					</span>
				);
		}
	};

	return (
		<div className="fade-in mx-auto max-w-7xl animate-in space-y-6 pb-12 duration-500">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">
						Bandeja de Alertas
					</h1>
					<p className="text-muted-foreground text-sm">
						Triaje de alertas del motor de prevención y explicabilidad
						matemática del scorer (CAP-4, CAP-5, CAP-7).
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/casos" })}
						className="flex h-10 items-center gap-2 rounded-2xl border-border px-4 font-medium text-xs hover:bg-muted"
					>
						<Briefcase className="h-4 w-4 text-blue-500" />
						<span>Ver Expedientes y Casos</span>
						<ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
					</Button>
				</div>
			</div>

			{/* Scope Axiom Banner */}
			<div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-muted-foreground text-xs">
				<Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
				<div>
					<span className="font-semibold text-foreground">
						Triaje del Encargado (CAP-7):{" "}
					</span>
					Las alertas son emitidas automáticamente cuando una transacción supera
					el umbral de un control declarativo. Cada alerta incluye la
					explicabilidad completa (desglose de señales y pesos) para permitir al
					encargado descartarla justificadamente o promoverla a investigación.
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<Skeleton className="h-[500px] w-full rounded-3xl lg:col-span-5" />
					<Skeleton className="h-[500px] w-full rounded-3xl lg:col-span-7" />
				</div>
			) : alertas.length === 0 ? (
				<Card className="rounded-3xl border-border shadow-sm">
					<CardContent className="flex flex-col items-center justify-center p-16 text-center">
						<ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<h3 className="mb-1 font-medium text-lg">
							No hay alertas generadas
						</h3>
						<p className="mb-6 max-w-sm text-muted-foreground text-xs">
							Aún no se han evaluado transacciones. Carga un lote CSV en la
							pestaña de Ingesta para ejecutar los controles declarativos.
						</p>
						<Button
							onClick={() => navigate({ to: "/ingesta" })}
							className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-6 font-medium text-white text-xs hover:from-yellow-500 hover:to-amber-600"
						>
							<FileSpreadsheet className="h-4 w-4" />
							<span>Ir a Ingesta de Eventos</span>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Left Column: Master List */}
					<div className="space-y-3 lg:col-span-5">
						{/* Search & Filters */}
						<div className="space-y-2 rounded-2xl border border-border bg-background/60 p-3 shadow-xs">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
								<input
									type="text"
									placeholder="Buscar por proveedor, RUT o solicitante..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full rounded-xl border border-border bg-background py-1.5 pr-3 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
								/>
							</div>

							<div className="grid grid-cols-2 gap-2 text-xs">
								<select
									value={filterEstado}
									onChange={(e) => setFilterEstado(e.target.value)}
									className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
								>
									<option value="todas">Todos los estados</option>
									<option value="abierta">Abierta</option>
									<option value="en_revision">En Revisión</option>
									<option value="descartada">Descartada</option>
									<option value="escalada">Escalada</option>
									<option value="promovida_a_caso">En Caso</option>
								</select>

								<select
									value={filterBanda}
									onChange={(e) => setFilterBanda(e.target.value)}
									className="rounded-xl border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
								>
									<option value="todas">Todas las bandas</option>
									<option value="alta">Riesgo Alto</option>
									<option value="media">Riesgo Medio</option>
									<option value="baja">Riesgo Bajo</option>
								</select>
							</div>
						</div>

						{/* Alerts List */}
						<div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
							{filteredAlertas.map((alt) => {
								const isSelected = selectedAlerta?.id === alt.id;
								return (
									<button
										type="button"
										key={alt.id}
										onClick={() => setSelectedAlertaId(alt.id)}
										className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all ${
											isSelected
												? "border-amber-500/60 bg-amber-500/5 shadow-xs"
												: "border-border bg-background/60 hover:bg-muted/30"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 space-y-0.5">
												<span className="block truncate font-semibold text-foreground text-xs">
													{alt.evento.nombreProveedor}
												</span>
												<span className="font-mono text-[11px] text-muted-foreground">
													{alt.evento.rutProveedor}
												</span>
											</div>
											<div className="flex shrink-0 items-center gap-1.5">
												<span
													className={`rounded-full border px-2 py-0.5 font-bold font-mono text-[10px] uppercase ${getBandaColor(
														alt.banda,
													)}`}
												>
													{alt.banda} ({alt.score})
												</span>
												{getEstadoBadge(alt.estado)}
											</div>
										</div>

										<div className="flex items-center justify-between border-border/40 border-t pt-1 text-[11px] text-muted-foreground">
											<span className="max-w-[200px] truncate">
												{alt.delito}
											</span>
											<span className="font-bold font-mono text-foreground">
												${alt.evento.monto.toLocaleString("es-CL")}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Right Column: Detail & Explainability Panel */}
					<div className="space-y-4 lg:col-span-7">
						{selectedAlerta ? (
							<div className="space-y-4">
								{/* Alert Header Card */}
								<Card className="relative overflow-hidden rounded-3xl border-border bg-background shadow-sm">
									<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />
									<CardHeader className="pt-6 pb-4">
										<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
											<div>
												<div className="flex items-center gap-2">
													<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-amber-500">
														EXPEDIENTE AUDITABLE MPD
													</span>
													<span className="font-mono text-[11px] text-muted-foreground">
														{selectedAlerta.id}
													</span>
												</div>
												<CardTitle className="mt-2 font-bold text-xl">
													{selectedAlerta.evento.nombreProveedor}
												</CardTitle>
												<CardDescription className="text-xs">
													{selectedAlerta.delito} • Control:{" "}
													{selectedAlerta.controlNombre}
												</CardDescription>
											</div>

											<div className="flex items-center gap-2">
												<div className="text-right">
													<span className="block font-semibold text-[10px] text-muted-foreground uppercase">
														Score de Riesgo
													</span>
													<div className="flex items-baseline gap-1 font-bold font-mono text-2xl text-amber-500">
														<span>{selectedAlerta.score.toFixed(2)}</span>
														<span className="text-muted-foreground text-xs">
															/ 1.00
														</span>
													</div>
												</div>
											</div>
										</div>
									</CardHeader>

									<CardContent className="space-y-5 pt-0">
										{/* Lifecycle Action Bar (Flujo del Encargado) */}
										<div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-muted/30 p-3">
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground text-xs">
													Estado actual:
												</span>
												{getEstadoBadge(selectedAlerta.estado)}
											</div>

											<div className="flex flex-wrap items-center gap-2">
												{selectedAlerta.estado === "abierta" && (
													<Button
														size="sm"
														variant="outline"
														onClick={() =>
															handleMarkInReview(selectedAlerta.id)
														}
														className="flex h-8 items-center gap-1.5 rounded-xl text-xs"
													>
														<Eye className="h-3.5 w-3.5 text-blue-400" />
														<span>Poner en Revisión</span>
													</Button>
												)}

												{selectedAlerta.estado !== "descartada" &&
													selectedAlerta.estado !== "promovida_a_caso" && (
														<>
															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	setDismissReason("");
																	setActionError(null);
																	setIsDismissModalOpen(true);
																}}
																className="flex h-8 items-center gap-1.5 rounded-xl text-muted-foreground text-xs hover:border-red-500/40 hover:text-red-400"
															>
																<XCircle className="h-3.5 w-3.5" />
																<span>Descartar (con motivo)</span>
															</Button>

															<Button
																size="sm"
																variant="outline"
																onClick={() => {
																	setEscalateReason("");
																	setActionError(null);
																	setIsEscalateModalOpen(true);
																}}
																className="flex h-8 items-center gap-1.5 rounded-xl text-purple-400 text-xs hover:border-purple-500/40"
															>
																<Scale className="h-3.5 w-3.5" />
																<span>Escalar</span>
															</Button>

															<Button
																size="sm"
																onClick={() =>
																	handlePromoteToCase(selectedAlerta.id)
																}
																className="flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-700 font-medium text-white text-xs shadow-xs hover:from-yellow-500 hover:to-amber-600"
															>
																<Briefcase className="h-3.5 w-3.5" />
																<span>Promover a Caso</span>
															</Button>
														</>
													)}

												{selectedAlerta.estado === "promovida_a_caso" && (
													<Button
														size="sm"
														variant="outline"
														onClick={() => navigate({ to: "/casos" })}
														className="flex h-8 items-center gap-1.5 rounded-xl border-blue-500/30 text-blue-400 text-xs hover:bg-blue-500/10"
													>
														<Briefcase className="h-3.5 w-3.5" />
														<span>Ver en Expedientes de Casos</span>
														<ArrowRight className="h-3 w-3" />
													</Button>
												)}
											</div>
										</div>

										{/* Audit Notice if Dismissed */}
										{selectedAlerta.estado === "descartada" && (
											<div className="space-y-1 rounded-2xl border border-border bg-muted/40 p-3 text-xs">
												<span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
													<Info className="h-3.5 w-3.5 text-amber-500" />
													Alerta Descartada (Preservada como evidencia)
												</span>
												<p className="pl-5 text-muted-foreground">
													Motivo registrado: "{selectedAlerta.motivoDescarte}"
												</p>
												<p className="pl-5 font-mono text-[10px] text-muted-foreground/80">
													Revisado por:{" "}
													{selectedAlerta.revisadoPor || "Encargado"} el{" "}
													{selectedAlerta.fechaRevision
														? new Date(
																selectedAlerta.fechaRevision,
															).toLocaleString("es-CL")
														: "-"}
												</p>
											</div>
										)}

										{/* Explicabilidad del Scorer: Contrato { score, breakdown[] } */}
										<div className="space-y-3">
											<div className="flex items-center justify-between border-border border-b pb-2">
												<div>
													<h4 className="flex items-center gap-2 font-semibold text-sm">
														<Scale className="h-4 w-4 text-amber-500" />
														Explicabilidad del Scorer (
														{"{ score, breakdown[] }"})
													</h4>
													<p className="text-[11px] text-muted-foreground">
														Responde a la pregunta del auditor: *"¿Por qué{" "}
														{selectedAlerta.score.toFixed(2)}?"*. Desglose de
														cada señal evaluada.
													</p>
												</div>
												<span className="font-mono font-semibold text-amber-500 text-xs">
													{
														selectedAlerta.breakdown.filter((b) => b.disparada)
															.length
													}{" "}
													/ {selectedAlerta.breakdown.length} señales activadas
												</span>
											</div>

											{/* Visual Breakdown Cards */}
											<div className="space-y-2">
												{selectedAlerta.breakdown.map((item) => (
													<div
														key={item.senalId}
														className={`space-y-1.5 rounded-2xl border p-3 text-xs transition-all ${
															item.disparada
																? "border-amber-600/40 bg-amber-500/5 shadow-xs"
																: "border-border/60 bg-muted/10 opacity-60"
														}`}
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																{item.disparada ? (
																	<AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
																) : (
																	<CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground/40" />
																)}
																<span className="font-medium text-foreground">
																	{item.nombre}
																</span>
																<span
																	className={`rounded px-1.5 py-0.2 font-mono font-semibold text-[9px] uppercase ${
																		item.tipo === "intrinseca"
																			? "bg-blue-500/10 text-blue-400"
																			: "bg-purple-500/10 text-purple-400"
																	}`}
																>
																	{item.tipo}
																</span>
															</div>

															<div className="flex items-center gap-3 font-mono text-xs">
																<span className="text-muted-foreground">
																	Peso: {item.peso}
																</span>
																<span
																	className={`font-bold ${
																		item.disparada
																			? "text-amber-500"
																			: "text-muted-foreground/60"
																	}`}
																>
																	+{item.contribucion.toFixed(2)}
																</span>
															</div>
														</div>

														<p className="pl-6 text-[11px] text-muted-foreground">
															{item.detalle}
														</p>
													</div>
												))}
											</div>
										</div>

										{/* Event Details Grid */}
										<div className="space-y-3 pt-2">
											<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
												Datos de la Transacción Evaluada
											</h4>
											<div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-muted/20 p-3 text-xs sm:grid-cols-3">
												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														Monto Total
													</span>
													<span className="font-bold font-mono text-foreground text-sm">
														$
														{selectedAlerta.evento.monto.toLocaleString(
															"es-CL",
														)}{" "}
														CLP
													</span>
												</div>

												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														Solicitante
													</span>
													<span
														className="block truncate font-medium text-foreground"
														title={selectedAlerta.evento.nombreSolicitante}
													>
														{selectedAlerta.evento.nombreSolicitante}
													</span>
													<span className="font-mono text-[10px] text-muted-foreground">
														{selectedAlerta.evento.rutSolicitante}
													</span>
												</div>

												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														Fecha Transacción
													</span>
													<span className="font-mono text-muted-foreground">
														{new Date(
															selectedAlerta.evento.fecha,
														).toLocaleDateString("es-CL")}
													</span>
												</div>

												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														Constitución Proveedor
													</span>
													<span className="font-mono text-muted-foreground">
														{selectedAlerta.evento.fechaConstitucionProveedor
															? new Date(
																	selectedAlerta.evento
																		.fechaConstitucionProveedor,
																).toLocaleDateString("es-CL")
															: "No informada"}
													</span>
												</div>

												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														Exposición Política (PEP)
													</span>
													<span className="font-medium">
														{selectedAlerta.evento.flagPep ? (
															<span className="font-semibold text-red-400">
																Sí (Clasificado PEP)
															</span>
														) : (
															<span className="text-muted-foreground">No</span>
														)}
													</span>
												</div>

												<div>
													<span className="block text-[10px] text-muted-foreground uppercase">
														N° Oferentes en Adjudicación
													</span>
													<span className="font-mono font-semibold text-foreground">
														{selectedAlerta.evento.nOferentes ?? "-"}{" "}
														oferente(s)
													</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						) : (
							<div className="flex h-64 items-center justify-center rounded-3xl border border-border border-dashed text-muted-foreground">
								Selecciona una alerta para ver su explicabilidad
							</div>
						)}
					</div>
				</div>
			)}

			{/* MODAL: Descartar Alerta con Justificación */}
			{isDismissModalOpen && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
					<div className="w-full max-w-lg space-y-4 rounded-3xl border border-border bg-background p-6 shadow-2xl">
						<div className="flex items-start justify-between border-border border-b pb-3">
							<div>
								<h3 className="font-semibold text-lg">Descartar Alerta</h3>
								<p className="text-muted-foreground text-xs">
									El descarte es una decisión humana que queda archivada en el
									registro de auditoría.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsDismissModalOpen(false)}
								className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{actionError && (
							<div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-red-400 text-xs">
								{actionError}
							</div>
						)}

						<div className="space-y-2">
							<label
								htmlFor="dismiss-reason-input"
								className="font-semibold text-foreground text-xs"
							>
								Motivo del Descarte (Obligatorio) *
							</label>
							<textarea
								id="dismiss-reason-input"
								rows={3}
								placeholder="Indica las razones por las cuales esta alerta no constituye un riesgo delictivo..."
								value={dismissReason}
								onChange={(e) => setDismissReason(e.target.value)}
								className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
							/>
						</div>

						<div className="flex items-center justify-end gap-2 border-border border-t pt-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsDismissModalOpen(false)}
								className="rounded-xl text-xs"
							>
								Cancelar
							</Button>
							<Button
								size="sm"
								variant="destructive"
								onClick={handleConfirmDismiss}
								className="rounded-xl text-xs"
							>
								Confirmar Descarte
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL: Escalar Alerta */}
			{isEscalateModalOpen && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
					<div className="w-full max-w-lg space-y-4 rounded-3xl border border-border bg-background p-6 shadow-2xl">
						<div className="flex items-start justify-between border-border border-b pb-3">
							<div>
								<h3 className="font-semibold text-lg">Escalar Alerta</h3>
								<p className="text-muted-foreground text-xs">
									Derivar el expediente a una instancia superior (Directorio /
									Comité de Ética).
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsEscalateModalOpen(false)}
								className="rounded-xl p-1 text-muted-foreground hover:bg-muted"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-2">
							<label
								htmlFor="escalate-reason-input"
								className="font-semibold text-foreground text-xs"
							>
								Motivo o Destinatario del Escalamiento
							</label>
							<textarea
								id="escalate-reason-input"
								rows={3}
								placeholder="ej: Escalamiento al Comité de Ética debido a posible conflicto de interés que involucra a jefatura..."
								value={escalateReason}
								onChange={(e) => setEscalateReason(e.target.value)}
								className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
							/>
						</div>

						<div className="flex items-center justify-end gap-2 border-border border-t pt-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEscalateModalOpen(false)}
								className="rounded-xl text-xs"
							>
								Cancelar
							</Button>
							<Button
								size="sm"
								onClick={handleConfirmEscalate}
								className="rounded-xl bg-purple-600 text-white text-xs hover:bg-purple-500"
							>
								Confirmar Escalamiento
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
