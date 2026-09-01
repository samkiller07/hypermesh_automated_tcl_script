/**
 * HyperMesh CAE Automation Studio - Subdomains Definition & Rules
 * Comprehensive settings, criteria, recommendations, and card templates for 7 CAE subdomains.
 */

const CAE_SUBDOMAINS = {
  crash: {
    id: "crash",
    name: "Crash & Safety",
    icon: "💥",
    desc: "Non-linear explicit dynamics, contact sets, spotweld clusters, minimum timestep limits.",
    defaultSolver: "LS-DYNA",
    unitSystem: "mm-ms-kg-kN (Crash)",
    solvers: ["LS-DYNA", "Radioss", "Abaqus Explicit", "Pam-Crash"],
    elemType: "mixed", // Quad dominant with strict tria limit
    elemOrder: "1st Order (Linear)",
    targetElemSize: 5.0,
    minElemSize: 2.0,
    maxElemSize: 8.0,
    washerRings: 2,
    washerOffset: 1.5,
    holeMinDia: 3.0,
    holeMaxDia: 18.0,
    qualityCriteria: {
      warpage: 15.0,
      aspectRatio: 5.0,
      jacobian: 0.60,
      skew: 50.0,
      minAngleQuad: 35.0,
      maxAngleQuad: 145.0,
      minAngleTria: 20.0,
      maxAngleTria: 120.0,
      minTimestep: 0.9e-6, // micro-seconds
      triaPercentMax: 5.0
    },
    defaultMaterial: {
      card: "*MAT_PIECEWISE_LINEAR_PLASTICITY (MAT_024)",
      density: 7.85e-6, // kg/mm^3
      youngsModulus: 210.0, // GPa
      poissonsRatio: 0.3,
      yieldStress: 0.280, // GPa
      plasticStrainCurve: "LC_STRESS_STRAIN_STEEL"
    },
    defaultProperty: {
      card: "*SECTION_SHELL",
      thickness: 1.5,
      nip: 5, // Number of integration points through thickness
      elform: 2 // Belytschko-Tsay
    },
    connectorType: "Spotweld (Hexa Cluster Solid)",
    specialFeatures: [
      "Rigid Body (*MAT_RIGID) master nodes on accelerometer locations",
      "Automatic Contact Definition (*CONTACT_AUTOMATIC_SINGLE_SURFACE)",
      "Initial Velocity & Boundary Condition generation",
      "Mass Scaling check for elements under critical timestep"
    ]
  },

  nvh: {
    id: "nvh",
    name: "NVH & Acoustics",
    icon: "🎵",
    desc: "Linear dynamics, modal analysis (SOL 103), frequency response (SOL 111), acoustic cavity coupling.",
    defaultSolver: "OptiStruct",
    unitSystem: "mm-t-s-N (Standard NVH)",
    solvers: ["OptiStruct", "Nastran", "Ansys", "Abaqus Standard"],
    elemType: "quad", // Quads preferred
    elemOrder: "1st Order (Linear)",
    targetElemSize: 3.5,
    minElemSize: 1.5,
    maxElemSize: 6.0,
    washerRings: 2,
    washerOffset: 2.0,
    holeMinDia: 4.0,
    holeMaxDia: 25.0,
    qualityCriteria: {
      warpage: 10.0,
      aspectRatio: 3.5,
      jacobian: 0.70,
      skew: 40.0,
      minAngleQuad: 45.0,
      maxAngleQuad: 135.0,
      minAngleTria: 30.0,
      maxAngleTria: 110.0,
      minTimestep: 0.0,
      triaPercentMax: 3.0
    },
    defaultMaterial: {
      card: "MAT1 (Isotropic Linear Elastic)",
      density: 7.85e-9, // t/mm^3
      youngsModulus: 210000.0, // MPa
      poissonsRatio: 0.3,
      structuralDamping: 0.02
    },
    defaultProperty: {
      card: "PSHELL",
      thickness: 1.2,
      bendingInertiaRatio: 1.0,
      shearRatio: 0.833
    },
    connectorType: "RBE2 / RBE3 Spiders with CBUSH Dampers",
    specialFeatures: [
      "Eigenvalue Extraction EIGRL card (0 to 200 Hz)",
      "Acoustic Cavity Hexa/Tetra Fluid Mesh generation",
      "Transfer Path Analysis (TPA) response monitor points",
      "Strict skewness and warpage prevention on acoustic panels"
    ]
  },

  durability: {
    id: "durability",
    name: "Durability & Fatigue",
    icon: "🛡️",
    desc: "Stress & fatigue life assessment, stress concentration capture, zero trias on critical fillets.",
    defaultSolver: "Abaqus Standard",
    unitSystem: "mm-t-s-N",
    solvers: ["Abaqus Standard", "OptiStruct", "Ansys", "Nastran"],
    elemType: "quad", // High quality quad dominant
    elemOrder: "2nd Order (Parabolic)",
    targetElemSize: 2.5,
    minElemSize: 1.0,
    maxElemSize: 5.0,
    washerRings: 3,
    washerOffset: 1.2,
    holeMinDia: 3.0,
    holeMaxDia: 20.0,
    qualityCriteria: {
      warpage: 8.0,
      aspectRatio: 3.0,
      jacobian: 0.75,
      skew: 35.0,
      minAngleQuad: 50.0,
      maxAngleQuad: 130.0,
      minAngleTria: 35.0,
      maxAngleTria: 100.0,
      minTimestep: 0.0,
      triaPercentMax: 1.5
    },
    defaultMaterial: {
      card: "*ELASTIC + *PLASTIC (Abaqus)",
      density: 7.85e-9,
      youngsModulus: 206000.0,
      poissonsRatio: 0.29,
      yieldStress: 355.0
    },
    defaultProperty: {
      card: "*SHELL SECTION (Simpson 5pts)",
      thickness: 2.0,
      nip: 5
    },
    connectorType: "Continuous Seam Weld / CWELD / Fastener Preload",
    specialFeatures: [
      "Zero-tria enforcement on fillet radii and notch zones",
      "Automatic Node Align along maximum principal stress gradients",
      "Bolt Preload Step creation with pretension section nodes",
      "Fatigue critical hotspot collector generation"
    ]
  },

  aero: {
    id: "aero",
    name: "Aerospace & Composites",
    icon: "✈️",
    desc: "Composite laminates (PCOMP/PCOMPG), ply stack angles, 1D beam stiffeners, shear pin fasteners.",
    defaultSolver: "Nastran",
    unitSystem: "mm-kg-s (Aero metric) or in-lb-s",
    solvers: ["Nastran", "OptiStruct", "Abaqus", "Ansys"],
    elemType: "quad",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 8.0,
    minElemSize: 4.0,
    maxElemSize: 15.0,
    washerRings: 2,
    washerOffset: 2.5,
    holeMinDia: 5.0,
    holeMaxDia: 30.0,
    qualityCriteria: {
      warpage: 5.0,
      aspectRatio: 3.0,
      jacobian: 0.80,
      skew: 30.0,
      minAngleQuad: 60.0,
      maxAngleQuad: 120.0,
      minAngleTria: 40.0,
      maxAngleTria: 90.0,
      minTimestep: 0.0,
      triaPercentMax: 1.0
    },
    defaultMaterial: {
      card: "MAT8 (2D Orthotropic Carbon/Epoxy)",
      density: 1.55e-9,
      youngsModulus: 135000.0, // E1
      poissonsRatio: 0.32, // Nu12
      e2: 9000.0,
      g12: 4500.0,
      g1z: 3500.0,
      g2z: 3500.0
    },
    defaultProperty: {
      card: "PCOMPG (Global Ply Laminate)",
      thickness: 2.4, // Total
      plyCount: 16,
      layup: "[45/0/-45/90/0/45/0/-45]s",
      failureTheory: "TSAI-WU / HASHIN"
    },
    connectorType: "CBUSH Fasteners with RBE2 Spiders",
    specialFeatures: [
      "Material coordinate system orientation alignment (Vector / Surface drape)",
      "1D Stiffener Beam extraction along CAD edges (CBAR/CBEAM + PBEAML)",
      "Global Ply ID (PCOMPG) mapping across multi-step tapered zones",
      "Fastener shear stiffness definition (Huth / Swift equations)"
    ]
  },

  thermal_cfd: {
    id: "thermal_cfd",
    name: "Thermal & CFD Prep",
    icon: "🔥",
    desc: "Conjugate heat transfer, enclosure radiation, surface boundary layers, watertight volume tet/prisms.",
    defaultSolver: "Ansys Fluent / OptiStruct Thermal",
    unitSystem: "m-kg-s (SI Standard) or mm-t-s",
    solvers: ["Ansys Fluent", "OptiStruct", "Abaqus", "Star-CCM+"],
    elemType: "tria", // High quality tria surface for volume meshing
    elemOrder: "1st Order (Linear)",
    targetElemSize: 2.0,
    minElemSize: 0.5,
    maxElemSize: 5.0,
    washerRings: 1,
    washerOffset: 1.0,
    holeMinDia: 2.0,
    holeMaxDia: 15.0,
    qualityCriteria: {
      warpage: 15.0,
      aspectRatio: 4.0,
      jacobian: 0.65,
      skew: 45.0,
      minAngleQuad: 30.0,
      maxAngleQuad: 150.0,
      minAngleTria: 25.0,
      maxAngleTria: 130.0,
      minTimestep: 0.0,
      triaPercentMax: 100.0 // Trias preferred for boundary layer extrusion
    },
    defaultMaterial: {
      card: "MAT4 (Thermal Conductivity & Heat Capacity)",
      density: 2.70e-9, // Aluminium
      youngsModulus: 70000.0,
      poissonsRatio: 0.33,
      thermalConductivity: 180.0, // W/(m*K)
      specificHeat: 900.0 // J/(kg*K)
    },
    defaultProperty: {
      card: "PSOLID / BOUNDARY_SURFACE",
      thickness: 0.0
    },
    connectorType: "Thermal Interface Gap (CGAP / Conduction Couplings)",
    specialFeatures: [
      "Watertight surface check (Zero free edges, zero non-manifold edges)",
      "Boundary layer inflation parameters (First layer height y+, growth 1.2)",
      "Radiation view factor enclosure cavity grouping",
      "Fluid-Structure Interface (FSI) surface partition mapping"
    ]
  },

  topology: {
    id: "topology",
    name: "Topology Optimization & Additive",
    icon: "🧩",
    desc: "Lightweighting, design vs non-design spaces, solid tetramesh/hexa-voxel, manufacturing constraints.",
    defaultSolver: "OptiStruct",
    unitSystem: "mm-t-s-N",
    solvers: ["OptiStruct", "Tosca / Abaqus", "Ansys Genesis"],
    elemType: "solid_tet",
    elemOrder: "1st Order (Linear) or 2nd Order",
    targetElemSize: 3.0,
    minElemSize: 1.0,
    maxElemSize: 6.0,
    washerRings: 2,
    washerOffset: 2.0,
    holeMinDia: 5.0,
    holeMaxDia: 25.0,
    qualityCriteria: {
      warpage: 10.0,
      aspectRatio: 3.0,
      jacobian: 0.65,
      skew: 45.0,
      minAngleQuad: 40.0,
      maxAngleQuad: 140.0,
      minAngleTria: 30.0,
      maxAngleTria: 115.0,
      minTimestep: 0.0,
      triaPercentMax: 10.0
    },
    defaultMaterial: {
      card: "MAT1 (AlSi10Mg Additive / Titanium Ti-6Al-4V)",
      density: 2.67e-9,
      youngsModulus: 71000.0,
      poissonsRatio: 0.33
    },
    defaultProperty: {
      card: "PSOLID",
      thickness: 0.0
    },
    connectorType: "Non-Design Space RBE2 Bolt Load Application",
    specialFeatures: [
      "Automatic Separation: Design Space vs Non-Design Space Collectors",
      "DTPL Card (Design Variable definition with Volume Fraction response)",
      "Manufacturing Constraints: Draw Direction, Extrusion, Min Member Size",
      "Lattice Infill property definition for Additive Laser Powder Bed"
    ]
  },

  mbd: {
    id: "mbd",
    name: "Multibody Dynamics (MBD)",
    icon: "⚙️",
    desc: "Rigid-flexible coupling, kinematic joints (revolute, spherical), modal reduction (CMS / Craig-Bampton).",
    defaultSolver: "MotionSolve / OptiStruct",
    unitSystem: "mm-kg-s or m-kg-s",
    solvers: ["MotionSolve", "Adams / OptiStruct", "RecurDyn"],
    elemType: "mixed",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 4.0,
    minElemSize: 1.5,
    maxElemSize: 8.0,
    washerRings: 2,
    washerOffset: 1.8,
    holeMinDia: 4.0,
    holeMaxDia: 25.0,
    qualityCriteria: {
      warpage: 12.0,
      aspectRatio: 4.0,
      jacobian: 0.65,
      skew: 45.0,
      minAngleQuad: 40.0,
      maxAngleQuad: 140.0,
      minAngleTria: 25.0,
      maxAngleTria: 120.0,
      minTimestep: 0.0,
      triaPercentMax: 4.0
    },
    defaultMaterial: {
      card: "MAT1 (Structural Steel / Cast Iron)",
      density: 7.85e-9,
      youngsModulus: 210000.0,
      poissonsRatio: 0.3
    },
    defaultProperty: {
      card: "PSHELL / PSOLID",
      thickness: 2.5
    },
    connectorType: "Kinematic Revolute / Spherical Joints with RBE2",
    specialFeatures: [
      "Craig-Bampton Component Mode Synthesis (CMS) Flex Body (.h3d) Setup",
      "ASET / BNDFIX boundary degree of freedom interface nodes",
      "Rigid Body (*MAT_RIGID / RBE2) mass and inertia concentration",
      "Bushings with non-linear multi-axis force-deflection curves"
    ]
  }
};

