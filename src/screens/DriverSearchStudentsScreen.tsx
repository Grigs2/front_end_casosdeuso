import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import DriverLayout from '../components/DriverLayout';

export default function DriverSearchStudentsScreen() {
  const navigation = useNavigation<any>();
  const { dependents, solicitations, requestStudent, createTrip, trips, schools } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'MANHA' | 'TARDE' | 'NOITE' | null>(null);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Get or create trip for selected period
  const getActiveTrip = () => {
    if (!selectedPeriod) return null;
    return trips.find(t => t.periodo === selectedPeriod && t.status_operacional !== 'FINALIZADA');
  };

  const handleSelectPeriod = (period: any) => {
    setSelectedPeriod(period);
    setShowPeriodDropdown(false);
    const existing = trips.find(t => t.periodo === period && t.status_operacional !== 'FINALIZADA');
    if (!existing) createTrip(period);
  };

  const activeTrip = getActiveTrip();

  const availableStudents = dependents.filter(d => {
    if (!selectedPeriod || d.periodo !== selectedPeriod) return false;
    const isAlreadyRequestedForThis = solicitations.some(s => s.id_dependente === d.id && s.id_viagem === activeTrip?.id);
    const isAlreadyAcceptedInAnyTrip = solicitations.some(s => s.id_dependente === d.id && s.aceito);
    return !isAlreadyRequestedForThis && !isAlreadyAcceptedInAnyTrip;
  });

  const handleRequest = (studentId: number) => {
    if (!activeTrip) return;
    requestStudent(activeTrip.id, studentId);
    Alert.alert('Solicitado', 'Convite de viagem enviado ao responsável!');
  };

  const linkedCount = solicitations.filter(s => s.id_viagem === activeTrip?.id).length;

  return (
    <DriverLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color="#1D1D1F" /></TouchableOpacity>
          <Text style={styles.title}>Iniciar Viagem</Text>
        </View>

        <View style={styles.stepBox}>
          <Text style={styles.stepLabel}>1. SELECIONE O PERÍODO</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowPeriodDropdown(true)}>
            <Text style={[styles.dropdownValue, !selectedPeriod && { color: '#86868B' }]}>
              {selectedPeriod ? `Rota: ${selectedPeriod}` : 'Clique para selecionar o período...'}
            </Text>
            <Feather name="chevron-down" size={20} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {selectedPeriod && (
          <>
            <Text style={styles.stepLabel}>2. ALUNOS DISPONÍVEIS</Text>
            <FlatList
              data={availableStudents}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const school = schools.find(s => s.id === item.id_escola);
                return (
                  <View style={styles.studentCard}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{item.nome}</Text>
                      <Text style={styles.studentAddr}>{item.endereco}</Text>
                      <Text style={styles.schoolName}>{school?.nome}</Text>
                    </View>
                    <TouchableOpacity style={styles.solicitBtn} onPress={() => handleRequest(item.id)}>
                      <Feather name="user-plus" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhum novo aluno para solicitar neste período.</Text>}
            />

            <View style={styles.footer}>
              <TouchableOpacity 
                style={[styles.saveBtn, linkedCount === 0 && styles.saveBtnDisabled]}
                onPress={() => navigation.navigate('DriverRoute', { period: selectedPeriod })}
                disabled={linkedCount === 0}
              >
                <Text style={styles.saveBtnText}>VER ROTEIRO</Text>
                <Feather name="map" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal visible={showPeriodDropdown} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPeriodDropdown(false)}>
            <View style={styles.modalContent}>
              {['MANHA', 'TARDE', 'NOITE'].map(p => (
                <TouchableOpacity key={p} style={styles.option} onPress={() => handleSelectPeriod(p as any)}>
                  <Text style={styles.optionText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </DriverLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30, marginTop: 10 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  stepBox: { marginBottom: 24 },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#86868B', marginBottom: 10, letterSpacing: 1 },
  dropdown: { height: 56, backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 3 },
  dropdownValue: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#1976D2' },
  list: { paddingBottom: 120 },
  studentCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#1976D2', elevation: 2 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  studentAddr: { fontSize: 12, color: '#86868B', marginTop: 2 },
  schoolName: { fontSize: 11, color: '#1976D2', marginTop: 4, fontFamily: 'Inter_600SemiBold' },
  solicitBtn: { backgroundColor: '#1976D2', width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emptyText: { textAlign: 'center', color: '#86868B', marginTop: 20, fontSize: 13 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FAFAFA' },
  saveBtn: { backgroundColor: '#1976D2', height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 4 },
  saveBtnDisabled: { backgroundColor: '#E5E5EA' },
  saveBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 40 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 20 },
  option: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', alignItems: 'center' },
  optionText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#1D1D1F' }
});
