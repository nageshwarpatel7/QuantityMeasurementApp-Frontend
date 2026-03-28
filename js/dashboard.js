// =============================================
// CONFIGURATION - Synced with backend enums
// =============================================
const BASE_URL = "http://localhost:8080/api/v1/quantities";

// Units from backend Swagger examples & enum values
const units = {
    LengthUnit: ["FEET", "INCHES", "YARDS", "CENTIMETER"],
    WeightUnit: ["KG", "GRAMS", "POUNDS", "TONNES"],
    VolumeUnit: ["MILILITRE", "LITRE", "GALLON"],
    TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

// =============================================
// STATE
// =============================================
let selectedType = "LengthUnit";
let selectedAction = "add";    // Current action sent to backend
let isArithmeticMode = true;   // Whether arithmetic dropdown is visible

// =============================================
// INITIALIZATION
// =============================================
window.onload = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../html/auth.html";
        return;
    }
    loadUnits();
};

// =============================================
// TYPE SELECTION (Length, Weight, Volume, Temp)
// =============================================
function setType(type, element) {
    selectedType = type;
    document.querySelectorAll('.type-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    loadUnits();
}

// =============================================
// LOAD UNITS INTO DROPDOWNS
// =============================================
function loadUnits() {
    const unit1 = document.getElementById("unit1");
    const unit2 = document.getElementById("unit2");

    unit1.innerHTML = "";
    unit2.innerHTML = "";

    units[selectedType].forEach(u => {
        unit1.add(new Option(u, u));
        unit2.add(new Option(u, u));
    });

    // Default second dropdown to second unit for meaningful operations
    if (unit2.options.length > 1) {
        unit2.selectedIndex = 1;
    }
}

// =============================================
// ACTION SELECTION (Compare, Convert, Arithmetic)
// =============================================
function setAction(action, element) {
    const opSelect = document.getElementById("operator-select");
    const opStatic = document.getElementById("operator-static");

    document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');

    if (action === 'arithmetic') {
        isArithmeticMode = true;
        opSelect.style.display = "block";
        opStatic.style.display = "none";
        updateSelectedAction();
    } else {
        isArithmeticMode = false;
        selectedAction = action; // "compare" or "convert"
        opSelect.style.display = "none";
        opStatic.style.display = "flex";
        opStatic.innerText = action === 'compare' ? "VS" : "→";
    }
}

function updateSelectedAction() {
    if (isArithmeticMode) {
        selectedAction = document.getElementById("operator-select").value;
    }
}

// =============================================
// CALCULATE - Calls the backend API
// =============================================
// Backend endpoints:
//   POST /compare    -> QuantityMeasurementDTO
//   POST /convert    -> QuantityMeasurementDTO
//   POST /add        -> QuantityMeasurementDTO
//   POST /subtract   -> QuantityMeasurementDTO
//   POST /divide     -> QuantityMeasurementDTO
//
// Request body (QuantityInputDTO):
//   { thisQuantityDTO: {value, unit, measurementType},
//     thatQuantityDTO: {value, unit, measurementType} }
//
// Response (QuantityMeasurementDTO):
//   { resultValue, resultUnit, resultString, error, errorMessage, ... }
// =============================================
async function calculate() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "../html/auth.html";
        return;
    }

    const val1 = parseFloat(document.getElementById("value1").value);
    const val2 = parseFloat(document.getElementById("value2").value);
    const u1 = document.getElementById("unit1").value;
    const u2 = document.getElementById("unit2").value;

    // Build QuantityInputDTO matching the backend exactly
    const requestBody = {
        thisQuantityDTO: {
            value: val1,
            unit: u1,
            measurementType: selectedType
        },
        thatQuantityDTO: {
            value: val2,
            unit: u2,
            measurementType: selectedType
        }
    };

    const url = `${BASE_URL}/${selectedAction}`;
    console.log(`Calling: ${url}`, requestBody);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (!response.ok) {
            throw new Error(result.errorMessage || result.message || `API Error: ${response.status}`);
        }

        // Check if backend flagged an error in the DTO
        if (result.error) {
            throw new Error(result.errorMessage || "Operation returned an error.");
        }

        // Display result from QuantityMeasurementDTO
        const resultBox = document.getElementById("result-box");
        const resultText = document.getElementById("result-text");
        const resultUnitLabel = document.getElementById("result-unit-label");

        resultBox.style.display = "block";

        if (selectedAction === "compare") {
            // For comparison, resultString contains "EQUAL" / "NOT_EQUAL" etc.
            resultText.innerText = result.resultString || String(result.resultValue);
            resultUnitLabel.innerText = "";
        } else {
            // For convert/add/subtract/divide
            resultText.innerText = typeof result.resultValue === 'number'
                ? result.resultValue.toFixed(4)
                : result.resultValue;
            resultUnitLabel.innerText = result.resultUnit || "";
        }

    } catch (error) {
        console.error("Calculation Error:", error);
        alert("Operation failed: " + error.message);
    }
}

// =============================================
// LOGOUT
// =============================================
function logout() {
    localStorage.clear();
    window.location.href = "../html/auth.html";
}