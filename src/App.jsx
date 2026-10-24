import { useEffect, useMemo, useRef, useState } from "react";
import packageMetadata from "../package.json";
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  List,
  Moon,
  Pencil,
  Plus,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import SettingsView from "./SettingsView.jsx";
import { supabase } from "./supabase.js";

const STORAGE_KEY = "frenchify-study-entries";
const ACCOUNT_MIGRATION_KEY = "frenchify-cloud-migration";
const TABS = [
  { id: "log", label: "Log", icon: Plus },
  { id: "history", label: "History", icon: List },
  { id: "analytics", label: "Insights", icon: ChartNoAxesColumnIncreasing },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];
const DEFAULT_DAILY_GOAL_HOURS = 3;
const WEEKLY_GOAL_HOURS = 21;
const MONTHLY_GOAL_HOURS = 90;
const GOAL_HOURS = 900;
const THEME_STORAGE_KEY = "frenchify-theme";
const DAILY_GOAL_STORAGE_KEY = "frenchify-daily-goal";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const REMINDERS = [
  "Every sentence you understand is a door you have opened.",
  "Fluency grows quietly, one ordinary day at a time.",
  "A few minutes with French is still a meaningful visit.",
  "You do not need a perfect accent to make real progress.",
  "Each new word gives your thoughts a little more room.",
  "Small, steady practice beats waiting for a perfect moment.",
  "Mistakes are proof that you are reaching beyond what you know.",
  "Today’s effort is tomorrow’s familiar phrase.",
  "A language becomes yours each time you choose to use it.",
  "Ten focused minutes can change the shape of your day.",
  "You are allowed to learn slowly and still get there.",
  "Every conversation begins with the courage to try.",
  "The words that feel difficult today can feel natural later.",
  "A little French today keeps the path open for tomorrow.",
  "Listening closely is progress, even before every word makes sense.",
  "You are building understanding, not racing a clock.",
  "One page, one phrase, one small step forward.",
  "Your future French self is made from practice like this.",
  "Curiosity carries you further than perfection ever could.",
  "A language is learned in moments, not all at once.",
  "Showing up is a skill, and you are strengthening it.",
  "A new phrase is a small piece of a much bigger world.",
  "You can begin again with the next sentence.",
  "Every review makes a familiar word a little stronger.",
  "Progress counts even when it feels quiet.",
  "Let today be about understanding one thing more than yesterday.",
  "Practice turns uncertainty into something you recognize.",
  "The best study session is the one you can return to tomorrow.",
  "You do not have to know everything to say something.",
  "Each time you listen, your ear learns a little more.",
  "A patient learner is still a moving learner.",
  "French gets easier by meeting it regularly, not perfectly.",
  "Your effort is adding up, even when the change is hard to see.",
  "Learning a language is a long conversation with yourself.",
  "Keep the goal in view, but take today one phrase at a time.",
  "A familiar word once felt new to you, too.",
  "You are making room for a new way to express yourself.",
  "A short session is still a promise kept to your goal.",
  "Every question you ask is part of learning the answer.",
  "The next step does not need to be a big one.",
  "You are closer to understanding than you were before you began.",
  "Language learning rewards the people who come back.",
  "Take your time; comprehension is built one layer at a time.",
  "A quiet study day is still a good day to begin.",
  "You are learning to hear more than sounds; you are hearing meaning.",
  "The words will come. Give them a place to land.",
  "One French sentence today is more than none yesterday.",
  "Steady practice makes room for spontaneous conversation.",
  "You can be a beginner and be proud at the same time.",
  "Repetition is not going backward; it is making knowledge stick.",
  "Let your curiosity choose the next word.",
  "The path to fluency is made of days just like this one.",
  "A little consistency is kinder than a lot of pressure.",
  "You are not behind; you are learning at your own pace.",
  "Every listening minute trains a skill you cannot see yet.",
  "A language learned with patience stays with you.",
  "Celebrate what you understood, then keep exploring.",
  "French is becoming more familiar every time you return.",
  "You can make meaningful progress in a small pocket of time.",
  "Keep going gently; there is no deadline on understanding.",
];

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(dateKey, amount) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function shiftMonth(dateKey, amount) {
  const [year, month] = dateKey.split("-").map(Number);
  return localDateKey(new Date(year, month - 1 + amount, 1));
}

function monthLength(dateKey) {
  const [year, month] = dateKey.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function getMonthLabel(dateKey) {
  return formatDate(`${dateKey.slice(0, 7)}-01`, { month: "long", year: "numeric" });
}

function formatDate(dateKey, options = { weekday: "short", month: "short", day: "numeric" }) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en", options).format(
    new Date(year, month - 1, day),
  );
}

function formatHours(value) {
  return Number(value.toFixed(2)).toString();
}

function isEntry(value) {
  return (
    value &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    Number.isFinite(value.hours) &&
    value.hours > 0
  );
}

function mergeEntries(entries) {
  const totals = new Map();
  for (const entry of entries) {
    totals.set(entry.date, (totals.get(entry.date) ?? 0) + entry.hours);
  }
  return Array.from(totals, ([date, hours]) => ({ date, hours }));
}

function getStoredValue(key) {
  const legacyKey = key.replace(/^frenchify-/, "thecanadiandream-");
  const storedValue = window.localStorage.getItem(key);
  if (storedValue !== null) return storedValue;

  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue !== null) window.localStorage.setItem(key, legacyValue);
  return legacyValue;
}

function readEntries() {
  const raw = getStoredValue(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isEntry)) {
    throw new Error("Saved study data is in an unexpected format.");
  }
  return mergeEntries(parsed);
}

function sumEntries(entries) {
  return entries.reduce((sum, entry) => sum + entry.hours, 0);
}

function getWeekStart(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return localDateKey(date);
}

function getDailyReminder() {
  const dayNumber = Math.floor(
    Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    ) / 86400000,
  );
  return REMINDERS[((dayNumber % REMINDERS.length) + REMINDERS.length) % REMINDERS.length];
}

