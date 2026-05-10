import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GuardianLayout from '../components/GuardianLayout';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GuardianTracking'>;

export default function GuardianMonitoringScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  
  const studentName = 'Lucas Santos'; // Mock de dependente do usuário logado

  const loadStatus = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('@daily_attendance');
      if (stored) {
        setAttendance(JSON.parse(stored));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const getStatusDisplay = () => {
    const status = attendance[studentName];
    if (status === 'EMBARCADO') return { label: 'Embarcado - A caminho da escola', color: '#4CAF50', bg: '#E8F5E9' };
    if (status === 'DESEMBARCADO') return { label: 'Desembarcado na Escola', color: '#9C27B0', bg: '#F3E5F5' };
    return { label: 'Fora da Van / Aguardando', color: '#E53935', bg: '#FFEBEE' };
  };

  const statusInfo = getStatusDisplay();

  return (
    <GuardianLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Monitoramento</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.mapContainer}>
              <View style={styles.mapOverlay}>
                <View style={styles.markerContainer}>
                  <View style={[styles.markerPulse, { backgroundColor: statusInfo.color + '20' }]} />
                  <View style={[styles.marker, { backgroundColor: statusInfo.color }]}>
                    <Feather name="truck" size={16} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <View style={styles.mapTextContainer}>
                <Feather name="map" size={32} color="#999" />
                <Text style={styles.mapText}>Localização do Motorista</Text>
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
                    <Text style={styles.studentName}>{studentName}</Text>
                    <Text style={styles.updateText}>Atualizado em tempo real</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                  <View style={[styles.dot, { backgroundColor: statusInfo.color }]} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {attendance[studentName] || 'Pendente'}
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
                Este status é alterado pelo motorista no momento do embarque/desembarque.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </GuardianLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1D1D1F' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935', marginRight: 6 },
  liveText: { color: '#E53935', fontFamily: 'Inter_700Bold', fontSize: 10 },
  loader: { marginTop: 40 },
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
