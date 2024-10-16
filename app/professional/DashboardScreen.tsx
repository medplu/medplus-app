import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';

const DashboardScreen: React.FC = () => {
  const [isPaymentSetupCompleted, setIsPaymentSetupCompleted] = useState<boolean>(false);
  const [showPaymentSetupModal, setShowPaymentSetupModal] = useState<boolean>(false);
  const [showSubaccountModal, setShowSubaccountModal] = useState<boolean>(false);
  const [subaccountData, setSubaccountData] = useState({
    business_name: '',
    settlement_bank: '',
    account_number: '',
    percentage_charge: '',
  });

  useEffect(() => {
    const checkPaymentSetupStatus = async () => {
      const status = await AsyncStorage.getItem('isPaymentSetupCompleted');
      if (!status) {
        setShowPaymentSetupModal(true); // Show prompt if not completed
      } else {
        setIsPaymentSetupCompleted(true);
      }
    };

    checkPaymentSetupStatus();
  }, []);

  const handlePaymentSetupComplete = async () => {
    await AsyncStorage.setItem('isPaymentSetupCompleted', 'true');
    setIsPaymentSetupCompleted(true);
    setShowPaymentSetupModal(false);
    Alert.alert('Payment Setup', 'Your payment setup is complete.');
  };

  const handleCreateSubaccount = async () => {
    try {
      const response = await axios.post('https://medplus-app.onrender.com/api/create-subaccount', subaccountData);
      Alert.alert('Subaccount Creation', 'Subaccount created successfully.');
      setShowSubaccountModal(false);
    } catch (error) {
      Alert.alert('Subaccount Creation Failed', 'There was an error creating the subaccount.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Doctor's Dashboard</Text>

        {/* Payment Setup Prompt Modal */}
        <Modal
          visible={showPaymentSetupModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPaymentSetupModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Complete Your Payment Setup</Text>
              <Text style={styles.modalDescription}>
                To proceed with creating a subaccount, please complete the payment setup. This is a one-time process.
              </Text>
              <Button title="Complete Payment Setup" onPress={handlePaymentSetupComplete} />
            </View>
          </View>
        </Modal>

        {/* Subaccount Creation Modal */}
        <Modal
          visible={showSubaccountModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSubaccountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Create Subaccount</Text>
              <TextInput
                style={styles.input}
                placeholder="Business Name"
                value={subaccountData.business_name}
                onChangeText={(text) => setSubaccountData({ ...subaccountData, business_name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Settlement Bank"
                value={subaccountData.settlement_bank}
                onChangeText={(text) => setSubaccountData({ ...subaccountData, settlement_bank: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                value={subaccountData.account_number}
                onChangeText={(text) => setSubaccountData({ ...subaccountData, account_number: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Percentage Charge"
                value={subaccountData.percentage_charge}
                onChangeText={(text) => setSubaccountData({ ...subaccountData, percentage_charge: text })}
              />
              <Button title="Create Subaccount" onPress={handleCreateSubaccount} />
            </View>
          </View>
        </Modal>

        {/* Rest of the dashboard content */}
        {isPaymentSetupCompleted ? (
          <Text style={styles.infoText}>
            Your payment setup is complete. You can now proceed with creating subaccounts and managing appointments.
          </Text>
        ) : (
          <Text style={styles.infoText}>
            Please complete your payment setup to access all features.
          </Text>
        )}

        {/* Example Button to create a subaccount (will be enabled after payment setup) */}
        <TouchableOpacity
          style={[styles.card, !isPaymentSetupCompleted && styles.disabledCard]}
          onPress={() => {
            if (isPaymentSetupCompleted) {
              setShowSubaccountModal(true);
            } else {
              Alert.alert('Payment Setup Required', 'Please complete your payment setup first.');
            }
          }}
          disabled={!isPaymentSetupCompleted}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="account-circle" size={40} color="#6200ee" />
          </View>
          <Text style={styles.details}>Create Subaccount</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  disabledCard: {
    backgroundColor: '#f0f0f0',
  },
  iconContainer: {
    marginBottom: 10,
  },
  details: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default DashboardScreen;