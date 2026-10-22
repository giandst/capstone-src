import { Button } from "@capstone-src/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@capstone-src/ui/components/card";
import { Skeleton } from "@capstone-src/ui/components/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Info, Plus, Settings, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	type Control,
	DomainStore,
	type SenalConfig,
} from "@/lib/domain-store";

export const Route = createFileRoute("/_auth/controles")({
	component: ControlesPage,
});

// Catalog of available reusable signals according to senales-catalog.md
const SENALES_CATALOGO: Omit<SenalConfig, "peso">[] = [
	{
		id: "adjudicacion_sin_competencia",
		nombre: "Adjudicación sin competencia (n_oferentes = 1)",
		tipo: "intrinseca",
		descripcion:
			"Lee n_oferentes en montos relevantes; elemento típico del CP art. 287 bis (favorecer a un oferente sobre otro).",
	},
	{
		id: "proveedor_recientemente_constituido",
		nombre: "Proveedor constituido recientemente (< 30 días)",
		tipo: "relacional",
		descripcion:
			"Detecta proveedores creados pocos días antes de la emisión de la compra vía fecha de constitución.",
	},
	{
		id: "apellido_compartido",
		nombre: "Apellido compartido con solicitante",
		tipo: "relacional",
		descripcion:
			"Cruce entre apellidos del solicitante y la razón social / socios de la contraparte.",
	},
	{
		id: "fraccionamiento",
		nombre: "Fraccionamiento de compras / pagos",
		tipo: "intrinseca",
		descripcion:
			"Múltiples transacciones justo bajo el umbral de aprobación ejecutiva ($5.000.000) hacia el mismo proveedor.",
	},
	{
		id: "flag_pep",
		nombre: "Persona Expuesta Políticamente (PEP) involucrada",
		tipo: "relacional",
		descripcion:
			"Contraparte clasificada con exposición política según columna de enriquecimiento.",
	},
	{
		id: "causas_judiciales",
		nombre: "Causas judiciales pendientes",
		tipo: "relacional",
		descripcion:
			"Antecedentes penales o litigios vigentes registrados en la contraparte.",
	},
];

function ControlesPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [controles, setControles] = useState<Control[]>([]);
	const [selectedControlFicha, setSelectedControlFicha] =
		useState<Control | null>(null);
	const [isAuthoringOpen, setIsAuthoringOpen] = useState(false);

	// Authoring Form State (D2 - CAP-10)
	const [nombre, setNombre] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [delito, setDelito] = useState("Corrupción entre particulares");
	const [eventoTipo, setEventoTipo] = useState<
		"compra" | "pago" | "transferencia"
	>("compra");
	const [selectedSenales, setSelectedSenales] = useState<
		Record<string, number>
	>({
		adjudicacion_sin_competencia: 0.35,
		proveedor_recientemente_constituido: 0.25,
		apellido_compartido: 0.25,
		fraccionamiento: 0.15,
	});
	const [umbralAlerta, setUmbralAlerta] = useState(0.4);
	const [umbralMedia, setUmbralMedia] = useState(0.45);
	const [umbralAlta, setUmbralAlta] = useState(0.7);
	const [formError, setFormError] = useState<string | null>(null);

	const loadControles = useCallback(() => {
		setControles(DomainStore.getControles());
	}, []);

	useEffect(() => {
		loadControles();
		const timer = setTimeout(() => setIsLoading(false), 500);

		const handleUpdate = () => {
			loadControles();
		};

		window.addEventListener("mpd_store_updated", handleUpdate);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("mpd_store_updated", handleUpdate);
		};
	}, [loadControles]);

	const handleToggleSenal = (senalId: string) => {
		setSelectedSenales((prev) => {
			const copy = { ...prev };
			if (copy[senalId] !== undefined) {
				delete copy[senalId];
			} else {
				copy[senalId] = 0.25;
			}
			return copy;
		});
	};

	const handleWeightChange = (senalId: string, value: number) => {
		setSelectedSenales((prev) => ({
			...prev,
			[senalId]: Number(value.toFixed(2)),
		}));
	};

	const handleSaveControl = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!nombre.trim()) {
			setFormError("El nombre del control es obligatorio.");
			return;
		}

		const senalIds = Object.keys(selectedSenales);
		if (senalIds.length === 0) {
			setFormError(
				"Debes seleccionar al menos una señal para componer el control.",
			);
			return;
		}

		const composedSenales: SenalConfig[] = senalIds.map((id) => {
			const def = SENALES_CATALOGO.find((s) => s.id === id);
			return {
				id,
				nombre: def ? def.nombre : id,
				tipo: def ? def.tipo : "intrinseca",
				descripcion: def ? def.descripcion : "",
				peso: selectedSenales[id],
			};
		});

		const newControl: Control = {
			id: `ctrl-${Date.now().toString().slice(-6)}`,
			nombre: nombre.trim(),
			descripcion:
				descripcion.trim() ||
				"Control configurado mediante la interfaz de autoría D2.",
			delito,
			eventoTipo,
			configuracion: {
				umbrales: {
					baja: 0.0,
					media: umbralMedia,
					alta: umbralAlta,
					alerta: umbralAlerta,
				},
				senales: composedSenales,
			},
			version: `v1.${controles.length + 1}-autor`,
			createdAt: new Date().toISOString(),
		};

		DomainStore.saveControl(newControl);
		setIsAuthoringOpen(false);

		// Reset Form
		setNombre("");
		setDescripcion("");
	};

	return (
		<div className="fade-in mx-auto max-w-6xl animate-in space-y-6 pb-12 duration-500">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">
						Gestor de Controles
					</h1>
					<p className="text-muted-foreground text-sm">
						Definición declarativa de reglas preventivas y catálogo de señales
						reutilizables (CAP-2, CAP-6, CAP-10).
					</p>
				</div>

				<Button
					onClick={() => setIsAuthoringOpen(true)}
					className="flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-5 font-medium text-white text-xs shadow-amber-900/20 shadow-md hover:from-yellow-500 hover:to-amber-600"
				>
					<Plus className="h-4 w-4" />
					<span>Nuevo Control (Autoría D2)</span>
				</Button>
			</div>

			{/* Scope Contract Notice for Controls */}
			<div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-muted-foreground text-xs">
				<Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
				<div>
					<span className="font-semibold text-foreground">
						Axioma de Arquitectura (CAP-2 / D1):{" "}
					</span>
					Un control es únicamente datos de configuración (delito, evento,
					señales compuestas, ponderaciones y umbrales). El motor ejecuta
					definiciones declarativas sin código específico por control. Agregar
					un delito es configuración, no nuevo código.
				</div>
			</div>

			{/* Controls Grid */}
			<div className="space-y-4">
				{isLoading ? (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Skeleton className="h-[220px] w-full rounded-3xl" />
						<Skeleton className="h-[220px] w-full rounded-3xl" />
					</div>
				) : controles.length === 0 ? (
					<Card className="rounded-3xl border-border shadow-sm">
						<CardContent className="flex flex-col items-center justify-center p-16 text-center">
							<Settings className="mb-4 h-12 w-12 text-muted-foreground/30" />
							<h3 className="mb-1 font-medium text-lg">
								Sin controles activos
							</h3>
							<p className="max-w-sm text-muted-foreground text-sm">
								Crea un nuevo control con el botón de autoría para activar la
								supervisión.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						{controles.map((ctrl) => (
							<Card
								key={ctrl.id}
								className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-border bg-background/60 shadow-sm transition-all hover:border-amber-700/40 hover:shadow-md"
							>
								<div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-yellow-500 to-amber-700 opacity-80" />

								<CardHeader className="pt-6 pb-3">
									<div className="flex items-start justify-between gap-3">
										<div>
											<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-amber-500">
												{ctrl.delito}
											</span>
											<CardTitle className="mt-2 text-base leading-snug">
												{ctrl.nombre}
											</CardTitle>
										</div>
										<span className="font-mono text-[11px] text-muted-foreground">
											{ctrl.version}
										</span>
									</div>
									<CardDescription className="mt-1 line-clamp-2 text-xs">
										{ctrl.descripcion}
									</CardDescription>
								</CardHeader>

								<CardContent className="space-y-4 pt-1 pb-5">
									{/* Event Type & Umbrales */}
									<div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-xs">
										<div>
											<span className="text-[10px] text-muted-foreground uppercase">
												Evento Monitoreado
											</span>
											<div className="font-medium text-foreground capitalize">
												{ctrl.eventoTipo}
											</div>
										</div>
										<div>
											<span className="text-[10px] text-muted-foreground uppercase">
												Umbral Disparo Alerta
											</span>
											<div className="font-bold font-mono text-amber-500">
												&gt;= {ctrl.configuracion.umbrales.alerta}
											</div>
										</div>
									</div>

									{/* Señales Compuestas */}
									<div className="space-y-1.5">
										<span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
											Señales Compuestas ({ctrl.configuracion.senales.length})
										</span>
										<div className="flex flex-wrap gap-1.5">
											{ctrl.configuracion.senales.map((s) => (
												<div
													key={s.id}
													className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-2.5 py-1 text-[11px]"
												>
													<span
														className={`h-1.5 w-1.5 rounded-full ${
															s.tipo === "intrinseca"
																? "bg-blue-400"
																: "bg-purple-400"
														}`}
													/>
													<span
														className="max-w-[170px] truncate"
														title={s.nombre}
													>
														{s.nombre.split("(")[0]}
													</span>
													<span className="font-bold font-mono text-[10px] text-amber-500">
														{s.peso}
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Ficha del Control Trigger Button */}
									<div className="border-border/60 border-t pt-3">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setSelectedControlFicha(ctrl)}
											className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-xs hover:border-amber-600/50 hover:text-amber-500"
										>
											<FileText className="h-3.5 w-3.5 text-amber-500" />
											<span>Ver Ficha del Control (Auditoría CAP-6)</span>
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			{/* Modal: Ficha del Control (CAP-6) */}
			{selectedControlFicha && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
					<div className="max-h-[90vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl">
						<div className="flex items-start justify-between border-border border-b pb-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-amber-500">
										FICHA OFICIAL DE CONTROL MPD
									</span>
									<span className="font-mono text-muted-foreground text-xs">
										{selectedControlFicha.version}
									</span>
								</div>
								<h2 className="font-semibold text-xl">
									{selectedControlFicha.nombre}
								</h2>
								<p className="text-muted-foreground text-xs">
									Documento auditable generado directamente de la definición
									declarativa del motor.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setSelectedControlFicha(null)}
								className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="space-y-4 text-xs">
							<div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/20 p-4">
								<div>
									<span className="font-semibold text-[10px] text-muted-foreground uppercase">
										Delito Supervisado
									</span>
									<p className="font-medium text-foreground">
										{selectedControlFicha.delito}
									</p>
								</div>
								<div>
									<span className="font-semibold text-[10px] text-muted-foreground uppercase">
										Tipo de Evento
									</span>
									<p className="font-medium text-foreground capitalize">
										{selectedControlFicha.eventoTipo}
									</p>
								</div>
								<div className="col-span-2 border-border/50 border-t pt-2">
									<span className="font-semibold text-[10px] text-muted-foreground uppercase">
										Fundamento y Propósito Legal
									</span>
									<p className="mt-0.5 text-muted-foreground">
										{selectedControlFicha.descripcion}
									</p>
								</div>
							</div>

							{/* Thresholds Table */}
							<div className="space-y-2">
								<h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
									Matriz de Umbrales y Bandas de Riesgo
								</h4>
								<div className="grid grid-cols-3 gap-2 text-center font-mono">
									<div className="rounded-2xl border border-border bg-muted/10 p-2.5">
										<span className="block text-[10px] text-muted-foreground uppercase">
											Baja
										</span>
										<span className="font-semibold text-sm">
											0.00 -{" "}
											{(
												selectedControlFicha.configuracion.umbrales.media - 0.01
											).toFixed(2)}
										</span>
									</div>
									<div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-2.5">
										<span className="block font-medium text-[10px] text-amber-500 uppercase">
											Media
										</span>
										<span className="font-semibold text-amber-500 text-sm">
											{selectedControlFicha.configuracion.umbrales.media.toFixed(
												2,
											)}{" "}
											-{" "}
											{(
												selectedControlFicha.configuracion.umbrales.alta - 0.01
											).toFixed(2)}
										</span>
									</div>
									<div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-2.5">
										<span className="block font-medium text-[10px] text-red-400 uppercase">
											Alta
										</span>
										<span className="font-semibold text-red-400 text-sm">
											&gt;={" "}
											{selectedControlFicha.configuracion.umbrales.alta.toFixed(
												2,
											)}
										</span>
									</div>
								</div>
							</div>

							{/* Signals Composition Details */}
							<div className="space-y-2">
								<h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
									Composición de Señales y Ponderación Matemática
								</h4>
								<div className="space-y-2">
									{selectedControlFicha.configuracion.senales.map((s) => (
										<div
											key={s.id}
											className="space-y-1 rounded-2xl border border-border bg-background p-3"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<span
														className={`rounded px-1.5 py-0.5 font-mono font-semibold text-[9px] uppercase ${
															s.tipo === "intrinseca"
																? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
																: "border border-purple-500/20 bg-purple-500/10 text-purple-400"
														}`}
													>
														{s.tipo}
													</span>
													<span className="font-medium text-foreground">
														{s.nombre}
													</span>
												</div>
												<span className="font-bold font-mono text-amber-500 text-sm">
													Peso: {s.peso}
												</span>
											</div>
											<p className="text-[11px] text-muted-foreground">
												{s.descripcion}
											</p>
										</div>
									))}
								</div>
							</div>
						</div>

						<div className="flex justify-end border-border border-t pt-4">
							<Button
								onClick={() => setSelectedControlFicha(null)}
								className="h-9 rounded-xl px-6 text-xs"
							>
								Cerrar Ficha
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* Modal: Authoring UI D2 (CAP-10) */}
			{isAuthoringOpen && (
				<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
					<div className="max-h-[92vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-2xl">
						<div className="flex items-start justify-between border-border border-b pb-4">
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium font-mono text-[10px] text-amber-500">
										AUTORÍA SIN CÓDIGO (D2)
									</span>
								</div>
								<h2 className="font-semibold text-xl">
									Crear Nuevo Control Declarativo
								</h2>
								<p className="text-muted-foreground text-xs">
									Configura un nuevo control seleccionando el delito, tipo de
									evento y combinando señales con pesos y umbrales.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setIsAuthoringOpen(false)}
								className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleSaveControl} className="space-y-5 text-xs">
							{formError && (
								<div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-400">
									{formError}
								</div>
							)}

							{/* Nombre & Delito */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<label
										htmlFor="control-nombre-input"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Nombre del Control *
									</label>
									<input
										id="control-nombre-input"
										type="text"
										required
										placeholder="ej: Control de Licitaciones y Vínculos"
										value={nombre}
										onChange={(e) => setNombre(e.target.value)}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="control-delito-select"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Delito Supervisado *
									</label>
									<select
										id="control-delito-select"
										value={delito}
										onChange={(e) => setDelito(e.target.value)}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									>
										<option value="Corrupción entre particulares">
											Corrupción entre particulares (CP art. 287 bis)
										</option>
										<option value="Lavado de activos">
											Lavado de activos (Ley 19.913)
										</option>
										<option value="Cohecho a funcionario público">
											Cohecho a funcionario público (Ley 20.393)
										</option>
									</select>
								</div>
							</div>

							{/* Event Type & Umbrales */}
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="space-y-1.5">
									<label
										htmlFor="control-evento-select"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Tipo de Evento *
									</label>
									<select
										id="control-evento-select"
										value={eventoTipo}
										onChange={(e) =>
											setEventoTipo(
												e.target.value as "compra" | "pago" | "transferencia",
											)
										}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									>
										<option value="compra">Compra / Adquisición</option>
										<option value="pago">Pago / Desembolso</option>
										<option value="transferencia">
											Transferencia bancaria
										</option>
									</select>
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="control-umbral-alerta"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Umbral Disparo Alerta
									</label>
									<input
										id="control-umbral-alerta"
										type="number"
										step="0.05"
										min="0.1"
										max="1.0"
										value={umbralAlerta}
										onChange={(e) => setUmbralAlerta(Number(e.target.value))}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono font-semibold text-amber-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="control-umbral-media"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Umbral Riesgo Medio
									</label>
									<input
										id="control-umbral-media"
										type="number"
										step="0.05"
										min="0.2"
										max="0.8"
										value={umbralMedia}
										onChange={(e) => setUmbralMedia(Number(e.target.value))}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono font-semibold text-amber-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
								</div>

								<div className="space-y-1.5">
									<label
										htmlFor="control-umbral-alta"
										className="font-semibold text-[11px] text-muted-foreground uppercase"
									>
										Umbral Riesgo Alto
									</label>
									<input
										id="control-umbral-alta"
										type="number"
										step="0.05"
										min="0.3"
										max="1.0"
										value={umbralAlta}
										onChange={(e) => setUmbralAlta(Number(e.target.value))}
										className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono font-semibold text-red-400 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
									/>
								</div>
							</div>

							<div className="space-y-1.5">
								<label
									htmlFor="control-descripcion-input"
									className="font-semibold text-[11px] text-muted-foreground uppercase"
								>
									Descripción y Justificación del Control
								</label>
								<textarea
									id="control-descripcion-input"
									rows={2}
									placeholder="Describe la hipótesis delictiva y cómo este control mitiga el riesgo..."
									value={descripcion}
									onChange={(e) => setDescripcion(e.target.value)}
									className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
								/>
							</div>

							{/* Signals Picker with weights */}
							<div className="space-y-2 pt-2">
								<div className="flex items-center justify-between">
									<span className="font-semibold text-[11px] text-muted-foreground uppercase">
										Selección y Ponderación de Señales Reutilizables
									</span>
									<span className="text-[11px] text-muted-foreground">
										{Object.keys(selectedSenales).length} señales seleccionadas
									</span>
								</div>

								<div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
									{SENALES_CATALOGO.map((senal) => {
										const isSelected = selectedSenales[senal.id] !== undefined;
										const weight = selectedSenales[senal.id] ?? 0.25;

										return (
											<div
												key={senal.id}
												className={`flex flex-col justify-between gap-3 rounded-2xl border p-3 transition-all sm:flex-row sm:items-center ${
													isSelected
														? "border-amber-600/50 bg-amber-500/5"
														: "border-border bg-muted/10 opacity-70"
												}`}
											>
												<div className="flex min-w-0 items-start gap-2.5">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleToggleSenal(senal.id)}
														className="mt-0.5 cursor-pointer rounded accent-amber-600"
													/>
													<div className="min-w-0 space-y-0.5">
														<div className="flex items-center gap-2">
															<span
																className={`rounded px-1.5 py-0.2 font-mono font-semibold text-[9px] uppercase ${
																	senal.tipo === "intrinseca"
																		? "bg-blue-500/10 text-blue-400"
																		: "bg-purple-500/10 text-purple-400"
																}`}
															>
																{senal.tipo}
															</span>
															<span className="truncate font-medium text-foreground">
																{senal.nombre}
															</span>
														</div>
														<p className="line-clamp-1 text-[11px] text-muted-foreground">
															{senal.descripcion}
														</p>
													</div>
												</div>

												{isSelected && (
													<div className="flex shrink-0 items-center gap-2 sm:pl-4">
														<span className="text-[10px] text-muted-foreground uppercase">
															Peso:
														</span>
														<input
															type="number"
															step="0.05"
															min="0.05"
															max="1.0"
															value={weight}
															onChange={(e) =>
																handleWeightChange(
																	senal.id,
																	Number(e.target.value),
																)
															}
															className="w-16 rounded-xl border border-border bg-background px-2 py-1 text-center font-mono font-semibold text-amber-500 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
														/>
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex items-center justify-end gap-3 border-border border-t pt-4">
								<Button
									type="button"
									variant="ghost"
									onClick={() => setIsAuthoringOpen(false)}
									className="h-10 rounded-xl px-4 text-xs"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									className="h-10 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-6 font-medium text-white text-xs shadow-amber-900/20 shadow-md hover:from-yellow-500 hover:to-amber-600"
								>
									Guardar Control Declarativo
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
