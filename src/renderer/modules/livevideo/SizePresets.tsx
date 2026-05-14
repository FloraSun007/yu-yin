interface SizePresetsProps {
  onSetSize: (w: number, h: number) => void;
}

const SIZES = [
  { label: '小窗', w: 400, h: 300 },
  { label: '中窗', w: 600, h: 450 },
  { label: '大窗', w: 800, h: 600 },
];

export function SizePresets({ onSetSize }: SizePresetsProps) {
  return (
    <div className="size-presets">
      {SIZES.map((s) => (
        <button
          key={s.label}
          className="size-btn"
          onClick={() => onSetSize(s.w, s.h)}
          title={`${s.w}×${s.h}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
