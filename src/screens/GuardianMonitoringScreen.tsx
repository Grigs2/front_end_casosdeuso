import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import GuardianLayout from '../components/GuardianLayout';
import { useAppContext } from '../context/AppContext';

export default function GuardianMonitoringScreen() {
  const { presenceHistory, dependents, currentUser, trips } = useAppContext();
  
  const myDependents = dependents.filter(d => d.id_responsavel === currentUser?.id || d.id_responsavel === 11);
  const student = myDependents[0]; // Simulation for the first student
  
  const today = new Date().toISOString().split('T')[0];
  const presence = presenceHistory.find(p => p.id_dependente === student?.id && p.data === today);
  const status = presence?.status || 'ESPERANDO';

  const getStatusDisplay = () => {
    if (status === 'EMBARCADO') return { label: 'Embarcado - A caminho do destino', color: '#4CAF50', bg: '#E8F5E9', icon: 'truck' };
    if (status === 'DESEMBARCADO') return { label: 'Desembarcado no Destino', color: '#9C27B0', bg: '#F3E5F5', icon: 'map-pin' };
    if (status === 'FALTOU') return { label: 'Ausente na viagem de hoje', color: '#FF3B30', bg: '#FFEBEE', icon: 'user-x' };
    return { label: 'Aguardando o início da rota', color: '#8E8E93', bg: '#F2F2F7', icon: 'clock' };
  };

  const statusInfo = getStatusDisplay();
  const trip = trips[0]; // Simulation

  return (
    <GuardianLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Viagem Ativa</Text>
          <View style={[styles.liveBadge, { backgroundColor: trip.status === 'EM_ANDAMENTO' ? '#FFEBEE' : '#F2F2F7' }]}>
            <View style={[styles.liveDot, { backgroundColor: trip.status === 'EM_ANDAMENTO' ? '#E53935' : '#8E8E93' }]} />
            <Text style={[styles.liveText, { color: trip.status === 'EM_ANDAMENTO' ? '#E53935' : '#8E8E93' }]}>
              {trip.status === 'EM_ANDAMENTO' ? 'AO VIVO' : 'PLANEJADO'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mapContainer}>
            <View style={styles.mapOverlay}>
              <View style={styles.markerContainer}>
                <View style={[styles.markerPulse, { backgroundColor: statusInfo.color + '20' }]} />
                <View style={[styles.marker, { backgroundColor: statusInfo.color }]}>
                  <Feather name={statusInfo.icon as any} size={16} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <View style={styles.mapTextContainer}>
              <Feather name="map" size={32} color="#999" />
              <Text style={styles.mapText}>Visualização em Tempo Real</Text>
            </View>
          </View>

          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>Status do Dependente</Text>
            
            <View style={styles.statusCard}>
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Feather name="user" size={24} color="#1976D2" />
                </View>
                <View>
                  <Text style={styles.studentName}>{student?.nome}</Text>
                  <Text style={styles.updateText}>
                    {presence?.horarioEmbarque ? `Embarque: ${new Date(presence.horarioEmbarque).toLocaleTimeString()}` : 'Aguardando embarque'}
                  </Text>
                </View>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>
                  {status}
                </Text>
              </View>
            </View>

            <View style={[styles.mainStatusCard, { borderColor: statusInfo.color }]}>
              <Text style={[styles.mainStatusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Feather name="info" size={20} color="#1976D2" />
            <Text style={styles.infoText}>
              ID Viagem: {trip.id} | Período: {trip.periodo.replace('_', ' ')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </GuardianLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1D1D1F' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  liveText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  scrollContent: { paddingBottom: 40 },
  mapContainer: { width: '100%', height: 200, backgroundColor: '#F5F5F7', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0' },
  mapOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  markerContainer: { justifyContent: 'center', alignItems: 'center' },
  marker: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', elevation: 4 },
  markerPulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30 },
  mapTextContainer: { alignItems: 'center', opacity: 0.5 },
  mapText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#666666', marginTop: 12 },
  statusSection: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: '#1D1D1F', marginBottom: 16 },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F0F0F0', elevation: 2 },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  studentName: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#1D1D1F' },
  updateText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#888888', marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  mainStatusCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 2, alignItems: 'center', marginTop: 10 },
  mainStatusText: { fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center' },
  infoCard: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 16, borderRadius: 12, alignItems: 'center' },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#1976D2', marginLeft: 12, flex: 1 },
});
