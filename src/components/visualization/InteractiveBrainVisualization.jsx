import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { enumerateRegionNodes, brainSystemsPalette } from '../../utils/brainRegionAtlas';
import createAnatomicalBrain, { createLimbicStructures } from '../../utils/anatomicalBrainGeometry';

const severityScale = (magnitude) => 0.18 + magnitude / 160;

const magnitudeLabel = (impact) => {
  const abs = Math.abs(impact);
  if (abs > 45) return 'Severe';
  if (abs > 25) return 'Moderate';
  if (abs > 10) return 'Notable';
  return 'Subtle';
};
const InteractiveBrainVisualization = ({ assessmentResults }) => {
  const mountRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showStructural, setShowStructural] = useState(true);
  const [showFunctional, setShowFunctional] = useState(true);
  const [systemFilter, setSystemFilter] = useState('all');
  const [minimumMagnitude, setMinimumMagnitude] = useState(5);

  const regionNodes = useMemo(
    () => enumerateRegionNodes(assessmentResults?.brainImpacts || {}),
    [assessmentResults?.brainImpacts]
  );

  const systems = useMemo(() => {
    const unique = new Set();
    regionNodes.forEach(node => unique.add(node.system));
    return Array.from(unique);
  }, [regionNodes]);

  const summaryTotals = useMemo(() => {
    return regionNodes.reduce(
      (totals, node) => {
        if (node.polarity === 'hyperactivation') {
          totals.functional += 1;
        } else {
          totals.structural += 1;
        }
        return totals;
      },
      { structural: 0, functional: 0 }
    );
  }, [regionNodes]);
  const filteredNodes = useMemo(() => {
    return regionNodes.filter(node => {
      if (!showStructural && node.polarity === 'hypoactivity') {
        return false;
      }
      if (!showFunctional && node.polarity === 'hyperactivation') {
        return false;
      }
      if (systemFilter !== 'all' && node.system !== systemFilter) {
        return false;
      }
      if (node.magnitude < minimumMagnitude) {
        return false;
      }
      return true;
    });
  }, [regionNodes, showStructural, showFunctional, systemFilter, minimumMagnitude]);

  const topDrivers = useMemo(() => {
    if (!hoveredNode || !hoveredNode.hotspots) return [];
    return [...hoveredNode.hotspots]
      .sort((a, b) => Math.abs((b.impact ?? b.adjustedImpact ?? 0)) - Math.abs((a.impact ?? a.adjustedImpact ?? 0)))
      .slice(0, 3);
  }, [hoveredNode]);
  useEffect(() => {
    if (!mountRef.current) {
      return () => undefined;
    }

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#04010f');

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(width, height);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.45;
    controls.zoomSpeed = 0.6;
    controls.minDistance = 2.6;
    controls.maxDistance = 8;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    const rimLight = new THREE.PointLight(0xa78bfa, 1.2, 50);
    rimLight.position.set(-7, 5, 8);
    const fillLight = new THREE.PointLight(0x60a5fa, 1.0, 50);
    fillLight.position.set(7, -3, -7);
    const dorsalLight = new THREE.PointLight(0xf472b6, 0.8, 40);
    dorsalLight.position.set(0, 9, 5);
    const anteriorLight = new THREE.PointLight(0x34d399, 0.7, 35);
    anteriorLight.position.set(0, 0, 10);
    scene.add(ambientLight, rimLight, fillLight, dorsalLight, anteriorLight);

    // Create anatomically accurate brain model
    const anatomicalBrain = createAnatomicalBrain();
    scene.add(anatomicalBrain);

    // Add limbic structures (amygdala, hippocampus)
    const limbicStructures = createLimbicStructures();
    scene.add(limbicStructures);

    // Store reference for rotation animation
    const brainMesh = anatomicalBrain;
    const regionGroup = new THREE.Group();
    const connectorGroup = new THREE.Group();
    const regionMeshes = [];

    // Create neural pathway disruptions between regions
    const pathwayGroup = new THREE.Group();

    filteredNodes.forEach((node, index) => {
      const radius = severityScale(node.magnitude);
      const sphereGeometry = new THREE.SphereGeometry(radius, 48, 48);
      const baseColor = new THREE.Color(node.paletteColor || brainSystemsPalette.default);
      const material = new THREE.MeshStandardMaterial({
        color: node.polarity === 'hyperactivation' ? baseColor : new THREE.Color('#60a5fa'),
        emissive: node.polarity === 'hyperactivation' ? baseColor.clone().multiplyScalar(0.8) : new THREE.Color('#1e3a8a'),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.95,
        roughness: 0.25,
        metalness: 0.2
      });
      const sphere = new THREE.Mesh(sphereGeometry, material);
      sphere.position.set(node.position[0], node.position[1], node.position[2]);
      sphere.userData = node;
      regionGroup.add(sphere);
      regionMeshes.push(sphere);

      // Enhanced halo for affected regions
      const haloGeometry = new THREE.SphereGeometry(radius * 1.55, 32, 32);
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: node.polarity === 'hyperactivation' ? baseColor : new THREE.Color('#38bdf8'),
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide
      });
      const halo = new THREE.Mesh(haloGeometry, haloMaterial);
      halo.position.copy(sphere.position);
      regionGroup.add(halo);

      // Neural pathway connections between related regions
      filteredNodes.forEach((targetNode, targetIndex) => {
        if (targetIndex <= index) return; // Avoid duplicate connections

        // Connect if regions share system or are functionally related
        const shouldConnect =
          node.system === targetNode.system ||
          (node.name.includes('Prefrontal') && targetNode.name.includes('Amygdala')) ||
          (node.name.includes('Hippocampus') && targetNode.name.includes('Prefrontal')) ||
          (node.name.includes('Amygdala') && targetNode.name.includes('Hippocampus'));

        if (shouldConnect) {
          // Create curved neural pathway
          const start = new THREE.Vector3(...node.position);
          const end = new THREE.Vector3(...targetNode.position);
          const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
          midpoint.add(new THREE.Vector3(0, 0.3, 0)); // Arc upward

          const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
          const pathPoints = curve.getPoints(50);
          const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

          // Disrupted pathway indication
          const pathwayIntensity = (node.magnitude + targetNode.magnitude) / 200;
          const pathwayMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(0.05, 0.8, 0.5 - pathwayIntensity * 0.3),
            transparent: true,
            opacity: 0.3 + pathwayIntensity * 0.4,
            linewidth: 2
          });
          const pathway = new THREE.Line(pathGeometry, pathwayMaterial);
          pathwayGroup.add(pathway);
        }
      });
    });

    scene.add(pathwayGroup);

    scene.add(regionGroup);
    scene.add(connectorGroup);
    let resilienceAura = null;
    if ((assessmentResults?.protectiveFactors?.length || 0) > 0) {
      const auraGeometry = new THREE.TorusGeometry(2.35, 0.08, 24, 96);
      const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0x22c55e,
        transparent: true,
        opacity: 0.25
      });
      resilienceAura = new THREE.Mesh(auraGeometry, auraMaterial);
      resilienceAura.rotation.x = Math.PI / 2;
      scene.add(resilienceAura);
    }

    const pointer = new THREE.Vector2(999, 999);
    const raycaster = new THREE.Raycaster();
    const clock = new THREE.Clock();
    let hoverCache = null;
    let animationId = null;

    const handlePointerMove = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };

    const handlePointerLeave = () => {
      pointer.x = 999;
      pointer.y = 999;
      hoverCache = null;
      setHoveredNode(null);
    };

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / (clientHeight || 560);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight || 560);
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('resize', handleResize);
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow anatomical brain rotation
      brainMesh.rotation.y += 0.002;
      limbicStructures.rotation.y += 0.002;

      // Pulsating neural pathway activity
      pathwayGroup.children.forEach((pathway, index) => {
        const pulse = (Math.sin(elapsed * 1.5 + index * 0.3) + 1) / 2;
        pathway.material.opacity = pathway.material.userData?.baseOpacity || 0.4 * (0.5 + pulse * 0.5);
      });

      // Affected region pulsation based on severity
      regionMeshes.forEach((mesh, index) => {
        const pulse = (Math.sin(elapsed * 2.1 + index) + 1) / 2;
        const scale = 1 + pulse * 0.12 * (mesh.userData.magnitude / 40);
        mesh.scale.set(scale, scale, scale);
        mesh.material.emissiveIntensity = 0.4 + pulse * 0.6;
      });

      if (resilienceAura) {
        resilienceAura.rotation.z += 0.0015;
      }

      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(regionMeshes, false);
      if (intersections.length > 0) {
        const hovered = intersections[0].object.userData;
        if (!hoverCache || hoverCache.name !== hovered.name) {
          hoverCache = hovered;
          setHoveredNode(hovered);
        }
      } else if (hoverCache) {
        hoverCache = null;
        setHoveredNode(null);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
      controls.dispose();

      // Dispose region markers
      regionGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else if (child.material) {
          child.material.dispose();
        }
      });

      // Dispose pathway connections
      pathwayGroup.children.forEach(pathway => {
        if (pathway.geometry) pathway.geometry.dispose();
        if (pathway.material) pathway.material.dispose();
      });

      connectorGroup.children.forEach(line => {
        if (line.geometry) line.geometry.dispose();
        if (line.material) line.material.dispose();
      });

      // Dispose anatomical brain
      brainMesh.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });

      // Dispose limbic structures
      limbicStructures.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        }
      });
      if (resilienceAura) {
        resilienceAura.geometry.dispose();
        resilienceAura.material.dispose();
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [filteredNodes, assessmentResults?.protectiveFactors?.length]);
  return (
    <div className="relative">
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              className="accent-blue-400"
              checked={showStructural}
              onChange={(event) => setShowStructural(event.target.checked)}
            />
            Volume reductions ({summaryTotals.structural})
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              className="accent-orange-400"
              checked={showFunctional}
              onChange={(event) => setShowFunctional(event.target.checked)}
            />
            Hyperactivations ({summaryTotals.functional})
          </label>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Minimum intensity</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={60}
                value={minimumMagnitude}
                onChange={(event) => setMinimumMagnitude(Number(event.target.value))}
                className="accent-purple-400 w-40"
              />
              <span className="text-sm text-gray-200">{minimumMagnitude}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Focus system</p>
          <select
            value={systemFilter}
            onChange={(event) => setSystemFilter(event.target.value)}
            className="bg-black/50 border border-white/10 text-gray-100 text-sm px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All neural systems</option>
            {systems.map(system => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        ref={mountRef}
        className="relative w-full h-[600px] rounded-3xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-slate-950 via-indigo-950/70 to-slate-950"
      />

      {hoveredNode && (
        <div className="pointer-events-none absolute top-8 left-8 max-w-md bg-black/80 border border-white/10 rounded-3xl p-6 backdrop-blur text-gray-100 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-300 mb-1">{hoveredNode.system}</p>
              <h3 className="text-xl font-light text-white">{hoveredNode.name}</h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs uppercase tracking-widest ${
                hoveredNode.polarity === 'hyperactivation'
                  ? 'bg-orange-500/20 text-orange-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {hoveredNode.polarity === 'hyperactivation' ? 'Hyperactivation' : 'Volume reduction'}
            </span>
          </div>
          <p className="text-4xl font-light text-white">
            {hoveredNode.impact >= 0 ? '+' : ''}{hoveredNode.impact.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-300 mb-4">Severity: {magnitudeLabel(hoveredNode.impact)}</p>
          {topDrivers.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 mb-2">Key drivers</p>
              <ul className="space-y-2 text-sm">
                {topDrivers.map((driver, index) => (
                  <li key={`${driver.questionId}-${index}`} className="flex justify-between gap-4">
                    <span className="flex-1 text-gray-200">{driver.summary || driver.title}</span>
                    <span className="text-gray-400">
                      {driver.impact >= 0 ? '+' : ''}{driver.impact.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-300">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-blue-400" />
          <span>Blue nodes = structural volume reductions</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full bg-orange-400" />
          <span>Orange nodes = limbic or stress hyperactivations</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex h-3 w-3 rounded-full border border-emerald-300" />
          <span>Green halo present when protective factors cushion severity</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBrainVisualization;
