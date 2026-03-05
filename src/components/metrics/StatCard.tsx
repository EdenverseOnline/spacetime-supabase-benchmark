interface StatCardProps {
  label: string;
  spacetimeValue: string;
  supabaseValue: string;
  unit?: string;
  higherIsBetter?: boolean;
}

export function StatCard({
  label,
  spacetimeValue,
  supabaseValue,
  unit,
  higherIsBetter = false,
}: StatCardProps) {
  const stNum = parseFloat(spacetimeValue) || 0;
  const sbNum = parseFloat(supabaseValue) || 0;

  let stWinner = false;
  let sbWinner = false;

  if (stNum > 0 && sbNum > 0) {
    if (higherIsBetter) {
      stWinner = stNum > sbNum;
      sbWinner = sbNum > stNum;
    } else {
      stWinner = stNum < sbNum;
      sbWinner = sbNum < stNum;
    }
  }

  return (
    <div className="stat-card" role="group" aria-label={label}>
      <span className="stat-card__label">{label}</span>
      <div className="stat-card__values">
        <div
          className={`stat-card__value stat-card__value--spacetime ${stWinner ? "stat-card__value--winner" : ""}`}
        >
          <span
            className="stat-card__dot stat-card__dot--spacetime"
            aria-hidden="true"
          />
          <span>
            {spacetimeValue}
            {unit && <span className="stat-card__unit">{unit}</span>}
          </span>
        </div>
        <div
          className={`stat-card__value stat-card__value--supabase ${sbWinner ? "stat-card__value--winner" : ""}`}
        >
          <span
            className="stat-card__dot stat-card__dot--supabase"
            aria-hidden="true"
          />
          <span>
            {supabaseValue}
            {unit && <span className="stat-card__unit">{unit}</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