function formatDuration(hours) {
  const wholeMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(wholeMinutes / 60);
  const minutes = wholeMinutes % 60;
  if (!wholeHours) return `${minutes} min`;
  if (!minutes) return `${wholeHours} hr`;
  return `${wholeHours} hr ${minutes} min`;
}

function formatTimeToGoal(hours) {
  if (!Number.isFinite(hours) || hours <= 0) return "not enough data";
  const days = Math.ceil(hours);
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  const weeks = Math.ceil(days / 7);
  if (weeks < 9) return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  const months = Math.ceil(days / 30.4375);
  if (months < 24) return `${months} ${months === 1 ? "month" : "months"}`;
  const years = Math.floor(days / 365.25);
  const remainingMonths = Math.round((days - years * 365.25) / 30.4375);
  return remainingMonths > 0
    ? `${years}y ${remainingMonths}mo`
    : `${years} ${years === 1 ? "year" : "years"}`;
}

function App() {
  const [entries, setEntries] = useState([]);
  const [entriesOwner, setEntriesOwner] = useState(undefined);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [cloudStatus, setCloudStatus] = useState(supabase ? "loading" : "unconfigured");
  const [cloudMessage, setCloudMessage] = useState("");
  const [cloudAttempt, setCloudAttempt] = useState(0);
  const [syncAttempt, setSyncAttempt] = useState(0);
  const entryOwnerRef = useRef(undefined);
  const cloudReadyUserRef = useRef(null);
  const lastSyncedEntriesRef = useRef([]);
  const lastSyncedPreferencesRef = useRef(null);
  const syncQueueRef = useRef(Promise.resolve());
  const [activeTab, setActiveTab] = useState("log");
  const [dailyGoalHours, setDailyGoalHours] = useState(() => {
    try {
      const savedGoal = Number(getStoredValue(DAILY_GOAL_STORAGE_KEY));
      return Number.isFinite(savedGoal) && savedGoal > 0 && savedGoal <= 24
        ? savedGoal
        : DEFAULT_DAILY_GOAL_HOURS;
    } catch {
      return DEFAULT_DAILY_GOAL_HOURS;
    }
  });
  const [goalDraft, setGoalDraft] = useState("");
  const [editingGoal, setEditingGoal] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return getStoredValue(THEME_STORAGE_KEY) === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const [date, setDate] = useState(localDateKey());
  const [hours, setHours] = useState("");
  const [unit, setUnit] = useState("hours");
  const [editingDate, setEditingDate] = useState(null);
  const [historyMonth, setHistoryMonth] = useState(`${localDateKey().slice(0, 7)}-01`);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(localDateKey());
  const [chartPeriod, setChartPeriod] = useState("day");
  const [chartAnchor, setChartAnchor] = useState(localDateKey());
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState("");
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(localDateKey());

  useEffect(() => {
    const interval = window.setInterval(() => setToday(localDateKey()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      setEntries(readEntries());
      entryOwnerRef.current = null;
      setEntriesOwner(null);
    } catch (error) {
      setStorageError(
        error instanceof Error ? error.message : "Could not read saved study data.",
      );
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setCloudMessage(error.message);
        setCloudStatus("error");
      }
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    }).catch((error) => {
      if (!active) return;
      setCloudMessage(error instanceof Error ? error.message : "Could not check your sign-in status.");
      setCloudStatus("error");
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || !authReady) return undefined;

    if (!authUser) {
      cloudReadyUserRef.current = null;
      lastSyncedEntriesRef.current = [];
      lastSyncedPreferencesRef.current = null;
      setCloudStatus(supabase ? "signed-out" : "unconfigured");
      try {
        setEntries(readEntries());
        entryOwnerRef.current = null;
        setEntriesOwner(null);
      } catch (error) {
        setStorageError(
          error instanceof Error ? error.message : "Could not read saved study data.",
        );
      }
      return undefined;
    }

    let active = true;
    const userId = authUser.id;
    cloudReadyUserRef.current = null;
    setCloudStatus("loading");
    setCloudMessage("");

    async function loadAccountEntries() {
      const { data: remoteRows, error: readError } = await supabase
        .from("study_entries")
        .select("study_date, hours")
        .eq("user_id", userId)
        .order("study_date");
      if (readError) throw readError;

      const remoteEntries = remoteRows.map((row) => ({
        date: row.study_date,
        hours: Number(row.hours),
      }));
      const migrationKey = `${ACCOUNT_MIGRATION_KEY}:${userId}`;
      const hasMigrated = getStoredValue(migrationKey) === "true";
      let accountEntries = remoteEntries;

      if (!hasMigrated) {
        const localEntries = readEntries();
        accountEntries = mergeEntries([...remoteEntries, ...localEntries]).sort(
          (left, right) => left.date.localeCompare(right.date),
        );
        if (accountEntries.length) {
          const { error: importError } = await supabase
            .from("study_entries")
            .upsert(
              accountEntries.map((entry) => ({
                user_id: userId,
                study_date: entry.date,
                hours: entry.hours,
              })),
              { onConflict: "user_id,study_date" },
            );
          if (importError) throw importError;
        }
      }

      const { data: remotePreferences, error: preferencesError } = await supabase
        .from("account_preferences")
        .select("daily_goal_hours, theme")
        .eq("user_id", userId)
        .maybeSingle();
      if (preferencesError) throw preferencesError;

      let accountPreferences = {
        dailyGoalHours,
        theme,
      };
      if (remotePreferences) {
        accountPreferences = {
          dailyGoalHours: Number(remotePreferences.daily_goal_hours),
          theme: remotePreferences.theme,
        };
      } else {
        const { error: preferencesSaveError } = await supabase
          .from("account_preferences")
          .upsert({
            user_id: userId,
            daily_goal_hours: dailyGoalHours,
            theme,
          });
        if (preferencesSaveError) throw preferencesSaveError;
      }

      if (!active) return;
      if (!hasMigrated) {
        window.localStorage.setItem(migrationKey, "true");
        window.localStorage.removeItem(STORAGE_KEY);
      }
      cloudReadyUserRef.current = userId;
      entryOwnerRef.current = userId;
      setEntriesOwner(userId);
      lastSyncedEntriesRef.current = accountEntries;
      lastSyncedPreferencesRef.current = accountPreferences;
      setEntries(accountEntries);
      setDailyGoalHours(accountPreferences.dailyGoalHours);
      setTheme(accountPreferences.theme);
      setCloudStatus("synced");
    }

    loadAccountEntries().catch((error) => {
      if (!active) return;
      cloudReadyUserRef.current = null;
      setCloudMessage(error instanceof Error ? error.message : "Could not load your cloud study data.");
      setCloudStatus("error");
    });

    return () => {
      active = false;
    };
  }, [authReady, authUser, ready, cloudAttempt]);

  useEffect(() => {
    if (!ready || !authReady || entriesOwner !== (authUser?.id ?? null)) return;
    try {
      const storageKey = authUser ? `${STORAGE_KEY}:${authUser.id}` : STORAGE_KEY;
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
      setStorageError("");
    } catch {
      setStorageError("Your browser could not save changes. Check its storage settings.");
    }
  }, [authReady, authUser, entries, entriesOwner, ready]);

  useEffect(() => {
    if (
      !authUser ||
      cloudReadyUserRef.current !== authUser.id ||
      entryOwnerRef.current !== authUser.id
    ) return;

    const userId = authUser.id;
    const nextEntries = entries;
    setCloudStatus("syncing");
    syncQueueRef.current = syncQueueRef.current.then(async () => {
      const previousByDate = new Map(
        lastSyncedEntriesRef.current.map((entry) => [entry.date, entry.hours]),
      );
      const nextByDate = new Map(nextEntries.map((entry) => [entry.date, entry.hours]));
      const changedEntries = nextEntries.filter(
        (entry) => previousByDate.get(entry.date) !== entry.hours,
      );
      const deletedDates = [...previousByDate.keys()].filter(
        (dateKey) => !nextByDate.has(dateKey),
      );
      const nextPreferences = { dailyGoalHours, theme };
      const previousPreferences = lastSyncedPreferencesRef.current;

      if (changedEntries.length) {
        const { error } = await supabase.from("study_entries").upsert(
          changedEntries.map((entry) => ({
            user_id: userId,
            study_date: entry.date,
            hours: entry.hours,
          })),
          { onConflict: "user_id,study_date" },
        );
        if (error) throw error;
      }
      if (deletedDates.length) {
        const { error } = await supabase
          .from("study_entries")
          .delete()
          .eq("user_id", userId)
          .in("study_date", deletedDates);
        if (error) throw error;
      }
      if (
        !previousPreferences ||
        previousPreferences.dailyGoalHours !== nextPreferences.dailyGoalHours ||
        previousPreferences.theme !== nextPreferences.theme
      ) {
        const { error } = await supabase.from("account_preferences").upsert({
          user_id: userId,
          daily_goal_hours: nextPreferences.dailyGoalHours,
          theme: nextPreferences.theme,
        });
        if (error) throw error;
      }

      lastSyncedEntriesRef.current = nextEntries;
      lastSyncedPreferencesRef.current = nextPreferences;
      if (cloudReadyUserRef.current === userId) {
        setCloudStatus("synced");
        setCloudMessage("");
      }
    }).catch((error) => {
      if (cloudReadyUserRef.current === userId) {
        setCloudMessage(error instanceof Error ? error.message : "Could not sync your study data.");
        setCloudStatus("error");
      }
    });
  }, [authUser, dailyGoalHours, entries, syncAttempt, theme]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#101116" : "#f8f8f6");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      setStorageError("Your browser could not save your theme preference.");
    }
  }, [theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DAILY_GOAL_STORAGE_KEY, String(dailyGoalHours));
    } catch {
      setStorageError("Your browser could not save your daily goal.");
    }
  }, [dailyGoalHours]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const entryByDate = useMemo(
    () => new Map(entries.map((entry) => [entry.date, entry])),
    [entries],
  );
  const totalHours = useMemo(() => sumEntries(entries), [entries]);
  const firstEntryDate = entries.reduce(
    (earliest, entry) => (entry.date < earliest ? entry.date : earliest),
    today,
  );
  const trackedDays = entries.length
    ? Math.max(
        1,
        Math.floor(
          (new Date(`${today}T00:00:00`) -
            new Date(`${firstEntryDate}T00:00:00`)) /
            86400000,
        ) + 1,
      )
    : 0;
  const dailyAverage = trackedDays ? totalHours / trackedDays : 0;
  const currentStreak = useMemo(() => {
    const start = entryByDate.has(today) ? today : shiftDate(today, -1);
    let streak = 0;
    for (let day = start; entryByDate.has(day); day = shiftDate(day, -1)) {
      streak += 1;
    }
    return streak;
  }, [entryByDate, today]);

  const weekStart = getWeekStart(today);
  const lastWeekStart = shiftDate(weekStart, -7);
  const lastWeekEnd = shiftDate(today, -7);
  const thisWeekHours = entries
    .filter((entry) => entry.date >= weekStart && entry.date <= today)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const lastWeekHours = entries
    .filter((entry) => entry.date >= lastWeekStart && entry.date <= lastWeekEnd)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const weekChange =
    lastWeekHours === 0
      ? null
      : ((thisWeekHours - lastWeekHours) / lastWeekHours) * 100;
  const monthStart = `${today.slice(0, 7)}-01`;
  const elapsedMonthDays = Number(today.slice(8, 10));
  const thisMonthHours = entries
    .filter((entry) => entry.date >= monthStart && entry.date <= today)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const overallDailyPace = trackedDays ? totalHours / trackedDays : 0;
  const remainingGoalHours = Math.max(0, GOAL_HOURS - totalHours);
  const projectedDays =
    trackedDays >= 7 && overallDailyPace > 0
      ? remainingGoalHours / overallDailyPace
      : null;
  const dailyProgress = entryByDate.get(today)?.hours ?? 0;
  const dailyGoalProgress = Math.min(
    Math.round((dailyProgress / dailyGoalHours) * 100),
    100,
  );

  const [historyYear, historyMonthNumber] = historyMonth
    .slice(0, 7)
    .split("-")
    .map(Number);
  const historyDayCount = monthLength(historyMonth);
  const historyFirstWeekday = new Date(
    historyYear,
    historyMonthNumber - 1,
    1,
  ).getDay();
  const historyCells = [
    ...Array.from({ length: historyFirstWeekday }, () => null),
    ...Array.from({ length: historyDayCount }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const dayDate = `${historyMonth.slice(0, 7)}-${day}`;
      return {
        date: dayDate,
        day: index + 1,
        hours: entryByDate.get(dayDate)?.hours ?? 0,
        future: dayDate > today,
      };
    }),
  ];
  historyCells.push(
    ...Array.from(
      { length: (7 - (historyCells.length % 7)) % 7 },
      () => null,
    ),
  );
  const historyMonthHours = entries
    .filter((entry) => entry.date.startsWith(historyMonth.slice(0, 7)))
    .reduce((sum, entry) => sum + entry.hours, 0);

  const chartData = (() => {
    if (chartPeriod === "day") {
      return Array.from({ length: 14 }, (_, index) => {
        const day = shiftDate(chartAnchor, index - 13);
        return { key: day, date: day, label: formatDate(day, { month: "short", day: "numeric" }), hours: entryByDate.get(day)?.hours ?? 0 };
      });
    }
    if (chartPeriod === "week") {
      const currentWeek = getWeekStart(chartAnchor);
      return Array.from({ length: 12 }, (_, index) => {
        const start = shiftDate(currentWeek, (index - 11) * 7);
        const end = shiftDate(start, 6);
        const hoursInPeriod = entries
          .filter((entry) => entry.date >= start && entry.date <= end)
          .reduce((sum, entry) => sum + entry.hours, 0);
        return { key: start, date: start, label: formatDate(start, { month: "short", day: "numeric" }), hours: hoursInPeriod };
      });
    }
    if (chartPeriod === "month") {
      const anchorMonth = `${chartAnchor.slice(0, 7)}-01`;
      return Array.from({ length: 12 }, (_, index) => {
        const start = shiftMonth(anchorMonth, index - 11);
        const end = `${start.slice(0, 7)}-${String(monthLength(start)).padStart(2, "0")}`;
        const hoursInPeriod = entries
          .filter((entry) => entry.date >= start && entry.date <= end)
          .reduce((sum, entry) => sum + entry.hours, 0);
        return { key: start, date: start, label: formatDate(start, { month: "short" }), hours: hoursInPeriod };
      });
    }
    const anchorYear = Number(chartAnchor.slice(0, 4));
    return Array.from({ length: 5 }, (_, index) => {
      const year = anchorYear - (4 - index);
      const hoursInPeriod = entries
        .filter((entry) => Number(entry.date.slice(0, 4)) === year)
        .reduce((sum, entry) => sum + entry.hours, 0);
      return { key: String(year), date: `${year}-01-01`, label: String(year), hours: hoursInPeriod };
    });
  })();
  const chartMax = Math.max(...chartData.map((period) => period.hours), 1);
  const chartNextDisabled =
    chartPeriod === "day"
      ? chartAnchor >= today
      : chartPeriod === "week"
        ? getWeekStart(chartAnchor) >= weekStart
        : chartPeriod === "month"
          ? chartAnchor.slice(0, 7) >= today.slice(0, 7)
          : chartAnchor.slice(0, 4) >= today.slice(0, 4);
  const chartHeading =
    chartPeriod === "day"
      ? `${formatDate(chartData[0].date, { month: "short", day: "numeric" })} – ${formatDate(chartAnchor, { month: "short", day: "numeric", year: "numeric" })}`
      : chartPeriod === "week"
        ? `12 weeks through ${formatDate(chartAnchor, { month: "short", day: "numeric", year: "numeric" })}`
        : chartPeriod === "month"
          ? `12 months through ${getMonthLabel(chartAnchor)}`
          : `5 years through ${chartAnchor.slice(0, 4)}`;

  function moveChartPeriod(direction) {
    const amount = chartPeriod === "day" ? 14 : chartPeriod === "week" ? 12 : chartPeriod === "month" ? 12 : 5;
    setChartAnchor((anchor) => {
      const nextAnchor =
        chartPeriod === "month"
          ? shiftMonth(anchor, direction * amount)
          : chartPeriod === "year"
            ? localDateKey(new Date(Number(anchor.slice(0, 4)) + direction * amount, 0, 1))
            : shiftDate(anchor, direction * amount * (chartPeriod === "week" ? 7 : 1));
      return direction > 0 && nextAnchor > today ? today : nextAnchor;
    });
  }

  function showCurrentRange(period) {
    setChartPeriod(period);
    setChartAnchor(today);
  }

  function saveDailyGoal(event) {
    event.preventDefault();
    const goal = Number(goalDraft);
    if (!Number.isFinite(goal) || goal <= 0 || goal > 24) {
      setNotice("Choose a daily goal greater than 0 and no more than 24 hours.");
      return;
    }
    setDailyGoalHours(goal);
    setGoalDraft("");
    setEditingGoal(false);
    setNotice("Daily goal updated.");
  }

  async function signInWithGoogle() {
    if (!supabase) return;
    setCloudMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) setCloudMessage(error.message);
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not start Google sign-in.");
    }
  }

  async function signOut() {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setCloudMessage(error.message);
        setCloudStatus("error");
      }
    } catch (error) {
      setCloudMessage(error instanceof Error ? error.message : "Could not sign out.");
      setCloudStatus("error");
    }
  }

  function retryCloud() {
    if (cloudReadyUserRef.current === authUser?.id) {
      setCloudStatus("synced");
      setSyncAttempt((attempt) => attempt + 1);
      return;
    }
    setCloudStatus("loading");
    setCloudAttempt((attempt) => attempt + 1);
  }

  function selectHistoryDate(dateKey) {
    setSelectedHistoryDate((current) => current === dateKey ? "" : dateKey);
  }

  function logForDate(dateKey) {
    setDate(dateKey);
    setHours("");
    setUnit("hours");
    setEditingDate(null);
    setActiveTab("log");
  }

  function logForSelectedDate() {
    logForDate(selectedHistoryDate);
  }

  function editSelectedDateTotal() {
    const entry = entryByDate.get(selectedHistoryDate);
    if (entry) startEditing(entry);
  }

  function resetForm() {
    setDate(today);
    setHours("");
    setUnit("hours");
    setEditingDate(null);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const amount = Number(hours);
    const parsedHours = unit === "minutes" ? amount / 60 : amount;
    if (!date || date > today || !Number.isFinite(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
      setNotice("Choose a date and enter a duration between 0 and 24 hours.");
      return;
    }

    const wasEditing = Boolean(editingDate);
    setEntries((current) => {
      const existing = current.find((entry) => entry.date === date);
      const updatedHours =
        !wasEditing && existing ? existing.hours + parsedHours : parsedHours;
      return [
        ...current.filter(
          (entry) => entry.date !== date && entry.date !== editingDate,
        ),
        { date, hours: updatedHours },
      ];
    });
    setNotice(
      wasEditing
        ? "Study hours updated."
        : entries.some((entry) => entry.date === date)
          ? "Study time added to that day’s total."
          : "Study hours saved. Bien joué!",
    );
    resetForm();
  }

  function startEditing(entry) {
    setActiveTab("log");
    setDate(entry.date);
    setHours(formatHours(entry.hours));
    setUnit("hours");
    setEditingDate(entry.date);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteEntry(dateKey) {
    setEntries((current) => current.filter((entry) => entry.date !== dateKey));
    if (editingDate === dateKey) resetForm();
    setNotice("Entry deleted.");
  }

  const appDataReady =
    authReady &&
    (!authUser || (cloudStatus !== "loading" && cloudStatus !== "error"));

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(event) => event.preventDefault()}>
          <span className="brand-mark"><BookOpen size={18} strokeWidth={2.1} /></span>
          <span>Frenchify</span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> Your French practice, in one place</div>
        <button
          type="button"
          className="theme-toggle"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === "dark" ? "Light" : "Dark"} mode</span>
        </button>
      </header>

      <main className="main-content">
        <section className="page-intro">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING JOURNAL</div>
          <h1>{activeTab === "log" ? "A little French, every day." : activeTab === "history" ? "Your journey so far." : activeTab === "analytics" ? "Progress, at a glance." : "Settings & about."}</h1>
          <p>
            {activeTab === "log"
              ? "Make time for the language you love."
              : activeTab === "history"
                ? "Every session is a step closer to fluency."
                : activeTab === "analytics"
                  ? "Small steps add up to something wonderful."
                  : "App information, support, and legal details."}
          </p>
        </section>

        {storageError && (
          <div className="storage-alert" role="alert">
            <span>{storageError}</span>
            <button type="button" aria-label="Dismiss storage message" onClick={() => setStorageError("")}><X size={16} /></button>
          </div>
        )}

        {!appDataReady ? (
          <section className="cloud-state-card" role={cloudStatus === "error" ? "alert" : "status"}>
            <h2>{!authReady || cloudStatus === "loading" ? "Loading your account data…" : "Cloud data needs attention"}</h2>
            <p>
              {!authReady
                ? "Checking your sign-in status."
                : cloudStatus === "loading"
                  ? "Fetching your study journal securely from Supabase."
                  : cloudMessage || "Your data could not be loaded. Your saved entries have not been replaced."}
            </p>
            {cloudStatus === "error" && (
              <div className="cloud-state-actions">
                <button type="button" className="settings-action-button" onClick={retryCloud}>Retry</button>
                {authUser && <button type="button" className="settings-action-button secondary" onClick={signOut}>Sign out</button>}
              </div>
            )}
          </section>
        ) : activeTab === "log" && (
          <section className="log-layout">
            <div className="form-card">
              <div className="card-heading">
                <div className="card-icon lavender"><Clock3 size={19} /></div>
                <div><h2>{editingDate ? "Edit your session" : "Log your study time"}</h2><p>A few details, then you’re done.</p></div>
                <span className="today-pill"><span className="status-dot" /> {date === today ? "Today" : "Study log"}</span>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="field-label" htmlFor="study-date">Study date</label>
                <div className="input-wrap date-wrap">
                  <CalendarDays size={18} aria-hidden="true" />
                  <input
                    id="study-date"
                    type="date"
                    max={today}
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                  <CalendarDays className="date-picker-icon" size={17} aria-hidden="true" />
                </div>

                <label className="field-label hours-label" htmlFor="study-hours">Hours studied</label>
                <div className="input-wrap hours-wrap">
                  <Clock3 size={18} aria-hidden="true" />
                  <input
                    id="study-hours"
                    type="number"
                    min={unit === "minutes" ? "1" : "0.1"}
                    max={unit === "minutes" ? "1440" : "24"}
                    step={unit === "minutes" ? "1" : "any"}
                    placeholder={unit === "minutes" ? "e.g. 45" : "e.g. 1.5"}
                    value={hours}
                    onChange={(event) => setHours(event.target.value)}
                    required
                  />
                  <select
                    className="unit-select"
                    aria-label="Duration unit"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                  >
                    <option value="hours">hours</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>
                <p className="field-hint">
                  {unit === "minutes"
                    ? "Minutes are converted to hours for your totals and charts."
                    : "Decimals are welcome — 30 minutes is 0.5 hours."}
                </p>
                <button className="primary-button save-button" type="submit" disabled={!ready}>
                  {editingDate ? <Check size={17} /> : <Plus size={18} />}
                  {editingDate ? "Update session" : "Save study hours"}
                  <span className="button-arrow">↗</span>
                </button>
                {editingDate && (
                  <button className="cancel-edit" type="button" onClick={resetForm}>Cancel editing</button>
                )}
              </form>
            </div>

            <aside className="aside-stack">
              <div className="quote-card">
                <div className="quote-spark"><Sparkles size={18} /></div>
                <p className="quote-label">TODAY’S GENTLE REMINDER</p>
                <blockquote>“{getDailyReminder()}”</blockquote>
                <span className="quote-credit">A small thought for your French journey</span>
                <div className="quote-decoration" aria-hidden="true">bonjour</div>
              </div>
              <div className="daily-progress-card">
                <div className="progress-heading">
                  <div className="progress-icon"><ChartNoAxesColumnIncreasing size={16} /></div>
                  <div className="progress-heading-copy"><span className="mini-label">Today’s progress</span><strong>{formatDuration(dailyProgress)} studied</strong></div>
                  <b>{dailyGoalProgress}%</b>
                </div>
                <div className="daily-progress-track" role="progressbar" aria-label="Today's study goal progress" aria-valuemin="0" aria-valuemax={dailyGoalHours} aria-valuenow={Math.min(dailyProgress, dailyGoalHours)}>
                  <span style={{ width: `${dailyGoalProgress}%` }} />
                </div>
                <div className="daily-goal-footer">
                  <p>{dailyProgress >= dailyGoalHours ? `Daily goal reached · ${formatDuration(dailyGoalHours)} target` : `${formatDuration(dailyGoalHours - dailyProgress)} left · ${formatDuration(dailyGoalHours)} daily goal`}</p>
                  {editingGoal ? (
                    <form className="goal-edit-form" onSubmit={saveDailyGoal}>
                      <label className="visually-hidden" htmlFor="daily-goal-hours">Daily goal in hours</label>
                      <input id="daily-goal-hours" type="number" min="0.1" max="24" step="any" value={goalDraft} onChange={(event) => setGoalDraft(event.target.value)} placeholder="Hours" required autoFocus />
                      <button type="submit" aria-label="Save daily goal"><Check size={14} /></button>
                      <button type="button" aria-label="Cancel daily goal edit" onClick={() => { setGoalDraft(""); setEditingGoal(false); }}><X size={14} /></button>
                    </form>
                  ) : (
                    <button className="edit-goal-button" type="button" onClick={() => { setGoalDraft(formatHours(dailyGoalHours)); setEditingGoal(true); }}>Edit goal</button>
                  )}
                </div>
              </div>
              <div className="mini-summary">
                <div className="mini-summary-icon"><Flame size={16} /></div>
                <div><span className="mini-label">Your current streak</span><strong>{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong></div>
                <button type="button" aria-label="View insights" onClick={() => setActiveTab("analytics")}><ChevronDown size={17} /></button>
              </div>
            </aside>
          </section>
        )}

        {appDataReady && activeTab === "history" && (
          <section className="history-card">
            <div className="section-header">
              <div><div className="section-kicker">YOUR RECORDS · SUNDAY–SATURDAY</div><h2>Study calendar</h2></div>
              <span className="count-pill">{entries.length} {entries.length === 1 ? "day logged" : "days logged"}</span>
            </div>
            <div className="calendar-toolbar">
              <button
                className="calendar-nav-button"
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  const nextMonth = shiftMonth(historyMonth, -1);
                  setHistoryMonth(nextMonth);
                  setSelectedHistoryDate(nextMonth);
                }}
              ><ChevronLeft size={18} /></button>
              <strong>{getMonthLabel(historyMonth)}</strong>
              <button
                className="calendar-nav-button"
                type="button"
                aria-label="Next month"
                disabled={historyMonth.slice(0, 7) >= today.slice(0, 7)}
                onClick={() => {
                  const nextMonth = shiftMonth(historyMonth, 1);
                  setHistoryMonth(nextMonth);
                  setSelectedHistoryDate(nextMonth);
                }}
              ><ChevronRight size={18} /></button>
            </div>
            <div className="calendar-month-summary">
              <span>{getMonthLabel(historyMonth)}</span>
              <strong>{formatHours(historyMonthHours)} <small>hours logged</small></strong>
            </div>
            <div className="calendar-grid" role="grid" aria-label={`Study calendar for ${getMonthLabel(historyMonth)}`}>
              {WEEKDAYS.map((weekday) => <div className="calendar-weekday" role="columnheader" key={weekday}>{weekday}</div>)}
              {historyCells.map((cell, index) => cell ? (
                <div
                  className={`calendar-day ${cell.hours ? "has-study" : ""} ${cell.date === today ? "calendar-today" : ""} ${cell.future ? "future-day" : ""} ${selectedHistoryDate === cell.date ? "calendar-selected" : ""}`}
                  role="gridcell"
                  aria-selected={selectedHistoryDate === cell.date}
                  tabIndex={0}
                  onClick={() => selectHistoryDate(cell.date)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectHistoryDate(cell.date);
                    }
                  }}
                  key={cell.date}
                >
                  {!cell.future && (
                    <div className="calendar-actions">
                      {cell.hours > 0 ? (
                        <>
                          <button
                            type="button"
                            aria-label={`Edit study hours for ${formatDate(cell.date, { month: "long", day: "numeric", year: "numeric" })}`}
                            title="Edit study hours"
                            onClick={(event) => {
                              event.stopPropagation();
                              const entry = entryByDate.get(cell.date);
                              if (entry) startEditing(entry);
                            }}
                          ><Pencil size={13} /></button>
                          <button
                            type="button"
                            aria-label={`Delete study hours for ${formatDate(cell.date, { month: "long", day: "numeric", year: "numeric" })}`}
                            title="Delete study hours"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteEntry(cell.date);
                            }}
                          ><Trash2 size={13} /></button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Log study time for ${formatDate(cell.date, { month: "long", day: "numeric", year: "numeric" })}`}
                          title="Log study time"
                          onClick={(event) => {
                            event.stopPropagation();
                            logForDate(cell.date);
                          }}
                        ><Plus size={13} /></button>
                      )}
                    </div>
                  )}
                  <span className="calendar-date">{cell.day}</span>
                  {cell.hours > 0 ? (
                    <strong className="calendar-hours">{formatHours(cell.hours)}h</strong>
                  ) : null}
                </div>
              ) : <div className="calendar-day calendar-blank" aria-hidden="true" key={`blank-${index}`} />)}
            </div>
            {entries.filter((entry) => entry.date.startsWith(historyMonth.slice(0, 7))).length === 0 && (
              <div className="calendar-empty-note">
                <BookOpen size={17} />
                <span>No study hours logged this month yet. Past months stay open to explore.</span>
              </div>
            )}
            {selectedHistoryDate && (
              <div className="history-selection" aria-live="polite">
                <div className="history-selection-summary">
                  <span>{formatDate(selectedHistoryDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
                  <strong>{entryByDate.has(selectedHistoryDate) ? `${formatDuration(entryByDate.get(selectedHistoryDate).hours)} studied` : selectedHistoryDate > today ? "Future date" : "No study time logged"}</strong>
                </div>
                <div className="history-selection-actions">
                  {entryByDate.has(selectedHistoryDate) ? (
                    <>
                      <button type="button" className="selection-button" onClick={logForSelectedDate}><Plus size={15} /> Add session</button>
                      <button type="button" className="selection-button" onClick={editSelectedDateTotal}><Pencil size={14} /> Edit total</button>
                      <button type="button" className="selection-button selection-delete" onClick={() => deleteEntry(selectedHistoryDate)}><Trash2 size={14} /> Delete day</button>
                    </>
                  ) : selectedHistoryDate <= today ? (
                    <button type="button" className="selection-button" onClick={logForSelectedDate}><Plus size={15} /> Log study time</button>
                  ) : null}
                </div>
              </div>
            )}
            <button className="add-entry-button" type="button" onClick={() => { resetForm(); setActiveTab("log"); }}><Plus size={16} /> Add a study session</button>
          </section>
        )}

        {appDataReady && activeTab === "analytics" && (
          <section className="analytics-layout">
            <div className="metric-grid">
              <article className="metric-card">
                <div className="metric-top"><span>Total hours</span><span className="metric-icon indigo"><Clock3 size={17} /></span></div>
                <strong className="metric-value">{formatHours(totalHours)}<small>h</small></strong>
                <span className="metric-foot">{entries.length ? `Across ${entries.length} ${entries.length === 1 ? "study day" : "study days"}` : "Your first hour is waiting"}</span>
              </article>
              <article className="metric-card">
                <div className="metric-top"><span>Daily average</span><span className="metric-icon peach"><ChartNoAxesColumnIncreasing size={17} /></span></div>
                <strong className="metric-value">{formatHours(dailyAverage)}<small>h</small></strong>
                <span className="metric-foot">{trackedDays ? `Calendar-day average over ${trackedDays} days` : "From first study day to today"}</span>
              </article>
              <article className="metric-card">
                <div className="metric-top"><span>Current streak</span><span className="metric-icon gold"><Flame size={17} /></span></div>
                <strong className="metric-value">{currentStreak}<small>{currentStreak === 1 ? "day" : "days"}</small></strong>
                <span className="metric-foot">{currentStreak ? "Keep your momentum going" : "Log today to start a streak"}</span>
              </article>
            </div>

            <div className="chart-card">
              <div className="chart-heading">
                <div><div className="section-kicker">YOUR CONSISTENCY</div><h2>{chartHeading}</h2></div>
                <span className="chart-legend"><span /> Hours studied</span>
              </div>
              <div className="chart-controls">
                <div className="chart-range-controls">
                  <select
                    className="chart-current-select"
                    aria-label="Jump to current period"
                    value={chartAnchor === today ? chartPeriod : ""}
                    onChange={(event) => showCurrentRange(event.target.value)}
                  >
                    <option value="">Current</option>
                    <option value="day">Today</option>
                    <option value="week">This week</option>
                    <option value="month">This month</option>
                    <option value="year">This year</option>
                  </select>
                  <div className="chart-period-select" role="group" aria-label="Chart grouping">
                    {[
                      ["day", "Day"],
                      ["week", "Week"],
                      ["month", "Month"],
                      ["year", "Year"],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        className={chartPeriod === value ? "selected" : ""}
                        key={value}
                        aria-pressed={chartPeriod === value}
                        onClick={() => setChartPeriod(value)}
                      >{label}</button>
                    ))}
                  </div>
                </div>
                <div className="chart-navigation">
                  <button type="button" aria-label="Previous chart range" onClick={() => moveChartPeriod(-1)}><ChevronLeft size={17} /></button>
                  <button type="button" aria-label="Next chart range" disabled={chartNextDisabled} onClick={() => moveChartPeriod(1)}><ChevronRight size={17} /></button>
                </div>
              </div>
              <div className="chart-area" role="img" aria-label={`${{ day: "Daily", week: "Weekly", month: "Monthly", year: "Yearly" }[chartPeriod]} bar chart of French study hours`}>
                <div className="chart-guides"><span>{formatHours(chartMax)}h</span><span>{formatHours(chartMax / 2)}h</span><span>0h</span></div>
                <div className={`bar-chart chart-bars-${chartPeriod}`}>
                  {chartData.map((period, index) => (
                    <div className={`bar-column ${period.hours > 0 ? "has-hours" : ""} ${period.date === today ? "is-today" : ""}`} key={period.key} title={`${period.label}: ${formatHours(period.hours)} hours`}>
                      <div className="bar-track"><div className="bar-fill" style={{ height: `${period.hours ? Math.max((period.hours / chartMax) * 100, 5) : 0}%` }} /></div>
                      <span className="bar-label">{chartPeriod === "day" && index % 2 !== 0 && index !== chartData.length - 1 ? "" : period.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {chartData.every((period) => period.hours === 0) && (
                <p className="chart-range-empty">No study hours logged in this range.</p>
              )}
            </div>

            <div className="insight-grid">
              <article className="insight-card">
                <div className="insight-icon"><Sparkles size={17} /></div>
                <div className="insight-content">
                  <span className="section-kicker">YOUR 900-HOUR GOAL</span>
                  {totalHours >= GOAL_HOURS ? (
                    <>
                      <h3>You’ve reached 900 hours. Félicitations!</h3>
                      <p>Your recorded total is {formatHours(totalHours)} hours.</p>
                    </>
                  ) : projectedDays !== null ? (
                    <>
                      <h3>{formatHours(remainingGoalHours)} hours to go — about {formatTimeToGoal(projectedDays)} at your current pace.</h3>
                      <p>
                        {formatHours(overallDailyPace)} hours per calendar day across {trackedDays} days since your first log. This is a straight-line estimate, not a promise; breaks or a changed routine will shift it.
                      </p>
                    </>
                  ) : entries.length ? (
                    <>
                      <h3>You have {formatHours(remainingGoalHours)} hours left to your goal.</h3>
                      <p>There are fewer than 7 days of tracking so far, so an arrival estimate would be misleading. Keep logging to establish a useful pace.</p>
                    </>
                  ) : (
                    <>
                      <h3>Your 900-hour goal starts with your first session.</h3>
                      <p>No study hours have been logged yet, so there is not enough information to estimate a timeline.</p>
                    </>
                  )}
                </div>
              </article>
              <article className="insight-card weekly-insight-card">
                <div className="insight-icon"><ChartNoAxesColumnIncreasing size={17} /></div>
                <div className="insight-content">
                  <span className="section-kicker">THIS WEEK · 21 HOUR GOAL</span>
                  {weekChange !== null ? (
                    <>
                      <h3>{weekChange > 0 ? `${Math.round(weekChange)}% more` : weekChange < 0 ? `${Math.round(Math.abs(weekChange))}% less` : "Same hours"} than last week by this day</h3>
                      <p>{formatHours(thisWeekHours)} hours this week vs. {formatHours(lastWeekHours)} during the same days last week.</p>
                    </>
                  ) : (
                    <>
                      <h3>{thisWeekHours > 0 ? `${formatHours(thisWeekHours)} hours logged so far` : "No hours logged this week yet"}</h3>
                      <p>{lastWeekHours > 0 ? `${formatHours(lastWeekHours)} hours were logged by this day last week; there is not enough current-week data for a comparison.` : "A week-over-week comparison will appear once there is data for both periods."}</p>
                    </>
                  )}
                </div>
                <div className="target-progress" role="progressbar" aria-label="Weekly study goal progress" aria-valuemin="0" aria-valuemax={WEEKLY_GOAL_HOURS} aria-valuenow={Math.min(thisWeekHours, WEEKLY_GOAL_HOURS)}>
                  <span style={{ width: `${Math.min((thisWeekHours / WEEKLY_GOAL_HOURS) * 100, 100)}%` }} />
                </div>
                <small className="target-caption">{formatHours(thisWeekHours)} / {WEEKLY_GOAL_HOURS} hours · {formatHours(Math.max(WEEKLY_GOAL_HOURS - thisWeekHours, 0))} left</small>
              </article>
              <article className="insight-card weekly-insight-card monthly-insight-card">
                <div className="insight-icon"><CalendarDays size={17} /></div>
                <div className="insight-content">
                  <span className="section-kicker">THIS MONTH · 90 HOUR GOAL</span>
                  <h3>{thisMonthHours > 0 ? `${formatHours(thisMonthHours)} hours logged so far` : "No hours logged this month yet"}</h3>
                  <p>{formatHours(thisMonthHours / elapsedMonthDays)} hours per calendar day so far this month.</p>
                </div>
                <div className="target-progress" role="progressbar" aria-label="Monthly study goal progress" aria-valuemin="0" aria-valuemax={MONTHLY_GOAL_HOURS} aria-valuenow={Math.min(thisMonthHours, MONTHLY_GOAL_HOURS)}>
                  <span style={{ width: `${Math.min((thisMonthHours / MONTHLY_GOAL_HOURS) * 100, 100)}%` }} />
                </div>
                <small className="target-caption">{formatHours(thisMonthHours)} / {MONTHLY_GOAL_HOURS} hours · {formatHours(Math.max(MONTHLY_GOAL_HOURS - thisMonthHours, 0))} left</small>
              </article>
            </div>
          </section>
        )}

        {appDataReady && activeTab === "settings" && (
          <SettingsView
            appVersion={packageMetadata.version}
            buildNumber={packageMetadata.buildNumber}
            developerName="Ajay Kumar Reddy"
            supportEmail="ajayreddy.tech@gmail.com"
            legalDomain={import.meta.env.VITE_LEGAL_DOMAIN || ""}
            kofiUrl={import.meta.env.VITE_KOFI_URL || "https://ko-fi.com/ajayreddytech"}
            paypalUrl={import.meta.env.VITE_PAYPAL_ME_URL || ""}
            githubSponsorsUrl={import.meta.env.VITE_GITHUB_SPONSORS_URL || ""}
            authConfigured={Boolean(supabase)}
            authLoading={!authReady}
            userEmail={authUser?.email || ""}
            cloudStatus={cloudStatus}
            cloudMessage={cloudMessage}
            onGoogleSignIn={signInWithGoogle}
            onSignOut={signOut}
            onRetryCloud={retryCloud}
            onLinkError={() => setNotice("Could not open that link. Check whether a browser or email app is available.")}
          />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Main navigation">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            className={`nav-item ${activeTab === id ? "active" : ""}`}
            key={id}
            onClick={() => { setActiveTab(id); setNotice(""); }}
            aria-current={activeTab === id ? "page" : undefined}
          >
            <Icon size={19} strokeWidth={activeTab === id ? 2.2 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {notice && (
        <div className={`toast ${notice.includes("between") || notice.startsWith("Could not open") ? "toast-error" : ""}`} role="status">
          {notice.includes("between") || notice.startsWith("Could not open") ? <X size={17} /> : <Check size={17} />}
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

export default App;
