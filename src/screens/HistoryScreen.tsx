import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DriverLayout from '../components/DriverLayout';
import GuardianLayout from '../components/GuardianLayout';
import { RootStackParamList } from '../navigation';
import { UserRole } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverHistory' | 'GuardianHistory'>;

// Mock de Histórico de Viagens
const HISTORICO_MOCK = [
  {
    id: 1,
    data: '09/05/2026',
    horario: '13:30',
    totalEmbarques: 3,
    totalDesembarques: 2,
    detalhes: [
      { acao: 'EMBARQUE', aluno: 'Lucas Santos', local: 'Casa do Responsável (João)', hora: '13:35' },
      { acao: 'EMBARQUE', aluno: 'Mateus Silva', local: 'Casa do Responsável (João)', hora: '13:38' },
      { acao: 'EMBARQUE', aluno: 'Ana Clara', local: 'Residência Maria', hora: '13:50' },
      { acao: 'DESEMBARQUE', aluno: 'Lucas Santos', local: 'Escola Adventista', hora: '14:10' },
      { acao: 'DESEMBARQUE', aluno: 'Mateus Silva', local: 'Escola Adventista', hora: '14:15' },
    ]
  },
  {
    id: 2,
    data: '08/05/2026',
    horario: '06:30',
    totalEmbarques: 2,
    totalDesembarques: 2,
    detalhes: [
      { acao: 'EMBARQUE', aluno: 'Enzo Rodrigues', local: 'Rua Java, 99', hora: '06:40' },
      { acao: 'EMBARQUE', aluno: 'Julia Mendes', local: 'Rua Python, 22', hora: '06:55' },
      { acao: 'DESEMBARQUE', aluno: 'Enzo Rodrigues', local: 'Escola Municipal', hora: '07:20' },
      { acao: 'DESEMBARQUE', aluno: 'Julia Mendes', local: 'Escola Municipal', hora: '07:25' },
    ]
  }
];

export default function HistoryScreen({ navigation }: Props) {
  const [role, setRole] = useState<UserRole>(null);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@userRole').then(r => setRole(r as UserRole));
  }, []);

  const openTripDetails = (trip: any) => {
    setSelectedTrip(trip);
    setModalVisible(true);
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.historyCard} onPress={() => openTripDetails(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.dateGroup}>
          <Feather name="calendar" size={16} color="#1976D2" />
          <Text style={styles.dateText}>{item.data}</Text>
        </View>
        <Text style={styles.timeText}>{item.horario}</Text>
      </View>
      
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.statText}>{item.totalEmbarques} Embarques</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.statText}>{item.totalDesembarques} Desembarques</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewMoreText}>Ver detalhes da rota</Text>
        <Feather name="chevron-right" size={16} color="#1976D2" />
      </View>
    </TouchableOpacity>
  );

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Operações</Text>
      <FlatList
        data={HISTORICO_MOCK}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listPadding}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Detalhes da Viagem</Text>
                <Text style={styles.modalSubtitle}>{selectedTrip?.data} • {selectedTrip?.horario}</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTrip?.detalhes.map((log: any, idx: number) => (
                <View key={idx} style={styles.logItem}>
                  <View style={[styles.logIndicator, { backgroundColor: log.acao === 'EMBARQUE' ? '#4CAF50' : '#FF9800' }]}>
                    <Feather name={log.acao === 'EMBARQUE' ? 'user-plus' : 'user-minus'} size={14} color="#FFF" />
                  </View>
                  <View style={styles.logContent}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logStudent}>{log.aluno}</Text>
                      <Text style={styles.logTime}>{log.hora}</Text>
                    </View>
                    <Text style={styles.logAction}>{log.acao}</Text>
                    <Text style={styles.logLocal}>{log.local}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>FECHAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  if (role === 'driver') return <DriverLayout>{content}</DriverLayout>;
  return <GuardianLayout>{content}</GuardianLayout>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1D1D1F', marginBottom: 20 },
  listPadding: { paddingBottom: 40 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3, borderWidth: 1, borderColor: '#F0F0F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  dateGroup: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1D1D1F', marginLeft: 8 },
  timeText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1976D2' },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: '#F5F5F7', padding: 12, borderRadius: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#444' },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  viewMoreText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1976D2', marginRight: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '85%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#1D1D1F' },
  modalSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#86868B' },
  modalBody: { flex: 1 },
  logItem: { flexDirection: 'row', marginBottom: 20 },
  logIndicator: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 4 },
  logContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#F5F5F7', paddingBottom: 12 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logStudent: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1D1D1F' },
  logTime: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#1976D2' },
  logAction: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#86868B', marginTop: 2 },
  logLocal: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#666', marginTop: 4 },
  closeBtn: { backgroundColor: '#F5F5F7', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  closeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1D1D1F' },
});
