import React, { useState } from "react";
import { Text, StyleSheet, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';

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
        
        const urls = [
            "http://192.168.18.1:8081/ApiMov/api/auth/login",
            "http://186.4.230.233:8081/ApiMov/api/auth/login"
        ];
    
        let loginSuccess = false;
    
        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({ 
                        username: username.trim(), 
                        password: password.trim() 
                    })
                });
    
                const result = await response.json();
    
                if (response.ok && result.success) {
                    Alert.alert("Éxito", "Inicio de sesión exitoso");
                    props.navigation.navigate('Home'); // Navega a la pantalla Home
                    loginSuccess = true;
                    break; // Detiene el bucle si el login fue exitoso
                } else {
                    // Si las credenciales son incorrectas, muestra el mensaje de error
                    Alert.alert("Error", result.message || "Credenciales inválidas");
                    break; // Sale del bucle si la respuesta es válida pero con credenciales incorrectas
                }
            } catch (error) {
                console.error(`Error con URL ${url}:`, error);
                break;
                // Continúa al siguiente URL en caso de error de red
            }
        }
    
        if (!loginSuccess) {
            Alert.alert(
                "Error", 
                "No se pudo conectar con el servidor en ninguna de las direcciones. Verifica tu conexión."                
            );
        }
    
        setIsLoading(false);
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
