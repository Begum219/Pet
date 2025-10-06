import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pet_health.db');

export const initDatabase = () => {
  // Mevcut tablolar
  db.execSync(`
    CREATE TABLE IF NOT EXISTS diagnosis_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER,
      pet_type TEXT NOT NULL,
      symptoms TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      confidence_level TEXT,
      confidence_percentage REAL,
      recommendations TEXT,
      risk_level TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (pet_id) REFERENCES pets(id)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS favorite_vets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      latitude REAL,
      longitude REAL,
      added_at TEXT NOT NULL
    );
  `);

  // YENİ: Kullanıcı tablosu
  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      last_name TEXT,
      email TEXT,
      phone TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // YENİ: Pet tablosu
  db.execSync(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      breed TEXT,
      age INTEGER,
      weight REAL,
      gender TEXT,
      blood_type TEXT,
      photo_uri TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  console.log('Database initialized');
};

// Kullanıcı profili fonksiyonları
export const saveUserProfile = (data: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}) => {
  try {
    const existing = db.getFirstSync('SELECT id FROM user_profile LIMIT 1');
    const now = new Date().toISOString();

    if (existing) {
      db.runSync(
        `UPDATE user_profile SET first_name = ?, last_name = ?, email = ?, phone = ?, updated_at = ? WHERE id = ?`,
        [data.first_name, data.last_name, data.email, data.phone, now, (existing as any).id]
      );
    } else {
      db.runSync(
        `INSERT INTO user_profile (first_name, last_name, email, phone, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [data.first_name, data.last_name, data.email, data.phone, now, now]
      );
    }
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

export const getUserProfile = () => {
  try {
    return db.getFirstSync('SELECT * FROM user_profile LIMIT 1');
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Pet profili fonksiyonları
export const savePet = (data: {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  blood_type?: string;
  photo_uri?: string;
}) => {
  try {
    const now = new Date().toISOString();
    
    db.runSync(
      `INSERT INTO pets (name, type, breed, age, weight, gender, blood_type, photo_uri, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.type,
        data.breed || '',
        data.age || 0,
        data.weight || 0,
        data.gender || '',
        data.blood_type || '',
        data.photo_uri || '',
        now,
        now
      ]
    );
    return true;
  } catch (error) {
    console.error('Error saving pet:', error);
    return false;
  }
};

export const updatePet = (id: number, data: {
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  blood_type?: string;
  photo_uri?: string;
}) => {
  try {
    const now = new Date().toISOString();
    
    db.runSync(
      `UPDATE pets SET name = ?, type = ?, breed = ?, age = ?, weight = ?, gender = ?, blood_type = ?, photo_uri = ?, updated_at = ? WHERE id = ?`,
      [
        data.name,
        data.type,
        data.breed || '',
        data.age || 0,
        data.weight || 0,
        data.gender || '',
        data.blood_type || '',
        data.photo_uri || '',
        now,
        id
      ]
    );
    return true;
  } catch (error) {
    console.error('Error updating pet:', error);
    return false;
  }
};

export const getAllPets = () => {
  try {
    return db.getAllSync('SELECT * FROM pets ORDER BY created_at DESC');
  } catch (error) {
    console.error('Error getting pets:', error);
    return [];
  }
};

export const deletePet = (id: number) => {
  try {
    db.runSync('DELETE FROM pets WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting pet:', error);
    return false;
  }
};

// Mevcut fonksiyonlar (saveDiagnosis güncellemesi)
export const saveDiagnosis = (data: {
  pet_id?: number;
  pet_type: string;
  symptoms: string;
  diagnosis: string;
  confidence_level: string;
  confidence_percentage: number;
  recommendations: string;
  risk_level?: string;
}) => {
  try {
    db.runSync(
      `INSERT INTO diagnosis_history 
       (pet_id, pet_type, symptoms, diagnosis, confidence_level, confidence_percentage, recommendations, risk_level, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.pet_id || null,
        data.pet_type,
        data.symptoms,
        data.diagnosis,
        data.confidence_level,
        data.confidence_percentage,
        data.recommendations,
        data.risk_level || 'Unknown',
        new Date().toISOString()
      ]
    );
    return true;
  } catch (error) {
    console.error('Error saving diagnosis:', error);
    return false;
  }
};

export const getDiagnosisHistory = (limit: number = 20) => {
  try {
    return db.getAllSync(
      'SELECT * FROM diagnosis_history ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const deleteDiagnosis = (id: number) => {
  try {
    db.runSync('DELETE FROM diagnosis_history WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    return false;
  }
};

// DÜZELTİLDİ: diagnosis_history tablosundan okuyor
export const getAllDiagnoses = () => {
  try {
    const diagnoses = db.getAllSync('SELECT * FROM diagnosis_history ORDER BY created_at DESC');
    return diagnoses;
  } catch (error) {
    console.error('Get all diagnoses error:', error);
    return [];
  }
};

// Favori veterinerler
export const addFavoriteVet = (vet: {
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  latitude: number;
  longitude: number;
}) => {
  try {
    db.runSync(
      `INSERT OR REPLACE INTO favorite_vets 
       (place_id, name, address, phone, latitude, longitude, added_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vet.place_id,
        vet.name,
        vet.address || '',
        vet.phone || '',
        vet.latitude,
        vet.longitude,
        new Date().toISOString()
      ]
    );
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
};

export const getFavoriteVets = () => {
  try {
    return db.getAllSync('SELECT * FROM favorite_vets ORDER BY added_at DESC');
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const removeFavoriteVet = (place_id: string) => {
  try {
    db.runSync('DELETE FROM favorite_vets WHERE place_id = ?', [place_id]);
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
};

export const isVetFavorite = (place_id: string): boolean => {
  try {
    const result = db.getFirstSync(
      'SELECT id FROM favorite_vets WHERE place_id = ?',
      [place_id]
    );
    return result !== null;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

export const clearAllData = () => {
  try {
    db.execSync('DELETE FROM diagnosis_history');
    db.execSync('DELETE FROM favorite_vets');
    db.execSync('DELETE FROM pets');
    db.execSync('DELETE FROM user_profile');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};