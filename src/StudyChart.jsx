import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, getWeekStart, monthLength } from "./dates.js";

const UNITS = [
  ["day", "Day"],
  ["week", "Week"],
  ["month", "Month"],
  ["year", "Year"],
];
const CURRENT_LABELS = { day: "Current day", week: "Current week", month: "Current month", year: "Current year" };
const GUTTER = 34;
const AXIS_HEIGHT = 24;
const PLOT_TOP = 10;
const LABEL_SPACING = 64;
const ANIMATION_MS = 380;
const DAY_MS = 86400000;

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function formatHours(value) {
  return Number(value.toFixed(2)).toString();
}

// Whole days since the Unix epoch, computed in UTC so daylight saving never shifts a day.
function toDayNumber(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

function toDateKey(dayNumber) {
  const date = new Date(dayNumber * DAY_MS);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

// The calendar period the chart is anchored to: today, the Sunday–Saturday week, the calendar month or the calendar year.
function currentPeriod(unit, today) {
  if (unit === "day") return { start: today, end: today };
  if (unit === "week") {
    const start = getWeekStart(today);
    return { start, end: toDateKey(toDayNumber(start) + 6) };
  }
  if (unit === "month") {
    const monthStart = `${today.slice(0, 7)}-01`;
    return { start: monthStart, end: `${today.slice(0, 7)}-${String(monthLength(today)).padStart(2, "0")}` };
  }
  return { start: `${today.slice(0, 4)}-01-01`, end: `${today.slice(0, 4)}-12-31` };
}

function axisLabel(dateKey, unit) {
  if (unit === "year") return formatDate(dateKey, { month: "short" });
  if (unit === "month") return formatDate(dateKey, { day: "numeric" });
  if (unit === "week") return formatDate(dateKey, { weekday: "short", day: "numeric" });
  return formatDate(dateKey, { month: "short", day: "numeric" });
}

// Catmull-Rom spline turned into cubic Bezier segments, so the line curves smoothly through every point.
function smoothPath(points, bottom) {
  if (!points.length) return "";
  const clampY = (y) => clamp(y, 0, bottom);
  let path = `M${points[0].x} ${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const firstX = current.x + (next.x - before.x) / 6;
    const firstY = clampY(current.y + (next.y - before.y) / 6);
    const secondX = next.x - (after.x - current.x) / 6;
    const secondY = clampY(next.y - (after.y - current.y) / 6);
    path += ` C${firstX} ${firstY} ${secondX} ${secondY} ${next.x} ${next.y}`;
  }
  return path;
}

export default function StudyChart({ entries, today }) {
  const [unit, setUnit] = useState("day");
  // How many days the right edge of the view sits before the end of the current period (0 = at present).
  const [back, setBack] = useState(0);
  const [hover, setHover] = useState(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const plotRef = useRef(null);
  const animationRef = useRef(0);
  const dragRef = useRef(null);
  const clipId = useId();

  const period = currentPeriod(unit, today);
  const periodStartDay = toDayNumber(period.start);
  const periodEndDay = toDayNumber(period.end);
  const todayDay = toDayNumber(today);
  // The view is always exactly one period wide: 1 day, 7 days, the days of the month or the days of the year.
  const width = periodEndDay - periodStartDay + 1;

  const totals = new Map();
  let earliestDay = todayDay;
  for (const entry of entries) {
    const day = toDayNumber(entry.date);
    totals.set(day, (totals.get(day) ?? 0) + entry.hours);
    earliestDay = Math.min(earliestDay, day);
  }
  const hoursOn = (day) => totals.get(day) ?? 0;

  // Scrolling is free: it can peek one full view before the first study day, then stops.
  const maxBack = width + Math.max(0, periodStartDay - earliestDay);
  const currentBack = clamp(back, 0, maxBack);
  const atPresent = currentBack < 0.001;

  const plotWidth = Math.max(1, size.width - GUTTER);
  const plotHeight = Math.max(1, size.height - AXIS_HEIGHT);
  const pxPerDay = plotWidth / width;
  // Edges are fractional so the view can sit between two days while scrolling.
  const viewEnd = periodEndDay + 1 - currentBack;
  const viewStart = viewEnd - width;
  const firstDay = Math.floor(viewStart);
  const lastDay = Math.ceil(viewEnd) - 1;
  const xOf = (day) => (day + 0.5 - viewStart) * pxPerDay;
  const inView = (day) => day >= firstDay && day <= lastDay;

  // Days after today stay on the axis but get no point, so the line stops at today.
  const pointDays = [];
  for (let day = firstDay - 1; day <= Math.min(lastDay + 1, todayDay); day += 1) pointDays.push(day);
  const visibleMax = Math.max(1, ...pointDays.filter(inView).map(hoursOn));
  const yOf = (hours) => PLOT_TOP + (plotHeight - PLOT_TOP) * (1 - hours / visibleMax);
  const points = pointDays.map((day) => ({ x: xOf(day), y: yOf(hoursOn(day)) }));

  const labelStep = Math.max(1, Math.ceil(LABEL_SPACING / pxPerDay));
  const labelDays = [];
  for (let day = firstDay; day <= lastDay; day += 1) {
    const x = xOf(day);
    if (x < 0 || x > plotWidth) continue;
    const isLabel = unit === "year" ? toDateKey(day).endsWith("-01") : (day - periodStartDay) % labelStep === 0;
    if (isLabel) labelDays.push(day);
  }

  const firstKey = toDateKey(firstDay);
  const lastKey = toDateKey(lastDay);
  const heading = firstDay === lastDay
    ? formatDate(firstKey, { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    : `${formatDate(firstKey, { month: "short", day: "numeric", year: "numeric" })} – ${formatDate(lastKey, { month: "short", day: "numeric", year: "numeric" })}`;
  const hoveredDay = hover !== null && inView(hover) && hover <= todayDay ? hover : null;
  const hasStudyInView = pointDays.some((day) => inView(day) && hoursOn(day) > 0);

  useLayoutEffect(() => {
    const element = plotRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Horizontal trackpad swipes (or shift + wheel) pan the chart freely; the page keeps its normal scroll.
  useEffect(() => {
    const element = plotRef.current;
    if (!element) return undefined;
    function handleWheel(event) {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (!delta) return;
      event.preventDefault();
      cancelAnimationFrame(animationRef.current);
      setBack((previous) => clamp(previous + delta / pxPerDay, 0, maxBack));
    }
    element.addEventListener("wheel", handleWheel, { passive: false });
    return () => element.removeEventListener("wheel", handleWheel);
  }, [pxPerDay, maxBack]);

  useEffect(() => () => cancelAnimationFrame(animationRef.current), []);

  function animateBack(target) {
    cancelAnimationFrame(animationRef.current);
    const from = currentBack;
    const startedAt = performance.now();
    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / ANIMATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setBack(from + (target - from) * eased);
      if (progress < 1) animationRef.current = requestAnimationFrame(frame);
    }
    animationRef.current = requestAnimationFrame(frame);
  }

  function selectUnit(next) {
    if (next === unit) {
      animateBack(0);
      return;
    }
    cancelAnimationFrame(animationRef.current);
    setUnit(next);
    setBack(0);
    setHover(null);
  }

  function moveView(direction) {
    animateBack(clamp(currentBack - direction * width * 0.5, 0, maxBack));
  }

  function handlePointerDown(event) {
    cancelAnimationFrame(animationRef.current);
    dragRef.current = { x: event.clientX, back: currentBack };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (dragRef.current) {
      const dragged = (event.clientX - dragRef.current.x) / pxPerDay;
      setBack(clamp(dragRef.current.back + dragged, 0, maxBack));
      return;
    }
    const localX = event.clientX - event.currentTarget.getBoundingClientRect().left - GUTTER;
    setHover(localX >= 0 && localX <= plotWidth ? Math.floor(viewStart + localX / pxPerDay) : null);
  }

  function endDrag() {
    dragRef.current = null;
  }

  return (
    <div className="chart-card">
      <div className="chart-heading">
        <div><div className="section-kicker">YOUR CONSISTENCY</div><h2>{heading}</h2></div>
        <span className="chart-legend"><span /> Hours studied</span>
      </div>
      <div className="chart-controls">
        <div className="chart-range-controls">
          <select
            className="chart-current-select"
            aria-label="Jump to current period"
            value={atPresent ? unit : ""}
            onChange={(event) => selectUnit(event.target.value)}
          >
            <option value="" disabled>Current</option>
            {UNITS.map(([value]) => (
              <option value={value} key={value}>{CURRENT_LABELS[value]}</option>
            ))}
          </select>
          <div className="chart-period-select" role="group" aria-label="Chart grouping">
            {UNITS.map(([value, label]) => (
              <button
                type="button"
                className={unit === value ? "selected" : ""}
                key={value}
                aria-pressed={unit === value}
                onClick={() => selectUnit(value)}
              >{label}</button>
            ))}
          </div>
        </div>
        <div className="chart-navigation">
          <button type="button" aria-label="Earlier" onClick={() => moveView(-1)}><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Later" disabled={atPresent} onClick={() => moveView(1)}><ChevronRight size={17} /></button>
        </div>
      </div>

      <div
        className={`study-plot ${dragRef.current ? "is-dragging" : ""}`}
        ref={plotRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`${UNITS.find(([value]) => value === unit)[1]} line chart of French study hours`}
      >
        {size.width > 0 && (
          <svg className="study-plot-svg" width={size.width} height={size.height} aria-hidden="true">
            <text className="study-plot-tick" x={GUTTER - 8} y={PLOT_TOP + 3} textAnchor="end">{formatHours(visibleMax)}h</text>
            <text className="study-plot-tick" x={GUTTER - 8} y={PLOT_TOP + (plotHeight - PLOT_TOP) / 2 + 3} textAnchor="end">{formatHours(visibleMax / 2)}h</text>
            <text className="study-plot-tick" x={GUTTER - 8} y={plotHeight + 3} textAnchor="end">0h</text>
            <defs>
              <clipPath id={clipId}><rect x="0" y="0" width={plotWidth} height={plotHeight} /></clipPath>
            </defs>
            <g transform={`translate(${GUTTER} 0)`}>
              <g clipPath={`url(#${clipId})`}>
                {[PLOT_TOP, (PLOT_TOP + plotHeight) / 2, plotHeight].map((y) => (
                  <line className="study-plot-grid" key={y} x1="0" x2={plotWidth} y1={y} y2={y} />
                ))}
                <path className="study-plot-line" d={smoothPath(points, plotHeight)} />
                {unit === "day" && pointDays.filter(inView).map((day) => (
                  <circle className="study-plot-dot" key={day} cx={xOf(day)} cy={yOf(hoursOn(day))} r="3.5" />
                ))}
                {hoveredDay !== null && (
                  <circle className="study-plot-dot" cx={xOf(hoveredDay)} cy={yOf(hoursOn(hoveredDay))} r="3.5" />
                )}
              </g>
              {hoveredDay !== null && (
                <text
                  className="study-plot-tip"
                  x={clamp(xOf(hoveredDay), 40, plotWidth - 40)}
                  y={Math.max(PLOT_TOP - 1, yOf(hoursOn(hoveredDay)) - 9)}
                  textAnchor="middle"
                >{`${formatDate(toDateKey(hoveredDay), { weekday: "short", month: "short", day: "numeric" })}: ${formatHours(hoursOn(hoveredDay))} h`}</text>
              )}
              {labelDays.map((day) => (
                <text className="study-plot-label" key={day} x={xOf(day)} y={size.height - 6} textAnchor="middle">
                  {axisLabel(toDateKey(day), unit)}
                </text>
              ))}
            </g>
          </svg>
        )}
      </div>
      {!hasStudyInView && (
        <p className="chart-range-empty">No study hours logged in this range.</p>
      )}
    </div>
  );
}
