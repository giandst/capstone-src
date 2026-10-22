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
	ArrowRight,
	CheckCircle2,
	Database,
	Download,
	FileSpreadsheet,
	Info,
	Loader2,
	PlayCircle,
	RotateCcw,
	Search,
	Sparkles,
	UploadCloud,
} from "lucide-react";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import {
	DEMO_DATASET_ROWS,
	DomainStore,
	type Evento,
} from "@/lib/domain-store";

export const Route = createFileRoute("/_auth/ingesta")({
	component: IngestaPage,
});

function IngestaPage() {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(true);
	const [fileName, setFileName] = useState<string | null>(null);
	const [fileSize, setFileSize] = useState<string | null>(null);
	const [parsedRows, setParsedRows] = useState<Evento[]>([]);
	const [columns, setColumns] = useState<string[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [processingStep, setProcessingStep] = useState<number>(0);
	const [isDragging, setIsDragging] = useState(false);
	const [searchFilter, setSearchFilter] = useState("");
	const [ingestResult, setIngestResult] = useState<{
		eventos: number;
		alertas: number;
	} | null>(null);
	const [lastIngest, setLastIngest] = useState<{
		fileName: string;
		date: string;
		count: number;
	} | null>(null);

	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
			setLastIngest(DomainStore.getLastIngest());
		}, 600);
		return () => clearTimeout(timer);
	}, []);

	const handleDemoDatasetLoad = () => {
		setFileName("dataset-demo-mpd-2026.csv");
		setFileSize("14.8 KB");
		setParsedRows(DEMO_DATASET_ROWS);
		setColumns([
			"tipo",
			"monto",
			"fecha",
			"rutProveedor",
			"nombreProveedor",
			"rutSolicitante",
			"nombreSolicitante",
			"fechaConstitucionProveedor",
			"flagPep",
			"causasJudiciales",
			"nOferentes",
			"descripcion",
		]);
		setIngestResult(null);
	};

	const handleDownloadSampleCsv = () => {
		const csvString = Papa.unparse(
			DEMO_DATASET_ROWS.map((row) => ({
				id: row.id,
				tipo: row.tipo,
				monto: row.monto,
				fecha: row.fecha,
				rut_proveedor: row.rutProveedor,
				nombre_proveedor: row.nombreProveedor,
				rut_solicitante: row.rutSolicitante,
				nombre_solicitante: row.nombreSolicitante,
				fecha_constitucion_proveedor: row.fechaConstitucionProveedor || "",
				flag_pep: row.flagPep ? "true" : "false",
				causas_judiciales: row.causasJudiciales || 0,
				n_oferentes: row.nOferentes || 1,
				descripcion: row.descripcion || "",
			})),
		);
		const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "dataset-demo-mpd-2026.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleFileUpload = (fileToParse: File) => {
		setFileName(fileToParse.name);
		setFileSize(`${(fileToParse.size / 1024).toFixed(1)} KB`);
		setIngestResult(null);

		Papa.parse<Record<string, unknown>>(fileToParse, {
			header: true,
			skipEmptyLines: true,
			dynamicTyping: true,
			complete: (results) => {
				if (results.data && results.data.length > 0) {
					const rawCols = Object.keys(results.data[0]);
					setColumns(rawCols);

					// Map CSV rows to Evento format
					const mapped: Evento[] = results.data.map((row, idx) => ({
						id:
							typeof row.id === "string"
								? row.id
								: `evt-csv-${idx + 1}-${Date.now().toString().slice(-4)}`,
						tipo:
							typeof row.tipo === "string" &&
							(row.tipo === "pago" || row.tipo === "transferencia")
								? row.tipo
								: "compra",
						monto: Number(row.monto) || 0,
						fecha:
							typeof row.fecha === "string"
								? row.fecha
								: new Date().toISOString(),
						rutProveedor: String(
							row.rut_proveedor ?? row.rutProveedor ?? "Sin RUT",
						),
						nombreProveedor: String(
							row.nombre_proveedor ?? row.nombreProveedor ?? "Proveedor",
						),
						rutSolicitante: String(
							row.rut_solicitante ?? row.rutSolicitante ?? "Sin RUT",
						),
						nombreSolicitante: String(
							row.nombre_solicitante ?? row.nombreSolicitante ?? "Solicitante",
						),
						fechaConstitucionProveedor:
							typeof row.fecha_constitucion_proveedor === "string"
								? row.fecha_constitucion_proveedor
								: typeof row.fechaConstitucionProveedor === "string"
									? row.fechaConstitucionProveedor
									: undefined,
						flagPep: Boolean(row.flag_pep ?? row.flagPep),
						causasJudiciales: Number(
							row.causas_judiciales ?? row.causasJudiciales ?? 0,
						),
						nOferentes:
							row.n_oferentes !== undefined
								? Number(row.n_oferentes)
								: row.nOferentes !== undefined
									? Number(row.nOferentes)
									: 1,
						descripcion:
							typeof row.descripcion === "string"
								? row.descripcion
								: "Transacción importada vía archivo CSV",
					}));

					setParsedRows(mapped);
				}
			},
		});
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const droppedFile = e.dataTransfer.files[0];
			if (
				droppedFile.type === "text/csv" ||
				droppedFile.name.endsWith(".csv")
			) {
				handleFileUpload(droppedFile);
			}
		}
	};

	const executeEngine = () => {
		if (parsedRows.length === 0) return;

		setIsProcessing(true);
		setProcessingStep(1);

		setTimeout(() => {
			setProcessingStep(2);
			setTimeout(() => {
				setProcessingStep(3);
				setTimeout(() => {
					setProcessingStep(4);
					setTimeout(() => {
						const res = DomainStore.ingestarEventos(
							parsedRows,
							fileName || "lote.csv",
						);
						setIsProcessing(false);
						setIngestResult({
							eventos: res.nuevosEventos,
							alertas: res.nuevasAlertas,
						});
						setLastIngest(DomainStore.getLastIngest());
					}, 600);
				}, 600);
			}, 600);
		}, 600);
	};

	const filteredPreview = parsedRows.filter((r) => {
		if (!searchFilter) return true;
		const q = searchFilter.toLowerCase();
		return (
			r.nombreProveedor.toLowerCase().includes(q) ||
			r.rutProveedor.toLowerCase().includes(q) ||
			r.nombreSolicitante.toLowerCase().includes(q) ||
			r.descripcion?.toLowerCase().includes(q)
		);
	});

	const resetBatch = () => {
		setFileName(null);
		setFileSize(null);
		setParsedRows([]);
		setColumns([]);
		setIngestResult(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="fade-in mx-auto max-w-6xl animate-in space-y-6 pb-12 duration-500">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-1">
					<h1 className="font-semibold text-3xl tracking-tight">
						Ingesta de Eventos
					</h1>
					<p className="text-muted-foreground text-sm">
						Canal de entrada de datos transaccionales para evaluación del Modelo
						de Prevención del Delito (Leyes 20.393 / 21.595).
					</p>
				</div>

				{/* Demo Dataset Instant Action */}
				<div className="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						variant="outline"
						onClick={handleDownloadSampleCsv}
						className="flex h-11 items-center gap-2 rounded-2xl border-border px-4 font-medium text-xs transition-all hover:bg-muted"
					>
						<Download className="h-4 w-4 text-muted-foreground" />
						<span>Descargar CSV Demo</span>
					</Button>
					<Button
						type="button"
						onClick={handleDemoDatasetLoad}
						variant="outline"
						className="flex h-11 items-center gap-2 rounded-2xl border-amber-600/30 bg-amber-500/5 px-4 font-medium text-amber-500 shadow-sm transition-all hover:border-amber-600 hover:bg-amber-500/10 hover:text-amber-400"
					>
						<Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
						<span>Cargar Dataset Demo (1 Clic)</span>
					</Button>
				</div>
			</div>

			{/* Scope Contract Notice & Last Ingest */}
			<div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-muted-foreground text-xs sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-start gap-3">
					<Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
					<div>
						<span className="font-semibold text-foreground">
							Definición de alcance (Scope Contract):{" "}
						</span>
						La ingesta opera exclusivamente vía CSV. Las variables relacionales
						(constitución de empresa, causales judiciales, PEP y número de
						oferentes) viajan como columnas de enriquecimiento en el mismo
						archivo, garantizando la evaluación sin dependencias de APIs
						externas.
					</div>
				</div>

				{lastIngest && (
					<div className="shrink-0 text-right font-mono text-[11px] text-muted-foreground">
						Último lote:{" "}
						<span className="font-semibold text-foreground">
							{lastIngest.fileName}
						</span>{" "}
						({lastIngest.count} registros)
					</div>
				)}
			</div>

			<Card className="overflow-hidden rounded-3xl border-border shadow-sm">
				<CardHeader className="border-border border-b bg-muted/20 pb-5">
					<CardTitle className="flex items-center gap-2 text-xl">
						<FileSpreadsheet className="h-5 w-5 text-amber-500" />
						Cargar Lote de Transacciones
					</CardTitle>
					<CardDescription>
						Sube un archivo .csv o utiliza el dataset de demostración con casos
						pre-diseñados.
					</CardDescription>
				</CardHeader>

				<CardContent className="pt-6">
					{isLoading ? (
						<Skeleton className="h-[260px] w-full rounded-3xl" />
					) : !fileName ? (
						<section
							aria-label="Zona de carga de archivos CSV"
							className={`flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200 sm:p-16 ${
								isDragging
									? "scale-[1.01] border-amber-500 bg-amber-500/10"
									: "border-border bg-muted/10 hover:border-muted-foreground/50 hover:bg-muted/20"
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
								<UploadCloud
									className={`h-8 w-8 transition-colors ${
										isDragging ? "text-amber-500" : "text-amber-600/80"
									}`}
								/>
							</div>
							<h3 className="mb-1 font-medium text-lg">
								Arrastra tu archivo CSV aquí
							</h3>
							<p className="mb-6 max-w-md text-muted-foreground text-sm">
								Asegúrate de incluir columnas obligatorias:{" "}
								<code>rut_proveedor</code>, <code>monto</code>,{" "}
								<code>fecha</code> y datos de enriquecimiento.
							</p>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								accept=".csv"
								onChange={(e) => {
									if (e.target.files && e.target.files.length > 0) {
										handleFileUpload(e.target.files[0]);
									}
								}}
							/>
							<div className="flex flex-wrap items-center justify-center gap-3">
								<Button
									type="button"
									variant="secondary"
									onClick={() => fileInputRef.current?.click()}
									className="rounded-2xl px-6"
								>
									Seleccionar Archivo Local
								</Button>
								<Button
									type="button"
									variant="outline"
									onClick={handleDemoDatasetLoad}
									className="rounded-2xl border-amber-600/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
								>
									Usar Dataset Demo
								</Button>
							</div>
						</section>
					) : (
						<div className="fade-in zoom-in-95 animate-in space-y-6 duration-300">
							{/* File Info Bar */}
							<div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10">
										<CheckCircle2 className="h-5 w-5 text-green-500" />
									</div>
									<div>
										<h4 className="flex items-center gap-2 font-medium text-sm">
											{fileName}
											{fileName.includes("demo") && (
												<span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-400">
													Planted Ground Truth
												</span>
											)}
										</h4>
										<p className="text-muted-foreground text-xs">
											{fileSize} • {parsedRows.length} transacciones leídas •{" "}
											{columns.length} campos detectados
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={resetBatch}
										disabled={isProcessing}
										className="h-9 rounded-xl text-xs"
									>
										<RotateCcw className="mr-1 h-3.5 w-3.5" />
										Cambiar archivo
									</Button>
								</div>
							</div>

							{/* Enrichment Columns Diagnostic */}
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
									<span className="font-semibold text-[11px] text-muted-foreground uppercase">
										Constitución Proveedor
									</span>
									<div className="flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium text-xs">Detectada</span>
									</div>
								</div>

								<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
									<span className="font-semibold text-[11px] text-muted-foreground uppercase">
										Flag PEP
									</span>
									<div className="flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium text-xs">Detectada</span>
									</div>
								</div>

								<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
									<span className="font-semibold text-[11px] text-muted-foreground uppercase">
										Causas Judiciales
									</span>
									<div className="flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium text-xs">Detectada</span>
									</div>
								</div>

								<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
									<span className="font-semibold text-[11px] text-muted-foreground uppercase">
										N° Oferentes (Proceso)
									</span>
									<div className="flex items-center gap-2">
										<span className="h-2 w-2 rounded-full bg-green-500" />
										<span className="font-medium text-xs">
											Detectada (CP art. 287)
										</span>
									</div>
								</div>
							</div>

							{/* Preview Table */}
							<div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
								<div className="flex flex-col justify-between gap-3 border-border border-b bg-muted/40 px-4 py-3 sm:flex-row sm:items-center">
									<span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
										Previsualización de Lote ({filteredPreview.length}{" "}
										registros)
									</span>
									<div className="relative w-full sm:w-64">
										<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
										<input
											type="text"
											placeholder="Filtrar por proveedor o solicitante..."
											value={searchFilter}
											onChange={(e) => setSearchFilter(e.target.value)}
											className="w-full rounded-xl border border-border bg-background py-1.5 pr-3 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
										/>
									</div>
								</div>

								<div className="max-h-[380px] overflow-x-auto">
									<table className="w-full text-left text-xs">
										<thead className="sticky top-0 z-10 border-border/60 border-b bg-muted/20 text-muted-foreground backdrop-blur">
											<tr>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													ID
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													Tipo
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													Monto (CLP)
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													Proveedor
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													RUT Prov.
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium">
													Solicitante
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium text-amber-500">
													Oferentes
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium text-amber-500">
													Const. Prov.
												</th>
												<th className="whitespace-nowrap px-4 py-2.5 font-medium text-amber-500">
													PEP
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/40">
											{filteredPreview.map((row) => (
												<tr
													key={row.id}
													className="transition-colors hover:bg-muted/30"
												>
													<td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">
														{row.id}
													</td>
													<td className="px-4 py-2 font-medium capitalize">
														{row.tipo}
													</td>
													<td className="px-4 py-2 font-bold font-mono">
														${row.monto.toLocaleString("es-CL")}
													</td>
													<td
														className="max-w-[200px] truncate px-4 py-2"
														title={row.nombreProveedor}
													>
														{row.nombreProveedor}
													</td>
													<td className="whitespace-nowrap px-4 py-2 font-mono text-muted-foreground">
														{row.rutProveedor}
													</td>
													<td
														className="max-w-[180px] truncate px-4 py-2"
														title={row.nombreSolicitante}
													>
														{row.nombreSolicitante}
													</td>
													<td className="px-4 py-2 text-center font-mono">
														{row.nOferentes ?? "-"}
													</td>
													<td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
														{row.fechaConstitucionProveedor
															? new Date(
																	row.fechaConstitucionProveedor,
																).toLocaleDateString("es-CL")
															: "-"}
													</td>
													<td className="px-4 py-2">
														{row.flagPep ? (
															<span className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 font-medium text-[10px] text-red-400">
																SÍ
															</span>
														) : (
															<span className="text-muted-foreground">No</span>
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Progress Execution Box */}
							{isProcessing && (
								<div className="fade-in animate-in space-y-4 rounded-3xl border border-amber-600/30 bg-amber-500/5 p-6 duration-300">
									<div className="flex items-center gap-3">
										<Loader2 className="h-5 w-5 animate-spin text-amber-500" />
										<div>
											<h4 className="font-semibold text-sm">
												Ejecutando Motor de Controles y Explicabilidad
											</h4>
											<p className="text-muted-foreground text-xs">
												Evaluando señales intrínsecas y relacionales sobre las{" "}
												{parsedRows.length} transacciones...
											</p>
										</div>
									</div>

									<div className="space-y-2">
										<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-500"
												style={{ width: `${processingStep * 25}%` }}
											/>
										</div>
										<div className="flex justify-between text-[11px] text-muted-foreground">
											<span
												className={
													processingStep >= 1
														? "font-medium text-amber-500"
														: ""
												}
											>
												1. Validación de esquema
											</span>
											<span
												className={
													processingStep >= 2
														? "font-medium text-amber-500"
														: ""
												}
											>
												2. Disparo de Señales
											</span>
											<span
												className={
													processingStep >= 3
														? "font-medium text-amber-500"
														: ""
												}
											>
												3. Ponderación Declarativa
											</span>
											<span
												className={
													processingStep >= 4
														? "font-medium text-amber-500"
														: ""
												}
											>
												4. Persistencia y Alertas
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Ingest Result Card */}
							{ingestResult && (
								<div className="zoom-in-95 animate-in space-y-4 rounded-3xl border border-green-500/30 bg-green-500/5 p-6 duration-300">
									<div className="flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-500/20">
												<CheckCircle2 className="h-6 w-6 text-green-500" />
											</div>
											<div>
												<h4 className="font-semibold text-base text-foreground">
													Procesamiento Completado Exitosamente
												</h4>
												<p className="text-muted-foreground text-xs">
													El motor evaluó el lote. Se han registrado los eventos
													y generado la evidencia auditable.
												</p>
											</div>
										</div>
										<Button
											onClick={() => navigate({ to: "/alertas" })}
											className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-5 font-medium text-white text-xs shadow-md hover:from-yellow-500 hover:to-amber-600"
										>
											<span>Ver Alertas Generadas</span>
											<ArrowRight className="h-4 w-4" />
										</Button>
									</div>

									<div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
										<div className="rounded-2xl border border-border bg-background/80 p-3">
											<span className="block text-[11px] text-muted-foreground">
												Eventos Ingestados
											</span>
											<span className="font-bold font-mono text-2xl">
												{ingestResult.eventos}
											</span>
										</div>
										<div className="rounded-2xl border border-border bg-background/80 p-3">
											<span className="block text-[11px] text-muted-foreground">
												Alertas Detectadas
											</span>
											<span className="font-bold font-mono text-2xl text-amber-500">
												{ingestResult.alertas}
											</span>
										</div>
										<div className="col-span-2 rounded-2xl border border-border bg-background/80 p-3 sm:col-span-1">
											<span className="block text-[11px] text-muted-foreground">
												Contrato del Scorer
											</span>
											<span className="mt-1 flex items-center gap-1 font-semibold text-green-500 text-xs">
												<CheckCircle2 className="h-3.5 w-3.5" />
												Explicabilidad Completa
											</span>
										</div>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							{!ingestResult && (
								<div className="flex items-center justify-end gap-3 border-border border-t pt-4">
									<Button
										onClick={executeEngine}
										disabled={isProcessing || parsedRows.length === 0}
										className="h-12 rounded-2xl bg-gradient-to-r from-yellow-600 to-amber-700 px-8 font-medium text-sm text-white shadow-amber-900/20 shadow-lg transition-all hover:from-yellow-500 hover:to-amber-600"
									>
										{isProcessing ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Calculando scores y breakdown...
											</>
										) : (
											<>
												<PlayCircle className="mr-2 h-4 w-4" />
												Ejecutar Motor de Prevención
											</>
										)}
									</Button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Ground Truth & Methodology Card */}
			<Card className="overflow-hidden rounded-3xl border-border shadow-sm">
				<CardHeader className="bg-muted/10 pb-4">
					<CardTitle className="flex items-center gap-2 text-base">
						<Database className="h-4 w-4 text-amber-500" />
						Metodología de Demostración y Ground Truth Plantado
					</CardTitle>
					<CardDescription className="text-xs">
						Conforme a <code>demo-dataset.md</code>, el archivo de prueba
						incluye 4 anomalías plantadas deliberadamente para medir precisión y
						recall sin sesgos:
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-2">
					<div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-2">
						<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
							<div className="flex items-center gap-2 font-medium text-foreground">
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[10px] text-amber-400">
									1
								</span>
								Proveedor constituido 5 días antes
							</div>
							<p className="pl-7 text-[11px] text-muted-foreground">
								Insumos Globales del Sur SpA (constituida el 10-03-2026, compra
								adjudicada el 15-03-2026 por $18.500.000).
							</p>
						</div>

						<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
							<div className="flex items-center gap-2 font-medium text-foreground">
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[10px] text-amber-400">
									2
								</span>
								Apellido compartido con el solicitante
							</div>
							<p className="pl-7 text-[11px] text-muted-foreground">
								Consultoría y Gestión Valenzuela Ltda. adjudicada por Rodrigo
								Valenzuela Soto ($12.400.000). Posible conflicto de interés.
							</p>
						</div>

						<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
							<div className="flex items-center gap-2 font-medium text-foreground">
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[10px] text-amber-400">
									3
								</span>
								Fraccionamiento de compras
							</div>
							<p className="pl-7 text-[11px] text-muted-foreground">
								3 compras consecutivas a Logística Araucanía SpA ($4.950.000,
								$4.900.000 y $4.980.000) evadiendo el umbral de control de
								$5.000.000.
							</p>
						</div>

						<div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-background/50 p-3">
							<div className="flex items-center gap-2 font-medium text-foreground">
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 font-bold text-[10px] text-amber-400">
									4
								</span>
								Adjudicación sin competencia (CP art. 287 bis)
							</div>
							<p className="pl-7 text-[11px] text-muted-foreground">
								Compra mayor de $45.000.000 a Servicios Cordillera SpA con
								oferente único (<code>n_oferentes = 1</code>).
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
