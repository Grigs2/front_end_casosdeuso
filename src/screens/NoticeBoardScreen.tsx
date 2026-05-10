import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverLayout from '../components/DriverLayout';
import GuardianLayout from '../components/GuardianLayout';
import { RootStackParamList } from '../navigation';
import { Mensagem, UserRole } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NoticeBoard'>;

export default function NoticeBoardScreen({ navigation }: Props) {
  const [notices, setNotices] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    fetchRoleAndNotices();
  }, []);

  const fetchRoleAndNotices = async () => {
    setLoading(true);
    try {
      const storedRole = await AsyncStorage.getItem('@userRole') as UserRole;
      setRole(storedRole);
      
      // Simulação de chamada de API
      setTimeout(() => {
        const mockNotices: Mensagem[] = [
          { 
            id: 1, 
            conteudo: 'Atenção: Amanhã a van passará 10 minutos mais cedo devido a obras na avenida principal.', 
            data: '27/10/2023 18:30', 
            remetente: 'Motorista João',
            lida: false
          },
          { 
            id: 2, 
            conteudo: 'Lembrete: Reunião de pais e motoristas no próximo sábado às 10h.', 
            data: '25/10/2023 09:15', 
            remetente: 'Escola Central',
            lida: true
          },
        ];
        setNotices(mockNotices);
        setLoading(false);
      }, 800);
    } catch (error) {
      setLoading(false);
    }
  };

  const renderNoticeCard = ({ item }: { item: Mensagem }) => (
    <View style={[styles.card, !item.lida && styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.senderContainer}>
          <Feather name="message-square" size={16} color="#1976D2" />
          <Text style={styles.senderText}>{item.remetente}</Text>
        </View>
        <Text style={styles.dateText}>{item.data}</Text>
      </View>
      <Text style={styles.contentTxt}>{item.conteudo}</Text>
      {!item.lida && <View style={styles.unreadDot} />}
    </View>
  );

  const content = (
    <View style={styles.container}>
      <Text style={styles.title}>Mural de Avisos</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={styles.loader} />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNoticeCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum aviso no momento.</Text>
          }
        />
      )}
    </View>
  );

  if (role === 'driver') {
    return <DriverLayout>{content}</DriverLayout>;
  }

  return <GuardianLayout>{content}</GuardianLayout>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: '#1D1D1F',
    marginBottom: 20,
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  unreadCard: {
    borderColor: '#1976D2',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 6,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#888888',
  },
  contentTxt: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976D2',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#888888',
    marginTop: 40,
  },
});
