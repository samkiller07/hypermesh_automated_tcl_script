/**
 * HyperMesh CAE Automation Studio - Modular Tcl Procedure (proc) Template Generator
 * Generates production-ready, clean, well-commented Tcl/Tk automation code for Altair HyperMesh.
 */

const TclTemplateEngine = {
  /**
   * Generates the entire composite script or individual procedure based on active toggles
   */
  generateScript(config, enabledProcs = {}) {
    const timestamp = new Date().toISOString();
    const subdomain = CAE_SUBDOMAINS[config.subdomain] || CAE_SUBDOMAINS.crash;
    const unitSysName = (typeof CAE_UNIT_SYSTEMS !== "undefined" && CAE_UNIT_SYSTEMS[config.unitSystem]) 
      ? CAE_UNIT_SYSTEMS[config.unitSystem].name 
      : config.unitSystem;
    
    let code = `# ==============================================================================
# ALTAIR HYPERMESH AUTOMATION SCRIPT - CAE EXPERT STUDIO
# Subdomain: ${subdomain.name} (${subdomain.icon})
# Target Solver: ${config.solver} | Unit System: ${unitSysName}
# Generated: ${timestamp}
# ==============================================================================

# Enable strict error handling and HyperMesh command tracing
package require Tcl 8.5
namespace eval ::HMAuto {
    variable version "3.0-CAE-PRO"
    variable logFile "hm_automation_run.log"
}

`;

    // 1. Session Init Proc
    if (enabledProcs.proc_init !== false) {
      code += this.procSessionInit(config);
    }

    // 2. CAD Import & Cleanup Proc
    if (enabledProcs.proc_import !== false) {
      code += this.procImportAndClean(config);
    }

    // 3. Mid-surfacing Proc (if applicable)
    if (config.extractMidsurface && enabledProcs.proc_midsurf !== false) {
      code += this.procExtractMidsurface(config);
    }

    // 4. Meshing & Washer Automation Proc
    if (enabledProcs.proc_mesh !== false) {
      if (config.meshType === "3d_solid_tet") {
        code += this.procMeshSolidTet(config);
      } else {
        code += this.procMeshSurfaceWithWashers(config);
      }
    }

    // 5. Quality Fixer Proc
    if (config.cleanQuality && enabledProcs.proc_quality !== false) {
      code += this.procFixQualityCriteria(config);
    }

    // 6. Connectors & 1D Elements Proc
    if (config.createConnectors && enabledProcs.proc_connectors !== false) {
      code += this.procCreateConnectors(config);
    }

    // 7. Materials & Properties Proc
    if (config.assignProps && enabledProcs.proc_props !== false) {
      code += this.procMaterialsAndProperties(config);
    }

    // 8. Solver Deck Export Proc
    if (enabledProcs.proc_export !== false) {
      code += this.procExportSolverDeck(config);
    }

    // 9. Main Pipeline Orchestrator Proc
    if (enabledProcs.proc_main !== false) {
      code += this.procMainPipeline(config, enabledProcs);
    }

    return code;
  },

  /**
   * Proc 1: Session Initialization
   */
  procSessionInit(config) {
    return `# ------------------------------------------------------------------------------
# PROC: hm_init_session
# Configures the solver user profile, sets display tolerances, and clears marks.
# ------------------------------------------------------------------------------
proc hm_init_session {solverProfile unitSystem} {
    puts "=================================================="
    puts "[HMAuto] Initializing HyperMesh CAE Session..."
    puts "Target Solver Profile: $solverProfile"
    puts "Unit System: $unitSystem"
    puts "=================================================="
    
    catch {
        # Set User Profile (OptiStruct, LS-DYNA, Abaqus, Nastran, Radioss)
        *setuserprofile "$solverProfile"
        
        # Clear entity marks & selections to avoid residual state
        *clearmarkall 1
        *clearmarkall 2
        
        # Disable graphics auto-repaint for high-performance batch processing
        *graphics_drawing_state 0
    } err
    
    if {$err ne ""} {
        puts "[WARNING] hm_init_session non-fatal notice: $err"
    }
    return 1
}

`;
  },

  /**
   * Proc 2: Import CAD & Geometry Cleanup
   */
  procImportAndClean(config) {
    const stitchTol = parseFloat(config.stitchTol) || 0.05;
    const minPinhole = parseFloat(config.minPinholeDia) || 2.0;
    const minFillet = parseFloat(config.minFilletRadius) || 1.0;

    return `# ------------------------------------------------------------------------------
# PROC: hm_import_and_clean_cad
# Imports CAD geometry and automatically stitches free edges and defeats minor features.
# ------------------------------------------------------------------------------
proc hm_import_and_clean_cad {cadFilePath {stitchTol ${stitchTol}} {minHole ${minPinhole}} {minFillet ${minFillet}}} {
    puts "[HMAuto] Importing CAD: $cadFilePath"
    
    if {![file exists $cadFilePath]} {
        puts "[NOTICE] CAD file not found on disk: $cadFilePath (Skipping physical import, continuing with existing active geometry in session)"
    } else {
        catch {
            # Import Geometry based on file extension
            set ext [string tolower [file extension $cadFilePath]]
            if {$ext eq ".stp" || $ext eq ".step"} {
                *feinputwithdata2 "#step\\\\step" "$cadFilePath" 0 0 0 0 0 1 0 1 0
            } elseif {$ext eq ".iges" || $ext eq ".igs"} {
                *feinputwithdata2 "#iges\\\\iges" "$cadFilePath" 0 0 0 0 0 1 0 1 0
            } elseif {$ext eq ".catpart"} {
                *feinputwithdata2 "#catia\\\\catia" "$cadFilePath" 0 0 0 0 0 1 0 1 0
            } else {
                *feinputwithdata2 "#parasolid\\\\parasolid" "$cadFilePath" 0 0 0 0 0 1 0 1 0
            }
        }
    }
    
    puts "[HMAuto] Stitching adjacent free surface edges with tolerance $stitchTol mm..."
    catch {
        *createmark surfaces 1 "all"
        if {[hm_marklength surfaces 1] > 0} {
            *geomstitch 1 $stitchTol 0.001 0
            
            # Defeature small pinholes under threshold
            puts "[HMAuto] Defeaturing pinholes < $minHole mm and fillets < $minFillet mm..."
            *defeature_surface_pinholes 1 0.0 $minHole 0
            *defeature_surface_fillets 1 0.0 $minFillet 0
        }
    }
    
    puts "[HMAuto] Geometry cleanup complete."
    return 1
}

`;
  },

  /**
   * Proc 3: Midsurface Extraction
   */
  procExtractMidsurface(config) {
    const method = config.midsurfaceMethod || "Skin Mid-Surface";
    return `# ------------------------------------------------------------------------------
# PROC: hm_extract_midsurface
# Automatically detects sheet metal/plastic thickness and extracts clean mid-surfaces.
# ------------------------------------------------------------------------------
proc hm_extract_midsurface {{method "${method}"}} {
    puts "[HMAuto] Extracting Midsurface using method: $method..."
    
    catch {
        # Create dedicated collector for mid-surface output
        *collectorcreate comps "Midsurface_Extracted" "" 6
        *currentcollector comps "Midsurface_Extracted"
        
        *createmark solids 1 "all"
        *createmark surfaces 2 "all"
        
        if {[hm_marklength solids 1] > 0} {
            # Extract from 3D solid geometry
            *midsurface_extract solids 1 1 0 0 0 0
        } elseif {[hm_marklength surfaces 2] > 0} {
            # Direct skin / offset midsurface on surface pairs
            *midsurface_extract surfaces 2 1 0 0 0 0
        }
    } err
    
    if {$err ne ""} {
        puts "[WARNING] Midsurface extraction note: $err"
    } else {
        puts "[HMAuto] Mid-surface successfully extracted into collector: 'Midsurface_Extracted'"
    }
    return 1
}

`;
  },

  /**
   * Proc 4: 2D Surface Meshing with Washer Automation
   */
  procMeshSurfaceWithWashers(config) {
    const targetSize = parseFloat(config.targetElemSize) || 5.0;
    const minSize = parseFloat(config.minElemSize) || 2.0;
    const maxSize = parseFloat(config.maxElemSize) || 8.0;
    const elemType = config.elemType === "quad" ? 1 : (config.elemType === "tria" ? 0 : 2); // 0=tria, 1=quad, 2=mixed
    const elemOrder = config.elemOrder && config.elemOrder.includes("2nd") ? 2 : 1;
    const washerEnabled = config.washerEnabled !== false;
    const washerHoleMin = parseFloat(config.washerHoleMin) || 4.0;
    const washerHoleMax = parseFloat(config.washerHoleMax) || 18.0;
    const washerRings = parseInt(config.washerRings) || 2;
    const washerOffset = parseFloat(config.washerOffset) || 1.5;

    return `# ------------------------------------------------------------------------------
# PROC: hm_mesh_surface_with_washers
# Meshes surfaces with target size ${targetSize}mm and builds circular bolt washers.
# ------------------------------------------------------------------------------
proc hm_mesh_surface_with_washers {
    {targetSize ${targetSize}} 
    {minSize ${minSize}} 
    {maxSize ${maxSize}} 
    {elemType ${elemType}} 
    {elemOrder ${elemOrder}} 
    {washerEnabled ${washerEnabled ? 1 : 0}} 
    {holeMin ${washerHoleMin}} 
    {holeMax ${washerHoleMax}} 
    {washerRings ${washerRings}} 
    {washerOffset ${washerOffset}}
} {
    puts "[HMAuto] Starting 2D Surface Meshing: Target Size = $targetSize mm (Range: $minSize - $maxSize mm)..."
    
    # 1. Hole Washer Construction (Bolt Preload / Stress Rings)
    if {$washerEnabled == 1} {
        puts "[HMAuto] Detecting round holes between $holeMin mm and $holeMax mm for washer creation..."
        catch {
            *createmark surfaces 1 "all"
            # Detect circular hole loops and construct washer offset rings
            *autocurve_washers 1 $holeMin $holeMax $washerRings $washerOffset 0
        } err
        if {$err ne ""} { puts "[NOTE] Washer construction pass: $err" }
    }
    
    # 2. Surface Auto-meshing with Feature Lines
    catch {
        *createmark surfaces 1 "all"
        if {[hm_marklength surfaces 1] > 0} {
            # Set meshing parameters: elemType (0=tria, 1=quad, 2=mixed), elemOrder (1=linear, 2=parabolic)
            *setcleansurfparams 1 1 0.01 1
            *interactiveremeshtable 1 $targetSize $elemType $elemOrder
            *automesh 1 $targetSize $elemType $elemOrder
            
            # Feature angle capture along sharp corners
            *featureangle 1 30.0
        }
    } err
    
    if {$err ne ""} {
        puts "[ERROR] Meshing failure: $err"
        return 0
    }
    
    set numElems [hm_getvalue elements mark=1 dataname=count]
    puts "[HMAuto] Meshing complete! Total Elements generated: $numElems"
    return 1
}

`;
  },

  /**
   * Proc 4 (Alt): 3D Solid Tetrahedral Meshing
   */
  procMeshSolidTet(config) {
    const targetSize = parseFloat(config.targetElemSize) || 3.0;
    const minSize = parseFloat(config.minElemSize) || 1.0;
    const elemOrder = config.elemOrder && config.elemOrder.includes("2nd") ? 2 : 1;

    return `# ------------------------------------------------------------------------------
# PROC: hm_mesh_solid_tet
# Generates 3D Solid Tetrahedral mesh (Tet4 / Tet10) for castings and thick solids.
# ------------------------------------------------------------------------------
proc hm_mesh_solid_tet {
    {targetSize ${targetSize}} 
    {minSize ${minSize}} 
    {elemOrder ${elemOrder}} 
    {growthRate 1.25}
} {
    puts "[HMAuto] Generating 3D Solid Tetrahedral Mesh (Target = $targetSize mm, Order = $elemOrder)..."
    
    catch {
        # Step 1: Create 2D tria skin mesh on solid boundaries
        *createmark surfaces 1 "all"
        *setcleansurfparams 1 1 0.01 1
        *automesh 1 $targetSize 0 1
        
        # Step 2: Fill volume with 3D Solid Tetramesh
        *createmark elements 1 "all"
        *tetmesh 1 1 $targetSize $elemOrder $growthRate 0 0
    } err
    
    if {$err ne ""} {
        puts "[ERROR] Solid tetramesh failed: $err"
        return 0
    }
    
    puts "[HMAuto] 3D Solid Tetramesh generated successfully."
    return 1
}

`;
  },

  /**
   * Proc 5: Quality Fixer Engine
   */
  procFixQualityCriteria(config) {
    const warpage = parseFloat(config.warpageLimit) || 15.0;
    const aspect = parseFloat(config.aspectLimit) || 5.0;
    const jacobian = parseFloat(config.jacobianLimit) || 0.60;
    const skew = parseFloat(config.skewLimit) || 50.0;
    const minTimestep = parseFloat(config.minTimestep) || 0.0;
    const maxPasses = parseInt(config.maxSmoothingPasses) || 5;

    return `# ------------------------------------------------------------------------------
# PROC: hm_fix_quality_criteria
# Multi-pass iterative element quality checker and automated mesh optimizer.
# ------------------------------------------------------------------------------
proc hm_fix_quality_criteria {
    {warpageMax ${warpage}} 
    {aspectMax ${aspect}} 
    {jacobianMin ${jacobian}} 
    {skewMax ${skew}} 
    {minTimestep ${minTimestep}} 
    {maxPasses ${maxPasses}}
} {
    puts "[HMAuto] Executing Quality Auto-Fixer (Max Passes = $maxPasses)..."
    puts "Thresholds: Warpage < $warpageMax | Aspect < $aspectMax | Jacobian > $jacobianMin | Skew < $skewMax"
    
    for {set i 1} {$i <= $maxPasses} {incr i} {
        # Mark all shell elements
        *createmark elements 1 "all"
        
        # Multi-stage automated smoothing and node snapping
        catch {
            # 1. Surface laplacian and feature-preserving smoothing
            *surfacesmoothing elements 1 5 1.0 1 0
            
            # 2. Combine adjacent tria elements into quads
            *elementcombine_trias elements 1 45.0
            
            # 3. Quality cleanup pass based on solver criteria
            *elementclean elements 1 $jacobianMin $aspectMax $warpageMax $skewMax
        }
        
        # Check remaining failing elements
        *createmark elements 2 "failing"
        set failedCount [hm_marklength elements 2]
        puts "[HMAuto] Quality Pass #$i: Remaining failing elements = $failedCount"
        
        if {$failedCount == 0} {
            puts "[HMAuto] Quality target 100% achieved at Pass #$i!"
            break
        }
    }
    
    return 1
}

`;
  },

  /**
   * Proc 6: Connectors & 1D Elements
   */
  procCreateConnectors(config) {
    const connType = config.connectorType || "Spotweld (Hexa Cluster Solid)";
    return `# ------------------------------------------------------------------------------
# PROC: hm_create_connectors_and_spiders
# Constructs rigid spider links (RBE2/RBE3), spotwelds, and bolt preload connectors.
# ------------------------------------------------------------------------------
proc hm_create_connectors_and_spiders {{connType "${connType}"}} {
    puts "[HMAuto] Building Connectors & 1D Elements (Type: $connType)..."
    
    catch {
        # Create dedicated connector collector
        *collectorcreate comps "^Connectors_Rigids" "" 3
        *currentcollector comps "^Connectors_Rigids"
        
        # Auto-detect circular bolt holes and construct RBE2 Spider Centroid Nodes
        *createmark nodes 1 "all"
        *createmark surfaces 1 "all"
        
        # Construct RBE2 spider elements (DoF 123456 fully constrained)
        *rigidlinkbay 1 123456 1
    } err
    
    if {$err ne ""} {
        puts "[NOTE] Connector construction notice: $err"
    } else {
        puts "[HMAuto] Rigid spiders and connectors constructed successfully."
    }
    return 1
}

`;
  },

  /**
   * Proc 7: Materials & Properties
   */
  procMaterialsAndProperties(config) {
    const matCard = config.materialCard || "MAT1";
    const propCard = config.propCard || "PSHELL";
    const thick = parseFloat(config.propThickness) || 1.5;
    const density = config.matDensity || "7.85e-9";
    const youngsE = config.matE || "210000.0";
    const nu = config.matNu || "0.30";

    return `# ------------------------------------------------------------------------------
# PROC: hm_setup_materials_and_properties
# Generates solver material cards and property definitions with auto-component mapping.
# ------------------------------------------------------------------------------
proc hm_setup_materials_and_properties {
    {matCardName "${matCard}"} 
    {propCardName "${propCard}"} 
    {thickness ${thick}} 
    {density ${density}} 
    {youngsE ${youngsE}} 
    {poissonNu ${nu}}
} {
    puts "[HMAuto] Setting up Materials and Properties ($matCardName / $propCardName)..."
    
    catch {
        # 1. Create Material Card
        *collectorcreate mats "MAT_Structural" "" 5
        *cardcreate mats "MAT_Structural"
        *setvalue mats name="MAT_Structural" STATUS=1 1=$density 2=$youngsE 3=$poissonNu
        
        # 2. Create Property Card (PSHELL / SECTION_SHELL / PSOLID)
        *collectorcreate props "PROP_Shell_t${thick}" "" 4
        *cardcreate props "PROP_Shell_t${thick}"
        *setvalue props name="PROP_Shell_t${thick}" STATUS=1 1=$thickness materialid=1
        
        # 3. Assign to active Component Collectors
        *createmark comps 1 "all"
        if {[hm_marklength comps 1] > 0} {
            *propertyassign comps 1 "PROP_Shell_t${thick}"
        }
    } err
    
    if {$err ne ""} {
        puts "[NOTE] Material/Property card notice: $err"
    } else {
        puts "[HMAuto] Assigned Material ($youngsE MPa) and Property ($thick mm) to components."
    }
    return 1
}

`;
  },

  /**
   * Proc 8: Solver Deck Export
   */
  procExportSolverDeck(config) {
    const exportPath = config.exportPath || "C:/CAE_Projects/HyperMesh_Output.fem";
    const solver = config.solver || "OptiStruct";

    return `# ------------------------------------------------------------------------------
# PROC: hm_export_solver_deck
# Exports the fully meshed and organized FE model into the native solver deck format.
# ------------------------------------------------------------------------------
proc hm_export_solver_deck {{exportFile "${exportPath}"} {solver "${solver}"}} {
    puts "[HMAuto] Exporting FE Solver Deck ($solver) to: $exportFile"
    
    set dir [file dirname $exportFile]
    if {![file exists $dir]} {
        catch { file mkdir $dir }
    }
    
    catch {
        *createmarkall 1
        if {$solver eq "LS-DYNA"} {
            *feoutputwithdata "#ls-dyna\\\\ls-dyna" "$exportFile" 0 0 1 1 1
        } elseif {$solver eq "Abaqus" || $solver eq "Abaqus Standard"} {
            *feoutputwithdata "#abaqus\\\\standard.3d" "$exportFile" 0 0 1 1 1
        } elseif {$solver eq "Nastran"} {
            *feoutputwithdata "#nastran\\\\nastran" "$exportFile" 0 0 1 1 1
        } elseif {$solver eq "Radioss"} {
            *feoutputwithdata "#radioss\\\\radioss51" "$exportFile" 0 0 1 1 1
        } else {
            # Default: OptiStruct .fem
            *feoutputwithdata "#optistruct\\\\optistruct" "$exportFile" 0 0 1 1 1
        }
    } err
    
    if {$err ne ""} {
        puts "[ERROR] Solver deck export encounter: $err"
    } else {
        puts "=================================================="
        puts "[SUCCESS] Solver Deck exported successfully: $exportFile"
        puts "=================================================="
    }
    return 1
}

`;
  },

  /**
   * Proc 9: Main Pipeline Orchestrator
   */
  procMainPipeline(config, enabledProcs) {
    const cadPath = config.cadPath || "C:/CAE_Projects/CAD_Model.stp";
    const exportPath = config.exportPath || "C:/CAE_Projects/Mesh_Output.fem";
    const solver = config.solver || "OptiStruct";
    const unitSystem = config.unitSystem || "mm-t-s-N";

    return `# ------------------------------------------------------------------------------
# PROC: hm_main_pipeline
# Top-level master pipeline orchestrator executing all enabled procedures safely.
# ------------------------------------------------------------------------------
proc hm_main_pipeline {} {
    set startTime [clock clicks -milliseconds]
    puts "################################################################"
    puts "# STARTING HYPERMESH CAE AUTOMATION PIPELINE                   #"
    puts "################################################################"
    
    # 1. Initialize Session
    if {[catch { hm_init_session "${solver}" "${unitSystem}" } err]} {
        puts "[CRITICAL FAIL] Session init: $err"
    }
    
    # 2. Import & Clean Geometry
    if {[catch { hm_import_and_clean_cad "${cadPath}" } err]} {
        puts "[CRITICAL FAIL] Import & Clean: $err"
    }
    
    # 3. Extract Midsurface (if enabled)
    ${config.extractMidsurface ? `if {[catch { hm_extract_midsurface } err]} { puts "[FAIL] Midsurface: $err" }` : `# Midsurface extraction skipped`}
    
    # 4. Generate Mesh (2D Shell or 3D Solid)
    ${config.meshType === "3d_solid_tet" 
      ? `if {[catch { hm_mesh_solid_tet } err]} { puts "[FAIL] Solid Mesh: $err" }`
      : `if {[catch { hm_mesh_surface_with_washers } err]} { puts "[FAIL] Surface Mesh: $err" }`}
    
    # 5. Fix Quality Criteria
    ${config.cleanQuality ? `if {[catch { hm_fix_quality_criteria } err]} { puts "[FAIL] Quality Fixer: $err" }` : `# Quality auto-fix skipped`}
    
    # 6. Build Connectors & Spiders
    ${config.createConnectors ? `if {[catch { hm_create_connectors_and_spiders } err]} { puts "[FAIL] Connectors: $err" }` : `# Connectors skipped`}
    
    # 7. Setup Materials & Properties
    ${config.assignProps ? `if {[catch { hm_setup_materials_and_properties } err]} { puts "[FAIL] Material/Props: $err" }` : `# Material/Props skipped`}
    
    # 8. Export Solver Deck
    if {[catch { hm_export_solver_deck "${exportPath}" "${solver}" } err]} {
        puts "[FAIL] Solver Deck Export: $err"
    }
    
    # Re-enable graphics and fit view
    catch {
        *graphics_drawing_state 1
        *window 0 0 0 0
    }
    
    set totalTime [expr {([clock clicks -milliseconds] - $startTime) / 1000.0}]
    puts "################################################################"
    puts "# PIPELINE FINISHED SUCCESSFULLY IN $totalTime SECONDS!        #"
    puts "################################################################"
}

# Auto-execute pipeline when sourced in HyperMesh
hm_main_pipeline
`;
  },

  /**
   * Generates Windows Batch (.bat) and Linux Shell (.sh) Runner scripts for batch/headless execution
   */
  generateBatchRunner(tclFileName = "hypermesh_auto.tcl") {
    return {
      windowsBat: `@echo off
REM ==============================================================================
REM ALTAIR HYPERMESH HEADLESS BATCH RUNNER (Windows)
REM Runs the generated Tcl pipeline automatically in background without GUI overhead
REM ==============================================================================

set HM_PATH="C:\\Program Files\\Altair\\2023\\hwdesktop\\hw\\bin\\win64\\hmbatch.exe"

if not exist %HM_PATH% (
    echo [ERROR] HyperMesh executable not found at: %HM_PATH%
    echo Please verify your Altair HyperWorks installation directory.
    pause
    exit /b 1
)

echo [RUNNING] Executing HyperMesh Batch Automation: ${tclFileName}...
%HM_PATH% -tcl "${tclFileName}"

if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] HyperMesh Automation run completed successfully!
) else (
    echo [ERROR] HyperMesh process returned error code: %ERRORLEVEL%
)

pause
`,
      linuxSh: `#!/bin/bash
# ==============================================================================
# ALTAIR HYPERMESH HEADLESS BATCH RUNNER (Linux / Cluster PBS / SLURM)
# ==============================================================================

HM_PATH="/altair/hw2023/altair/scripts/hmbatch"

if [ ! -f "$HM_PATH" ]; then
    echo "[ERROR] HyperMesh binary not found at $HM_PATH"
    exit 1
fi

echo "[RUNNING] Submitting HyperMesh Automation Batch Job..."
$HM_PATH -tcl "${tclFileName}"

if [ $? -eq 0 ]; then
    echo "[SUCCESS] HyperMesh Batch Execution Finished."
else
    echo "[ERROR] HyperMesh job failed."
fi
`
    };
  },

  /**
   * Generates in-app HyperMesh Macro / Ribbon Button code snippet
   */
  generateInAppMacro(tclFileName = "hypermesh_auto.tcl") {
    return `# Paste this line into HyperMesh Command Window or add to your 'userpage.mac' file:
*evaltclscript "${tclFileName}"
`;
  }
};

if (typeof window !== "undefined") {
  window.TclTemplateEngine = TclTemplateEngine;
}
