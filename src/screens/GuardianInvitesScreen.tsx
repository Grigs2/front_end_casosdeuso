import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import GuardianLayout from '../components/GuardianLayout';

export default function GuardianInvitesScreen() {
  const { solicitations, approveSolicitation, denySolicitation, dependents, currentUser, drivers } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'TRIP' | 'DRIVER'>('TRIP');

  const myId = currentUser?.id || 11;
  const tripInvites = solicitations.filter(s => s.id_responsavel === myId && !s.respondido);
  
  // Simulation: Accepted solicitations = Associated Drivers
  const linkedDrivers = solicitations.filter(s => s.id_responsavel === myId && s.aceito);

  const handleTripResponse = (solId: number, accept: boolean) => {
    if (accept) approveSolicitation(solId);
    else denySolicitation(solId);
    Alert.alert(accept ? 'Aprovado' : 'Recusado', 'Ação registrada com sucesso.');
  };

  const handleUnlink = (solId: number) => {
    Alert.alert(
      'Desassociar Motorista',
      'Tem certeza que deseja remover este motorista? O aluno ficará disponível para outros profissionais.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => denySolicitation(solId) }
      ]
    );
  };

  return (
    <GuardianLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Convites & Associações</Text>
          <Text style={styles.subtitle}>Gerencie profissionais e viagens</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'TRIP' && styles.tabActive]}
            onPress={() => setActiveTab('TRIP')}
          >
            <Text style={[styles.tabText, activeTab === 'TRIP' && styles.tabTextActive]}>Convites</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'DRIVER' && styles.tabActive]}
            onPress={() => setActiveTab('DRIVER')}
          >
            <Text style={[styles.tabText, activeTab === 'DRIVER' && styles.tabTextActive]}>Meus Motoristas</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'TRIP' ? (
          <FlatList
            data={tripInvites}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const student = dependents.find(d => d.id === item.id_dependente);
              const driver = drivers[0]; // Simulation
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Feather name="truck" size={20} color="#1976D2" />
                    <Text style={styles.driverName}>{driver.nome}</Text>
                  </View>
                  <Text style={styles.inviteText}>
                    Solicitou transportar <Text style={styles.bold}>{student?.nome}</Text> no período <Text style={styles.bold}>{student?.periodo}</Text>.
                  </Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={[styles.btn, styles.btnDeny]} onPress={() => handleTripResponse(item.id, false)}>
                      <Text style={styles.btnTextDeny}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleTripResponse(item.id, true)}>
                      <Text style={styles.btnTextApprove}>Aceitar Profissional</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Nenhum convite pendente.</Text>}
          />
        ) : (
          <FlatList
            data={linkedDrivers}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const student = dependents.find(d => d.id === item.id_dependente);
              const driver = drivers[0];
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{driver.nome[0]}</Text></View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.driverName}>{driver.nome}</Text>
                      <Text style={styles.linkedStudent}>Transportando: {student?.nome}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.btnUnlink} onPress={() => handleUnlink(item.id)}>
                    <Feather name="user-x" size={16} color="#FF3B30" />
                    <Text style={styles.btnUnlinkText}>Desassociar Profissional</Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>Você não possui motoristas associados.</Text>}
          />
        )}
      </View>
    </GuardianLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  subtitle: { fontSize: 14, color: '#86868B', marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF', elevation: 2 },
  tabText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#86868B' },
  tabTextActive: { color: '#1976D2' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3, borderWidth: 1, borderColor: '#F2F2F7' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  driverName: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  inviteText: { fontSize: 14, color: '#3A3A3C', lineHeight: 20, marginBottom: 20 },
  bold: { fontFamily: 'Inter_700Bold' },
  actions: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnApprove: { backgroundColor: '#34C759' },
  btnDeny: { borderWhidth: 1, borderColor: '#FF3B30', borderWidth: 1 },
  btnTextApprove: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 13 },
  btnTextDeny: { color: '#FF3B30', fontFamily: 'Inter_700Bold', fontSize: 13 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#1976D2', fontFamily: 'Inter_700Bold' },
  linkedStudent: { fontSize: 12, color: '#86868B', marginTop: 2 },
  btnUnlink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  btnUnlinkText: { color: '#FF3B30', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#86868B' }
});
