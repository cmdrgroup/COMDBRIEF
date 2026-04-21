import { useEffect, useState } from "react";

interface ChargeRatingSliderProps {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
  showValue?: boolean;
  valueClassName?: string;
}

/**
 * Slider that tracks a local draft value while dragging and only
 * commits to the parent (DB) on release. Prevents realtime/query
 * invalidations from snapping the thumb back mid-drag.
 */
const ChargeRatingSlider = ({
  value,
  onCommit,
  className = "flex-1 accent-command-gold",
  showValue = true,
  valueClassName = "font-mono text-sm text-command-gold font-bold w-8 text-right",
}: ChargeRatingSliderProps) => {
  const [draft, setDraft] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  // Sync external changes only when not actively dragging.
  useEffect(() => {
    if (!isDragging) setDraft(value);
  }, [value, isDragging]);

  const commit = () => {
    setIsDragging(false);
    if (draft !== value) onCommit(draft);
  };

  return (
    <>
      <input
        type="range"
        min={1}
        max={10}
        value={draft}
        onChange={e => {
          setIsDragging(true);
          setDraft(Number(e.target.value));
        }}
        onMouseUp={commit}
        onTouchEnd={commit}
        onKeyUp={commit}
        onBlur={commit}
        className={className}
      />
      {showValue && <span className={valueClassName}>{draft}/10</span>}
    </>
  );
};

export default ChargeRatingSlider;
