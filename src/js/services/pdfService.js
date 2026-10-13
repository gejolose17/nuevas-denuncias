import { UAM_LOGO_BASE64 } from '../data/logoBase64.js';

export class PdfService {
  /**
   * Genera el HTML de la ficha completa oficial de un caso
   */
  static generateCasePrintableHtml(caso, institutionName = 'UNIVERSIDAD AMERICANA (UAM)') {
    const res = caso.resolucion || {};
    const autoridades = res.autoridades || {};
    const estadoClass = caso.estado === 'Concluido y Notificado' ? 'status-closed' : 'status-pending';
    const studentPhotoHtml = caso.afectado?.foto
      ? `<div style="text-align: center; padding: 4px;"><img src="${caso.afectado.foto}" alt="Foto Denunciante" style="width: 70px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #BCE3E8;" /></div>`
      : `<div style="width: 70px; height: 80px; background: #F1F5F9; border: 1px dashed #CBD5E0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #94A3B8;">👤</div>`;

    const evidenciasDenunHtml = (caso.evidenciasDenunciante && caso.evidenciasDenunciante.length > 0)
      ? caso.evidenciasDenunciante.map(e => `<li>📁 <strong>${e.name}</strong> (${e.size || 'Adjunto'})</li>`).join('')
      : '<li><em>Sin evidencias adjuntas registradas</em></li>';

    const evidenciasUnivHtml = (res.evidenciasUniversidad && res.evidenciasUniversidad.length > 0)
      ? res.evidenciasUniversidad.map(e => `<li>🏛️ <strong>${e.name}</strong> (${e.size || 'Adjunto oficial'})</li>`).join('')
      : '<li><em>Sin evidencias institucionales adicionales cargadas</em></li>';

    return `
      <div class="pdf-document">
        <!-- HEADER INSTITUCIONAL CON LOGO OFICIAL -->
        <div class="pdf-header">
          <div class="pdf-brand-col">
            <div class="pdf-logo-wrapper">
              <img src="${UAM_LOGO_BASE64}" alt="UAM ReportHub Logo" style="height: 46px; max-width: 240px; object-fit: contain;" />
            </div>
            <div>
              <h1 class="pdf-inst-title">${institutionName}</h1>
              <h2 class="pdf-system-title">ReportHub • Sistema Integral de Denuncias Universitarias</h2>
              <p class="pdf-doc-type">EXPEDIENTE OFICIAL DE DENUNCIA Y RESOLUCIÓN INSTITUCIONAL</p>
            </div>
          </div>
          <div class="pdf-meta-box">
            <div class="pdf-meta-row"><span>NO. CASO:</span> <strong>${caso.id}</strong></div>
            <div class="pdf-meta-row"><span>CÓDIGO SETEC:</span> <strong style="color: #0099A8;">${caso.codigoSetec}</strong></div>
            <div class="pdf-meta-row"><span>FECHA:</span> <span>${caso.fechaGenerada}</span></div>
            <div class="pdf-meta-row"><span>ESTADO:</span> <span class="pdf-status-badge">${caso.estado}</span></div>
          </div>
        </div>

        <div class="pdf-divider"></div>

        <!-- SECCIÓN 1: REGISTRO DE CASO -->
        <div class="pdf-section-title">
          <span>PARTE I</span> REGISTRO INICIAL DE LA DENUNCIA
        </div>

        <!-- FILA UBICACION -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th colspan="2">UBICACIÓN GEOGRÁFICA DE RADICACIÓN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width: 50%;"><strong>Departamento:</strong> ${caso.departamento || 'N/D'}</td>
              <td style="width: 50%;"><strong>Municipio:</strong> ${caso.municipio || 'N/D'}</td>
            </tr>
          </tbody>
        </table>

        <!-- DATOS DEL AFECTADO CON FOTO -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th style="width: 85px; text-align: center;">FOTO</th>
              <th colspan="3">DATOS DEL AFECTADO / DENUNCIANTE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2" style="vertical-align: middle; text-align: center; padding: 4px;">
                ${studentPhotoHtml}
              </td>
              <td colspan="2"><strong>Nombre Completo:</strong> ${caso.afectado?.nombreCompleto || 'N/D'}</td>
              <td><strong>No. CIF Estudiantil:</strong> <strong style="color:#0099A8;">${caso.afectado?.cif || 'N/D'}</strong></td>
            </tr>
            <tr>
              <td><strong>Cédula:</strong> ${caso.afectado?.cedula || 'N/D'}</td>
              <td><strong>Correo:</strong> ${caso.afectado?.email || 'N/D'}</td>
              <td><strong>Móvil:</strong> ${caso.afectado?.movil || 'N/D'}</td>
            </tr>
          </tbody>
        </table>

        <!-- DATOS ACADEMICOS -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th colspan="2">DATOS ACADÉMICOS DE LA DENUNCIA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Facultad:</strong> ${caso.academicos?.facultad || 'N/D'}</td>
              <td><strong>Carrera Asociada:</strong> ${caso.academicos?.carrera || 'N/D'}</td>
            </tr>
            <tr>
              <td><strong>Categoría de Tipo:</strong> ${caso.academicos?.categoria || 'N/D'}</td>
              <td><strong>Tipo de Denuncia:</strong> ${caso.academicos?.tipoDenuncia || 'N/D'}</td>
            </tr>
          </tbody>
        </table>

        <!-- DESCRIPCIÓN Y SOLICITUD -->
        <div class="pdf-field-block">
          <div class="pdf-field-label">DESCRIPCIÓN DE LOS HECHOS DENUNCIADOS:</div>
          <div class="pdf-field-text">${caso.descripcion || 'Sin descripción ingresada.'}</div>
        </div>

        <div class="pdf-field-block">
          <div class="pdf-field-label">SOLICITUD FORMAL DEL DENUNCIANTE:</div>
          <div class="pdf-field-text">${caso.solicitud || 'Sin solicitud especificada.'}</div>
        </div>

        <div class="pdf-field-block">
          <div class="pdf-field-label">EVIDENCIAS PRESENTADAS POR EL DENUNCIANTE:</div>
          <ul class="pdf-evidence-list">
            ${evidenciasDenunHtml}
          </ul>
        </div>

        <!-- SECCIÓN 2: CASO REGISTRADO / DICTAMEN -->
        <div class="pdf-page-break-inside">
          <div class="pdf-section-title" style="margin-top: 24px;">
            <span>PARTE II</span> CASO REGISTRADO • DICTAMEN TÉCNICO Y EVALUACIÓN INSTITUCIONAL
          </div>

          <div class="pdf-field-block">
            <div class="pdf-field-label">FUNDAMENTACIÓN NORMATIVA Y CALIDAD ACADÉMICA:</div>
            <div class="pdf-field-text">${res.fundamentacionNormativa || '<em>Pendiente de fundamentación normativa.</em>'}</div>
          </div>

          <div class="pdf-field-block">
            <div class="pdf-field-label">ASPECTOS TÉCNICOS Y ACADÉMICOS DE LA SOLICITUD:</div>
            <div class="pdf-field-text">${res.aspectosTecnicos || '<em>Pendiente de evaluación técnica y académica.</em>'}</div>
          </div>

          <div class="pdf-field-block">
            <div class="pdf-field-label">CONCLUSIONES INSTITUCIONALES:</div>
            <div class="pdf-field-text highlight-box">${res.conclusiones || '<em>Pendiente de emisión de conclusiones formales.</em>'}</div>
          </div>

          <div class="pdf-field-block">
            <div class="pdf-field-label">EVIDENCIAS PRESENTADAS POR LA UNIVERSIDAD:</div>
            <ul class="pdf-evidence-list">
              ${evidenciasUnivHtml}
            </ul>
          </div>

          <!-- AUTORIDADES QUE GESTIONAN LA DENUNCIA (FIRMAS) -->
          <div class="pdf-section-title" style="margin-top: 28px;">
            <span>PARTE III</span> AUTORIDADES QUE GESTIONAN LA DENUNCIA
          </div>

          <div class="pdf-signatures-grid">
            <div class="pdf-sig-box">
              <div class="pdf-sig-line"></div>
              <div class="pdf-sig-name">${autoridades.secretariaGeneralNombre || 'Dra. Ana Patricia Morales Silva'}</div>
              <div class="pdf-sig-cargo">Secretaría General</div>
              <div class="pdf-sig-institution">Universidad Americana (UAM)</div>
              <div class="pdf-sig-badge">${autoridades.secretariaGeneralId ? '✓ VALIDADO OFICIALMENTE' : 'PENDIENTE DE FIRMA'}</div>
            </div>

            <div class="pdf-sig-box">
              <div class="pdf-sig-line"></div>
              <div class="pdf-sig-name">${autoridades.decanoNombre || 'Dr. Roberto José Blandón Ruiz'}</div>
              <div class="pdf-sig-cargo">Decano de la Facultad</div>
              <div class="pdf-sig-institution">${caso.academicos?.facultad || 'Facultad Correspondiente'}</div>
              <div class="pdf-sig-badge">${autoridades.decanoId ? '✓ VALIDADO OFICIALMENTE' : 'PENDIENTE DE FIRMA'}</div>
            </div>

            <div class="pdf-sig-box">
              <div class="pdf-sig-line"></div>
              <div class="pdf-sig-name">${autoridades.planificacionCalidadNombre || 'Msc. Ligia Isabel Argüello Cruz'}</div>
              <div class="pdf-sig-cargo">Dirección de Planificación y Gestión de Calidad</div>
              <div class="pdf-sig-institution">Universidad Americana (UAM)</div>
              <div class="pdf-sig-badge">${autoridades.planificacionCalidadId ? '✓ VALIDADO OFICIALMENTE' : 'PENDIENTE DE FIRMA'}</div>
            </div>
          </div>

          <div class="pdf-footer-stamp">
            Documento emitido formalmente por el módulo de trazabilidad SETEC • UAM ReportHub | Código de Verificación Digital: ${btoa(caso.id + caso.codigoSetec).substring(0, 18).toUpperCase()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Imprime o abre ventana para guardar como PDF un solo caso
   */
  static exportSingleCasePdf(caso) {
    const printWindow = window.open('', '_blank', 'width=950,height=900');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes (pop-ups) para generar el archivo PDF.');
      return;
    }

    const htmlContent = this.generateCasePrintableHtml(caso);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>UAM ReportHub - Ficha Oficial ${caso.id}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
            background: #FFFFFF;
            color: #2D3748;
            font-size: 11pt;
            line-height: 1.45;
            margin: 0;
            padding: 20px;
          }
          .pdf-document {
            max-width: 800px;
            margin: 0 auto;
          }
          .pdf-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            margin-bottom: 12px;
          }
          .pdf-brand-col {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .pdf-logo-mark {
            background: #0099A8;
            color: #FFFFFF;
            font-weight: 900;
            font-size: 20pt;
            padding: 8px 14px;
            border-radius: 6px;
            letter-spacing: 1px;
          }
          .pdf-inst-title {
            font-size: 13pt;
            font-weight: 800;
            color: #808284;
            margin: 0 0 2px 0;
            text-transform: uppercase;
          }
          .pdf-system-title {
            font-size: 10pt;
            font-weight: 600;
            color: #0099A8;
            margin: 0 0 2px 0;
          }
          .pdf-doc-type {
            font-size: 8pt;
            color: #808284;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .pdf-meta-box {
            background: #F4F8FA;
            border: 1px solid #D1E5E8;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 9pt;
            min-width: 220px;
          }
          .pdf-meta-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }
          .pdf-meta-row span {
            color: #808284;
          }
          .pdf-status-badge {
            background: #0099A8;
            color: #FFFFFF;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 8pt;
            font-weight: 700;
          }
          .pdf-divider {
            height: 3px;
            background: linear-gradient(90deg, #0099A8 0%, #808284 100%);
            margin: 10px 0 16px 0;
            border-radius: 2px;
          }
          .pdf-section-title {
            font-size: 11pt;
            font-weight: 800;
            color: #808284;
            text-transform: uppercase;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 4px;
            margin: 16px 0 10px 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .pdf-section-title span {
            background: #0099A8;
            color: #FFFFFF;
            font-size: 8pt;
            padding: 2px 6px;
            border-radius: 3px;
          }
          .pdf-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 9.5pt;
          }
          .pdf-table th {
            background: #EDF6F8;
            color: #0099A8;
            text-align: left;
            padding: 6px 10px;
            font-weight: 700;
            border: 1px solid #CFE4E7;
            font-size: 9pt;
            letter-spacing: 0.3px;
          }
          .pdf-table td {
            padding: 6px 10px;
            border: 1px solid #E2E8F0;
            vertical-align: top;
          }
          .pdf-field-block {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .pdf-field-label {
            font-size: 9pt;
            font-weight: 700;
            color: #808284;
            margin-bottom: 3px;
            text-transform: uppercase;
          }
          .pdf-field-text {
            background: #F8FAFB;
            border: 1px solid #E2E8F0;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 9.5pt;
            white-space: pre-wrap;
          }
          .pdf-field-text.highlight-box {
            background: #F0F9FA;
            border-color: #A5D8DE;
            border-left: 4px solid #0099A8;
          }
          .pdf-evidence-list {
            margin: 4px 0 0 0;
            padding-left: 20px;
            font-size: 9pt;
            color: #4A5568;
          }
          .pdf-evidence-list li {
            margin-bottom: 3px;
          }
          .pdf-signatures-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            margin-top: 35px;
            page-break-inside: avoid;
          }
          .pdf-sig-box {
            text-align: center;
            border: 1px dashed #CBD5E0;
            border-radius: 6px;
            padding: 12px 8px;
            background: #FAFCFD;
          }
          .pdf-sig-line {
            height: 1px;
            background: #808284;
            margin: 25px auto 8px auto;
            width: 80%;
          }
          .pdf-sig-name {
            font-weight: 700;
            font-size: 9pt;
            color: #2D3748;
          }
          .pdf-sig-cargo {
            font-size: 8pt;
            font-weight: 600;
            color: #0099A8;
          }
          .pdf-sig-institution {
            font-size: 7.5pt;
            color: #808284;
            margin-top: 2px;
          }
          .pdf-sig-badge {
            margin-top: 6px;
            font-size: 7pt;
            font-weight: 700;
            color: #0099A8;
            background: #E6F6F7;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
          }
          .pdf-footer-stamp {
            margin-top: 25px;
            padding-top: 8px;
            border-top: 1px solid #E2E8F0;
            font-size: 7.5pt;
            color: #808284;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
          .print-toolbar {
            position: fixed;
            top: 12px;
            right: 12px;
            background: #0099A8;
            color: #FFFFFF;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
          }
        </style>
      </head>
      <body>
        <div class="no-print print-toolbar" onclick="window.print()">
          🖨️ Imprimir / Guardar como PDF
        </div>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /**
   * Exportación masiva de todos los casos seleccionados o todos los existentes
   */
  static exportMassiveCasesPdf(casesList, title = 'REPORTE GENERAL CONSOLIDADO DE DENUNCIA UNIVERSITARIA') {
    if (!casesList || casesList.length === 0) {
      alert('No hay casos para exportar.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (!printWindow) {
      alert('Por favor habilita las ventanas emergentes (pop-ups) para generar el archivo PDF.');
      return;
    }

    const casesSheetsHtml = casesList.map((caso, index) => {
      return `
        <div class="massive-case-page" style="${index > 0 ? 'page-break-before: always; margin-top: 30px;' : ''}">
          <div class="massive-page-num">Expediente ${index + 1} de ${casesList.length}</div>
          ${this.generateCasePrintableHtml(caso)}
        </div>
      `;
    }).join('');

    // Executive summary table
    const summaryRows = casesList.map(c => `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td style="color:#0099A8;">${c.codigoSetec}</td>
        <td>${c.fechaGenerada}</td>
        <td>${c.afectado?.nombreCompleto || 'N/D'}<br><small style="color:#808284;">${c.afectado?.cif || ''}</small></td>
        <td>${c.academicos?.facultad || 'N/D'}<br><small>${c.academicos?.carrera || ''}</small></td>
        <td><span class="pdf-status-badge">${c.estado}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>UAM ReportHub - Consolidado Masivo (${casesList.length} Casos)</title>
        <style>
          @page {
            size: letter portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background: #FFFFFF;
            color: #2D3748;
            font-size: 10pt;
            margin: 0;
            padding: 20px;
          }
          .massive-container {
            max-width: 820px;
            margin: 0 auto;
          }
          .massive-header {
            text-align: center;
            border-bottom: 3px solid #0099A8;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .massive-title {
            color: #808284;
            font-size: 16pt;
            font-weight: 800;
            margin: 0;
          }
          .massive-sub {
            color: #0099A8;
            font-size: 11pt;
            font-weight: 600;
            margin-top: 4px;
          }
          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 8.5pt;
          }
          .summary-table th {
            background: #0099A8;
            color: #FFFFFF;
            padding: 6px 8px;
            text-align: left;
          }
          .summary-table td {
            border: 1px solid #E2E8F0;
            padding: 6px 8px;
          }
          .pdf-document { margin-bottom: 40px; }
          .pdf-header { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 10px; }
          .pdf-brand-col { display: flex; align-items: center; gap: 10px; }
          .pdf-logo-mark { background: #0099A8; color: #FFF; font-weight: 900; font-size: 16pt; padding: 6px 10px; border-radius: 4px; }
          .pdf-inst-title { font-size: 11pt; font-weight: 800; color: #808284; margin: 0; }
          .pdf-system-title { font-size: 9pt; font-weight: 600; color: #0099A8; margin: 0; }
          .pdf-doc-type { font-size: 7.5pt; color: #808284; margin: 0; }
          .pdf-meta-box { background: #F4F8FA; border: 1px solid #D1E5E8; border-radius: 4px; padding: 6px 10px; font-size: 8pt; min-width: 190px; }
          .pdf-meta-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .pdf-status-badge { background: #0099A8; color: #FFF; padding: 2px 6px; border-radius: 8px; font-size: 7.5pt; font-weight: 700; }
          .pdf-divider { height: 2px; background: #0099A8; margin: 8px 0 12px 0; }
          .pdf-section-title { font-size: 9.5pt; font-weight: 800; color: #808284; border-bottom: 1px solid #E2E8F0; padding-bottom: 2px; margin: 12px 0 6px 0; display: flex; gap: 6px; align-items: center; }
          .pdf-section-title span { background: #0099A8; color: #FFF; font-size: 7pt; padding: 1px 4px; border-radius: 2px; }
          .pdf-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 8.5pt; }
          .pdf-table th { background: #EDF6F8; color: #0099A8; padding: 4px 6px; border: 1px solid #CFE4E7; text-align: left; }
          .pdf-table td { padding: 4px 6px; border: 1px solid #E2E8F0; }
          .pdf-field-block { margin-bottom: 8px; page-break-inside: avoid; }
          .pdf-field-label { font-size: 8pt; font-weight: 700; color: #808284; }
          .pdf-field-text { background: #F8FAFB; border: 1px solid #E2E8F0; padding: 6px 8px; font-size: 8.5pt; border-radius: 3px; }
          .pdf-field-text.highlight-box { background: #F0F9FA; border-left: 3px solid #0099A8; }
          .pdf-evidence-list { margin: 2px 0; padding-left: 16px; font-size: 8pt; }
          .pdf-signatures-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 20px; page-break-inside: avoid; }
          .pdf-sig-box { text-align: center; border: 1px dashed #CBD5E0; padding: 8px 4px; border-radius: 4px; background: #FAFCFD; }
          .pdf-sig-line { height: 1px; background: #808284; margin: 18px auto 4px auto; width: 80%; }
          .pdf-sig-name { font-weight: 700; font-size: 8pt; }
          .pdf-sig-cargo { font-size: 7pt; font-weight: 600; color: #0099A8; }
          .pdf-sig-institution { font-size: 6.5pt; color: #808284; }
          .pdf-sig-badge { margin-top: 3px; font-size: 6.5pt; font-weight: 700; color: #0099A8; background: #E6F6F7; padding: 1px 4px; border-radius: 2px; display: inline-block; }
          .pdf-footer-stamp { margin-top: 15px; font-size: 7pt; color: #808284; text-align: center; }
          .massive-page-num { font-size: 8pt; color: #808284; text-align: right; margin-bottom: 6px; }
          .print-toolbar { position: fixed; top: 12px; right: 12px; background: #0099A8; color: #FFF; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; }
          @media print { body { padding: 0; } .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="no-print print-toolbar" onclick="window.print()">
          🖨️ Imprimir / Guardar Consolidado Completo
        </div>
        <div class="massive-container">
          <div class="massive-header">
            <div style="margin-bottom: 8px;">
              <img src="${UAM_LOGO_BASE64}" alt="UAM ReportHub Logo" style="height: 52px; max-width: 260px; object-fit: contain;" />
            </div>
            <h1 class="massive-title">UNIVERSIDAD AMERICANA (UAM)</h1>
            <div class="massive-sub">${title}</div>
            <p style="font-size: 9pt; color: #808284; margin: 4px 0 0 0;">Generado el: ${new Date().toLocaleDateString('es-NI')} • Total de Expedientes: ${casesList.length} • Diseñado por GLSystem</p>
          </div>

          <h3 style="font-size: 11pt; color: #808284; margin-bottom: 8px;">TABLA RESUMEN DE EXPEDIENTES CONSOLIDADOS</h3>
          <table class="summary-table">
            <thead>
              <tr>
                <th>No. Caso</th>
                <th>Cód. SETEC</th>
                <th>Fecha</th>
                <th>Afectado / CIF</th>
                <th>Facultad / Carrera</th>
                <th>Estado Actual</th>
              </tr>
            </thead>
            <tbody>
              ${summaryRows}
            </tbody>
          </table>

          <div style="page-break-before: always;"></div>
          ${casesSheetsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}
