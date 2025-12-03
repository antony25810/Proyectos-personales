import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Animated, Easing 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import authService from '../../services/authService'; 
import { Ionicons, Feather } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreen = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Tema oscuro con persistencia
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      setDarkMode(val === 'true');
    });
  }, []);
  useEffect(() => {
    AsyncStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // Animación simple de ondas
  const waveAnim = new Animated.Value(0);
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false
      })
    ).start();
  }, []);

  const handleSubmit = async () => {
    setMensaje('');
    setLoading(true);
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      setError(true);
      setLoading(false);
      return;
    }
    try {
      const userData = { nombre, email, password, confirmPassword };
      // Usa tu servicio para registro
      const response = await authService.register(userData);
      if (response && !response.error) {
        setMensaje(response.mensaje || 'Registro exitoso. Redirigiendo...');
        setError(false);
        setTimeout(() => navigation.navigate('Login'), 2000);
      } else {
        setMensaje(response.mensaje || 'Error en el registro');
        setError(true);
      }
    } catch (err) {
      setMensaje(err.message || 'No se pudo conectar con el servidor.');
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: darkMode ? '#1a202c' : '#f3f4f6'}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={[styles.container, {backgroundColor: darkMode ? '#1a202c' : '#f3f4f6'}]}>
          {/* Animación de ondas */}
          <View style={styles.wavesContainer} pointerEvents="none">
            {[1, 2, 3, 4, 5].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.wave,
                  {
                    borderColor: darkMode ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)',
                    width: `${i * 60}%`,
                    height: `${i * 60}%`,
                    opacity: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 0]
                    }),
                    transform: [{
                      scale: waveAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2]
                      })
                    }]
                  }
                ]}
              />
            ))}
          </View>
          {/* Botón de tema */}
          <TouchableOpacity style={styles.themeToggle} onPress={() => setDarkMode(!darkMode)}>
            {darkMode
              ? <Feather name="sun" size={22} color="#fbbf24" />
              : <Feather name="moon" size={22} color="#1e293b" />
            }
          </TouchableOpacity>
          <View style={[styles.formContainer, {backgroundColor: darkMode ? '#2d3748' : '#fff'}]}>
            {/* Encabezado */}
            <View style={styles.header}>
              <View style={[styles.logo, {backgroundColor: darkMode ? '#3182ce' : '#3b82f6'}]}>
                <Feather name="activity" size={28} color="#fff" />
              </View>
              <Text style={[styles.title, {color: darkMode ? '#90cdf4' : '#2563eb'}]}>SismoMonitor</Text>
              <Text style={[styles.subtitle, {color: darkMode ? '#fff' : '#1f2937'}]}>Crear Cuenta</Text>
              <View style={[styles.divider, {backgroundColor: darkMode ? '#3182ce' : '#60a5fa'}]} />
            </View>
            {/* Mensaje de error/éxito */}
            {mensaje ? (
              <View style={[
                styles.messageContainer,
                {
                  backgroundColor: error ? (darkMode ? 'rgba(254,202,202,0.2)' : '#fee2e2') : (darkMode ? 'rgba(209,250,229,0.2)' : '#d1fae5'),
                  borderColor: error ? (darkMode ? 'rgba(254,202,202,0.3)' : '#fecaca') : (darkMode ? 'rgba(167,243,208,0.3)' : '#a7f3d0')
                }
              ]}>
                {error && <Feather name="alert-circle" size={18} color="#b91c1c" style={{marginRight: 6}} />}
                <Text style={{color: error ? '#b91c1c' : '#047857'}}>{mensaje}</Text>
              </View>
            ) : null}
            {/* Formulario */}
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: darkMode ? '#d1d5db' : '#4b5563'}]}>Nombre de Usuario</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="user" size={18} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, {backgroundColor: darkMode ? '#4b5563' : '#f9fafb', color: darkMode ? '#fff' : '#1f2937', borderColor: darkMode ? '#6b7280' : '#d1d5db'}]}
                    placeholder="Ingrese su nombre de usuario"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#a0aec0'}
                    value={nombre}
                    onChangeText={setNombre}
                    editable={!loading}
                    autoCapitalize="none"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: darkMode ? '#d1d5db' : '#4b5563'}]}>Correo Electrónico</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={18} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, {backgroundColor: darkMode ? '#4b5563' : '#f9fafb', color: darkMode ? '#fff' : '#1f2937', borderColor: darkMode ? '#6b7280' : '#d1d5db'}]}
                    placeholder="Ingrese su correo electrónico"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#a0aec0'}
                    value={email}
                    onChangeText={setEmail}
                    editable={!loading}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: darkMode ? '#d1d5db' : '#4b5563'}]}>Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, {backgroundColor: darkMode ? '#4b5563' : '#f9fafb', color: darkMode ? '#fff' : '#1f2937', borderColor: darkMode ? '#6b7280' : '#d1d5db'}]}
                    placeholder="Ingrese su contraseña"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#a0aec0'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={[styles.label, {color: darkMode ? '#d1d5db' : '#4b5563'}]}>Confirmar Contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="lock" size={18} color={darkMode ? '#9ca3af' : '#6b7280'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, {backgroundColor: darkMode ? '#4b5563' : '#f9fafb', color: darkMode ? '#fff' : '#1f2937', borderColor: darkMode ? '#6b7280' : '#d1d5db'}]}
                    placeholder="Confirme su contraseña"
                    placeholderTextColor={darkMode ? '#9ca3af' : '#a0aec0'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    editable={!loading}
                  />
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.button, {backgroundColor: loading ? (darkMode ? '#1e40af' : '#93c5fd') : (darkMode ? '#3b82f6' : '#2563eb')}]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <>
                      <ActivityIndicator color="#fff" style={{marginRight: 8}} />
                      <Text style={{color: '#fff'}}>Procesando...</Text>
                    </>
                  : <>
                      <Feather name="user-plus" size={18} color="#fff" style={{marginRight: 8}} />
                      <Text style={{color: '#fff', fontWeight: 'bold'}}>Crear Cuenta</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
            {/* Enlace a login */}
            <Text style={[styles.footer, {color: darkMode ? '#9ca3af' : '#6b7280'}]}>
              ¿Ya tienes una cuenta?{' '}
              <Text onPress={() => navigation.navigate('Login')} style={[styles.link, {color: darkMode ? '#60a5fa' : '#2563eb'}]}>
                Inicia sesión aquí
              </Text>
            </Text>
            <View style={[styles.infoFooter, {borderTopColor: darkMode ? '#4b5563' : '#e5e7eb'}]}>
              <Text style={{fontSize: 12, color: darkMode ? '#6b7280' : '#9ca3af'}}>Sistema de Monitoreo Sísmico</Text>
              <Text style={{fontSize: 11, color: darkMode ? '#6b7280' : '#9ca3af'}}>Visualización y alerta de actividad sísmica en tiempo real</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { minHeight: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', flex: 1 },
  wavesContainer: { position: 'absolute', inset: 0, zIndex: 0, justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' },
  wave: { position: 'absolute', borderRadius: 9999, borderWidth: 1 },
  themeToggle: { position: 'absolute', top: 32, right: 32, zIndex: 10, padding: 8, borderRadius: 99, backgroundColor: '#fff', opacity: 0.85 },
  formContainer: { width: '100%', maxWidth: 400, alignSelf: 'center', padding: 24, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 4, marginTop: 40 },
  header: { alignItems: 'center', marginBottom: 18 },
  logo: { padding: 16, borderRadius: 99, marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 0 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 5 },
  divider: { width: 64, height: 4, borderRadius: 99, marginVertical: 8 },
  messageContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 6, marginBottom: 10, borderWidth: 1 },
  form: { marginTop: 10 },
  formGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, zIndex: 2 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingLeft: 40, paddingRight: 12, fontSize: 15 },
  button: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingVertical: 12, justifyContent: 'center', marginTop: 14 },
  footer: { marginTop: 20, fontSize: 13, textAlign: 'center' },
  link: { fontWeight: 'bold' },
  infoFooter: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, alignItems: 'center' },
});

export default RegisterScreen;