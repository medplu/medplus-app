<!--public -->
[17:01, 02/10/2024] Medplus Health Network: pk_test_81ffccf3c88b1a2586f456c73718cfd715ff02b0




<!-- test secret -->
[17:02, 02/10/2024] Medplus Health Network: sk_test_bd491bc07f705e9724f50d3d7b059de890e06716

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, Alert, ScrollView, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const TransactionScreen: React.FC = () => {
  const [isPaymentSetupCompleted, setIsPaymentSetupCompleted] = useState<boolean>(false);
  const [showPaymentSetupModal, setShowPaymentSetupModal] = useState<boolean>(false);
  const [showSubaccountModal, setShowSubaccountModal] = useState<boolean>(false);
  const [subaccountData, setSubaccountData] = useState({
    business_name: '',
    settlement_bank: '',
    account_number: '',
    percentage_charge: '',
  });
  const [banks, setBanks] = useState<{ name: string, code: string }[]>([]);

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
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const response = await axios.get('https://api.paystack.co/bank?country=kenya', {
        headers: {
          Authorization: 'Bearer YOUR_SECRET_KEY',
        },
      });
      const fetchedBanks = response.data.data;
  
      setBanks(fetchedBanks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      Alert.alert('Error', 'Failed to fetch banks.');
    }
  };
  
  const handlePaymentSetupComplete = async () => {
    await AsyncStorage.setItem('isPaymentSetupCompleted', 'true');
    setIsPaymentSetupCompleted(true);
    setShowPaymentSetupModal(false);
    Alert.alert('Payment Setup', 'Your payment setup is complete.');
  };

  const handleCreateSubaccount = async () => {
    try {
        // Retrieve userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId'); // Ensure 'userId' is stored in AsyncStorage
        
        if (!userId) {
            Alert.alert('Error', 'User ID not found. Please log in again.');
            return;
        }

        // Create the payload with userId
        const subaccountPayload = {
            ...subaccountData,
            userId, // Include userId in the payload
        };

        const response = await axios.post('https://medplus-app.onrender.com/api/payment/create-subaccount', subaccountPayload);
        Alert.alert('Subaccount Creation', 'Subaccount created successfully.');
        setShowSubaccountModal(false);
    } catch (error) {
        console.error('Error creating subaccount:', error.response ? error.response.data : error.message);
        Alert.alert('Subaccount Creation Failed', 'There was an error creating the subaccount.');
    }
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Transaction Screen</Text>

        {/* Payment Setup Prompt Modal */}
        <Modal
          visible={showPaymentSetupModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPaymentSetupModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowPaymentSetupModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <MaterialIcons name="payment" size={40} color="#6200ee" />
                  <Text style={styles.modalTitle}>Set Payment</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Business Name"
                    value={subaccountData.business_name}
                    onChangeText={(text) => setSubaccountData({ ...subaccountData, business_name: text })}
                  />
                  <Picker
                    selectedValue={subaccountData.settlement_bank}
                    style={styles.input}
                    onValueChange={(itemValue) => setSubaccountData({ ...subaccountData, settlement_bank: itemValue })}
                  >
                    {banks.map((bank, index) => (
                      <Picker.Item key={`${bank.code}-${index}`} label={bank.name} value={bank.code} />
                    ))}
                  </Picker>
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Subaccount Creation Modal */}
        <Modal
          visible={showSubaccountModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSubaccountModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSubaccountModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  <MaterialIcons name="payment" size={40} color="#6200ee" />
                  <Text style={styles.modalTitle}>Set Payment</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Business Name"
                    value={subaccountData.business_name}
                    onChangeText={(text) => setSubaccountData({ ...subaccountData, business_name: text })}
                  />
                  <Picker
                    selectedValue={subaccountData.settlement_bank}
                    style={styles.input}
                    onValueChange={(itemValue) => setSubaccountData({ ...subaccountData, settlement_bank: itemValue })}
                  >
                    {banks.map((bank, index) => (
                      <Picker.Item key={`${bank.code}-${index}`} label={bank.name} value={bank.code} />
                    ))}
                  </Picker>
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
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Payment Setup Icon */}
        {!isPaymentSetupCompleted && (
          <TouchableOpacity onPress={() => setShowPaymentSetupModal(true)} style={styles.iconButton}>
            <MaterialIcons name="payment" size={40} color="#6200ee" />
            <Text style={styles.iconText}>Set Payment</Text>
          </TouchableOpacity>
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
            <Text style={styles.details}>Create Subaccount</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentButton: {
    backgroundColor: '#6200ee',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 16,
    color: '#6200ee',
    marginTop: 5,
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

export default TransactionScreen;