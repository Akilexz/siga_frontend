import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/auth/auth.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ConfirmationService, Message} from 'primeng/api';
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-security-question',
    templateUrl: './security-question.component.html',
    styleUrls: ['./security-question.component.scss']
})
export class SecurityQuestionComponent implements OnInit {
    dark: boolean;
    checked: boolean;
    msgs: Message[];
    formPasswordReset: FormGroup;
    flagPasswordReset: boolean;
    SITE_KEY:string;
    constructor(private _authService: AuthService,
                private _spinner: NgxSpinnerService,
                private _router: Router,
                private _fb: FormBuilder,
                private _confirmationService: ConfirmationService) {
        this.SITE_KEY = environment.SITE_KEY;
    }

    ngOnInit(): void {
        this.buildFormPasswordReset();
    }

    buildFormPasswordReset() {
        this.formPasswordReset = this._fb.group({
            username: ['', Validators.required]
        });
    }

    onSubmitForgotPassword(event: Event,grecaptcha) {
        event.preventDefault();
        if (this.formPasswordReset.valid) {
            this.forgotPassword(grecaptcha);
        } else {
            this.formPasswordReset.markAllAsTouched();
        }
    }

    forgotPassword(grecaptcha) {
        this._spinner.show();
        this._authService.userUnlock(this.formPasswordReset.controls['username'].value).subscribe(response => {
            this._spinner.hide();
            this.flagPasswordReset=false;
                //grecaptcha.reset();
            this.msgs = [{
                severity: 'info',
                summary: response['msg']['summary'],
                detail: response['msg']['detail']
            }];
        }, error => {
            this._spinner.hide();
            this.flagPasswordReset=false;
            grecaptcha.reset();
            this.msgs = [{
                severity: 'error',
                summary: error.error.msg.summary,
                detail: error.error.msg.detail
            }];
        });
    }

    showResponse(event) {
        this.flagPasswordReset = true;
    }
}
