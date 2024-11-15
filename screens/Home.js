import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, FlatList, ActivityIndicator, TextInput } from 'react-native';

export default function Home() {
    const [productos, setProductos] = useState([]); // Estado para almacenar los productos
    const [isLoading, setIsLoading] = useState(true); // Estado para indicar carga
    const [searchCode, setSearchCode] = useState(''); // Estado para almacenar el código de búsqueda

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                // Primer intento con la primera URL
                let response = await fetch("http://192.168.18.1:8081/ctzrApi/api/productos");
                
                // Si la primera URL falla, intenta con la segunda URL
                if (!response.ok) {
                    console.log("Primera URL fallida, intentando con la segunda...");
                    response = await fetch("http://186.4.230.233:8081/ctzrApi/api/productos");
                }

                // Si la respuesta es válida, se procesa la data
                if (response.ok) {
                    const data = await response.json();
                    setProductos(data); // Guarda los productos en el estado
                } else {
                    throw new Error("No se pudo obtener productos de ninguna de las URLs");
                }
            } catch (error) {
                console.error("Error al obtener productos:", error);
            } finally {
                setIsLoading(false); // Desactiva el indicador de carga
            }
        };

        fetchProductos();
    }, []); // Solo se ejecuta una vez al montar el componente

    // Renderiza cada producto en la lista
    const renderProducto = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.codigo}>{item.codigo}</Text>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.costo}>Costo: ${item.costoEstandar}</Text>
        </View>
    );

    // Filtra los productos según el código ingresado
    const productosFiltrados = productos.filter((producto) =>
        producto.codigo.toLowerCase().includes(searchCode.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cotizer Móvil</Text>

            {/* Campo de entrada para buscar por código */}
            <TextInput
                style={styles.input}
                placeholder="Buscar por código"
                value={searchCode}
                onChangeText={(text) => setSearchCode(text)}
            />

            {isLoading ? (
                <ActivityIndicator size="large" color="darkorange" /> // Indicador de carga
            ) : (
                <FlatList
                    data={productosFiltrados} // Usamos los productos filtrados aquí
                    keyExtractor={(item) => item.id.toString()} // Clave única para cada producto
                    renderItem={renderProducto} // Renderiza cada elemento
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'lavenderblush',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    codigo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'darkorange',
    },
    nombre: {
        fontSize: 16,
        color: '#333',
        marginVertical: 5,
    },
    costo: {
        fontSize: 14,
        color: '#777',
    },
});
