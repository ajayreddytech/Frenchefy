// Date helpers shared by the app and the study chart.

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftDate(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

export function shiftMonth(dateKey, amount) {
  const [year, month] = dateKey.split("-").map(Number);
  return localDateKey(new Date(year, month - 1 + amount, 1));
}

export function monthLength(dateKey) {
  const [year, month] = dateKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function getMonthLabel(dateKey) {
  return formatDate(`${dateKey.slice(0, 7)}-01`, { month: "long", year: "numeric" });
}

export function formatDate(dateKey, options = { weekday: "short", month: "short", day: "numeric" }) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", options).format(
    new Date(year, month - 1, day),
  );
}

export function getWeekStart(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return localDateKey(date);
}
