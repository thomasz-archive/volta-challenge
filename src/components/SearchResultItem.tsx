import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableHighlight,
} from 'react-native';
import { colors } from '../values/colors';

type Props = {
  onPress: () => void;
  row1Style?: StyleProp<TextStyle>;
  row1Text: string;
  row2Style?: StyleProp<TextStyle>;
  row2Text: string;
};

/* prettier-ignore */
export const SearchResultItem: React.FunctionComponent<Props> = ({
  onPress,
  row1Style,
  row1Text,
  row2Style,
  row2Text,
}) => (
  <TouchableHighlight
    onPress={onPress}
    style={styles.searchItem}
    underlayColor={`${colors.black.alpha(0.05)}`}
  >
    <React.Fragment>
      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        style={[styles.searchItemText, row1Style || {}]}
      >
        {row1Text}
      </Text>

      <Text
        ellipsizeMode="tail"
        numberOfLines={1}
        style={[styles.searchItemDescription, row2Style]}
      >
        {row2Text}
      </Text>
    </React.Fragment>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  searchItem: {
    backgroundColor: `${colors.white}`,
    flexDirection: 'column',
    height: 64,
    justifyContent: 'center',
  },
  searchItemText: {
    fontSize: 16,
  },
  searchItemDescription: {
    fontSize: 13,
    marginTop: 8,
  },
});
