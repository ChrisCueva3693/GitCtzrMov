import React, { useState } from "react";
import { Text, StyleSheet, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Platform } from 'react-native';
import * as Network from 'expo-network';

export default function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const validateInputs = () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert("Error", "Por favor completa todos los campos");
            return false;
        }
        return true;
    };
    // Función para manejar el inicio de sesión
    const handleLogin = async () => {
        if (!validateInputs()) return;
    
        setIsLoading(true);
    
        // Primero verificamos la conectividad
        try {
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected || !networkState.isInternetReachable) {
                Alert.alert(
                    "Error de Conexión",
                    "Por favor verifica tu conexión a internet"
                );
                setIsLoading(false);
                return;
            }
        } catch (error) {
            console.log("Error checking network:", error);
        }
    
        const urls = [
            "http://192.168.18.1:8081/ApiMov/api/auth/login",
            "http://186.4.230.233:8081/ApiMov/api/auth/login"
        ];
    
        // En producción, usar solo la URL pública
        const productionUrls = __DEV__ ? urls : ["http://186.4.230.233:8081/ApiMov/api/auth/login"];
    
        let loginSuccess = false;
        let lastError = null;
    
        for (const url of productionUrls) {
            try {
                console.log(`[${__DEV__ ? 'DEV' : 'PROD'}] Intentando conexión a: ${url}`);
    
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
    
                const response = await fetch(url, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ 
                        username: username.trim(), 
                        password: password.trim(),
                        platform: Platform.OS, // Útil para debugging
                        version: Platform.Version,
                        isDev: __DEV__
                    }),
                    signal: controller.signal
                });
    
                clearTimeout(timeoutId);
    
                console.log(`Respuesta del servidor (${url}):`, {
                    status: response.status,
                    statusText: response.statusText
                });
    
                const result = await response.json();
    
                if (response.ok && result.success) {
                    loginSuccess = true;
                    Alert.alert("Éxito", "Inicio de sesión exitoso");
                    props.navigation.navigate('Home');
                    break;
                } else {
                    lastError = result.message || "Credenciales inválidas";
                    console.log("Error de autenticación:", lastError);
                    break;
                }
            } catch (error) {
                console.error(`Error con URL ${url}:`, {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
    
                lastError = error.message;
                
                if (error.name === 'AbortError') {
                    lastError = "La conexión tardó demasiado tiempo. Por favor, intenta de nuevo.";
                    continue;
                }
                
                if (error.message.includes('Network') || 
                    error.message.includes('timeout') || 
                    error.message.includes('connection')) {
                    continue;
                }
                break;
            }
        }
    
        setIsLoading(false);
    
        if (!loginSuccess) {
            Alert.alert(
                "Error", 
                lastError || "No se pudo conectar con el servidor. Verifica tu conexión."
            );
        }
    };
    

    return (
        <View style={style.container}>
            <View>
                <Image
                    source={{ uri: 'https://static.vecteezy.com/system/resources/previews/030/751/118/non_2x/cute-little-robot-ai-generative-png.png' }}
                    style={style.image}
                />
            </View>
            <View style={style.tarjeta}>
                <View style={style.cajaTexto}>
                    <TextInput
                        style={style.input}
                        placeholder="Ingresa tu Usuario"
                        value={username}
                        onChangeText={setUsername} // Actualiza el estado del usuario
                    />
                </View>
                <View style={style.cajaTexto}>
                    <TextInput
                        style={style.input}
                        placeholder="Contraseña"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword} // Actualiza el estado de la contraseña
                    />
                </View>
                <View style={style.PadreBoton}>
                    <TouchableOpacity style={style.cajaBoton} onPress={handleLogin}>
                        <Text style={style.TextoBoton}>Ingresar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "lavenderblush" },
    image: { height: 200, width: 200 },
    tarjeta: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: { paddingHorizontal: 15 },
    cajaTexto: {
        paddingVertical: 20,
        backgroundColor: '#cccccc40',
        borderRadius: 30,
        marginVertical: 10,
    },
    PadreBoton: { alignItems: 'center' },
    cajaBoton: {
        backgroundColor: 'darkorange',
        borderRadius: 30,
        paddingVertical: 20,
        width: 150,
        marginTop: 20
    },
    TextoBoton: { textAlign: 'center', color: 'white' },
});
