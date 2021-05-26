import { Component, OnInit } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BreadcrumbService} from '../../../../shared/services/breadcrumb.service';
import { HttpParams } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Offer } from '../../../../models/job-board/offer';
import { Paginator } from '../../../../models/setting/paginator';
import { JobBoardHttpService } from '../../../../services/job-board/job-board-http.service';
import { MessageService } from '../../../../pages/shared/services/message.service';

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.scss']
})
export class OfferComponent implements OnInit {
  paginator: Paginator;
  offers: Offer[];
  formOffer: FormGroup;
  offer: Offer;
  offerDialog: boolean;
  flagOffers: boolean;

  constructor(private spinnerService: NgxSpinnerService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private jobBoardHttpService: JobBoardHttpService,
    private breadcrumbService: BreadcrumbService) {
    this.breadcrumbService.setItems([
        {label: 'Compania', routerLink: ['/job-board/company']},
        {label: 'Oferta'}
    ]);
    this.paginator = {current_page: 1, per_page: 2};
    this.offers = [];
  }

  ngOnInit(): void {
    this.getOffers(this.paginator);
    this.buildFormSkill();
  }

  buildFormSkill() {
    this.formOffer = this.formBuilder.group({
      // VERIFICAR CAMPOS Y SI TODOS SON REQUERIDOS Y CON EL MINIMO
        id: [null],
        vacancies: [null, Validators.required],
        code: [null, Validators.required],
        aditional_information: [null],
        contact_name: [null, Validators.required],
        contact_email: [null, Validators.required],
        contact_phone: [null],
        contact_cellphone: [null],
        remuneration: [null, Validators.required],
        contract_type: [null, Validators.required],
        position: [null, Validators.required],
        sector: [null, Validators.required],
        working_day: [null, Validators.required],
        experience_time: [null, Validators.required],
        training_hours: [null, Validators.required],
        location: [null],
        status: [null, Validators.required],
        start_date: [null, Validators.required],
        end_date: [null, Validators.required],
        activities: [null, Validators.required],
        requirements: [null, Validators.required],
        //company: [null, Validators.required],
    });
}

  getOffers(paginator: Paginator) {
    const params = new HttpParams()
    //compania id de donde saaco?
      .append('company_id', "1")
      .append('page', paginator.current_page.toString())
      .append('per_page', paginator.per_page.toString());
    this.flagOffers = true;
    this.jobBoardHttpService.get('offers', params).subscribe(
      response => {
        this.flagOffers = false;
        this.offers = response['data'];
        this.paginator = response as Paginator;
      }, error => {
        this.flagOffers = false;
        this.messageService.error(error);
      });
  }

}