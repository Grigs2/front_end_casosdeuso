import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';
import GuardianLayout from '../components/GuardianLayout';

export default function GuardianDependentsScreen() {
  const navigation = useNavigation<any>();
  const { dependents, solicitations, endLink, currentUser, schools } = useAppContext();
  
  const myDependents = dependents.filter(d => d.id_responsavel === currentUser?.id || d.id_responsavel === 11);

  const handleEndLink = (studentId: number) => {
    const sol = solicitations.find(s => s.id_dependente === studentId && s.aceito);
    if (sol) {
      Alert.alert(
        'Encerrar Vínculo',
        'Tem certeza que deseja encerrar o transporte com este motorista?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Encerrar', 
            style: 'destructive', 
            onPress: () => {
              endLink(sol.id);
              Alert.alert('Sucesso', 'Vínculo encerrado. O aluno agora está disponível para outros motoristas.');
            } 
          }
        ]
      );
    } else {
      Alert.alert('Info', 'Este dependente não possui vínculo ativo com motorista.');
    }
  };

  return (
    <GuardianLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Dependentes</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('GuardianDependentForm')}
          >
            <Feather name="plus" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Novo</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={myDependents}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const school = schools.find(s => s.id === item.id_escola);
            const activeSol = solicitations.find(s => s.id_dependente === item.id && s.aceito);
            
            return (
              <View style={styles.card}>
                <View style={styles.cardInfo}>
                  <Text style={styles.studentName}>{item.nome}</Text>
                  <Text style={styles.schoolName}>{school?.nome}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, activeSol ? styles.statusActive : styles.statusInactive]}>
                      {activeSol ? 'Vínculo Ativo' : 'Sem Transporte'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => navigation.navigate('GuardianDependentForm', { dependentId: item.id })}
                  >
                    <Feather name="edit-2" size={18} color="#1976D2" />
                  </TouchableOpacity>

                  {activeSol && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleEndLink(item.id)}
                    >
                      <Feather name="link-2" size={18} color="#FF3B30" />
                      <Text style={styles.deleteText}>Encerrar Vínculo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>
    </GuardianLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  addButton: { backgroundColor: '#1976D2', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  addButtonText: { color: '#FFF', marginLeft: 4, fontFamily: 'Inter_600SemiBold' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardInfo: { marginBottom: 16 },
  studentName: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  schoolName: { fontSize: 14, color: '#86868B', marginTop: 4 },
  statusBadge: { marginTop: 12 },
  statusText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  statusActive: { color: '#34C759' },
  statusInactive: { color: '#FF9500' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 12 },
  editButton: { padding: 8 },
  deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteText: { color: '#FF3B30', fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
