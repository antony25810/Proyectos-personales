import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Temporal: para simular la navegación a Login
const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <Text>¡Bienvenido a la App de Sismos!</Text>
      <Button
        title="Cerrar Sesión (Simulado)"
        onPress={() => navigation.replace('Auth')} // Volvemos al stack de autenticación
      />
      {/* Aquí mostrarás información de sismos, etc. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default HomeScreen;