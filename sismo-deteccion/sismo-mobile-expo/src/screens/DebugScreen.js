import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { BASE_URL, testConnection } from '../config/api';
import authService from '../services/authService';

const DebugScreen = ({ navigation }) => {
  const [connectionStatus, setConnectionStatus] = useState('Verificando...');
  const [debugInfo, setDebugInfo] = useState([]);

  useEffect(() => {
    addDebugInfo('🚀 Iniciando debug...');
    addDebugInfo(`🌐 URL Base: ${BASE_URL}`);
    testBackendConnection();
  }, []);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testBackendConnection = async () => {
    addDebugInfo('🔄 Probando conexión...');
    try {
      const result = await authService.testConnection();
      setConnectionStatus('✅ Conectado');
      addDebugInfo('✅ Conexión exitosa');
      addDebugInfo(`📊 Datos recibidos: ${JSON.stringify(result).substring(0, 100)}...`);
    } catch (error) {
      setConnectionStatus('❌ Sin conexión');
      addDebugInfo(`❌ Error: ${error.message}`);
      addDebugInfo(`🔍 Tipo de error: ${error.type || 'unknown'}`);
    }
  };

  const testLogin = async () => {
    addDebugInfo('🔐 Probando login...');
    try {
      const result = await authService.login('testuser', 'testpass');
      addDebugInfo(`✅ Login response: ${JSON.stringify(result)}`);
    } catch (error) {
      addDebugInfo(`❌ Login error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Backend</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>Estado: {connectionStatus}</Text>
        <Text style={styles.urlText}>URL: {BASE_URL}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testBackendConnection}>
          <Text style={styles.buttonText}>Probar Conexión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testLogin}>
          <Text style={styles.buttonText}>Probar Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Ir a Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Log Debug:</Text>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.logText}>{info}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  urlText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2
  }
});

export default DebugScreen;