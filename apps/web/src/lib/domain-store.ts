// Domain store and evaluation engine adhering to BMAD SPEC and scope contract.
// Business and domain terminology is strictly maintained in Spanish.

export interface Evento {
	id: string;
	tipo: "compra" | "pago" | "transferencia";
	monto: number;
	fecha: string;
	rutProveedor: string;
	nombreProveedor: string;
	rutSolicitante: string;
	nombreSolicitante: string;
	fechaConstitucionProveedor?: string;
	flagPep?: boolean;
	causasJudiciales?: number;
	nOferentes?: number;
	descripcion?: string;
}

export interface BreakdownItem {
	senalId: string;
	nombre: string;
	tipo: "intrinseca" | "relacional";
	disparada: boolean;
	peso: number;
	contribucion: number;
	detalle: string;
}

export interface Alerta {
	id: string;
	eventoId: string;
	controlId: string;
	controlNombre: string;
	delito: string;
	score: number;
	banda: "baja" | "media" | "alta";
	breakdown: BreakdownItem[];
	estado:
		| "abierta"
		| "en_revision"
		| "descartada"
		| "escalada"
		| "promovida_a_caso";
	motivoDescarte?: string;
	motivoEscalamiento?: string;
	revisadoPor?: string;
	fechaRevision?: string;
	createdAt: string;
	evento: Evento;
}

export interface Caso {
	id: string;
	alertaId: string;
	alerta: Alerta;
	estado: "investigacion" | "cerrado";
	justificacion?: string;
	encargadoId?: string;
	encargadoNombre?: string;
	createdAt: string;
	closedAt?: string;
}

export interface SenalConfig {
	id: string;
	nombre: string;
	tipo: "intrinseca" | "relacional";
	peso: number;
	descripcion: string;
}

export interface Control {
	id: string;
	nombre: string;
	descripcion: string;
	delito: string;
	eventoTipo: "compra" | "pago" | "transferencia";
	configuracion: {
		umbrales: {
			baja: number;
			media: number;
			alta: number;
			alerta: number;
		};
		senales: SenalConfig[];
	};
	version: string;
	createdAt: string;
}

// Initial declarative controls according to SPEC
export const INITIAL_CONTROLES: Control[] = [
	{
		id: "ctrl-corrupcion-adquisiciones",
		nombre: "Control Preventivo de Corrupción en Adquisiciones",
		descripcion:
			"Detecta conductas típicas de favorecimiento ilícito a oferentes (Ley 21.121, CP art. 287 bis) combinando señales de competencia, constitución reciente y parentesco.",
		delito: "Corrupción entre particulares",
		eventoTipo: "compra",
		configuracion: {
			umbrales: {
				baja: 0.0,
				media: 0.45,
				alta: 0.7,
				alerta: 0.4,
			},
			senales: [
				{
					id: "adjudicacion_sin_competencia",
					nombre: "Adjudicación sin competencia (n_oferentes = 1)",
					tipo: "intrinseca",
					peso: 0.35,
					descripcion:
						"Lee n_oferentes en montos relevantes; elemento típico del art. 287 bis.",
				},
				{
					id: "proveedor_recientemente_constituido",
					nombre: "Proveedor constituido recientemente (< 30 días)",
					tipo: "relacional",
					peso: 0.25,
					descripcion: "Empresas creadas pocos días antes de la adjudicación.",
				},
				{
					id: "apellido_compartido",
					nombre: "Apellido compartido con solicitante",
					tipo: "relacional",
					peso: 0.25,
					descripcion: "Posible vínculo de parentesco o conflicto de interés.",
				},
				{
					id: "fraccionamiento",
					nombre: "Fraccionamiento de compras",
					tipo: "intrinseca",
					peso: 0.15,
					descripcion:
						"Múltiples compras justo bajo el umbral de aprobación ejecutiva ($5.000.000).",
				},
			],
		},
		version: "v1.0-ratificada",
		createdAt: "2026-03-01T00:00:00Z",
	},
	{
		id: "ctrl-lavado-pagos",
		nombre: "Control de Señales de Lavado de Activos y Transferencias",
		descripcion:
			"Supervisa transferencias y compras con concentración de alertas en listas PEP y causas judiciales (Ley 19.913).",
		delito: "Lavado de activos",
		eventoTipo: "compra",
		configuracion: {
			umbrales: {
				baja: 0.0,
				media: 0.4,
				alta: 0.65,
				alerta: 0.4,
			},
			senales: [
				{
					id: "fraccionamiento",
					nombre: "Fraccionamiento de compras / pagos",
					tipo: "intrinseca",
					peso: 0.4,
					descripcion:
						"Reutilización de señal: dispersión de montos bajo umbrales.",
				},
				{
					id: "flag_pep",
					nombre: "Persona Expuesta Políticamente (PEP) involucrada",
					tipo: "relacional",
					peso: 0.35,
					descripcion:
						"Contraparte clasificada con exposición política según columna de enriquecimiento.",
				},
				{
					id: "causas_judiciales",
					nombre: "Causas judiciales pendientes",
					tipo: "relacional",
					peso: 0.25,
					descripcion:
						"Antecedentes penales o civiles registrados en la contraparte.",
				},
			],
		},
		version: "v1.0-ratificada",
		createdAt: "2026-03-01T00:00:00Z",
	},
];

