import * as THREE from 'three';
import { gsap } from 'gsap';

// Particle system configurations for different celebration types
const PARTICLE_CONFIGS = {
  milestone: {
    count: 200,
    size: 0.1,
    spread: 5,
    velocity: { min: 0.1, max: 0.5 },
    colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'],
    lifetime: 3,
    gravity: -0.01
  },
  daily: {
    count: 50,
    size: 0.05,
    spread: 3,
    velocity: { min: 0.05, max: 0.2 },
    colors: ['#87CEEB', '#98FB98', '#DDA0DD'],
    lifetime: 2,
    gravity: -0.005
  },
  healing: {
    count: 100,
    size: 0.08,
    spread: 4,
    velocity: { min: 0.02, max: 0.1 },
    colors: ['#00FF88', '#00CED1', '#9370DB', '#FF69B4'],
    lifetime: 4,
    gravity: 0
  }
};

// Create a particle system for celebrations
export function createParticleSystem(type = 'milestone', position = [0, 0, 0]) {
  const config = PARTICLE_CONFIGS[type] || PARTICLE_CONFIGS.milestone;
  const particles = [];
  
  for (let i = 0; i < config.count; i++) {
    const particle = {
      position: new THREE.Vector3(
        position[0] + (Math.random() - 0.5) * config.spread,
        position[1] + (Math.random() - 0.5) * config.spread,
        position[2] + (Math.random() - 0.5) * config.spread
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * config.velocity.max,
        Math.random() * config.velocity.max + config.velocity.min,
        (Math.random() - 0.5) * config.velocity.max
      ),
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      size: config.size * (0.5 + Math.random() * 0.5),
      lifetime: config.lifetime,
      age: 0,
      opacity: 1
    };
    particles.push(particle);
  }
  
  return {
    particles,
    config,
    update: function(deltaTime) {
      particles.forEach(particle => {
        particle.age += deltaTime;
        
        if (particle.age < particle.lifetime) {
          // Update position
          particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
          
          // Apply gravity
          particle.velocity.y += config.gravity * deltaTime;
          
          // Update opacity (fade out)
          particle.opacity = 1 - (particle.age / particle.lifetime);
          
          // Update size (shrink)
          particle.size *= 0.99;
        }
      });
      
      // Remove dead particles
      return particles.filter(p => p.age < p.lifetime);
    }
  };
}

// Create spiral healing animation
export function createSpiralAnimation(centerPoint, radius = 2, duration = 3) {
  const points = [];
  const segments = 100;
  const height = 5;
  const rotations = 3;
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 * rotations;
    const r = radius * (1 - t * 0.5); // Decreasing radius
    const h = t * height;
    
    points.push(new THREE.Vector3(
      centerPoint.x + Math.cos(angle) * r,
      centerPoint.y + h,
      centerPoint.z + Math.sin(angle) * r
    ));
  }
  
  return {
    points,
    duration,
    animate: function(mesh, onComplete) {
      const tl = gsap.timeline({ onComplete });
      
      points.forEach((point, index) => {
        tl.to(mesh.position, {
          x: point.x,
          y: point.y,
          z: point.z,
          duration: duration / segments,
          ease: "power2.inOut"
        }, index * (duration / segments) * 0.9);
      });
      
      return tl;
    }
  };
}

// Create pulsing glow effect
export function createPulseAnimation(mesh, options = {}) {
  const {
    minScale = 0.8,
    maxScale = 1.2,
    duration = 2,
    colorStart = '#FFFFFF',
    colorEnd = '#FFD700'
  } = options;
  
  const startColor = new THREE.Color(colorStart);
  const endColor = new THREE.Color(colorEnd);
  
  return gsap.timeline({ repeat: -1, yoyo: true })
    .to(mesh.scale, {
      x: maxScale,
      y: maxScale,
      z: maxScale,
      duration: duration / 2,
      ease: "power2.inOut"
    })
    .to(mesh.material.color, {
      r: endColor.r,
      g: endColor.g,
      b: endColor.b,
      duration: duration / 2,
      ease: "power2.inOut"
    }, 0)
    .to(mesh.material.emissiveIntensity, {
      value: 0.5,
      duration: duration / 2,
      ease: "power2.inOut"
    }, 0);
}

