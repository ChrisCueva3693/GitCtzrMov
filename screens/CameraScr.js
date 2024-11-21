import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button } from 'react-native';





export default function CameraScr(){
    const[permission,requestPermission] = useCameraPermissions();
    const[scanningEnable,setScanningEnable]= useState(true);


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
    
    function onBarcodeScanned(scanningResult) {
        if (!scanningEnable) return;
        
        try {
            const { data } = scanningResult;
            console.log(data);
            // Aquí puedes agregar la lógica para manejar el código QR escaneado
            Alert.alert("Código Escaneado", data);
            setScanningEnable(false);
        } catch (error) {
            Alert.alert("Error", "Falló el lector del código QR, intenta nuevamente.");
            setScanningEnable(true);
        }
    }


    return(
        <CameraView
        style={{flex:1}}
        facing="back"
        onBarcodeScanned={onBarcodeScanned}
        barcodeScannerSettings={{barcodeTypes:["qr"]}}
        />
    );
}