// Demo dataset with planted cases from demo-dataset.md + bulking clean purchases
export const DEMO_DATASET_ROWS: Evento[] = [
	// 1. Planta 1: Proveedor constituido 5 días antes de la compra
	{
		id: "evt-001",
		tipo: "compra",
		monto: 18500000,
		fecha: "2026-03-15T11:20:00Z",
		rutProveedor: "77.412.981-K",
		nombreProveedor: "Insumos Globales del Sur SpA",
		rutSolicitante: "14.521.890-3",
		nombreSolicitante: "Andrea Morales Rivera",
		fechaConstitucionProveedor: "2026-03-10T00:00:00Z", // 5 días antes!
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 2,
		descripcion: "Adquisición de insumos industriales de alta rotación",
	},
	// 2. Planta 2: Apellido compartido con solicitante
	{
		id: "evt-002",
		tipo: "compra",
		monto: 12400000,
		fecha: "2026-03-18T15:45:00Z",
		rutProveedor: "76.892.114-5",
		nombreProveedor: "Consultoría y Gestión Valenzuela Limitada",
		rutSolicitante: "16.321.455-8",
		nombreSolicitante: "Rodrigo Valenzuela Soto", // Comparte "Valenzuela"
		fechaConstitucionProveedor: "2022-01-15T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 3,
		descripcion: "Servicio de asesoría en optimización de procesos operativos",
	},
	// 3. Planta 3: Fraccionamiento (3 compras consecutivas justo bajo el umbral de $5.000.000)
	{
		id: "evt-003",
		tipo: "compra",
		monto: 4950000,
		fecha: "2026-03-20T09:15:00Z",
		rutProveedor: "76.543.210-9",
		nombreProveedor: "Logística y Transportes Araucanía SpA",
		rutSolicitante: "15.654.321-2",
		nombreSolicitante: "Gonzalo Miranda Pino",
		fechaConstitucionProveedor: "2021-06-11T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 3,
		descripcion: "Transporte de carga lote norte - tramo 1",
	},
	{
		id: "evt-004",
		tipo: "compra",
		monto: 4900000,
		fecha: "2026-03-20T14:30:00Z",
		rutProveedor: "76.543.210-9",
		nombreProveedor: "Logística y Transportes Araucanía SpA",
		rutSolicitante: "15.654.321-2",
		nombreSolicitante: "Gonzalo Miranda Pino",
		fechaConstitucionProveedor: "2021-06-11T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 3,
		descripcion: "Transporte de carga lote norte - tramo 2",
	},
	{
		id: "evt-005",
		tipo: "compra",
		monto: 4980000,
		fecha: "2026-03-21T10:00:00Z",
		rutProveedor: "76.543.210-9",
		nombreProveedor: "Logística y Transportes Araucanía SpA",
		rutSolicitante: "15.654.321-2",
		nombreSolicitante: "Gonzalo Miranda Pino",
		fechaConstitucionProveedor: "2021-06-11T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 3,
		descripcion: "Transporte de carga lote norte - tramo 3 (fraccionamiento)",
	},
	// 4. Planta 4: Adjudicación sin competencia (n_oferentes = 1 en compra mayor)
	{
		id: "evt-006",
		tipo: "compra",
		monto: 45000000,
		fecha: "2026-03-22T16:00:00Z",
		rutProveedor: "77.982.341-2",
		nombreProveedor: "Servicios Tecnológicos Cordillera SpA",
		rutSolicitante: "13.987.654-1",
		nombreSolicitante: "Felipe Castro Reyes",
		fechaConstitucionProveedor: "2020-04-12T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 1, // Oferente único
		descripcion:
			"Renovación integral de infraestructura de servidores y conectividad",
	},
	// Bulking clean compras para evaluación real de precisión
	{
		id: "evt-007",
		tipo: "compra",
		monto: 1200000,
		fecha: "2026-03-12T10:00:00Z",
		rutProveedor: "76.123.456-7",
		nombreProveedor: "Librería y Papelería Central SpA",
		rutSolicitante: "17.456.789-0",
		nombreSolicitante: "Claudia Sepúlveda Rojas",
		fechaConstitucionProveedor: "2012-08-20T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 5,
		descripcion: "Útiles de oficina y materiales para gerencia general",
	},
	{
		id: "evt-008",
		tipo: "compra",
		monto: 3400000,
		fecha: "2026-03-14T12:30:00Z",
		rutProveedor: "78.654.321-K",
		nombreProveedor: "Maestranza El Roble Ltda",
		rutSolicitante: "12.345.678-9",
		nombreSolicitante: "Jorge Tapia Henríquez",
		fechaConstitucionProveedor: "2015-03-11T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 4,
		descripcion: "Mantención preventiva y correctiva de generadores diésel",
	},
	{
		id: "evt-009",
		tipo: "compra",
		monto: 2100000,
		fecha: "2026-03-16T09:00:00Z",
		rutProveedor: "76.999.888-1",
		nombreProveedor: "Distribuidora Tech Chile SpA",
		rutSolicitante: "18.234.567-8",
		nombreSolicitante: "Marcela Fuentes Lagos",
		fechaConstitucionProveedor: "2018-11-05T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 4,
		descripcion: "Licenciamiento anual de herramientas ofimáticas",
	},
	{
		id: "evt-010",
		tipo: "compra",
		monto: 8900000,
		fecha: "2026-03-19T17:10:00Z",
		rutProveedor: "79.112.233-4",
		nombreProveedor: "Guardias del Maipo Seguridad SpA",
		rutSolicitante: "11.223.344-5",
		nombreSolicitante: "Patricio Díaz Vera",
		fechaConstitucionProveedor: "2016-05-19T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 3,
		descripcion:
			"Servicio de vigilancia y control de acceso edificio corporativo",
	},
	{
		id: "evt-011",
		tipo: "compra",
		monto: 950000,
		fecha: "2026-03-21T13:40:00Z",
		rutProveedor: "76.443.322-9",
		nombreProveedor: "Banquetes San Cristóbal Ltda",
		rutSolicitante: "15.987.654-3",
		nombreSolicitante: "Carolina Baeza Urzúa",
		fechaConstitucionProveedor: "2019-09-02T00:00:00Z",
		flagPep: false,
		causasJudiciales: 0,
		nOferentes: 4,
		descripcion: "Catering para jornada anual de inducción laboral",
	},
];

