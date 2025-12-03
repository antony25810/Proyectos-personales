import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView,
  Button
} from 'react-native';
import sismoService from '../../services/sismoService'; // Debes crear este servicio como el de authService

const SismosScreen = () => {
  const [sismos, setSismos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [magnitudFiltro, setMagnitudFiltro] = useState('5'); // String para TextInput controlado

  // Cargar sismos con filtro
  const cargarSismos = async (mag = magnitudFiltro) => {
    setLoading(true);
    setError('');
    try {
      const data = await sismoService.getSismosByMagnitud(mag);
      setSismos(data);
    } catch (err) {
      setError('Error: ' + (err.message || 'No se pudo obtener los datos'));
      setSismos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSismos();
  }, []);

  const handleChangeFiltro = (val) => setMagnitudFiltro(val);

  const handleAplicarFiltro = () => cargarSismos(magnitudFiltro);

  // Columnas a mostrar
  const columns = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'hora', label: 'Hora' },
    { key: 'magnitud', label: 'Magnitud' },
    { key: 'latitud', label: 'Latitud' },
    { key: 'longitud', label: 'Longitud' },
    { key: 'profundidad', label: 'Profundidad' },
    { key: 'referenciaLocalizacion', label: 'Ubicación' },
  ];

  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map(col => (
        <Text key={col.key} style={[styles.cell, styles.headerCell]}>{col.label}</Text>
      ))}
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={[styles.dataRow, index % 2 === 1 && styles.evenRow]}>
      <Text style={styles.cell}>{item.fecha}</Text>
      <Text style={styles.cell}>{item.hora}</Text>
      <Text style={styles.cell}>{item.magnitud || "No calculable"}</Text>
      <Text style={styles.cell}>{item.latitud}</Text>
      <Text style={styles.cell}>{item.longitud}</Text>
      <Text style={styles.cell}>{item.profundidad} km</Text>
      <Text style={styles.cell}>{item.referenciaLocalizacion}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f9fafb'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 24}}>
        <View style={styles.container}>
          <Text style={styles.title}>Lista de Sismos</Text>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Magnitud mínima:</Text>
            <TextInput
              style={styles.input}
              value={magnitudFiltro}
              onChangeText={handleChangeFiltro}
              keyboardType="numeric"
              placeholder="Ej: 5"
              editable={!loading}
            />
            <TouchableOpacity style={styles.button} onPress={handleAplicarFiltro} disabled={loading}>
              <Text style={styles.buttonText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#FF9200" style={{marginVertical: 40}} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : sismos.length === 0 ? (
            <Text style={styles.noDataText}>No hay registros de sismos con magnitud mayor a {magnitudFiltro}.</Text>
          ) : (
            <>
              <Text style={styles.totalText}>Total de registros: {sismos.length}</Text>
              <ScrollView horizontal>
                <View>
                  {renderHeader()}
                  <FlatList
                    data={sismos}
                    renderItem={renderItem}
                    keyExtractor={(_, idx) => idx.toString()}
                    scrollEnabled={false}
                    style={{maxHeight: 380}}
                  />
                </View>
              </ScrollView>
            </>
          )}

          <Button style={{ textAlign: 'center', marginTop: 20 }}>
            ¿No tienes cuenta? 
              <Text 
                style={{ color: '#007AFF' }} 
                onPress={() => navigation.navigate('SismosMap')}
              >
                Regístrate aquí
              </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', borderRadius: 10, marginTop: 20, marginHorizontal: 10, elevation: 2 },
  title: { fontSize: 22, color: '#FF9200', fontWeight: 'bold', marginBottom: 14 },
  filterContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  filterLabel: { fontSize: 15, marginRight: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 7, width: 56, textAlign: 'center', marginRight: 8, backgroundColor: '#f9fafb' },
  button: { backgroundColor: '#3CB371', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  totalText: { fontSize: 15, color: '#555', marginBottom: 8 },
  headerRow: { flexDirection: 'row', backgroundColor: '#f2f2f2', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerCell: { fontWeight: 'bold', color: '#333' },
  dataRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eaeaea', paddingVertical: 5 },
  evenRow: { backgroundColor: '#f9f9f9' },
  cell: { paddingHorizontal: 10, paddingVertical: 8, minWidth: 90, fontSize: 13, color: '#222' },
  errorBox: { backgroundColor: '#ffe6e6', borderColor: 'red', borderWidth: 1, borderRadius: 6, padding: 14, marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center' },
  noDataText: { color: '#444', fontSize: 15, marginTop: 22, textAlign: 'center' },
});

export default SismosScreen;