import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DriverLayout from '../components/DriverLayout';
import GuardianLayout from '../components/GuardianLayout';
import { RootStackParamList } from '../navigation';
import { UserRole } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DriverProfile' | 'GuardianProfile'>;

export default function ProfileScreen({ navigation, route }: Props) {
  const [role, setRole] = useState<UserRole>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('@userRole') as UserRole;
      const loggedUser = await AsyncStorage.getItem('@loggedUser');
      setRole(storedRole);

      if (loggedUser) {
        const user = JSON.parse(loggedUser);
        // Ajusta mapeamento dependendo se é MotoristaDTO ou ResponsavelDTO
        setNome(user.nome || '');
        setEmail(user.usuarioDTO?.email || user.usuario?.email || '');
        setTelefone(user.usuarioDTO?.telefone || user.usuario?.telefone || '');
        setEndereco(user.usuarioDTO?.endereco || user.usuario?.endereco || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const loggedUserStr = await AsyncStorage.getItem('@loggedUser');
      if (loggedUserStr) {
        const user = JSON.parse(loggedUserStr);
        
        // Atualiza os campos no objeto
        user.nome = nome;
        if (user.usuarioDTO) {
          user.usuarioDTO.telefone = telefone;
          user.usuarioDTO.endereco = endereco;
        } else if (user.usuario) {
          user.usuario.telefone = telefone;
          user.usuario.endereco = endereco;
        }

        await AsyncStorage.setItem('@loggedUser', JSON.stringify(user));
        Alert.alert('Sucesso', 'Cadastro atualizado com sucesso!');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const content = (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#1976D2" />
          </View>
          <Text style={styles.title}>Meu Cadastro</Text>
          <Text style={styles.subtitle}>Gerencie suas informações pessoais</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={18} color="#86868B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome} 
                placeholder="Seu nome"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail (Não editável)</Text>
            <View style={[styles.inputWrapper, styles.disabledInput]}>
              <Feather name="mail" size={18} color="#86868B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={email} 
                editable={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone / WhatsApp</Text>
            <View style={styles.inputWrapper}>
              <Feather name="phone" size={18} color="#86868B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={telefone} 
                onChangeText={setTelefone} 
                keyboardType="phone-pad"
                placeholder="(00) 00000-0000"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <View style={styles.inputWrapper}>
              <Feather name="map-pin" size={18} color="#86868B" style={styles.inputIcon} />
              <TextInput 
                style={styles.input} 
                value={endereco} 
                onChangeText={setEndereco} 
                placeholder="Rua, número, bairro..."
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            <Feather name="check" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (role === 'driver') return <DriverLayout>{content}</DriverLayout>;
  return <GuardianLayout>{content}</GuardianLayout>;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#BBDEFB' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1D1D1F' },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#86868B', marginTop: 4 },
  form: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
  inputGroup: { marginBottom: 20 },
  label: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1D1D1F', marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 12, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: '#E0E0E0' },
  disabledInput: { backgroundColor: '#E9E9EB', borderColor: '#D1D1D6' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: '#1D1D1F' },
  saveButton: { backgroundColor: '#1976D2', height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveButtonText: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 16, marginRight: 8 },
});
