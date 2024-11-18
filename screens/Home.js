import React, { useState, useEffect } from "react";
import { 
    Text, 
    StyleSheet, 
    View, 
    FlatList, 
    ActivityIndicator, 
    TextInput,
    RefreshControl,
    Alert,
    Platform 
} from 'react-native';
import * as Network from 'expo-network';

export default function Home() {
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchCode, setSearchCode] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const urls = [
        "http://192.168.18.1:8081/ctzrApi/api/productos",
        "http://186.4.230.233:8081/ctzrApi/api/productos"
    ];

    // En producción, usar solo la URL pública
    const productionUrls = __DEV__ ? urls : ["http://186.4.230.233:8081/ctzrApi/api/productos"];

    const fetchProductos = async (showLoadingIndicator = true) => {
        if (showLoadingIndicator) setIsLoading(true);
        setError(null);

        // Verificar conectividad primero
        try {
            const networkState = await Network.getNetworkStateAsync();
            if (!networkState.isConnected || !networkState.isInternetReachable) {
                throw new Error("No hay conexión a internet");
            }
        } catch (error) {
            console.log("Error checking network:", error);
        }

        let lastError = null;
        let fetchSuccess = false;

        for (const url of productionUrls) {
            try {
                console.log(`[${__DEV__ ? 'DEV' : 'PROD'}] Intentando obtener productos de: ${url}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                console.log(`Respuesta del servidor (${url}):`, {
                    status: response.status,
                    statusText: response.statusText
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setProductos(data);
                    fetchSuccess = true;
                    break;
                } else {
                    throw new Error("La respuesta no tiene el formato esperado");
                }
            } catch (error) {
                console.error(`Error con URL ${url}:`, {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });

                lastError = error.message;

                if (error.name === 'AbortError') {
                    lastError = "La conexión tardó demasiado tiempo";
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

        if (!fetchSuccess) {
            setError(lastError || "No se pudieron cargar los productos");
            if (productos.length === 0) {
                Alert.alert(
                    "Error", 
                    "No se pudieron cargar los productos. Por favor, verifica tu conexión."
                );
            }
        }

        setIsLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchProductos(false);
    }, []);

    const productosFiltrados = React.useMemo(() => {
        return productos.filter((producto) =>
            producto.codigo.toLowerCase().includes(searchCode.toLowerCase()) ||
            producto.nombre.toLowerCase().includes(searchCode.toLowerCase())
        );
    }, [productos, searchCode]);

    const renderProducto = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.codigo}>{item.codigo}</Text>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.costo}>Costo: ${item.costoEstandar?.toFixed(2) || '0.00'}</Text>
        </View>
    );

    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {error ? 
                    "No se pudieron cargar los productos" : 
                    searchCode ? 
                        "No se encontraron productos" : 
                        "No hay productos disponibles"}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cotizer Móvil</Text>

            <TextInput
                style={styles.input}
                placeholder="Buscar por código o nombre"
                value={searchCode}
                onChangeText={setSearchCode}
            />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="darkorange" />
                    <Text style={styles.loadingText}>Cargando productos...</Text>
                </View>
            ) : (
                <FlatList
                    data={productosFiltrados}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderProducto}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["darkorange"]}
                        />
                    }
                    ListEmptyComponent={EmptyListComponent}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
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
        marginTop: Platform.OS === 'ios' ? 50 : 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    itemContainer: {
        backgroundColor: 'white',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: 'darkorange',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});