import { ScrollView, Alert, TextInput, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { initDatabase, saveDiagnosis, getAllPets, getAllDiagnoses } from '../../utils/database';
import { styles } from '../../styles/exploreStyles';

let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log('Maps module not available');
  }
}

const API_BASE_URL = 'http://10.212.87.189:8001';

interface DiagnosisResult {
  primary_diagnosis?: {
    condition: string;
    percentage: number;
    confidence_level: string;
  };
  possible_diagnoses?: Array<{
    condition: string;
    percentage: number;
    confidence_level: string;
  }>;
  confidence_interpretation?: string;
  recommendations?: string[];
  risk_level?: string;
}

interface Veterinarian {
  id: string;
  name: string;
  clinic_name: string;
  latitude: number;
  longitude: number;
  phone?: string;
  address?: string;
  rating?: number;
  open_now?: boolean;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
}

export default function TabOneScreen() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [petType, setPetType] = useState('dog');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vets, setVets] = useState<Veterinarian[]>([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: 38.4192, longitude: 27.1287 });
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [diagnosisMode, setDiagnosisMode] = useState<'my-pet' | 'other-pet'>('other-pet');

  useEffect(() => {
    initDatabase();
    loadPets();
    
    // Geliştirme sırasında veritabanını kontrol et
    if (__DEV__) {
      const allPets = getAllPets();
      console.log('📊 VERİTABANI - PETS:', JSON.stringify(allPets, null, 2));
    }
  }, []);

  const loadPets = () => {
    const allPets = getAllPets();
    setPets(allPets as Pet[]);
  };

  const filteredVets = vets.filter(vet => 
    searchQuery.trim() === '' || 
    vet.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchNearbyVets = async (latitude: number, longitude: number) => {
    setLoadingVets(true);
    console.log(`🗺️ Konum: ${latitude}, ${longitude}`);
    
    try {
      const url = `${API_BASE_URL}/nearby_vets?lat=${latitude}&lng=${longitude}&radius=10000`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const veterinarians: Veterinarian[] = data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          clinic_name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          address: place.vicinity || 'Adres bilgisi yok',
        }));
        
        // Telefon numaralarını al
        const vetsWithDetails = await Promise.all(
          veterinarians.map(async (vet) => {
            try {
              const detailUrl = `${API_BASE_URL}/vet_details?place_id=${vet.id}`;
              const detailResponse = await fetch(detailUrl);
              const detailData = await detailResponse.json();
              
              return {
                ...vet,
                phone: detailData.result?.formatted_phone_number || 'Telefon bilgisi yok'
              };
            } catch {
              return { ...vet, phone: 'Telefon bilgisi yok' };
            }
          })
        );
        
        setVets(vetsWithDetails);
        Alert.alert('Başarılı', `${vetsWithDetails.length} veteriner bulundu!`);
      } else {
        Alert.alert('Sonuç Yok', 'Bu bölgede veteriner bulunamadı.');
        setVets([]);
      }
    } catch (error: any) {
      console.error('Veteriner arama hatası:', error);
      Alert.alert('Hata', `Veteriner aranırken hata: ${error.message}`);
      setVets([]);
    } finally {
      setLoadingVets(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'İzin verilmedi. Varsayılan konum kullanılıyor.');
        return userLocation;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      setUserLocation(newLocation);
      
      return newLocation;
    } catch (error) {
      Alert.alert('Konum Hatası', 'Konumunuz alınamadı.');
      return userLocation;
    }
  };

  const handleShowMap = async () => {
    if (!showMap) {
      setShowMap(true);
      
      if (Platform.OS !== 'web') {
        const location = await getUserLocation();
        await fetchNearbyVets(location.latitude, location.longitude);
      } else {
        await fetchNearbyVets(userLocation.latitude, userLocation.longitude);
      }
    } else {
      setShowMap(false);
    }
  };

  const diagnosePet = async () => {
    if (diagnosisMode === 'my-pet' && !selectedPet) {
      Alert.alert('Hata', 'Lütfen bir hayvan seçin');
      return;
    }

    if (!symptoms.trim()) {
      Alert.alert('Hata', 'Lütfen semptomları girin');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const currentPetType = diagnosisMode === 'my-pet' ? selectedPet?.type : petType;
      
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms,
          pet_type: currentPetType,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        
        const saved = saveDiagnosis({
          pet_id: diagnosisMode === 'my-pet' ? selectedPet?.id : undefined,
          pet_type: currentPetType || 'dog',
          symptoms: symptoms,
          diagnosis: data.primary_diagnosis?.condition || 'Unknown',
          confidence_level: data.primary_diagnosis?.confidence_level || 'Low',
          confidence_percentage: data.primary_diagnosis?.percentage || 0,
          recommendations: JSON.stringify(data.recommendations || []),
          risk_level: data.risk_level
        });
        
        if (saved) {
          const petName = diagnosisMode === 'my-pet' ? selectedPet?.name : (currentPetType === 'dog' ? 'Köpek' : 'Kedi');
          Alert.alert('Başarılı', `${petName} için tanı kaydedildi!`);
          
          // Kaydedilen tüm tanıları konsola yazdır
          if (__DEV__) {
            const allDiagnoses = getAllDiagnoses();
            console.log('💾 VERİTABANI - TÜM TANILAR:', JSON.stringify(allDiagnoses, null, 2));
          }
        } else {
          Alert.alert('Başarılı', 'Tanı sonucu alındı!');
        }
      } else {
        Alert.alert('API Hatası', `Durum: ${response.status}\nMesaj: ${data.detail || 'Bilinmeyen hata'}`);
      }
    } catch (error: any) {
      Alert.alert(
        'Bağlantı Hatası', 
        `Hata Türü: ${error?.name || 'Unknown'}\nMesaj: ${error?.message || 'Unknown'}\n\nAPI sunucusu çalışıyor mu?\nIP: ${API_BASE_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/status`);
      const data = await response.json();
      
      Alert.alert('API Durumu', `✅ Bağlantı başarılı!\n\nModel: ${data.model_loaded ? 'Aktif' : 'Pasif'}\nDoğruluk: ${data.model_accuracy}\nVer: ${data.version}`);
    } catch (error: any) {
      Alert.alert(
        'API Bağlantı Hatası', 
        `❌ Bağlantı kurulamadı\n\nHata: ${error?.name || 'Unknown'}\nMesaj: ${error?.message || 'Unknown'}\n\nIP: ${API_BASE_URL}`
      );
    }
  };

  const handleModeChange = (mode: 'my-pet' | 'other-pet') => {
    setDiagnosisMode(mode);
    if (mode === 'my-pet' && pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Pet Sense</Text>
        <Text style={styles.subtitle}>AI destekli evcil hayvan tanı sistemi</Text>
        
        <TouchableOpacity style={styles.statusButton} onPress={testApiConnection}>
          <Text style={styles.statusButtonText}>API Durumu Kontrol Et</Text>
        </TouchableOpacity>
      </View>

      {/* Mod Seçimi */}
      <View style={styles.petSelectorSection}>
        <Text style={styles.label}>Tanı türünü seçin:</Text>
        <View style={styles.petTypeContainer}>
          <TouchableOpacity 
            style={[styles.petButton, diagnosisMode === 'other-pet' && styles.selectedPet]}
            onPress={() => handleModeChange('other-pet')}
          >
            <Text style={[styles.petButtonText, diagnosisMode === 'other-pet' && styles.selectedPetText]}>
              Yabancı Hayvan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.petButton, diagnosisMode === 'my-pet' && styles.selectedPet]}
            onPress={() => handleModeChange('my-pet')}
          >
            <Text style={[styles.petButtonText, diagnosisMode === 'my-pet' && styles.selectedPetText]}>
              Hayvanlarım
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Yabancı Hayvan için Dog/Cat Seçimi */}
      {diagnosisMode === 'other-pet' && (
        <View style={styles.inputSection}>
          <Text style={styles.label}>Pet Türü:</Text>
          <View style={styles.petTypeContainer}>
            <TouchableOpacity 
              style={[styles.petButton, petType === 'dog' && styles.selectedPet]}
              onPress={() => setPetType('dog')}
            >
              <Text style={[styles.petButtonText, petType === 'dog' && styles.selectedPetText]}>
                🐕 Köpek
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.petButton, petType === 'cat' && styles.selectedPet]}
              onPress={() => setPetType('cat')}
            >
              <Text style={[styles.petButtonText, petType === 'cat' && styles.selectedPetText]}>
                🐱 Kedi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Kendi Hayvanları için Pet Seçimi */}
      {diagnosisMode === 'my-pet' && (
        pets.length > 0 ? (
          <View style={styles.petSelectorSection}>
            <Text style={styles.label}>Hangi hayvanınız için tanı istiyorsunuz?</Text>
            <TouchableOpacity 
              style={styles.petSelector}
              onPress={() => setShowPetSelector(!showPetSelector)}
            >
              <View style={styles.selectedPet}>
                <Text style={styles.petSelectorIcon}>
                  {selectedPet?.type === 'dog' ? '🐕' : '🐱'}
                </Text>
                <View style={styles.selectedPetInfo}>
                  <Text style={styles.selectedPetName}>{selectedPet?.name || 'Seçiniz'}</Text>
                  <Text style={styles.selectedPetBreed}>{selectedPet?.breed || 'Cins belirtilmemiş'}</Text>
                </View>
              </View>
              <Ionicons name={showPetSelector ? "chevron-up" : "chevron-down"} size={24} color="#666" />
            </TouchableOpacity>

            {showPetSelector && (
              <View style={styles.petDropdown}>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petOption,
                      selectedPet?.id === pet.id && styles.petOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedPet(pet);
                      setShowPetSelector(false);
                    }}
                  >
                    <Text style={styles.petOptionIcon}>
                      {pet.type === 'dog' ? '🐕' : '🐱'}
                    </Text>
                    <View style={styles.petOptionInfo}>
                      <Text style={styles.petOptionName}>{pet.name}</Text>
                      <Text style={styles.petOptionBreed}>{pet.breed || 'Cins belirtilmemiş'}</Text>
                    </View>
                    {selectedPet?.id === pet.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.noPetWarning}>
            <Ionicons name="alert-circle" size={40} color="#FF9800" />
            <Text style={styles.noPetWarningText}>Henüz kayıtlı hayvanınız yok</Text>
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.addPetButtonText}>Profil'e Git ve Hayvan Ekle</Text>
            </TouchableOpacity>
          </View>
        )
      )}

      {/* Semptom Girişi */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Semptomlar (İngilizce):</Text>
        <Text style={styles.helper}>
          Örnek: "dog vomiting and diarrhea for 3 days not eating"
        </Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Example: dog vomiting and diarrhea for 3 days not eating..."
          placeholderTextColor="#999"
          value={symptoms}
          onChangeText={setSymptoms}
        />

        <TouchableOpacity 
          style={[styles.button, (loading || (diagnosisMode === 'my-pet' && !selectedPet)) && styles.buttonDisabled]}
          onPress={diagnosePet}
          disabled={loading || (diagnosisMode === 'my-pet' && !selectedPet)}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Analiz Ediliyor...' : '🔍 Tanı Et'}
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>
            📊 {diagnosisMode === 'my-pet' && selectedPet ? `${selectedPet.name} için ` : ''}Tanı Sonucu
          </Text>
          
          <View style={[styles.diagnosisCard, 
            result.primary_diagnosis?.confidence_level === 'High' ? styles.highConfidence : 
            result.primary_diagnosis?.confidence_level === 'Medium' ? styles.mediumConfidence : 
            styles.lowConfidence
          ]}>
            <Text style={styles.diagnosisTitle}>
              {result.primary_diagnosis?.condition || 'Bilinmeyen'}
            </Text>
            <Text style={styles.confidence}>
              Güven: %{result.primary_diagnosis?.percentage || 0} 
              ({result.primary_diagnosis?.confidence_level || 'Düşük'})
            </Text>
            <Text style={styles.interpretation}>
              {result.confidence_interpretation || ''}
            </Text>
            {result.risk_level && (
              <Text style={styles.riskLevel}>
                Risk Seviyesi: {result.risk_level}
              </Text>
            )}
          </View>

          {result.possible_diagnoses && result.possible_diagnoses.length > 1 && (
            <View style={styles.alternativesSection}>
              <Text style={styles.alternativesTitle}>🔍 Diğer Olasılıklar:</Text>
              {result.possible_diagnoses.slice(1).map((diagnosis: any, index: number) => (
                <View key={index} style={styles.alternativeCard}>
                  <View style={styles.alternativeInfo}>
                    <Text style={styles.alternativeName}>{diagnosis.condition}</Text>
                    <Text style={styles.alternativeLevel}>{diagnosis.confidence_level}</Text>
                  </View>
                  <Text style={styles.alternativeConfidence}>%{diagnosis.percentage}</Text>
                </View>
              ))}
            </View>
          )}

          {result.recommendations && result.recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>💡 Öneriler:</Text>
              {result.recommendations.map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendation}>• {rec}</Text>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={styles.mapButton}
            onPress={handleShowMap}
            disabled={loadingVets}
          >
            <Text style={styles.mapButtonText}>
              {loadingVets ? '🔄 Veterinerler Aranıyor...' : 
               showMap ? '🗺️ Haritayı Gizle' : '📍 Yakındaki Veterinerleri Göster'}
            </Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ Bu tanı sadece bilgi amaçlıdır. Kesin tanı için veteriner hekim ile görüşünüz.
            </Text>
          </View>
        </View>
      )}

      {showMap && (
        <View style={styles.mapSection}>
          <Text style={styles.mapTitle}>📍 Yakındaki Veteriner Klinikleri (OpenStreetMap)</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Veteriner veya klinik ara..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {loadingVets ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#49a1dcff" />
              <Text style={styles.loadingText}>Veterinerler aranıyor...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.resultCount}>
                {filteredVets.length} veteriner bulundu
              </Text>
              
              {Platform.OS === 'web' ? (
                <View style={styles.webWarning}>
                  <Text style={styles.webWarningText}>
                    🌐 Harita özelliği sadece mobil cihazlarda çalışır.
                  </Text>
                  <Text style={styles.webWarningText}>
                    Lütfen Expo Go uygulaması ile telefon/tablet'inizden test edin.
                  </Text>
                </View>
              ) : (
                MapView && vets.length > 0 && (
                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={styles.map}
                    initialRegion={{
                      latitude: userLocation.latitude,
                      longitude: userLocation.longitude,
                      latitudeDelta: 0.1,
                      longitudeDelta: 0.1,
                    }}
                  >
                    {filteredVets.map((vet) => (
                      <Marker
                        key={vet.id}
                        coordinate={{
                          latitude: vet.latitude,
                          longitude: vet.longitude,
                        }}
                        title={vet.clinic_name}
                        description={`${vet.address || ''}`}
                        pinColor="#49a1dcff"
                      />
                    ))}
                  </MapView>
                )
              )}

              <View style={styles.vetList}>
                {filteredVets.length > 0 ? (
                  filteredVets.map((vet) => (
                    <View key={vet.id} style={styles.vetCard}>
                      <View style={styles.vetHeader}>
                        <Text style={styles.vetName}>{vet.clinic_name}</Text>
                        {vet.rating && (
                          <Text style={styles.rating}>⭐ {vet.rating}</Text>
                        )}
                      </View>
                      {vet.address && (
                        <Text style={styles.vetAddress}>📍 {vet.address}</Text>
                      )}
                      <Text style={styles.vetPhone}>📞 {vet.phone || 'Telefon bilgisi yok'}</Text>
                      {vet.open_now !== undefined && vet.open_now !== null && (
                        <Text style={[styles.openStatus, vet.open_now ? styles.open : styles.closed]}>
                          {vet.open_now ? '🟢 Açık' : '🔴 Kapalı'}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.noResultCard}>
                    <Text style={styles.noResultText}>
                      {vets.length === 0 ? 
                        '📍 Veteriner aramak için butona basın' :
                        '🔍 Arama kriterinize uygun veteriner bulunamadı'}
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}