/**
 * UAM ReportHub - Initial Dataset
 * Incluye Departamentos y Municipios de Nicaragua, Facultades, Carreras,
 * Tipos de Denuncia, Categorías, Usuarios con Roles y Casos Demostrativos.
 */

export const INITIAL_DEPARTAMENTOS = [
  {
    id: "dep-01",
    nombre: "Managua",
    municipios: [
      "Managua (Distrito I - VII)",
      "Ciudad Sandino",
      "Tipitapa",
      "Mateare",
      "San Rafael del Sur",
      "Villa El Carmen",
      "El Crucero",
      "Ticuantepe",
      "San Francisco Libre"
    ]
  },
  {
    id: "dep-02",
    nombre: "León",
    municipios: [
      "León",
      "Nagarote",
      "La Paz Centro",
      "Telica",
      "Quezalguaque",
      "Larreynaga (Malpaisillo)",
      "El Sauce",
      "Achuapa",
      "El Jicaral",
      "Santa Rosa del Peñón"
    ]
  },
  {
    id: "dep-03",
    nombre: "Chinandega",
    municipios: [
      "Chinandega",
      "El Viejo",
      "Corinto",
      "Chichigalpa",
      "Posoltega",
      "El Realejo",
      "Puerto Morazán",
      "Somotillo",
      "Villanueva",
      "Santo Tomás del Norte",
      "Cinco Pinos",
      "San Pedro del Norte",
      "San Francisco del Norte"
    ]
  },
  {
    id: "dep-04",
    nombre: "Masaya",
    municipios: [
      "Masaya",
      "Nindirí",
      "Tisma",
      "Catarina",
      "San Juan de Oriente",
      "Niquinohomo",
      "Nandasmo",
      "Masatepe",
      "La Concepción"
    ]
  },
  {
    id: "dep-05",
    nombre: "Granada",
    municipios: [
      "Granada",
      "Diriomo",
      "Diriá",
      "Nandaime"
    ]
  },
  {
    id: "dep-06",
    nombre: "Carazo",
    municipios: [
      "Jinotepe",
      "Diriamba",
      "San Marcos",
      "Santa Teresa",
      "Dolores",
      "El Rosario",
      "La Paz de Carazo",
      "La Conquista"
    ]
  },
  {
    id: "dep-07",
    nombre: "Rivas",
    municipios: [
      "Rivas",
      "San Jorge",
      "Buenos Aires",
      "Potosí",
      "Belén",
      "Tola",
      "San Juan del Sur",
      "Cárdenas",
      "Moyogalpa (Ometepe)",
      "Altagracia (Ometepe)"
    ]
  },
  {
    id: "dep-08",
    nombre: "Matagalpa",
    municipios: [
      "Matagalpa",
      "Sébaco",
      "San Isidro",
      "Ciudad Darío",
      "Esquipulas",
      "San Ramón",
      "San Dionisio",
      "Muy Muy",
      "Matiguás",
      "Río Blanco",
      "Rancho Grande",
      "El Tuma - La Dalia",
      "Terrabona"
    ]
  },
  {
    id: "dep-09",
    nombre: "Jinotega",
    municipios: [
      "Jinotega",
      "San Rafael del Norte",
      "La Concordia",
      "San Sebastián de Yalí",
      "Santa María de Pantasma",
      "Wiwilí de Jinotega",
      "El Cuá",
      "San José de Bocay"
    ]
  },
  {
    id: "dep-10",
    nombre: "Estelí",
    municipios: [
      "Estelí",
      "Condega",
      "Pueblo Nuevo",
      "San Juan de Limay",
      "La Trinidad",
      "San Nicolás"
    ]
  },
  {
    id: "dep-11",
    nombre: "Madriz",
    municipios: [
      "Somoto",
      "San Lucas",
      "Totogalpa",
      "Telpaneca",
      "San Juan de Río Coco",
      "Palacagüina",
      "Yalagüina",
      "Las Sabanas",
      "San José de Cusmapa"
    ]
  },
  {
    id: "dep-12",
    nombre: "Nueva Segovia",
    municipios: [
      "Ocotal",
      "Jalapa",
      "Jícaro",
      "Quilalí",
      "San Fernando",
      "Mozonte",
      "Dipilto",
      "Ciudad Antigua",
      "Macuelizo",
      "Santa María",
      "Wiwilí de Nueva Segovia",
      "Murra"
    ]
  },
  {
    id: "dep-13",
    nombre: "Boaco",
    municipios: [
      "Boaco",
      "Camoapa",
      "San Lorenzo",
      "Teustepe",
      "San José de los Remates",
      "Santa Lucía"
    ]
  },
  {
    id: "dep-14",
    nombre: "Chontales",
    municipios: [
      "Juigalpa",
      "Acoyapa",
      "Santo Tomás",
      "Villa Sandino",
      "San Pedro de Lóvago",
      "La Libertad",
      "Santo Domingo",
      "Comalapa",
      "San Francisco de Cuapa",
      "El Coral"
    ]
  },
  {
    id: "dep-15",
    nombre: "Río San Juan",
    municipios: [
      "San Carlos",
      "El Castillo",
      "San Miguelito",
      "Morrito",
      "San Juan de Nicaragua",
      "El Almendro"
    ]
  },
  {
    id: "dep-16",
    nombre: "Costa Caribe Norte (RACCN)",
    municipios: [
      "Puerto Cabezas (Bilwi)",
      "Waspam",
      "Siuna",
      "Rosita",
      "Bonanza",
      "Prinzapolka",
      "Mulukukú",
      "Waslala"
    ]
  },
  {
    id: "dep-17",
    nombre: "Costa Caribe Sur (RACCS)",
    municipios: [
      "Bluefields",
      "Corn Island",
      "El Rama",
      "La Cruz de Río Grande",
      "Laguna de Perlas",
      "Kukra Hill",
      "Desembocadura de Río Grande",
      "El Tortuguero",
      "Paiwas"
    ]
  }
];

