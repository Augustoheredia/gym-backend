import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// URL del backend conectado a Oracle (usando la IP de tu red local y puerto 3000)
const API_URL = 'http://192.168.100.203:3000';

export default function MembresiasScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde el backend al iniciar la pantalla
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resUsuarios = await fetch(`${API_URL}/api/usuarios-con-membresia`);
      const dataUsuarios = await resUsuarios.json();
      setUsuarios(dataUsuarios);
      if (dataUsuarios.length > 0 && !usuarioSeleccionado) {
        setUsuarioSeleccionado(dataUsuarios[0]);
      }

      const resMembresias = await fetch(`${API_URL}/api/membresias`);
      const dataMembresias = await resMembresias.json();
      setMembresias(dataMembresias);
    } catch (error) {
      console.error("Error de conexión con la API:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor backend en Oracle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cambiar o asignar la membresía del usuario actual en la base de datos
  const asignarMembresia = async (membresiaId) => {
    if (!usuarioSeleccionado) return;
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${usuarioSeleccionado.USUARIO_ID}/membresia`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membresia_id: membresiaId })
      });
      const data = await res.json();
      Alert.alert("¡Éxito!", data.message);
      cargarDatos(); // Recargar datos para reflejar el cambio al instante
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la membresía");
    }
  };

  if (loading && usuarios.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Conectando con Oracle y cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🏋️ Gestión de Membresías</Text>

      {/* SECCIÓN 1: Tarjeta del Usuario Seleccionado */}
      {usuarioSeleccionado && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Usuario Activo:</Text>
          <Text style={styles.textBold}>{usuarioSeleccionado.USUARIO_NOMBRE}</Text>
          <Text style={styles.subText}>Correo: {usuarioSeleccionado.CORREO}</Text>
          <Text style={styles.planActual}>
            Plan Actual: {usuarioSeleccionado.MEMBRESIA_NOMBRE || 'Sin membresía asignada'} 
            {usuarioSeleccionado.PRECIO ? ` ($${usuarioSeleccionado.PRECIO})` : ''}
          </Text>
        </View>
      )}

      {/* SECCIÓN 2: Lista horizontal de Usuarios para cambiar de selección */}
      <Text style={styles.sectionTitle}>Selecciona un usuario:</Text>
      <FlatList
        data={usuarios}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.USUARIO_ID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.userChip, 
              usuarioSeleccionado?.USUARIO_ID === item.USUARIO_ID && styles.userChipActive
            ]}
            onPress={() => setUsuarioSeleccionado(item)}
          >
            <Text style={[
              styles.userChipText,
              usuarioSeleccionado?.USUARIO_ID === item.USUARIO_ID && styles.userChipTextActive
            ]}>
              {item.USUARIO_NOMBRE}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.horizontalList}
      />

      {/* SECCIÓN 3: Catálogo de Membresías disponibles para asignar */}
      <Text style={styles.sectionTitle}>Planes Disponibles (Oracle):</Text>
      <FlatList
        data={membresias}
        keyExtractor={(item) => item.ID.toString()}
        renderItem={({ item }) => (
          <View style={styles.membresiaRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.textBold}>{item.NOMBRE}</Text>
              <Text style={styles.subText}>Duración: {item.DURACION} | Precio: ${item.PRECIO}</Text>
            </View>
            <TouchableOpacity 
              style={styles.buttonSelect} 
              onPress={() => asignarMembresia(item.ID)}
            >
              <Text style={styles.buttonText}>Asignar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f7', padding: 16, paddingTop: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f7' },
  loadingText: { marginTop: 10, color: '#7f8c8d', fontSize: 14 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, color: '#2c3e50' },
  card: { backgroundColor: '#ffffff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardTitle: { fontSize: 13, color: '#95a5a6', textTransform: 'uppercase', fontWeight: 'bold' },
  textBold: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginTop: 2 },
  planActual: { marginTop: 8, fontSize: 15, color: '#e67e22', fontWeight: 'bold' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 10, marginBottom: 8, color: '#34495e' },
  horizontalList: { maxHeight: 50, marginBottom: 10 },
  userChip: { backgroundColor: '#e2e8f0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 8, height: 40, justifyContent: 'center' },
  userChipActive: { backgroundColor: '#3498db' },
  userChipText: { color: '#4a5568', fontWeight: '600', fontSize: 13 },
  userChipTextActive: { color: '#ffffff' },
  membresiaRow: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  subText: { color: '#7f8c8d', fontSize: 12, marginTop: 2 },
  buttonSelect: { backgroundColor: '#2ecc71', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 }
});