/**
 * Standard Consistent CAE Unit Systems for HyperMesh & Solvers
 */
const CAE_UNIT_SYSTEMS = {
  "mm_t_s_N": {
    id: "mm_t_s_N",
    code: "mm-t-s-N",
    name: "mm - t - s - N (Standard NVH / OptiStruct / Abaqus)",
    subdomains: ["nvh", "durability", "topology", "aero"],
    length: "mm",
    mass: "t",
    time: "s",
    force: "N",
    stress: "MPa",
    modulus: "MPa",
    density: "t/mm³",
    energy: "mJ",
    gravity: "9810 mm/s²",
    densityFactorFromKgM3: 1e-12, // 7850 kg/m^3 -> 7.85e-9 t/mm^3
    modulusFactorFromMPa: 1.0,     // 210000 MPa -> 210000 MPa
    lengthFactorFromMm: 1.0,
    timeFactorFromSec: 1.0,
    densityPlaceholder: "7.85e-9",
    modulusPlaceholder: "210000.0",
    description: "Standard in European & Global Automotive/Aerospace. Force = Mass(t) * Accel(mm/s²) = N. Stress = N/mm² = MPa."
  },

  "mm_ms_kg_kN": {
    id: "mm_ms_kg_kN",
    code: "mm-ms-kg-kN",
    name: "mm - ms - kg - kN (Crash / LS-DYNA / Radioss)",
    subdomains: ["crash"],
    length: "mm",
    mass: "kg",
    time: "ms",
    force: "kN",
    stress: "GPa",
    modulus: "GPa",
    density: "kg/mm³",
    energy: "J",
    gravity: "0.00981 mm/ms²",
    densityFactorFromKgM3: 1e-9,  // 7850 kg/m^3 -> 7.85e-6 kg/mm^3
    modulusFactorFromMPa: 1e-3,  // 210000 MPa -> 210.0 GPa
    lengthFactorFromMm: 1.0,
    timeFactorFromSec: 1000.0,
    densityPlaceholder: "7.85e-6",
    modulusPlaceholder: "210.0",
    description: "Standard for High-Velocity Impact and Explicit Dynamics. Force = Mass(kg) * Accel(mm/ms²) = kN. Stress = kN/mm² = GPa."
  },

  "m_kg_s_N": {
    id: "m_kg_s_N",
    code: "m-kg-s-N",
    name: "m - kg - s - N (SI Standard / Thermal / CFD / Fluent)",
    subdomains: ["thermal_cfd", "mbd"],
    length: "m",
    mass: "kg",
    time: "s",
    force: "N",
    stress: "Pa",
    modulus: "Pa",
    density: "kg/m³",
    energy: "J",
    gravity: "9.81 m/s²",
    densityFactorFromKgM3: 1.0,   // 7850 kg/m^3 -> 7850 kg/m^3
    modulusFactorFromMPa: 1e6,   // 210000 MPa -> 2.1e11 Pa
    lengthFactorFromMm: 0.001,
    timeFactorFromSec: 1.0,
    densityPlaceholder: "7850",
    modulusPlaceholder: "2.1e11",
    description: "Standard International SI units. Force = Mass(kg) * Accel(m/s²) = N. Stress = N/m² = Pa."
  },

  "mm_kg_s_mN": {
    id: "mm_kg_s_mN",
    code: "mm-kg-s-mN",
    name: "mm - kg - s - mN (Electronics / Micro-mechanics)",
    subdomains: ["nvh", "topology"],
    length: "mm",
    mass: "kg",
    time: "s",
    force: "mN",
    stress: "kPa",
    modulus: "kPa",
    density: "kg/mm³",
    energy: "µJ",
    gravity: "9810 mm/s²",
    densityFactorFromKgM3: 1e-9,
    modulusFactorFromMPa: 1000.0,
    lengthFactorFromMm: 1.0,
    timeFactorFromSec: 1.0,
    densityPlaceholder: "7.85e-6",
    modulusPlaceholder: "2.1e8",
    description: "Used for small electronics and PCB assemblies where masses are in kilograms and dimensions in millimeters."
  },

  "in_lb_s_lbf": {
    id: "in_lb_s_lbf",
    code: "in-lb-s-lbf",
    name: "in - slinch - s - lbf (Imperial Aero / US Customary)",
    subdomains: ["aero"],
    length: "in",
    mass: "slinch",
    time: "s",
    force: "lbf",
    stress: "psi",
    modulus: "psi",
    density: "slinch/in³",
    energy: "in·lbf",
    gravity: "386.4 in/s²",
    densityFactorFromKgM3: 9.3569e-8,
    modulusFactorFromMPa: 145.038,
    lengthFactorFromMm: 0.0393701,
    timeFactorFromSec: 1.0,
    densityPlaceholder: "7.35e-4",
    modulusPlaceholder: "3.0e7",
    description: "Consistent US Imperial aerospace system. Mass = lbf*s^2/in (slinch). Stress = lbf/in^2 = psi."
  }
};

