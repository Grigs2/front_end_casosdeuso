import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppContext, Dependent } from '../context/AppContext';

export default function DriverAttendanceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { markPresence, presenceLogs, schools } = useAppContext();
  
  const { tripId, stopId, students, description } = route.params;
  const [selectedStudent, setSelectedStudent] = useState<Dependent | null>(null);

  const getStatus = (studentId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const log = presenceLogs.find(l => l.id_viagem === tripId && l.id_dependente === studentId && l.data === today);
    return log?.status || 'ESPERANDO';
  };

  const handleAction = (studentId: number, status: 'EMBARCADO' | 'DESEMBARCADO' | 'FALTOU') => {
    markPresence(tripId, studentId, status);
    Alert.alert('Sucesso', `Status de ${status} registrado.`);
  };

  return (
    <View style={styles.container}>
      {/* Exclusive Call Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color="#1D1D1F" /></TouchableOpacity>
        <View>
          <Text style={styles.title}>Controle de Chamada</Text>
          <Text style={styles.subtitle}>{description} (Parada {stopId})</Text>
        </View>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const status = getStatus(item.id);
          return (
            <View style={styles.card}>
              {/* Clickable Name for Modal */}
              <TouchableOpacity onPress={() => setSelectedStudent(item)} style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.nome}</Text>
                <View style={[styles.badge, { backgroundColor: status === 'EMBARCADO' ? '#E8F5E9' : status === 'DESEMBARCADO' ? '#E3F2FD' : '#F5F5F7' }]}>
                  <Text style={[styles.badgeText, { color: status === 'EMBARCADO' ? '#2E7D32' : status === 'DESEMBARCADO' ? '#1976D2' : '#666' }]}>
                    {status}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Big Intuitive Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.bigBtn, styles.btnEmbarque, status === 'EMBARCADO' && styles.btnActive]}
                  onPress={() => handleAction(item.id, 'EMBARCADO')}
                >
                  <Feather name="log-in" size={24} color="#FFF" />
                  <Text style={styles.btnLabel}>Confirmar Embarque</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.bigBtn, styles.btnDesembarque, status === 'DESEMBARCADO' && styles.btnActive]}
                  onPress={() => handleAction(item.id, 'DESEMBARCADO')}
                >
                  <Feather name="log-out" size={24} color="#FFF" />
                  <Text style={styles.btnLabel}>Confirmar Desembarque</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.btnFaltou} onPress={() => handleAction(item.id, 'FALTOU')}>
                <Text style={styles.faltouText}>Marcar como Falta</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Student Detail Modal */}
      <Modal visible={!!selectedStudent} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Informações do Aluno</Text>
              <TouchableOpacity onPress={() => setSelectedStudent(null)}><Feather name="x" size={24} color="#666" /></TouchableOpacity>
            </View>
            {selectedStudent && (
              <ScrollView>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Endereço:</Text>
                  <Text style={styles.detailValue}>{selectedStudent.endereco}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Idade:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.idade} anos</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sexo:</Text>
                    <Text style={styles.detailValue}>{selectedStudent.sexo === 'M' ? 'Masculino' : 'Feminino'}</Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Escola:</Text>
                  <Text style={styles.detailValue}>
                    {schools.find(s => s.id === selectedStudent.id_escola)?.nome}
                  </Text>
                </View>
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedStudent(null)}>
              <Text style={styles.closeModalBtnText}>Fechar Detalhes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, paddingTop: 50, backgroundColor: '#FFF' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  subtitle: { fontSize: 13, color: '#86868B' },
  list: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 3 },
  studentInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  studentName: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_700Bold', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  bigBtn: { flex: 1, height: 100, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 10 },
  btnEmbarque: { backgroundColor: '#34C759' },
  btnDesembarque: { backgroundColor: '#1976D2' },
  btnActive: { borderWidth: 4, borderColor: '#000' },
  btnLabel: { color: '#FFF', fontSize: 12, fontFamily: 'Inter_700Bold', textAlign: 'center', marginTop: 8 },
  btnFaltou: { padding: 12, alignItems: 'center' },
  faltouText: { color: '#FF3B30', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  detailItem: { marginBottom: 20 },
  detailLabel: { fontSize: 13, color: '#86868B', marginBottom: 4 },
  detailValue: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#1D1D1F' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  closeModalBtn: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  closeModalBtnText: { fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
});
