import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import DriverLayout from '../components/DriverLayout';

export default function DriverRouteViewScreen() {
  const navigation = useNavigation<any>();
  const { trips, solicitations, dependents, startTrip, finishTrip, currentUser, schools } = useAppContext();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'MANHA' | 'TARDE' | 'NOITE' | null>(null);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  // Find active trip for the selected period
  const activeTrip = trips.find(t => t.periodo === selectedPeriod && t.status_operacional !== 'FINALIZADA');

  const getRouteStops = () => {
    if (!activeTrip) return [];

    const acceptedStudents = solicitations
      .filter(s => s.id_viagem === activeTrip.id && s.aceito)
      .map(s => dependents.find(d => d.id === s.id_dependente))
      .filter(Boolean);

    const stops = [];
    
    // Stop 0: Driver's House
    stops.push({
      id: 0,
      tipo: 'MOTORISTA',
      local: 'Sua Residência (Ponto de Partida)',
      endereco: currentUser?.endereco || 'Rua do Motorista, 123',
      alunos: []
    });

    // Sequence of Students (Simple logic: by student ID/Address for now)
    acceptedStudents.forEach((student, index) => {
      stops.push({
        id: index + 1,
        tipo: 'ALUNO',
        local: student!.nome,
        endereco: student!.endereco,
        alunos: [student]
      });
    });

    return stops;
  };

  const handleStart = () => {
    if (!activeTrip) return;
    const students = solicitations.filter(s => s.id_viagem === activeTrip.id && s.aceito);
    if (students.length === 0) {
      Alert.alert('Erro', 'Não há alunos vinculados e aprovados para este período.');
      return;
    }
    startTrip(activeTrip.id);
    Alert.alert('Iniciado', 'Viagem do dia em andamento.');
  };

  const handleFinish = () => {
    if (!activeTrip) return;
    finishTrip(activeTrip.id);
    Alert.alert('Finalizado', 'Rota concluída.');
  };

  const stops = getRouteStops();

  return (
    <DriverLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color="#1D1D1F" /></TouchableOpacity>
          <Text style={styles.title}>Roteiro do Dia</Text>
        </View>

        {/* 1. Period Selector (Dropdown) */}
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowPeriodDropdown(true)}
        >
          <View>
            <Text style={styles.dropdownLabel}>Período de Trabalho:</Text>
            <Text style={styles.dropdownValue}>
              {selectedPeriod ? selectedPeriod : 'Selecione o período...'}
            </Text>
          </View>
          <Feather name="chevron-down" size={20} color="#1976D2" />
        </TouchableOpacity>

        {/* 2. Top-Level Status Controls */}
        {activeTrip && (
          <View style={styles.statusControls}>
            {activeTrip.status_operacional === 'PLANEJADA' ? (
              <TouchableOpacity style={[styles.statusBtn, styles.startBtn]} onPress={handleStart}>
                <Feather name="play" size={18} color="#FFF" />
                <Text style={styles.statusBtnText}>Iniciar Viagem</Text>
              </TouchableOpacity>
            ) : activeTrip.status_operacional === 'EM_ANDAMENTO' ? (
              <TouchableOpacity style={[styles.statusBtn, styles.finishBtn]} onPress={handleFinish}>
                <Feather name="square" size={18} color="#FFF" />
                <Text style={styles.statusBtnText}>Finalizar Rota</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>VIAGEM CONCLUÍDA</Text>
              </View>
            )}
          </View>
        )}

        {/* 3. Timeline View (The design requested) */}
        <ScrollView contentContainerStyle={styles.timelineContainer}>
          {selectedPeriod && stops.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum aluno aprovado para este período.</Text>
            </View>
          )}

          {stops.map((stop, index) => (
            <View key={index} style={styles.stopRow}>
              {/* Timeline Connector */}
              <View style={styles.indicator}>
                <View style={[styles.dot, stop.tipo === 'MOTORISTA' ? styles.dotDriver : styles.dotStudent]}>
                  {stop.tipo === 'MOTORISTA' ? <Feather name="home" size={12} color="#FFF" /> : <Text style={styles.dotNum}>{stop.id}</Text>}
                </View>
                {index < stops.length - 1 && <View style={styles.line} />}
              </View>

              {/* Stop Details */}
              <View style={styles.details}>
                <View style={styles.detailsContent}>
                  <Text style={styles.stopLocal}>{stop.local}</Text>
                  <Text style={styles.stopAddr}>{stop.endereco}</Text>
                </View>

                {stop.tipo === 'ALUNO' && activeTrip?.status_operacional === 'EM_ANDAMENTO' && (
                  <TouchableOpacity 
                    style={styles.chamadaBtn}
                    onPress={() => navigation.navigate('DriverAttendanceDetail', { 
                      tripId: activeTrip.id,
                      stopId: stop.id,
                      students: stop.alunos,
                      description: stop.local
                    })}
                  >
                    <Feather name="clipboard" size={16} color="#FFF" />
                    <Text style={styles.chamadaBtnText}>Chamada</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Period Selection Modal */}
        <Modal visible={showPeriodDropdown} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowPeriodDropdown(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Trocar Período</Text>
              {['MANHA', 'TARDE', 'NOITE'].map(p => (
                <TouchableOpacity 
                  key={p} 
                  style={styles.option} 
                  onPress={() => { setSelectedPeriod(p as any); setShowPeriodDropdown(false); }}
                >
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, marginTop: 10 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  dropdown: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 16, 
    elevation: 2, 
    marginBottom: 20 
  },
  dropdownLabel: { fontSize: 11, color: '#86868B', textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' },
  dropdownValue: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#1976D2', marginTop: 2 },
  statusControls: { marginBottom: 30, flexDirection: 'row' },
  statusBtn: { flex: 1, height: 50, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 3 },
  startBtn: { backgroundColor: '#34C759' },
  finishBtn: { backgroundColor: '#FF3B30' },
  statusBtnText: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  completedBadge: { flex: 1, backgroundColor: '#F2F2F7', padding: 14, borderRadius: 12, alignItems: 'center' },
  completedText: { color: '#86868B', fontSize: 13, fontFamily: 'Inter_700Bold' },
  timelineContainer: { paddingLeft: 10, paddingBottom: 40 },
  stopRow: { flexDirection: 'row', minHeight: 80 },
  indicator: { alignItems: 'center', width: 40, marginRight: 16 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  dotDriver: { backgroundColor: '#8E8E93' },
  dotStudent: { backgroundColor: '#1976D2' },
  dotNum: { color: '#FFF', fontSize: 14, fontFamily: 'Inter_700Bold' },
  line: { width: 3, flex: 1, backgroundColor: '#E5E5EA', marginTop: -2, marginBottom: -2 },
  details: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 30 },
  detailsContent: { flex: 1 },
  stopLocal: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  stopAddr: { fontSize: 12, color: '#86868B', marginTop: 4 },
  chamadaBtn: { backgroundColor: '#1976D2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 10 },
  chamadaBtnText: { color: '#FFF', fontSize: 12, fontFamily: 'Inter_700Bold' },
  empty: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#86868B', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 40 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 20, textAlign: 'center' },
  option: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  optionText: { fontSize: 16, textAlign: 'center', color: '#1D1D1F' }
});
