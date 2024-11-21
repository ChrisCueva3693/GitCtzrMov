import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert ,Modal,FlatList,TouchableOpacity} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from 'react-native';


export default function CameraScr(){
    const[permission,requestPermission] = useCameraPermissions();
    const[scanningEnable,setScanningEnable]= useState(true);
    //Probando Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [inventoryData, setInventoryData] = useState([]);
    const [lastScannedResult, setLastScannedResult] = useState(null);

    //Nuevo Urls Produccion
    const urls = [
        "http://192.168.18.1:8081/ctzrApi/api/inventario"
    ];

    // En producción, usar solo la URL pública
    const productionUrls = __DEV__ ? urls : ["http://780f07a3d368.sn.mynetname.net:8081/ctzrApi/api/inventario"];


    if(!permission){
        return(
            <View style={{flex:1, justifyContent:"center", alignItems:"center"}}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }

    if(!permission.granted){
        return(
            <View style={{gap:20, justifyContent:"center" ,alignItems:"center"}} >
               <Text >Se Requiere Permisos para acceder a la camara.</Text>
                <Button onPress={requestPermission} title='Activar Permiso'>Activar Permiso</Button>
            </View>
        );
    }   
    
    async function onBarcodeScanned(scanningResult) {
        if (!scanningEnable) return;
        
        try {
            const { data } = scanningResult;
            setLastScannedResult(scanningResult);
            console.log(data);            
            //const response = await fetch(`http://192.168.18.1:8081/ctzrApi/api/inventario/${data}`);
            const baseUrl = __DEV__ ? urls[0] : productionUrls[0];
            const response = await fetch(`${baseUrl}/${data}`);
            
            if (!response.ok) {
                throw new Error('Error en la consulta a la API');
            }

            const jsonData = await response.json();
            setInventoryData(jsonData);
            setModalVisible(true);
            setScanningEnable(false);
            
            } catch (error) {
                Alert.alert("Error", "Falló el lector del código QR, intenta nuevamente.");
                setScanningEnable(true);
            }
    }
    const renderInventoryItem = ({ item }) => (
        <View style={styles.inventoryItem}>
            <Text style={styles.itemCode}>{item.codigo}</Text>
            <Text style={styles.itemName}>{item.nombre}</Text>
            <Text style={styles.itemTotal}> {item.total}</Text>
        </View>
    );

    const closeModal = () => {
        setModalVisible(false);
        setScanningEnable(true);
    };


    return(
        <View style={{ flex: 1 }}>
            <CameraView
                style={{ flex: 1 }}
                facing="back"
                onBarcodeScanned={onBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Inventario</Text>   
                        <Text style={styles.scannedCode}>Código Escaneado: {lastScannedResult?.data}</Text>                     
                        <FlatList
                            data={inventoryData}
                            renderItem={renderInventoryItem}
                            keyExtractor={(item) => item.codigo}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    inventoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemCode: {
        fontWeight: 'bold',
    },
    itemName: {
        flex: 1,
        marginLeft: 10,
    },
    itemTotal: {
        fontWeight: 'bold',
    },
    closeButton: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#2196F3',
        borderRadius: 5,
    },
    closeButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    scannedCode: {
        textAlign: 'center',
        marginBottom: 10,
        fontStyle: 'italic',
        color: '#666'
    },
});

