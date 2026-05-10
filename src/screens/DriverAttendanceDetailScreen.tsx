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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverAttendanceDetail'>;

// 1. Mock de Detalhes dos Alunos (Geral)
const ALUNOS_DETALHES_MOCK: Record<string, any> = {
  'Lucas Santos': { endereco: 'Rua das Flores, 123 - Centro', idade: 8, sexo: 'Masculino', obs: 'Alergia a lactose.' },
  'Mateus Silva': { endereco: 'Av. Paulista, 1500 - Bela Vista', idade: 7, sexo: 'Masculino', obs: 'Costuma dormir na van.' },
  'Ana Clara': { endereco: 'Rua Amazonas, 45 - Vila Rosa', idade: 9, sexo: 'Feminino', obs: 'Mãe busca na escola hoje.' },
  'Enzo Rodrigues': { endereco: 'Rua Java, 99 - Bairro Novo', idade: 10, sexo: 'Masculino', obs: 'Usa óculos.' },
  'Julia Mendes': { endereco: 'Rua Python, 22 - Tech Park', idade: 6, sexo: 'Feminino', obs: 'Levar mochila azul.' },
};

// Mock de Todos os Alunos Vinculados (Para quando não há contexto de parada)
const TODOS_OS_ALUNOS_MOCK = ['Lucas Santos', 'Mateus Silva', 'Ana Clara', 'Enzo Rodrigues', 'Julia Mendes'];

export default function DriverAttendanceDetailScreen({ route, navigation }: Props) {
  // Verifica se recebeu parâmetros. Se não, assume Modo Geral.
  const hasParams = route.params && route.params.students;
  const stopDescription = route.params?.stopDescription || 'Chamada Geral (Todos os Alunos)';
  const students = hasParams ? route.params.students : TODOS_OS_ALUNOS_MOCK;

  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, string>>({});
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const stored = await AsyncStorage.getItem('@daily_attendance');
      if (stored) setAttendanceStatus(JSON.parse(stored));
    } catch (e) {}
  };

  const handleUpdateStatus = async (studentName: string, status: 'EMBARCOU' | 'DESEMBARCOU') => {
    const newStatus = { ...attendanceStatus, [studentName]: status };
    setAttendanceStatus(newStatus);
    await AsyncStorage.setItem('@daily_attendance', JSON.stringify(newStatus));
  };

  const openStudentDetails = (name: string) => {
    const details = ALUNOS_DETALHES_MOCK[name] || { endereco: 'Não informado', idade: '-', sexo: '-', obs: '-' };
    setSelectedStudent({ name, ...details });
    setDetailModalVisible(true);
  };

  const renderStudentCard = ({ item }: { item: string }) => {
    const status = attendanceStatus[item];
    const isDone = !!status;

    return (
      <View style={[styles.studentCard, isDone && styles.studentCardDone]}>
        <View style={styles.cardHeader}>
          <TouchableOpacity 
            style={styles.studentNameContainer}
            onPress={() => openStudentDetails(item)}
          >
            <View style={styles.avatarMini}>
              <Feather name="user" size={20} color={isDone ? "#4CAF50" : "#1976D2"} />
            </View>
            <View>
              <Text style={styles.studentName}>{item}</Text>
              <Text style={styles.tapDetailText}>Toque para ver detalhes</Text>
            </View>
          </TouchableOpacity>
          {isDone && <Feather name="check-circle" size={24} color="#4CAF50" />}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.embarkBtn]}
            onPress={() => handleUpdateStatus(item, 'EMBARCOU')}
          >
            <Feather name="check" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>EMBARCAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.disembarkBtn]}
            onPress={() => handleUpdateStatus(item, 'DESEMBARCOU')}
          >
            <Feather name="log-out" size={18} color="#FFF" />
            <Text style={styles.actionBtnText}>DESEMBARCAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1D1D1F" />
      
      {/* Header Contextual */}
      <View style={styles.header}>
        {!hasParams && (
          <View style={styles.generalNotice}>
            <Feather name="info" size={14} color="#FFD60A" />
            <Text style={styles.generalNoticeText}>Modo de Chamada Geral: Mostrando todos os alunos vinculados</Text>
          </View>
        )}
        <Text style={styles.headerLabel}>{hasParams ? 'CHAMADA POR PARADA' : 'CHAMADA RÁPIDA'}</Text>
        <Text style={styles.headerTitle}>{stopDescription}</Text>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item}
        renderItem={renderStudentCard}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="users" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum aluno vinculado disponível.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>
            {hasParams ? 'Finalizar e Voltar ao Trajeto' : 'Voltar ao Painel'}
          </Text>
          <Feather name="arrow-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Modal de Detalhes */}
      <Modal visible={detailModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalhes do Aluno</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}><Feather name="x" size={24} color="#666" /></TouchableOpacity>
            </View>
            {selectedStudent && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}><Feather name="user" size={18} color="#1976D2" /><Text style={styles.detailLabel}>Nome:</Text><Text style={styles.detailValue}>{selectedStudent.name}</Text></View>
                <View style={styles.detailRow}><Feather name="map-pin" size={18} color="#1976D2" /><Text style={styles.detailLabel}>Endereço:</Text><Text style={styles.detailValue}>{selectedStudent.endereco}</Text></View>
                <View style={styles.detailRow}><Feather name="info" size={18} color="#1976D2" /><Text style={styles.detailLabel}>Idade/Sexo:</Text><Text style={styles.detailValue}>{selectedStudent.idade} anos • {selectedStudent.sexo}</Text></View>
                <View style={styles.obsBox}><Text style={styles.obsLabel}>Observações:</Text><Text style={styles.obsText}>{selectedStudent.obs}</Text></View>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDetailModalVisible(false)}><Text style={styles.closeModalBtnText}>FECHAR</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { backgroundColor: '#1D1D1F', padding: 24, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, alignItems: 'center' },
  generalNotice: { backgroundColor: 'rgba(255,214,10,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  generalNoticeText: { color: '#FFD60A', fontSize: 10, fontFamily: 'Inter_600SemiBold', marginLeft: 8 },
  headerLabel: { color: '#86868B', fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 2, marginBottom: 8 },
  headerTitle: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center' },
  listPadding: { padding: 20, paddingBottom: 120 },
  studentCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  studentCardDone: { borderColor: '#4CAF50', borderLeftWidth: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  studentNameContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatarMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studentName: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1D1D1F' },
  tapDetailText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#1976D2', marginTop: 2 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 0.48, height: 52, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  embarkBtn: { backgroundColor: '#4CAF50' },
  disembarkBtn: { backgroundColor: '#FF9800' },
  actionBtnText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 12, marginLeft: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  backBtn: { backgroundColor: '#1D1D1F', height: 60, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 16, marginRight: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { textAlign: 'center', color: '#86868B', fontFamily: 'Inter_500Medium', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#1D1D1F' },
  modalBody: { marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  detailLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#666', marginLeft: 10, width: 90 },
  detailValue: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1D1D1F', flex: 1 },
  obsBox: { backgroundColor: '#FFF9C4', padding: 16, borderRadius: 12, marginTop: 8 },
  obsLabel: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#F57F17', marginBottom: 4 },
  obsText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5D4037' },
  closeModalBtn: { backgroundColor: '#F5F5F7', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  closeModalBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#1D1D1F' },
});
