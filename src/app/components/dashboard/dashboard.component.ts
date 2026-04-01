import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MeasurementService } from '../../services/measurement.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    private authService = inject(AuthService);
    private measurementService = inject(MeasurementService);
    private router = inject(Router);

    selectedType = 'LengthUnit';
    selectedAction = 'add';
    isArithmeticMode = true;
    result: any = null;
    resultBox: any = null;
    error: string | null = null;

    units: any = {
        LengthUnit: ["FEET", "INCHES", "YARD", "CENTIMETERS"],
        WeightUnit: ["KILOGRAM", "GRAM", "POUND"],
        VolumeUnit: ["LITRE", "MILLILITRE", "GALLON"],
        TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
    };

    calc = { 
        val1: 1, 
        val2: 1, 
        unit1: 'FEET', 
        unit2: 'INCHES', 
        operator: 'add' 
    };

    ngOnInit() { 
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/auth']);
            return;
        }
        this.updateUnits(); 
    }

    updateUnits() {
        const unitArray = this.units[this.selectedType];
        this.calc.unit1 = unitArray[0];
        this.calc.unit2 = unitArray.length > 1 ? unitArray[1] : unitArray[0];
    }

    setType(type: string) {
        this.selectedType = type;
        this.updateUnits();
        this.result = null;
    }

    setAction(action: string) {
        if (action === 'compare' || action === 'convert') {
            this.isArithmeticMode = false;
            this.selectedAction = action;
        } else {
            this.isArithmeticMode = true;
            this.calc.operator = action;
            this.selectedAction = action;
        }
        this.result = null;
    }

    calculate() {
        this.error = null;
        this.result = null;

        if (!this.calc.val1 || !this.calc.unit1 || !this.calc.val2 || !this.calc.unit2) {
            this.error = 'Please fill all fields';
            return;
        }

        const requestBody = {
            thisQuantityDTO: { 
                value: this.calc.val1, 
                unit: this.calc.unit1, 
                measurementType: this.selectedType 
            },
            thatQuantityDTO: { 
                value: this.calc.val2, 
                unit: this.calc.unit2, 
                measurementType: this.selectedType 
            }
        };

        const action = this.isArithmeticMode ? this.calc.operator : this.selectedAction;

        this.measurementService.calculate(action, requestBody).subscribe({
            next: (res: any) => {
                if (res.error) {
                    this.error = res.errorMessage || 'Operation failed';
                } else {
                    this.result = res;
                    this.resultBox = {
                        value: this.isArithmeticMode ? res.resultValue?.toFixed(4) : res.resultString,
                        unit: res.resultUnit || '',
                        isComparison: action === 'compare'
                    };
                }
            },
            error: (err: any) => {
                this.error = err.error?.errorMessage || err.error?.message || 'Operation failed. Please try again.';
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth']);
    }
}