// Evaluator: computes explainable score according to BMAD contract
export function evaluateEventos(
	eventos: Evento[],
	controles: Control[],
): Alerta[] {
	const alertas: Alerta[] = [];

	// Group events by provider to detect fraccionamiento
	const eventsByProvider = new Map<string, Evento[]>();
	for (const evt of eventos) {
		const list = eventsByProvider.get(evt.rutProveedor) || [];
		list.push(evt);
		eventsByProvider.set(evt.rutProveedor, list);
	}

	for (const evt of eventos) {
		for (const ctrl of controles) {
			if (ctrl.eventoTipo !== evt.tipo) continue;

			const breakdown: BreakdownItem[] = [];
			let totalWeightedScore = 0;
			let totalWeight = 0;

			for (const senal of ctrl.configuracion.senales) {
				let fired = false;
				let detalle = "No se detectaron condiciones de alerta para esta señal.";

				if (senal.id === "adjudicacion_sin_competencia") {
					// CP art. 287 bis: compra grande adjudicada con oferente único
					if ((evt.nOferentes ?? 0) === 1 && evt.monto >= 10000000) {
						fired = true;
						detalle = `Compra por $${evt.monto.toLocaleString("es-CL")} adjudicada con un único oferente (n_oferentes = 1). Sin competencia efectiva.`;
					}
				} else if (senal.id === "proveedor_recientemente_constituido") {
					if (evt.fechaConstitucionProveedor) {
						const fechaCompra = new Date(evt.fecha).getTime();
						const fechaConst = new Date(
							evt.fechaConstitucionProveedor,
						).getTime();
						const diffDays = Math.round(
							(fechaCompra - fechaConst) / (1000 * 60 * 60 * 24),
						);
						if (diffDays >= 0 && diffDays <= 30) {
							fired = true;
							detalle = `Proveedor constituido hace sólo ${diffDays} días antes de la transacción (umbral máximo permitido: 30 días).`;
						}
					}
				} else if (senal.id === "apellido_compartido") {
					const nombreSolWords = evt.nombreSolicitante
						.toLowerCase()
						.split(/\s+/)
						.filter((w) => w.length > 3);
					const provWords = evt.nombreProveedor
						.toLowerCase()
						.split(/\s+/)
						.filter((w) => w.length > 3);

					const matchedSurname = nombreSolWords.find((w) =>
						provWords.includes(w),
					);
					if (matchedSurname) {
						fired = true;
						const apellidoCapitalized =
							matchedSurname.charAt(0).toUpperCase() + matchedSurname.slice(1);
						detalle = `Coincidencia de apellido '${apellidoCapitalized}' entre el solicitante (${evt.nombreSolicitante}) y la razón social del proveedor. Posible conflicto de interés.`;
					}
				} else if (senal.id === "fraccionamiento") {
					const providerEvents = eventsByProvider.get(evt.rutProveedor) || [];
					// 3 or more purchases near threshold ($4M - $5M)
					const nearThreshold = providerEvents.filter(
						(e) => e.monto >= 4000000 && e.monto < 5000000,
					);
					if (
						nearThreshold.length >= 3 &&
						evt.monto >= 4000000 &&
						evt.monto < 5000000
					) {
						fired = true;
						detalle = `Detección de fraccionamiento: ${nearThreshold.length} compras consecutivas justo bajo el umbral de control ($5.000.000) emitidas hacia el mismo proveedor.`;
					}
				} else if (senal.id === "flag_pep") {
					if (evt.flagPep) {
						fired = true;
						detalle =
							"El proveedor o beneficiario figura clasificado como Persona Expuesta Políticamente (PEP).";
					}
				} else if (senal.id === "causas_judiciales") {
					if ((evt.causasJudiciales ?? 0) > 0) {
						fired = true;
						detalle = `El proveedor registra ${evt.causasJudiciales} causas judiciales vigentes en registros públicos.`;
					}
				}

				const contribucion = fired ? Number((senal.peso * 1.0).toFixed(3)) : 0;
				totalWeightedScore += contribucion;
				totalWeight += senal.peso;

				breakdown.push({
					senalId: senal.id,
					nombre: senal.nombre,
					tipo: senal.tipo,
					disparada: fired,
					peso: senal.peso,
					contribucion,
					detalle,
				});
			}

			// Normalized score (0 to 1)
			const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
			const score = Number(rawScore.toFixed(2));

			// Determine probability band
			let banda: "baja" | "media" | "alta" = "baja";
			if (score >= ctrl.configuracion.umbrales.alta) {
				banda = "alta";
			} else if (score >= ctrl.configuracion.umbrales.media) {
				banda = "media";
			}

			// Raise alert if score meets alert threshold or if high priority signals fired
			if (score >= ctrl.configuracion.umbrales.alerta || score >= 0.4) {
				alertas.push({
					id: `alt-${evt.id}-${ctrl.id.slice(0, 8)}`,
					eventoId: evt.id,
					controlId: ctrl.id,
					controlNombre: ctrl.nombre,
					delito: ctrl.delito,
					score,
					banda,
					breakdown,
					estado: "abierta",
					createdAt: new Date().toISOString(),
					evento: evt,
				});
			}
		}
	}

	return alertas;
}