export const INITIAL_FACULTADES = [
  {
    id: "fac-med",
    nombre: "Facultad de Ciencias Médicas",
    carreras: [
      "Doctor en Medicina y Cirugía",
      "Licenciatura en Nutrición y Dietética",
      "Especialidad en Cirugía General",
      "Especialidad en Pediatría",
      "Especialidad en Ginecología y Obstetricia",
      "Maestría en Salud Pública y Epidemiología"
    ]
  },
  {
    id: "fac-odon",
    nombre: "Facultad de Odontología",
    carreras: [
      "Doctor en Cirugía Dental",
      "Especialidad en Ortodoncia y Ortopedia Maxilofacial",
      "Especialidad en Endodoncia",
      "Especialidad en Periodoncia e Implantología"
    ]
  },
  {
    id: "fac-ing",
    nombre: "Facultad de Ingeniería y Arquitectura",
    carreras: [
      "Ingeniería en Sistemas de Información",
      "Ingeniería Industrial y de Sistemas",
      "Ingeniería Civil",
      "Arquitectura y Urbanismo"
    ]
  },
  {
    id: "fac-jur",
    nombre: "Facultad de Ciencias Jurídicas y Sociales",
    carreras: [
      "Licenciatura en Derecho",
      "Licenciatura en Relaciones Internacionales",
      "Maestría en Derecho Corporativo y Arbitraje"
    ]
  },
  {
    id: "fac-adm",
    nombre: "Facultad de Ciencias Administrativas y Económicas",
    carreras: [
      "Licenciatura en Administración de Empresas",
      "Licenciatura en Finanzas y Contabilidad",
      "Licenciatura en Economía Empresarial",
      "Licenciatura en Negocios Internacionales"
    ]
  },
  {
    id: "fac-mkt",
    nombre: "Facultad de Marketing y Comunicación",
    carreras: [
      "Licenciatura en Marketing y Publicidad Digital",
      "Licenciatura en Comunicación y Relaciones Públicas",
      "Licenciatura en Diseño y Comunicación Visual"
    ]
  }
];

export const INITIAL_CATEGORIAS = [
  "Académica y Evaluación",
  "Convivencia y Disciplina",
  "Servicios y Atención Universitaria",
  "Ética y Conducta Universitaria",
  "Gestión Administrativa y Financiera"
];

export const INITIAL_TIPOS_DENUNCIA = [
  "Inconformidad con Calificación o Examen",
  "Incumplimiento de Programa Académico o Docente",
  "Trato Irrespetuoso o Acoso en Aula",
  "Retraso Injustificado en Publicación de Notas",
  "Incumplimiento de Criterios de Evaluación o Rúbricas",
  "Inconsistencia en Cobro o Gestión Financiera",
  "Falla Crítica en Plataforma Virtual / Recursos Didácticos",
  "Solicitud de Revisión Extraordinaria ante Consejo"
];