/**
 * Standard Engineering Materials Library with Auto Unit Conversion
 */
const CAE_MATERIALS_LIBRARY = {
  steel_mild: {
    id: "steel_mild",
    name: "Structural Mild Steel (AISI 1006 / DD11)",
    cardDefault: "MAT1 / MAT24",
    baseDensityKgM3: 7850,       // kg/m^3
    baseYoungsModulusMPa: 210000, // MPa
    poissonsRatio: 0.30,
    yieldStressMPa: 210,
    category: "Metals - Steel"
  },
  steel_dp600: {
    id: "steel_dp600",
    name: "Dual Phase High Strength Steel (DP600)",
    cardDefault: "*MAT_PIECEWISE_LINEAR_PLASTICITY",
    baseDensityKgM3: 7850,
    baseYoungsModulusMPa: 210000,
    poissonsRatio: 0.30,
    yieldStressMPa: 350,
    category: "Metals - Steel"
  },
  steel_spring: {
    id: "steel_spring",
    name: "High Strength Alloy Steel (AISI 4340)",
    cardDefault: "MAT1 / *ELASTIC",
    baseDensityKgM3: 7850,
    baseYoungsModulusMPa: 206000,
    poissonsRatio: 0.29,
    yieldStressMPa: 750,
    category: "Metals - Steel"
  },
  aluminum_6061: {
    id: "aluminum_6061",
    name: "Aluminum Alloy 6061-T6",
    cardDefault: "MAT1 / *MAT_024",
    baseDensityKgM3: 2700,
    baseYoungsModulusMPa: 70000,
    poissonsRatio: 0.33,
    yieldStressMPa: 275,
    category: "Metals - Aluminum"
  },
  aluminum_7075: {
    id: "aluminum_7075",
    name: "Aerospace Aluminum 7075-T6",
    cardDefault: "MAT1 / MAT8",
    baseDensityKgM3: 2810,
    baseYoungsModulusMPa: 72000,
    poissonsRatio: 0.33,
    yieldStressMPa: 505,
    category: "Metals - Aluminum"
  },
  titanium_ti6al4v: {
    id: "titanium_ti6al4v",
    name: "Titanium Ti-6Al-4V (Grade 5)",
    cardDefault: "MAT1 / PSOLID",
    baseDensityKgM3: 4430,
    baseYoungsModulusMPa: 114000,
    poissonsRatio: 0.34,
    yieldStressMPa: 880,
    category: "Metals - Titanium"
  },
  carbon_composite: {
    id: "carbon_composite",
    name: "Carbon/Epoxy UD Composite (Hexcel AS4)",
    cardDefault: "MAT8 / PCOMPG",
    baseDensityKgM3: 1550,
    baseYoungsModulusMPa: 135000,
    poissonsRatio: 0.32,
    yieldStressMPa: 1500,
    category: "Composites"
  },
  plastic_pa66_gf30: {
    id: "plastic_pa66_gf30",
    name: "Polyamide PA66-GF30 (30% Glass Filled)",
    cardDefault: "MAT1 / *MAT_024",
    baseDensityKgM3: 1360,
    baseYoungsModulusMPa: 8500,
    poissonsRatio: 0.35,
    yieldStressMPa: 175,
    category: "Plastics & Polymers"
  },
  plastic_abs: {
    id: "plastic_abs",
    name: "ABS Plastic (Injection Molded)",
    cardDefault: "MAT1 / *MAT_024",
    baseDensityKgM3: 1050,
    baseYoungsModulusMPa: 2200,
    poissonsRatio: 0.38,
    yieldStressMPa: 45,
    category: "Plastics & Polymers"
  }
};

// Export for browser global context
if (typeof window !== "undefined") {
  window.CAE_SUBDOMAINS = CAE_SUBDOMAINS;
  window.CAE_UNIT_SYSTEMS = CAE_UNIT_SYSTEMS;
  window.CAE_MATERIALS_LIBRARY = CAE_MATERIALS_LIBRARY;
}

