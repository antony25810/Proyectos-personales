import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Circle } from 'react-native-maps';

const SismoPropagationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sismo } = route.params;

  // Animación de la onda sísmica
  const animatedRadius = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reinicia la animación cada vez que cambia el sismo
    animatedRadius.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedRadius, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedRadius, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [sismo]);

  // Radio animado de la onda (en metros)
  const minRadius = 20000;
  const maxRadius = 80000;
  const interpolatedRadius = animatedRadius.interpolate({
    inputRange: [0, 1],
    outputRange: [minRadius, maxRadius],
  });

  // Opacidad animada (onda se desvanece)
  const interpolatedOpacity = animatedRadius.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.22, 0.08],
  });

  // Centro del mapa: posición del sismo
  const initialRegion = {
    latitude: sismo?.latitud || 23.6345,
    longitude: sismo?.longitud || -102.5528,
    latitudeDelta: 2.5,
    longitudeDelta: 2.5,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Text style={styles.title}>Propagación de Ondas Sísmicas</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Sismo {sismo?.magnitud || "No calculable"}</Text>
        <Text style={styles.infoText}><Text style={styles.infoLabel}>Fecha:</Text> {sismo?.fecha}</Text>
        <Text style={styles.infoText}><Text style={styles.infoLabel}>Hora:</Text> {sismo?.hora}</Text>
        <Text style={styles.infoText}><Text style={styles.infoLabel}>Ubicación:</Text> {sismo?.referenciaLocalizacion}</Text>
        <Text style={styles.infoText}><Text style={styles.infoLabel}>Coordenadas:</Text> {sismo?.latitud}, {sismo?.longitud}</Text>
      </View>
      {/* Mapa con animación de propagación */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Epicentro */}
          <Circle
            center={{ latitude: sismo?.latitud, longitude: sismo?.longitud }}
            radius={4000}
            strokeColor="#2563eb"
            fillColor="rgba(37,99,235,0.18)"
          />
          {/* Onda sísmica animada */}
          <AnimatedCircle
            center={{ latitude: sismo?.latitud, longitude: sismo?.longitud }}
            animatedRadius={interpolatedRadius}
            animatedOpacity={interpolatedOpacity}
          />
        </MapView>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Volver al Mapa</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente para la onda animada
const AnimatedCircle = ({ center, animatedRadius, animatedOpacity }) => {
  const [radius, setRadius] = React.useState(0);
  const [opacity, setOpacity] = React.useState(0.3);

  useEffect(() => {
    const id1 = animatedRadius.addListener(({ value }) => setRadius(value));
    const id2 = animatedOpacity.addListener(({ value }) => setOpacity(value));
    return () => {
      animatedRadius.removeListener(id1);
      animatedOpacity.removeListener(id2);
    };
  }, [animatedRadius, animatedOpacity]);

  return (
    <Circle
      center={center}
      radius={radius}
      strokeColor="rgba(66,133,244,0.3)"
      fillColor={`rgba(66,133,244,${opacity})`}
      zIndex={10}
    />
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, color: '#2563eb', marginTop: 18, marginBottom: 8, fontWeight: 'bold', alignSelf: 'center' },
  infoBox: { padding: 14, backgroundColor: '#f9fafb', borderRadius: 10, width: '94%', marginBottom: 10, alignSelf: 'center', elevation: 2 },
  infoTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 6, color: '#2563eb' },
  infoText: { fontSize: 14, marginBottom: 2, color: '#222' },
  infoLabel: { fontWeight: 'bold', color: '#333' },
  mapContainer: { marginVertical: 20, alignSelf: 'center', borderRadius: 16, overflow: 'hidden', width: Dimensions.get('window').width * 0.94, height: 320 },
  map: { width: '100%', height: '100%' },
  button: { marginTop: 12, backgroundColor: '#4285f4', paddingVertical: 10, borderRadius: 8, alignItems: 'center', width: '60%', alignSelf: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
});

export default SismoPropagationScreen;