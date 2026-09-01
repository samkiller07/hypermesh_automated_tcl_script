/**
 * HyperMesh CAE Automation Studio - Industry Presets & Custom Preset Manager
 * Provides ready-to-run configurations for CAE specialists and import/export capabilities.
 */

const CAE_PRESETS = {
  automotive_biw_5mm: {
    id: "automotive_biw_5mm",
    name: "Automotive BIW (5.0mm Shell Crash & Safety)",
    subdomain: "crash",
    category: "Automotive Body-in-White",
    solver: "LS-DYNA",
    unitSystem: "mm-ms-kg-kN (Crash)",
    cadPath: "C:/CAE_Projects/BIW_Floor_Panel.stp",
    exportPath: "C:/CAE_Projects/BIW_Mesh_Run.k",
    stitchTol: 0.05,
    minPinholeDia: 2.5,
    minFilletRadius: 1.5,
    extractMidsurface: true,
    midsurfaceMethod: "Skin Mid-Surface",
    meshType: "2d_shell",
    elemType: "mixed",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 5.0,
    minElemSize: 2.0,
    maxElemSize: 8.0,
    washerEnabled: true,
    washerHoleMin: 4.0,
    washerHoleMax: 18.0,
    washerRings: 2,
    washerOffset: 1.5,
    cleanQuality: true,
    maxSmoothingPasses: 5,
    warpageLimit: 15.0,
    aspectLimit: 5.0,
    jacobianLimit: 0.60,
    skewLimit: 50.0,
    minTimestep: 0.9e-6,
    createConnectors: true,
    connectorType: "Spotweld (Hexa Cluster Solid)",
    assignProps: true,
    materialCard: "*MAT_PIECEWISE_LINEAR_PLASTICITY (MAT_024)",
    matDensity: "7.85e-6",
    matE: "210.0",
    matNu: "0.30",
    propCard: "*SECTION_SHELL",
    propThickness: 1.5,
    notes: "Strict maximum tria percentage (<5%) with 2 washer layers around all M6-M14 spotweld/bolt holes for crash deformation stability."
  },

  plastic_door_trim_2_5mm: {
    id: "plastic_door_trim_2_5mm",
    name: "Plastic Interior Door Trim (2.5mm Shell NVH)",
    subdomain: "nvh",
    category: "Plastics & Interiors",
    solver: "OptiStruct",
    unitSystem: "mm-t-s-N (Standard NVH)",
    cadPath: "C:/CAE_Projects/Door_Inner_Trim.catpart",
    exportPath: "C:/CAE_Projects/Door_Trim_Modal.fem",
    stitchTol: 0.02,
    minPinholeDia: 1.5,
    minFilletRadius: 0.8,
    extractMidsurface: true,
    midsurfaceMethod: "Direct Mid-Mesh",
    meshType: "2d_shell",
    elemType: "quad",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 2.5,
    minElemSize: 1.0,
    maxElemSize: 4.0,
    washerEnabled: true,
    washerHoleMin: 3.0,
    washerHoleMax: 12.0,
    washerRings: 2,
    washerOffset: 1.8,
    cleanQuality: true,
    maxSmoothingPasses: 8,
    warpageLimit: 10.0,
    aspectLimit: 3.5,
    jacobianLimit: 0.70,
    skewLimit: 40.0,
    minTimestep: 0.0,
    createConnectors: true,
    connectorType: "RBE2 / RBE3 Spiders with CBUSH Dampers",
    assignProps: true,
    materialCard: "MAT1 (PP-EPDM Plastic)",
    matDensity: "0.95e-9",
    matE: "1800.0",
    matNu: "0.38",
    propCard: "PSHELL",
    propThickness: 2.5,
    notes: "Captures intricate ribbing and snap-fit mid-surfaces with high-quality quad mesh for modal & squeak/rattle resonance prediction."
  },

  engine_bracket_tet10: {
    id: "engine_bracket_tet10",
    name: "Powertrain Cast Bracket (3.0mm Solid Tet10)",
    subdomain: "durability",
    category: "Powertrain & Castings",
    solver: "Abaqus Standard",
    unitSystem: "mm-t-s-N",
    cadPath: "C:/CAE_Projects/Engine_Mount_Bracket.stp",
    exportPath: "C:/CAE_Projects/Bracket_Fatigue.inp",
    stitchTol: 0.05,
    minPinholeDia: 3.0,
    minFilletRadius: 1.2,
    extractMidsurface: false,
    midsurfaceMethod: "None (Solid 3D)",
    meshType: "3d_solid_tet",
    elemType: "solid_tet",
    elemOrder: "2nd Order (Parabolic)",
    targetElemSize: 3.0,
    minElemSize: 1.0,
    maxElemSize: 6.0,
    washerEnabled: true,
    washerHoleMin: 6.0,
    washerHoleMax: 24.0,
    washerRings: 2,
    washerOffset: 2.0,
    cleanQuality: true,
    maxSmoothingPasses: 6,
    warpageLimit: 8.0,
    aspectLimit: 3.0,
    jacobianLimit: 0.75,
    skewLimit: 35.0,
    minTimestep: 0.0,
    createConnectors: true,
    connectorType: "Continuous Seam Weld / CWELD / Fastener Preload",
    assignProps: true,
    materialCard: "*ELASTIC + *PLASTIC (Cast Iron EN-GJS-500)",
    matDensity: "7.20e-9",
    matE: "169000.0",
    matNu: "0.275",
    propCard: "PSOLID",
    propThickness: 0.0,
    notes: "Curvature-driven 2nd order tetrahedral solid elements (Tet10/C3D10M) with bolt boss washer rings for high-cycle fatigue assessment."
  },

  aero_wing_skin_pcompg: {
    id: "aero_wing_skin_pcompg",
    name: "Aerospace Composite Wing Skin (PCOMPG Laminate)",
    subdomain: "aero",
    category: "Aerospace Structures",
    solver: "Nastran",
    unitSystem: "mm-kg-s (Aero metric)",
    cadPath: "C:/CAE_Projects/Wing_Skin_Panel.iges",
    exportPath: "C:/CAE_Projects/Wing_Composite.fem",
    stitchTol: 0.01,
    minPinholeDia: 4.0,
    minFilletRadius: 2.0,
    extractMidsurface: true,
    midsurfaceMethod: "Skin Mid-Surface",
    meshType: "2d_shell",
    elemType: "quad",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 8.0,
    minElemSize: 4.0,
    maxElemSize: 12.0,
    washerEnabled: true,
    washerHoleMin: 4.8,
    washerHoleMax: 16.0,
    washerRings: 2,
    washerOffset: 2.5,
    cleanQuality: true,
    maxSmoothingPasses: 10,
    warpageLimit: 5.0,
    aspectLimit: 3.0,
    jacobianLimit: 0.80,
    skewLimit: 30.0,
    minTimestep: 0.0,
    createConnectors: true,
    connectorType: "CBUSH Fasteners with RBE2 Spiders",
    assignProps: true,
    materialCard: "MAT8 (2D Orthotropic Carbon/Epoxy)",
    matDensity: "1.55e-9",
    matE: "135000.0",
    matNu: "0.32",
    propCard: "PCOMPG (Global Ply Laminate)",
    propThickness: 2.4,
    notes: "Rigid quad alignment along aerodynamic streamline cords, Global Ply IDs (PCOMPG) mapped with Tsai-Wu / Hashin failure envelope checks."
  },

  ev_battery_tray: {
    id: "ev_battery_tray",
    name: "EV Battery Enclosure Frame (Multi-Gauge Extrusions)",
    subdomain: "crash",
    category: "Electric Vehicles & Battery",
    solver: "LS-DYNA",
    unitSystem: "mm-ms-kg-kN (Crash)",
    cadPath: "C:/CAE_Projects/Battery_Enclosure.stp",
    exportPath: "C:/CAE_Projects/Battery_SidePole_Crash.k",
    stitchTol: 0.04,
    minPinholeDia: 2.0,
    minFilletRadius: 1.0,
    extractMidsurface: true,
    midsurfaceMethod: "Offset Mid-Surface",
    meshType: "2d_shell",
    elemType: "mixed",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 4.0,
    minElemSize: 1.8,
    maxElemSize: 6.5,
    washerEnabled: true,
    washerHoleMin: 4.0,
    washerHoleMax: 20.0,
    washerRings: 2,
    washerOffset: 1.6,
    cleanQuality: true,
    maxSmoothingPasses: 6,
    warpageLimit: 12.0,
    aspectLimit: 4.5,
    jacobianLimit: 0.62,
    skewLimit: 45.0,
    minTimestep: 0.9e-6,
    createConnectors: true,
    connectorType: "Spotweld (Hexa Cluster Solid)",
    assignProps: true,
    materialCard: "*MAT_024 (Aluminium 6000-T6 Extrusion)",
    matDensity: "2.70e-6",
    matE: "70.0",
    matNu: "0.33",
    propCard: "*SECTION_SHELL",
    propThickness: 2.8,
    notes: "Multi-gauge aluminum cross-members with critical side-pole intrusion crush capture and structural adhesive line meshing."
  },

  exhaust_manifold_cfd: {
    id: "exhaust_manifold_cfd",
    name: "Exhaust Manifold CHT & Surface Skinning",
    subdomain: "thermal_cfd",
    category: "Thermal & Fluid Dynamics",
    solver: "Ansys Fluent / OptiStruct Thermal",
    unitSystem: "m-kg-s (SI Standard)",
    cadPath: "C:/CAE_Projects/Exhaust_Runner.stp",
    exportPath: "C:/CAE_Projects/Exhaust_CHT.cdb",
    stitchTol: 0.01,
    minPinholeDia: 1.0,
    minFilletRadius: 0.5,
    extractMidsurface: false,
    midsurfaceMethod: "None (Solid 3D)",
    meshType: "2d_shell",
    elemType: "tria",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 2.0,
    minElemSize: 0.5,
    maxElemSize: 4.0,
    washerEnabled: false,
    washerHoleMin: 2.0,
    washerHoleMax: 15.0,
    washerRings: 1,
    washerOffset: 1.0,
    cleanQuality: true,
    maxSmoothingPasses: 12,
    warpageLimit: 15.0,
    aspectLimit: 3.5,
    jacobianLimit: 0.65,
    skewLimit: 40.0,
    minTimestep: 0.0,
    createConnectors: false,
    connectorType: "Thermal Interface Gap",
    assignProps: true,
    materialCard: "MAT4 (Thermal Conductivity & Heat Capacity)",
    matDensity: "7.85e-9",
    matE: "190000.0",
    matNu: "0.30",
    propCard: "PSOLID / BOUNDARY_SURFACE",
    propThickness: 0.0,
    notes: "Watertight high-uniformity tria skin mesh tailored for boundary layer inflation prisms and conjugate heat transfer."
  },

  control_arm_topology: {
    id: "control_arm_topology",
    name: "Suspension Control Arm (Topology Lightweighting)",
    subdomain: "topology",
    category: "Lightweighting & Optimization",
    solver: "OptiStruct",
    unitSystem: "mm-t-s-N",
    cadPath: "C:/CAE_Projects/Control_Arm_DesignSpace.stp",
    exportPath: "C:/CAE_Projects/Control_Arm_Opt.fem",
    stitchTol: 0.03,
    minPinholeDia: 4.0,
    minFilletRadius: 1.5,
    extractMidsurface: false,
    midsurfaceMethod: "None (Solid 3D)",
    meshType: "3d_solid_tet",
    elemType: "solid_tet",
    elemOrder: "1st Order (Linear)",
    targetElemSize: 3.0,
    minElemSize: 1.2,
    maxElemSize: 5.0,
    washerEnabled: true,
    washerHoleMin: 8.0,
    washerHoleMax: 30.0,
    washerRings: 2,
    washerOffset: 2.0,
    cleanQuality: true,
    maxSmoothingPasses: 5,
    warpageLimit: 10.0,
    aspectLimit: 3.0,
    jacobianLimit: 0.65,
    skewLimit: 45.0,
    minTimestep: 0.0,
    createConnectors: true,
    connectorType: "Non-Design Space RBE2 Bolt Load Application",
    assignProps: true,
    materialCard: "MAT1 (AlSi10Mg Additive / Titanium)",
    matDensity: "2.67e-9",
    matE: "71000.0",
    matNu: "0.33",
    propCard: "PSOLID",
    propThickness: 0.0,
    notes: "Separates solid geometry into Design Space (optimizable) and Non-Design Space (bushings & ball joint bosses) with DTPL cards."
  }
};

