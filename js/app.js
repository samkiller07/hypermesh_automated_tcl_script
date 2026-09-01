/**
 * Altair HyperMesh Tcl Automation Studio - Main Application Controller
 * Handles state sync, theme management, syntax highlighting, preset management,
 * comprehensive CAE unit systems, custom unit builder, and material conversions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    subdomain: "crash",
    activeTab: "solver",
    viewMode: "full", // 'full', 'procs_only', 'batch_bat', 'batch_sh'
    theme: localStorage.getItem("hm_theme") || "dark",
    
    // Custom Units Store
    customUnits: {
      length: "mm",
      mass: "t",
      time: "s",
      force: "N",
      stress: "MPa",
      modulus: "MPa",
      density: "t/mm³",
      energy: "mJ",
      gravity: "9810 mm/s²"
    },

    // Form Config Data
    config: {
      subdomain: "crash",
      solver: "LS-DYNA",
      unitSystem: "mm_ms_kg_kN",
      cadPath: "C:/CAE_Projects/CAD_Model.stp",
      exportPath: "C:/CAE_Projects/Mesh_Output.k",
      
      stitchTol: 0.05,
      minPinholeDia: 2.0,
      minFilletRadius: 1.0,
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
      propThickness: 1.5
    },

    // Proc Function Toggles
    enabledProcs: {
      proc_init: true,
      proc_import: true,
      proc_midsurf: true,
      proc_mesh: true,
      proc_quality: true,
      proc_connectors: true,
      proc_props: true,
      proc_export: true,
      proc_main: true
    }
  };

  // DOM Elements Cache
  const DOM = {
    subdomainChips: document.getElementById("subdomainChips"),
    presetSelect: document.getElementById("presetSelect"),
    unitSystemInput: document.getElementById("unitSystemInput"),
    btnOpenCustomUnits: document.getElementById("btnOpenCustomUnits"),
    materialLibrarySelect: document.getElementById("materialLibrarySelect"),
    matEHelper: document.getElementById("matEHelper"),
    matDensityHelper: document.getElementById("matDensityHelper"),
    matEInput: document.getElementById("matEInput"),
    matDensityInput: document.getElementById("matDensityInput"),
    matNuInput: document.getElementById("matNuInput"),
    materialCardInput: document.getElementById("materialCardInput"),

    navTabs: document.querySelectorAll(".nav-tab-btn"),
    tabSections: document.querySelectorAll(".tab-section"),
    viewModeBtns: document.querySelectorAll(".view-mode-btn"),
    codeOutput: document.getElementById("codeOutput"),
    lineNumbers: document.getElementById("lineNumbers"),
    codeStats: document.getElementById("codeStats"),
    btnCopy: document.getElementById("btnCopy"),
    btnDownloadTcl: document.getElementById("btnDownloadTcl"),
    btnBatchRunner: document.getElementById("btnBatchRunner"),
    btnManagePresets: document.getElementById("btnManagePresets"),
    btnThemeToggle: document.getElementById("btnThemeToggle"),
    
    // Status Ribbon Tags
    lblActiveDomain: document.getElementById("lblActiveDomain"),
    lblActiveSolver: document.getElementById("lblActiveSolver"),
    lblActiveUnits: document.getElementById("lblActiveUnits"),

    // Quality Gauge
    gaugeScore: document.getElementById("gaugeScore"),
    gaugeFill: document.getElementById("gaugeFill"),
    metricWarpage: document.getElementById("metricWarpage"),
    metricAspect: document.getElementById("metricAspect"),
    metricJacobian: document.getElementById("metricJacobian"),
    metricSkew: document.getElementById("metricSkew"),
    metricTimestep: document.getElementById("metricTimestep"),

    // Modals
    presetModal: document.getElementById("presetModal"),
    batchModal: document.getElementById("batchModal"),
    unitModal: document.getElementById("unitModal"),
    batchModalClose: document.getElementById("batchModalClose"),
    presetModalClose: document.getElementById("presetModalClose"),
    unitModalClose: document.getElementById("unitModalClose"),
    btnCancelCustomUnits: document.getElementById("btnCancelCustomUnits"),
    btnApplyCustomUnits: document.getElementById("btnApplyCustomUnits"),

    // Custom Unit Inputs
    customUnitLength: document.getElementById("customUnitLength"),
    customUnitMass: document.getElementById("customUnitMass"),
    customUnitTime: document.getElementById("customUnitTime"),
    customUnitForce: document.getElementById("customUnitForce"),
    customUnitStress: document.getElementById("customUnitStress"),
    customUnitDensity: document.getElementById("customUnitDensity"),
    customUnitEnergy: document.getElementById("customUnitEnergy"),
    customUnitGravity: document.getElementById("customUnitGravity"),
    unitConsistencyBox: document.getElementById("unitConsistencyBox"),
    unitConsistencyIcon: document.getElementById("unitConsistencyIcon"),
    unitConsistencyTitle: document.getElementById("unitConsistencyTitle"),
    unitConsistencyDesc: document.getElementById("unitConsistencyDesc"),

    btnSaveNewPreset: document.getElementById("btnSaveNewPreset"),
    btnExportPresetsJSON: document.getElementById("btnExportPresetsJSON"),
    btnImportPresetsJSON: document.getElementById("btnImportPresetsJSON"),
    fileImportPresets: document.getElementById("fileImportPresets"),
    presetsListContainer: document.getElementById("presetsListContainer"),
    batchScriptPre: document.getElementById("batchScriptPre"),
    btnDownloadBatFile: document.getElementById("btnDownloadBatFile"),
    toastContainer: document.getElementById("toastContainer")
  };

  // ==========================================================================
  // Initialization
  // ==========================================================================

  function init() {
    initTheme();
    renderSubdomainChips();
    populatePresetsDropdown();
    populateMaterialLibraryDropdown();
    bindFormEvents();
    bindNavEvents();
    bindModalEvents();
    initCustomUnitsModal();
    
    // Load initial preset (BIW 5mm)
    loadPreset("automotive_biw_5mm");
    updateUIFromState();
    recompileCode();
  }

  // ==========================================================================
  // Theme Management (Dark / Light)
  // ==========================================================================

  function initTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    if (DOM.btnThemeToggle) {
      DOM.btnThemeToggle.textContent = state.theme === "dark" ? "🌙" : "☀️";
      DOM.btnThemeToggle.addEventListener("click", () => {
        state.theme = state.theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", state.theme);
        localStorage.setItem("hm_theme", state.theme);
        DOM.btnThemeToggle.textContent = state.theme === "dark" ? "🌙" : "☀️";
        showToast(`Theme switched to ${state.theme.toUpperCase()}`, "info");
      });
    }
  }

  // ==========================================================================
  // Unit System Resolver & Helper Functions
  // ==========================================================================

  function getActiveUnitSystem() {
    const key = state.config.unitSystem;
    if (key === "custom") {
      return {
        id: "custom",
        code: `${state.customUnits.length}-${state.customUnits.time}-${state.customUnits.mass}-${state.customUnits.force}`,
        name: "Custom CAE Unit System",
        length: state.customUnits.length,
        mass: state.customUnits.mass,
        time: state.customUnits.time,
        force: state.customUnits.force,
        stress: state.customUnits.stress,
        modulus: state.customUnits.stress,
        density: state.customUnits.density,
        energy: state.customUnits.energy,
        gravity: state.customUnits.gravity,
        densityFactorFromKgM3: getDensityFactor(state.customUnits.density),
        modulusFactorFromMPa: getModulusFactor(state.customUnits.stress)
      };
    }

    if (CAE_UNIT_SYSTEMS[key]) {
      return CAE_UNIT_SYSTEMS[key];
    }

    // Try matching legacy strings or partial codes
    for (const sys of Object.values(CAE_UNIT_SYSTEMS)) {
      if (key && (key === sys.code || key.startsWith(sys.code) || key.includes(sys.id))) {
        return sys;
      }
    }

    return CAE_UNIT_SYSTEMS.mm_t_s_N;
  }

  function getDensityFactor(densityUnit) {
    if (densityUnit === "t/mm³") return 1e-12;
    if (densityUnit === "kg/mm³") return 1e-9;
    if (densityUnit === "kg/m³") return 1.0;
    if (densityUnit === "g/cm³") return 0.001;
    if (densityUnit === "slinch/in³" || densityUnit === "lbf·s²/in⁴") return 9.3569e-8;
    if (densityUnit === "lb/in³") return 3.6127e-5;
    return 1e-12;
  }

  function getModulusFactor(stressUnit) {
    if (stressUnit === "MPa") return 1.0;
    if (stressUnit === "GPa") return 1e-3;
    if (stressUnit === "Pa") return 1e6;
    if (stressUnit === "kPa") return 1000.0;
    if (stressUnit === "psi") return 145.038;
    if (stressUnit === "ksi") return 0.145038;
    if (stressUnit === "bar") return 10.0;
    return 1.0;
  }

  function updateUnitBadges() {
    const unitSys = getActiveUnitSystem();

    // Update all dynamic badges
    document.querySelectorAll('[data-unit-type]').forEach(badge => {
      const type = badge.dataset.unitType;
      if (type === "length") badge.textContent = unitSys.length;
      else if (type === "modulus") badge.textContent = unitSys.modulus || unitSys.stress;
      else if (type === "density") badge.textContent = unitSys.density;
      else if (type === "stress") badge.textContent = unitSys.stress;
      else if (type === "time") badge.textContent = unitSys.time;
      else if (type === "force") badge.textContent = unitSys.force;
      else if (type === "energy") badge.textContent = unitSys.energy;
    });

    // Update Ribbon Context Tag
    if (DOM.lblActiveUnits) {
      DOM.lblActiveUnits.textContent = unitSys.code || `${unitSys.length}-${unitSys.time}-${unitSys.mass}`;
    }
  }

  function updateMaterialHelpers() {
    const unitSys = getActiveUnitSystem();

    // 1. Density Interpretation
    const rawDensity = parseFloat(state.config.matDensity);
    if (DOM.matDensityHelper) {
      if (!isNaN(rawDensity) && rawDensity > 0) {
        let kgM3 = 0;
        const dUnit = unitSys.density;
        if (dUnit === "t/mm³") kgM3 = rawDensity * 1e12;
        else if (dUnit === "kg/mm³") kgM3 = rawDensity * 1e9;
        else if (dUnit === "kg/m³") kgM3 = rawDensity;
        else if (dUnit === "g/cm³") kgM3 = rawDensity * 1000;
        else if (dUnit.includes("slinch")) kgM3 = rawDensity / 9.3569e-8;
        else if (dUnit.includes("lb/in³")) kgM3 = rawDensity / 3.6127e-5;
        else kgM3 = rawDensity * 1e12;

        const gCm3 = (kgM3 / 1000).toFixed(2);
        const lbIn3 = (kgM3 * 3.6127e-5).toFixed(3);
        const kgFormatted = Math.round(kgM3).toLocaleString();

        DOM.matDensityHelper.innerHTML = `💡 <strong>Equivalent:</strong> ${kgFormatted} kg/m³ &bull; ${gCm3} g/cm³ &bull; ${lbIn3} lb/in³`;
        DOM.matDensityHelper.style.color = "var(--text-secondary)";
      } else {
        DOM.matDensityHelper.innerHTML = `💡 Enter density in <code>${unitSys.density}</code> (e.g. Steel: ${unitSys.densityPlaceholder || '7.85e-9'})`;
        DOM.matDensityHelper.style.color = "var(--text-muted)";
      }
    }

    // 2. Modulus Interpretation
    const rawE = parseFloat(state.config.matE);
    if (DOM.matEHelper) {
      if (!isNaN(rawE) && rawE > 0) {
        let mpa = 0;
        const sUnit = unitSys.modulus || unitSys.stress;
        if (sUnit === "MPa") mpa = rawE;
        else if (sUnit === "GPa") mpa = rawE * 1000;
        else if (sUnit === "Pa") mpa = rawE * 1e-6;
        else if (sUnit === "kPa") mpa = rawE * 0.001;
        else if (sUnit === "psi") mpa = rawE / 145.038;
        else if (sUnit === "ksi") mpa = (rawE * 1000) / 145.038;
        else mpa = rawE;

        const gpa = (mpa / 1000).toFixed(1);
        const mpaFormatted = Math.round(mpa).toLocaleString();
        const mpsi = (mpa * 0.000145038).toFixed(2);

        DOM.matEHelper.innerHTML = `💡 <strong>Equivalent:</strong> ${gpa} GPa &bull; ${mpaFormatted} MPa &bull; ${mpsi} Mpsi`;
        DOM.matEHelper.style.color = "var(--text-secondary)";
      } else {
        DOM.matEHelper.innerHTML = `💡 Enter modulus in <code>${unitSys.modulus || unitSys.stress}</code> (e.g. Steel: ${unitSys.modulusPlaceholder || '210000'})`;
        DOM.matEHelper.style.color = "var(--text-muted)";
      }
    }
  }

  // ==========================================================================
  // Standard Material Library Dropdown
  // ==========================================================================

  function populateMaterialLibraryDropdown() {
    if (!DOM.materialLibrarySelect) return;
    DOM.materialLibrarySelect.innerHTML = `<option value="" disabled selected>🏷️ Pick Material to Auto-fill Properties (Steel, Aluminum, Titanium, Plastics...)</option>`;
    
    const categories = {};
    Object.values(CAE_MATERIALS_LIBRARY).forEach(mat => {
      const cat = mat.category || "General";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(mat);
    });

    for (const [catName, list] of Object.entries(categories)) {
      const optGroup = document.createElement("optgroup");
      optGroup.label = catName;
      list.forEach(mat => {
        const opt = document.createElement("option");
        opt.value = mat.id;
        opt.textContent = mat.name;
        optGroup.appendChild(opt);
      });
      DOM.materialLibrarySelect.appendChild(optGroup);
    }
  }

  function applyMaterialFromLibrary(matId) {
    const mat = CAE_MATERIALS_LIBRARY[matId];
    if (!mat) return;

    const unitSys = getActiveUnitSystem();

    // Convert Density
    const densityVal = (mat.baseDensityKgM3 * unitSys.densityFactorFromKgM3);
    const densityStr = densityVal < 0.01 ? densityVal.toExponential(2) : densityVal.toFixed(2);

    // Convert Modulus
    const modulusVal = (mat.baseYoungsModulusMPa * unitSys.modulusFactorFromMPa);
    const modulusStr = modulusVal >= 100000 ? modulusVal.toFixed(0) : (modulusVal >= 100 ? modulusVal.toFixed(1) : modulusVal.toFixed(2));

    state.config.matDensity = densityStr;
    state.config.matE = modulusStr;
    state.config.matNu = mat.poissonsRatio.toFixed(2);
    
    // Choose appropriate material card name based on solver
    if (state.config.solver === "LS-DYNA") {
      state.config.materialCard = "*MAT_PIECEWISE_LINEAR_PLASTICITY (MAT_024)";
    } else if (state.config.solver === "Abaqus" || state.config.solver === "Abaqus Standard") {
      state.config.materialCard = "*ELASTIC + *PLASTIC";
    } else if (state.config.solver === "Nastran") {
      state.config.materialCard = mat.cardDefault.includes("MAT8") ? "MAT8" : "MAT1";
    } else {
      state.config.materialCard = "MAT1 (Isotropic Elastic)";
    }

    if (DOM.matDensityInput) DOM.matDensityInput.value = state.config.matDensity;
    if (DOM.matEInput) DOM.matEInput.value = state.config.matE;
    if (DOM.matNuInput) DOM.matNuInput.value = state.config.matNu;
    if (DOM.materialCardInput) DOM.materialCardInput.value = state.config.materialCard;

    updateMaterialHelpers();
    recompileCode();
    showToast(`✓ Loaded Material: ${mat.name} (${unitSys.code})`, "success");
  }

  // ==========================================================================
  // Subdomain & Preset Management
  // ==========================================================================

  function renderSubdomainChips() {
    DOM.subdomainChips.innerHTML = "";
    
    const domainShortCodes = {
      crash: "CRSH",
      nvh: "NVH",
      durability: "DUR",
      aero: "AERO",
      thermal_cfd: "CFD",
      topology: "TOPO",
      mbd: "MBD"
    };

    Object.values(CAE_SUBDOMAINS).forEach(sub => {
      const chip = document.createElement("button");
      chip.className = `subdomain-chip ${sub.id === state.subdomain ? "active" : ""}`;
      chip.dataset.subdomain = sub.id;
      
      const code = domainShortCodes[sub.id] || "CAE";
      chip.innerHTML = `
        <div class="subdomain-chip-content">
          <span class="domain-tag">${code}</span>
          <span>${sub.name}</span>
        </div>
        <span style="font-size:0.65rem; color:var(--text-muted);">${sub.defaultSolver}</span>
      `;

      chip.addEventListener("click", () => {
        selectSubdomain(sub.id);
      });
      DOM.subdomainChips.appendChild(chip);
    });
  }

  function selectSubdomain(subId) {
    state.subdomain = subId;
    state.config.subdomain = subId;
    
    const subData = CAE_SUBDOMAINS[subId];
    if (subData) {
      state.config.solver = subData.defaultSolver;
      
      // Match unit system ID
      if (subId === "crash") state.config.unitSystem = "mm_ms_kg_kN";
      else if (subId === "thermal_cfd") state.config.unitSystem = "m_kg_s_N";
      else if (subId === "aero") state.config.unitSystem = "mm_t_s_N";
      else state.config.unitSystem = "mm_t_s_N";

      state.config.elemType = subData.elemType;
      state.config.elemOrder = subData.elemOrder;
      state.config.targetElemSize = subData.targetElemSize;
      state.config.minElemSize = subData.minElemSize;
      state.config.maxElemSize = subData.maxElemSize;
      state.config.washerRings = subData.washerRings;
      state.config.washerOffset = subData.washerOffset;
      state.config.washerHoleMin = subData.holeMinDia;
      state.config.washerHoleMax = subData.holeMaxDia;
      
      // Update criteria
      state.config.warpageLimit = subData.qualityCriteria.warpage;
      state.config.aspectLimit = subData.qualityCriteria.aspectRatio;
      state.config.jacobianLimit = subData.qualityCriteria.jacobian;
      state.config.skewLimit = subData.qualityCriteria.skew;
      state.config.minTimestep = subData.qualityCriteria.minTimestep;
      
      state.config.materialCard = subData.defaultMaterial.card;
      state.config.propCard = subData.defaultProperty.card;
      state.config.connectorType = subData.connectorType;

      if (subData.defaultMaterial.density) {
        state.config.matDensity = subData.defaultMaterial.density.toString();
      }
      if (subData.defaultMaterial.youngsModulus) {
        state.config.matE = subData.defaultMaterial.youngsModulus.toString();
      }
      if (subData.defaultMaterial.poissonsRatio) {
        state.config.matNu = subData.defaultMaterial.poissonsRatio.toString();
      }

      if (subData.elemType === "solid_tet") {
        state.config.meshType = "3d_solid_tet";
        state.config.extractMidsurface = false;
      } else {
        state.config.meshType = "2d_shell";
        state.config.extractMidsurface = true;
      }
    }

    // Refresh active chips
    document.querySelectorAll(".subdomain-chip").forEach(c => {
      c.classList.toggle("active", c.dataset.subdomain === subId);
    });

    updateUIFromState();
    recompileCode();
    showToast(`Domain: ${subData.name}`, "success");
  }

  function populatePresetsDropdown() {
    const allPresets = PresetManager.getAllPresets();
    DOM.presetSelect.innerHTML = `<option value="" disabled selected>⚡ Load CAE Preset...</option>`;
    
    const categories = {};
    Object.values(allPresets).forEach(p => {
      const cat = p.category || "General";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(p);
    });

    for (const [catName, list] of Object.entries(categories)) {
      const optGroup = document.createElement("optgroup");
      optGroup.label = catName;
      list.forEach(preset => {
        const opt = document.createElement("option");
        opt.value = preset.id;
        opt.textContent = preset.name;
        optGroup.appendChild(opt);
      });
      DOM.presetSelect.appendChild(optGroup);
    }
  }

  function loadPreset(presetId) {
    const allPresets = PresetManager.getAllPresets();
    const preset = allPresets[presetId];
    if (!preset) return;

    state.subdomain = preset.subdomain || "crash";
    Object.assign(state.config, preset);

    // Normalize unit system format
    if (preset.unitSystem) {
      if (preset.unitSystem.includes("mm-ms-kg")) state.config.unitSystem = "mm_ms_kg_kN";
      else if (preset.unitSystem.includes("m-kg-s")) state.config.unitSystem = "m_kg_s_N";
      else if (preset.unitSystem.includes("in-lb")) state.config.unitSystem = "in_lb_s_lbf";
      else if (preset.unitSystem.includes("mm-kg-s")) state.config.unitSystem = "mm_kg_s_mN";
      else if (!CAE_UNIT_SYSTEMS[preset.unitSystem] && preset.unitSystem !== "custom") state.config.unitSystem = "mm_t_s_N";
    }
    
    document.querySelectorAll(".subdomain-chip").forEach(c => {
      c.classList.toggle("active", c.dataset.subdomain === state.subdomain);
    });

    updateUIFromState();
    recompileCode();
  }

  // ==========================================================================
  // Form Binding & Reactivity
  // ==========================================================================

  function bindFormEvents() {
    DOM.presetSelect.addEventListener("change", (e) => {
      if (e.target.value) {
        loadPreset(e.target.value);
        showToast(`Preset: ${DOM.presetSelect.options[DOM.presetSelect.selectedIndex].text}`, "success");
      }
    });

    // Material Library Selector
    if (DOM.materialLibrarySelect) {
      DOM.materialLibrarySelect.addEventListener("change", (e) => {
        if (e.target.value) {
          applyMaterialFromLibrary(e.target.value);
        }
      });
    }

    // Unit System Selector
    if (DOM.unitSystemInput) {
      DOM.unitSystemInput.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "custom") {
          DOM.unitModal.classList.add("active");
        } else {
          state.config.unitSystem = val;
          updateUnitBadges();
          updateMaterialHelpers();
          recompileCode();
          showToast(`Unit System: ${getActiveUnitSystem().code}`, "info");
        }
      });
    }

    // Custom Units Button
    if (DOM.btnOpenCustomUnits) {
      DOM.btnOpenCustomUnits.addEventListener("click", () => {
        DOM.unitModal.classList.add("active");
      });
    }

    document.querySelectorAll("[data-bind]").forEach(input => {
      const key = input.dataset.bind;
      
      if (input.type === "checkbox") {
        input.addEventListener("change", (e) => {
          state.config[key] = e.target.checked;
          syncProcToggles();
          updateQualityGauge();
          recompileCode();
        });
      } else if (input.type === "range" || input.type === "number") {
        input.addEventListener("input", (e) => {
          state.config[key] = parseFloat(e.target.value) || e.target.value;
          
          const valLabel = document.getElementById(`${input.id}_val`);
          if (valLabel) {
            valLabel.textContent = input.value;
          }
          
          if (key === "matDensity" || key === "matE") {
            updateMaterialHelpers();
          }

          updateQualityGauge();
          recompileCode();
        });
      } else {
        input.addEventListener("input", (e) => {
          state.config[key] = e.target.value;
          
          if (key === "matDensity" || key === "matE") {
            updateMaterialHelpers();
          }

          updateQualityGauge();
          recompileCode();
        });
      }
    });

    document.querySelectorAll("[data-proc-toggle]").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const procName = e.target.dataset.procToggle;
        state.enabledProcs[procName] = e.target.checked;
        recompileCode();
      });
    });
  }

  function syncProcToggles() {
    const chkMidsurf = document.querySelector('[data-proc-toggle="proc_midsurf"]');
    if (chkMidsurf) chkMidsurf.checked = state.config.extractMidsurface;
    
    const chkQuality = document.querySelector('[data-proc-toggle="proc_quality"]');
    if (chkQuality) chkQuality.checked = state.config.cleanQuality;

    const chkConn = document.querySelector('[data-proc-toggle="proc_connectors"]');
    if (chkConn) chkConn.checked = state.config.createConnectors;

    const chkProps = document.querySelector('[data-proc-toggle="proc_props"]');
    if (chkProps) chkProps.checked = state.config.assignProps;
  }

  function updateUIFromState() {
    document.querySelectorAll("[data-bind]").forEach(input => {
      const key = input.dataset.bind;
      if (state.config[key] !== undefined) {
        if (input.type === "checkbox") {
          input.checked = !!state.config[key];
        } else {
          input.value = state.config[key];
          const valLabel = document.getElementById(`${input.id}_val`);
          if (valLabel) {
            valLabel.textContent = input.value;
          }
        }
      }
    });

    const subData = CAE_SUBDOMAINS[state.subdomain];
    const solverSelect = document.getElementById("solverSelect");
    if (solverSelect && subData) {
      solverSelect.innerHTML = "";
      subData.solvers.forEach(sol => {
        const opt = document.createElement("option");
        opt.value = sol;
        opt.textContent = sol;
        if (sol === state.config.solver) opt.selected = true;
        solverSelect.appendChild(opt);
      });
    }

    // Update Ribbon Context Tags
    if (DOM.lblActiveDomain && subData) DOM.lblActiveDomain.textContent = subData.name;
    if (DOM.lblActiveSolver) DOM.lblActiveSolver.textContent = state.config.solver;

    updateUnitBadges();
    updateMaterialHelpers();
    syncProcToggles();
    updateQualityGauge();
  }

  // ==========================================================================
  // Quality Compliance Visualizer
  // ==========================================================================

  function updateQualityGauge() {
    const warpage = parseFloat(state.config.warpageLimit) || 15.0;
    const aspect = parseFloat(state.config.aspectLimit) || 5.0;
    const jacobian = parseFloat(state.config.jacobianLimit) || 0.60;
    const skew = parseFloat(state.config.skewLimit) || 50.0;
    const minTimestep = parseFloat(state.config.minTimestep) || 0.0;

    if (DOM.metricWarpage) DOM.metricWarpage.textContent = `< ${warpage}°`;
    if (DOM.metricAspect) DOM.metricAspect.textContent = `< ${aspect}`;
    if (DOM.metricJacobian) DOM.metricJacobian.textContent = `> ${jacobian}`;
    if (DOM.metricSkew) DOM.metricSkew.textContent = `< ${skew}°`;
    if (DOM.metricTimestep) DOM.metricTimestep.textContent = minTimestep > 0 ? `${(minTimestep * 1e6).toFixed(2)} µs` : "N/A";

    let score = 50;
    if (warpage <= 8) score += 15;
    else if (warpage <= 12) score += 8;
    
    if (aspect <= 3.0) score += 15;
    else if (aspect <= 4.0) score += 8;

    if (jacobian >= 0.75) score += 15;
    else if (jacobian >= 0.65) score += 8;

    if (skew <= 35) score += 10;
    else if (skew <= 45) score += 5;

    score = Math.min(100, Math.max(30, score));

    if (DOM.gaugeScore) {
      if (score >= 85) {
        DOM.gaugeScore.textContent = `${score}% PASS`;
        DOM.gaugeScore.style.color = "var(--status-pass)";
        DOM.gaugeScore.style.background = "var(--status-pass-bg)";
      } else if (score >= 65) {
        DOM.gaugeScore.textContent = `${score}% WARN`;
        DOM.gaugeScore.style.color = "var(--status-warn)";
        DOM.gaugeScore.style.background = "var(--status-warn-bg)";
      } else {
        DOM.gaugeScore.textContent = `${score}% FAIL`;
        DOM.gaugeScore.style.color = "var(--status-fail)";
        DOM.gaugeScore.style.background = "var(--status-fail-bg)";
      }
    }

    if (DOM.gaugeFill) {
      DOM.gaugeFill.style.width = `${score}%`;
      if (score >= 85) {
        DOM.gaugeFill.style.background = "var(--status-pass)";
      } else if (score >= 65) {
        DOM.gaugeFill.style.background = "var(--status-warn)";
      } else {
        DOM.gaugeFill.style.background = "var(--status-fail)";
      }
    }
  }

  // ==========================================================================
  // Code Generation & Highlighting
  // ==========================================================================

  function recompileCode() {
    let generatedRaw = "";

    if (state.viewMode === "batch_bat") {
      const batchScripts = TclTemplateEngine.generateBatchRunner("hm_auto_run.tcl");
      generatedRaw = batchScripts.windowsBat;
    } else if (state.viewMode === "batch_sh") {
      const batchScripts = TclTemplateEngine.generateBatchRunner("hm_auto_run.tcl");
      generatedRaw = batchScripts.linuxSh;
    } else if (state.viewMode === "procs_only") {
      const procsOnlyToggles = { ...state.enabledProcs, proc_main: false };
      generatedRaw = TclTemplateEngine.generateScript(state.config, procsOnlyToggles);
    } else {
      generatedRaw = TclTemplateEngine.generateScript(state.config, state.enabledProcs);
    }

    renderHighlightedCode(generatedRaw);
  }

  function renderHighlightedCode(rawCode) {
    const lines = rawCode.split("\n");
    
    // Line Numbers
    let lineNumHtml = "";
    for (let i = 1; i <= lines.length; i++) {
      lineNumHtml += `${i}\n`;
    }
    DOM.lineNumbers.textContent = lineNumHtml;

    // Syntax Highlighting
    const highlightedHtml = highlightTclSyntax(rawCode);
    DOM.codeOutput.innerHTML = highlightedHtml;

    // Code Stats
    const charCount = rawCode.length;
    const procCount = (rawCode.match(/proc\s+/g) || []).length;
    DOM.codeStats.textContent = `${lines.length} lines | ${procCount} procs | ${(charCount / 1024).toFixed(1)} KB`;
  }

  function highlightTclSyntax(code) {
    const lines = code.split("\n");
    const highlightedLines = lines.map(line => {
      // 1. Comment line
      if (/^\s*#/.test(line)) {
        const escaped = escapeHtml(line);
        return `<span class="syn-comment">${escaped}</span>`;
      }

      let lineHtml = escapeHtml(line);
      const strings = [];

      // 2. Protect strings
      lineHtml = lineHtml.replace(/"([^"\\]|\\.)*"/g, (match) => {
        const idx = strings.length;
        strings.push(match);
        return `___STR_${idx}___`;
      });

      // 3. Procs
      lineHtml = lineHtml.replace(/\b(proc)\s+([a-zA-Z0-9_:]+)/g, '<span class="syn-keyword">$1</span> <span class="syn-proc">$2</span>');

      // 4. Keywords
      lineHtml = lineHtml.replace(/\b(if|else|elseif|for|foreach|while|catch|return|set|expr|incr|break|continue|namespace|eval|variable|package|require|ne|eq)\b/g, '<span class="syn-keyword">$1</span>');

      // 5. HyperMesh commands (*cmd)
      lineHtml = lineHtml.replace(/(\*[a-zA-Z0-9_]+)/g, '<span class="syn-cmd">$1</span>');

      // 6. HyperMesh hm_ get commands
      lineHtml = lineHtml.replace(/\b(hm_[a-zA-Z0-9_]+)\b/g, '<span class="syn-proc">$1</span>');

      // 7. Variables ($var)
      lineHtml = lineHtml.replace(/(\$[a-zA-Z0-9_:]+)/g, '<span class="syn-var">$1</span>');

      // 8. Restore strings
      lineHtml = lineHtml.replace(/___STR_(\d+)___/g, (_, idx) => {
        return `<span class="syn-string">${strings[parseInt(idx)]}</span>`;
      });

      return lineHtml;
    });

    return highlightedLines.join("\n");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ==========================================================================
  // Navigation & View Modes
  // ==========================================================================

  function bindNavEvents() {
    DOM.navTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        DOM.navTabs.forEach(t => t.classList.remove("active"));
        DOM.tabSections.forEach(s => s.classList.remove("active"));
        
        tab.classList.add("active");
        state.activeTab = tab.dataset.tab;
        
        const targetSection = document.getElementById(`tab_${state.activeTab}`);
        if (targetSection) targetSection.classList.add("active");
      });
    });

    DOM.viewModeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        DOM.viewModeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.viewMode = btn.dataset.mode;
        recompileCode();
      });
    });

    // Copy to Clipboard
    DOM.btnCopy.addEventListener("click", () => {
      const codeText = DOM.codeOutput.textContent;
      navigator.clipboard.writeText(codeText).then(() => {
        showToast("✓ Tcl Script copied to clipboard", "success");
      }).catch(() => {
        showToast("Error copying to clipboard", "error");
      });
    });

    // Download .tcl
    DOM.btnDownloadTcl.addEventListener("click", () => {
      const codeText = DOM.codeOutput.textContent;
      const blob = new Blob([codeText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hm_${state.config.subdomain}_automation.tcl`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`📥 Exported: hm_${state.config.subdomain}_automation.tcl`, "success");
    });

    // Batch Runner Dialog Trigger
    DOM.btnBatchRunner.addEventListener("click", () => {
      const batchScripts = TclTemplateEngine.generateBatchRunner(`hm_${state.config.subdomain}_automation.tcl`);
      DOM.batchScriptPre.textContent = batchScripts.windowsBat;
      DOM.batchModal.classList.add("active");
    });
  }

  // ==========================================================================
  // Custom CAE Unit Builder Modal Logic
  // ==========================================================================

  function initCustomUnitsModal() {
    // Quick Template buttons inside modal
    document.querySelectorAll(".btn-unit-preset").forEach(btn => {
      btn.addEventListener("click", () => {
        const presetKey = btn.dataset.preset;
        applyUnitPresetToModal(presetKey);
      });
    });

    // Inputs inside Custom Unit Modal trigger consistency verification
    [
      DOM.customUnitLength,
      DOM.customUnitMass,
      DOM.customUnitTime,
      DOM.customUnitForce,
      DOM.customUnitStress,
      DOM.customUnitDensity,
      DOM.customUnitEnergy,
      DOM.customUnitGravity
    ].forEach(input => {
      if (input) {
        input.addEventListener("change", checkUnitConsistency);
      }
    });

    // Close & Cancel buttons
    if (DOM.unitModalClose) {
      DOM.unitModalClose.addEventListener("click", () => {
        DOM.unitModal.classList.remove("active");
      });
    }
    if (DOM.btnCancelCustomUnits) {
      DOM.btnCancelCustomUnits.addEventListener("click", () => {
        DOM.unitModal.classList.remove("active");
      });
    }

    // Apply Button
    if (DOM.btnApplyCustomUnits) {
      DOM.btnApplyCustomUnits.addEventListener("click", () => {
        state.customUnits = {
          length: DOM.customUnitLength.value,
          mass: DOM.customUnitMass.value,
          time: DOM.customUnitTime.value,
          force: DOM.customUnitForce.value,
          stress: DOM.customUnitStress.value,
          modulus: DOM.customUnitStress.value,
          density: DOM.customUnitDensity.value,
          energy: DOM.customUnitEnergy.value,
          gravity: DOM.customUnitGravity.value
        };

        state.config.unitSystem = "custom";
        if (DOM.unitSystemInput) DOM.unitSystemInput.value = "custom";

        updateUnitBadges();
        updateMaterialHelpers();
        recompileCode();
        DOM.unitModal.classList.remove("active");
        showToast("✓ Custom CAE Unit System applied to session", "success");
      });
    }

    // Initial check
    checkUnitConsistency();
  }

  function applyUnitPresetToModal(presetKey) {
    const sys = CAE_UNIT_SYSTEMS[presetKey];
    if (!sys) return;

    if (DOM.customUnitLength) DOM.customUnitLength.value = sys.length;
    if (DOM.customUnitMass) DOM.customUnitMass.value = sys.mass;
    if (DOM.customUnitTime) DOM.customUnitTime.value = sys.time;
    if (DOM.customUnitForce) DOM.customUnitForce.value = sys.force;
    if (DOM.customUnitStress) DOM.customUnitStress.value = sys.stress;
    if (DOM.customUnitDensity) DOM.customUnitDensity.value = sys.density;
    if (DOM.customUnitEnergy) DOM.customUnitEnergy.value = sys.energy;
    if (DOM.customUnitGravity) DOM.customUnitGravity.value = sys.gravity;

    checkUnitConsistency();
  }

  function checkUnitConsistency() {
    if (!DOM.unitConsistencyBox) return;

    const L = DOM.customUnitLength.value;
    const M = DOM.customUnitMass.value;
    const T = DOM.customUnitTime.value;
    const F = DOM.customUnitForce.value;
    const S = DOM.customUnitStress.value;

    let isConsistent = false;
    let explanation = "";

    // Consistency condition: 1 Force = 1 Mass * 1 Accel = 1 Mass * 1 Length / Time^2
    // 1. mm, t, s -> F = t * mm/s^2 = (1000 kg) * (0.001 m)/s^2 = 1 kg*m/s^2 = 1 N. S = N/mm^2 = 1 MPa.
    if (L === "mm" && M === "t" && T === "s" && F === "N" && S === "MPa") {
      isConsistent = true;
      explanation = "1 Force (N) = 1 Mass (t) × 1 Accel (mm/s²). Stress = N/mm² = 1 MPa. 100% FEA Consistent!";
    }
    // 2. mm, kg, ms -> F = kg * mm/ms^2 = (1 kg) * (0.001 m)/(1e-6 s^2) = 1000 N = 1 kN. S = kN/mm^2 = 1 GPa.
    else if (L === "mm" && M === "kg" && T === "ms" && F === "kN" && S === "GPa") {
      isConsistent = true;
      explanation = "1 Force (kN) = 1 Mass (kg) × 1 Accel (mm/ms²). Stress = kN/mm² = 1 GPa. 100% Explicit Consistent!";
    }
    // 3. m, kg, s -> F = kg * m/s^2 = 1 N. S = N/m^2 = 1 Pa.
    else if (L === "m" && M === "kg" && T === "s" && F === "N" && S === "Pa") {
      isConsistent = true;
      explanation = "1 Force (N) = 1 Mass (kg) × 1 Accel (m/s²). Stress = N/m² = 1 Pa. 100% Standard SI Consistent!";
    }
    // 4. in, slinch, s -> F = slinch * in/s^2 = 1 lbf. S = lbf/in^2 = 1 psi.
    else if (L === "in" && M === "slinch" && T === "s" && F === "lbf" && S === "psi") {
      isConsistent = true;
      explanation = "1 Force (lbf) = 1 Mass (slinch) × 1 Accel (in/s²). Stress = lbf/in² = 1 psi. 100% US Aero Consistent!";
    }
    // 5. mm, kg, s, mN, kPa
    else if (L === "mm" && M === "kg" && T === "s" && F === "mN" && S === "kPa") {
      isConsistent = true;
      explanation = "1 Force (mN) = 1 Mass (kg) × 1 Accel (mm/s²). Stress = mN/mm² = 1 kPa. 100% Micro-mechanics Consistent!";
    }
    else {
      isConsistent = false;
      explanation = `Custom combination: Force [${F}] vs derived (Mass [${M}] × Length [${L}] / Time [${T}]²). Ensure your solver material and load inputs include the appropriate numerical conversion multiplier.`;
    }

    if (isConsistent) {
      DOM.unitConsistencyBox.className = "unit-consistency-card";
      DOM.unitConsistencyIcon.textContent = "✅";
      DOM.unitConsistencyTitle.textContent = "FEA Consistent Unit Set (Newton's 2nd Law Satisfied)";
      DOM.unitConsistencyDesc.textContent = explanation;
    } else {
      DOM.unitConsistencyBox.className = "unit-consistency-card warning";
      DOM.unitConsistencyIcon.textContent = "⚠️";
      DOM.unitConsistencyTitle.textContent = "Custom Non-Standard Unit Set (Scaling Note)";
      DOM.unitConsistencyDesc.textContent = explanation;
    }
  }

  // ==========================================================================
  // Modals & Presets Manager
  // ==========================================================================

  function bindModalEvents() {
    DOM.btnManagePresets.addEventListener("click", () => {
      renderPresetManagerList();
      DOM.presetModal.classList.add("active");
    });

    DOM.presetModalClose.addEventListener("click", () => {
      DOM.presetModal.classList.remove("active");
    });

    DOM.batchModalClose.addEventListener("click", () => {
      DOM.batchModal.classList.remove("active");
    });

    // Save Custom Preset
    DOM.btnSaveNewPreset.addEventListener("click", () => {
      const name = prompt("Enter a name for your custom CAE preset:", `Custom ${state.config.subdomain.toUpperCase()} Setup`);
      if (!name) return;

      const id = "custom_" + Date.now();
      const newPreset = {
        ...state.config,
        id: id,
        name: name,
        category: "Custom User Presets",
        subdomain: state.subdomain
      };

      if (PresetManager.saveCustomPreset(newPreset)) {
        populatePresetsDropdown();
        renderPresetManagerList();
        showToast(`✓ Custom preset '${name}' saved`, "success");
      }
    });

    // Export Presets JSON
    DOM.btnExportPresetsJSON.addEventListener("click", () => {
      PresetManager.exportPresetsJSON();
      showToast("📥 Exported presets JSON file", "success");
    });

    // Import Presets JSON
    DOM.btnImportPresetsJSON.addEventListener("click", () => {
      DOM.fileImportPresets.click();
    });

    DOM.fileImportPresets.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (PresetManager.importPresetsJSON(event.target.result)) {
          populatePresetsDropdown();
          renderPresetManagerList();
          showToast("✓ Custom presets imported successfully", "success");
        } else {
          showToast("Failed to parse presets file", "error");
        }
      };
      reader.readAsText(file);
    });

    // Download .bat runner
    DOM.btnDownloadBatFile.addEventListener("click", () => {
      const text = DOM.batchScriptPre.textContent;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `run_hypermesh_batch.bat`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("📥 Downloaded run_hypermesh_batch.bat", "success");
    });
  }

  function renderPresetManagerList() {
    const allPresets = PresetManager.getAllPresets();
    DOM.presetsListContainer.innerHTML = "";

    Object.values(allPresets).forEach(p => {
      const isBuiltin = !p.id.startsWith("custom_");
      const item = document.createElement("div");
      item.className = "eng-toggle-card";
      item.style.display = "flex";
      item.style.justifyContent = "space-between";
      item.style.alignItems = "center";
      item.style.marginBottom = "0.4rem";

      item.innerHTML = `
        <div>
          <div style="font-weight:600; font-size:0.8rem;">${p.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">${p.category || 'Standard'} | Target: ${p.targetElemSize}mm | Solver: ${p.solver}</div>
        </div>
        <div style="display:flex; gap:0.35rem;">
          <button class="btn btn-sm btn-secondary btn-load-preset" data-id="${p.id}">Load</button>
          ${!isBuiltin ? `<button class="btn btn-sm btn-outline btn-delete-preset" data-id="${p.id}" style="color:var(--status-fail); border-color:var(--status-fail);">Delete</button>` : ''}
        </div>
      `;

      item.querySelector(".btn-load-preset").addEventListener("click", () => {
        loadPreset(p.id);
        DOM.presetModal.classList.remove("active");
        showToast(`Loaded: ${p.name}`, "success");
      });

      const btnDel = item.querySelector(".btn-delete-preset");
      if (btnDel) {
        btnDel.addEventListener("click", () => {
          if (confirm(`Delete preset '${p.name}'?`)) {
            PresetManager.deleteCustomPreset(p.id);
            populatePresetsDropdown();
            renderPresetManagerList();
            showToast("Preset deleted", "success");
          }
        });
      }

      DOM.presetsListContainer.appendChild(item);
    });
  }

  // ==========================================================================
  // Toast Notifications
  // ==========================================================================

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // Start Application
  init();
});

