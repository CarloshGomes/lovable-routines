export const REASON_LABELS: Record<string, string> = {
    high_demand: 'Alta Demanda',
    system_slowness: 'Sistema Lento',
    external_factor: 'Fator Externo',
    break_adjustment: 'Intervalo',
    other: 'Outro',
    impossible_to_complete: 'Impossível de Completar'
};

export const REASON_COLORS: Record<string, string> = {
    high_demand: 'text-warning',
    system_slowness: 'text-danger',
    external_factor: 'text-accent',
    break_adjustment: 'text-primary',
    other: 'text-muted-foreground',
    impossible_to_complete: 'text-danger'
};
