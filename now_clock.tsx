import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  ScrollView, FlatList, Pressable, SafeAreaView, useWindowDimensions, Dimensions
} from "react-native";

// --- Constants & Utilities ---
const SCREEN = Dimensions.get("window");
const pastelThemes = [
  { id: 0, mainBG: "#f5e5fe", navbarBG: "#e3d4f7", accent: "#bfaced", text: "#222a44", grad1: "#dde9fa", grad2: "#f7d3e2" },
  { id: 1, mainBG: "#ffefe9", navbarBG: "#fae7f1", accent: "#ffc1cc", text: "#512e5f", grad1: "#ffd6e0", grad2: "#e1f7fa" },
  { id: 2, mainBG: "#e7fffa", navbarBG: "#dafaf3", accent: "#a4f9c8", text: "#23684a", grad1: "#f7fee7", grad2: "#e1d8fa" },
  { id: 3, mainBG: "#fffbe4", navbarBG: "#ffefd2", accent: "#ffe0ac", text: "#534c29", grad1: "#fffbe6", grad2: "#ffe7de" }
];
const themedIndex = () => {
  const year = new Date().getFullYear();
  return ((year - 2020) % pastelThemes.length);
};
const pad = (n) => n.toString().padStart(2, "0");
const getTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
const getDate = () => new Date().toDateString();
const getWeekDays = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};
const getMonthDays = () => {
  const days = [];
  const d = new Date();
  d.setDate(1);
  const month = d.getMonth();
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
};

// --- Reusable Components ---
const ScreenContainer = ({ children, theme, style }) => (
  <ScrollView
    contentContainerStyle={[styles.screenContent, style]}
    style={[styles.screen, { backgroundColor: theme.mainBG }]}
    automaticallyAdjustKeyboardInsets={true}
  >
    {children}
  </ScrollView>
);

