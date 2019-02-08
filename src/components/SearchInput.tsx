import React from 'react';
import { StyleSheet, TextInput, View, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { colors } from '../values/colors';

export const SearchInput: React.FunctionComponent<TextInputProps> = props => {
  /* prettier-ignore */
  return (
    <View style={styles.container}>
      <MaterialIcons
        name="search"
        size={24}
        style={styles.icon}
      />

      <TextInput
        {...props}
        autoCapitalize="none"
        autoCorrect={false}
        blurOnSubmit
        clearButtonMode="while-editing"
        returnKeyType="search"
        style={styles.textInput}
        underlineColorAndroid="transparent"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: `${colors.black.alpha(0.05)}`,
    borderRadius: 8,
    flexDirection: 'row',
    height: 48,
  },
  icon: {
    color: `${colors.primary}`,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
});
