import React from 'react';
import { AsyncStorage, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flex: 1,
    padding: 10,
  },
  label: {
    fontSize: 20,
  },
});

class DrawerMenu extends React.Component {
  logout = async () => {
    await AsyncStorage.removeItem('id');
    this.props.navigation.navigate('Login');
  };

  render() {
    return (
      <ScrollView>
        <SafeAreaView style={styles.container} forceInset={{ top: 'always', horizontal: 'never' }}>
          <TouchableOpacity style={styles.item} onPress={() => this.logout()}>
            <Text style={styles.label}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </ScrollView>
    );
  }
}

export default DrawerMenu;
