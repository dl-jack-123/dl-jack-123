import React from 'react';
import { Profile } from './profile';
import { registerFloating } from './floating';

interface Props {
    profile: Profile;
    onPipeline: () => void;
    onInfra: () => void;
    onMetrics: () => void;
}

const STEPS = ['Lint', 'Test', 'Build', 'Scan', 'Deploy'];
const SERVICES = ['API (FastAPI)', 'PostgreSQL', 'Airflow', 'Grafana'];

/**
 * Three wall cards. The pipeline and infrastructure cards show sample data and say so;
 * the metrics card uses the dated GitHub/WakaTime snapshot from profile.json.
 */
const FloatingCards: React.FC<Props> = ({
    profile,
    onPipeline,
    onInfra,
    onMetrics,
}) => {
    const stats = profile.stats.slice(0, 3);
    return (
        <div className="pro-floats" aria-label="Engineering highlights">
            <button
                type="button"
                className="pro-float"
                ref={(el) => registerFloating(0, el)}
                onClick={onPipeline}
                aria-label="Deployment pipeline example. Opens the workstation demo."
            >
                <span className="pf-head">
                    <b>Deployment Pipeline</b>
                    <i>Demo</i>
                </span>
                <span className="pf-steps">
                    {STEPS.map((s) => (
                        <span key={s} className="pf-step">
                            <span className="pf-check" aria-hidden="true">
                                ✓
                            </span>
                            {s}
                        </span>
                    ))}
                </span>
                <span className="pf-foot">
                    <span className="pf-dot" aria-hidden="true" /> Success (sample run)
                </span>
            </button>

            <button
                type="button"
                className="pro-float"
                ref={(el) => registerFloating(1, el)}
                onClick={onInfra}
                aria-label="Infrastructure overview example. Opens the tech stack."
            >
                <span className="pf-head">
                    <b>Infrastructure</b>
                    <i>Demo</i>
                </span>
                <span className="pf-list">
                    {SERVICES.map((s) => (
                        <span key={s} className="pf-row">
                            <span className="pf-dot" aria-hidden="true" />
                            {s}
                            <em>healthy</em>
                        </span>
                    ))}
                </span>
                <span className="pf-foot">Sample data, not live</span>
            </button>

            <button
                type="button"
                className="pro-float"
                ref={(el) => registerFloating(2, el)}
                onClick={onMetrics}
                aria-label="Engineering metrics. Opens the engineering section."
            >
                <span className="pf-head">
                    <b>Engineering Metrics</b>
                </span>
                <span className="pf-list">
                    {stats.map((s) => (
                        <span key={s.label} className="pf-row">
                            {s.label}
                            <strong>{s.value}</strong>
                        </span>
                    ))}
                </span>
                <span className="pf-foot">Snapshot, GitHub {profile.statsDate}</span>
            </button>
        </div>
    );
};

export default FloatingCards;