// Create wave effect across brain regions
export function createWaveAnimation(regions, options = {}) {
  const {
    duration = 3,
    waveColor = '#00FF88',
    waveIntensity = 0.5,
    stagger = 0.1
  } = options;
  
  const timeline = gsap.timeline();
  
  regions.forEach((region, index) => {
    timeline.to(region.material, {
      emissiveIntensity: waveIntensity,
      duration: 0.5,
      ease: "power2.in"
    }, index * stagger)
    .to(region.material.emissive, {
      r: new THREE.Color(waveColor).r,
      g: new THREE.Color(waveColor).g,
      b: new THREE.Color(waveColor).b,
      duration: 0.5,
      ease: "power2.in"
    }, index * stagger)
    .to(region.material, {
      emissiveIntensity: 0,
      duration: 0.5,
      ease: "power2.out"
    }, index * stagger + 0.5);
  });
  
  return timeline;
}

// Create neural connection animation
export function createNeuralConnectionAnimation(startPoint, endPoint, options = {}) {
  const {
    segments = 20,
    duration = 1,
    color = '#00CED1',
    width = 0.02
  } = options;
  
  const curve = new THREE.CatmullRomCurve3([
    startPoint,
    new THREE.Vector3(
      (startPoint.x + endPoint.x) / 2,
      (startPoint.y + endPoint.y) / 2 + 1,
      (startPoint.z + endPoint.z) / 2
    ),
    endPoint
  ]);
  
  const points = curve.getPoints(segments);
  
  return {
    points,
    animate: function(lineGeometry) {
      const positions = [];
      
      return gsap.to({}, {
        duration,
        ease: "power2.inOut",
        onUpdate: function() {
          const progress = this.progress();
          const visibleSegments = Math.floor(progress * segments);
          
          positions.length = 0;
          for (let i = 0; i <= visibleSegments; i++) {
            positions.push(points[i].x, points[i].y, points[i].z);
          }
          
          lineGeometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
          );
          lineGeometry.attributes.position.needsUpdate = true;
        }
      });
    }
  };
}

// Create fireworks celebration
export function createFireworksAnimation(scene, position = [0, 0, 0], count = 5) {
  const fireworks = [];
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const firework = createParticleSystem('milestone', [
        position[0] + (Math.random() - 0.5) * 4,
        position[1],
        position[2] + (Math.random() - 0.5) * 4
      ]);
      
      fireworks.push(firework);
      
      // Remove after lifetime
      setTimeout(() => {
        const index = fireworks.indexOf(firework);
        if (index > -1) fireworks.splice(index, 1);
      }, firework.config.lifetime * 1000);
      
    }, i * 300);
  }
  
  return fireworks;
}

// Create healing light burst
export function createHealingBurst(position, options = {}) {
  const {
    color = '#00FF88',
    radius = 5,
    duration = 2,
    segments = 32
  } = options;
  
  const geometry = new THREE.RingGeometry(0, radius, segments);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  
  const ring = new THREE.Mesh(geometry, material);
  ring.position.set(...position);
  
  const animation = gsap.timeline()
    .to(ring.scale, {
      x: 2,
      y: 2,
      z: 2,
      duration,
      ease: "power2.out"
    })
    .to(material, {
      opacity: 0,
      duration,
      ease: "power2.out"
    }, 0)
    .call(() => {
      ring.geometry.dispose();
      ring.material.dispose();
    });
  
  return { mesh: ring, animation };
}

// Create progress celebration based on achievement type
export function createProgressAnimation(type, scene, options = {}) {
  switch (type) {
    case 'milestone_reached':
      return {
        particles: createFireworksAnimation(scene, options.position),
        duration: 5000
      };
      
    case 'daily_progress':
      return {
        particles: createParticleSystem('daily', options.position),
        duration: 2000
      };
      
    case 'healing_boost':
      return {
        effect: createHealingBurst(options.position || [0, 0, 0]),
        duration: 2000
      };
      
    case 'region_healed':
      return {
        wave: createWaveAnimation(options.regions || []),
        duration: 3000
      };
      
    case 'connection_formed':
      return {
        connection: createNeuralConnectionAnimation(
          options.startPoint,
          options.endPoint
        ),
        duration: 1000
      };
      
    default:
      return {
        particles: createParticleSystem('healing', options.position),
        duration: 4000
      };
  }
}

// Composite animation manager
export class AnimationManager {
  constructor() {
    this.activeAnimations = [];
  }
  
  add(animation) {
    this.activeAnimations.push({
      ...animation,
      startTime: Date.now()
    });
  }
  
  update(deltaTime) {
    const now = Date.now();
    
    this.activeAnimations = this.activeAnimations.filter(anim => {
      const elapsed = now - anim.startTime;
      
      if (elapsed < anim.duration) {
        if (anim.particles) {
          anim.particles = anim.particles.update ? 
            anim.particles.update(deltaTime) : 
            anim.particles;
        }
        return true;
      }
      
      return false;
    });
  }
  
  clear() {
    this.activeAnimations = [];
  }
  
  get count() {
    return this.activeAnimations.length;
  }
}