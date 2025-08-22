import COLORS from '@/constants/color';
import FONTS from '@/constants/fonts';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  icon?: keyof typeof Feather.glyphMap; // Feather icon name
  wrapperStyle?: ViewStyle;
  textInput?: TextStyle;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  wrapperStyle,
  textInput,
  isPassword = false,
  icon,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[styles.inputWrapper, wrapperStyle, error && styles.inputError]}
      >
        {icon && (
          <Feather
            name={icon}
            size={20}
            color={COLORS.gray}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, textInput]}
          secureTextEntry={isPassword && !isVisible}
          placeholderTextColor={COLORS.gray}
          {...rest}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
            <Feather
              name={isVisible ? 'eye' : 'eye-off'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  label: {
    marginBottom: 6,
    fontSize: FONTS.size.medium,
    fontWeight: "600",
    color: COLORS.black,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
   
    borderRadius: 50,
    paddingHorizontal: 12,
    height: 52,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: FONTS.size.medium,
    color: COLORS.black,
  },
  inputError: {
    borderColor: "red",
  },
  error: {
    marginTop: 4,
    color: "red",
    fontSize: 12,
  },
});

export default InputField;
