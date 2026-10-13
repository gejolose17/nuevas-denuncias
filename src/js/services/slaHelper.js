/**
 * UAM ReportHub - SLA Helper Service
 * Gestiona el plazo normativo institucional de 10 días máximos para la resolución de denuncias.
 * Calcula días transcurridos, días restantes, porcentaje de vencimiento y genera etiquetas/widgets visuales.
 */

export class SlaHelper {
  static MAX_DAYS = 10;

  /**
   * Calcula los parámetros de SLA para un caso
   * @param {Object} caseItem 
   * @returns {Object} Datos de cálculo de SLA
   */
  static getCaseSla(caseItem) {
    if (!caseItem || !caseItem.fechaGenerada) {
      return {
        maxDays: this.MAX_DAYS,
        diasRestantes: this.MAX_DAYS,
        diasTranscurridos: 0,
        porcentaje: 0,
        fechaLimiteStr: '-',
        isClosed: false,
        statusText: '10 días hábiles',
        urgency: 'normal'
      };
    }

    const genDate = new Date(caseItem.fechaGenerada);
    // 10 calendar days deadline
    const limitDate = new Date(genDate.getTime() + this.MAX_DAYS * 24 * 60 * 60 * 1000);
    const limitStr = limitDate.toISOString().split('T')[0];

    const isClosed = 
      caseItem.estado === 'Concluido y Notificado' || 
      (caseItem.estado && caseItem.estado.includes('Cerrado')) ||
      caseItem.faseActual === 4;

    if (isClosed) {
      const closeDateStr = caseItem.resolucion?.fechaCierre || caseItem.fechaGenerada;
      const closeDate = new Date(closeDateStr);
      const diffTime = Math.max(0, closeDate.getTime() - genDate.getTime());
      const daysTaken = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const onTime = daysTaken <= this.MAX_DAYS;

      return {
        maxDays: this.MAX_DAYS,
        diasRestantes: 0,
        diasTranscurridos: daysTaken,
        porcentaje: 100,
        fechaLimiteStr: limitStr,
        isClosed: true,
        daysTaken,
        onTime,
        urgency: 'closed',
        statusText: onTime ? `Cerrado a tiempo (${daysTaken}d / 10d)` : `Cerrado fuera de plazo (${daysTaken}d / 10d)`
      };
    }

    const now = new Date();
    // Normalize to midnight for clean day counting
    const genMidnight = new Date(genDate.getFullYear(), genDate.getMonth(), genDate.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = nowMidnight.getTime() - genMidnight.getTime();
    const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const daysRemaining = this.MAX_DAYS - daysElapsed;
    const percentage = Math.min(100, Math.max(0, Math.round((daysElapsed / this.MAX_DAYS) * 100)));

    let urgency = 'normal';
    let statusText = `Quedan ${daysRemaining} días`;

    if (daysRemaining < 0) {
      urgency = 'expired';
      statusText = `Vencido por ${Math.abs(daysRemaining)} días`;
    } else if (daysRemaining === 0) {
      urgency = 'critical';
      statusText = `¡Último día de plazo!`;
    } else if (daysRemaining <= 4) {
      urgency = 'warning';
      statusText = `Quedan ${daysRemaining} días (Atención)`;
    } else {
      urgency = 'normal';
      statusText = `Quedan ${daysRemaining} días`;
    }

    return {
      maxDays: this.MAX_DAYS,
      diasRestantes: daysRemaining,
      diasTranscurridos: daysElapsed,
      porcentaje: percentage,
      fechaLimiteStr: limitStr,
      isClosed: false,
      urgency,
      statusText
    };
  }

  /**
   * Genera el badge HTML para tablas o listas
   * @param {Object} caseItem 
   * @returns {string} HTML del badge
   */
  static renderSlaBadge(caseItem) {
    const sla = this.getCaseSla(caseItem);

    if (sla.isClosed) {
      return `
        <span class="sla-badge sla-badge-closed" title="Caso cerrado en ${sla.daysTaken} días de 10 normativos">
          ✓ Resuelto (${sla.daysTaken}d)
        </span>
      `;
    }

    switch (sla.urgency) {
      case 'expired':
        return `
          <span class="sla-badge sla-badge-expired" title="Plazo reglamentario de 10 días vencido por ${Math.abs(sla.diasRestantes)} días">
            ⛔ Vencido (+${Math.abs(sla.diasRestantes)}d)
          </span>
        `;
      case 'critical':
        return `
          <span class="sla-badge sla-badge-critical" title="Hoy vence el plazo máximo institucional de 10 días">
            🚨 Vence Hoy
          </span>
        `;
      case 'warning':
        return `
          <span class="sla-badge sla-badge-warning" title="Atención: Quedan ${sla.diasRestantes} días de 10">
            ⚠️ Quedan ${sla.diasRestantes}d
          </span>
        `;
      default:
        return `
          <span class="sla-badge sla-badge-normal" title="Dentro del plazo normativo de 10 días">
            ⏱️ Quedan ${sla.diasRestantes}d
          </span>
        `;
    }
  }

  /**
   * Genera el widget completo del contador de 10 días para el workspace del caso
   * @param {Object} caseItem 
   * @returns {string} HTML del banner de SLA
   */
  static renderSlaWidget(caseItem) {
    const sla = this.getCaseSla(caseItem);

    return `
      <div class="sla-banner-box sla-state-${sla.urgency}">
        <div class="sla-banner-top">
          <div class="sla-banner-title">
            <div class="sla-icon-wrap">
              ${sla.isClosed ? '✓' : (sla.urgency === 'expired' ? '⛔' : (sla.urgency === 'warning' || sla.urgency === 'critical' ? '⚠️' : '⏱️'))}
            </div>
            <div>
              <strong>PLAZO MÁXIMO DE ATENCIÓN: 10 DÍAS INSTITUCIONALES</strong>
              <span class="sla-sub">
                Radicado: <strong>${caseItem.fechaGenerada}</strong> • Fecha Límite: <strong>${sla.fechaLimiteStr}</strong>
              </span>
            </div>
          </div>
          <div class="sla-banner-metric">
            <span class="sla-metric-num">${sla.isClosed ? `${sla.daysTaken}d` : `${Math.max(0, sla.diasRestantes)}d`}</span>
            <span class="sla-metric-lbl">${sla.isClosed ? 'Tiempo de Cierre' : 'Días Restantes'}</span>
          </div>
        </div>

        <div class="sla-progress-track">
          <div class="sla-progress-bar" style="width: ${sla.porcentaje}%;"></div>
        </div>

        <div class="sla-banner-footer">
          <span>Día <strong>${Math.min(10, sla.diasTranscurridos)}</strong> de <strong>10</strong> reglamentarios</span>
          <span class="sla-status-tag">${sla.statusText}</span>
        </div>
      </div>
    `;
  }
}