const ThemedButton = ({ children, onPress, theme, isPrimary=false, style, textStyle, disabled=false }) => (
  <TouchableOpacity 
    style={[
      styles.btn, 
      { 
        backgroundColor: isPrimary ? theme.accent : theme.navbarBG,
        opacity: disabled ? 0.6 : 1,
      },
      style
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[{ color: isPrimary ? theme.mainBG : theme.text }, textStyle]}>
      {children}
    </Text>
  </TouchableOpacity>
);

function PastelToggle({ theme, themeIdx, setThemeIdx }) {
  return (
    <View style={styles.uiverseContainer}>
      <TouchableOpacity
        style={[styles.switch, { backgroundColor: theme.navbarBG }]}
        onPress={() => setThemeIdx((themeIdx + 1) % pastelThemes.length)}
      >
        <View style={[styles.indicator, styles.leftIndicator, { backgroundColor: theme.grad1 }]} />
        <View style={[styles.indicator, styles.rightIndicator, { backgroundColor: theme.grad2 }]} />
        <View
          style={[
            styles.toggleButton,
            {
              left: themeIdx % 2 ? "62%" : "8%",
              backgroundColor: theme.mainBG,
              shadowColor: theme.accent,
              borderColor: theme.accent,
            }
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

function DayProgressBar({ theme, percent, containerStyle, labelStyle }) {
  return (
    <View style={[styles.dayBarBox, containerStyle]}>
      <Text style={[styles.dayBarText, { color: theme.text }, labelStyle]}>
        Day Progress: {(percent * 100).toFixed(1)}%
      </Text>
      <View style={[
        styles.dayBar, { backgroundColor: theme.grad2, borderColor: theme.accent }
      ]}>
        <View style={[
          styles.dayBarFill, { backgroundColor: theme.accent, width: `${percent * 100}%` }
        ]} />
      </View>
    </View>
  );
}

function FlipDigit({ value, panelSize }) {
  return (
    <View style={[styles.flipDigitContainer, { width: panelSize, height: panelSize * 0.7 }]}>
      <Text style={[styles.flipDigitText, { fontSize: Math.max(panelSize * 0.45, 60) }]}>{value}</Text>
      <View style={styles.flipSplitLine} />
    </View>
  );
}

// --------------------- Flip Clock screen, responsive and landscape-aware ---------------------
function FlipClockScreen({ theme, setNowScreen }) {
  const dimensions = useWindowDimensions();
  const isLandscape = dimensions.width > dimensions.height;
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  let hour = time.getHours();
  const minute = time.getMinutes();
  const ampm = hour < 12 ? "AM" : "PM";
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const percentWide = (time.getHours() * 3600 + minute * 60 + time.getSeconds()) / 86400;

  // Sizes based on window for true responsiveness
  const panelSize = Math.min(dimensions.width, dimensions.height) / (isLandscape ? 2.5 : 1.7);

  return (
    <View style={[
      styles.flipClockScreen,
      { backgroundColor: theme.mainBG, flexDirection: isLandscape ? "row" : "column", alignItems: "center", justifyContent: "center" }
    ]}>
      <View style={{ position: 'absolute', left: 0, top: 0 }}>
        <TouchableOpacity onPress={() => setNowScreen("Options")} style={{ padding: 16 }}>
          <Text style={[styles.backLink, { color: theme.accent, fontWeight: "bold", fontSize: 18 }]}>
            {'\u2039'} Options
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[
        isLandscape ? styles.landscapeClockContainer : styles.portraitClockContainer,
        { alignItems: "center", justifyContent: "center" }
      ]}>
        <View style={[styles.flipClockRow, { gap: Math.floor(panelSize*0.08) }]}>
          <View style={[styles.flipPanel, { backgroundColor: theme.accent, width: panelSize, height: panelSize * 0.95 }]}>
            <Text style={[styles.ampmLabel, { color: "#fff", fontSize: Math.max(panelSize/6, 21) }]}>
              {ampm}
            </Text>
            <FlipDigit value={hour} panelSize={panelSize} />
          </View>
          <View style={[styles.flipPanel, { backgroundColor: theme.accent, width: panelSize, height: panelSize * 0.95 }]}>
            <FlipDigit value={pad(minute)} panelSize={panelSize} />
          </View>
        </View>
      </View>
      <DayProgressBar
        theme={theme}
        percent={percentWide}
        containerStyle={isLandscape
          ? { width: panelSize * 2.22, maxWidth: 580, marginLeft: 35, marginBottom: 0 }
          : { width: "95%", maxWidth: 470, marginTop: 18, marginBottom: 0 }
        }
        labelStyle={isLandscape
          ? { fontSize: Math.max(panelSize/8, 14), marginBottom: 7 }
          : { fontSize: 19 }
        }
      />
    </View>
  );
}

// --------------------- Remaining Screens ---------------------
function WeeklyCalendarSimple({ theme }) {
  const days = getWeekDays();
  const now = new Date();
  const todayIdx = days.findIndex(d =>
    d.getDate() === now.getDate() && 
    d.getMonth() === now.getMonth() && 
    d.getFullYear() === now.getFullYear()
  );
  return (
    <View style={[styles.weekCalRow, { backgroundColor: theme.navbarBG }]}>
      {days.map((d, i) => {
        const isToday = i === todayIdx;
        const dayOfWeek = d.toLocaleString('default', { weekday: "short" });
        const dateOfMonth = d.getDate();
        return (
          <View
            key={i}
            style={[
              styles.weekDayBox,
              {
                backgroundColor: isToday ? theme.accent : theme.navbarBG,
                borderColor: theme.accent, 
                zIndex: isToday ? 1 : 0,
                shadowColor: theme.accent,
                shadowOpacity: isToday ? 0.25 : 0.09, 
                shadowRadius: isToday ? 9 : 3,
                elevation: isToday ? 5 : 2
              }
            ]}
          >
            <Text style={{ fontSize: 16, fontWeight: isToday ? "bold" : "500", color: theme.text }}>
              {dayOfWeek}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: "bold", color: theme.text }}>
              {dateOfMonth}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
function ClockScreen({ theme, localTime }) {
  const now = new Date();
  const totalSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const percent = totalSeconds / 86400;
  const percentWide = Math.min(Math.max(percent, 0), 1);
  return (
    <ScreenContainer theme={theme}>
      <View style={{ alignItems: "center", width: "100%" }}>
        <Text style={[styles.title, { color: theme.text, marginTop: 18 }]}>World Clock</Text>
        <Text style={[styles.big, { color: theme.accent, marginTop: 4 }]}>{localTime}</Text>
        <Text style={{ color: theme.text }}>{getDate()}</Text>
        <Text style={{ marginTop: 8, opacity: 0.7, color: theme.text }}>Timezone: Local</Text>
      </View>
      <WeeklyCalendarSimple theme={theme} />
      <View style={{ width: "100%", minHeight: 48, alignItems: "center", marginTop: 12 }}>
        <Text style={{ color: theme.text, marginVertical: 8 }}>
          Day Progress: {(percentWide * 100).toFixed(1)}%
        </Text>
        <View style={[
          styles.m3BarCurved,
          {
            backgroundColor: theme.navbarBG,
            borderColor: theme.accent,
            minWidth: "40%", 
            maxWidth: 600,
            marginBottom: 20
          }
        ]}>
          <View style={[
            styles.m3BarFill,
            {
              width: `${percentWide * 98}%`,
              backgroundColor: theme.accent,
              shadowColor: theme.accent,
            }
          ]} />
        </View>
      </View>
    </ScreenContainer>
  );
}
function NOWScreenOptions({ theme, setNowScreen, setThemeIdx, themeIdx }) {
  return (
    <ScreenContainer theme={theme}>
      <Text style={[styles.title, { color: theme.text }]}>NOW</Text>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Options</Text>
      <View style={styles.optionsColumn}>
        <TouchableOpacity onPress={() => setNowScreen("Timer")}>
          <Text style={[styles.optionLink, { backgroundColor: theme.navbarBG, color: theme.accent }]}>Timer</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNowScreen("Stopwatch")}>
          <Text style={[styles.optionLink, { backgroundColor: theme.navbarBG, color: theme.accent }]}>Stopwatch</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNowScreen("FlipClock")}>
          <Text style={[styles.optionLink, { backgroundColor: theme.navbarBG, color: theme.accent }]}>Flip Clock</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
      <PastelToggle theme={theme} themeIdx={themeIdx} setThemeIdx={setThemeIdx} />
      <Text style={{ marginTop: 18, opacity: 0.8, color: theme.text, textAlign: 'center' }}>
        App theme can be changed above. All other settings would appear here.
      </Text>
    </ScreenContainer>
  );
}
function TimerScreen({ theme, setNowScreen, timerSec, setTimerSec, timerActive, setTimerActive, customTime, setCustomTime }) {
  const handleSetTimer = useCallback(() => {
    const seconds = Number(customTime);
    if (!isNaN(seconds) && seconds > 0) {
      setTimerSec(seconds);
      setTimerActive(false);
      setCustomTime("");
    }
  }, [customTime, setTimerSec, setTimerActive, setCustomTime]);
  return (
    <ScreenContainer theme={theme}>
      <TouchableOpacity onPress={() => setNowScreen("Options")}>
        <Text style={[styles.backLink, { color: theme.accent }]}>{'\u2039'} Options</Text>
      </TouchableOpacity>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Timer</Text>
      <Text style={[styles.big, { color: theme.accent }]}>{formatTime(timerSec)}</Text>
      <View style={styles.row}>
        {[60, 300, 600].map((s) => (
          <ThemedButton 
            key={s} 
            theme={theme} 
            onPress={() => { setTimerSec(s); setTimerActive(false); }}
          >
            {formatTime(s)}
          </ThemedButton>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.accent, backgroundColor: theme.navbarBG }]}
          placeholder="Custom secs"
          placeholderTextColor={theme.accent}
          value={customTime}
          onChangeText={setCustomTime}
          keyboardType="numeric"
        />
        <ThemedButton theme={theme} onPress={handleSetTimer} style={{ flexGrow: 1 }} disabled={!customTime || isNaN(Number(customTime))}>
          Set
        </ThemedButton>
      </View>
      <View style={styles.row}>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={() => setTimerActive(true)} 
          disabled={!timerSec || timerActive}
        >
          Start
        </ThemedButton>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={() => setTimerActive(false)} 
          disabled={!timerActive}
        >
          Pause
        </ThemedButton>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={() => { setTimerActive(false); setTimerSec(0); setCustomTime(""); }}
        >
          Reset
        </ThemedButton>
      </View>
    </ScreenContainer>
  );
}
function StopwatchScreen({ theme, setNowScreen, stopwatchSec, stopwatchActive, setStopwatchActive, setStopwatchSec, laps, setLaps }) {
  const handleReset = useCallback(() => {
    setStopwatchActive(false);
    setStopwatchSec(0);
    setLaps([]);
  }, [setStopwatchActive, setStopwatchSec, setLaps]);
  return (
    <ScreenContainer theme={theme}>
      <TouchableOpacity onPress={() => setNowScreen("Options")}>
        <Text style={[styles.backLink, { color: theme.accent }]}>{'\u2039'} Options</Text>
      </TouchableOpacity>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Stopwatch</Text>
      <Text style={[styles.big, { color: theme.accent }]}>{formatTime(stopwatchSec)}</Text>
      <View style={styles.row}>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={() => setStopwatchActive(true)} 
          disabled={stopwatchActive}
        >
          Start
        </ThemedButton>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={() => setStopwatchActive(false)} 
          disabled={!stopwatchActive}
        >
          Pause
        </ThemedButton>
        <ThemedButton 
          theme={theme} 
          isPrimary={true} 
          onPress={handleReset}
        >
          Reset
        </ThemedButton>
      </View>
      <ThemedButton 
        theme={theme} 
        style={{ marginTop: 12 }} 
        onPress={() => setLaps([stopwatchSec, ...laps])}
        disabled={!stopwatchActive}
      >
        Lap
      </ThemedButton>
      <FlatList 
        data={laps} 
        keyExtractor={(_, i) => "" + i}
        style={styles.lapsList}
        renderItem={({ item, index }) => (
          <View style={styles.lapItem}>
            <Text style={{ color: theme.text, fontSize: 16 }}>
              Lap {laps.length - index}
            </Text>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 16 }}>
              {formatTime(item)}
            </Text>
          </View>
        )} 
      />
    </ScreenContainer>
  );
}
function CalendarScreen({ theme }) {
  const days = getMonthDays();
  const todayDate = new Date().getDate();
  const todayMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const pastelColors = [theme.accent, theme.grad1, theme.grad2, theme.mainBG, theme.navbarBG];
  return (
    <ScreenContainer theme={theme}>
      <Text style={[styles.title, { color: theme.text }]}>Calendar</Text>
      <Text style={{ marginBottom: 12, fontSize: 16, color: theme.text, fontWeight: '600' }}>
        {todayMonthYear}
      </Text>
      <View style={[styles.calGrid, { backgroundColor: theme.navbarBG }]}>
        {days.map((d, i) => {
          const isToday = d.getDate() === todayDate;
          const dayBackgroundColor = isToday ? theme.accent : pastelColors[i % pastelColors.length];
          return (
            <View
              key={d.getDate()}
              style={[
                styles.calDayBox,
                {
                  backgroundColor: dayBackgroundColor,
                  borderColor: isToday ? theme.text : 'transparent',
                  shadowColor: theme.accent, 
                  shadowRadius: isToday ? 8 : 3,
                  elevation: isToday ? 4 : 2,
                }
              ]}
            >
              <Text style={{
                fontWeight: isToday ? "bold" : "500",
                color: theme.text,
                fontSize: 18, 
                letterSpacing: 0.5
              }}>
                {d.getDate()}
              </Text>
            </View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

// --- App Main ---
export default function App() {
  const [themeIdx, setThemeIdx] = useState(themedIndex());
  const theme = pastelThemes[themeIdx];
  const [tab, setTab] = useState("Clock");
  const [nowScreen, setNowScreen] = useState("Options");
  const [localTime, setLocalTime] = useState(getTime());
  const [timerSec, setTimerSec] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const [customTime, setCustomTime] = useState("");
  const [stopwatchSec, setStopwatchSec] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const stopwatchRef = useRef(null);
  const [laps, setLaps] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => setLocalTime(getTime()), 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (timerActive && timerSec > 0) {
      timerRef.current = setInterval(() => {
        setTimerSec((s) => {
          if (s > 1) return s - 1;
          setTimerActive(false);
          return 0;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timerSec]);
  useEffect(() => {
    if (stopwatchActive) {
      stopwatchRef.current = setInterval(() => setStopwatchSec(s => s + 1), 1000);
    } else if (stopwatchRef.current) {
      clearInterval(stopwatchRef.current);
    }
    return () => clearInterval(stopwatchRef.current);
  }, [stopwatchActive]);
  const renderTab = () => {
    if (tab === "Clock") return <ClockScreen theme={theme} localTime={localTime} />;
    if (tab === "Calendar") return <CalendarScreen theme={theme} />;
    if (tab === "NOW") {
      if (nowScreen === "Options")
        return (
          <NOWScreenOptions 
            theme={theme} 
            setNowScreen={setNowScreen} 
            themeIdx={themeIdx}
            setThemeIdx={setThemeIdx}
          />
        );
      if (nowScreen === "Timer")
        return (
          <TimerScreen 
            theme={theme} 
            setNowScreen={setNowScreen} 
            timerSec={timerSec}
            setTimerSec={setTimerSec}
            timerActive={timerActive}
            setTimerActive={setTimerActive}
            customTime={customTime}
            setCustomTime={setCustomTime}
          />
        );
      if (nowScreen === "Stopwatch")
        return (
          <StopwatchScreen 
            theme={theme} 
            setNowScreen={setNowScreen} 
            stopwatchSec={stopwatchSec}
            stopwatchActive={stopwatchActive}
            setStopwatchActive={setStopwatchActive}
            setStopwatchSec={setStopwatchSec}
            laps={laps}
            setLaps={setLaps}
          />
        );
      if (nowScreen === "FlipClock") 
        return (
          <FlipClockScreen 
            theme={theme} 
            setNowScreen={setNowScreen}
          />
        );
    }
    return <ClockScreen theme={theme} localTime={localTime} />;
  };
  function BottomNavbar() {
    return (
      <SafeAreaView style={[styles.bottomNav, { backgroundColor: theme.accent, borderTopColor: theme.text }]}>
        {["Clock", "NOW", "Calendar"].map(t =>
          <TouchableOpacity 
            key={t}
            style={[
              styles.tab,
              tab === t && { backgroundColor: theme.navbarBG, borderColor: theme.text }
            ]}
            onPress={() => { 
              setTab(t); 
              if (t !== "NOW") setNowScreen("Options"); 
            }}
          >
            <Text style={{
              color: tab === t ? theme.text : theme.mainBG,
              fontWeight: tab === t ? "bold" : "600",
              fontSize: 18
            }}>
              {t}
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.mainBG }}>
      <View style={{ flex: 1 }}>
        {renderTab()}
      </View>
      <BottomNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: "100%", paddingHorizontal: 18, paddingTop: 18 },
  screenContent: { alignItems: "center", justifyContent: "flex-start", minHeight: SCREEN.height - 100 },
  row: { flexDirection: "row", marginVertical: 8, width: "100%", justifyContent: "center", alignItems: "center", gap: 8 },
  optionsColumn: { flexDirection: "column", justifyContent: "flex-start", alignItems: "center", gap: 18, marginVertical: 14 },
  optionLink: { fontSize: 16, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99, marginBottom: 3, fontWeight: '600', marginVertical: 4 },
  btn: { padding: 10, margin: 4, borderRadius: 16, flexGrow: 0, minWidth: 60, alignItems: 'center' },
  input: { borderWidth: 1, borderRadius: 12, padding: 10, margin: 8, width: 120, textAlign: "center", minWidth: 80 },
  divider: { height: 2, backgroundColor: "#e0e5eb", width: "85%", marginVertical: 18, borderRadius: 2 },
  title: { fontSize: 32, marginBottom: 14, fontWeight: "bold", textAlign: 'center' },
  sectionTitle: { fontSize: 22, marginTop: 16, marginBottom: 10, fontWeight: "bold" },
  big: { fontSize: 48, fontWeight: "bold", marginVertical: 8 },
  backLink: { fontSize: 16, marginBottom: 8, alignSelf: 'flex-start', textDecorationLine: "underline" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", shadowOpacity: 0.15, shadowOffset: { width: 0, height: 1 }, shadowRadius: 11, borderTopWidth: 2, paddingVertical: 13, paddingBottom: 16, minHeight: 60 },
  tab: { padding: 15, borderRadius: 17, marginHorizontal: 6, borderWidth: 2, borderColor: 'transparent' },
  calGrid: { flexDirection: "row", flexWrap: "wrap", width: "100%", maxWidth: 400, marginVertical: 10, justifyContent: "center", borderRadius: 32, padding: 16, gap: 12 },
  calDayBox: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: "center", justifyContent: "center", shadowOpacity: 0.16 },
  weekCalRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, marginBottom: 7, marginTop: 16, borderRadius: 26, minHeight: 64, maxWidth: SCREEN.width - 36, alignSelf: "center", paddingHorizontal: 8 },
  weekDayBox: { flexDirection: "column", alignItems: "center", justifyContent: "center", width: 44, height: 56, marginHorizontal: 2, marginVertical: 2, borderRadius: 22, borderWidth: 2, shadowOffset: { width: 0, height: 3 } },
  m3BarCurved: { height: 34, width: "90%", maxWidth: 600, borderRadius: 54, overflow: "hidden", borderWidth: 3, shadowOpacity: 0.09, shadowOffset: { width: 0, height: 3 }, shadowRadius: 9, marginVertical: 4 },
  m3BarFill: { height: "100%", borderRadius: 54, shadowOpacity: 0.16, shadowOffset: { width: 0, height: 3 }, shadowRadius: 7 },
  uiverseContainer: { alignItems: "center", justifyContent: "center", marginTop: 14, marginBottom: 4 },
  switch: { flexDirection: "row", alignItems: "center", width: 120, height: 40, borderRadius: 50, position: "relative", paddingHorizontal: 8, marginVertical: 9 },
  indicator: { position: "absolute", width: "42%", height: "68%", top: "18%", opacity: 0.8 },
  leftIndicator: { left: 8, borderRadius: 32 },
  rightIndicator: { right: 8, borderRadius: 32 },
  toggleButton: { position: "absolute", width: "48%", height: "80%", top: "10%", borderRadius: 99, borderWidth: 2 },
  lapsList: { width: '100%', marginTop: 20, paddingHorizontal: 10, maxHeight: 200 },
  lapItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' },
  flipClockScreen: { flex: 1, paddingVertical: 11 },
  portraitClockContainer: { width: "100%", alignItems: "center", justifyContent: "center", marginTop: 33 },
  landscapeClockContainer: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" },
  flipClockRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  flipPanel: { borderRadius: 30, marginHorizontal: 7, alignItems: "center", justifyContent: "center", position: "relative", shadowOpacity: 0.06, shadowRadius: 7 },
  ampmLabel: { fontWeight: "bold", position: "absolute", left: 16, top: 13 },
  flipDigitContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 17, width: 130, height: 90 },
  flipDigitText: { fontWeight: "bold", letterSpacing: 1.5, color: "#fff", textAlign: "center", width: "100%", textShadowColor: "#fff8", textShadowRadius: 8 },
  flipSplitLine: { position: "absolute", top: "52%", left: "12%", right: "12%", height: 2, backgroundColor: "#ffffff55", borderRadius: 2 },
  dayBarBox: { paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  dayBarText: { marginBottom: 12, fontWeight: "700" },
  dayBar: { height: 32, width: "100%", borderRadius: 18, borderWidth: 3, overflow: "hidden", marginTop: 3 },
  dayBarFill: { height: "100%", borderRadius: 18 }
});
