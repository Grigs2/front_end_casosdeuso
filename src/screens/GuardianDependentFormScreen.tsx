import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext';

export default function GuardianDependentFormScreen() {
  const navigation = useNavigation<any>();
  const { schools, addDependent, currentUser } = useAppContext();
  
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [endereco, setEndereco] = useState('');
  const [idEscola, setIdEscola] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState<'MANHA' | 'TARDE' | 'NOITE'>('MANHA');
  const [showSchoolModal, setShowSchoolModal] = useState(false);

  const handleSave = () => {
    if (!nome || !cpf || !idEscola || !endereco) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma escola.');
      return;
    }

    addDependent({
      nome,
      cpf,
      idade: parseInt(idade) || 0,
      sexo,
      endereco,
      id_escola: idEscola,
      id_responsavel: 11, // Mock current guardian ID
      periodo
    });

    Alert.alert('Sucesso', 'Dependente cadastrado e vinculado à escola.');
    navigation.goBack();
  };

  const selectedSchoolName = schools.find(s => s.id === idEscola)?.nome || 'Selecionar Escola...';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="arrow-left" size={24} color="#1D1D1F" /></TouchableOpacity>
        <Text style={styles.title}>Novo Dependente</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo:</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Enzo Silva" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.label}>CPF:</Text>
            <TextInput style={styles.input} value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" keyboardType="numeric" />
          </View>
          <View style={{ width: 100 }}>
            <Text style={styles.label}>Idade:</Text>
            <TextInput style={styles.input} value={idade} onChangeText={setIdade} placeholder="Ex: 8" keyboardType="numeric" />
          </View>
        </View>

        <Text style={styles.label}>Sexo:</Text>
        <View style={styles.radioRow}>
          {['M', 'F'].map(s => (
            <TouchableOpacity key={s} style={[styles.radio, sexo === s && styles.radioActive]} onPress={() => setSexo(s as any)}>
              <Text style={[styles.radioText, sexo === s && styles.radioTextActive]}>{s === 'M' ? 'Masculino' : 'Feminino'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Endereço de Embarque:</Text>
        <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} placeholder="Rua, Número, Bairro" />

        {/* Mandatory School Linkage */}
        <Text style={styles.label}>Escola de Destino (Obrigatório):</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowSchoolModal(true)}>
          <Text style={styles.dropdownValue}>{selectedSchoolName}</Text>
          <Feather name="chevron-down" size={20} color="#1976D2" />
        </TouchableOpacity>

        <Text style={styles.label}>Período de Aula:</Text>
        <View style={styles.radioRow}>
          {['MANHA', 'TARDE', 'NOITE'].map(p => (
            <TouchableOpacity key={p} style={[styles.radio, periodo === p && styles.radioActive]} onPress={() => setPeriodo(p as any)}>
              <Text style={[styles.radioText, periodo === p && styles.radioTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Salvar e Vincular Escola</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSchoolModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lista de Escolas</Text>
            <FlatList
              data={schools}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.schoolItem} 
                  onPress={() => { setIdEscola(item.id); setShowSchoolModal(false); }}
                >
                  <Text style={styles.schoolName}>{item.nome}</Text>
                  <Text style={styles.schoolAddr}>{item.endereco}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSchoolModal(false)}>
              <Text style={styles.closeBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20, paddingTop: 50 },
  title: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  form: { padding: 20 },
  label: { fontSize: 13, color: '#86868B', marginBottom: 8, marginTop: 16 },
  input: { height: 52, backgroundColor: '#F5F5F7', borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },
  row: { flexDirection: 'row' },
  radioRow: { flexDirection: 'row', gap: 10 },
  radio: { flex: 1, height: 44, backgroundColor: '#F5F5F7', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: '#1976D2' },
  radioText: { color: '#666', fontFamily: 'Inter_600SemiBold' },
  radioTextActive: { color: '#FFF' },
  dropdown: { height: 52, backgroundColor: '#F5F5F7', borderRadius: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownValue: { fontSize: 15, color: '#1D1D1F' },
  saveBtn: { backgroundColor: '#1976D2', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'Inter_700Bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 20 },
  schoolItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  schoolName: { fontSize: 15, fontFamily: 'Inter_700Bold', color: '#1D1D1F' },
  schoolAddr: { fontSize: 12, color: '#86868B', marginTop: 2 },
  closeBtn: { marginTop: 20, alignItems: 'center' },
  closeBtnText: { color: '#FF3B30', fontFamily: 'Inter_600SemiBold' },
});
