import { StyleSheet, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile, getAllPets, getDiagnosisHistory } from '../../utils/database';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Pet {
  name: string;
  type: string;
  breed: string;
  age: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [diagnosisCount, setDiagnosisCount] = useState(0);

  // Ekran her odaklandığında verileri yükle
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      // Login durumunu kontrol et
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loggedIn === 'true');

      if (loggedIn === 'true') {
        // Kullanıcı profili
        const profile = getUserProfile();
        setUserProfile(profile as UserProfile);

        // Hayvanlar
        const pets = getAllPets();
        setPetCount(pets.length);
        if (pets.length > 0) {
          setActivePet(pets[0] as Pet);
        } else {
          setActivePet(null);
        }

        // Tanı geçmişi
        const history = getDiagnosisHistory();
        setDiagnosisCount(history.length);
      } else {
        // Çıkış yapılmışsa tüm verileri temizle
        setUserProfile(null);
        setActivePet(null);
        setPetCount(0);
        setDiagnosisCount(0);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#49a1dcff', '#6bb6ed', '#8dc8f5']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Künye Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#49a1dcff" />
          </View>
          
          {isLoggedIn && userProfile ? (
            <>
              <Text style={styles.userName}>
                {userProfile.first_name} {userProfile.last_name}
              </Text>
              <Text style={styles.userEmail}>{userProfile.email || 'Email belirtilmemiş'}</Text>
              <Text style={styles.userPhone}>📞 {userProfile.phone || 'Telefon belirtilmemiş'}</Text>
            </>
          ) : (
            <>
              <Text style={styles.userName}>Hoş Geldiniz</Text>
              <Text style={styles.guestText}>Misafir Kullanıcı</Text>
              <TouchableOpacity 
                style={styles.loginPromptButton}
                onPress={() => router.push('/profile')}
              >
                <Text style={styles.setupLink}>Giriş Yap / Kayıt Ol</Text>
              </TouchableOpacity>
            </>
          )}

          {activePet && isLoggedIn && (
            <View style={styles.petInfo}>
              <Text style={styles.petIcon}>{activePet.type === 'dog' ? '🐕' : '🐱'}</Text>
              <View>
                <Text style={styles.petName}>{activePet.name}</Text>
                <Text style={styles.petBreed}>{activePet.breed || 'Cins belirtilmemiş'} • {activePet.age} yaş</Text>
              </View>
            </View>
          )}
        </View>

        {/* App Başlık */}
        <View style={styles.welcomeSection}>
          <Text style={styles.appTitle}>Pet Sense</Text>
          <Text style={styles.welcomeText}>
            {isLoggedIn && userProfile 
              ? `Merhaba ${userProfile.first_name}!` 
              : 'Hoş Geldiniz'}
          </Text>
          <Text style={styles.subtitle}>
            Evcil hayvanınızın sağlığı için AI destekli tanı sistemi
          </Text>
        </View>

        {/* Ana Buton */}
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => router.push('/explore')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4c00d8ff', '#6b2ee0']}
            style={styles.buttonGradient}
          >
            <Ionicons name="medical" size={30} color="#fff" />
            <Text style={styles.buttonText}>Tanı Koymak İçin Tıklayınız</Text>
            <Text style={styles.buttonSubtext}>AI ile hızlı ve güvenilir analiz</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="document-text" size={24} color="#49a1dcff" />
            <Text style={styles.statNumber}>{diagnosisCount}</Text>
            <Text style={styles.statLabel}>Tanı</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="paw" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{petCount}</Text>
            <Text style={styles.statLabel}>Hayvan</Text>
          </View>
        </View>

        {/* Alt Bilgi */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>7/24 AI Veteriner Desteği</Text>
          <View style={styles.footerIcons}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
            <Text style={styles.footerSmall}>Güvenli & Hızlı</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  guestText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  loginPromptButton: {
    backgroundColor: '#49a1dcff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  setupLink: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
  },
  petIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  petBreed: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  mainButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    padding: 25,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  footerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerSmall: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginLeft: 5,
  },
});