import {SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import React from 'react';

import SearchBar from '../../components/dashboard/SearchBar';
import Category from '../../components/dashboard/Category';
import Doctors from '../../components/dashboard/Doctors';
import Clinics from '../../components/dashboard/Clinics';
import Header from '../../components/dashboard/Header'; // Import the Header component
import Colors from '../../components/Shared/Colors';

export default function Home() {
  const data = [
    { key: 'header' },
    { key: 'searchBar' },
    { key: 'category' },
    { key: 'doctors' },
    { key: 'clinics' },
  ];

  const renderItem = ({ item }) => {
    if (item.key === 'header') {
      return <Header />;
    } else if (item.key === 'searchBar') {
      return <SearchBar />;
    } else if (item.key === 'category') {
      return <Category />;
    } else if (item.key === 'doctors') {
      return <Doctors />;
    } else if (item.key === 'clinics') {
      return <Clinics />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.key}
      />
    </View>
  </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.ligh_gray,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.ligh_gray,
  },
});
