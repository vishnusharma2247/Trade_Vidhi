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
};

export default function OTPInput({
  length = 6,
  onComplete,
  autoFocus = true,
}: Props) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  // initialize refs array with fixed length to avoid undefined access
  const refs = useRef<Array<TextInput | null>>(
    Array.from({ length }).map(() => null),
  );

  useEffect(() => {
    try {
      if (
        autoFocus &&
        refs.current &&
        typeof refs.current[0]?.focus === "function"
      ) {
        refs.current[0]?.focus();
      }
    } catch (err) {
      // swallow focus errors to avoid crashing if focus isn't available in some environments
      // console.warn("OTPInput focus error", err);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (values.every((v) => v !== "")) {
      onComplete?.(values.join(""));
    }
  }, [values, onComplete]);

  const handleChange = (text: string, idx: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < length - 1) {
      try {
        refs.current[idx + 1]?.focus?.();
      } catch (err) {
        // ignore
      }
    }
    // if all digits filled, call onComplete immediately
    if (next.every((v) => v !== "")) {
      onComplete?.(next.join(""));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData> | any,
    idx: number,
  ) => {
    const key = e?.nativeEvent?.key ?? e?.key;

    if (key === "Backspace") {
      if (values[idx] === "" && idx > 0) {
        try {
          refs.current[idx - 1]?.focus?.();
        } catch (err) {}
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

  const inputs = Array.from({ length });

  return (
    <View style={styles.row}>
      {inputs.map((_, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            // ensure array is long enough
            refs.current[i] = r;
          }}
          value={values[i]}
          onChangeText={(t) => handleChange(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
          maxLength={1}
          style={styles.input}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  input: {
    width: 56,
    height: 56,
    textAlign: "center",
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#f87171",
    borderRadius: 12,
    marginHorizontal: 6,
  },
});
