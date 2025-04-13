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

const DayScreen = ({ route, navigation }) => {
  const { scheduleId } = route.params;
  const [schedule, setSchedule] = useState(null);
  // const [days, setDays] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDayName, setNewDayName] = useState('');

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const storedSchedules = await AsyncStorage.getItem('schedules');
        if (storedSchedules) {
          const schedules = JSON.parse(storedSchedules);
          const foundSchedule = schedules.find((s) => s.id === scheduleId);
          if (foundSchedule) {
            setSchedule(foundSchedule);
          }
        }
      } catch (error) {
        console.error('Erreur chargement emploi du temps:', error);
      }
    };

    loadSchedule();
  }, [scheduleId]);

  const addDay = async () => {
    if (newDayName.trim()) {
      const newDay = { id: Date.now().toString(), name: newDayName };
      const updatedDays = [...days, newDay];

      try {
        await AsyncStorage.setItem(`days_${scheduleId}`, JSON.stringify(updatedDays));
        setDays(updatedDays);
      } catch (error) {
        console.error('Erreur sauvegarde jour:', error);
      }

      setNewDayName('');
      setModalVisible(false);
    }
  };


  const daysOfWeek = [
    { id: 'monday', name: 'Lundi' },
    { id: 'tuesday', name: 'Mardi' },
    { id: 'wednesday', name: 'Mercredi' },
    { id: 'thursday', name: 'Jeudi' },
    { id: 'friday', name: 'Vendredi' },
    { id: 'saturday', name: 'Samedi' },
    { id: 'sunday', name: 'Dimanche' },
  ];

console.log('Days of week : ', daysOfWeek);
  return (
  <View style={styles.container}>
    <Text style={styles.title}>
      {schedule ? schedule.name : 'Chargement...'}
    </Text>

    <FlatList
      data={daysOfWeek}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
         console.log('Rendering item:', item); // ➜ Vérifie que ça s’affiche
        return (
          <TouchableOpacity
            style={styles.slot}
            onPress={() => {
              
              console.log('Clicked day:', item);

              navigation.navigate('ScheduleScreen', {
                scheduleId: scheduleId,
                selectedDay: item,
              })
            }}
          >
            <Text style={styles.dayText}>{item.name}</Text>
          </TouchableOpacity>
        );
      }}
    />
  </View>
);

};

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
  
  dayText: {
    fontSize: 18,
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

export default DayScreen;
