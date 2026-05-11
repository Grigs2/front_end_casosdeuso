import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GuardianLayout from '../components/GuardianLayout';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianInvites'>;

const convitesRecebidosMock = [
  { id: 201, motoristaNome: 'Tio João', placa: 'ABC-1234', alunoNome: 'Enzo Rodrigues' },
  { id: 202, motoristaNome: 'Tia Maria', placa: 'DEF-5678', alunoNome: 'Julia Mendes' },
];

export default function GuardianInvitesScreen({ navigation }: Props) {
  const [invites, setInvites] = useState(convitesRecebidosMock);

  const handleAction = async (invite: typeof convitesRecebidosMock[0], accept: boolean) => {
    // Simular delay
    setTimeout(async () => {
      if (accept) {
        try {
          const stored = await AsyncStorage.getItem('@accepted_students');
          const acceptedStudents = stored ? JSON.parse(stored) : [];
          
          if (!acceptedStudents.find((s: any) => s.id === invite.id)) {
            acceptedStudents.push({
              id: invite.id,
              nome: invite.alunoNome,
              responsavel: 'Você',
              status: 'FORA',
              escola: 'Escola Municipal'
            });
            await AsyncStorage.setItem('@accepted_students', JSON.stringify(acceptedStudents));
          }
          
          if (Platform.OS === 'web') {
            window.alert(`Você aceitou o convite de ${invite.motoristaNome}`);
          } else {
            Alert.alert('Sucesso', `Você aceitou o convite de ${invite.motoristaNome}`);
          }
        } catch (error) {
          console.error(error);
        }
      }

      setInvites(prev => prev.filter(i => i.id !== invite.id));
    }, 500);
  };

  const renderItem = ({ item }: { item: typeof convitesRecebidosMock[0] }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="truck" size={24} color="#1976D2" />
        </View>
        <View style={styles.info}>
          <Text style={styles.driverName}>{item.motoristaNome}</Text>
          <Text style={styles.vanPlate}>Van: {item.placa}</Text>
          <Text style={styles.studentInfo}>Para: {item.alunoNome}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, styles.rejectBtn]} 
          onPress={() => handleAction(item, false)}
        >
          <Feather name="x" size={18} color="#E53935" />
          <Text style={styles.rejectText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btn, styles.acceptBtn]} 
          onPress={() => handleAction(item, true)}
        >
          <Feather name="check" size={18} color="#FFF" />
          <Text style={styles.acceptText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <GuardianLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Solicitações de Motoristas</Text>
        <FlatList
          data={invites}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="mail" size={48} color="#CCC" />
              <Text style={styles.emptyText}>Nenhuma solicitação pendente.</Text>
            </View>
          }
        />
      </View>
    </GuardianLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1D1D1F', marginBottom: 20 },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, borderWidth: 1, borderColor: '#F0F0F0' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  driverName: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#1D1D1F' },
  vanPlate: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#666' },
  studentInfo: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1976D2', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  rejectBtn: { backgroundColor: '#FFEBEE' },
  acceptBtn: { backgroundColor: '#4CAF50' },
  rejectText: { color: '#E53935', fontFamily: 'Inter_600SemiBold', fontSize: 14, marginLeft: 6 },
  acceptText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 14, marginLeft: 6 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#888', marginTop: 12 },
});
