import React from 'react'

const FailureCodes = {
    "Mechanical Failures": {
        "MECH-WEAR": "Wear / Erosion",
        "MECH-CORR": "Corrosion / Oxidation",
        "MECH-FATG": "Fatigue / Cracking",
        "MECH-DEFR": "Deformation / Warping",
        "MECH-MISAL": "Loosening / Misalignment",
        "MECH-SEIZ": "Friction / Seizure",
        "MECH-LEAK": "Leakage (seals, gaskets, welds)",
        "MECH-CONT": "Contamination / Blockage",
        "MECH-LUBE": "Lubrication failure",
        "MECH-THERM": "Overheating / Thermal distortion",
        "MECH-BEAR": "Bearing failure",
        "MECH-SHAFT": "Shaft failure",
        "MECH-SEAL": "Seal failure",
        "MECH-OTH": "Other mechanical failure"
    },
    "Electrical Failures": {
        "ELEC-OVLD": "Overload / Overheating",
        "ELEC-SHORT": "Short circuit",
        "ELEC-GND": "Ground fault",
        "ELEC-INSUL": "Insulation breakdown",
        "ELEC-CONN": "Connector / terminal failure",
        "ELEC-OPEN": "Open circuit / Broken conductor",
        "ELEC-IMB": "Phase imbalance",
        "ELEC-HARM": "Harmonic distortion",
        "ELEC-CORE": "Magnetic core failure",
        "ELEC-WIND": "Winding failure (stator/rotor)",
        "ELEC-PSUP": "Power supply fluctuation",
        "ELEC-OTH": "Other electrical failure"
    },
    "Instrumentation and Control Failures": {
        "INST-SENS": "Sensor failure (temperature, pressure, flow, vibration, etc.)",
        "INST-DRIFT": "Transmitter drift / inaccuracy",
        "INST-CTRL": "Controller malfunction",
        "INST-SW": "Software / firmware error",
        "INST-SIG": "Signal loss / interruption",
        "INST-CAL": "Calibration drift",
        "INST-ACT": "Actuator / valve positioner failure",
        "INST-COMM": "Communication failure (bus, network, PLC I/O)",
        "INST-OTH": "Other instrumentation/control failure"
    },
    "Process Failures": {
        "PROC-CHEM": "Chemical attack / corrosion",
        "PROC-DEV": "Process deviation (flow, pressure, temperature out of spec)",
        "PROC-OPR": "Overpressure",
        "PROC-OTEMP": "Overtemperature",
        "PROC-CAV": "Cavitation",
        "PROC-FOUL": "Foaming / scaling / fouling",
        "PROC-PHASE": "Unexpected phase change",
        "PROC-CAT": "Catalyst degradation",
        "PROC-LOC": "Loss of containment",
        "PROC-OTH": "Other process failure"
    },
    "External Failures": {
        "EXT-ENV": "Environmental factors (dust, humidity, salt, flooding, lightning, temperature extremes)",
        "EXT-HUM": "Human error (operation, maintenance, installation)",
        "EXT-3RD": "Third-party interference (construction, transport damage)",
        "EXT-UTIL": "Utility supply failure (power, water, air, gas)",
        "EXT-FM": "Force majeure (earthquake, fire, explosion, storm)",
        "EXT-OTH": "Other external failure"
    }
}


export default FailureCodes;