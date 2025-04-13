import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const storedSchedules = await AsyncStorage.getItem('schedules');
        if (storedSchedules) {
          setSchedules(JSON.parse(storedSchedules));
        }
      } catch (error) {
        console.error('Erreur chargement emplois du temps:', error);
      }
    };

    loadSchedules();
  }, []);

  const addSchedule = async () => {
    if (newScheduleName) {
      const newSchedule = {
        id: Date.now().toString(),
        name: newScheduleName,
        days: [],
        events: {},
      };

      const updatedSchedules = [...schedules, newSchedule];

      try {
        await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
      } catch (error) {
        console.error('Erreur sauvegarde emploi du temps:', error);
      }

      setNewScheduleName('');
      setModalVisible(false);
    }
  };

  const openEditModal = (schedule) => {
    setSelectedSchedule(schedule);
    setNewScheduleName(schedule.name);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (selectedSchedule && newScheduleName.trim()) {
      const updatedSchedules = schedules.map((schedule) =>
        schedule.id === selectedSchedule.id ? { ...schedule, name: newScheduleName } : schedule
      );

      try {
        await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
      } catch (error) {
        console.error('Erreur de modification:', error);
      }

      setEditModalVisible(false);
    }
  };

  const openDeleteModal = (schedule) => {
    setSelectedSchedule(schedule);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedSchedule) {
      const updatedSchedules = schedules.filter(schedule => schedule.id !== selectedSchedule.id);

      try {
        await AsyncStorage.setItem('schedules', JSON.stringify(updatedSchedules));
        setSchedules(updatedSchedules);
      } catch (error) {
        console.error('Erreur suppression:', error);
      }

      setDeleteModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={schedules}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slot}
            onPress={() => navigation.navigate('DayScreen', { scheduleId: item.id })}>
            <Text style={styles.scheduleText}>{item.name}</Text>

            <View style={styles.actionBox}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                <Ionicons name="create-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openDeleteModal(item)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal d'ajout d'emploi du temps */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer un emploi du temps</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'emploi du temps"
              value={newScheduleName}
              onChangeText={setNewScheduleName}
            />
            <TouchableOpacity style={styles.ok} onPress={addSchedule}>
              <Text style={styles.okText}>Ajouter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier l'emploi du temps</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'emploi du temps"
              value={newScheduleName}
              onChangeText={setNewScheduleName}
            />
            <TouchableOpacity style={styles.ok} onPress={saveEdit}>
              <Text style={styles.okText}>Sauvegarder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de suppression */}
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Supprimer cet emploi du temps ?</Text>
            <TouchableOpacity style={styles.ok} onPress={confirmDelete}>
              <Text style={styles.okText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setDeleteModalVisible(false)}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  slot: {
    flexDirection: 'row',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleText: {
    fontSize: 18,
  },
  actionBox: {
    flexDirection: "row",
  },
  editButton: {
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 10,
    marginRight: 5,
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  ok: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancel: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  okText: {
    color: '#000',
    fontSize: 16,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
};

export default HomeScreen;
