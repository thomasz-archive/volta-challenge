import React from 'react';
import {
  Animated,
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  Text,
  TouchableHighlight,
  ViewStyle,
} from 'react-native';

import { VoltaSite } from '../values/types';
import { colors } from '../values/colors';
import { Divider } from '../components/Divider';
import { SearchInput } from '../components/SearchInput';
import {
  Feature,
  Point,
} from 'geojson';

type Props = {
  data: Feature<Point, VoltaSite>[],
  onSelect: (site: Feature<Point, VoltaSite>) => void;
  placeholder: string;
  style: StyleProp<ViewStyle>,
};
const DEFAULT_PROPS = {
  style: {},
};

type State = {
  result: Feature<Point, VoltaSite>[];
  searchValue: string;
};

export class SearchScreen extends React.Component<Props & typeof DEFAULT_PROPS, State> {
  static defaultProps = DEFAULT_PROPS;

  opacity = new Animated.Value(0);
  state = {
    result: [],
    searchValue: '',
  };

  componentDidMount() {
    Animated.timing(this.opacity, {
      duration: 200,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  handleChangeText = (searchValue: string) => {
    const { data } = this.props;
    const result = searchValue ? (
      data.filter(d => d.properties.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1)
    ) : [];
    this.setState({
      result,
      searchValue,
    });
  };

  handleSubmit = () => {
    Keyboard.dismiss();
  }

  handleSearchItemPress = (site: Feature<Point, VoltaSite>) => {
    const { onSelect } = this.props;
    onSelect(site);
  }

  renderSearchItem = (info: ListRenderItemInfo<Feature<Point, VoltaSite>>) => {
    const { item } = info;
    const { properties: { name } } = item;

    return (
      <TouchableHighlight
        onPress={() => this.handleSearchItemPress(item)}
        style={styles.searchItem}
        underlayColor={`${colors.black.alpha(0.05)}`}
      >
        <Text
          ellipsizeMode="tail"
          numberOfLines={1}
          style={styles.searchItemText}
        >
          {name}
        </Text>
      </TouchableHighlight>
    );
  };

  render() {
    const { placeholder, style } = this.props;
    const { result, searchValue } = this.state;

    const opacityStyle = {
      opacity: this.opacity,
    };

    return (
      <Animated.View style={[styles.container, style, opacityStyle]}>
        <SearchInput
          onChangeText={this.handleChangeText}
          onSubmitEditing={this.handleSubmit}
          placeholder={placeholder}
          value={searchValue}
        />

        {!!result.length && (
          <FlatList
            data={result}
            ItemSeparatorComponent={Divider}
            keyExtractor={({ properties }) => properties.id }
            renderItem={this.renderSearchItem}
            style={styles.list}
          />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${colors.white}`,
    flex: 1,
  },
  list: {
    marginTop: 8,
  },
  searchItem: {
    backgroundColor: `${colors.white}`,
    height: 48,
    justifyContent: 'center',
  },
  searchItemText: {
    fontSize: 16,
  },
});
