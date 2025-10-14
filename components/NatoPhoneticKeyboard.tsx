"use client";

import React from "react";
import { cn } from "@/lib/utils";

const NATO_ALPHABET: Record<string, string> = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
};

const KEYBOARD_ROWS: { keys: string[]; offset?: string }[] = [
  { keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] },
  { keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L"], offset: "ml-6" },
  { keys: ["Z", "X", "C", "V", "B", "N", "M"], offset: "ml-12" },
];

const WORD_MAX_LENGTH = 18;

type Mode = "letter" | "word";

function sanitizeWord(value: string): string {
  return value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, WORD_MAX_LENGTH);
}

type NatoPhoneticKeyboardProps = {
  className?: string;
};

export default function NatoPhoneticKeyboard({ className }: NatoPhoneticKeyboardProps) {
  const [mode, setMode] = React.useState<Mode>("letter");
  const [activeLetter, setActiveLetter] = React.useState<keyof typeof NATO_ALPHABET>("A");
  const [activeWord, setActiveWord] = React.useState<string>("RADIO");
  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setSpeechSupported("speechSynthesis" in window);
  }, []);

  const handleModeChange = React.useCallback(
    (nextMode: Mode) => {
      setMode(nextMode);
      if (nextMode === "letter") {
        const lastFromWord = activeWord.slice(-1);
        if (lastFromWord && NATO_ALPHABET[lastFromWord as keyof typeof NATO_ALPHABET]) {
          setActiveLetter(lastFromWord as keyof typeof NATO_ALPHABET);
        }
      } else if (!activeWord) {
        setActiveWord(String(activeLetter));
      }
    },
    [activeLetter, activeWord]
  );

  const handleVirtualKey = React.useCallback(
    (letter: string) => {
      const next = letter.toUpperCase();
      if (!NATO_ALPHABET[next as keyof typeof NATO_ALPHABET]) {
        return;
      }

      if (mode === "letter") {
        setActiveLetter(next as keyof typeof NATO_ALPHABET);
      } else {
        setActiveWord((prev) => sanitizeWord(prev + next));
      }
    },
    [mode]
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (/^[a-z]$/i.test(event.key)) {
        handleVirtualKey(event.key);
      }

      if (mode === "word" && event.key === "Backspace") {
        setActiveWord((prev) => prev.slice(0, -1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVirtualKey, mode]);

  const wordBreakdown = React.useMemo(() => {
    return activeWord.split("").map((letter) => ({
      letter,
      word: NATO_ALPHABET[letter as keyof typeof NATO_ALPHABET],
    }));
  }, [activeWord]);

  const breakdownSpeech = React.useMemo(() => {
    return wordBreakdown.map((entry) => entry.word).filter(Boolean).join(", ");
  }, [wordBreakdown]);

  const phoneticWord = NATO_ALPHABET[activeLetter];

  React.useEffect(() => {
    if (!soundEnabled || !speechSupported) return;
    if (typeof window === "undefined" || typeof SpeechSynthesisUtterance === "undefined") return;

    const phrase = mode === "letter" ? phoneticWord : breakdownSpeech;
    if (!phrase) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = "en-US";
    utterance.rate = mode === "word" ? 0.9 : 0.95;
    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [breakdownSpeech, mode, phoneticWord, soundEnabled, speechSupported]);

  const onLetterInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (!value) return;

    const letter = value.slice(-1);
    if (/^[a-z]$/i.test(letter)) {
      setActiveLetter(letter.toUpperCase() as keyof typeof NATO_ALPHABET);
    }
  };

  const onWordInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveWord(sanitizeWord(event.target.value));
  };

  const handleWordClear = () => {
    setActiveWord("");
  };

  const highlightedKey = React.useMemo(() => {
    if (mode === "letter") return activeLetter;
    const last = activeWord.slice(-1);
    return last ? (last as keyof typeof NATO_ALPHABET) : undefined;
  }, [activeLetter, activeWord, mode]);

  const breakdownLine =
    wordBreakdown.length > 0
      ? wordBreakdown.map((entry) => entry.word).join(" • ")
      : "Start typing to see the NATO spelling.";

  const instructions =
    mode === "letter"
      ? "Type a letter on your keyboard or click a key below to see its NATO phonetic code word."
      : "Click or type letters to build your word and explore each NATO code word below.";

  const speechSupportCopy = speechSupported ? "" : " (not available in this browser)";

  return (
    <section
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "p-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border bg-muted/60 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleModeChange("letter")}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 transition",
                mode === "letter" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              Single letter
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("word")}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 transition",
                mode === "word" ? "bg-background shadow-sm" : "text-muted-foreground"
              )}
            >
              Spell a word
            </button>
          </div>
        </div>

        {mode === "letter" ? (
          <div className="flex flex-col gap-4 text-center">
            <div>
              <p className="text-6xl font-black tracking-tight mt-0 mb-0">{activeLetter}</p>
            </div>
            <p className="text-3xl font-semibold tracking-tight text-primary">{phoneticWord}</p>
            <p className="text-sm text-muted-foreground">{instructions}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 text-center">
              <div>
                <p className="text-5xl font-black tracking-tight mt-0 mb-0">{activeWord || "—"}</p>
              </div>
              <p className="text-lg font-semibold tracking-tight text-primary">{breakdownLine}</p>
              <p className="text-sm text-muted-foreground">{instructions}</p>
            </div>
            {wordBreakdown.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {wordBreakdown.map((entry, index) => (
                  <div
                    key={`${entry.letter}-${index}`}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3 text-left"
                  >
                    <span className="text-lg font-semibold uppercase tracking-wide">{entry.letter}</span>
                    <span className="text-sm font-medium text-muted-foreground">{entry.word}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {mode === "letter" ? (
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span>Type a letter</span>
              <input
                type="text"
                inputMode="text"
                maxLength={1}
                value={activeLetter}
                onChange={onLetterInputChange}
                className="w-12 rounded-md border px-3 py-2 text-center text-base font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Type a letter to view its NATO phonetic word"
              />
            </label>
          ) : (
            <div className="flex w-full max-w-md flex-col gap-2 text-sm font-medium text-muted-foreground sm:flex-row sm:items-center">
              <label className="flex w-full flex-col gap-2">
                <span>Spell a word</span>
                <input
                  type="text"
                  inputMode="text"
                  maxLength={WORD_MAX_LENGTH}
                  value={activeWord}
                  onChange={onWordInputChange}
                  className="w-full rounded-md border px-3 py-2 text-base font-semibold uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label="Type a word to view its NATO phonetic spelling"
                  placeholder="RADIO"
                />
              </label>
              <button
                type="button"
                onClick={handleWordClear}
                disabled={!activeWord}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-md border bg-background px-3 py-2 text-sm font-medium transition",
                  "hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                Clear
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-muted-foreground/40 accent-primary"
              checked={soundEnabled}
              disabled={!speechSupported}
              onChange={(event) => setSoundEnabled(event.target.checked)}
            />
            <span>Play pronunciation{speechSupportCopy}</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          {KEYBOARD_ROWS.map((row) => (
            <div
              key={row.keys.join("")}
              className={cn("flex justify-center gap-2 text-sm font-medium", row.offset)}
            >
              {row.keys.map((key) => {
                const isActive = highlightedKey ? key === highlightedKey : false;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleVirtualKey(key)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-base uppercase transition",
                      "hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isActive && "border-primary bg-primary text-primary-foreground shadow-lg"
                    )}
                    aria-pressed={isActive}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
