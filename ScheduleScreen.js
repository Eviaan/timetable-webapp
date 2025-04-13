
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

const ScheduleScreen = ({ route }) => {
  const { scheduleId, selectedDay: selectedDayFromParams } = route.params;
  const [selectedDay, setSelectedDay] = useState(selectedDayFromParams || null);

  const [schedule, setSchedule] = useState(null);
  const [days, setDays] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editedEventName, setEditedEventName] = useState('');
  const [editedEventTime, setEditedEventTime] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [events, setEvents] = useState({});
  
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const storedSchedules = await AsyncStorage.getItem('schedules');
        if (storedSchedules) {
          const schedules = JSON.parse(storedSchedules);
          const foundSchedule = schedules.find((s) => s.id === scheduleId);
          if (foundSchedule) {
            setSchedule(foundSchedule);
            setDays(foundSchedule.days || []);
            setEvents(foundSchedule.events || {});
          }
        }
      } catch (error) {
        console.error('Erreur chargement emploi du temps:', error);
      }
    };

    loadSchedule();
  }, [scheduleId]);

  const saveSchedule = async (updatedSchedule) => {
    try {
      const storedSchedules = await AsyncStorage.getItem('schedules');
      if (storedSchedules) {
        const schedules = JSON.parse(storedSchedules);
        const updatedSchedules = schedules.map((s) =>
          s.id === scheduleId ? updatedSchedule : s
        );
        await AsyncStorage.setItem(
          'schedules',
          JSON.stringify(updatedSchedules)
        );
        setSchedule(updatedSchedule);
        setDays(updatedSchedule.days || []);
        setEvents(updatedSchedule.events || {});
      }
    } catch (error) {
      console.error('Erreur sauvegarde emploi du temps:', error);
    }
  };

  const addEvent = async () => {
    if (selectedDay && newEventName.trim() && newEventTime.trim()) {
      const newEvent = {
        id: Date.now().toString(),
        name: newEventName,
        time: newEventTime,
      };
      const updatedEventsForDay = [
        ...(events[selectedDay.id] || []),
        newEvent
      ];

      const updatedEvents = {
        ...events,
        [selectedDay.id]: updatedEventsForDay.sort((a, b) =>
          parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
        ),
      };
      saveSchedule({ ...schedule, events: updatedEvents });
      setModalVisible(false);
      setNewEventName('');
      setNewEventTime('');
    }
  };

  const openModal = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent(event);
    setEditedEventName(event.name);
    setEditedEventTime(event.time);
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (selectedDay && selectedEvent && editedEventName.trim() && editedEventTime.trim()) {
      const updatedEventsForDay = (events[selectedDay.id] || []).map((event) =>
        event.id === selectedEvent.id
          ? { ...event, name: editedEventName, time: editedEventTime }
          : event
      );

      const updatedEvents = {
        ...events,
        [selectedDay.id]: updatedEventsForDay,
      };

      await saveSchedule({ ...schedule, events: updatedEvents });
      setEditModalVisible(false);
      setSelectedEvent(null);
    }
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedDay && selectedEvent) {
      const updatedEventsForDay = (events[selectedDay.id] || []).filter(
        (event) => event.id !== selectedEvent.id
      );

      const updatedEvents = {
        ...events,
        [selectedDay.id]: updatedEventsForDay,
      };

      await saveSchedule({ ...schedule, events: updatedEvents });
      setDeleteModalVisible(false);
      setSelectedEvent(null);
    }
  };

  const parseTimeToMinutes = (timeString) => {
    const regex = /^(\d{1,2})[:h](\d{0,2})$/;
    const match = timeString.match(regex);

    if (!match) return 0;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2] || '0', 10);

    return hours * 60 + minutes;
  };

  const formatTime = (timeString) => {
    const regex = /^(\d{1,2})[:h](\d{0,2})$/;
    const match = timeString.match(regex);
    
    if (!match) return '00:00';

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2] || '0', 10);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const eventsForSelectedDay = selectedDay && events[selectedDay.id]
    ? [...events[selectedDay.id]].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time))
    : [];

console.log('ScheduleScreen reçu :', { scheduleId, selectedDayFromParams });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {schedule ? schedule.name : 'Chargement...'}
         > 
        {selectedDay ? selectedDay.name : 'Chargement...'}
      </Text>

      {selectedDay && events[selectedDay.id] && (
        <FlatList
          data={eventsForSelectedDay}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slot}>
              <Text style={styles.scheduleText}>{formatTime(item.time)} - {item.name}</Text>

              <View style={styles.actionBox}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editButton}>
                  <Ionicons name="create-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openDeleteModal(item)} style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          if (selectedDay) {
            setModalVisible(true);
          } else {
            alert("Sélectionne un jour pour ajouter un événement !");
          }
        }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal d'ajout d'événement */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ajouter un événement</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'événement"
              value={newEventName}
              onChangeText={setNewEventName}
            />
            <TextInput
              style={styles.input}
              placeholder="Heure de l'événement (ex: 14h30)"
              value={newEventTime}
              onChangeText={setNewEventTime}
            />
            <TouchableOpacity style={styles.ok} onPress={addEvent}>
              <Text style={styles.okText}>Ajouter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancel}
              onPress={() => setModalVisible(false)}>
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
                placeholder="Nom de l’événement"
                value={editedEventName}
                onChangeText={setEditedEventName}
              />
              <TextInput
                style={styles.input}
                placeholder="Heure de l’événement"
                value={editedEventTime}
                onChangeText={setEditedEventTime}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 15,
  },
  ok: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  cancel: {
    width: '100%',
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

export default ScheduleScreen;