export const ROLES_SISTEMA = [
  {
    id: "SUPERADMIN",
    nombre: "Superadministrador",
    nivel: 1,
    badgeClass: "badge-danger",
    descripcion: "Control total y configuración de la plataforma, auditoría global y asignación de todos los roles."
  },
  {
    id: "ADMIN",
    nombre: "Administrador",
    nivel: 2,
    badgeClass: "badge-warning",
    descripcion: "Gestión y resolución integral de denuncias, coordinación operativa y administración de usuarios."
  },
  {
    id: "SUPERVISOR",
    nombre: "Supervisor / Auditor",
    nivel: 3,
    badgeClass: "badge-purple",
    descripcion: "Auditoría de casos, seguimiento de alertas SLA, emisión y firma de dictámenes de autoridades."
  },
  {
    id: "ESTANDAR",
    nombre: "Estándar / Operador",
    nivel: 4,
    badgeClass: "badge-info",
    descripcion: "Radicación, registro de nuevos casos y consulta del estado de expedientes asignados."
  }
];

export const INITIAL_USERS = [
  {
    id: "usr-01",
    nombre: "Ing. Gerardo López",
    email: "gerardo.lopez@uam.net.ni",
    rol: "SUPERADMIN",
    cargo: "Administrador General del Sistema ReportHub",
    dependencia: "Rectoría / Dirección de Tecnología",
    activo: true
  },
  {
    id: "usr-02",
    nombre: "Lic. Valery Sandoval Gómez",
    email: "valery.sandoval@uam.edu.ni",
    rol: "ADMIN",
    cargo: "Coordinador de Auditoría y Control de Denuncias",
    dependencia: "Unidad Central de Auditoría y Transparencia",
    activo: true
  },
  // Autoridades: Secretaría General (SUPERVISOR)
  {
    id: "usr-03",
    nombre: "Dra. Ana Patricia Morales Silva",
    email: "ana.morales@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Secretaria General UAM",
    dependencia: "Secretaría General",
    tipoAutoridad: "Secretaria General",
    activo: true
  },
  {
    id: "usr-04",
    nombre: "Lic. Marvin Gómez Tercero",
    email: "marvin.gomez@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Secretario Adjunto y Notaría Universitaria",
    dependencia: "Secretaría General",
    tipoAutoridad: "Secretaria General",
    activo: true
  },
  // Autoridades: Decanos de Facultades (SUPERVISOR)
  {
    id: "usr-05",
    nombre: "Dr. Roberto José Blandón Ruiz",
    email: "roberto.blandon@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Decano de la Facultad de Ciencias Médicas",
    dependencia: "Facultad de Ciencias Médicas",
    tipoAutoridad: "Decano de la Facultad",
    activo: true
  },
  {
    id: "usr-06",
    nombre: "Dra. Claudia Elena Torres Pineda",
    email: "claudia.torres@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Decana de la Facultad de Odontología",
    dependencia: "Facultad de Odontología",
    tipoAutoridad: "Decano de la Facultad",
    activo: true
  },
  {
    id: "usr-07",
    nombre: "Ing. Álvaro Castillo Hurtado",
    email: "alvaro.castillo@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Decano de la Facultad de Ingeniería y Arquitectura",
    dependencia: "Facultad de Ingeniería y Arquitectura",
    tipoAutoridad: "Decano de la Facultad",
    activo: true
  },
  {
    id: "usr-08",
    nombre: "Msc. Gabriel Gutiérrez Solís",
    email: "gabriel.gutierrez@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Decano de Ciencias Jurídicas y Sociales",
    dependencia: "Facultad de Ciencias Jurídicas y Sociales",
    tipoAutoridad: "Decano de la Facultad",
    activo: true
  },
  // Autoridades: Dirección de Planificación y Gestión de Calidad (SUPERVISOR)
  {
    id: "usr-09",
    nombre: "Msc. Ligia Isabel Argüello Cruz",
    email: "ligia.arguello@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Directora de Planificación y Gestión de Calidad",
    dependencia: "Dirección de Planificación y Gestión de Calidad",
    tipoAutoridad: "Dirección de Planificación y Gestión de Calidad",
    activo: true
  },
  {
    id: "usr-10",
    nombre: "Ing. Fernando Sequeira Mora",
    email: "fernando.sequeira@uam.edu.ni",
    rol: "SUPERVISOR",
    cargo: "Auditor Líder de Calidad y Procesos Académicos",
    dependencia: "Dirección de Planificación y Gestión de Calidad",
    tipoAutoridad: "Dirección de Planificación y Gestión de Calidad",
    activo: true
  },
  // Operadores de Registro y Radicación (ESTANDAR)
  {
    id: "usr-11",
    nombre: "Lic. Carlos Manuel Rivas",
    email: "carlos.rivas@uam.edu.ni",
    rol: "ESTANDAR",
    cargo: "Oficial de Radicación y Atención de Denuncias",
    dependencia: "Unidad Central de Auditoría y Transparencia",
    activo: true
  },
  {
    id: "usr-12",
    nombre: "Ing. Sofía Carolina Mendoza",
    email: "sofia.mendoza@uam.edu.ni",
    rol: "ESTANDAR",
    cargo: "Asistente de Registro y Control Estudiantil",
    dependencia: "Secretaría General",
    activo: true
  }
];

