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
	Briefcase,
	CheckCircle2,
	Clock,
	ExternalLink,
	FileCheck,
	Info,
	Lock,
	Scale,
	Search,
	ShieldAlert,
	UserCheck,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type Caso, DomainStore } from "@/lib/domain-store";

export const Route = createFileRoute("/_auth/casos")({
	component: CasosPage,
});

function CasosPage() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [casos, setCasos] = useState<Caso[]>([]);
	const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [filterEstado, setFilterEstado] = useState<string>("todos");

	// Close Case Modal
	const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
	const [closeJustification, setCloseJustification] = useState("");
	const [actionError, setActionError] = useState<string | null>(null);

	const loadCasos = useCallback(() => {
		const loaded = DomainStore.getCasos();
		setCasos(loaded);
		if (loaded.length > 0 && !selectedCasoId) {
			setSelectedCasoId(loaded[0].id);
		}
	}, [selectedCasoId]);

	useEffect(() => {
		loadCasos();
		const timer = setTimeout(() => setIsLoading(false), 500);

		const handleUpdate = () => {
			loadCasos();
		};

		window.addEventListener("mpd_store_updated", handleUpdate);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("mpd_store_updated", handleUpdate);
		};
	}, [loadCasos]);

	const selectedCaso =
		casos.find((c) => c.id === selectedCasoId) || casos[0] || null;

	const filteredCasos = casos.filter((c) => {
		if (filterEstado !== "todos" && c.estado !== filterEstado) return false;
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			return (
				c.id.toLowerCase().includes(q) ||
				c.alerta.evento.nombreProveedor.toLowerCase().includes(q) ||
				c.alerta.evento.rutProveedor.toLowerCase().includes(q) ||
				c.alerta.delito.toLowerCase().includes(q)
			);
		}
		return true;
	});

	const handleConfirmClose = () => {
		if (!selectedCaso) return;
		if (!closeJustification.trim()) {
			setActionError(
				"Es obligatorio registrar la justificación de cierre (fundamento legal auditable).",
			);
			return;
		}

		const actorName = session.data?.user.name || "Encargado de Cumplimiento";
		const actorId = session.data?.user.id || "usr-current";

		DomainStore.cerrarCasoConJustificacion(
			selectedCaso.id,
			closeJustification.trim(),
			actorName,
			actorId,
		);

		setIsCloseModalOpen(false);
		setCloseJustification("");
		setActionError(null);
	};

	return (
		<div className="fade-in mx-auto max-w-7xl animate-in space-y-6 pb-12 duration-500">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">
						Expedientes y Casos de Investigación
					</h1>
					<p className="text-muted-foreground text-sm">
						Gestión de casos promovidos para indagación y dictamen formal de
						cierre (CAP-8, CAP-9).
					</p>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={() => navigate({ to: "/alertas" })}
						className="flex h-10 items-center gap-2 rounded-2xl border-border px-4 font-medium text-xs hover:bg-muted"
					>
						<ShieldAlert className="h-4 w-4 text-amber-500" />
						<span>Ir a Bandeja de Alertas</span>
					</Button>
				</div>
			</div>

			{/* Scope Axiom Notice */}
			<div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-muted-foreground text-xs">
				<Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
				<div>
					<span className="font-semibold text-foreground">
						Axioma de Evidencia Legal (CAP-8):{" "}
					</span>
					Las alertas prueban que el modelo de prevención estaba observando. El{" "}
					<strong>cierre con justificación</strong> prueba lo que la
					organización decidió a pesar de la advertencia. Es la evidencia de
					mayor valor jurídico del sistema frente a fiscalizaciones del
					Ministerio Público o auditores externos.
				</div>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<Skeleton className="h-[500px] w-full rounded-3xl lg:col-span-5" />
					<Skeleton className="h-[500px] w-full rounded-3xl lg:col-span-7" />
				</div>
			) : casos.length === 0 ? (
				<Card className="rounded-3xl border-border shadow-sm">
					<CardContent className="flex flex-col items-center justify-center p-16 text-center">
						<Briefcase className="mb-4 h-12 w-12 text-muted-foreground/30" />
						<h3 className="mb-1 font-medium text-lg">
							No hay casos de investigación abiertos
						</h3>
						<p className="mb-6 max-w-sm text-muted-foreground text-xs">
							Los casos se originan al revisar una alerta en la bandeja y
							promoverla formalmente a investigación interna.
						</p>
						<Button
							onClick={() => navigate({ to: "/alertas" })}
							className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-6 font-medium text-white text-xs hover:from-yellow-500 hover:to-amber-600"
						>
							<ShieldAlert className="h-4 w-4" />
							<span>Ver Bandeja de Alertas</span>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
					{/* Left Column: Casos Master List */}
					<div className="space-y-3 lg:col-span-5">
						{/* Search and Status Filters */}
						<div className="space-y-2 rounded-2xl border border-border bg-background/60 p-3 shadow-xs">
							<div className="relative">
								<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
								<input
									type="text"
									placeholder="Buscar por ID, proveedor o delito..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full rounded-xl border border-border bg-background py-1.5 pr-3 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
								/>
							</div>

							<div className="flex gap-2 text-xs">
								<select
									value={filterEstado}
									onChange={(e) => setFilterEstado(e.target.value)}
									className="w-full rounded-xl border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
								>
									<option value="todos">Todos los estados</option>
									<option value="investigacion">En Investigación Activa</option>
									<option value="cerrado">Cerrados con Justificación</option>
								</select>
							</div>
						</div>

						{/* List */}
						<div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
							{filteredCasos.map((casoItem) => {
								const isSelected = selectedCaso?.id === casoItem.id;
								return (
									<button
										type="button"
										key={casoItem.id}
										onClick={() => setSelectedCasoId(casoItem.id)}
										className={`group flex w-full cursor-pointer flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all ${
											isSelected
												? "border-blue-500/60 bg-blue-500/5 shadow-xs"
												: "border-border bg-background/60 hover:bg-muted/30"
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="min-w-0 space-y-0.5">
												<span className="block font-mono text-[10px] text-muted-foreground">
													EXPEDIENTE {casoItem.id}
												</span>
												<span className="block truncate font-semibold text-foreground text-xs">
													{casoItem.alerta.evento.nombreProveedor}
												</span>
											</div>
											<span
												className={`shrink-0 rounded-full border px-2 py-0.5 font-medium font-mono text-[10px] ${
													casoItem.estado === "cerrado"
														? "border-green-500/30 bg-green-500/10 text-green-400"
														: "border-blue-500/30 bg-blue-500/10 text-blue-400"
												}`}
											>
												{casoItem.estado === "cerrado"
													? "Cerrado"
													: "En Investigación"}
											</span>
										</div>

										<div className="flex items-center justify-between border-border/40 border-t pt-1 text-[11px] text-muted-foreground">
											<span className="max-w-[200px] truncate">
												{casoItem.alerta.delito}
											</span>
											<span>
												{new Date(casoItem.createdAt).toLocaleDateString(
													"es-CL",
												)}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Right Column: Case Dossier & Action */}
					<div className="space-y-4 lg:col-span-7">
						{selectedCaso ? (
							<Card className="relative overflow-hidden rounded-3xl border-border bg-background shadow-sm">
								<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
								<CardHeader className="pt-6 pb-4">
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div>
											<div className="flex items-center gap-2">
												<span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-blue-400">
													EXPEDIENTE FORMAL MPD
												</span>
												<span className="font-mono text-[11px] text-muted-foreground">
													{selectedCaso.id}
												</span>
											</div>
											<CardTitle className="mt-2 font-bold text-xl">
												{selectedCaso.alerta.evento.nombreProveedor}
											</CardTitle>
											<CardDescription className="text-xs">
												{selectedCaso.alerta.delito} • Abierto el{" "}
												{new Date(selectedCaso.createdAt).toLocaleDateString(
													"es-CL",
												)}
											</CardDescription>
										</div>

										<div>
											{selectedCaso.estado === "cerrado" ? (
												<span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 font-mono font-semibold text-green-400 text-xs">
													<CheckCircle2 className="h-4 w-4" />
													Cerrado con Justificación
												</span>
											) : (
												<Button
													onClick={() => {
														setCloseJustification("");
														setActionError(null);
														setIsCloseModalOpen(true);
													}}
													className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 font-medium text-white text-xs shadow-blue-900/20 shadow-md hover:from-blue-500 hover:to-indigo-600"
												>
													<FileCheck className="h-3.5 w-3.5" />
													<span>Cerrar Caso con Justificación</span>
												</Button>
											)}
										</div>
									</div>
								</CardHeader>

								<CardContent className="space-y-5 pt-0">
									{/* Status Banner */}
									{selectedCaso.estado === "cerrado" ? (
										<div className="space-y-2 rounded-2xl border border-green-500/40 bg-green-500/5 p-4">
											<div className="flex items-center justify-between border-green-500/20 border-b pb-2">
												<span className="flex items-center gap-2 font-semibold text-green-400 text-xs">
													<Lock className="h-3.5 w-3.5" />
													Dictamen Legal y Cierre Certificado (Evidencia
													Inmutable)
												</span>
												<span className="font-mono text-[11px] text-muted-foreground">
													{selectedCaso.closedAt
														? new Date(selectedCaso.closedAt).toLocaleString(
																"es-CL",
															)
														: ""}
												</span>
											</div>
											<div>
												<span className="block font-semibold text-[10px] text-muted-foreground uppercase">
													Justificación del Encargado de Cumplimiento:
												</span>
												<p className="mt-1 rounded-xl border border-border bg-background/80 p-3 text-foreground text-xs">
													{selectedCaso.justificacion}
												</p>
											</div>
											<div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
												<UserCheck className="h-3.5 w-3.5 text-green-400" />
												<span>
													Firmado y sellado por:{" "}
													<strong className="text-foreground">
														{selectedCaso.encargadoNombre ||
															"Encargado de Cumplimiento"}
													</strong>
												</span>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-2.5 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-3.5 text-muted-foreground text-xs">
											<Clock className="h-4 w-4 shrink-0 text-blue-400" />
											<div>
												<span className="block font-semibold text-foreground">
													Investigación en curso
												</span>
												El expediente se encuentra abierto. Para emitir el
												dictamen final del MPD, redacta la justificación y
												procede con la firma de cierre.
											</div>
										</div>
									)}

									{/* Originating Alert Details */}
									<div className="space-y-3">
										<div className="flex items-center justify-between border-border border-b pb-2">
											<h4 className="flex items-center gap-2 font-semibold text-sm">
												<Scale className="h-4 w-4 text-amber-500" />
												Alerta de Origen y Evidencia Vinculada
											</h4>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => navigate({ to: "/alertas" })}
												className="flex h-7 items-center gap-1 rounded-lg px-2 text-amber-500 text-xs hover:text-amber-400"
											>
												<span>Ver en Alertas</span>
												<ExternalLink className="h-3 w-3" />
											</Button>
										</div>

										<div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-3.5 text-xs">
											<div className="flex items-center justify-between">
												<div>
													<span className="block font-semibold text-[10px] text-muted-foreground uppercase">
														Control Declarativo
													</span>
													<span className="font-medium text-foreground">
														{selectedCaso.alerta.controlNombre}
													</span>
												</div>
												<div className="text-right">
													<span className="block font-semibold text-[10px] text-muted-foreground uppercase">
														Score de Riesgo
													</span>
													<span className="font-bold font-mono text-amber-500 text-sm">
														{selectedCaso.alerta.score.toFixed(2)} (
														{selectedCaso.alerta.banda})
													</span>
												</div>
											</div>

											{/* Fired Signals */}
											<div className="space-y-1.5 pt-1">
												<span className="block font-semibold text-[10px] text-muted-foreground uppercase">
													Señales que Dispararon la Alerta
												</span>
												{selectedCaso.alerta.breakdown
													.filter((b) => b.disparada)
													.map((b) => (
														<div
															key={b.senalId}
															className="flex items-start gap-2 rounded-xl border border-border/80 bg-background/80 p-2 text-[11px]"
														>
															<AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
															<div className="min-w-0">
																<span className="font-semibold text-foreground">
																	{b.nombre} (Contribución: +
																	{b.contribucion.toFixed(2)})
																</span>
																<p className="text-[10.5px] text-muted-foreground">
																	{b.detalle}
																</p>
															</div>
														</div>
													))}
											</div>
										</div>
									</div>

									{/* Transaction Metadata */}
									<div className="space-y-2 pt-1">
										<h4 className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
											Datos de la Transacción Investigada
										</h4>
										<div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-muted/20 p-3 text-xs sm:grid-cols-3">
											<div>
												<span className="block text-[10px] text-muted-foreground uppercase">
													Monto Involucrado
												</span>
												<span className="font-bold font-mono text-foreground text-sm">
													$
													{selectedCaso.alerta.evento.monto.toLocaleString(
														"es-CL",
													)}{" "}
													CLP
												</span>
											</div>

											<div>
												<span className="block text-[10px] text-muted-foreground uppercase">
													Solicitante Interno
												</span>
												<span className="block truncate font-medium text-foreground">
													{selectedCaso.alerta.evento.nombreSolicitante}
												</span>
												<span className="font-mono text-[10px] text-muted-foreground">
													{selectedCaso.alerta.evento.rutSolicitante}
												</span>
											</div>

											<div>
												<span className="block text-[10px] text-muted-foreground uppercase">
													RUT Proveedor
												</span>
												<span className="font-medium font-mono text-foreground">
													{selectedCaso.alerta.evento.rutProveedor}
												</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						) : (
							<div className="flex h-64 items-center justify-center rounded-3xl border border-border border-dashed text-muted-foreground">
								Selecciona un caso para ver su expediente
							</div>
						)}
					</div>
				</div>
			)}

			{/* Modal: Cerrar Caso con Justificación */}
			{isCloseModalOpen && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
					<div className="w-full max-w-lg space-y-4 rounded-3xl border border-border bg-background p-6 shadow-2xl">
						<div className="flex items-start justify-between border-border border-b pb-3">
							<div>
								<div className="flex items-center gap-1.5 font-semibold text-blue-500 text-xs uppercase">
									<FileCheck className="h-4 w-4" />
									Dictamen Legal Auditable
								</div>
								<h3 className="font-semibold text-lg">
									Cierre de Caso con Justificación
								</h3>
								<p className="text-muted-foreground text-xs">
									El cierre formal es la prueba documental de la decisión
									adoptada por la organización.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsCloseModalOpen(false)}
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
								htmlFor="close-justification-input"
								className="font-semibold text-foreground text-xs"
							>
								Informe y Justificación de Cierre (Obligatorio) *
							</label>
							<textarea
								id="close-justification-input"
								rows={4}
								placeholder="Detalla las indagaciones realizadas, documentos respaldatorios revisados y la conclusión que fundamenta el cierre del expediente..."
								value={closeJustification}
								onChange={(e) => setCloseJustification(e.target.value)}
								className="w-full rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
							/>
							<p className="text-[11px] text-muted-foreground">
								Este dictamen se archivará a nombre de{" "}
								<strong>{session.data?.user.name}</strong> con marca temporal
								certificada y no podrá ser editado posteriormente.
							</p>
						</div>

						<div className="flex items-center justify-end gap-2 border-border border-t pt-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsCloseModalOpen(false)}
								className="rounded-xl text-xs"
							>
								Cancelar
							</Button>
							<Button
								size="sm"
								onClick={handleConfirmClose}
								className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 font-medium text-white text-xs shadow-sm hover:from-blue-500 hover:to-indigo-600"
							>
								Firmar y Cerrar Caso
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
