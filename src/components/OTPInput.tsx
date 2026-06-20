import { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

type Props = {
  length?: number;
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
  hasError?: boolean;
};

export default function OTPInput({
  length = 6,
  onComplete,
  autoFocus = true,
  hasError = false,
}: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const lastSubmittedCode = useRef<string | null>(null);
  const refs = useRef<Array<TextInput | null>>(
    Array.from({ length }).map(() => null),
  );

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const code = values.join("");
    const isComplete = values.every((v) => v !== "");

    if (!isComplete) {
      lastSubmittedCode.current = null;
      return;
    }

    if (lastSubmittedCode.current === code) {
      return;
    }

    lastSubmittedCode.current = code;
    onComplete?.(code);
  }, [values, onComplete]);

  const fillFromPaste = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, length);
    if (digits.length === 0) return false;

    const next = Array(length).fill("");
    for (let i = 0; i < digits.length; i++) {
      next[i] = digits[i];
    }
    setValues(next);

    const focusIdx = Math.min(digits.length, length - 1);
    refs.current[focusIdx]?.focus();
    return true;
  };

  const handleChange = (text: string, idx: number) => {
    if (text.length > 1) {
      if (fillFromPaste(text)) return;
    }

    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);

    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number,
  ) => {
    const key = e.nativeEvent.key;

    if (key === "Backspace") {
      if (values[idx] === "" && idx > 0) {
        refs.current[idx - 1]?.focus();
        const next = [...values];
        next[idx - 1] = "";
        setValues(next);
      } else {
        const next = [...values];
        next[idx] = "";
        setValues(next);
      }
    }
  };

  const getCellStyle = (index: number) => {
    const isFocused = focusedIndex === index;
    const isFilled = values[index] !== "";

    if (hasError) return [styles.cell, styles.cellError];
    if (isFocused) return [styles.cell, styles.cellFocused];
    if (isFilled) return [styles.cell, styles.cellFilled];
    return [styles.cell];
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            refs.current[i] = r;
          }}
          value={values[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
          maxLength={Platform.OS === "web" ? undefined : 1}
          textContentType="oneTimeCode"
          autoComplete={i === 0 ? "sms-otp" : "off"}
          style={getCellStyle(i)}
          selectionColor="#F15623"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  cell: {
    width: 48,
    height: 56,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    backgroundColor: "#f5f3f1",
  },
  cellFocused: {
    borderColor: "#F15623",
    backgroundColor: "#ffffff",
  },
  cellFilled: {
    borderColor: "#F15623",
    backgroundColor: "#fff4f0",
  },
  cellError: {
    borderColor: "#dc2626",
    backgroundColor: "#fef2f2",
  },
});
