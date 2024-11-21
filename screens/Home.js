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
    Platform,
    Modal,
    TouchableOpacity,
    ScrollView,
    Button
} from 'react-native';
import * as Network from 'expo-network';

export default function Home({ navigation }) {
    const [productos, setProductos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchCode, setSearchCode] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [inventoryData, setInventoryData] = useState(null);
    const [priceData, setPriceData] = useState(null);
    const [costData, setCostData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    

    const urls = [
        "http://192.168.18.1:8081/ctzrApi/api/productos",
        "http://780f07a3d368.sn.mynetname.net:8081/ctzrApi/api/productos"
    ];

    // En producción, usar solo la URL pública
    const productionUrls = __DEV__ ? urls : ["http://780f07a3d368.sn.mynetname.net:8081/ctzrApi/api/productos"];

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

    const fetchProductDetails = async (producto) => {
        setLoadingDetails(true);
        const baseUrl = __DEV__ ? "http://192.168.18.1:8081" : "http://780f07a3d368.sn.mynetname.net:8081";
        
        try {
            // Fetch inventario
            const invResponse = await fetch(`${baseUrl}/ctzrApi/api/inventario/${producto.codigo}`);
            const inventoryData = await invResponse.json();
            setInventoryData(inventoryData);

            // Fetch precio unitario
            const priceResponse = await fetch(
                `${baseUrl}/ctzrApi/api/lista-precios/precio-unitario?codigo=${producto.codigo}`
            );
            const priceData = await priceResponse.json();
            setPriceData(priceData);

            // Fetch costo producto
            const costResponse = await fetch(
                `${baseUrl}/ctzrApi/api/costo-producto/costo?codigo=${producto.codigo}`
            );
            const costData = await costResponse.json();
            setCostData(costData);

        } catch (error) {
           // Alert.alert("Error", "No se pudo obtener los detalles del producto");
            console.error(error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleProductPress = (producto) => {
        setSelectedProduct(producto);
        setModalVisible(true);
        fetchProductDetails(producto);
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

    const renderProducto = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemContainer}
            onPress={() => handleProductPress(item)}
        >
            <Text style={styles.codigo}>{item.codigo}</Text>
            <Text style={styles.nombre}>{item.nombre}</Text>
        </TouchableOpacity>
    );
    //Qr
    const ProductDetailsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.modalTitle}>
                            {selectedProduct?.nombre}
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            Código: {selectedProduct?.codigo}
                        </Text>

                        {loadingDetails ? (
                            <ActivityIndicator size="large" color="darkorange" />
                        ) : (
                            <>
                                {/* Inventario */}
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Inventario</Text>
                                    {inventoryData?.map((inv, index) => (
                                        <View key={index} style={styles.inventoryItem}>
                                            <Text style={styles.inventoryName}>{inv.nombre}</Text>
                                            <Text style={styles.inventoryTotal}>
                                                 {inv.total.toFixed(1)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                                
                                 {/* Precios */}
                                 <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Precios Unitarios</Text>
                                    {priceData?.map((price, index) => {
                                        const priceLabel = String.fromCharCode(65 + index); // 65 is ASCII for 'A'
                                        return (
                                            <Text key={index} style={styles.priceItem}>
                                                 {priceLabel}: ${price.toFixed(2)}
                                            </Text>
                                        );
                                    })}
                                </View>

                                {/* Costo */}
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Costo del Producto</Text>
                                    <Text style={styles.costItem}>
                                        ${Number(costData).toFixed(2)}
                                    </Text>
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
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

            <ProductDetailsModal />
            {/* Botón para abrir la cámara */}
            <Button
                title="Escanear QR"
                onPress={() => navigation.navigate("CameraScr")} // Navega a la pantalla "Camera"
                color="darkorange" // Color personalizado (opcional)
            />
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: 'darkorange',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    sectionContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    inventoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    inventoryName: {
        fontSize: 14,
        color: '#444',
    },
    inventoryTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    priceItem: {
        fontSize: 14,
        color: '#444',
        paddingVertical: 3,
    },
    costItem: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'darkorange',
    },
    closeButton: {
        backgroundColor: 'darkorange',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});