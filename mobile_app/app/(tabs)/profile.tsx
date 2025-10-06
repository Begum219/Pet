import { ScrollView, Alert, TouchableOpacity, View, Text, TextInput, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { 
  getUserProfile, 
  saveUserProfile, 
  getAllPets, 
  savePet, 
  updatePet, 
  deletePet,
  getDiagnosisHistory,
  getAllDiagnoses,
  deleteDiagnosis
} from '../../utils/database';
import { styles } from '../../styles/profileStyles';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight: number;
  gender: string;
  blood_type: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [diagnosisCount, setDiagnosisCount] = useState(0);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [expandedDiagnosis, setExpandedDiagnosis] = useState<number | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petGender, setPetGender] = useState('');
  const [petBloodType, setPetBloodType] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const profile = getUserProfile();
    setUserProfile(profile as UserProfile);

    const allPets = getAllPets();
    setPets(allPets as Pet[]);

    const history = getDiagnosisHistory();
    setDiagnosisCount(history.length);

    const allDiagnoses = getAllDiagnoses();
    setDiagnoses(allDiagnoses as any[]);

    if (profile) {
      setFirstName((profile as any).first_name || '');
      setLastName((profile as any).last_name || '');
      setEmail((profile as any).email || '');
      setPhone((profile as any).phone || '');
    }
  };

  const getPetName = (petId: number | null) => {
    if (!petId) return 'Yabancı Hayvan';
    const pet = pets.find(p => p.id === petId);
    return pet ? pet.name : 'Bilinmeyen';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteDiagnosis = (id: number) => {
    Alert.alert(
      'Tanıyı Sil',
      'Bu tanıyı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            const success = deleteDiagnosis(id);
            if (success) {
              Alert.alert('Başarılı', 'Tanı silindi');
              loadData();
            }
          }
        }
      ]
    );
  };

  const handleSaveUserProfile = () => {
    if (!firstName || !lastName) {
      Alert.alert('Hata', 'Ad ve Soyad zorunludur');
      return;
    }

    const saved = saveUserProfile({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone
    });

    if (saved) {
      Alert.alert('Başarılı', 'Profil kaydedildi');
      setShowUserModal(false);
      loadData();
    }
  };

  const handleOpenPetModal = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet);
      setPetName(pet.name);
      setPetType(pet.type);
      setPetBreed(pet.breed || '');
      setPetAge(pet.age?.toString() || '');
      setPetWeight(pet.weight?.toString() || '');
      setPetGender(pet.gender || '');
      setPetBloodType(pet.blood_type || '');
    } else {
      setEditingPet(null);
      setPetName('');
      setPetType('dog');
      setPetBreed('');
      setPetAge('');
      setPetWeight('');
      setPetGender('');
      setPetBloodType('');
    }
    setShowPetModal(true);
  };

  const handleSavePet = () => {
    if (!petName) {
      Alert.alert('Hata', 'Hayvan ismi zorunludur');
      return;
    }

    const petData = {
      name: petName,
      type: petType,
      breed: petBreed,
      age: parseInt(petAge) || 0,
      weight: parseFloat(petWeight) || 0,
      gender: petGender,
      blood_type: petBloodType
    };

    let saved = false;
    if (editingPet) {
      saved = updatePet(editingPet.id, petData);
    } else {
      saved = savePet(petData);
    }

    if (saved) {
      Alert.alert('Başarılı', editingPet ? 'Hayvan güncellendi' : 'Hayvan eklendi');
      setShowPetModal(false);
      loadData();
    }
  };

  const handleDeletePet = (id: number) => {
    Alert.alert(
      'Hayvanı Sil',
      'Bu hayvanı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            if (deletePet(id)) {
              Alert.alert('Başarılı', 'Hayvan silindi');
              loadData();
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Kullanıcı ve hayvan bilgileri</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>
          <TouchableOpacity onPress={() => setShowUserModal(true)}>
            <Text style={styles.editButton}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        {userProfile ? (
          <View style={styles.profileCard}>
            <Text style={styles.profileName}>{userProfile.first_name} {userProfile.last_name}</Text>
            <Text style={styles.profileDetail}>Email: {userProfile.email || 'Belirtilmemiş'}</Text>
            <Text style={styles.profileDetail}>Telefon: {userProfile.phone || 'Belirtilmemiş'}</Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Henüz profil oluşturmadınız</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowUserModal(true)}>
              <Text style={styles.addButtonText}>Profil Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hayvanlarım ({pets.length})</Text>
          <TouchableOpacity onPress={() => handleOpenPetModal()}>
            <Text style={styles.addButton}>+ Ekle</Text>
          </TouchableOpacity>
        </View>

        {pets.length > 0 ? (
          pets.map((pet) => (
            <View key={pet.id} style={styles.petCard}>
              <View style={styles.petHeader}>
                <Text style={styles.petIcon}>{pet.type === 'dog' ? '🐕' : '🐱'}</Text>
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed || 'Cins belirtilmemiş'}</Text>
                </View>
                <View style={styles.petActions}>
                  <TouchableOpacity onPress={() => handleOpenPetModal(pet)}>
                    <Text style={styles.editButton}>Düzenle</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeletePet(pet.id)}>
                    <Text style={styles.deleteButton}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.petDetails}>
                <Text style={styles.petDetail}>Yaş: {pet.age || '-'} yıl</Text>
                <Text style={styles.petDetail}>Kilo: {pet.weight || '-'} kg</Text>
                <Text style={styles.petDetail}>Cinsiyet: {pet.gender || '-'}</Text>
                {pet.blood_type && <Text style={styles.petDetail}>Kan Grubu: {pet.blood_type}</Text>}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Henüz hayvan eklemediniz</Text>
          </View>
        )}
      </View>

      {/* TANI GEÇMİŞİ BÖLÜMÜ */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="medical" size={20} color="#49a1dcff" />
          <Text style={styles.sectionTitle}>  Tanı Geçmişi ({diagnoses.length})</Text>
        </View>

        {diagnoses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Henüz tanı kaydı yok</Text>
          </View>
        ) : (
          diagnoses.map((diagnosis) => {
            const isExpanded = expandedDiagnosis === diagnosis.id;
            let recommendations = [];
            try {
              recommendations = diagnosis.recommendations ? JSON.parse(diagnosis.recommendations) : [];
            } catch (e) {
              recommendations = [];
            }

            return (
              <View key={diagnosis.id} style={styles.diagnosisCard}>
                <TouchableOpacity
                  style={styles.diagnosisHeader}
                  onPress={() => setExpandedDiagnosis(isExpanded ? null : diagnosis.id)}
                >
                  <View style={styles.diagnosisInfo}>
                    <Text style={styles.diagnosisAnimal}>
                      {diagnosis.pet_type === 'dog' ? '🐕' : '🐱'} {getPetName(diagnosis.pet_id)}
                    </Text>
                    <Text style={styles.diagnosisDate}>{formatDate(diagnosis.created_at)}</Text>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>

                <View style={styles.diagnosisMain}>
                  <Text style={styles.diagnosisTitle}>{diagnosis.diagnosis}</Text>
                  <Text style={styles.diagnosisConfidence}>
                    Güven: {diagnosis.confidence_percentage}% ({diagnosis.confidence_level})
                  </Text>
                </View>

                {isExpanded && (
                  <View style={styles.diagnosisExpanded}>
                    <Text style={styles.detailLabel}>Semptomlar:</Text>
                    <Text style={styles.detailText}>{diagnosis.symptoms}</Text>

                    {diagnosis.risk_level && (
                      <>
                        <Text style={styles.detailLabel}>Risk:</Text>
                        <Text style={styles.detailText}>{diagnosis.risk_level}</Text>
                      </>
                    )}

                    {recommendations.length > 0 && (
                      <>
                        <Text style={styles.detailLabel}>Öneriler:</Text>
                        {recommendations.map((rec: string, idx: number) => (
                          <Text key={idx} style={styles.recommendation}>• {rec}</Text>
                        ))}
                      </>
                    )}

                    <TouchableOpacity
                      style={styles.deleteDiagnosisButton}
                      onPress={() => handleDeleteDiagnosis(diagnosis.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={styles.deleteDiagnosisText}>Sil</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{diagnosisCount}</Text>
            <Text style={styles.statLabel}>Toplam Tanı</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{pets.length}</Text>
            <Text style={styles.statLabel}>Kayıtlı Hayvan</Text>
          </View>
        </View>
      </View>

      {/* Kullanıcı Profili Modal */}
      <Modal visible={showUserModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kullanıcı Bilgileri</Text>

            <Text style={styles.inputLabel}>Ad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.inputLabel}>Soyad *</Text>
            <TextInput
              style={styles.input}
              placeholder="Soyadınız"
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput
              style={styles.input}
              placeholder="0555 123 45 67"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowUserModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveUserProfile}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pet Modal */}
      <Modal visible={showPetModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingPet ? 'Hayvanı Düzenle' : 'Yeni Hayvan Ekle'}
              </Text>

              <Text style={styles.inputLabel}>İsim *</Text>
              <TextInput
                style={styles.input}
                placeholder="Hayvanın ismi"
                value={petName}
                onChangeText={setPetName}
              />

              <Text style={styles.inputLabel}>Tür *</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, petType === 'dog' && styles.typeButtonActive]}
                  onPress={() => setPetType('dog')}
                >
                  <Text style={styles.typeButtonText}>🐕 Köpek</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, petType === 'cat' && styles.typeButtonActive]}
                  onPress={() => setPetType('cat')}
                >
                  <Text style={styles.typeButtonText}>🐱 Kedi</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Cins</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Golden Retriever, Siyam"
                value={petBreed}
                onChangeText={setPetBreed}
              />

              <Text style={styles.inputLabel}>Yaş (yıl)</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 3"
                value={petAge}
                onChangeText={setPetAge}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Kilo (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 25.5"
                value={petWeight}
                onChangeText={setPetWeight}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Cinsiyet</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, petGender === 'Erkek' && styles.typeButtonActive]}
                  onPress={() => setPetGender('Erkek')}
                >
                  <Text style={styles.typeButtonText}>Erkek</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, petGender === 'Dişi' && styles.typeButtonActive]}
                  onPress={() => setPetGender('Dişi')}
                >
                  <Text style={styles.typeButtonText}>Dişi</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Kan Grubu</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: DEA 1.1"
                value={petBloodType}
                onChangeText={setPetBloodType}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowPetModal(false)}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleSavePet}
                >
                  <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}