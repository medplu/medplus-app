import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import SubHeading from '../dashboard/SubHeading';
import axios from 'axios';
import Colors from '../Shared/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AwesomeAlert from 'react-native-awesome-alerts';
import { Paystack } from 'react-native-paystack-webview';
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome

const BookingSection = ({ clinic, navigation }) => {
  const [next7Days, setNext7Days] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeList, setTimeList] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState({ firstName: '', lastName: '', email: '', userId: '' });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [appointmentId, setAppointmentId] = useState(null);

  const paystackWebViewRef = useRef();

  useEffect(() => {
    getDays();
    getTime();
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      setUser({ firstName, lastName, email, userId });
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const getDays = () => {
    const today = new Date();
    const nextSevenDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      nextSevenDays.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleString('en-us', { weekday: 'short' }),
        formattedDate: date.toLocaleDateString('en-us', { day: 'numeric', month: 'short' }),
      });
    }
    setNext7Days(nextSevenDays);
  };

  const getTime = () => {
    const timeList = [];
    for (let i = 7; i <= 11; i++) {
      timeList.push({ time: `${i}:00 AM` });
      timeList.push({ time: `${i}:30 AM` });
    }
    for (let i = 1; i <= 5; i++) {
      timeList.push({ time: `${i}:00 PM` });
      timeList.push({ time: `${i}:30 PM` });
    }
    setTimeList(timeList);
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !clinic._id || !notes) {
      setAlertMessage('Please fill in all the required fields.');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    try {
      // Step 1: Create the appointment
      const appointmentResponse = await axios.post('https://medplus-app.onrender.com/api/clinic/appointments', {
        userId: user.userId,
        clinicId: clinic._id,
        date: selectedDate,
        time: selectedTime,
        notes,
        status: 'pending'
      });

      const appointmentId = appointmentResponse.data._id;
      setAppointmentId(appointmentId);

      // Start Paystack transaction
      paystackWebViewRef.current.startTransaction();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Handle successful payment here
      console.log('Payment successful:', response);

      // Update appointment status to 'confirmed'
      await axios.put(`https://medplus-app.onrender.com/api/clinic/appointments/${appointmentId}`, {
        status: 'confirmed'
      });

      setAlertMessage('Appointment booked and payment successful!');
      setAlertType('success');
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      setAlertMessage('Payment successful, but failed to update appointment status. Please contact support.');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setAlertMessage('Payment was cancelled. Please try again.');
    setAlertType('error');
    setShowAlert(true);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={20} color="black" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, color: Colors.gray, marginBottom: 10 }}>Book Appointment</Text>
      <SubHeading subHeadingTitle="Day" seeAll={false} />
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {next7Days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              selectedDate === day.date && styles.selectedButton,
            ]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text style={selectedDate === day.date ? styles.selectedText : styles.text}>
              {day.day} {day.formattedDate}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <SubHeading subHeadingTitle="Time" seeAll={false} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {timeList.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.timeButton,
              selectedTime === slot.time && styles.selectedButton,
            ]}
            onPress={() => setSelectedTime(slot.time)}
          >
            <Text style={selectedTime === slot.time ? styles.selectedText : styles.text}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.textInput}
        placeholder="Enter additional notes (optional)"
        value={notes}
        onChangeText={setNotes}
      />
      <TouchableOpacity
        onPress={handleBookAppointment}
        disabled={isSubmitting}
        style={{ backgroundColor: Colors.primary, borderRadius: 99, padding: 13, margin: 10 }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <Text style={{ fontSize: 17, textAlign: 'center', color: Colors.white }}>
            Make Appointment
          </Text>
        )}
      </TouchableOpacity>

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={'25000.00'}
        billingEmail={user.email}
        currency='KES'
        activityIndicatorColor={Colors.primary}
        onCancel={handlePaymentCancel}
        onSuccess={handlePaymentSuccess}
        ref={paystackWebViewRef}
      />

      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={Colors.primary}
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dayButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    margin: 5,
  },
  timeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 10,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: Colors.primary,
  },
  selectedText: {
    color: Colors.white,
  },
  text: {
    color: Colors.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
});

export default BookingSection;