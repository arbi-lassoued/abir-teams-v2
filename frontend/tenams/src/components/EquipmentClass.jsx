const EquipmentClass = { "Rotating Equipment": [
    { code: "PUMP-CENT", description: "Centrifugal Pump" },
    { code: "PUMP-POS", description: "Positive Displacement Pump" },
    { code: "PUMP-GEAR", description: "Gear Pump" },
    { code: "PUMP-DIA", description: "Diaphragm Pump" },
    { code: "PUMP-SCREW", description: "Screw Pump" },
    { code: "PUMP-LOBE", description: "Lobe Pump" },
    { code: "PUMP-PER", description: "Peristaltic Pump" },
    { code: "PUMP-VAC", description: "Vacuum Pump" },

    { code: "COMP-REC", description: "Reciprocating Compressor" },
    { code: "COMP-CENT", description: "Centrifugal Compressor" },
    { code: "COMP-AXI", description: "Axial Compressor" },
    { code: "COMP-SCREW", description: "Screw Compressor" },
    { code: "COMP-ROOT", description: "Roots Blower" },

    { code: "TURB-GAS", description: "Gas Turbine" },
    { code: "TURB-STM", description: "Steam Turbine" },
    { code: "TURB-HYD", description: "Hydraulic Turbine" },

    { code: "MOT-AC", description: "AC Induction Motor" },
    { code: "MOT-DC", description: "DC Motor" },
    { code: "MOT-SYN", description: "Synchronous Motor" },
    { code: "MOT-SER", description: "Servo Motor" },

    { code: "FAN-AXI", description: "Axial Fan" },
    { code: "FAN-CENT", description: "Centrifugal Fan" },
    { code: "FAN-ROOF", description: "Roof Ventilator" },
    { code: "FAN-BLOW", description: "Blower" },

    { code: "AGIT-PROP", description: "Propeller Mixer" },
    { code: "AGIT-TURB", description: "Turbine Mixer" },
    { code: "AGIT-PADD", description: "Paddle Mixer" },

    { code: "GEAR-SPUR", description: "Spur Gearbox" },
    { code: "GEAR-HEL", description: "Helical Gearbox" },
    { code: "GEAR-WORM", description: "Worm Gearbox" },
    { code: "GEAR-PLAN", description: "Planetary Gearbox" }
  ],

  "Static Equipment": [
    { code: "VES-SEP", description: "Separator Vessel" },
    { code: "VES-DRUM", description: "Drum" },
    { code: "VES-ACC", description: "Accumulator" },
    { code: "VES-SUR", description: "Surge Vessel" },

    { code: "HEX-ST", description: "Shell and Tube Heat Exchanger" },
    { code: "HEX-PLT", description: "Plate Heat Exchanger" },
    { code: "HEX-AIR", description: "Air-Cooled Heat Exchanger" },
    { code: "HEX-SPR", description: "Spiral Heat Exchanger" },

    { code: "BOIL-STM", description: "Steam Boiler" },
    { code: "BOIL-HW", description: "Hot Water Boiler" },
    { code: "FURN-IND", description: "Industrial Furnace" },

    { code: "TANK-ATM", description: "Atmospheric Tank" },
    { code: "TANK-PRES", description: "Pressurized Tank" },
    { code: "TANK-CRYO", description: "Cryogenic Tank" },

    { code: "COL-DIST", description: "Distillation Column" },
    { code: "COL-ABS", description: "Absorber" },
    { code: "COL-REAC", description: "Reactor" },

    { code: "FILT-MECH", description: "Mechanical Filter" },
    { code: "FILT-CART", description: "Cartridge Filter" },
    { code: "FILT-BAG", description: "Bag Filter" },
    { code: "SEP-CYC", description: "Cyclone Separator" },

    { code: "STR-BASE", description: "Base Frame" },
    { code: "STR-SUP", description: "Support Structure" },
    { code: "STR-SKID", description: "Equipment Skid" }
  ],

  "Electrical Equipment": [
    { code: "TRF-DIST", description: "Distribution Transformer" },
    { code: "TRF-POW", description: "Power Transformer" },
    { code: "TRF-INS", description: "Instrument Transformer" },

    { code: "SWG-LV", description: "Low Voltage Switchgear" },
    { code: "SWG-MV", description: "Medium Voltage Switchgear" },
    { code: "SWG-HV", description: "High Voltage Switchgear" },

    { code: "GEN-DIE", description: "Diesel Generator" },
    { code: "GEN-GAS", description: "Gas Turbine Generator" },
    { code: "GEN-STM", description: "Steam Turbine Generator" },

    { code: "CAB-LV", description: "Low Voltage Cable" },
    { code: "CAB-MV", description: "Medium Voltage Cable" },
    { code: "CAB-HV", description: "High Voltage Cable" },

    { code: "MCC-FIX", description: "Fixed Type MCC" },
    { code: "MCC-WDR", description: "Withdrawable Type MCC" },

    { code: "INV-VFD", description: "Variable Frequency Drive" },
    { code: "INV-DCAC", description: "DC/AC Inverter" },

    { code: "UPS-ONL", description: "Online UPS" },
    { code: "UPS-OFF", description: "Offline UPS" },
    { code: "UPS-BAT", description: "Battery Bank" },

    { code: "LIG-SYS", description: "Lighting System" }
  ],

  "Control System": [
    { code: "DCS-MAIN", description: "Main DCS System" },
    { code: "DCS-LOC", description: "Local DCS Node" },

    { code: "PLC-STAND", description: "Standalone PLC" },
    { code: "PLC-RED", description: "Redundant PLC" },

    { code: "SCADA-SYS", description: "SCADA System" },

    { code: "HMI-STAND", description: "Standalone HMI" },
    { code: "HMI-MULTI", description: "Multi-screen Console" },

    { code: "CONT-PID", description: "PID Controller" },
    { code: "CONT-LOC", description: "Local Control Panel" },

    { code: "NET-ETH", description: "Ethernet Network" },
    { code: "NET-FBUS", description: "Fieldbus Network" },
    { code: "NET-PBUS", description: "PROFIBUS Network" }
  ],

  "Instrumentation": [
    { code: "SENS-PRES", description: "Pressure Sensor" },
    { code: "SENS-TEMP", description: "Temperature Sensor" },
    { code: "SENS-VIB", description: "Vibration Sensor" },
    { code: "SENS-FLOW", description: "Flow Sensor" },

    { code: "TRM-PRES", description: "Pressure Transmitter" },
    { code: "TRM-TEMP", description: "Temperature Transmitter" },
    { code: "TRM-LVL", description: "Level Transmitter" },

    { code: "ANL-GAS", description: "Gas Analyzer" },
    { code: "ANL-LIQ", description: "Liquid Analyzer" },
    { code: "ANL-PART", description: "Particulate Analyzer" },

    { code: "PG-GAUGE", description: "Pressure Gauge" },
    { code: "PG-SW", description: "Pressure Switch" },

    { code: "CV-GLOB", description: "Globe Control Valve" },
    { code: "CV-BALL", description: "Ball Control Valve" },
    { code: "CV-BUTT", description: "Butterfly Control Valve" }
  ],

  "Piping System": [
    { code: "PIPE-CS", description: "Carbon Steel Pipe" },
    { code: "PIPE-SS", description: "Stainless Steel Pipe" },
    { code: "PIPE-HDPE", description: "HDPE Pipe" },

    { code: "VAL-GATE", description: "Gate Valve" },
    { code: "VAL-GLOBE", description: "Globe Valve" },
    { code: "VAL-BALL", description: "Ball Valve" },
    { code: "VAL-CHECK", description: "Check Valve" },

    { code: "FIT-ELB", description: "Elbow Fitting" },
    { code: "FIT-TEE", description: "Tee Fitting" },
    { code: "FIT-RED", description: "Reducer Fitting" },

    { code: "FLG-ST", description: "Standard Flange" },
    { code: "FLG-BLND", description: "Blind Flange" },

    { code: "JNT-GSK", description: "Gasket Joint" },
    { code: "JNT-EXP", description: "Expansion Joint" },

    { code: "SUP-HANG", description: "Pipe Hanger" },
    { code: "SUP-CLAMP", description: "Pipe Clamp" }
  ],

  "Miscellaneous Equipment": [
    { code: "HVAC-SYS", description: "HVAC System" },
    { code: "FIRE-SYS", description: "Fire Protection System" },
    { code: "SAFE-EQP", description: "Safety Equipment" },
    { code: "LIFT-CRN", description: "Crane" },
    { code: "LIFT-HOIST", description: "Hoist" },
    { code: "WTR-TREAT", description: "Water Treatment System" },
    { code: "AIR-COMP", description: "Compressed Air System" },
    { code: "FUEL-HAND", description: "Fuel Handling System" }

  ],
};

export default EquipmentClass;