// Preset Management Helpers (LocalStorage + Import/Export)
const PresetManager = {
  getAllPresets() {
    const custom = this.getCustomPresets();
    return { ...CAE_PRESETS, ...custom };
  },

  getCustomPresets() {
    try {
      const stored = localStorage.getItem("hm_custom_presets");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn("Unable to access localStorage:", e);
      return {};
    }
  },

  saveCustomPreset(preset) {
    try {
      const custom = this.getCustomPresets();
      custom[preset.id] = preset;
      localStorage.setItem("hm_custom_presets", JSON.stringify(custom));
      return true;
    } catch (e) {
      console.error("Error saving preset:", e);
      return false;
    }
  },

  deleteCustomPreset(id) {
    try {
      const custom = this.getCustomPresets();
      delete custom[id];
      localStorage.setItem("hm_custom_presets", JSON.stringify(custom));
      return true;
    } catch (e) {
      console.error("Error deleting preset:", e);
      return false;
    }
  },

  exportPresetsJSON() {
    const all = this.getAllPresets();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(all, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "hypermesh_cae_presets.json");
    dlAnchor.click();
  },

  importPresetsJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      const custom = this.getCustomPresets();
      Object.assign(custom, parsed);
      localStorage.setItem("hm_custom_presets", JSON.stringify(custom));
      return true;
    } catch (e) {
      console.error("Invalid preset JSON:", e);
      return false;
    }
  }
};

if (typeof window !== "undefined") {
  window.CAE_PRESETS = CAE_PRESETS;
  window.PresetManager = PresetManager;
}