export const INITIAL_CASES = [
  {
    id: "GD-01-131026",
    codigoSetec: "SETEC-01-4491",
    fechaGenerada: "2026-10-02",
    departamento: "Managua",
    municipio: "Managua (Distrito I - VII)",
    afectado: {
      nombreCompleto: "Mariana Alejandra Fonseca Valle",
      cedula: "001-140502-1002K",
      email: "mariana.fonseca@est.uam.edu.ni",
      movil: "+505 8899-2231",
      cif: "CIF-20220419"
    },
    academicos: {
      categoria: "Académica y Evaluación",
      tipoDenuncia: "Inconformidad con Calificación o Examen",
      facultad: "Facultad de Ciencias Médicas",
      carrera: "Doctor en Medicina y Cirugía"
    },
    descripcion: "El docente titular de la cátedra de Farmacología Médica II omitió considerar la rúbrica estipulada en el sílabo oficial al evaluar el segundo examen parcial práctico. Pese a que se justificó la respuesta en base al protocolo clínico vigente de la OMS y UAM, se aplicó una deducción de 25 puntos sin retroalimentación sustentada.",
    solicitud: "Solicito formalmente la conformación de un tribunal académico evaluador paritario para la recalificación del examen práctico de Farmacología Médica II y la corrección oficial del acta de calificaciones en el sistema académico.",
    evidenciasDenunciante: [
      { name: "Copia_Examen_Practico_Farmacologia.pdf", size: "2.4 MB", type: "pdf", date: "2026-10-02" },
      { name: "Silabo_Oficial_Catedra_2026.pdf", size: "1.1 MB", type: "pdf", date: "2026-10-02" },
      { name: "Captura_Intento_Revision_Docente.png", size: "850 KB", type: "img", date: "2026-10-02" }
    ],
    // Fase 2: Dictamen y Caso Registrado completado
    registroCompletado: true,
    resolucion: {
      fundamentacionNormativa: "De conformidad con el Reglamento del Régimen Académico Estudiantil de la UAM, Art. 45 y 48 sobre el derecho a la revisión imparcial de pruebas de evaluación, y en apego al Modelo Educativo Institucional y los estándares del Consejo Nacional de Universidades (CNU) para carreras del área de salud humana.",
      aspectosTecnicos: "Se constató mediante auditoría de la Dirección de Calidad que el examen práctico carecía de rúbrica estandarizada publicada previa a la prueba. La Comisión Curricular de la Facultad de Ciencias Médicas revisó el reactivo clínico No. 4 concluyendo que la respuesta de la estudiante se fundamenta con validez científica en la guía farmacológica recomendada.",
      conclusiones: "Se declara Con Lugar la solicitud del estudiante. Se ordena la rectificación de 20 puntos a favor de la estudiante en la prueba práctica de Farmacología Médica II, asentándose nueva acta supletoria firmada por el Decanato y Secretaría General.",
      evidenciasUniversidad: [
        { name: "Dictamen_Tecnico_Comision_Medica_042.pdf", size: "3.2 MB", type: "pdf", date: "2026-10-08" },
        { name: "Acta_Supletoria_Rectificacion_Notas.pdf", size: "1.5 MB", type: "pdf", date: "2026-10-09" }
      ],
      autoridades: {
        secretariaGeneralId: "usr-03",
        secretariaGeneralNombre: "Dra. Ana Patricia Morales Silva",
        decanoId: "usr-05",
        decanoNombre: "Dr. Roberto José Blandón Ruiz",
        planificacionCalidadId: "usr-09",
        planificacionCalidadNombre: "Msc. Ligia Isabel Argüello Cruz"
      },
      fechaCierre: "2026-10-10"
    },
    estado: "Concluido y Notificado", // 'Registrado', 'En Evaluación Académica', 'Dictamen y Gestión de Autoridades', 'Concluido y Notificado'
    faseActual: 4, // 1 to 4
    historial: [
      { fecha: "2026-10-02 09:15", accion: "Caso registrado formalmente por el sistema SETEC", usuario: "Ventanilla SETEC" },
      { fecha: "2026-10-04 14:30", accion: "Recepción y asignación a Facultad de Ciencias Médicas", usuario: "Lic. Valery Sandoval Gómez" },
      { fecha: "2026-10-08 11:20", accion: "Emisión de Dictamen Técnico y Evaluación Normativa", usuario: "Dr. Roberto José Blandón Ruiz" },
      { fecha: "2026-10-10 16:45", accion: "Firma digital y ratificación de autoridades institucionales. Caso Concluido.", usuario: "Dra. Ana Patricia Morales Silva" }
    ]
  },
  {
    id: "GD-02-131026",
    codigoSetec: "SETEC-02-5012",
    fechaGenerada: "2026-10-07",
    departamento: "León",
    municipio: "León",
    afectado: {
      nombreCompleto: "Kevin Josué Navarrete Somarriba",
      cedula: "281-220801-0004L",
      email: "kevin.navarrete@est.uam.edu.ni",
      movil: "+505 8455-1190",
      cif: "CIF-20230155"
    },
    academicos: {
      categoria: "Académica y Evaluación",
      tipoDenuncia: "Incumplimiento de Programa Académico o Docente",
      facultad: "Facultad de Ciencias Médicas",
      carrera: "Licenciatura en Nutrición y Dietética"
    },
    descripcion: "Suspensión reiterada de prácticas de laboratorio de Bromatología y Bioquímica Clínica sin reprogramación oportuna, impidiendo el cumplimiento del porcentaje de horas prácticas exigido para habilitar el examen final.",
    solicitud: "Reprogramación urgente en horario sabatino de las 18 horas prácticas pendientes y garantía de uso de los laboratorios equipados antes del periodo de evaluaciones.",
    evidenciasDenunciante: [
      { name: "Bitacora_Asistencia_Laboratorio.pdf", size: "1.8 MB", type: "pdf", date: "2026-10-07" },
      { name: "Comunicaciones_Correo_Docente.pdf", size: "920 KB", type: "pdf", date: "2026-10-07" }
    ],
    registroCompletado: false,
    resolucion: {
      fundamentacionNormativa: "Reglamento de Laboratorios de Ciencias de la Salud y Disposiciones de la Vicerrectoría Académica respecto al cumplimiento del 100% de actividades prácticas obligatorias.",
      aspectosTecnicos: "Coordinación de Laboratorios confirmó la disponibilidad de espacios los sábados de 8:00 AM a 2:00 PM.",
      conclusiones: "",
      evidenciasUniversidad: [],
      autoridades: {
        secretariaGeneralId: "",
        secretariaGeneralNombre: "",
        decanoId: "usr-05",
        decanoNombre: "Dr. Roberto José Blandón Ruiz",
        planificacionCalidadId: ""
      },
      fechaCierre: null
    },
    estado: "En Evaluación Académica",
    faseActual: 2,
    historial: [
      { fecha: "2026-10-07 10:40", accion: "Caso registrado con código SETEC-02-5012", usuario: "Ventanilla SETEC" },
      { fecha: "2026-10-09 08:30", accion: "Turnado a Decanato de Medicina para evaluación de calendario", usuario: "Lic. Valery Sandoval Gómez" }
    ]
  },
  {
    id: "GD-03-131026",
    codigoSetec: "SETEC-03-5120",
    fechaGenerada: "2026-10-10",
    departamento: "Matagalpa",
    municipio: "Sébaco",
    afectado: {
      nombreCompleto: "Dra. Sofía Carolina Morales Castro",
      cedula: "441-090395-0001P",
      email: "sofia.morales@est.uam.edu.ni",
      movil: "+505 8762-3344",
      cif: "CIF-20240982"
    },
    academicos: {
      categoria: "Académica y Evaluación",
      tipoDenuncia: "Solicitud de Revisión Extraordinaria ante Consejo",
      facultad: "Facultad de Ciencias Médicas",
      carrera: "Especialidad en Cirugía General"
    },
    descripcion: "Discrepancia en el cómputo de guardias hospitalarias y rotación de quirófano en el Hospital Escuela, que afectó el cálculo del promedio de residencia médica del semestre.",
    solicitud: "Revisión formal de los partes diarios quirúrgicos y reconocimiento de créditos en el expediente de posgrado de cirugía.",
    evidenciasDenunciante: [
      { name: "Libro_Registro_Cirugias_Hospital.pdf", size: "4.5 MB", type: "pdf", date: "2026-10-10" }
    ],
    registroCompletado: false,
    resolucion: {
      fundamentacionNormativa: "Reglamento General de Posgrados y Especialidades Médicas de la Universidad Americana.",
      aspectosTecnicos: "Se solicitó al Coordinador Hospitalario la copia de las hojas de sala quirúrgica certificadas.",
      conclusiones: "",
      evidenciasUniversidad: [],
      autoridades: {
        secretariaGeneralId: "usr-03",
        secretariaGeneralNombre: "Dra. Ana Patricia Morales Silva",
        decanoId: "usr-05",
        decanoNombre: "Dr. Roberto José Blandón Ruiz",
        planificacionCalidadId: "usr-09",
        planificacionCalidadNombre: "Msc. Ligia Isabel Argüello Cruz"
      },
      fechaCierre: null
    },
    estado: "Dictamen y Gestión de Autoridades",
    faseActual: 3,
    historial: [
      { fecha: "2026-10-10 11:00", accion: "Caso radicado y remitido a Dirección de Posgrados Médicos", usuario: "Ventanilla SETEC" },
      { fecha: "2026-10-11 15:10", accion: "Dictamen técnico emitido, remitido a validación y firmas de autoridades", usuario: "Dr. Roberto José Blandón Ruiz" }
    ]
  },
  {
    id: "GD-04-131026",
    codigoSetec: "SETEC-04-5204",
    fechaGenerada: "2026-10-12",
    departamento: "Managua",
    municipio: "Ciudad Sandino",
    afectado: {
      nombreCompleto: "Gabriel Antonio Argeñal Mendoza",
      cedula: "001-290703-1008F",
      email: "gabriel.argenal@est.uam.edu.ni",
      movil: "+505 8219-4450",
      cif: "CIF-20230891"
    },
    academicos: {
      categoria: "Convivencia y Disciplina",
      tipoDenuncia: "Trato Irrespetuoso o Acoso en Aula",
      facultad: "Facultad de Odontología",
      carrera: "Doctor en Cirugía Dental"
    },
    descripcion: "Comentarios despectivos y conductas reiteradas de intimidación en la clínica odontológica comunitaria por parte del instructor clínico hacia el equipo de guardia.",
    solicitud: "Intervención inmediata de la Comisión de Ética y Convivencia Universitaria, asignación a otro docente tutor para las clínicas y medidas precautorias.",
    evidenciasDenunciante: [
      { name: "Testimonios_Firmados_Estudiantes.pdf", size: "2.1 MB", type: "pdf", date: "2026-10-12" },
      { name: "Capturas_Mensajes_Grupo.png", size: "1.4 MB", type: "img", date: "2026-10-12" }
    ],
    registroCompletado: false,
    resolucion: {
      fundamentacionNormativa: "",
      aspectosTecnicos: "",
      conclusiones: "",
      evidenciasUniversidad: [],
      autoridades: {
        secretariaGeneralId: "",
        secretariaGeneralNombre: "",
        decanoId: "",
        decanoNombre: "",
        planificacionCalidadId: ""
      },
      fechaCierre: null
    },
    estado: "Registrado",
    faseActual: 1,
    historial: [
      { fecha: "2026-10-12 16:20", accion: "Caso registrado formalmente. En espera de análisis normativo.", usuario: "Ventanilla SETEC" }
    ]
  }
];
