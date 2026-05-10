import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverLayout from '../components/DriverLayout';
import { RootStackParamList } from '../navigation';
import { Parada } from '../types';

// Mock Data Seguindo Estrutura ParadaDTO
const ROTEIRO_MOCK: Parada[] = [
  { id: 1, tipo: 'INICIO', descricao: 'Saída da Garagem', horarioPrevisto: '06:30' },
  { id: 2, tipo: 'EMBARQUE', descricao: 'Casa do Responsável (João)', dependentes: ['Lucas Santos', 'Mateus Silva'], horarioPrevisto: '06:45' },
  { id: 3, tipo: 'EMBARQUE', descricao: 'Residência Maria', dependentes: ['Ana Clara'], horarioPrevisto: '07:05' },
  { id: 4, tipo: 'ESCOLA', descricao: 'Escola Adventista', horarioPrevisto: '07:30' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'DriverRoute'>;

export default function DriverRouteViewScreen({ navigation }: Props) {
  const [route, setRoute] = useState<Parada[]>(ROTEIRO_MOCK);
  const [attendanceProgress, setAttendanceProgress] = useState<Record<number, number>>({});

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAttendanceProgress();
    });
    return unsubscribe;
  }, [navigation]);

  const loadAttendanceProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem('@daily_attendance');
      if (stored) {
        const fullAttendance = JSON.parse(stored);
        const progress: Record<number, number> = {};
        
        ROTEIRO_MOCK.forEach(stop => {
          if (stop.dependentes) {
            const done = stop.dependentes.filter(name => fullAttendance[name]).length;
            progress[stop.id] = done;
          }
        });
        setAttendanceProgress(progress);
      }
    } catch (e) {}
  };

  return (
    <DriverLayout>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Roteiro de Viagem</Text>
          <Text style={styles.subtitle}>Acompanhe suas próximas paradas</Text>
        </View>

        <ScrollView contentContainerStyle={styles.timelineContainer}>
          {route.map((item, index) => {
            const isResponsible = item.tipo === 'EMBARQUE' || item.tipo === 'DESEMBARQUE';
            const progress = attendanceProgress[item.id] || 0;
            const total = item.dependentes?.length || 0;
            const isFinished = total > 0 && progress === total;

            return (
              <View key={item.id} style={styles.timelineItem}>
                {/* Indicadores Visuais da Rota */}
                <View style={styles.indicatorContainer}>
                  <View style={[
                    styles.dot, 
                    item.tipo === 'INICIO' && styles.dotStart,
                    item.tipo === 'ESCOLA' && styles.dotEnd,
                    isFinished && styles.dotFinished
                  ]} />
                  {index < route.length - 1 && <View style={styles.line} />}
                </View>

                {/* Conteúdo da Parada */}
                <View style={[styles.card, isFinished && styles.cardFinished]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.infoGroup}>
                      <Text style={styles.stopLabel}>{item.descricao}</Text>
                      <Text style={styles.stopTime}>
                        <Feather name="clock" size={12} /> {item.horarioPrevisto}
                      </Text>
                    </View>
                    {isFinished && <Feather name="check-circle" size={20} color="#4CAF50" />}
                  </View>

                  {isResponsible && (
                    <TouchableOpacity 
                      style={[styles.primaryAction, isFinished && styles.secondaryAction]}
                      onPress={() => navigation.navigate('DriverAttendanceDetail', {
                        stopId: item.id,
                        stopDescription: item.descricao,
                        students: item.dependentes || []
                      })}
                    >
                      <Feather name="clipboard" size={16} color="#FFF" />
                      <Text style={styles.primaryActionText}>
                        {isFinished ? 'REVISAR CHAMADA' : 'REALIZAR CHAMADA'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {total > 0 && !isFinished && (
                    <Text style={styles.progressText}>
                      Progresso: {progress} de {total} alunos
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </DriverLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#1D1D1F' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#86868B', marginTop: 4 },
  timelineContainer: { paddingBottom: 40 },
  timelineItem: { flexDirection: 'row', minHeight: 120 },
  indicatorContainer: { alignItems: 'center', width: 24, marginRight: 16 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E0E0E0', borderWidth: 3, borderColor: '#FFF', elevation: 2, zIndex: 2 },
  dotStart: { backgroundColor: '#1976D2' },
  dotEnd: { backgroundColor: '#E53935' },
  dotFinished: { backgroundColor: '#4CAF50' },
  line: { width: 2, flex: 1, backgroundColor: '#E0E0E0', marginTop: -4 },
  card: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  cardFinished: { borderColor: '#E8F5E9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  infoGroup: { flex: 1 },
  stopLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1D1D1F' },
  stopTime: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1976D2', marginTop: 4 },
  primaryAction: { backgroundColor: '#1976D2', height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondaryAction: { backgroundColor: '#86868B' },
  primaryActionText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 13, marginLeft: 8 },
  progressText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#86868B', marginTop: 12, textAlign: 'right' },
});
