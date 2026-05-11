import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DriverLayout from '../components/DriverLayout';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverSearchStudents'>;

const alunosSemTransporteMock = [
  { id: 1, nome: 'Alice Ferreira', escola: 'Escola Municipal Primária', foto: 'user' },
  { id: 2, nome: 'Bernardo Silva', escola: 'Colégio Alpha', foto: 'user' },
  { id: 3, nome: 'Carolina Santos', escola: 'Escola Adventista', foto: 'user' },
  { id: 4, nome: 'Daniel Oliveira', escola: 'Escola Municipal Primária', foto: 'user' },
  { id: 5, nome: 'Eduarda Lima', escola: 'Colégio Alpha', foto: 'user' },
];

export default function DriverSearchStudentsScreen({ navigation }: Props) {
  const [solicitados, setSolicitados] = useState<number[]>([]);

  const handleSolicitar = (id: number, nome: string) => {
    setSolicitados(prev => [...prev, id]);
    // Simular delay de API
    setTimeout(() => {
      // No mundo real, isso enviaria para o backend
      console.log(`Solicitação enviada para ${nome}`);
    }, 1000);
  };

  const renderItem = ({ item }: { item: typeof alunosSemTransporteMock[0] }) => {
    const jaSolicitado = solicitados.includes(item.id);

    return (
      <View style={[styles.card, jaSolicitado && styles.cardDisabled]}>
        <View style={styles.avatar}>
          <Feather name="user" size={32} color="#1976D2" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.nome}</Text>
          <Text style={styles.school}>{item.escola}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, jaSolicitado && styles.buttonDisabled]}
          onPress={() => handleSolicitar(item.id, item.nome)}
          disabled={jaSolicitado}
        >
          <Text style={styles.buttonText}>{jaSolicitado ? 'Solicitado' : 'Solicitar Vínculo'}</Text>
          <Feather name={jaSolicitado ? "check" : "user-plus"} size={16} color="#FFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <DriverLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Buscar Alunos</Text>
          <Text style={styles.subtitle}>Encontre novos passageiros na sua região</Text>
        </View>
        <FlatList
          data={alunosSemTransporteMock}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      </View>
    </DriverLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1D1D1F' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#666', marginTop: 4 },
  list: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  cardDisabled: { opacity: 0.8 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1D1D1F' },
  school: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#86868B', marginTop: 2 },
  button: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonDisabled: { backgroundColor: '#BDBDBD' },
  buttonText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
});
