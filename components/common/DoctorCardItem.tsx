import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../Shared/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Paystack, paystackProps } from 'react-native-paystack-webview';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useRouter } from 'expo-router';

// Importing the SECRET_KEY from .env
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  category: string;
  availability: boolean;
  user: string;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  userId: string;
}

interface DoctorCardItemProps {
  doctor: Doctor;
  userId: string;
  consultationFee: number;
}

const DoctorCardItem: React.FC<DoctorCardItemProps> = ({ doctor, userId, consultationFee }) => {
  const paystackWebViewRef = useRef<paystackProps.PayStackRef>(null);
  const { firstName, lastName, category, availability, _id } = doctor;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [appointmentId, setAppointmentId] = useState<string | null>(null);
  const [user, setUser] = useState<User>({ firstName: '', lastName: '', email: '', userId: '' });
  const [subaccountCode, setSubaccountCode] = useState<string | null>(null); // State to store subaccount code

  useEffect(() => {
    getUserData();
    fetchSubaccountCode(); // Fetch subaccount code when component mounts
  }, [userId]);

  const getUserData = async () => {
    try {
      const firstName = await AsyncStorage.getItem('firstName');
      const lastName = await AsyncStorage.getItem('lastName');
      const email = await AsyncStorage.getItem('email');
      const userId = await AsyncStorage.getItem('userId');
      if (firstName && lastName && email && userId) {
        setUser({ firstName, lastName, email, userId });
        console.log('Fetched user data:', { firstName, lastName, email, userId });
      }
    } catch (error) {
      console.error('Failed to load user data', error);
    }
  };

  const fetchSubaccountCode = async () => {
    if (!userId) return; // Ensure userId is available before making the request
    try {
      const response = await axios.get(`https://medplus-app.onrender.com/api/subaccount/${userId}`);
      if (response.data.status === 'Success') {
        setSubaccountCode(response.data.data.subaccount_code); // Adjusted to match the response structure
        console.log('Fetched subaccount code:', response.data.data.subaccount_code);
      } else {
        console.error('Failed to fetch subaccount code:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch subaccount code:', error);
    }
  };

  const handleBookPress = async () => {
    setIsSubmitting(true);
    try {
      console.log('Booking appointment with doctorId:', _id, 'and userId:', user.userId);
      
      // Initialize the transaction here to get the payment URL from Paystack
      const paymentResponse = await axios.post('https://api.paystack.co/transaction/initialize', {
        email: user.email,
        amount: consultationFee * 100, // Paystack expects the amount in kobo
        subaccount: subaccountCode,
      }, {
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`, // Use the secret key from .env
          'Content-Type': 'application/json'
        }
      });

      // Create appointment record after payment initialization
      const appointmentResponse = await axios.post('https://medplus-app.onrender.com/api/appointments', {
        doctorId: _id,
        userId: user.userId,
        patientName: `${user.firstName} ${user.lastName}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      const appointmentId = appointmentResponse.data._id;
      setAppointmentId(appointmentId);
      console.log('Created appointment with appointmentId:', appointmentId);

      // Ensure paystackWebViewRef.current is defined before calling startTransaction
      if (paystackWebViewRef.current) {
        paystackWebViewRef.current.startTransaction();
      } else {
        console.error('paystackWebViewRef.current is undefined');
      }
    } catch (error) {
      console.error('Failed to book appointment:', error);
      setAlertMessage('Failed to book appointment. Please try again.');
      setAlertType('error');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (response: any, appointmentId: string) => {
    try {
      console.log('Payment successful:', response);
      console.log('Confirming appointment with appointmentId:', appointmentId);

      await axios.put(`https://medplus-app.onrender.com/api/appointments/confirm/${appointmentId}`, {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setAlertMessage('Payment was cancelled. Please try again.');
    setAlertType('error');
    setShowAlert(true);
    setIsSubmitting(false);
  };

  return (
    <View style={styles.cardContainer}>
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Image
          source={{ uri: 'https://via.placeholder.com/120x150' }}
          style={{ width: 120, height: 150, objectFit: 'contain', borderRadius: 15 }}
        />

        <View style={{ flex: 1, justifyContent: 'space-evenly' }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={styles.headingContainer}>
              <MaterialIcons name="verified" size={20} color={Colors.primary} />
              <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
                Professional Doctor
              </Text>
            </View>

            <FontAwesome name="heart" size={20} color={Colors.primary} />
          </View>

          <View>
            <Text style={styles.doctorName}>
              Dr. {firstName} {lastName}
            </Text>
            <Text style={styles.categoryName}>
              {category}
            </Text>
            <Text style={[styles.categoryName, { color: Colors.primary }]}>
              {availability ? 'Available' : 'Not Available'}
            </Text>
          </View>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: 'Inter-Black-Semi' }}>⭐⭐⭐⭐ 4.8 </Text>
            <Text style={{ color: Colors.gray }}>49 Reviews</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.makeAppointmentContainer} onPress={handleBookPress} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={{ color: Colors.primary, fontFamily: 'Inter-Black-Semi', fontSize: 15 }}>
            Book Appointment
          </Text>
        )}
      </TouchableOpacity>

      <Paystack
        paystackKey="pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0"
        amount={consultationFee * 100} // Amount in kobo
        billingEmail={user.email}
        currency='KES'
        activityIndicatorColor={Colors.primary}
        onCancel={handlePaymentCancel}
        onSuccess={(response) => handlePaymentSuccess(response, appointmentId!)}
        ref={paystackWebViewRef}
      />

      <AwesomeAlert
        show={showAlert}
        title={alertType === 'success' ? 'Success' : 'Error'}
        message={alertMessage}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={Colors.primary}
        onConfirmPressed={() => setShowAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  doctorName: {
    fontSize: 16,
    fontFamily: 'Inter-Black-Semi'
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular'
  },
  cardContainer: {
    margin: 10,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: '#FFF',
    padding: 10
  },
  makeAppointmentContainer: {
    backgroundColor: Colors.lightGray,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },
  headingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  }
});

export default DoctorCardItem;