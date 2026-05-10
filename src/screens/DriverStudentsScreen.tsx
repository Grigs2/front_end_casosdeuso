import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import DriverLayout from '../components/DriverLayout';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverStudents'>;

export default function DriverStudentsScreen({ navigation }: Props) {
  const [students, setStudents] = useState<any[]>([]);

  const loadStudents = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('@accepted_students');
      const accepted = stored ? JSON.parse(stored) : [];
      setStudents(accepted);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  const renderStudentCard = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Feather name="user" size={24} color="#1976D2" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nome}</Text>
        <Text style={styles.detail}>Responsável: {item.responsavel}</Text>
        <Text style={styles.detail}>Escola: {item.escola}</Text>
      </View>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Vinculado</Text>
      </View>
    </View>
  );

  return (
    <DriverLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Meus Passageiros</Text>
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudentCard}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Você ainda não possui passageiros vinculados.</Text>
            </View>
          }
        />
      </View>
    </DriverLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1D1D1F', marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#F0F0F0' },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1D1D1F' },
  detail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#666', marginTop: 2 },
  statusBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#2E7D32', fontFamily: 'Inter_700Bold', fontSize: 10 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#888', textAlign: 'center', marginTop: 12 },
});
