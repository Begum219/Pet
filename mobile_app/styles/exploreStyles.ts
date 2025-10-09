import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#49a1dcff',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginBottom: 15,
  },
  statusButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // PET SEÇİCİ STYLE'LARI
  petSelectorSection: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#49a1dcff',
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  petSelectorIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  selectedPetInfo: {
    flex: 1,
  },
  selectedPetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPetBreed: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  petDropdown: {
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  petOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  petOptionIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  petOptionInfo: {
    flex: 1,
  },
  petOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  petOptionBreed: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  noPetWarning: {
    backgroundColor: '#fff3cd',
    margin: 15,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noPetWarningText: {
    fontSize: 15,
    color: '#856404',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  addPetButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPetButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  inputSection: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  helper: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  petTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  petButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#c5bbe5ff',
    alignItems: 'center',
  },
  selectedPet: {
    backgroundColor: '#4c00d8ff',
  },
  petButtonText: {
    fontSize: 16,
    color: '#ffffffff',
  },
  selectedPetText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#49a1dcff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultSection: {
    padding: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  diagnosisCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  highConfidence: {
    borderLeftColor: '#4CAF50',
  },
  mediumConfidence: {
    borderLeftColor: '#FF9800',
  },
  lowConfidence: {
    borderLeftColor: '#0d0605ff',
  },
  diagnosisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  interpretation: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  riskLevel: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: 'bold',
  },
  alternativesSection: {
    marginBottom: 15,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  alternativeCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: '500',
  },
  alternativeLevel: {
    fontSize: 12,
    color: '#ff0000ff',
    marginTop: 2,
  },
  alternativeConfidence: {
    fontSize: 14,
    color: '#ff0000ff',
    fontWeight: 'bold',
  },
  recommendationsSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  mapButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  mapSection: {
    padding: 20,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  
  // YENİ: FAVORİ FİLTRE STYLE'LARI
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  favoriteFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  favoriteFilterActive: {
    backgroundColor: '#ff6b6b',
  },
  favoriteFilterText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteFilterTextActive: {
    color: '#fff',
  },
  
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  vetList: {
    marginTop: 10,
  },
  vetCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#49a1dcff',
  },
  
  // YENİ: VETERİNER KART HEADER (Favori butonu için)
  vetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vetInfo: {
    flex: 1,
  },
  
  vetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  vetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rating: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  vetAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  vetPhone: {
    fontSize: 14,
    color: '#49a1dcff',
    fontWeight: '600',
    marginBottom: 5,
  },
  
  // YENİ: FAVORİ BUTONU
  favoriteButton: {
    padding: 5,
    marginLeft: 10,
  },
  
  openStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  open: {
    color: '#4CAF50',
  },
  closed: {
    color: '#F44336',
  },
  webWarning: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  webWarningText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  noResultCard: {
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});