// Storage helpers
const STORAGE_KEYS = {
	EVENTOS: "mpd_eventos_v1",
	ALERTAS: "mpd_alertas_v1",
	CASOS: "mpd_casos_v1",
	CONTROLES: "mpd_controles_v1",
	LAST_INGEST: "mpd_last_ingest_v1",
};

export const DomainStore = {
	getControles(): Control[] {
		if (typeof window === "undefined") return INITIAL_CONTROLES;
		const data = localStorage.getItem(STORAGE_KEYS.CONTROLES);
		if (!data) {
			localStorage.setItem(
				STORAGE_KEYS.CONTROLES,
				JSON.stringify(INITIAL_CONTROLES),
			);
			return INITIAL_CONTROLES;
		}
		try {
			return JSON.parse(data);
		} catch {
			return INITIAL_CONTROLES;
		}
	},

	saveControl(newControl: Control) {
		const controles = this.getControles();
		const index = controles.findIndex((c) => c.id === newControl.id);
		if (index >= 0) {
			controles[index] = newControl;
		} else {
			controles.push(newControl);
		}
		localStorage.setItem(STORAGE_KEYS.CONTROLES, JSON.stringify(controles));
		window.dispatchEvent(new Event("mpd_store_updated"));
	},

	getEventos(): Evento[] {
		if (typeof window === "undefined") return [];
		const data = localStorage.getItem(STORAGE_KEYS.EVENTOS);
		if (!data) return [];
		try {
			return JSON.parse(data);
		} catch {
			return [];
		}
	},

	getAlertas(): Alerta[] {
		if (typeof window === "undefined") return [];
		const data = localStorage.getItem(STORAGE_KEYS.ALERTAS);
		if (!data) return [];
		try {
			return JSON.parse(data);
		} catch {
			return [];
		}
	},

	getCasos(): Caso[] {
		if (typeof window === "undefined") return [];
		const data = localStorage.getItem(STORAGE_KEYS.CASOS);
		if (!data) return [];
		try {
			return JSON.parse(data);
		} catch {
			return [];
		}
	},

	getLastIngest(): { fileName: string; date: string; count: number } | null {
		if (typeof window === "undefined") return null;
		const data = localStorage.getItem(STORAGE_KEYS.LAST_INGEST);
		if (!data) return null;
		try {
			return JSON.parse(data);
		} catch {
			return null;
		}
	},

	ingestarEventos(
		eventos: Evento[],
		fileName = "demo-dataset-mpd.csv",
	): { nuevosEventos: number; nuevasAlertas: number } {
		const controles = this.getControles();
		const existingEventos = this.getEventos();
		const existingAlertas = this.getAlertas();

		// Deduplicate or append
		const existingIds = new Set(existingEventos.map((e) => e.id));
		const toAdd = eventos.filter((e) => !existingIds.has(e.id));
		const allEventos = [...existingEventos, ...toAdd];

		// Evaluate over newly ingested events
		const generatedAlertas = evaluateEventos(
			toAdd.length > 0 ? toAdd : eventos,
			controles,
		);

		const existingAlertIds = new Set(existingAlertas.map((a) => a.id));
		const alertsToAdd = generatedAlertas.filter(
			(a) => !existingAlertIds.has(a.id),
		);
		const allAlertas = [...existingAlertas, ...alertsToAdd];

		localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(allEventos));
		localStorage.setItem(STORAGE_KEYS.ALERTAS, JSON.stringify(allAlertas));
		localStorage.setItem(
			STORAGE_KEYS.LAST_INGEST,
			JSON.stringify({
				fileName,
				date: new Date().toISOString(),
				count: eventos.length,
			}),
		);

		window.dispatchEvent(new Event("mpd_store_updated"));
		return {
			nuevosEventos: toAdd.length > 0 ? toAdd.length : eventos.length,
			nuevasAlertas:
				alertsToAdd.length > 0 ? alertsToAdd.length : generatedAlertas.length,
		};
	},

	updateAlerta(alertaId: string, updates: Partial<Alerta>) {
		const alertas = this.getAlertas();
		const idx = alertas.findIndex((a) => a.id === alertaId);
		if (idx >= 0) {
			alertas[idx] = { ...alertas[idx], ...updates };
			localStorage.setItem(STORAGE_KEYS.ALERTAS, JSON.stringify(alertas));
			window.dispatchEvent(new Event("mpd_store_updated"));
		}
	},

	promoverACaso(alertaId: string, actorNombre: string): Caso | null {
		const alertas = this.getAlertas();
		const alerta = alertas.find((a) => a.id === alertaId);
		if (!alerta) return null;

		alerta.estado = "promovida_a_caso";
		this.updateAlerta(alertaId, { estado: "promovida_a_caso" });

		const casos = this.getCasos();
		const newCaso: Caso = {
			id: `caso-${Date.now().toString().slice(-6)}`,
			alertaId: alerta.id,
			alerta,
			estado: "investigacion",
			encargadoNombre: actorNombre,
			createdAt: new Date().toISOString(),
		};

		casos.unshift(newCaso);
		localStorage.setItem(STORAGE_KEYS.CASOS, JSON.stringify(casos));
		window.dispatchEvent(new Event("mpd_store_updated"));
		return newCaso;
	},

	cerrarCasoConJustificacion(
		casoId: string,
		justificacion: string,
		actorNombre: string,
		actorId?: string,
	): boolean {
		const casos = this.getCasos();
		const idx = casos.findIndex((c) => c.id === casoId);
		if (idx < 0) return false;

		casos[idx].estado = "cerrado";
		casos[idx].justificacion = justificacion;
		casos[idx].encargadoId = actorId || "usr-current";
		casos[idx].encargadoNombre = actorNombre;
		casos[idx].closedAt = new Date().toISOString();

		localStorage.setItem(STORAGE_KEYS.CASOS, JSON.stringify(casos));
		window.dispatchEvent(new Event("mpd_store_updated"));
		return true;
	},

	resetStore() {
		localStorage.removeItem(STORAGE_KEYS.EVENTOS);
		localStorage.removeItem(STORAGE_KEYS.ALERTAS);
		localStorage.removeItem(STORAGE_KEYS.CASOS);
		localStorage.setItem(
			STORAGE_KEYS.CONTROLES,
			JSON.stringify(INITIAL_CONTROLES),
		);
		localStorage.removeItem(STORAGE_KEYS.LAST_INGEST);
		window.dispatchEvent(new Event("mpd_store_updated"));
	},
};
