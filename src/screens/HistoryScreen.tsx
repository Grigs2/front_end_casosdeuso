import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DriverLayout from '../components/DriverLayout';
import GuardianLayout from '../components/GuardianLayout';
import { useAppContext } from '../context/AppContext';

export default function HistoryScreen() {
  const { presenceHistory, dependents, currentUser } = useAppContext();
  
  const isDriver = currentUser?.tipoPerfil === 'MOTORISTA';
  
  // Filter history based on role
  const filteredHistory = isDriver 
    ? presenceHistory 
    : presenceHistory.filter(p => dependents.find(d => d.id === p.id_dependente && (d.id_responsavel === currentUser?.id || d.id_responsavel === 11)));

  // Group by date
  const groupedHistory = filteredHistory.reduce((acc: any, curr) => {
    if (!acc[curr.data]) acc[curr.data] = [];
    acc[curr.data].push(curr);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Viagens</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {sortedDates.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="calendar" size={48} color="#E5E5EA" />
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
          </View>
        ) : (
          sortedDates.map(date => (
            <View key={date} style={styles.dateSection}>
              <View style={styles.dateHeader}>
                <Feather name="calendar" size={16} color="#1976D2" />
                <Text style={styles.dateText}>{new Date(date).toLocaleDateString()}</Text>
              </View>

              {groupedHistory[date].map((record: any) => {
                const student = dependents.find(d => d.id === record.id_dependente);
                return (
                  <View key={record.id} style={styles.recordCard}>
                    <View style={styles.recordMain}>
                      <Text style={styles.studentName}>{student?.nome}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: record.status === 'EMBARCADO' ? '#E8F5E9' : '#F3E5F5' }]}>
                        <Text style={[styles.statusText, { color: record.status === 'EMBARCADO' ? '#4CAF50' : '#9C27B0' }]}>
                          {record.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.times}>
                      {record.horarioEmbarque && (
                        <View style={styles.timeRow}>
                          <Feather name="log-in" size={12} color="#86868B" />
                          <Text style={styles.timeLabel}>Embarque:</Text>
                          <Text style={styles.timeValue}>{new Date(record.horarioEmbarque).toLocaleTimeString()}</Text>
                        </View>
                      )}
                      {record.horarioDesembarque && (
                        <View style={styles.timeRow}>
                          <Feather name="log-out" size={12} color="#86868B" />
                          <Text style={styles.timeLabel}>Desembarque:</Text>
                          <Text style={styles.timeValue}>{new Date(record.horarioDesembarque).toLocaleTimeString()}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  if (isDriver) return <DriverLayout>{content}</DriverLayout>;
  return <GuardianLayout>{content}</GuardianLayout>;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1D1D1F', marginBottom: 20 },
  scroll: { paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, color: '#86868B', textAlign: 'center' },
  dateSection: { marginBottom: 24 },
  dateHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { marginLeft: 8, fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  recordCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#F2F2F7' },
  recordMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  studentName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#1D1D1F' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  times: { borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12, gap: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#86868B', marginLeft: 6, marginRight: 4 },
  timeValue: { fontSize: 12, fontFamily: 'Inter_600SemiBold', color: '#1D1D1F' },
});
