import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';
import axios from '../AxiosConfig';
import API_URL from '../config';

const GrafoVisualizacion = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const fgRef = useRef(null);
    
    // Estado para controlar el modo de visualización (2D o 3D)
    const [is3D, setIs3D] = useState(false);
    
    // Función para transformar datos de la API al formato de React Force Graph
    const transformGraphData = (apiData) => {
        const transformedNodes = apiData.nodes.map(node => ({
            ...node,
            id: node.id,
            label: node.label,
            group: node.group,
            // Ajustar tamaño según el grupo
            val: node.group === 'sismo' ? 5 : 3
        }));
        
        const transformedLinks = apiData.edges.map(edge => ({
            ...edge,
            source: edge.from,
            target: edge.to,
            label: edge.label,
            id: `${edge.from}-${edge.to}-${edge.label}`
        }));
        
        return {
            nodes: transformedNodes,
            links: transformedLinks
        };
    };
    
    // Cargar datos del grafo
    useEffect(() => {
        const fetchGraphData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/grafos/visualizacion`, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });
                
                const { nodes, edges } = response.data;
                console.log('nodes:', nodes);
                console.log('edges:', edges);
                
                if (!Array.isArray(nodes) || !Array.isArray(edges)) {
                    setError('Los datos recibidos no tienen el formato correcto.');
                    setLoading(false);
                    return;
                }
                
                // Transformar datos al formato requerido por React Force Graph
                const transformedData = transformGraphData({ nodes, edges });
                setGraphData(transformedData);
                setLoading(false);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setError('Por favor inicia sesión para ver esta visualización.');
                } else {
                    setError('Error al cargar los datos del grafo. Por favor, intenta de nuevo más tarde.');
                    console.error('Error fetching graph data:', error);
                }
                setLoading(false);
            }
        };
        
        fetchGraphData();
    }, []);
    
    // Función para cargar datos existentes a Neo4j
    const cargarDatosExistentes = async () => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/api/grafos/cargar-existentes`, {}, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            // Recargar la visualización
            window.location.reload();
        } catch (error) {
            console.error('Error al cargar datos existentes a Neo4j:', error);
            setError('Error al cargar datos existentes a Neo4j.');
            setLoading(false);
        }
    };
    
    // Función para asignar colores según el grupo
    const getNodeColor = useCallback(node => {
        return node.group === 'sismo' ? '#97C2FC' : '#FB7E81';
    }, []);
    
    // Función para personalizar nodos en 2D
    const handleNodeCanvasObject = useCallback((node, ctx, globalScale) => {
        const label = node.label;
        const fontSize = 12/globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        
        // Dibujar forma del nodo según el grupo
        if (node.group === 'sismo') {
            // Círculo para sismos
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
            ctx.fillStyle = '#97C2FC';
            ctx.strokeStyle = '#2B7CE9';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
        } else {
            // Rombo para ubicaciones
            const size = node.val * 1.2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y - size);
            ctx.lineTo(node.x + size, node.y);
            ctx.lineTo(node.x, node.y + size);
            ctx.lineTo(node.x - size, node.y);
            ctx.closePath();
            ctx.fillStyle = '#FB7E81';
            ctx.strokeStyle = '#FA0010';
            ctx.lineWidth = 1.5;
            ctx.fill();
            ctx.stroke();
        }
        
        // Mostrar etiqueta solo cuando el zoom es suficiente
        if (globalScale > 0.6) {
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
            
            // Fondo para el texto para mejor legibilidad
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y + node.val + 2,
                bckgDimensions[0],
                bckgDimensions[1]
            );
            
            // Texto de la etiqueta
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(
                label, 
                node.x, 
                node.y + node.val + 2 + bckgDimensions[1]/2
            );
        }
    }, []);
    
    // Función para personalizar enlaces en 2D
    const handleLinkCanvasObject = useCallback((link, ctx, globalScale) => {
        // Solo mostrar etiquetas de enlaces cuando el zoom es suficiente
        if (globalScale > 0.8 && link.label) {
            const start = link.source;
            const end = link.target;
            
            // Calcular punto medio del enlace para colocar la etiqueta
            const textPos = {
                x: start.x + (end.x - start.x) / 2,
                y: start.y + (end.y - start.y) / 2
            };
            
            const label = link.label;
            const fontSize = 10/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            // Fondo para la etiqueta
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(
                textPos.x - bckgDimensions[0] / 2,
                textPos.y - bckgDimensions[1] / 2,
                bckgDimensions[0],
                bckgDimensions[1]
            );
            
            // Texto de la etiqueta
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#666666';
            ctx.fillText(label, textPos.x, textPos.y);
        }
    }, []);
    
    // Función para personalizar nodos en 3D
    const handleNode3DObject = useCallback(node => {
        // Elegir geometría según el grupo
        let geometry;
        let material;
        
        if (node.group === 'sismo') {
            // Esfera para sismos
            geometry = new THREE.SphereGeometry(node.val);
            material = new THREE.MeshLambertMaterial({
                color: '#97C2FC',
                transparent: true,
                opacity: 0.9
            });
        } else {
            // Octaedro (similar a un diamante) para ubicaciones
            geometry = new THREE.OctahedronGeometry(node.val * 1.2);
            material = new THREE.MeshLambertMaterial({
                color: '#FB7E81',
                transparent: true,
                opacity: 0.9
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Añadir etiqueta como sprite
        const sprite = new SpriteText(node.label);
        sprite.color = '#000000';
        sprite.textHeight = 2;
        sprite.position.y = node.val + 2;
        mesh.add(sprite);
        
        return mesh;
    }, []);
    
    // Función para manejar el clic en un nodo
    const handleNodeClick = useCallback(node => {
        console.log('Nodo seleccionado:', node);
        
        // Centrar la vista en el nodo seleccionado
        if (fgRef.current) {
            // La API es ligeramente diferente entre 2D y 3D
            if (is3D) {
                // En 3D podemos usar lookAt()
                const distance = 40;
                const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
                fgRef.current.cameraPosition(
                    { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                    node,
                    2000
                );
            } else {
                // En 2D usamos centerAt() y zoom()
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(2, 1000);
            }
        }
    }, [is3D]);
    
    // Función para cambiar entre 2D y 3D
    const toggleView = () => {
        setIs3D(prev => !prev);
    };
    
    return (
        <div>
            <h2>Visualización de Grafos de Sismos</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <button 
                    onClick={cargarDatosExistentes}
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Cargando...' : 'Cargar Datos Existentes a Neo4j'}
                </button>
                
                {/* Botón para cambiar entre 2D y 3D */}
                <button
                    onClick={toggleView}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span style={{ fontSize: '18px' }}>
                        {is3D ? '2D' : '3D'}
                    </span>
                    {is3D ? 'Cambiar a vista 2D' : 'Cambiar a vista 3D'}
                </button>
            </div>
            
            {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
            
            {loading && <div>Cargando visualización del grafo...</div>}
            
            <div style={{ 
                width: '100%', 
                height: '600px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f8f8f8' 
            }}>
                {graphData.nodes.length > 0 && !is3D && (
                    <ForceGraph2D
                        ref={fgRef}
                        graphData={graphData}
                        nodeId="id"
                        nodeVal="val"
                        nodeLabel="label"
                        nodeColor={getNodeColor}
                        nodeCanvasObject={handleNodeCanvasObject}
                        linkCanvasObject={handleLinkCanvasObject}
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.25}
                        linkLabel="label"
                        onNodeClick={handleNodeClick}
                        cooldownTicks={100}
                        onEngineStop={() => {
                            console.log("Engine stopped");
                        }}
                        enableNodeDrag={true}
                        enableZoomPanInteraction={true}
                        enableZoomInteraction={true}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.01}
                        linkDirectionalParticleWidth={1.5}
                        d3AlphaDecay={0.01}
                        d3VelocityDecay={0.4}
                    />
                )}
                
                {graphData.nodes.length > 0 && is3D && (
                    <ForceGraph3D
                        ref={fgRef}
                        graphData={graphData}
                        nodeId="id"
                        nodeVal="val"
                        nodeLabel="label"
                        nodeColor={getNodeColor}
                        nodeThreeObject={handleNode3DObject}
                        linkLabel="label"
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.25}
                        onNodeClick={handleNodeClick}
                        cooldownTicks={100}
                        onEngineStop={() => {
                            console.log("Engine stopped");
                        }}
                        enableNodeDrag={true}
                        enableNavigationControls={true}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleSpeed={0.01}
                        linkDirectionalParticleWidth={1.5}
                        backgroundColor="#f8f8f8"
                    />
                )}
            </div>
            
            <div style={{ marginTop: '20px' }}>
                <h3>Leyenda</h3>
                <ul>
                    <li>
                        <span style={{ 
                            color: '#2B7CE9', 
                            backgroundColor: '#97C2FC', 
                            display: 'inline-block', 
                            width: '16px', 
                            height: '16px', 
                            borderRadius: '50%', 
                            marginRight: '5px' 
                        }}></span> 
                        Sismos {is3D ? '(Esferas)' : '(Círculos)'}
                    </li>
                    <li>
                        <span style={{ 
                            color: '#FA0010', 
                            backgroundColor: '#FB7E81', 
                            display: 'inline-block', 
                            width: '16px', 
                            height: '16px', 
                            transform: 'rotate(45deg)', 
                            marginRight: '5px' 
                        }}></span> 
                        Ubicaciones {is3D ? '(Octaedros)' : '(Rombos)'}
                    </li>
                    <li><span style={{ color: '#2B7CE9' }}>→</span> CERCANO_A: Sismos cercanos geográficamente</li>
                    <li><span style={{ color: '#2B7CE9' }}>→</span> SIMILAR_MAGNITUD: Sismos con magnitud similar</li>
                    <li><span style={{ color: '#2B7CE9' }}>→</span> OCURRIDO_EN: Relación entre sismo y ubicación</li>
                </ul>
            </div>
            
            {is3D && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f4f4f4', 
                    borderRadius: '5px', 
                    border: '1px solid #ddd' 
                }}>
                    <h3 style={{ marginTop: 0 }}>Controles 3D</h3>
                    <ul>
                        <li><strong>Rotación:</strong> Clic izquierdo + arrastrar</li>
                        <li><strong>Zoom:</strong> Rueda del ratón o clic derecho + arrastrar</li>
                        <li><strong>Mover (Pan):</strong> Clic medio + arrastrar</li>
                        <li><strong>Centrar en nodo:</strong> Clic en nodo</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default GrafoVisualizacion;